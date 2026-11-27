"""Research only: compare independent signed-root scans at two resolutions.
Does not infer publication eligibility or guarantee unsampled tangencies.
"""
import datetime as dt
import math
import json
from pathlib import Path
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

def sampled_crossings(fn, start, end, step):
    """Half-open interval; accept sign changes, not exact sampled tangencies.

    A single exact sampled zero needs opposite signs on either side.
    This remains a sampled search, not a proof that no other roots exist.
    """
    left = start
    previous = fn(start-step)
    a = fn(left)
    i = 1
    while left < end:
        right = min(start+i*step, end)
        b = fn(right)
        if a == 0 and previous*b < 0:
            yield left
        elif a*b < 0:
            root = brentq(fn, left, right, xtol=1e-9)
            if start <= root < end:
                yield root
        previous, left, a = a, right, b
        i += 1


def self_test():
    roots = lambda fn: list(sampled_crossings(fn, 0, 4, 1))
    assert roots(lambda x: x) == [0]
    assert roots(lambda x: x-2) == [2]
    assert roots(lambda x: x-4) == []
    assert roots(lambda x: (x-2)**2) == []
    assert roots(lambda x: x*x) == []
    assert len(roots(lambda x: x-1.5)) == 1
    assert abs(roots(lambda x: x-1.5)[0]-1.5) < 1e-9
    print('sampled-crossing self-tests passed', flush=True)


def scan(year, minutes):
    start, end = julian(year), julian(year+1)
    result = []
    for kind in ('vyatipata', 'vaidhrti'):
        fn = lambda jd: relation(jd, kind)
        for root in sampled_crossings(fn, start, end, minutes/1440):
            sun, moon, ayana, *_ = evaluate(root)
            expected = ayana < 0 and sun*moon > 0 if kind == 'vyatipata' else ayana > 0 and sun*moon < 0
            if expected:
                result.append((kind, root))
    return sorted(result, key=lambda event:event[1])

def compare_published_middles(events):
    """Check every published middle against the independently scanned roots.

    Release contacts are indexed by start, whereas scan() is indexed by
    middle. Fail explicitly if those conventions produce different rows.
    The published catalogue is read only after the independent scan.
    """
    path = Path(__file__).resolve().parents[1] / 'data/special-punya-kaal/mahapata-2026-2030.mjs'
    source = path.read_text(encoding='utf-8')
    rows = json.loads(source.split('export const mahapataEpochRows = Object.freeze(', 1)[1]
                      .split('.map(Object.freeze)', 1)[0])
    if len(events) != len(rows):
        raise AssertionError(f'Published/start-year versus scanned/middle-year count: {len(rows)} vs {len(events)}')
    errors = []
    for index, ((kind, jd), (code, start, middle, end)) in enumerate(zip(events, rows), 1):
        assert start < middle < end, (index, 'invalid published contact ordering')
        assert {'vyatipata': 'V', 'vaidhrti': 'W'}[kind] == code, (index, 'kind mismatch')
        delta = abs((jd - 2440587.5) * 86400 - middle)
        assert delta <= 1, (index, kind, 'middle delta seconds', delta)
        errors.append(delta)
    print('Published middle parity:', len(errors), 'rows; max seconds', max(errors), flush=True)


if __name__ == '__main__':
    self_test()
    print('Swiss flags', evaluate(julian(2025))[3:])
    release_events = []
    for year in range(2025, 2031):
        coarse, fine = scan(year,60), scan(year,15)
        assert len(coarse) == len(fine), (year, len(coarse), len(fine))
        assert all(a[0] == b[0] and abs(a[1]-b[1])*86400 < 1 for a,b in zip(coarse,fine)), year
        if year >= 2026:
            release_events.extend(fine)
        print(year, len(fine), {k:sum(x[0]==k for x in fine) for k in ('vyatipata','vaidhrti')}, 'max seconds', max(abs(a[1]-b[1])*86400 for a,b in zip(coarse,fine)), flush=True)
    compare_published_middles(release_events)
