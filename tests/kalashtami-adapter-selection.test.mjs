import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { selectMonthlyDateForEvent } = require("./fixtures/kalashtami-panchang-adapter.js");

test("Kalashtami applies the one-ghati Pradosh rule across all observed dates before seeds", () => {
  const days = [
    { date: "2026-10-02", pradoshMinutes: 10, nightMinutes: 180 },
    { date: "2026-10-03", pradoshMinutes: 25, nightMinutes: 100 }
  ];
  const selected = selectMonthlyDateForEvent(days, new Set(["2026-10-02"]));
  assert.equal(selected.date, "2026-10-03");
});

test("Kalashtami chooses greater night overlap even when a seeded date qualifies", () => {
  const days = [
    { date: "2026-10-02", pradoshMinutes: 24, nightMinutes: 90 },
    { date: "2026-10-03", pradoshMinutes: 30, nightMinutes: 120 }
  ];
  const selected = selectMonthlyDateForEvent(days, new Set(["2026-10-02"]));
  assert.equal(selected.date, "2026-10-03");
});

test("Kalashtami uses a seeded date only to break an exact night-overlap tie", () => {
  const days = [
    { date: "2026-10-02", pradoshMinutes: 24, nightMinutes: 120 },
    { date: "2026-10-03", pradoshMinutes: 30, nightMinutes: 120 }
  ];
  const selected = selectMonthlyDateForEvent(days, new Set(["2026-10-02"]));
  assert.equal(selected.date, "2026-10-02");
});
