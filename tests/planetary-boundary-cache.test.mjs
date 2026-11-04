import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

test("Planetary boundary-bracket cache reuses only dates strictly inside a valid pair", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const start = source.indexOf("const planetDailyCache = new Map();");
  const end = source.indexOf("function createPlanetCard(", start);
  assert.notEqual(start, -1);
  assert.ok(end > start);

  const selectedDate = "2026-01-15";
  const anchor = new Date(selectedDate + "T12:00:00+05:30").getTime();
  let elongationCalls = 0;
  const sandbox = {
    Date, Map, Number, String, Math, console,
    PLANETS: [{ body: "Venus", name: "शुक्र" }],
    observer: { latitude: 29.5828, longitude: 80.2182, height: 1650 },
    PLANET_ASTA_THRESHOLDS: { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 },
    planetPerfStats: null,
    getLocalNoon(date) {
      return new Date(date + "T12:00:00+05:30");
    },
    addDays(date, days) {
      const value = new Date(date + "T12:00:00+05:30");
      value.setUTCDate(value.getUTCDate() + days);
      return value.toISOString().slice(0, 10);
    },
    Equator(body, instant) {
      elongationCalls++;
      if (body === "Sun") return { ra: 0, dec: 0 };
      const offset = (instant.getTime() - anchor) / 86400000;
      const separation = 10 + 12 * Math.sin((2 * Math.PI * offset / 70) + 0.5);
      return { ra: separation / 15, dec: 0 };
    },
    formatEventDateTime(instant) {
      return instant.toISOString();
    }
  };

  vm.runInNewContext(source.slice(start, end), sandbox);
  const first = sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, selectedDate, sandbox.observer);
  assert.ok(first.asta && first.udaya, "both boundary estimates should be found");
  const callsAfterFirst = elongationCalls;

  const adjacentDate = sandbox.addDays(selectedDate, 1);
  const adjacent = sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, adjacentDate, sandbox.observer);
  assert.deepEqual(adjacent, first, "an interior date should reuse the same enclosing boundary pair");
  assert.equal(elongationCalls, callsAfterFirst,
    "a date strictly inside the cached boundary interval must not recalculate topocentric positions");

  const outsideDate = sandbox.addDays(selectedDate, 45);
  sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, outsideDate, sandbox.observer);
  assert.ok(elongationCalls > callsAfterFirst,
    "a date outside the cached interval must run the normal calculation path");
});
