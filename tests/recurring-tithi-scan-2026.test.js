const test = require("node:test");
const assert = require("node:assert/strict");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const TZ = 330;

function asDate(value) {
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}
function localNoon(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 6, 30, 0));
}
function scanTithiAtSunrise(index) {
  const rows = [];
  for (let month = 1; month <= 12; month++) {
    const last = new Date(Date.UTC(2026, month, 0)).getUTCDate();
    for (let day = 1; day <= last; day++) {
      const date = localNoon(2026, month, day);
      const p = getPanchangam(date, LOCATION, { timezoneOffset: TZ, calendarType: "purnimanta" });
      const sunrise = asDate(p && p.sunrise);
      const intervals = Array.isArray(p && p.tithis) ? p.tithis : [];
      const hit = intervals.find(row => {
        if (Number(row && row.index) !== index) return false;
        const start = asDate(row.startTime), end = asDate(row.endTime);
        return sunrise && start && end && start <= sunrise && end > sunrise;
      });
      if (hit) rows.push({
        date: date.toISOString().slice(0,10),
        sunrise: sunrise.toISOString(),
        tithiStart: asDate(hit.startTime).toISOString(),
        tithiEnd: asDate(hit.endTime).toISOString()
      });
    }
  }
  return rows;
}

test("diagnose monthly Shukla Ashtami, Shukla Shashthi and Amavasya at local sunrise", () => {
  const result = {
    masikDurgashtami: scanTithiAtSunrise(7),
    skandaShashthi: scanTithiAtSunrise(5),
    amavasya: scanTithiAtSunrise(29)
  };
  console.log("OHD_RECURRING_TITHI_SCAN_2026=" + JSON.stringify(result));
  for (const [name, dates] of Object.entries(result)) {
    assert.ok(dates.length >= 11 && dates.length <= 13, name + " should resolve to roughly one observance per lunar month");
  }
});
