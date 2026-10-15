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

test("adapter calculates local sunrise and night-midpoint candidate data with an injected Panchang engine", async () => {
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
    return { tithi, paksha: isCandidateMonth ? "Krishna" : "Shukla", masa: "Magha", sunrise, sunset };
  }
  const result = await adapter.buildKalashtamiDays({
    year: 2027, latitude: 30.1265, longitude: 80.4817, elevation: 0,
    getPanchangam: fakeGetPanchangam, Observer: FakeObserver
  });
  assert.equal(result.year, 2027);
  assert.ok(result.candidateDates.length > 0);
  assert.ok(result.sunriseDays.length > 0);
  assert.ok(result.nightMidpointDays.length > 0);
  assert.ok(calls.every(call => call.options.timezoneOffset === 330));
  assert.equal(result.latitude, 30.1265);
  assert.match(result.note, /not a certified Nishita/);
});
