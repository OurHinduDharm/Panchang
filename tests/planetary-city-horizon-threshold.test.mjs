import test from "node:test";
import assert from "node:assert/strict";
import {
  findHorizonTwilightThresholdCrossings,
  calculateCityAstaUdayaCandidates
} from "../planetary-city-horizon-threshold.mjs";

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
  assert.equal(candidates[0].instant, "2027-01-01T00:00:00.000Z");
  assert.equal(candidates[0].bracketFraction, 0.5);
  assert.equal(candidates[0].interpolation, "threshold-bracket-nearest-day-then-actual-horizon-clock");
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

test("calculates city-specific Asta/Udaya candidates without publication approval", () => {
  const astronomy = {
    Body: { Jupiter: "Jupiter", Venus: "Venus", Sun: "Sun" },
    SearchRiseSet(_body, _observer, direction, start) {
      const day = new Date(start);
      const hour = direction > 0 ? 6 : 18;
      return { date: new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour)) };
    },
    Equator(body) {
      return body === "Sun" ? { ra: 1, dec: 2 } : { ra: 3, dec: 4 };
    },
    Horizon(date, _observer, ra) {
      if (ra === 1) {
        const day = date.getUTCDate();
        return { altitude: day === 2 ? -7 : -5, azimuth: 90 };
      }
      return {
        altitude: 10,
        azimuth: date.getUTCHours() >= 12 ? 260 : 100
      };
    },
    Illumination() {
      return { mag: -2, phase_angle: 10, phase_fraction: 0.9 };
    }
  };
  const result = calculateCityAstaUdayaCandidates({
    astronomy,
    planet: "Venus",
    observer: { latitude: 29.58, longitude: 80.21, height: 1650 },
    start: "2027-01-01T00:00:00Z",
    end: "2027-01-03T23:59:00Z",
    thresholds: {
      astaStart: { rise: 6 },
      astaEnd: { set: 6 }
    }
  });
  assert.equal(result.publicationEligible, false);
  assert.ok(result.candidates.length > 0);
  assert.ok(result.candidates.every(candidate =>
    ["astaStart", "astaEnd"].includes(candidate.boundary)
  ));
  assert.ok(result.candidates.some(candidate => candidate.horizonDirection === "east"));
  assert.ok(result.candidates.some(candidate => candidate.horizonDirection === "west"));
  assert.ok(result.candidates.every(candidate =>
    Number.isFinite(candidate.planetAzimuthDeg) &&
    ["east", "west"].includes(candidate.horizonDirection) &&
    ["rise", "set"].includes(candidate.eventType)
  ));
});
