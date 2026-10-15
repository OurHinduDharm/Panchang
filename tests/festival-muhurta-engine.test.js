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
  assert.equal(result.window.end.toISOString(), "2026-10-11T04:33:00.000Z");
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
  assert.equal(result.status, "no-candidate");
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
