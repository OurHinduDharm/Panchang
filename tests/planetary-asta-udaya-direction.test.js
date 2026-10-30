import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("function crossesAngularBoundary(");
const end = source.indexOf("\nconst planetEventBracketCache", start);
assert.notEqual(start, -1);
assert.notEqual(end, -1);

function makeSearch(separationByOffset) {
  const selectedDate = "2026-10-29";
  const selectedMs = Date.parse(selectedDate + "T12:00:00Z");
  const sandbox = {
    addDays(dateString, days) {
      return new Date(Date.parse(dateString + "T12:00:00Z") + days * 86400000).toISOString().slice(0, 10);
    },
    getPlanetDailyData(body, dateString) {
      const offset = Math.round((Date.parse(dateString + "T12:00:00Z") - selectedMs) / 86400000);
      return { date: dateString, eclipticSeparation: separationByOffset[offset] ?? 20 };
    },
    getPlanetEventThreshold() { return 10; },
    findThresholdCrossingInstant() { return new Date(selectedMs); }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);
  return { selectedDate, search: sandbox.findNearestAngularBoundary };
}

test("above threshold: Asta future, Udaya past", () => {
  const { selectedDate, search } = makeSearch({ [-2]: 20, [-1]: 5, [0]: 20, [1]: 20, [2]: 5 });
  const asta = search("Mars", selectedDate, "asta");
  const udaya = search("Mars", selectedDate, "udaya");
  assert.equal(asta.direction, "future");
  assert.equal(asta.date, "2026-10-31");
  assert.equal(udaya.direction, "past");
  assert.equal(udaya.date, "2026-10-29");
});

test("at or below threshold: Asta past, Udaya future", () => {
  const { selectedDate, search } = makeSearch({ [-1]: 20, [0]: 5, [1]: 20 });
  const asta = search("Mars", selectedDate, "asta");
  const udaya = search("Mars", selectedDate, "udaya");
  assert.equal(asta.direction, "past");
  assert.equal(asta.date, "2026-10-29");
  assert.equal(udaya.direction, "future");
  assert.equal(udaya.date, "2026-10-30");
});

test("Venus event classification selects the corresponding Chapter IX threshold", () => {
  const helpersStart = source.indexOf("function normalizeLongitude(");
  const helpersEnd = source.indexOf("const planetDailyCache", helpersStart);
  assert.ok(helpersStart >= 0 && helpersEnd > helpersStart);
  const sandbox = {};
  vm.runInNewContext(source.slice(helpersStart, helpersEnd), sandbox);
  const cases = [
    [{ body: "Venus", planetLongitude: 101, sunLongitude: 100, planetMotion: -0.5 }, "west-setting", 8],
    [{ body: "Venus", planetLongitude: 99, sunLongitude: 100, planetMotion: -0.5 }, "east-rising", 8],
    [{ body: "Venus", planetLongitude: 99, sunLongitude: 100, planetMotion: 0.5 }, "east-setting", 10],
    [{ body: "Venus", planetLongitude: 101, sunLongitude: 100, planetMotion: 0.5 }, "west-rising", 10]
  ];
  for (const [input, expectedEvent, expectedLimit] of cases) {
    const event = sandbox.classifyChapter9HorizonEvent(input);
    assert.equal(event, expectedEvent);
    assert.equal(sandbox.getPlanetEventThreshold("Venus", event), expectedLimit);
  }
  assert.equal(sandbox.getPlanetEventThreshold("Mercury", "east-setting"), null);
});

test("threshold changes between adjacent daily samples cannot fabricate a crossing", () => {
  const start = source.indexOf("function crossesAngularBoundary(");
  const end = source.indexOf("\nfunction findNearestAngularBoundary", start);
  assert.ok(start >= 0 && end > start);
  const sandbox = {};
  vm.runInNewContext(source.slice(start, end), sandbox);
  const a = { eclipticSeparation: 9, limit: 8 };
  const b = { eclipticSeparation: 9.5, limit: 10 };
  assert.equal(sandbox.crossesAngularBoundary(a, b, "asta", x => x.limit), false);
  assert.equal(sandbox.crossesAngularBoundary(a, b, "udaya", x => x.limit), false);
  assert.equal(sandbox.crossesAngularBoundary({eclipticSeparation:9,limit:8},{eclipticSeparation:7,limit:8},"asta",x=>x.limit), true);
});
