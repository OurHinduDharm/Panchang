import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLocalTwilightWindows,
  calculateCityHeliacalCandidates
} from "../planetary-city-heliacal-engine.mjs";

const observer = { latitude: 29.5828, longitude: 80.2182, height: 1650 };

function fakeAstronomy() {
  return {
    Body: { Sun: "Sun", Jupiter: "Jupiter", Venus: "Venus" },
    SearchAltitude(_body, _observer, direction, start) {
      const day = new Date(start);
      const hour = direction > 0 ? 0 : 20;
      return { date: new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour)) };
    },
    SearchRiseSet(_body, _observer, direction, start) {
      const day = new Date(start);
      const hour = new Date(start).getUTCHours() >= 12 ? 18 : 6;
      return { date: new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour)) };
    },
    Equator(body) {
      return body === "Sun" ? { ra: 1, dec: 2 } : { ra: 3, dec: 4 };
    },
    Horizon(date, _observer, ra) {
      if (ra === 1) return { altitude: -10, azimuth: 90 };
      const minute = date.getUTCMinutes();
      return { altitude: 20, azimuth: 100 + minute / 10 };
    },
    Illumination() {
      return { mag: -2, phase_angle: 12, phase_fraction: 0.9 };
    }
  };
}

test("builds separate local morning and evening astronomical twilight windows", () => {
  const windows = buildLocalTwilightWindows({
    astronomy: fakeAstronomy(), observer,
    start: "2028-01-01T00:00:00Z",
    end: "2028-01-01T23:59:00Z"
  });
  assert.deepEqual(windows.map(item => item.period), ["morning", "evening"]);
  assert.equal(windows[0].start, "2028-01-01T00:00:00.000Z");
  assert.equal(windows[0].end, "2028-01-01T06:00:00.000Z");
  assert.equal(windows[1].start, "2028-01-01T18:00:00.000Z");
  assert.equal(windows[1].end, "2028-01-01T20:00:00.000Z");
});

test("does not invent twilight windows when astronomical events are absent", () => {
  const astronomy = fakeAstronomy();
  astronomy.SearchAltitude = () => null;
  astronomy.SearchRiseSet = () => null;
  assert.deepEqual(buildLocalTwilightWindows({
    astronomy, observer,
    start: "2028-01-01T00:00:00Z",
    end: "2028-01-01T23:59:00Z"
  }), []);
});

test("end-to-end city calculation keeps candidate events unpublished", () => {
  const result = calculateCityHeliacalCandidates({
    astronomy: fakeAstronomy(), planet: "Venus", observer,
    start: "2028-01-01T00:00:00Z",
    end: "2028-01-02T00:00:00Z"
  });
  assert.equal(result.modelId, "city-topocentric-schaefer-heliacal-candidate-v1");
  assert.equal(result.publicationEligible, false);
  assert.equal(result.observer.elevationMeters, 1650);
  assert.equal(result.twilightWindows.length, 2);
  assert.ok(Array.isArray(result.candidates));
  for (const candidate of result.candidates) {
    assert.ok(["asta-candidate", "udaya-candidate", "other-visibility-transition"].includes(candidate.type));
    if (candidate.type === "asta-candidate") assert.equal(candidate.period === "morning" || candidate.period === "evening", true);
    if (candidate.type === "udaya-candidate") assert.equal(candidate.period === "morning" || candidate.period === "evening", true);
  }
});

test("rejects incomplete observers and reversed date ranges", () => {
  assert.throws(() => buildLocalTwilightWindows({
    astronomy: fakeAstronomy(), observer: { latitude: 0, longitude: 0 },
    start: "2028-01-01T00:00:00Z", end: "2028-01-02T00:00:00Z"
  }), /complete city observer/);
  assert.throws(() => buildLocalTwilightWindows({
    astronomy: fakeAstronomy(), observer,
    start: "2028-01-02T00:00:00Z", end: "2028-01-01T00:00:00Z"
  }), /end must be after start/);
});
