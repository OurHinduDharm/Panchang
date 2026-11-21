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

test("selected city elevations are used directly and missing elevation is rejected", async () => {
  const { resolveTaraLocation } = await import("../research/tara-astronomy-context.mjs");
  const city = {latitude: 28.65195, longitude: 77.23149, elevation: 227,
    elevationStatus: "estimated", name: "Delhi"};
  const result = resolveTaraLocation(city);
  assert.equal(result.observer.elevation, 227);
  assert.equal(result.elevationSourceApproximate, true);
  assert.throws(() => resolveTaraLocation({...city, elevation: null}), /Selected city elevation is missing/);
  assert.equal(resolveTaraLocation({...city, elevation: 0}).observer.elevation, 0);
});

test("every city in the bundled India city index has coordinates and elevation", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const index = JSON.parse(await readFile(new URL("../data/tara-india-places.json", import.meta.url), "utf8"));
  assert.ok(index.cities.length >= 7000);
  for (const row of index.cities) {
    assert.ok(Number.isFinite(row[4]) && row[4] >= -90 && row[4] <= 90, String(row[1]));
    assert.ok(Number.isFinite(row[5]) && row[5] >= -180 && row[5] <= 180, String(row[1]));
    assert.ok(Number.isFinite(row[6]) && row[6] >= -500 && row[6] <= 9000, String(row[1]));
  }
});
