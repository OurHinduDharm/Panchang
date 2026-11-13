from datetime import datetime, timezone
import json
from pathlib import Path

from skyfield.api import load, wgs84

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "pithoragarh-guru-shukra-calculated-2028-2030.json"
data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

latitude = data["location"]["latitude"]
longitude = data["location"]["longitude"]
elevation = data["location"]["elevationMeters"]

# Skyfield is MIT-licensed. DE440s is downloaded to the CI cache only;
# no ephemeris kernel is committed to the public repository.
ts = load.timescale()
ephemeris = load("de440s.bsp")
earth = ephemeris["earth"]
site = earth + wgs84.latlon(
    latitude_degrees=latitude,
    longitude_degrees=longitude,
    elevation_m=elevation,
)

body_map = {
    "Jupiter": ephemeris["jupiter barycenter"],
    "Venus": ephemeris["venus"],
}
sun = ephemeris["sun"]

rows = []
failures = []
for window in data["windows"]:
    body = body_map[window["planet"]]
    for boundary_name in ("astaStart", "udaya"):
        local_value = window[boundary_name]
        instant = datetime.fromisoformat(local_value).astimezone(timezone.utc)
        t = ts.from_datetime(instant)

        # Geometric altitude (no atmospheric refraction) is used here so
        # the independent ephemeris comparison does not depend on weather.
        apparent_planet = site.at(t).observe(body).apparent()
        apparent_sun = site.at(t).observe(sun).apparent()
        planet_alt, planet_az, _ = apparent_planet.altaz()
        sun_alt, sun_az, _ = apparent_sun.altaz()

        row = {
            "id": window["id"],
            "planet": window["planet"],
            "boundary": boundary_name,
            "localDateTime": local_value,
            "skyfieldPlanetGeometricAltitudeDegrees": planet_alt.degrees,
            "skyfieldPlanetAzimuthDegrees": planet_az.degrees,
            "skyfieldSunGeometricAltitudeDegrees": sun_alt.degrees,
            "skyfieldSunAzimuthDegrees": sun_az.degrees,
        }
        rows.append(row)

        # The event is a refracted local horizon crossing. Geometric
        # altitude is therefore expected to be slightly below 0 degrees.
        if not (-1.0 <= planet_alt.degrees <= 0.2):
            failures.append({
                "id": window["id"],
                "boundary": boundary_name,
                "altitudeDegrees": planet_alt.degrees,
                "reason": "independent geometric altitude is outside horizon-crossing tolerance",
            })

report = {
    "schemaVersion": "1.0.0",
    "engine": "Skyfield",
    "license": "MIT",
    "ephemeris": "JPL DE440s",
    "observer": {
        "latitude": latitude,
        "longitude": longitude,
        "elevationMeters": elevation,
    },
    "boundaryCount": len(rows),
    "passed": len(failures) == 0,
    "failures": failures,
    "rows": rows,
    "note": "Independent position/horizon sanity check only; it does not independently validate the twilight date-selection model.",
}

out = ROOT / "artifacts" / "skyfield-de440s-pithoragarh-crosscheck.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "passed": report["passed"],
    "boundaryCount": report["boundaryCount"],
    "failures": failures,
    "maxAbsoluteGeometricAltitudeDegrees": max(abs(row["skyfieldPlanetGeometricAltitudeDegrees"]) for row in rows),
    "output": str(out.relative_to(ROOT)),
}, indent=2))
if failures:
    raise SystemExit(1)
