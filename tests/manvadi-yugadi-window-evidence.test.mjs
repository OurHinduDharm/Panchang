import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {deriveSelectors,buildManvadiYugadiEvidence} from "../scripts/review-manvadi-yugadi.mjs";
const source=JSON.parse(await readFile(new URL("../data/references/taraprasad-2084-manvadi-yugadi.json",import.meta.url),"utf8"));
test("source month convention remains a hypothesis; Krishna conversion wraps at year boundary",()=>{
  const actual=deriveSelectors({month:"भाद्र",paksha:"कृष्ण",tithi:13});
  assert.equal(actual.tithiIndex,27);
  assert.deepEqual(actual.monthHypotheses.map(x=>x.month),["आश्विन","भाद्रपद"]);
  assert.equal(deriveSelectors({month:"फाल्गुन",paksha:"कृष्ण",tithi:15}).monthHypotheses[0].month,"चैत्र");
  assert.equal(deriveSelectors({month:"वैशाख",paksha:"शुक्ल",tithi:3}).tithiIndex,2);
  assert.throws(()=>deriveSelectors({month:"unknown",paksha:"शुक्ल",tithi:3}));
});
test("compare both afternoon windows, retain adhika and regular candidates without approval",()=>{
  const reference={status:"reference-only",records:[{kind:"manvadi",name:"test",month:"श्रावण",paksha:"कृष्ण",tithi:8}]};
  const day=(date,masa)=>({date,masa,sunrise:date+"T00:00:00Z",sunset:date+"T10:00:00Z",
    tithiIntervals:[{index:22,startTime:date+"T05:30:00Z",endTime:date+"T06:00:00Z"},{index:22,startTime:date+"T05:45:00Z",endTime:date+"T06:00:00Z"}]});
  const result=buildManvadiYugadiEvidence(reference,{dailyPanchang:[day("2031-08-01","अधिक भाद्रपद"),day("2031-08-31","भाद्रपद")]});
  const [half,fifth]=result.records[0].alternatives;
  assert.deepEqual(half.candidates.map(c=>c.monthKind),["adhika","regular"]);
  assert.equal(half.candidates[0].overlaps[0].seconds,1800);
  assert.equal(fifth.candidates.length,0);
  assert.equal(result.publishable,false);
  assert.equal(result.records[0].publishable,false);
  assert.equal(Object.hasOwn(result.records[0],"selectedDate"),false);
});
for(const year of [2030,2031])test("annual "+year+" provides independent review-only window evidence",async()=>{
  const annual=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-"+year+".json",import.meta.url),"utf8"));
  const result=buildManvadiYugadiEvidence(source,annual);
  assert.equal(result.records.length,18);
  assert.equal(result.year,year);
  assert.ok(result.records.every(row=>row.publishable===false&&row.alternatives.length>0));
  assert.ok(result.records.some(row=>row.alternatives.some(a=>a.candidates.length>0)));
  assert.equal(result.publishable,false);
});
