"""Research-only signed Mahapata endpoint audit.
Usage: python scripts/audit-mahapata-signed.py input.csv
CSV columns: kind,start,end (kind: vyatipata or vaidhrti; ISO datetime
with explicit UTC offset; timestamps may cross midnight). The input stays
separate from the solver. Source-local matching, NOT an independent scan.
Dependencies: pyswisseph==2.10.3.2 scipy numpy.
"""
import csv
import datetime as dt
from functools import lru_cache
import sys
import numpy as np
from scipy.optimize import brentq
import swisseph as swe

@lru_cache(maxsize=50000)
def coordinates(jd):
    a, af = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)
    b, bf = swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)
    radius = sum(swe.pheno_ut(jd, p, swe.FLG_SWIEPH)[3] * 30
                 for p in (swe.SUN, swe.MOON))
    return a[1], b[1], radius, af, bf


def relation(jd, kind):
    sun, moon, *_ = coordinates(jd)
    if kind == 'vyatipata':
        return 60 * (sun - moon)
    if kind == 'vaidhrti':
        return 60 * (sun + moon)
    raise ValueError(f'Unknown event kind: {kind}')


def julian(text):
    date = dt.datetime.fromisoformat(text)
    if date.utcoffset() is None:
        raise ValueError('explicit UTC offset required')
    return date.timestamp() / 86400 + 2440587.5


def endpoint(t, kind, model):
    def f(jd):
        return abs(relation(jd, kind)) - (coordinates(jd)[2] if model == 'disks' else float(model))
    # Local audit only. Does not guarantee unique root in interval.
    return brentq(f, t - .04, t + .04, xtol=1e-9)


def run(path):
    with open(path, newline='', encoding='utf-8') as stream:
        rows = [(r['kind'], julian(r['start']), julian(r['end'])) for r in csv.DictReader(stream)]
    if not rows:
        raise ValueError('no reference pairs')
    if any(b <= a for _, a, b in rows):
        raise ValueError('end must follow start')
    print('Swiss library', swe.version, 'reference pairs', len(rows), 'flags', coordinates(rows[0][1])[3:])
    for model in ('30', '31', 'disks'):
        errors = []
        for kind, a, b in rows:
            try:
                errors.append([(endpoint(t, kind, model) - t) * 1440 for t in (a, b)])
            except ValueError:
                errors.append([np.inf, np.inf])
        e = np.array(errors)
        print(model, 'within 1/3 min', int(sum(np.max(abs(e), axis=1) <= 1)), int(sum(np.max(abs(e), axis=1) <= 3)), 'median absolute minutes', np.median(abs(e), axis=0), 'unmatched', int(sum(~np.isfinite(e[:,0]))))
    # No time offset applied. This function tests endpoints, not publication eligibility.


if __name__ == '__main__':
    run(sys.argv[1])
