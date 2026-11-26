"""Research only; independently compare 30', 31' and variable disks.
Run: python -m pip install pyswisseph==2.10.3.2 scipy numpy
     python scripts/audit-mahapat-contact-conventions.py
Matching near source dates, not a blind annual completeness test.
"""
import datetime as dt
import json
import math
from functools import lru_cache
from pathlib import Path
import re
import numpy as np
from scipy.optimize import brentq
import swisseph as swe

ROOT = Path(__file__).resolve().parents[1]
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))

def julian(date):
    if date.utcoffset() is None:
        raise ValueError("timezone required")
    return date.timestamp() / 86400 + 2440587.5

def printed(day, clock):
    h, m = map(int, clock.split(":"))
    return julian(dt.datetime.fromisoformat(day).replace(tzinfo=IST)
                  + dt.timedelta(hours=h, minutes=m))

def references():
    data = json.loads((ROOT / "data/reviews/mahapat-drik-ramnagar-2025-2027.json").read_text())
    drik = [(i, "V" if row["type"] == "vyatipata" else "W",
             julian(dt.datetime.fromisoformat(row["touchTimeIST"])),
             julian(dt.datetime.fromisoformat(row["releaseTimeIST"])))
            for i, row in enumerate(data["events"], 1)]
    js = (ROOT / "scripts/audit-mahapat-taraprasad-2084.mjs").read_text()
    raw = json.loads(re.search(r'const raw = ("(?:[^"\\]|\\.)*");', js).group(1))
    tara = []
    for i, line in enumerate(raw.splitlines(), 1):
        kind, sd, st, ed, et = line.split()
        # Retain printed raw row; documented date correction only.
        tara.append((i, kind, printed(sd, st),
                     printed("2027-12-02" if i == 19 else ed, et)))
    assert len(drik) == 80 and len(tara) == 27
    return drik, tara

@lru_cache(maxsize=200000)
def positions(t):
    a, af = swe.calc_ut(t, swe.SUN, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)
    b, bf = swe.calc_ut(t, swe.MOON, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)
    la = swe.calc_ut(t, swe.SUN, swe.FLG_SWIEPH)[0][0]
    lb = swe.calc_ut(t, swe.MOON, swe.FLG_SWIEPH)[0][0]
    radius = sum(swe.pheno_ut(t, p, swe.FLG_SWIEPH)[3] * 30
                 for p in (swe.SUN, swe.MOON))
    return 60*a[1], 60*b[1], radius, math.cos(math.radians(la))*math.cos(math.radians(lb)), af, bf

def relation(t, kind):
    a, b, *_ = positions(t)
    return a-b if kind == "V" else a+b

def roots(fn, a, b):
    xs = np.linspace(a, b, math.ceil((b-a)*96)+1)
    ys = [fn(t) for t in xs]
    found = []
    for x, y, p, q in zip(xs, xs[1:], ys, ys[1:]):
        if p == 0:
            found.append(float(x))
        elif p*q < 0:
            found.append(brentq(fn, x, y, xtol=1e-9))
    if ys[-1] == 0:
        found.append(float(xs[-1]))
    return found

def audit(rows, model):
    matches, missing = [], []
    for i, kind, a, b in rows:
        rr = [r for r in roots(lambda t: relation(t, kind), a-.25, b+.25)
              if (positions(r)[3] < 0) == (kind == "V") and a-.1 < r < b+.1]
        if len(rr) != 1:
            missing.append(i)
            continue
        r = rr[0]
        c = roots(lambda t: abs(relation(t, kind)) -
                  (positions(t)[2] if model == "disks" else model), r-1, r+1)
        starts, ends = [x for x in c if x<r], [x for x in c if x>r]
        if not starts or not ends:
            missing.append(i)
            continue
        st, en = starts[-1], ends[0]
        # Delta T is diagnostic ONLY; never adjust published civil time.
        matches.append({"row":i, "errorMinutes":[(st-a)*1440,(en-b)*1440],
                        "ifTTDisplayedAsUTMinutes":[(st+swe.deltat(st)-a)*1440,
                                                    (en+swe.deltat(en)-b)*1440],
                        "sourceBoundaryArcmin":[abs(relation(a,kind)),abs(relation(b,kind))]})
    e = np.array([x["errorMinutes"] for x in matches])
    return {"model":model,"matched":len(matches),"missing":missing,
            "bothWithin3":int(sum(np.max(abs(e),axis=1)<=3)),
            "medianSignedMinutes":np.median(e,axis=0).tolist(),
            "medianAbsoluteMinutes":np.median(abs(e),axis=0).tolist(),
            "matches":matches}

if __name__ == "__main__":
    drik, tara = references()
    result = {name:[audit(rows, model) for model in (30,31,"disks")]
              for name,rows in (("drik",drik),("tara2084",tara))}
    print(json.dumps({"version":swe.version,"flags":positions(drik[0][2])[-2:],
                      "status":"research-only","reports":result},indent=2))
    assert [x["bothWithin3"] for x in result["drik"]] == [0,80,21]
    assert [x["bothWithin3"] for x in result["tara2084"]] == [0,10,25]
    assert result["tara2084"][2]["missing"] == [14,27]
