import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");

test("production Asta/Udaya display does not use fixed angular crossing direction", () => {
  assert.doesNotMatch(source, /findThresholdCrossingInstant|findNearestAngularBoundary|PLANET_ASTA_THRESHOLDS/);
  assert.ok(source.includes("getDrikPlanetaryReference"));
  assert.ok(source.includes("renderDrikPlanetReferenceCard"));
});

test("daily Sun and Moon rise/set remain sourced from the Panchang calculation", () => {
  assert.ok(source.includes("sunrise: pHora.sunrise"));
  assert.ok(source.includes("sunset: pHora.sunset"));
  assert.ok(source.includes("moonrise: pHora.moonrise"));
  assert.ok(source.includes("moonset: pHora.moonset"));
});


function snapshotHarness(compute) {
  const start=source.indexOf("const extraSnapshotCache = new Map();");
  const end=source.indexOf("function updatePlanetRiseSet()",start);
  assert.ok(start>=0&&end>start);
  return new Function("getPanchangam",source.slice(start,end)+
    "\nreturn {memoExtraSnapshot,extraPanchangAt,cacheSize:()=>extraSnapshotCache.size};")(compute);
}
const snapshotLocation={latitude:29.5828,longitude:80.2182,elevation:1650,timeZone:"Asia/Kolkata"};
const snapshotDate=new Date("2026-11-27T00:00:00+05:30");
const validDay={sunrise:"2026-11-27T01:15:00Z",sunset:"2026-11-27T11:45:00Z",tithi:0};

test("extra Panchang reuses exact calculation inputs on live Hora refresh",()=>{
  let calls=0;
  const h=snapshotHarness(()=>{calls++;return {...validDay};});
  const first=h.extraPanchangAt(snapshotDate,snapshotLocation,{},330);
  for(let i=0;i<20;i++)assert.equal(h.extraPanchangAt(snapshotDate,snapshotLocation,{},330),first);
  assert.equal(calls,1);
  for(const loc of [
    {...snapshotLocation,latitude:30},
    {...snapshotLocation,longitude:81},
    {...snapshotLocation,elevation:0},
    {...snapshotLocation,timeZone:"Asia/Kathmandu"}
  ])h.extraPanchangAt(snapshotDate,loc,{},330);
  h.extraPanchangAt(snapshotDate,snapshotLocation,{},345);
  h.extraPanchangAt(new Date(snapshotDate.getTime()+86400000),snapshotLocation,{},330);
  assert.equal(calls,7);
});

test("incomplete or failed daily snapshots are not cached",()=>{
  let calls=0;
  const h=snapshotHarness(()=>{
    calls++;
    if(calls===1)throw new Error("temporary failure");
    if(calls===2)return {...validDay,sunrise:null};
    return validDay;
  });
  assert.throws(()=>h.extraPanchangAt(snapshotDate,snapshotLocation,{},330),/temporary/);
  assert.equal(h.extraPanchangAt(snapshotDate,snapshotLocation,{},330).sunrise,null);
  assert.equal(h.extraPanchangAt(snapshotDate,snapshotLocation,{},330),validDay);
  h.extraPanchangAt(snapshotDate,snapshotLocation,{},330);
  assert.equal(calls,3);
});

test("cache is bounded; Mars rise/set and legitimate null crossings remain distinct",()=>{
  const h=snapshotHarness(()=>validDay);
  let calls=0;
  const compute=()=>{calls++;return null;};
  for(let i=0;i<20;i++){
    h.memoExtraSnapshot("mars-rise",snapshotDate,snapshotLocation,compute);
    h.memoExtraSnapshot("mars-set",snapshotDate,snapshotLocation,compute);
  }
  assert.equal(calls,2);
  for(let i=0;i<30;i++)h.extraPanchangAt(new Date(snapshotDate.getTime()+i*86400000),snapshotLocation,{},330);
  assert.equal(h.cacheSize(),12);
  h.memoExtraSnapshot("mars-rise",snapshotDate,snapshotLocation,compute);
  assert.equal(calls,3);
});

test("periodic refresh pauses in hidden tabs and resumes when visible",()=>{
  const start=source.indexOf("  function refreshCurrentHora(){");
  const end=source.indexOf("  setInterval(refreshCurrentHora",start);
  assert.ok(start>=0&&end>start);
  const doc={hidden:true};
  let calls=0;
  const run=new Function("document","getSelectedDate","getIsoDateInTimeZone","getLocation","updatePlanetRiseSet",
    source.slice(start,end)+"\nreturn refreshCurrentHora;")(doc,()=>"2026-11-27",()=>"2026-11-27",()=>snapshotLocation,()=>calls++);
  run();assert.equal(calls,0);
  doc.hidden=false;run();assert.equal(calls,1);
  assert.match(source,/document\.addEventListener\("visibilitychange", refreshCurrentHora\)/);
});
