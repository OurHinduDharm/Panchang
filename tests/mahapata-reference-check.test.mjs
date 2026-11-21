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

test("Surya Siddhanta XI.14-15 interval is stored separately from nonlinear disk overlap", () => {
  const item = event("व्यतीपात महापात", "2026-01-13");
  assert.equal(item.suryaSiddhantaXI.method,
    "surya-siddhanta-xi-14-15-numerical-adaptation");
  near(item.suryaSiddhantaXI.startTimeIST, "2026-01-13T02:11:45+05:30", 1);
  near(item.suryaSiddhantaXI.endTimeIST, "2026-01-13T04:29:13+05:30", 1);
  assert.notEqual(item.suryaSiddhantaXI.startTimeIST, item.startTimeIST);
  assert.equal(item.suryaSiddhantaXI.status, "research-only-not-approved");
});

test("annual grouping follows the Surya Siddhanta interval start across year boundaries", () => {
  assert.ok(data.events.every(item =>
    item.year === Number(item.suryaSiddhantaXI.startTimeIST.slice(0, 4))
  ));
});

test("2030 mean patas without a true crossing remain review items, never public events", () => {
  const missing = data.reviewItems.filter(item =>
    item.status === "no-true-crossing-within-three-day-search" &&
    item.meanPataIST?.startsWith("2030-")
  );
  assert.equal(missing.length, 4);
  assert.ok(missing.every(item => !("startTimeIST" in item)));
});
