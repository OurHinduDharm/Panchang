import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("function findThresholdCrossingInstant(");
const end = source.indexOf("\nconst planetEventBracketCache", start);
assert.notEqual(start, -1);
assert.notEqual(end, -1);

function makeSearch(separationByOffset) {
  const selectedDate = "2026-10-29";
  const selectedMs = Date.parse(selectedDate + "T12:00:00Z");
  const sampledOffsets = [];
  const sandbox = {
    Date,
    planetPerfStats: null,
    addDays(dateString, days) {
      return new Date(Date.parse(dateString + "T12:00:00Z") + days * 86400000).toISOString().slice(0, 10);
    },
    getPlanetDailyData(body, dateString) {
      const offset = Math.round((Date.parse(dateString + "T12:00:00Z") - selectedMs) / 86400000);
      sampledOffsets.push(offset);
      return { date: dateString, eclipticSeparation: separationByOffset[offset] ?? 20 };
    },
    Elongation() { return { ecliptic_separation: 5 }; }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);
  return {
    selectedDate,
    search: sandbox.findNearestAngularBoundary,
    sampledOffsets
  };
}

test("above threshold: Asta future, Udaya past", () => {
  const { selectedDate, search, sampledOffsets } = makeSearch({ [-1]: 5, [0]: 20, [1]: 20, [2]: 5 });
  const asta = search("Mars", selectedDate, 10, "asta");
  const astaSamples = [...sampledOffsets];
  const udaya = search("Mars", selectedDate, 10, "udaya");
  const udayaSamples = sampledOffsets.slice(astaSamples.length);
  assert.equal(asta.direction, "future");
  assert.equal(asta.date, "2026-10-31");
  assert.equal(udaya.direction, "past");
  assert.equal(udaya.date, "2026-10-29");
  assert.ok(asta.instant instanceof Date);
  assert.ok(udaya.instant instanceof Date);
  assert.ok(astaSamples.every(offset => offset >= 0), "Asta search must not sample the past");
  assert.ok(udayaSamples.every(offset => offset <= 0), "Udaya search must not sample the future");
});

test("below threshold: Asta past, Udaya future", () => {
  const { selectedDate, search, sampledOffsets } = makeSearch({ [-1]: 20, [0]: 5, [1]: 20 });
  const asta = search("Mars", selectedDate, 10, "asta");
  const astaSamples = [...sampledOffsets];
  const udaya = search("Mars", selectedDate, 10, "udaya");
  const udayaSamples = sampledOffsets.slice(astaSamples.length);
  assert.equal(asta.direction, "past");
  assert.equal(asta.date, "2026-10-29");
  assert.equal(udaya.direction, "future");
  assert.equal(udaya.date, "2026-10-30");
  assert.ok(astaSamples.every(offset => offset <= 0), "Asta search must not sample the future");
  assert.ok(udayaSamples.every(offset => offset >= 0), "Udaya search must not sample the past");
});

test("exactly at threshold: Asta is past and Udaya is future", () => {
  const { selectedDate, search } = makeSearch({ [-1]: 20, [0]: 10, [1]: 20 });
  const asta = search("Mars", selectedDate, 10, "asta");
  const udaya = search("Mars", selectedDate, 10, "udaya");
  assert.equal(asta.direction, "past");
  assert.equal(udaya.direction, "future");
});
