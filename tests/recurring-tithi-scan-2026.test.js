const test = require("node:test");
const assert = require("node:assert/strict");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const TZ = 330; // Pithoragarh local civil time (IST).

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
        tithiEnd: asDate(hit.endTime).toISOString(),
        masa: p.masa, paksha: p.paksha, tithi: p.tithi
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

const fs = require("node:fs");
const path = require("node:path");
function monthEvents(isoDate) {
  const file = path.join(process.cwd(), "data", "festivals", isoDate.slice(0, 7) + ".json");
  return JSON.parse(fs.readFileSync(file, "utf8")).events || [];
}
const EXPECTED_SKANDA = [
 "2026-01-24","2026-02-23","2026-03-24","2026-04-22","2026-05-22","2026-06-20",
 "2026-07-19","2026-08-18","2026-09-17","2026-10-16","2026-11-15","2026-12-15"
];
const EXPECTED_DURGASHTAMI = [
 "2026-01-26","2026-03-26","2026-04-24","2026-05-23","2026-06-22","2026-07-21",
 "2026-08-20","2026-09-19","2026-10-19","2026-11-17","2026-12-17"
];
const EXPECTED_AMAVASYA = [
 "2026-01-18","2026-02-17","2026-03-19","2026-04-17","2026-05-16","2026-06-15",
 "2026-07-14","2026-08-12","2026-09-11","2026-10-10","2026-11-09","2026-12-08"
];

test("all 12 sunrise-selected Skanda Shashthi dates have one approved catalog record", () => {
  const scanned = scanTithiAtSunrise(5).map(x => x.date);
  assert.deepEqual(scanned, EXPECTED_SKANDA);
  for (const date of EXPECTED_SKANDA) {
    const matches = monthEvents(date).filter(e => e.date === date && /स्कन्द षष्ठी|स्कंद षष्ठी/.test(e.title || ""));
    assert.equal(matches.length, 1, date + " must have one Skanda Shashthi entry");
    assert.equal(matches[0].reviewStatus, "approved", date);
    assert.match(matches[0].hinduTithi || "", /शुक्ल षष्ठी/, date);
  }
  assert.equal(monthEvents("2026-06-19").filter(e => e.date === "2026-06-19" && /स्कन्द षष्ठी/.test(e.title || "")).length, 0);
});

test("monthly Durgashtami coverage is represented without duplicating Navratri Ashtami", () => {
  const scanned = scanTithiAtSunrise(7).map(x => x.date);
  assert.deepEqual(scanned, EXPECTED_DURGASHTAMI);
  for (const date of EXPECTED_DURGASHTAMI) {
    const rows = monthEvents(date).filter(e => e.date === date);
    assert.ok(rows.some(e => /शुक्ल अष्टमी/.test(e.hinduTithi || "")), date + " must represent the Shukla Ashtami observance");
  }
  for (const date of ["2026-01-26","2026-04-24","2026-05-23","2026-06-22","2026-08-20","2026-09-19","2026-11-17","2026-12-17"]) {
    const rows = monthEvents(date).filter(e => e.date === date && /मासिक दुर्गाष्टमी/.test(e.title || ""));
    assert.equal(rows.length, 1, date);
    assert.equal(rows[0].reviewStatus, "approved", date);
  }
});

test("Amavasya sunrise dates are covered except the unresolved March 19 tithi conflict", () => {
  const scanned = scanTithiAtSunrise(29).map(x => x.date);
  assert.deepEqual(scanned, EXPECTED_AMAVASYA);
  for (const date of EXPECTED_AMAVASYA.filter(x => x !== "2026-03-19")) {
    const rows = monthEvents(date).filter(e => e.date === date);
    assert.ok(rows.some(e => /अमावस्या/.test(e.title || "") || /कृष्ण अमावस्या/.test(e.hinduTithi || "")), date + " must represent Amavasya");
  }
  const adhika = monthEvents("2026-06-15").find(e => e.date === "2026-06-15" && /अमावस्या/.test(e.title || ""));
  assert.equal(adhika.reviewStatus, "approved");
  assert.match(adhika.hinduTithi, /अधिक ज्येष्ठ कृष्ण अमावस्या/);
});
