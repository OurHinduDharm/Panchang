import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("function findNearestAngularBoundary(");
const end = source.indexOf("// A previously calculated pair of nearest boundaries", start);
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
    findThresholdCrossingInstant() { return new Date(selectedMs); }
  };
  vm.runInNewContext(source.slice(start, end), sandbox);
  return { selectedDate, search: sandbox.findNearestAngularBoundary };
}

test("above threshold: Asta future, Udaya past", () => {
  const { selectedDate, search } = makeSearch({ [-2]: 20, [-1]: 5, [0]: 20, [1]: 20, [2]: 5 });
  const asta = search("Mars", selectedDate, 10, "asta");
  const udaya = search("Mars", selectedDate, 10, "udaya");
  assert.equal(asta.direction, "future");
  assert.equal(asta.date, "2026-10-31");
  assert.equal(udaya.direction, "past");
  assert.equal(udaya.date, "2026-10-29");
});

test("at or below threshold: Asta past, Udaya future", () => {
  const { selectedDate, search } = makeSearch({ [-1]: 20, [0]: 5, [1]: 20 });
  const asta = search("Mars", selectedDate, 10, "asta");
  const udaya = search("Mars", selectedDate, 10, "udaya");
  assert.equal(asta.direction, "past");
  assert.equal(asta.date, "2026-10-29");
  assert.equal(udaya.direction, "future");
  assert.equal(udaya.date, "2026-10-30");
});
