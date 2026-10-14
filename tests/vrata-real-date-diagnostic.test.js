// Diagnostic only: reproduce real tithi/nakshatra intervals at the fixed audit point.
// This is NOT a pass/fail fixture for astronomical correctness; independent
// same-coordinate reference values must be recorded before asserting exact times.
const test = require("node:test");
const assert = require("node:assert/strict");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = Object.freeze({
  latitude: 30.1265,
  longitude: 80.4817,
  elevation: 0,
  timezoneOffset: 330
});
const observer = new Observer(
  LOCATION.latitude,
  LOCATION.longitude,
  LOCATION.elevation
);
const DATES = [
  "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25", "2026-08-26",
  "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24"
];

function atISTNoon(date) {
  return new Date(date + "T12:00:00+05:30");
}
function asTime(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function normalize(items, sourceDate, kind) {
  return (Array.isArray(items) ? items : []).map(item => ({
    kind,
    index: item?.index ?? null,
    name: item?.name ?? null,
    startUTC: asTime(item?.startTime ?? item?.start),
    endUTC: asTime(item?.endTime ?? item?.end),
    sourceQueryDate: sourceDate
  })).filter(item => item.startUTC && item.endUTC);
}

test("diagnostic: emit pinned-library tithi/nakshatra intervals for fixed audit coordinates", () => {
  const byKey = new Map();
  for (const date of DATES) {
    const p = getPanchangam(atISTNoon(date), observer, {
      timezoneOffset: LOCATION.timezoneOffset
    });
    assert.ok(p && typeof p === "object", date + ": no Panchang result");
    for (const item of [
      ...normalize(p.tithis, date, "tithi"),
      ...normalize(p.nakshatras, date, "nakshatra")
    ]) {
      const key = [item.kind, item.index, item.startUTC, item.endUTC].join("|");
      if (!byKey.has(key)) byKey.set(key, item);
    }
  }
  const intervals = [...byKey.values()].sort((a, b) =>
    a.startUTC.localeCompare(b.startUTC) || a.kind.localeCompare(b.kind)
  );
  assert.ok(intervals.some(item => item.kind === "tithi"), "no tithi intervals returned");
  assert.ok(intervals.some(item => item.kind === "nakshatra"), "no nakshatra intervals returned");
  console.log("VRATA_REAL_DATE_DIAGNOSTIC " + JSON.stringify({
    library: "@ishubhamx/panchangam-js@3.0.0",
    location: LOCATION,
    datesQueried: DATES,
    intervals
  }));
});
