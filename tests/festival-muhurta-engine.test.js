const test = require("node:test");
const assert = require("node:assert/strict");
const { createFestivalMuhurtaEngine } = require("../festival-muhurta-engine.js");
const rules = require("../festival-muhurta-rules.js");

test("Ghatasthapana adapter calculates from the selected location's Panchang intervals", () => {
  let observedQuery;
  let observedLocation;
  const sunrise = new Date("2026-10-11T00:37:00.000Z"); // 06:07 IST
  const sunset = new Date("2026-10-11T12:15:00.000Z");  // 17:45 IST
  const panchang = {
    sunrise,
    sunset,
    tithis: [
      { index: 0, startTime: "2026-10-10T15:49:00.000Z", endTime: "2026-10-11T16:00:00.000Z" }
    ],
    nakshatras: [
      { index: 13, startTime: "2026-10-11T02:00:00.000Z", endTime: "2026-10-11T10:00:00.000Z" }
    ],
    yogas: [
      { index: 26, startTime: "2026-10-10T20:00:00.000Z", endTime: "2026-10-11T05:00:00.000Z" }
    ]
  };
  class MockObserver {
    constructor(latitude, longitude, elevation) {
      observedLocation = { latitude, longitude, elevation };
    }
  }
  const engine = createFestivalMuhurtaEngine({
    Observer: MockObserver,
    getPanchangam(instant, observer, options) {
      observedQuery = { instant, options };
      return panchang;
    },
    rules
  });
  const result = engine.calculateGhatasthapana({
    date: "2026-10-11", latitude: 30.1265, longitude: 80.4817, elevation: 0
  });

  assert.equal(observedLocation.latitude, 30.1265);
  assert.equal(observedLocation.longitude, 80.4817);
  assert.equal(observedQuery.options.timezoneOffset, 330);
  assert.equal(observedQuery.instant.toISOString(), "2026-10-11T06:30:00.000Z");
  assert.equal(result.status, "candidate");
  assert.equal(result.selectedBy, "first-third-of-day");
  assert.equal(result.window.start.toISOString(), sunrise.toISOString());
  assert.equal(result.window.end.toISOString(), "2026-10-11T04:29:40.000Z");
  assert.equal(result.inputsAvailable.pratipada, true);
});

test("Ghatasthapana adapter refuses to invent a window when local Pratipada is absent", () => {
  const engine = createFestivalMuhurtaEngine({
    Observer: class {},
    getPanchangam: () => ({
      sunrise: "2026-10-11T00:37:00.000Z",
      sunset: "2026-10-11T12:15:00.000Z",
      tithis: [],
      nakshatras: [],
      yogas: []
    }),
    rules
  });
  const result = engine.calculateGhatasthapana({
    date: "2026-10-11", latitude: 30.1265, longitude: 80.4817
  });
  assert.equal(result.status, "calculation-unavailable");
  assert.equal(result.window, null);
  assert.ok(result.warnings.some((warning) => warning.includes("प्रतिपदा")));
});

test("Ghatasthapana adapter validates required date and coordinates", () => {
  const engine = createFestivalMuhurtaEngine({
    Observer: class {},
    getPanchangam: () => { throw new Error("Must not calculate for invalid input"); },
    rules
  });
  const result = engine.calculateGhatasthapana({
    date: "not-a-date", latitude: null, longitude: null
  });
  assert.equal(result.status, "calculation-unavailable");
  assert.equal(result.window, null);
});


