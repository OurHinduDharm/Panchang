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


def directed_contact(f, t, entering):
    # One-minute sampling within the existing local search window.
    # Reject ambiguous candidates rather than choosing a convenient root.
    samples = np.linspace(t - .04, t + .04, 117)
    values = [f(x) for x in samples]
    candidates = []
    for i in range(len(samples) - 1):
        left, right = values[i:i+2]
        if left * right < 0:
            candidates.append(brentq(f, samples[i], samples[i+1], xtol=1e-9))
    for i in range(1, len(samples) - 1):
        if values[i] == 0 and values[i-1] * values[i+1] < 0:
            candidates.append(samples[i])
    if len(candidates) != 1:
        raise ValueError('missing or ambiguous local contact')
    root = candidates[0]
    before, after = f(root - 1/86400), f(root + 1/86400)
    if not (before > 0 > after if entering else before < 0 < after):
        raise ValueError('incorrect contact direction')
    return root


def endpoint(t, kind, model, entering):
    def f(jd):
        return abs(relation(jd, kind)) - (coordinates(jd)[2] if model == 'disks' else float(model))
    return directed_contact(f, t, entering)


def self_test():
    # Synthetic checks: exact sampled zero, ingress/egress, ambiguity,
    # and tangent contact (not a sign-changing ingress or egress).
    for f, entering in ((lambda x: -x, True), (lambda x: x, False)):
        assert abs(directed_contact(f, 0, entering)) < 1e-8
    for f, entering in ((lambda x: x, True),
                        (lambda x: x*x, True),
                        (lambda x: (x-.01)*(x+.01), True)):
        try:
            directed_contact(f, 0, entering)
        except ValueError:
            continue
        raise AssertionError('invalid contact accepted')
    print('directed-contact self-tests passed')


def run(path):
    with open(path, newline='', encoding='utf-8') as stream:
        rows = [(r['kind'], julian(r['start']), julian(r['end'])) for r in csv.DictReader(stream)]
    if not rows:
        raise ValueError('no reference pairs')
    if any(kind not in ('vyatipata', 'vaidhrti') for kind, _, _ in rows):
        raise ValueError('unknown event kind in CSV')
    if any(b <= a for _, a, b in rows):
        raise ValueError('end must follow start')
    print('Swiss library', swe.version, 'reference pairs', len(rows), 'flags', coordinates(rows[0][1])[3:])
    for model in ('30', '31', 'disks'):
        errors = []
        for kind, a, b in rows:
            try:
                start = endpoint(a, kind, model, True)
                end = endpoint(b, kind, model, False)
                if start >= end:
                    raise ValueError('reversed computed contact pair')
                errors.append([(start-a)*1440, (end-b)*1440])
            except ValueError:
                errors.append([np.inf, np.inf])
        e = np.array(errors)
        print(model, 'within 1/3 min', int(sum(np.max(abs(e), axis=1) <= 1)), int(sum(np.max(abs(e), axis=1) <= 3)), 'median absolute minutes', np.median(abs(e), axis=0), 'unmatched', int(sum(~np.isfinite(e[:,0]))))
    # No time offset applied. This function tests endpoints, not publication eligibility.


if __name__ == '__main__':
    if sys.argv[1:] == ['--self-test']:
        self_test()
    else:
        run(sys.argv[1])
