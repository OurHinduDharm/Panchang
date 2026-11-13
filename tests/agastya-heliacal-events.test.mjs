import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAgastyaHeliacalEvents,
  AGASTYA_FIXED_STAR
} from "../research/agastya-heliacal-events.mjs";

test("uses the Swiss fixed-star catalogue Agastya/alCar identity", () => {
  assert.equal(AGASTYA_FIXED_STAR.objectName, "Agastya");
  assert.equal(AGASTYA_FIXED_STAR.commonAstronomicalName, "Canopus");
  assert.equal(AGASTYA_FIXED_STAR.bayerDesignation, "alCar");
});

test("calculates heliacal first and last events without inventing traditional Arghya", () => {
  const calls = [];
  const adapter = {
    calculate(args) {
      calls.push(args);
      return {
        objectName: args.objectName,
        eventType: args.eventType === 1 ? "morning-first" : "evening-last",
        eventClass: "local-heliacal-visibility"
      };
    }
  };
  const result = calculateAgastyaHeliacalEvents({
    adapter,
    startDate: new Date("2026-01-01T00:00:00Z"),
    location: { latitude: 29.5828, longitude: 80.2182, elevationMeters: 1650 }
  });

  assert.equal(calls.length, 2);
  assert.ok(calls.every(call => call.objectName === "Agastya"));
  assert.deepEqual(calls.map(call => call.eventType), [1, 2]);
  assert.equal(result.eventClass, "fixed-star-heliacal-visibility");
  assert.equal(result.morningFirst.eventType, "morning-first");
  assert.equal(result.eveningLast.eventType, "evening-last");
  assert.equal(result.traditionalArghya.status, "separate-rule-not-calculated");
  assert.equal(result.traditionalArghya.sourceDataPath, "data/agastya-arghya-pithoragarh.json");
  assert.equal(result.terrainHorizon, "not-included");
});

test("requires a heliacal adapter", () => {
  assert.throws(() => calculateAgastyaHeliacalEvents({
    adapter: null,
    startDate: new Date("2026-01-01T00:00:00Z"),
    location: { latitude: 29.5828, longitude: 80.2182, elevationMeters: 1650 }
  }), /adapter is required/);
});
