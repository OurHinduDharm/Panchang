import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTaraObserver, requireTaraElevation, taraObserverKey } from "../research/tara-location-observer.mjs";

test("Pithoragarh coordinates and elevation are retained without rounding", () => {
  const o = normalizeTaraObserver({latitude:29.5828,longitude:80.2182,elevation:1650,name:"Pithoragarh"});
  assert.equal(o.latitude,29.5828);
  assert.equal(o.longitude,80.2182);
  assert.equal(o.elevation,1650);
  assert.equal(o.elevationStatus,"provided");
  assert.ok(Object.isFrozen(o));
});
test("unknown elevation stays unknown, not zero", () => {
  const o = normalizeTaraObserver({latitude:29.58,longitude:80.22});
  assert.equal(o.elevation,null);
  assert.equal(o.elevationStatus,"unknown");
  assert.throws(()=>requireTaraElevation(o),/Elevation required/);
});
test("zero elevation is a legitimate explicit value", () => {
  assert.equal(requireTaraElevation({latitude:0,longitude:0,elevation:0}).elevation,0);
});
test("invalid coordinates, coercion and elevation are rejected", () => {
  for (const bad of [{latitude:91,longitude:80}, {latitude:29,longitude:-181},
    {latitude:"29",longitude:80}, {latitude:29,longitude:80,elevation:Infinity},
    {latitude:29,longitude:80,elevation:-1000}, null]) {
    assert.throws(()=>normalizeTaraObserver(bad));
  }
});
test("distinct city observers have distinct cache keys", () => {
  assert.notEqual(taraObserverKey({latitude:29.5828,longitude:80.2182,elevation:1650}),
    taraObserverKey({latitude:29.58349,longitude:80.20947,elevation:1586}));
});

test("unknown elevation can be approximated only by explicit opt-in", async () => {
  const { resolveTaraLocation } = await import("../research/tara-astronomy-context.mjs");
  const location = {lat: 29.58, lon: 80.22, name: "Test location"};
  assert.throws(() => resolveTaraLocation(location), /Elevation unavailable/);
  const result = resolveTaraLocation(location, {allowSeaLevelApproximation: true});
  assert.equal(result.observer.elevation, 0);
  assert.equal(result.elevationApproximate, true);
  assert.equal(resolveTaraLocation({...location, elevation: 0, elevationStatus: "provided"}).elevationApproximate, false);
  assert.equal(resolveTaraLocation({...location, elevation: 120, elevationStatus: "estimated"}).elevationSourceApproximate, true);
});
