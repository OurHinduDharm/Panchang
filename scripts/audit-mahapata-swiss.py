"""Independent Mahapata reference audit (research only).
Run: python -m pip install pyswisseph==2.10.3.2 scipy
     python scripts/audit-mahapata-swiss.py
Swiss Ephemeris library 2.10.03; record actual flags (Moshier fallback
is expected without ephemeris files). IST civil timestamps.
No publication, per-event adjustment, or source lookup in solver.
"""
import datetime as dt
import math
from functools import lru_cache
import statistics
import swisseph as swe
from scipy.optimize import brentq

IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
FLAGS = swe.FLG_SWIEPH

@lru_cache(maxsize=100000)
def evaluate(jd):
    sun, sf = swe.calc_ut(jd, swe.SUN, FLAGS | swe.FLG_EQUATORIAL)
    moon, mf = swe.calc_ut(jd, swe.MOON, FLAGS | swe.FLG_EQUATORIAL)
    sl = swe.calc_ut(jd, swe.SUN, FLAGS)[0][0]
    ml = swe.calc_ut(jd, swe.MOON, FLAGS)[0][0]
    radius = (swe.pheno_ut(jd, swe.SUN, FLAGS)[3] +
              swe.pheno_ut(jd, swe.MOON, FLAGS)[3]) / 2
    gola = sun[1] * moon[1]
    ayana = math.cos(math.radians(sl)) * math.cos(math.radians(ml))
    kind = ("vyatipata" if gola > 0 and ayana < 0 else
            "vaidhrti" if gola < 0 and ayana > 0 else None)
    return abs(sun[1]) - abs(moon[1]), radius, kind, sf, mf

def jd(value):
    return value.timestamp() / 86400 + 2440587.5

def iso(value):
    return dt.datetime.fromtimestamp((value - 2440587.5)*86400, IST).isoformat(timespec="seconds")

def contacts(root, fixed=False):
    def f(t):
        delta, radius, *_ = evaluate(t)
        return abs(delta) - (0.5 if fixed else radius)
    result = []
    for direction in (-1, 1):
        a = root
        for i in range(1, 97):
            b = root + direction*i/48
            if f(b) >= 0:
                result.append(brentq(f, min(a,b), max(a,b), xtol=1e-9))
                break
            a = b
        else:
            raise ValueError("No contact bracket within two days")
    return result

def scan(year):
    a = jd(dt.datetime(year, 1, 1, tzinfo=IST))
    end = jd(dt.datetime(year+1, 1, 1, tzinfo=IST))
    while a < end:
        b = min(a+1/48, end)
        if evaluate(a)[0]*evaluate(b)[0] < 0:
            root = brentq(lambda t:evaluate(t)[0], a, b, xtol=1e-9)
            if evaluate(root)[2]:
                yield root
        a = b

# Historical printed endpoints transcribed in PR #478's audit, rows 2–31.
# Partial row 1 is deliberately not counted in complete-pair statistics.
OLD = """
2023-04-04 13:01|2023-04-04 16:58
2023-04-17 01:41|2023-04-17 05:17
2023-04-30 04:30|2023-04-30 09:07
2023-05-12 21:37|2023-05-13 02:01
2023-05-26 00:20|2023-05-26 06:20
2023-06-08 02:50|2023-06-08 08:31
2023-06-21 13:29|2023-06-21 21:02
2023-06-30 21:30|2023-07-01 02:50
2023-07-13 05:40|2023-07-13 11:38
2023-07-27 08:18|2023-07-27 13:15
2023-08-08 05:30|2023-08-08 09:51
2023-08-22 03:29|2023-08-22 07:42
2023-09-03 03:18|2023-09-03 06:46
2023-09-16 16:46|2023-09-16 20:42
2023-09-29 03:33|2023-09-29 06:46
2023-10-12 05:38|2023-10-12 09:43
2023-10-25 02:24|2023-10-25 05:59
2023-11-06 20:00|2023-11-07 00:45
2023-11-19 23:23|2023-11-20 03:59
2023-12-02 17:26|2023-12-02 23:36
2023-12-16 07:53|2023-12-16 13:47
2023-12-24 12:17|2023-12-24 18:45
2024-01-07 18:19|2024-01-08 00:11
2024-01-19 23:41|2024-01-20 04:23
2024-02-02 20:21|2024-02-03 01:49
2024-02-14 20:30|2024-02-15 00:14
2024-02-28 10:23|2024-02-28 14:28
2024-03-11 19:39|2024-03-11 22:49
2024-03-24 21:55|2024-03-25 01:53
2024-04-06 20:46|2024-04-07 00:01
""".strip().splitlines()

def historical():
    for fixed in (False, True):
        errors = []
        for row in OLD:
            a,b = [jd(dt.datetime.fromisoformat(x).replace(tzinfo=IST))
                   for x in row.split("|")]
            root = brentq(lambda t:evaluate(t)[0], a-.1, b+.1, xtol=1e-9)
            c,d = contacts(root, fixed)
            errors.append((abs(c-a)*1440, abs(d-b)*1440))
        print("fixed" if fixed else "disks", "pairs <=1m", sum(max(e)<=1 for e in errors),
              "<=3m", sum(max(e)<=3 for e in errors),
              "median minutes", [statistics.median(e) for e in zip(*errors)])

if __name__ == "__main__":
    print("Swiss library", swe.version)
    historical()
    for year in (2026,2027,2028):
        counts = {}
        for root in scan(year):
            _,_,kind,sf,mf = evaluate(root)
            counts[kind] = counts.get(kind,0)+1
            c,d = contacts(root)
            f,g = contacts(root, True)
            print(kind, iso(c), iso(root), iso(d), "fixed", iso(f), iso(g), "flags",sf,mf)
        print(year, counts)
# Limitations: sign-changing roots only; tangencies/exact sampled zeros are not
# guaranteed. Historical reference association uses a local bracket, not blind
# matching. Modern 25-pair raw table is not yet recovered. No claim of source
# convention or universal publication readiness.
