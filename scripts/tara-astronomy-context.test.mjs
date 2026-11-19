import test from "node:test";
import assert from "node:assert/strict";
import { createTaraAstronomyContext, createTaraContextFromPanchangLocation } from "../research/tara-astronomy-context.mjs";

class FakeObserver {
  constructor(latitude, longitude, height) {
    Object.assign(this, {latitude, longitude, height});
  }
}
test("passes exact selected location into the astronomy engine", () => {
  const ctx=createTaraContextFromPanchangLocation({latitude:29.5828,longitude:80.2182,elevation:1650},FakeObserver,2028);
  assert.deepEqual([ctx.astronomyObserver.latitude,ctx.astronomyObserver.longitude,ctx.astronomyObserver.height],[29.5828,80.2182,1650]);
  assert.equal(ctx.year,2028);
});
test("city and year are part of the cache key", () => {
  const make=(latitude,year)=>createTaraAstronomyContext({location:{latitude,longitude:80,elevation:1650},Observer:FakeObserver,year}).cacheKey;
  assert.notEqual(make(29,2028),make(30,2028));
  assert.notEqual(make(29,2028),make(29,2029));
});
test("never silently uses Pithoragarh or sea level", () => {
  assert.throws(()=>createTaraContextFromPanchangLocation(null,FakeObserver,2028),/Select/);
  assert.throws(()=>createTaraContextFromPanchangLocation({latitude:29,longitude:80},FakeObserver,2028),/Elevation unavailable/);
});
test("rejects missing engine and invalid year", () => {
  const location={latitude:29,longitude:80,elevation:1650};
  assert.throws(()=>createTaraAstronomyContext({location,Observer:null,year:2028}),/constructor/);
  assert.throws(()=>createTaraAstronomyContext({location,Observer:FakeObserver,year:NaN}),/year/);
});

test("accepts real Panchang lat/lon storage format", () => {
  const ctx=createTaraContextFromPanchangLocation({lat:29.5828,lon:80.2182,elevation:1650,name:"पिथौरागढ़"},FakeObserver,2028);
  assert.equal(ctx.astronomyObserver.latitude,29.5828);
  assert.equal(ctx.astronomyObserver.longitude,80.2182);
  assert.equal(ctx.elevationApproximate,false);
});
test("sea-level approximation must be explicit and labeled", () => {
  const ctx=createTaraContextFromPanchangLocation({lat:29,lon:80},FakeObserver,2028,{allowSeaLevelApproximation:true});
  assert.equal(ctx.astronomyObserver.height,0);
  assert.equal(ctx.elevationApproximate,true);
});
