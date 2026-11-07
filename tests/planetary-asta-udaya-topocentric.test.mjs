import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("function getPlanetObserverKey(");
const end = source.indexOf("\nfunction getPlanetDailyData(", start);
assert.ok(start >= 0 && end > start, "observer geometry helper must exist");

test("apparent angular separation uses topocentric equatorial coordinates for both Sun and planet", () => {
  const calls = [];
  const sandbox = {
    Math,
    Equator(body, date, observer, ofdate, aberration) {
      calls.push({ body, date, observer, ofdate, aberration });
      if (body === "Sun") return { ra: 0, dec: 0 };
      return { ra: observer.longitude / 15, dec: observer.latitude / 10 };
    }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);
  const observer = { latitude: 29.5828, longitude: 80.2182, height: 1650 };
  const result = sandbox.getApparentAngularSeparation("Venus", new Date("2026-10-12T12:00:00Z"), observer);

  assert.ok(Number.isFinite(result) && result > 0);
  assert.deepEqual(calls.map(call => call.body), ["Venus", "Sun"]);
  assert.ok(calls.every(call => call.observer === observer));
  assert.ok(calls.every(call => call.ofdate === true && call.aberration === true));
});

test("observer cache identity includes latitude, longitude, and elevation", () => {
  const sandbox = { Number };
  vm.runInNewContext(source.slice(start, end), sandbox);
  const keyA = sandbox.getPlanetObserverKey({ latitude: 29.58, longitude: 80.21, height: 1650 });
  const keyB = sandbox.getPlanetObserverKey({ latitude: 28.61, longitude: 77.21, height: 216 });
  const keyC = sandbox.getPlanetObserverKey({ latitude: 29.58, longitude: 80.21, height: 0 });
  assert.notEqual(keyA, keyB);
  assert.notEqual(keyA, keyC);
});
