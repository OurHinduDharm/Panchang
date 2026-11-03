import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("const planetEventBracketCache = new Map();");
const end = source.indexOf("\n/* =========================================\n   Card creation", start);
assert.notEqual(start, -1, "planetary event cache/function block must exist");
assert.notEqual(end, -1, "planetary event block must have a bounded end");

function loadEventFunction(boundaries = {}) {
  const sandbox = {
    Date,
    PLANET_ASTA_THRESHOLDS: { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 },
    formatEventDateTime: () => "परिक्षण समय",
    findNearestAngularBoundary(_body, _date, threshold, type) {
      return boundaries[type] ?? {
        instant: new Date(type === "asta" ? "2026-10-12T00:00:00Z" : "2026-10-30T00:00:00Z"),
        threshold,
        eclipticSeparation: threshold
      };
    },
    console: { warn() {} }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);
  return sandbox.getPlanetEvent;
}

test("all planetary angular-threshold estimates explicitly declare that they are not location-specific", () => {
  const getPlanetEvent = loadEventFunction();
  const result = getPlanetEvent({ name: "शुक्र", body: "Venus" }, "2026-10-29");

  assert.equal(result.locationSpecific, false);
  assert.equal(result.calculationScope, "geocentric-angular-threshold");
  assert.equal(result.verificationPending, true);
  assert.equal(result.name, "शुक्र");
  assert.ok(result.asta);
  assert.ok(result.udaya);
});

test("missing thresholds never imply a location-specific result", () => {
  const getPlanetEvent = loadEventFunction();
  const result = getPlanetEvent({ name: "अज्ञात", body: "Unknown" }, "2026-10-29");

  assert.equal(result.asta, null);
  assert.equal(result.udaya, null);
  assert.equal(result.locationSpecific, false);
  assert.equal(result.calculationScope, "geocentric-angular-threshold");
  assert.equal(result.verificationPending, true);
});

test("the user-facing card explicitly warns that changing city does not change these estimates", () => {
  assert.match(source, /ये चयनित नगर, अक्षांश, देशांतर या ऊँचाई के अनुसार नहीं बदलतीं/);
  assert.match(source, /स्थानीय दृश्यता अथवा स्थानीय उदय-अस्त न मानें/);
});
