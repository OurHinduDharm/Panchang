"""Research only: compare independent signed-root scans at two resolutions.
Does not infer publication eligibility or guarantee unsampled tangencies.
"""
import datetime as dt
import math
from functools import lru_cache
import swisseph as swe
from scipy.optimize import brentq
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
FLAGS = swe.FLG_SWIEPH

@lru_cache(maxsize=200000)
def evaluate(jd):
    a, af = swe.calc_ut(jd, swe.SUN, FLAGS | swe.FLG_EQUATORIAL)
    b, bf = swe.calc_ut(jd, swe.MOON, FLAGS | swe.FLG_EQUATORIAL)
    sl = swe.calc_ut(jd, swe.SUN, FLAGS)[0][0]
    ml = swe.calc_ut(jd, swe.MOON, FLAGS)[0][0]
    return a[1], b[1], math.cos(math.radians(sl))*math.cos(math.radians(ml)), af, bf

def relation(jd, kind):
    sun, moon, *_ = evaluate(jd)
    return sun - moon if kind == 'vyatipata' else sun + moon

def julian(year):
    return dt.datetime(year, 1, 1, tzinfo=IST).timestamp()/86400 + 2440587.5

def scan(year, minutes):
    start, end = julian(year), julian(year+1)
    result = []
    for kind in ('vyatipata', 'vaidhrti'):
        fn = lambda jd: relation(jd, kind)
        left = start
        a = fn(left)
        i = 1
        while left < end:
            right = min(start+i*minutes/1440, end)
            b = fn(right)
            root = None
            if a == 0:
                root = left
            elif a*b < 0:
                root = brentq(fn, left, right, xtol=1e-9)
            if root is not None and start <= root < end:
                sun, moon, ayana, *_ = evaluate(root)
                expected = ayana < 0 and sun*moon > 0 if kind == 'vyatipata' else ayana > 0 and sun*moon < 0
                if expected:
                    result.append((kind, root))
            left, a = right, b
            i += 1
    return sorted(result, key=lambda event:event[1])

if __name__ == '__main__':
    print('Swiss flags', evaluate(julian(2025))[3:])
    for year in (2025, 2026, 2027, 2028):
        coarse, fine = scan(year,60), scan(year,15)
        assert len(coarse) == len(fine), (year, len(coarse), len(fine))
        assert all(a[0] == b[0] and abs(a[1]-b[1])*86400 < 1 for a,b in zip(coarse,fine)), year
        print(year, len(fine), {k:sum(x[0]==k for x in fine) for k in ('vyatipata','vaidhrti')}, 'max seconds', max(abs(a[1]-b[1])*86400 for a,b in zip(coarse,fine)), flush=True)
