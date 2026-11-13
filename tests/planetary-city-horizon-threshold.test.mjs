import test from "node:test";
import assert from "node:assert/strict";
import { findHorizonTwilightThresholdCrossings } from "../planetary-city-horizon-threshold.mjs";

test("interpolates a solar-depression threshold between adjacent horizon events", () => {
  const candidates = findHorizonTwilightThresholdCrossings({
    horizonSeries: {
      events: [
        { type: "rise", instant: "2027-01-01T00:00:00.000Z", sunDepressionDeg: 5 },
        { type: "rise", instant: "2027-01-02T00:00:00.000Z", sunDepressionDeg: 7 },
        { type: "set", instant: "2027-01-01T12:00:00.000Z", sunDepressionDeg: 12 }
      ]
    },
    thresholdDepressionDeg: 6,
    eventType: "rise"
  });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].type, "rise");
  assert.equal(candidates[0].instant, "2027-01-01T12:00:00.000Z");
});

test("does not emit a crossing when the threshold is not bracketed", () => {
  assert.deepEqual(findHorizonTwilightThresholdCrossings({
    horizonSeries: { events: [
      { type: "rise", instant: "2027-01-01T00:00:00Z", sunDepressionDeg: 7 },
      { type: "rise", instant: "2027-01-02T00:00:00Z", sunDepressionDeg: 8 }
    ] },
    thresholdDepressionDeg: 6
  }), []);
});

test("rejects invalid threshold and event direction", () => {
  const horizonSeries = { events: [] };
  assert.throws(() => findHorizonTwilightThresholdCrossings({
    horizonSeries, thresholdDepressionDeg: 0
  }), /thresholdDepressionDeg/);
  assert.throws(() => findHorizonTwilightThresholdCrossings({
    horizonSeries, thresholdDepressionDeg: 6, eventType: "transit"
  }), /eventType/);
});
