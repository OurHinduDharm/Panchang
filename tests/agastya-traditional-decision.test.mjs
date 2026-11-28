import test from "node:test";
import assert from "node:assert/strict";
import {grahalaghavaTargets,reviewTraditionalArghya,kanyaIngressFromSunSign,kanyaPrecedingDawns} from "../research/agastya-traditional-decision.mjs";
const ms=Date.parse;
const date=i=>new Date(Date.UTC(2027,8,1+i)).toISOString().slice(0,10);
const at=(i,clock)=>ms(date(i)+"T"+clock+"+05:30");
const make=()=>({riseDefinition:"traditional-agastya-udaya",riseUtcMilliseconds:at(0,"12:35:00"),
  simhaIngressUtcMilliseconds:ms("2027-08-17T08:43:45.854Z"),
  kanyaIngressUtcMilliseconds:ms("2027-09-17T08:40:34.250Z"),
  dawns:Array.from({length:18},(_,i)=>({date:date(i),startUtcMilliseconds:at(i,"04:21:00"),sunriseUtcMilliseconds:at(i,"05:51:00")}))});
test("Grahalaghava 21 reproduces its Kashi worked angular example; comparator only",()=>{
  const latitude=Math.atan(5.75/12)*180/Math.PI;
  const t=grahalaghavaTargets(latitude);
  assert.ok(Math.abs(t.riseLongitude-144)<1e-10);
  assert.ok(Math.abs(t.setLongitude-32)<1e-10);
  assert.equal(grahalaghavaTargets(90),null);
});
test("daytime traditional rise moves first Arghya to next local dawn, not a full night interval",()=>{
  const r=reviewTraditionalArghya(make());
  assert.equal(r.firstArghya.date,"2027-09-02");
  assert.equal(r.padmaDawns.length,7);
  assert.equal(r.padmaDawns.at(-1).date,"2027-09-08");
  assert.equal(r.bhavishyaDawns[0].date,"2027-09-11");
  assert.equal(r.commonDawns.length,0);
  assert.equal(r.publishable,false);
});
test("rise within dawn clips start, and Kanya ingress clips the final opportunity",()=>{
  const x=make();x.riseUtcMilliseconds=at(1,"05:00:00");
  const r=reviewTraditionalArghya(x);
  assert.equal(r.firstArghya.start,new Date(x.riseUtcMilliseconds).toISOString());
  const y=make();y.riseUtcMilliseconds=at(14,"12:00:00");y.kanyaIngressUtcMilliseconds=at(16,"05:00:00");
  const v=reviewTraditionalArghya(y);
  assert.equal(v.padmaDawns.length,2);
  assert.equal(v.padmaDawns.at(-1).end,new Date(y.kanyaIngressUtcMilliseconds).toISOString());
});
test("missing dates, incomplete bracketing and physical rise input fail closed",()=>{
  const x=make();x.dawns.splice(3,1);
  assert.equal(reviewTraditionalArghya(x).firstArghya,null);
  const y=make();y.dawns.pop();
  assert.equal(reviewTraditionalArghya(y).firstArghya,null);
  assert.equal(reviewTraditionalArghya({...make(),riseDefinition:"geometric-rise"}).firstArghya,null);
  assert.equal(reviewTraditionalArghya({...make(),riseUtcMilliseconds:NaN}).firstArghya,null);
});

test("Kanya ingress is independently bisected, rejects invalid sign brackets",()=>{
  const expected=ms("2027-09-17T08:40:34Z");
  const found=kanyaIngressFromSunSign(2027,t=>t<expected?4:5);
  assert.ok(found>=expected&&found-expected<=1000);
  assert.equal(kanyaIngressFromSunSign(2027,()=>4),null);
  assert.equal(kanyaIngressFromSunSign(2027,()=>null),null);
});
test("seven pre-Kanya mornings include ingress day only if dawn is eligible",()=>{
  const night=date=>({dawnUtcMilliseconds:ms(date+"T04:24:00+05:30"),
    sunriseUtcMilliseconds:ms(date+"T06:00:00+05:30")});
  const midday=kanyaPrecedingDawns(ms("2027-09-17T14:10:00+05:30"),night);
  assert.equal(midday.length,7);
  assert.equal(midday[0].date,"2027-09-11");
  assert.equal(midday.at(-1).date,"2027-09-17");
  assert.equal(midday.at(-1).startUtcMilliseconds,ms("2027-09-17T04:24:00+05:30"));
  const early=kanyaPrecedingDawns(ms("2027-09-17T04:00:00+05:30"),night);
  assert.equal(early[0].date,"2027-09-10");
  assert.equal(early.at(-1).date,"2027-09-16");
  const midway=ms("2027-09-17T05:00:00+05:30");
  const clipped=kanyaPrecedingDawns(midway,night);
  assert.equal(clipped.at(-1).endUtcMilliseconds,midway);
  assert.ok(clipped.every(d=>d.endUtcMilliseconds<=midway));
  assert.deepEqual(kanyaPrecedingDawns(midway,()=>null),[]);
  assert.deepEqual(kanyaPrecedingDawns(null,night),[]);
});
