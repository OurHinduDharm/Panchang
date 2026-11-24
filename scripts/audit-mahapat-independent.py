"""Optional independent Mahapata audit. Pass a compiled Swiss Ephemeris library.

Uses only Python's standard library, the Moshier ephemeris and the transcribed
dates. No Astronomy Engine results, longitude seeds or JavaScript solver inputs.
Prints JSON; does not modify data or require any production dependency.
"""
import argparse
import ctypes as c
import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

IST = timezone(timedelta(hours=5, minutes=30))
DAY = 86400
MOSEPH, TRUEPOS, NONUT, EQUATORIAL, TOPOCTR = 4, 16, 64, 2048, 32768
RADII_KM = (695700, 1737.4)
AU_KM = 149597870.7
REFERENCE = Path(__file__).resolve().parents[1] / "data/reviews/mahapat-2023-2024-reference.json"


def time_label(t):
    return datetime.fromtimestamp(t, IST).isoformat(timespec="milliseconds")


class Ephemeris:
    def __init__(self, library, observer):
        self.swe = c.CDLL(str(Path(library).resolve()))
        self.swe.swe_calc_ut.argtypes = [c.c_double, c.c_int, c.c_int,
                                          c.POINTER(c.c_double), c.c_char_p]
        self.swe.swe_deltat_ex.argtypes = [c.c_double, c.c_int, c.c_char_p]
        self.swe.swe_deltat_ex.restype = c.c_double
        self.swe.swe_set_topo.argtypes = [c.c_double] * 3
        self.swe.swe_set_topo(observer["longitude"], observer["latitude"], 0)
        self.swe.swe_version.argtypes = [c.c_char_p]
        version = c.create_string_buffer(256)
        self.swe.swe_version(version)
        self.version = version.value.decode()

    def delta_t_seconds(self, t):
        return self.swe.swe_deltat_ex(t / DAY + 2440587.5, MOSEPH, None) * DAY

    def coords(self, t, body, flags):
        result = (c.c_double * 6)()
        message = c.create_string_buffer(256)
        status = self.swe.swe_calc_ut(t / DAY + 2440587.5, body, MOSEPH | flags,
                                      result, message)
        if status < 0 or (body >= 0 and not status & MOSEPH):
            raise ValueError(message.value.decode() or "unexpected ephemeris")
        return result

    def geometry(self, t, sign, variant):
        flags = {"no-nutation": NONUT, "geometric": TRUEPOS,
                 "Ramnagar-topocentric": TOPOCTR}.get(variant, 0)
        eq = [self.coords(t, b, EQUATORIAL | flags) for b in (0, 1)]
        dec = [x[1] for x in eq]
        if variant in ("mean-obliquity-only", "omit-lunar-latitude"):
            # Vary just epsilon or just lunar latitude in the ecliptic rotation.
            tilt = self.coords(t, -1, 0)
            epsilon = math.radians(tilt[1] if variant == "mean-obliquity-only" else tilt[0])
            for b in (0, 1):
                lon, lat = map(math.radians, self.coords(t, b, 0)[:2])
                if variant == "omit-lunar-latitude" and b == 1:
                    lat = 0.0
                dec[b] = math.degrees(math.asin(math.sin(lat) * math.cos(epsilon) +
                                                math.cos(lat) * math.sin(epsilon) * math.sin(lon)))
        boundary = 0.5
        if variant == "apparent-disks":
            boundary = sum(math.degrees(math.asin(radius / (pos[2] * AU_KM)))
                           for radius, pos in zip(RADII_KM, eq))
        return dec[1] + sign * dec[0], boundary, dec


def crossings(fn, start, end, step=900):
    """Independent sign-change brackets and bisection, resolution 0.05 seconds."""
    roots = []
    left, a = start, fn(start)
    while left < end:
        right = min(left + step, end)
        b = fn(right)
        if a == 0:
            roots.append(left)
        elif a * b < 0:
            lo, hi = left, right
            while hi - lo > 0.05:
                mid = (lo + hi) / 2
                if a * fn(mid) > 0:
                    lo = mid
                else:
                    hi = mid
            roots.append((lo + hi) / 2)
        left, a = right, b
    if a == 0:
        roots.append(end)
    return roots


