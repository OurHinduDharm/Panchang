const test = require("node:test");
const assert = require("node:assert/strict");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const EXPECTED_DATES = [
  "2026-01-16", "2026-02-15", "2026-03-17", "2026-04-15",
  "2026-05-15", "2026-06-13", "2026-07-12", "2026-08-11",
  "2026-09-09", "2026-10-08", "2026-11-07", "2026-12-07"
];

function dateAtLocalNoon(isoDate) {
  return new Date(isoDate + "T06:30:00.000Z");
}
function asDate(value) {
  const result = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(result.getTime()) ? result : null;
}
function nishitaChaturdashi(isoDate) {
  const date = dateAtLocalNoon(isoDate);
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const p = getPanchangam(date, LOCATION, { timezoneOffset:330, calendarType:"purnimanta" });
  const next = getPanchangam(nextDate, LOCATION, { timezoneOffset:330, calendarType:"purnimanta" });
  const sunset = asDate(p && p.sunset);
  const nextSunrise = asDate(next && next.sunrise);
  if (!sunset || !nextSunrise || nextSunrise <= sunset) return { qualifies:false, sunset, nextSunrise, p, next };
  const night = nextSunrise.getTime() - sunset.getTime();
  const nishitaStart = new Date(sunset.getTime() + night * 7 / 15);
  const nishitaEnd = new Date(sunset.getTime() + night * 8 / 15);
  const rows = [...(p.tithis || []), ...(next.tithis || [])];
  const tithi = rows.find(row => {
    if (Number(row && row.index) !== 28) return false; // Krishna Chaturdashi
    const start = asDate(row.startTime), end = asDate(row.endTime);
    return start && end && end > nishitaStart && start < nishitaEnd;
  });
  return { qualifies:Boolean(tithi), sunset, nextSunrise, nishitaStart, nishitaEnd, tithi, p, next };
}

test("selected 2026 Masik Shivaratri dates have Krishna Chaturdashi during local Nishita", () => {
  const failures = [];
  for (const isoDate of EXPECTED_DATES) {
    const result = nishitaChaturdashi(isoDate);
    if (!result.qualifies) failures.push({
      date:isoDate, nishitaStart:result.nishitaStart, nishitaEnd:result.nishitaEnd,
      current:(result.p && result.p.tithis || []).map(x=>({index:x.index,startTime:x.startTime,endTime:x.endTime})),
      next:(result.next && result.next.tithis || []).map(x=>({index:x.index,startTime:x.startTime,endTime:x.endTime}))
    });
  }
  assert.deepEqual(failures, []);
  assert.equal(EXPECTED_DATES.length, 12);
});