test("Sharad Purnima adapter intersects local moonlight with the actual Purnima interval", () => {
  let observedLocation;
  let observedQuery;
  const panchang = {
    sunrise: new Date("2026-10-25T00:30:00.000Z"),
    moonrise: new Date("2026-10-25T11:35:00.000Z"),
    moonset: new Date("2026-10-25T23:50:00.000Z"),
    tithis: [
      { index: 14, startTime: "2026-10-25T06:25:00.000Z", endTime: "2026-10-26T04:10:00.000Z" }
    ]
  };
  const engine = createFestivalMuhurtaEngine({
    Observer: class {
      constructor(latitude, longitude, elevation) { observedLocation = { latitude, longitude, elevation }; }
    },
    getPanchangam(instant, observer, options) {
      observedQuery = { instant, options };
      return panchang;
    },
    rules
  });
  const result = engine.calculateSharadPurnimaKheer({
    date: "2026-10-25", latitude: 30.1265, longitude: 80.4817, elevation: 0
  });
  assert.deepEqual(observedLocation, { latitude: 30.1265, longitude: 80.4817, elevation: 0 });
  assert.equal(observedQuery.instant.toISOString(), "2026-10-25T06:30:00.000Z");
  assert.equal(observedQuery.options.timezoneOffset, 330);
  assert.equal(result.status, "candidate");
  assert.equal(result.window.start.toISOString(), panchang.moonrise.toISOString());
  assert.equal(result.window.end.toISOString(), panchang.moonset.toISOString());
  assert.deepEqual(result.warnings, []);
});

test("Sharad Purnima adapter does not invent a window when moonrise or Purnima is missing", () => {
  const engine = createFestivalMuhurtaEngine({
    Observer: class {},
    getPanchangam: () => ({ moonrise: null, moonset: null, tithis: [] }),
    rules
  });
  const result = engine.calculateSharadPurnimaKheer({
    date: "2026-10-25", latitude: 30.1265, longitude: 80.4817
  });
  assert.equal(result.status, "calculation-unavailable");
  assert.equal(result.window, null);
  assert.ok(result.warnings.some((warning) => warning.includes("चंद्रोदय")));
  assert.ok(result.warnings.some((warning) => warning.includes("पूर्णिमा")));
});

test("Ekadashi parana uses the Dvadashi interval, Hari-vasara baseline and optional tradition rule", () => {
  const panchang = {
    sunrise: new Date("2026-11-06T00:50:00.000Z"),
    tithis: [{ index: 26, startTime: "2026-11-06T00:50:00.000Z", endTime: "2026-11-06T06:00:00.000Z" }]
  };
  const engine = createFestivalMuhurtaEngine({
    Observer: class {},
    getPanchangam: () => panchang,
    rules
  });
  const unresolvedRule = engine.calculateEkadashiParana({
    date: "2026-11-06", latitude: 30.1265, longitude: 80.4817, dvadashiIndex: 26
  });
  assert.equal(unresolvedRule.status, "candidate");
  assert.ok(unresolvedRule.warnings.some((warning) => warning.includes("हरिवासर")));

  const approvedWindow = engine.calculateEkadashiParana({
    date: "2026-11-06", latitude: 30.1265, longitude: 80.4817, dvadashiIndex: 26,
    paranaRule: { start: "2026-11-06T02:30:00.000Z", end: "2026-11-06T04:30:00.000Z" }
  });
  assert.equal(approvedWindow.status, "candidate");
  assert.equal(approvedWindow.window.start.toISOString(), "2026-11-06T02:30:00.000Z");
  assert.equal(approvedWindow.window.end.toISOString(), "2026-11-06T04:30:00.000Z");
});

test("Puja window adapter only intersects supplied local windows and warns on missing components", () => {
  const engine = createFestivalMuhurtaEngine({
    Observer: class {},
    getPanchangam: () => ({
      tithis: [{ index: 28, startTime: "2026-11-08T11:00:00.000Z", endTime: "2026-11-09T12:00:00.000Z" }]
    }),
    rules
  });
  const result = engine.calculatePujaWindows({
    date: "2026-11-08", latitude: 30.1265, longitude: 80.4817, tithiIndex: 28,
    intervals: {
      pradosh: { start: "2026-11-08T12:00:00.000Z", end: "2026-11-08T14:00:00.000Z" },
      vrishabha: { start: "2026-11-08T12:30:00.000Z", end: "2026-11-08T13:45:00.000Z" }
    },
    tradition: "local"
  });
  assert.equal(result.status, "candidate");
  assert.equal(result.pradosh.start.toISOString(), "2026-11-08T12:00:00.000Z");
  assert.equal(result.vrishabha.end.toISOString(), "2026-11-08T13:45:00.000Z");
  assert.equal(result.nishita, null);
  assert.ok(result.warnings.some((warning) => warning.includes("निशीथकाल")));
});