def examine(ephem, row, row_number):
    printed = [datetime.fromisoformat(row[k]).timestamp() if row[k] else None
               for k in ("touchTimeIST", "releaseTimeIST")]
    anchor = next(t for t in printed if t is not None)
    window = (anchor - DAY, anchor + DAY)
    sign = 1 if row["type"] == "vaidhrti" else -1
    report = {"row": row_number, "type": row["type"], "variants": {},
              "deltaTSeconds": ephem.delta_t_seconds(anchor)}
    for variant in ("fixed", "apparent-disks", "no-nutation", "mean-obliquity-only",
                    "geometric", "Ramnagar-topocentric", "omit-lunar-latitude"):
        def clearance(t):
            relation, radius, _ = ephem.geometry(t, sign, variant)
            return abs(relation) - radius
        roots = crossings(clearance, *window)
        report["variants"][variant] = [time_label(t) for t in roots]
    def relation(t):
        return ephem.geometry(t, sign, "fixed")[0]
    report["printed"] = [None if t is None else {
        "arcmin": round(abs(relation(t)) * 60, 4),
        "signedArcminPerHour": round((relation(t + 60) - relation(t - 60)) * 1800, 4)
    } for t in printed]
    middles = []
    for t in crossings(relation, *window):
        sun, moon = ephem.geometry(t, sign, "fixed")[2]
        ayanas = [math.cos(math.radians(ephem.coords(t, b, 0)[0])) > 0 for b in (0, 1)]
        middles.append({"IST": time_label(t), "sunDec": sun, "moonDec": moon,
                        "ayanas": ["north" if a else "south" for a in ayanas],
                        "classCompatible": (ayanas[0] == ayanas[1]) == (sign == 1)
                        and sun * moon != 0 and (sun * moon < 0) == (sign == 1)})
    report["middles"] = middles
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("library", help="path to compiled libswe.so")
    parser.add_argument("--verify", action="store_true", help="check reference coverage and known discrepancies")
    args = parser.parse_args()
    reference = json.loads(REFERENCE.read_text(encoding="utf-8"))
    ephem = Ephemeris(args.library, reference["observer"])
    rows = [examine(ephem, source, i) for i, source in enumerate(reference["events"], 1)]
    march = examine(ephem, {"type": "vaidhrti", "touchTimeIST": None,
                            "releaseTimeIST": "2026-03-19T07:25:00+05:30"}, "March 2026")
    solstice = examine(ephem, {"type": "vaidhrti", "touchTimeIST": None,
                               "releaseTimeIST": "2019-12-14T00:00:00+05:30"}, "solstice control")
    # Midnight is a search anchor for this control, not a published endpoint.
    solstice.pop("printed")
    if args.verify:
        discrepancies = []
        near_boundary = 0
        for result, source in zip(rows, reference["events"]):
            contacts = result["variants"]["fixed"]
            if len(contacts) != 2 or len(result["middles"]) != 1 or not result["middles"][0]["classCompatible"]:
                raise ValueError(f"ambiguous independent window in row {result['row']}")
            errors = []
            for t, k in zip(contacts, ("touchTimeIST", "releaseTimeIST")):
                if source[k]:
                    errors.append(abs((datetime.fromisoformat(t) - datetime.fromisoformat(source[k])).total_seconds()))
            if max(errors) > 180:
                discrepancies.append(result["row"])
            near_boundary += sum(abs(x["arcmin"] - 30) < 0.5 for x in result["printed"] if x)
        if len(rows) != 31 or discrepancies != [1, 3, 9, 25, 26] or near_boundary != 55:
            raise ValueError(f"reference residuals changed: {discrepancies}, {near_boundary}")
        if len(solstice["middles"]) != 2 or len(solstice["variants"]["apparent-disks"]) != 2:
            raise ValueError("December 2019 double middle or limb interval changed")
    print(json.dumps({"swissVersion": ephem.version, "ephemeris": "Moshier",
                      "topocentricTestElevationMeters": 0, "rows": rows,
                      "march2026": march, "december2019": solstice}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
