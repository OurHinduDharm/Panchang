const test = require("node:test");
const assert = require("node:assert/strict");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const EXPECTED_PRADOSH_DATES = [
  "2026-01-01", "2026-01-16", "2026-01-30",
  "2026-02-14",
  "2026-03-01", "2026-03-16", "2026-03-30",
  "2026-04-15", "2026-04-28",
  "2026-05-14", "2026-05-28",
  "2026-06-12", "2026-06-27",
  "2026-07-12", "2026-07-26",
  "2026-08-10", "2026-08-25",
  "2026-09-08", "2026-09-24",
  "2026-10-08", "2026-10-23",
  "2026-11-06", "2026-11-22",
  "2026-12-06", "2026-12-21"
];

function dateAtLocalNoon(isoDate) {
  return new Date(isoDate + "T06:30:00.000Z");
}
function asDate(value) {
  const result = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(result.getTime()) ? result : null;
}
function trayodashiOverlapsPradosh(panchang) {
  const sunset = asDate(panchang && panchang.sunset);
  if (!sunset) return false;
  const windowEnd = new Date(sunset.getTime() + 180 * 60000);
  const rows = Array.isArray(panchang.tithis) ? panchang.tithis : [];
  return rows.some(row => {
    if (Number(row && row.index) !== 12) return false;
    const start = asDate(row.startTime);
    const end = asDate(row.endTime);
    return start && end && end > sunset && start < windowEnd;
  });
}

test("all selected 2026 Pradosh dates have Trayodashi during the local evening window", () => {
  const failures = [];
  for (const isoDate of EXPECTED_PRADOSH_DATES) {
    const panchang = getPanchangam(dateAtLocalNoon(isoDate), LOCATION, {
      timezoneOffset: 330,
      calendarType: "purnimanta"
    });
    if (!trayodashiOverlapsPradosh(panchang)) {
      failures.push({
        date: isoDate,
        sunset: panchang && panchang.sunset,
        tithis: (panchang && panchang.tithis || []).map(item => ({
          index: item.index, startTime: item.startTime, endTime: item.endTime
        }))
      });
    }
  }
  assert.deepEqual(failures, [], "Selected dates must have Trayodashi overlapping the local evening window");
  assert.equal(EXPECTED_PRADOSH_DATES.length, 25);
});
