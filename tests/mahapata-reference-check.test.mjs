import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(
  new URL("../data/reviews/mahapata-fixtures-2026-2030.json", import.meta.url),
  "utf8"
));

function event(type, datePrefix) {
  const found = data.events.find(item =>
    item.type === type && item.startTimeIST.startsWith(datePrefix)
  );
  assert.ok(found, `missing ${type} event at ${datePrefix}`);
  return found;
}
function minutesApart(a, b) {
  return Math.abs(Date.parse(a) - Date.parse(b)) / 60000;
}
function near(actual, expected, toleranceMinutes = 5) {
  assert.ok(minutesApart(actual, expected) <= toleranceMinutes,
    `expected ${actual} to be within ${toleranceMinutes} minutes of ${expected}`);
}

test("2026-01-13 Vyatipata overlap agrees with the Drik reference window", () => {
  const item = event("व्यतीपात महापात", "2026-01-13");
  near(item.startTimeIST, "2026-01-13T00:15:00+05:30", 2);
  near(item.endTimeIST, "2026-01-13T06:28:00+05:30", 2);
});

test("2026-11-02 Vaidhriti overlap agrees with the independent true-pata table", () => {
  const item = event("वैधृति महापात", "2026-11-02");
  near(item.startTimeIST, "2026-11-02T20:16:00+05:30", 2);
  near(item.endTimeIST, "2026-11-03T00:39:00+05:30", 2);
});

test("2027-01-03 Vyatipata overlap agrees with the independent full-year table", () => {
  const item = event("व्यतीपात महापात", "2027-01-03");
  near(item.startTimeIST, "2027-01-03T04:07:00+05:30", 2);
  near(item.endTimeIST, "2027-01-03T11:23:00+05:30", 2);
});

test("2028-03-24 Vaidhriti overlap agrees with the independent full-year table", () => {
  const item = event("वैधृति महापात", "2028-03-24");
  near(item.startTimeIST, "2028-03-24T17:37:00+05:30", 2);
  near(item.endTimeIST, "2028-03-24T21:58:00+05:30", 2);
});

test("Drik-style apparent contact interval remains primary; Surya Siddhanta is separate", () => {
  const item = event("व्यतीपात महापात", "2026-01-13");
  assert.equal(item.model, "drik-style-geocentric-apparent-declination-band-overlap");
  assert.equal(item.suryaSiddhantaComparison.method,
    "surya-siddhanta-xi-14-15-numerical-adaptation");
  near(item.suryaSiddhantaComparison.startTimeIST, "2026-01-13T02:11:45+05:30", 1);
  near(item.suryaSiddhantaComparison.endTimeIST, "2026-01-13T04:29:13+05:30", 1);
  assert.notEqual(item.suryaSiddhantaComparison.startTimeIST, item.startTimeIST);
  assert.equal(item.suryaSiddhantaComparison.status, "research-only-not-approved");
});

test("annual grouping follows the Drik-style apparent-contact start", () => {
  assert.ok(data.events.every(item => item.year === Number(item.startTimeIST.slice(0, 4))));
  const crossYear = data.events.find(item => item.suryaSiddhantaComparisonYear !== item.year);
  assert.ok(crossYear, "fixture includes different years for the primary and comparison methods");
});

test("2030 mean patas without a true crossing remain review items, never public events", () => {
  const missing = data.reviewItems.filter(item =>
    item.status === "no-true-crossing-within-three-day-search" &&
    item.meanPataIST?.startsWith("2030-")
  );
  assert.equal(missing.length, 4);
  assert.ok(missing.every(item => !("startTimeIST" in item)));
});
