const test = require("node:test");
const assert = require("node:assert/strict");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);

// Drik Panchang date lists are used only to define a narrow search window.
// The final candidates below are recalculated at Pithoragarh moonrise.
const DRIK_CANDIDATES = {
  2027: ["2027-01-25","2027-02-24","2027-03-25","2027-04-24","2027-05-23","2027-06-22","2027-07-22","2027-08-20","2027-09-19","2027-10-18","2027-11-17","2027-12-16"],
  2028: ["2028-01-15","2028-02-13","2028-03-13","2028-04-12","2028-05-11","2028-06-10","2028-07-10","2028-08-08","2028-09-07","2028-10-07","2028-11-05","2028-12-05"],
  2029: ["2029-01-03","2029-02-02","2029-03-03","2029-04-01","2029-05-01","2029-05-30","2029-06-29","2029-07-28","2029-08-27","2029-09-26","2029-10-26","2029-11-24","2029-12-24"],
  2030: ["2030-01-22","2030-02-21","2030-03-22","2030-04-21","2030-05-20","2030-06-18","2030-07-18","2030-08-16","2030-09-15","2030-10-15","2030-11-13","2030-12-13"]
};

function dateAtLocalNoon(isoDate) {
  return new Date(isoDate + "T06:30:00.000Z");
}
function asDate(value) {
  const result = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(result.getTime()) ? result : null;
}
function addDays(isoDate, offset) {
  const d = new Date(isoDate + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
function chaturthiAtMoonrise(isoDate) {
  const p = getPanchangam(dateAtLocalNoon(isoDate), LOCATION, {
    timezoneOffset: 330, calendarType: "purnimanta"
  });
  const moonrise = asDate(p && p.moonrise);
  const rows = Array.isArray(p && p.tithis) ? p.tithis : [];
  const tithi = rows.find(row => {
    if (Number(row && row.index) !== 18) return false;
    const start = asDate(row.startTime), end = asDate(row.endTime);
    return start && end && moonrise && start <= moonrise && end > moonrise;
  });
  return { qualifies: Boolean(tithi), moonrise, tithi };
}

test("scan Pithoragarh Sankashti dates around Drik's 2027-2030 candidates", () => {
  const results = {};
  for (const [year, dates] of Object.entries(DRIK_CANDIDATES)) {
    const candidates = new Set();
    for (const date of dates) {
      candidates.add(addDays(date, -1));
      candidates.add(date);
      candidates.add(addDays(date, 1));
    }
    const matches = [];
    for (const date of [...candidates].sort()) {
      const result = chaturthiAtMoonrise(date);
      if (result.qualifies) {
        matches.push({
          date,
          moonrise: result.moonrise.toISOString(),
          tithiStart: asDate(result.tithi.startTime).toISOString(),
          tithiEnd: asDate(result.tithi.endTime).toISOString()
        });
      }
    }
    results[year] = matches;
  }
  console.log("PITHORAGARH_FUTURE_SANKASHTI_SCAN=" + JSON.stringify(results));
  assert.ok(Object.values(results).every(matches => matches.length >= 10 && matches.length <= 14));
});
