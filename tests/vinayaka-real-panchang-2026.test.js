const test = require("node:test");
const assert = require("node:assert/strict");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const EXPECTED_DATES = [
  "2026-01-22", "2026-02-21", "2026-03-22", "2026-04-20",
  "2026-05-20", "2026-06-18", "2026-07-17", "2026-08-16",
  "2026-09-14", "2026-10-14", "2026-11-13", "2026-12-13"
];
function asDate(value) {
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}
function dateAtLocalNoon(isoDate) {
  return new Date(isoDate + "T06:30:00.000Z");
}
function chaturthiAtMadhyahna(isoDate) {
  const p = getPanchangam(dateAtLocalNoon(isoDate), LOCATION, {
    timezoneOffset:330, calendarType:"purnimanta"
  });
  const sunrise = asDate(p && p.sunrise), sunset = asDate(p && p.sunset);
  if (!sunrise || !sunset || sunset <= sunrise) return { qualifies:false, p };
  const day = sunset.getTime() - sunrise.getTime();
  const start = new Date(sunrise.getTime() + day * 2 / 5);
  const end = new Date(sunrise.getTime() + day * 3 / 5);
  const rows = Array.isArray(p.tithis) ? p.tithis : [];
  const tithi = rows.find(row => {
    if (Number(row && row.index) !== 3) return false; // Shukla Chaturthi
    const a = asDate(row.startTime), b = asDate(row.endTime);
    return a && b && b > start && a < end;
  });
  return { qualifies:Boolean(tithi), sunrise, sunset, start, end, tithi, p };
}
test("all 12 selected Vinayaka dates have Shukla Chaturthi during local Madhyahna", () => {
  const failures = [];
  for (const isoDate of EXPECTED_DATES) {
    const result = chaturthiAtMadhyahna(isoDate);
    if (!result.qualifies) failures.push({
      date:isoDate, madhyahnaStart:result.start, madhyahnaEnd:result.end,
      tithis:(result.p && result.p.tithis || []).map(x=>({index:x.index,startTime:x.startTime,endTime:x.endTime}))
    });
  }
  assert.deepEqual(failures, []);
  assert.equal(EXPECTED_DATES.length, 12);
});
