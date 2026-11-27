"""Independent annual Mahapata release audit; research dependency only.
Python 3.12; pyswisseph==2.10.3.2 scipy.
Run python scripts/audit-mahapata-annual-release.py --verify.
"""
import datetime as dt
import math
import json
import sys
from pathlib import Path
from functools import lru_cache
from scipy.optimize import brentq
import swisseph as swe

IST=dt.timezone(dt.timedelta(hours=5,minutes=30))
DAY=86400
AU=149597870.7
START=dt.datetime(2026,1,1,tzinfo=IST).timestamp()
END=dt.datetime(2031,1,1,tzinfo=IST).timestamp()

@lru_cache(maxsize=260000)
def positions(t):
    jd=t/DAY+2440587.5
    eq=[swe.calc_ut(jd,b,swe.FLG_MOSEPH|swe.FLG_EQUATORIAL) for b in (swe.SUN,swe.MOON)]
    ecl=[swe.calc_ut(jd,b,swe.FLG_MOSEPH) for b in (swe.SUN,swe.MOON)]
    assert all(flags & swe.FLG_MOSEPH for _,flags in eq+ecl)
    a,b=[v[1] for v,_ in eq]
    x,y=[math.cos(math.radians(v[0])) for v,_ in ecl]
    boundary=sum(math.degrees(math.asin(r/(v[2]*AU))) for r,(v,_) in zip((695700,1737.4),eq))
    return a,b,x,y,boundary

def relation(t,kind):
    a,b,*_=positions(t)
    return b-a if kind=="V" else b+a

def roots(fn,lo,hi,step):
    result=[]
    a=lo
    fa=fn(a)
    while a<hi:
        b=min(a+step,hi)
        fb=fn(b)
        if fa==0:
            result.append(a)
        elif fa*fb<0:
            result.append(brentq(fn,a,b,xtol=.03))
        a,fa=b,fb
    if fa==0:
        result.append(hi)
    return result

def scan(step):
    result=[]
    for kind in ("V","W"):
        for m in roots(lambda t:relation(t,kind),START-7*DAY,END+7*DAY,step):
            a,b,x,y,_=positions(m)
            if not ((a*b>0 and x*y<0) if kind=="V" else (a*b<0 and x*y>0)):
                continue
            contacts=sorted(q for side in (-1,1) for q in roots(
                lambda t:relation(t,kind)-side*positions(t)[4],m-3*DAY,m+3*DAY,900))
            st=max(q for q in contacts if q<m)
            en=min(q for q in contacts if q>m)
            if START<=st<END:
                assert st<m<en
                result.append((kind,st,m,en))
    return sorted(result,key=lambda x:x[1])

def main():
    coarse,fine=scan(1800),scan(900)
    assert len(coarse)==len(fine)==135
    max_scan=max(max(abs(i-j) for i,j in zip(x[1:],y[1:])) for x,y in zip(coarse,fine))
    assert max_scan<.1 and all(x[0]==y[0] for x,y in zip(coarse,fine))
    for a,b in zip(fine,fine[1:]):
        assert not (a[0]==b[0] and abs(a[1]-b[1])<.1 and abs(a[3]-b[3])<.1), "multiple middles"
    rows=[[k,round(st),round(m),round(en)] for k,st,m,en in fine]
    if "--verify" in sys.argv:
        source=(Path(__file__).resolve().parents[1]/"data/special-punya-kaal/mahapata-2026-2030.mjs").read_text()
        saved=json.loads(source.split("export const mahapataEpochRows = Object.freeze(",1)[1].split(".map(Object.freeze)",1)[0])
        assert len(saved)==len(rows)
        assert all(x[0]==y[0] and max(abs(i-j) for i,j in zip(x[1:],y[1:]))<=1 for x,y in zip(saved,rows))
    print(json.dumps({"swissVersion":swe.version,"count":len(rows),"maxScanDeltaSeconds":max_scan,"rows":rows}))

if __name__=="__main__":
    main()
