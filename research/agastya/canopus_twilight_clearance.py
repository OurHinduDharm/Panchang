#!/usr/bin/env python3
"""Research-only Canopus twilight/terrain-clearance sweep.

This reports geometric clearance candidates, NOT naked-eye first visibility.
Atmospheric extinction, weather, local trees/buildings, and a validated observer
height are not inferred. Pithoragarh uses the GEDTM30 horizon CSV; Varanasi and
New Delhi use a flat geometric horizon only for latitude-sensitivity comparison.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

IST = timezone(timedelta(hours=5, minutes=30))
STAR = {
    "name": "Canopus / alpha Carinae",
    "ra_hours_j2000": 6 + 23 / 60 + 57.10988 / 3600,
    "dec_degrees_j2000": -(52 + 41 / 60 + 44.3810 / 3600),
    "pm_ra_cosdec_mas_year": 19.93,
    "pm_dec_mas_year": 23.24,
    "parallax_mas": 10.55,
    "radial_velocity_km_s": 20.30,
    "reference": "SIMBAD; ICRS J2000; 2007A&A...474..653V",
}
SITES = {
    "Pithoragarh": {"lat": 29.5828, "lon": 80.2182, "elevation_m": 1650.0,
                    "elevation_status": "project value; datum/site not independently verified"},
    "Varanasi": {"lat": 25.3176, "lon": 82.9739, "elevation_m": 80.0,
                 "elevation_status": "approximate city-centre comparison elevation"},
    "New Delhi": {"lat": 28.6139, "lon": 77.2090, "elevation_m": 216.0,
                  "elevation_status": "approximate city-centre comparison elevation"},
}
SUN_DEPRESSION_LIMITS = (-6.0, -10.0, -12.0)


def read_horizon_profiles(path: str | None) -> dict[str, list[tuple[float, float]]]:
    profiles: dict[str, list[tuple[float, float]]] = {}
    if not path:
        return profiles
    with open(path, newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            scenario = row.get("scenario", "")
            az = row.get("azimuth_deg")
            alt = row.get("horizon_altitude_deg")
            if not scenario or az in (None, "") or alt in (None, ""):
                continue
            try:
                profiles.setdefault(scenario, []).append((float(az), float(alt)))
            except ValueError:
                continue
    for key in profiles:
        profiles[key].sort()
    return profiles


def interpolate_horizon(profile: list[tuple[float, float]], azimuth: float) -> float | None:
    """Circular linear interpolation; return None outside sampled coverage."""
    if len(profile) < 2:
        return None
    azimuth %= 360.0
    values = profile
    for i in range(len(values) - 1):
        a0, h0 = values[i]
        a1, h1 = values[i + 1]
        if a0 <= azimuth <= a1:
            fraction = (azimuth - a0) / (a1 - a0)
            return h0 + fraction * (h1 - h0)
    # No wrap interpolation is allowed unless the profile explicitly spans it.
    return None


def local_scan_datetimes(day: date):
    start = datetime(day.year, day.month, day.day, 2, 30, tzinfo=IST)
    return [start + timedelta(minutes=i) for i in range(271)]


def scan_site(year: int, site_name: str, site: dict, eph, ts, profiles: dict):
    from skyfield.api import Star, wgs84

    earth, sun = eph["earth"], eph["sun"]
    epoch = ts.tt_jd(2451545.0)
    canopus = Star(
        ra_hours=STAR["ra_hours_j2000"],
        dec_degrees=STAR["dec_degrees_j2000"],
        ra_mas_per_year=STAR["pm_ra_cosdec_mas_year"],
        dec_mas_per_year=STAR["pm_dec_mas_year"],
        parallax_mas=STAR["parallax_mas"],
        radial_km_per_s=STAR["radial_velocity_km_s"],
        epoch=epoch,
    )
    location = wgs84.latlon(
        latitude_degrees=site["lat"],
        longitude_degrees=site["lon"],
        elevation_m=site["elevation_m"],
    )
    observer = earth + location
    pressure = 1010.0 * math.exp(-site["elevation_m"] / 8434.5)

    scenario_profiles = []
    if site_name == "Pithoragarh":
        required_profiles = (
            "observer_at_dtm_ground_plus_2m",
            "observer_at_project_1650m_assumed_egm2008",
        )
        missing = [key for key in required_profiles if key not in profiles]
        if missing:
            raise RuntimeError("Pithoragarh terrain profile missing; refusing flat-horizon fallback: " + ", ".join(missing))
        scenario_profiles = [(key, profiles[key]) for key in required_profiles]
    else:
        scenario_profiles = [("flat_geometric_horizon_no_local_terrain", [])]

    results = []
    first_by_scenario_limit = {
        scenario: {limit: None for limit in SUN_DEPRESSION_LIMITS}
        for scenario, _profile in scenario_profiles
    }
    start_day, end_day = date(year, 8, 15), date(year, 10, 31)
    day = start_day
    while day <= end_day:
        local_times = local_scan_datetimes(day)
        utc_times = [dt.astimezone(timezone.utc) for dt in local_times]
        t = ts.from_datetimes(utc_times)
        star_alt, star_az, _ = observer.at(t).observe(canopus).apparent().altaz(
            temperature_C=10.0, pressure_mbar=pressure
        )
        sun_alt, _, _ = observer.at(t).observe(sun).apparent().altaz(
            temperature_C=10.0, pressure_mbar=pressure
        )
        star_alts, star_azs, sun_alts = star_alt.degrees, star_az.degrees, sun_alt.degrees

        for scenario, profile in scenario_profiles:
            if profile:
                terrain = [interpolate_horizon(profile, float(az)) for az in star_azs]
            else:
                terrain = [0.0] * len(star_azs)
            for limit in SUN_DEPRESSION_LIMITS:
                candidates = []
                for idx, (sa, solar, horizon) in enumerate(zip(star_alts, sun_alts, terrain)):
                    if horizon is None:
                        continue
                    if solar <= limit and sa > horizon:
                        candidates.append(idx)
                if candidates:
                    first_idx = candidates[0]
                    candidate = {
                        "site": site_name,
                        "year": year,
                        "terrain_scenario": scenario,
                        "sun_apparent_altitude_limit_deg": limit,
                        "first_candidate_local_ist": local_times[first_idx].isoformat(),
                        "canopus_apparent_altitude_deg": round(float(star_alts[first_idx]), 4),
                        "canopus_azimuth_deg": round(float(star_azs[first_idx]), 4),
                        "terrain_horizon_altitude_deg": (
                            round(float(terrain[first_idx]), 4) if terrain[first_idx] is not None else None
                        ),
                        "sun_apparent_altitude_deg": round(float(sun_alts[first_idx]), 4),
                        "sample_interval_minutes": 1,
                    }
                    results.append(candidate)
                    if first_by_scenario_limit[scenario][limit] is None:
                        first_by_scenario_limit[scenario][limit] = candidate
        day += timedelta(days=1)

    return {
        "site": site_name,
        "observer": site,
        "status": "conditional_twilight_clearance_sweep",
        "first_candidate_by_scenario_and_solar_depression": {
            scenario: {str(limit): first_by_scenario_limit[scenario][limit]
                       for limit in SUN_DEPRESSION_LIMITS}
            for scenario, _profile in scenario_profiles
        },
        "records": results,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--horizon-csv", default=None)
    parser.add_argument("--years", nargs="+", type=int, default=[2026, 2027])
    parser.add_argument("--json", required=True)
    parser.add_argument("--csv", required=True)
    args = parser.parse_args()

    from skyfield.api import load

    profiles = read_horizon_profiles(args.horizon_csv)
    ts = load.timescale()
    eph = load("de440s.bsp")
    reports = []
    for year in args.years:
        for site_name, site in SITES.items():
            reports.append(scan_site(year, site_name, site, eph, ts, profiles))

    output = {
        "status": "research_only_conditional_candidates",
        "definition": "First sampled minute with Canopus above the supplied terrain/geometric horizon while apparent solar altitude is below the selected depression limit.",
        "not_a_visibility_claim": [
            "Not naked-eye first visibility or a final Agastya Arghya date.",
            "No atmospheric extinction, aerosol, humidity, cloud, weather, or observer acuity model.",
            "Pithoragarh 1650 m is a project assumption with unresolved site/datum; DTM+2m is a separate conditional case.",
            "Varanasi and New Delhi use flat geometric horizons, not local DEM terrain profiles.",
            "Canopus coordinates and proper motion are from SIMBAD; the ephemeris is JPL DE440s.",
            "Minute sampling bounds timing only to the scan grid and does not establish a physical visibility instant."
        ],
        "star_astrometry": STAR,
        "method": {
            "ephemeris": "JPL DE440s via Skyfield",
            "time_zone": "Asia/Kolkata",
            "date_window": "15 August through 31 October inclusive",
            "daily_local_scan": "02:30–07:00 IST at 1-minute intervals",
            "solar_apparent_altitude_limits_deg": list(SUN_DEPRESSION_LIMITS),
            "refraction": "Skyfield standard refraction at 10 C; pressure scaled exponentially from 1010 hPa by site elevation",
            "terrain": "Pithoragarh GEDTM30 profile where available; flat geometric horizon for other cities",
        },
        "reports": reports,
    }
    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.csv).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with open(args.csv, "w", newline="", encoding="utf-8") as handle:
        fields = ["site", "year", "terrain_scenario", "sun_apparent_altitude_limit_deg",
                  "first_candidate_local_ist", "canopus_apparent_altitude_deg",
                  "canopus_azimuth_deg", "terrain_horizon_altitude_deg",
                  "sun_apparent_altitude_deg", "sample_interval_minutes"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for report in reports:
            for row in report["records"]:
                writer.writerow(row)


if __name__ == "__main__":
    main()
