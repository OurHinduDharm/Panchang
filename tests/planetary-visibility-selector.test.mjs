import test from "node:test";
import assert from "node:assert/strict";
import { findNearestConjunctionAnchor, findVisibilityBoundaryNearAnchor } from "../research/planetary-visibility-selector.mjs";

const DAY_MS = 86400000;
const anchorDate = new Date("2026-01-10T06:30:00.000Z");

function fakeAstronomy(sunAltitudeAt) {
  return {
    SearchRiseSet(_body, _observer, _direction, start) {
      return { date: new Date(start.getTime() + 12 * 3600000) };
    },
    Equator(body) {
      return { ra: body === "Sun" ? 1 : 2, dec: 0 };
    },
    Horizon(date, _observer, ra) {
      const dayOffset = (date.getTime() - anchorDate.getTime()) / DAY_MS;
      return { altitude: ra === 1 ? sunAltitudeAt(dayOffset) : 0.1 };
    },
    Illumination() {
      return { mag: 1 };
    }
  };
}

const base = {
  body: "Venus",
  observer: { latitude: 28.6139, longitude: 77.209, height: 216 },
  anchorDate,
  direction: 1,
  boundaryName: "astaStart",
  model: { intercept: 0, slope: 0 },
  searchDays: 20,
  timeZone: "Asia/Kolkata"
};

test("selects a single Asta-start crossing at the local planetary rise event", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset)
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.crossingCount, 1);
  assert.equal(result.predictedBoundaryDate, "2026-01-10");
  assert.equal(result.direction, "rise");
  assert.equal(result.signedDateOffsetDays, 0);
  assert.ok(Math.abs(result.planetAltitudeDegrees - 0.1) < 1e-9);
});

test("selects a single Asta-end crossing with the opposite residual direction", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    direction: -1,
    boundaryName: "astaEnd",
    astronomy: fakeAstronomy(dayOffset => -dayOffset)
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.crossingCount, 1);
  assert.equal(result.predictedBoundaryDate, "2026-01-10");
  assert.equal(result.direction, "set");
});

test("returns no-crossing instead of inventing a boundary", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(() => -1)
  });

  assert.equal(result.status, "no-crossing");
  assert.equal(result.predictedBoundaryDate, null);
  assert.equal(result.predictedEventUTC, null);
});

test("refuses to select when multiple crossings occur in the search window", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => Math.sin(dayOffset * Math.PI / 5))
  });

  assert.equal(result.status, "ambiguous");
  assert.ok(result.crossingCount > 1);
  assert.equal(result.predictedBoundaryDate, null);
});

test("rejects invalid event direction and incomplete models", () => {
  assert.throws(() => findVisibilityBoundaryNearAnchor({
    ...base,
    direction: 0,
    astronomy: fakeAstronomy(dayOffset => dayOffset)
  }), /direction must be 1/);

  assert.throws(() => findVisibilityBoundaryNearAnchor({
    ...base,
    model: { intercept: 0 },
    astronomy: fakeAstronomy(dayOffset => dayOffset)
  }), /model.intercept and model.slope/);
});


function fakeConjunctionSearch(eventsByTarget) {
  return {
    SearchRelativeLongitude(_body, target, start) {
      const next = (eventsByTarget[target] || [])
        .map(value => new Date(value))
        .filter(date => date.getTime() > start.getTime())
        .sort((a, b) => a - b)[0];
      return next ? { date: next } : null;
    }
  };
}

test("derives an inferior-planet conjunction anchor and selects the nearest event", () => {
  const result = findNearestConjunctionAnchor({
    astronomy: fakeConjunctionSearch({
      0: ["2026-01-07T00:00:00.000Z"],
      180: ["2026-01-12T00:00:00.000Z"]
    }),
    body: "Venus",
    approximateDate: "2026-01-10T00:00:00.000Z"
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.targetRelativeLongitudeDegrees, 180);
  assert.equal(result.conjunctionUTC, "2026-01-12T00:00:00.000Z");
});

test("uses superior conjunction only for an outer planet", () => {
  const result = findNearestConjunctionAnchor({
    astronomy: fakeConjunctionSearch({
      0: ["2026-01-09T00:00:00.000Z"],
      180: ["2026-01-12T00:00:00.000Z"]
    }),
    body: "Jupiter",
    approximateDate: "2026-01-10T00:00:00.000Z"
  });

  assert.equal(result.targetRelativeLongitudeDegrees, 180);
  assert.equal(result.conjunctionUTC, "2026-01-12T00:00:00.000Z");
});

test("returns ambiguous when inferior and superior conjunctions are equally near", () => {
  const result = findNearestConjunctionAnchor({
    astronomy: fakeConjunctionSearch({
      0: ["2026-01-09T00:00:00.000Z"],
      180: ["2026-01-11T00:00:00.000Z"]
    }),
    body: "Mercury",
    approximateDate: "2026-01-10T00:00:00.000Z"
  });

  assert.equal(result.status, "ambiguous");
  assert.equal(result.conjunctionUTC, null);
});

test("returns no-conjunction when no event is in the allowed window", () => {
  const result = findNearestConjunctionAnchor({
    astronomy: fakeConjunctionSearch({ 180: ["2026-08-01T00:00:00.000Z"] }),
    body: "Saturn",
    approximateDate: "2026-01-10T00:00:00.000Z",
    maxDistanceDays: 30
  });

  assert.equal(result.status, "no-conjunction");
  assert.equal(result.conjunctionUTC, null);
});

