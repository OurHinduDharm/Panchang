import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("const planetDailyCache = new Map();");
const end = source.indexOf("\n/* =========================================\n   Card creation", start);
assert.notEqual(start, -1, "planetary event cache/function block must exist");
assert.notEqual(end, -1, "planetary event block must have a bounded end");

function loadEventFunction() {
  const anchor = new Date("2026-10-29T12:00:00+05:30").getTime();
  const sandbox = {
    Date, Map, Number, String, Math,
    PLANET_ASTA_THRESHOLDS: { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 },
    getLocalNoon(date) {
      return new Date(date + "T12:00:00+05:30");
    },
    addDays(date, days) {
      const value = new Date(date + "T12:00:00+05:30");
      value.setUTCDate(value.getUTCDate() + days);
      return value.toISOString().slice(0, 10);
    },
    Equator(body, instant) {
      if (body === "Sun") return { ra: 0, dec: 0 };
      const offset = (instant.getTime() - anchor) / 86400000;
      const separation = 10 + 12 * Math.sin((2 * Math.PI * offset / 70) + 0.5);
      return { ra: separation / 15, dec: 0 };
    },
    formatEventDateTime: instant => instant.toISOString(),
    console: { warn() {} }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);
  return sandbox.getPlanetEvent;
}

test("all planetary angular-threshold estimates explicitly use the selected observer", () => {
  const getPlanetEvent = loadEventFunction();
  const result = getPlanetEvent({ name: "शुक्र", body: "Venus" }, "2026-10-29", { latitude: 29.58, longitude: 80.21, height: 1650 });

  assert.equal(result.locationSpecific, true);
  assert.equal(result.calculationScope, "topocentric-angular-threshold");
  assert.equal(result.verificationPending, true);
  assert.equal(result.name, "शुक्र");
  assert.ok(result.asta);
  assert.ok(result.udaya);
});

test("missing thresholds never imply a location-specific result", () => {
  const getPlanetEvent = loadEventFunction();
  const result = getPlanetEvent({ name: "अज्ञात", body: "Unknown" }, "2026-10-29", { latitude: 29.58, longitude: 80.21, height: 1650 });

  assert.equal(result.asta, null);
  assert.equal(result.udaya, null);
  assert.equal(result.locationSpecific, false);
  assert.equal(result.calculationScope, "topocentric-angular-threshold");
  assert.equal(result.verificationPending, true);
});

test("the user-facing card keeps one concise observer-based estimate note", () => {
  assert.match(source, /ये चयनित स्थान पर सूर्य–ग्रह की आभासी कोणीय दूरी पर आधारित अस्थायी गणितीय अनुमान हैं; वास्तविक दृश्यता और Drik के समयों से मिलान अभी प्रमाणित नहीं है।/);
  assert.equal((source.match(/class="planet-rise-set-note"/g) || []).length, 1);
  assert.doesNotMatch(source, /ये चयनित नगर, अक्षांश, देशांतर या ऊँचाई के अनुसार नहीं बदलतीं/);
  assert.doesNotMatch(source, /स्थानीय दृश्यता अथवा स्थानीय उदय-अस्त न मानें/);
});
