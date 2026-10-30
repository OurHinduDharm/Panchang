const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const EXPECTED_DATES = [
  "2026-01-06", "2026-02-05", "2026-03-06", "2026-04-05",
  "2026-05-05", "2026-06-03", "2026-07-03", "2026-08-02",
  "2026-08-31", "2026-09-29", "2026-10-29", "2026-11-27"
];

function dateAtLocalNoon(isoDate) {
  return new Date(isoDate + "T06:30:00.000Z");
}
function asDate(value) {
  const result = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(result.getTime()) ? result : null;
}
function chaturthiAtMoonrise(isoDate) {
  const p = getPanchangam(dateAtLocalNoon(isoDate), LOCATION, {
    timezoneOffset: 330, calendarType: "purnimanta"
  });
  const moonrise = asDate(p && p.moonrise);
  const rows = Array.isArray(p && p.tithis) ? p.tithis : [];
  const tithi = rows.find(row => {
    if (Number(row && row.index) !== 18) return false; // Krishna Chaturthi
    const start = asDate(row.startTime), end = asDate(row.endTime);
    return start && end && moonrise && start <= moonrise && end > moonrise;
  });
  return { qualifies: Boolean(tithi), moonrise, tithi, p };
}

test("selected Pithoragarh Sankashti dates have Krishna Chaturthi at moonrise", () => {
  const failures = [];
  for (const isoDate of EXPECTED_DATES) {
    const result = chaturthiAtMoonrise(isoDate);
    if (!result.qualifies) failures.push({
      date: isoDate, moonrise: result.moonrise,
      tithis: (result.p.tithis || []).map(x => ({ index:x.index,startTime:x.startTime,endTime:x.endTime }))
    });
  }
  assert.deepEqual(failures, []);
  assert.equal(EXPECTED_DATES.length, 12);
});


test("all 12 calculation-checked Sankashti dates are present once as approved records", () => {
  for (const isoDate of EXPECTED_DATES) {
    const month = isoDate.slice(5, 7);
    const file = path.join(process.cwd(), "data", "festivals", "2026-" + month + ".json");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const matches = (data.events || []).filter(item =>
      item.date === isoDate && /संकष्टी|सकट|करकचतुर्थी/i.test(String(item.title || ""))
    );
    assert.equal(matches.length, 1, isoDate + " must have exactly one Sankashti record");
    assert.equal(matches[0].reviewStatus, "approved", isoDate + " must be approved");
    assert.match(matches[0].hinduTithi || "", /कृष्ण चतुर्थी/, isoDate + " must include Krishna Chaturthi");
  }
});

test("December candidate stays out of public approval while neither candidate has Chaturthi at moonrise", () => {
  const dec26 = chaturthiAtMoonrise("2026-12-26");
  const dec27 = chaturthiAtMoonrise("2026-12-27");
  console.log("December Sankashti local check:", JSON.stringify({
    dec26: { qualifies:dec26.qualifies, moonrise:dec26.moonrise, tithi:dec26.tithi },
    dec27: { qualifies:dec27.qualifies, moonrise:dec27.moonrise, tithi:dec27.tithi }
  }));
  assert.equal(dec26.qualifies, false);
  assert.equal(dec27.qualifies, false);
  const file = path.join(process.cwd(), "data", "festivals", "2026-12.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const candidate = (data.events || []).filter(item =>
    item.date === "2026-12-26" && /संकष्टी/i.test(String(item.title || ""))
  );
  assert.equal(candidate.length, 1);
  assert.equal(candidate[0].reviewStatus, "needs-review");
});
