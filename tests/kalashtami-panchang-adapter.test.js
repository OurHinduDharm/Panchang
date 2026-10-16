const test = require("node:test");
const assert = require("node:assert/strict");
const adapter = require("../kalashtami-panchang-adapter.js");

test("adapter normalizes library tithi, paksha, and lunar month values to Hindi", () => {
  assert.equal(adapter.tithiHindi({ index: 7 }), "अष्टमी");
  assert.equal(adapter.tithiHindi({ index: 22 }), "अष्टमी");
  assert.equal(adapter.pakshaHindi("Krishna", 22), "कृष्ण");
  assert.equal(adapter.pakshaHindi("Shukla", 7), "शुक्ल");
  assert.equal(adapter.monthHindi({ name: "Margashirsha" }), "मार्गशीर्ष");
  assert.equal(adapter.monthHindi("Kartika"), "कार्तिक");
});

test("adapter calculates local sunrise, Pradosh, and Madhyahna data with an injected Panchang engine", async () => {
  const calls = [];
  function FakeObserver(latitude, longitude, elevation) {
    this.latitude = latitude; this.longitude = longitude; this.elevation = elevation;
  }
  function fakeGetPanchangam(date, observer, options) {
    calls.push({ date, observer, options });
    const iso = new Date(date).toISOString();
    const day = Number(iso.slice(8,10));
    const month = Number(iso.slice(5,7));
    const isCandidateMonth = month === 2;
    const tithi = isCandidateMonth && (day >= 3 && day <= 5) ? { index: 7 } : { index: 1 };
    const sunrise = new Date(iso.slice(0,10) + "T00:30:00.000Z");
    const sunset = new Date(iso.slice(0,10) + "T12:30:00.000Z");
    const dayStart = new Date(iso.slice(0,10) + "T00:00:00.000Z");
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    return { tithi, paksha: isCandidateMonth ? "Krishna" : "Shukla", masa: "Magha", sunrise, sunset, tithiStartTime: dayStart, tithiEndTime: dayEnd };
  }
  const result = await adapter.buildKalashtamiDays({
    year: 2027, latitude: 30.1265, longitude: 80.4817, elevation: 0,
    getPanchangam: fakeGetPanchangam, Observer: FakeObserver
  });
  assert.equal(result.year, 2027);
  assert.ok(result.candidateDates.length > 0);
  assert.ok(result.sunriseDays.length > 0);
  assert.ok(result.nightMidpointDays.length > 0);
  assert.ok(Array.isArray(result.monthlyDecisionDays));
  assert.ok(Array.isArray(result.annualDecisionDays));
  // This fixture labels the candidate month Magha, so it must not be emitted
  // as the annual Margashirsha Kalabhairava Ashtami.
  assert.equal(result.annualDecisionDays.length, 0);
  // A single Krishna Ashtami occurrence may be sampled under different boundary
  // keys; the final annual output must not emit duplicate civil dates.
  assert.equal(new Set(result.monthlyDecisionDays.map(day => day.date)).size, result.monthlyDecisionDays.length);
  assert.equal(new Set(result.annualDecisionDays.map(day => day.date)).size, result.annualDecisionDays.length);
  assert.ok(calls.every(call => call.options.timezoneOffset === 330));
  // Boundary-aware scanning should avoid hundreds of 15-minute probes.
  assert.ok(calls.length < 1000, `expected bounded engine calls, got ${calls.length}`);
  assert.equal(result.latitude, 30.1265);
  assert.match(result.note, /Pradosh/);
  assert.match(result.note, /Madhyahna/);
});


test("monthly Kalashtami prefers a Krishna Ashtami that overlaps Pradosh", () => {
  const days = [
    { date: "2027-01-28", sunrise: true, pradosh: false, madhyahna: true },
    { date: "2027-01-29", sunrise: true, pradosh: true, madhyahna: true }
  ];
  assert.equal(adapter.selectMonthlyDateForEvent(days).date, "2027-01-29");
  assert.equal(adapter.selectMonthlyDateForEvent([
    { date: "2027-02-27", pradoshMinutes: 12, nightMinutes: 250 },
    { date: "2027-02-28", pradoshMinutes: 0, nightMinutes: 180 }
  ]).date, "2027-02-27");
  assert.equal(adapter.selectMonthlyDateForEvent([
    { date: "2027-02-27", pradoshMinutes: 23, nightMinutes: 250 },
    { date: "2027-02-28", pradoshMinutes: 24, nightMinutes: 120 }
  ]).date, "2027-02-28");
});

test("annual Bhairava Ashtami applies the distinct Dharmasindhu tie-breaks", () => {
  assert.equal(adapter.selectAnnualBhairavaDate([
    { date: "2027-11-20", pradosh: true, madhyahna: false },
    { date: "2027-11-21", pradosh: true, madhyahna: false }
  ]).date, "2027-11-21");
  assert.equal(adapter.selectAnnualBhairavaDate([
    { date: "2027-11-20", pradosh: true, madhyahna: true },
    { date: "2027-11-21", pradosh: true, madhyahna: true }
  ]).date, "2027-11-20");
  assert.equal(adapter.selectAnnualBhairavaDate([
    { date: "2027-11-20", pradosh: true, madhyahna: false },
    { date: "2027-11-21", pradosh: false, madhyahna: true }
  ]).date, "2027-11-20");
  assert.equal(adapter.selectAnnualBhairavaDate([
    { date: "2027-11-20", pradosh: false, madhyahna: false },
    { date: "2027-11-21", pradosh: false, madhyahna: true }
  ]).date, "2027-11-21");
});
