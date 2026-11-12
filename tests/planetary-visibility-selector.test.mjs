import test from "node:test";
import assert from "node:assert/strict";
import { findNearestConjunctionAnchor, findVisibilityBoundaryNearAnchor, generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

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
      return { altitude: ra === 1 ? sunAltitudeAt(dayOffset) : 0.1, azimuth: ra === 1 ? 90 : 100 };
    },
    Illumination() {
      return { mag: 1, phase_fraction: 0.5 };
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
  }), /model must contain finite intercept\/slope/);
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

test("uses solar conjunction at 0 degrees for an outer planet, not opposition", () => {
  const result = findNearestConjunctionAnchor({
    astronomy: fakeConjunctionSearch({
      0: ["2026-01-09T00:00:00.000Z"],
      180: ["2026-01-12T00:00:00.000Z"]
    }),
    body: "Jupiter",
    approximateDate: "2026-01-10T00:00:00.000Z"
  });

  assert.equal(result.targetRelativeLongitudeDegrees, 0);
  assert.equal(result.conjunctionUTC, "2026-01-09T00:00:00.000Z");
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



test("enumerates an inferior-conjunction window without a published boundary anchor", () => {
  const conjunctionDate = new Date("2026-01-10T00:00:00.000Z");
  let activeDirection = 0;
  const astronomy = {
    SearchRelativeLongitude(_body, target, start) {
      if (target !== 0 || start.getTime() >= conjunctionDate.getTime()) return null;
      return { date: conjunctionDate };
    },
    SearchRiseSet(_body, _observer, direction, start) {
      activeDirection = direction;
      return { date: new Date(start.getTime() + 12 * 3600000) };
    },
    Equator(body) {
      return { ra: body === "Sun" ? 1 : 2, dec: 0 };
    },
    Horizon(date, _observer, ra) {
      const dayOffset = (date.getTime() - conjunctionDate.getTime()) / DAY_MS;
      if (ra !== 1) return { altitude: 0.1 };
      return { altitude: activeDirection === -1 ? dayOffset : 5 - dayOffset };
    },
    Illumination() {
      return { mag: 1 };
    }
  };

  const windows = generateVisibilityWindows({
    astronomy,
    body: "Venus",
    observer: { latitude: 28.6139, longitude: 77.209, height: 216 },
    modelByBoundary: {
      astaStart: { intercept: 0, slope: 0 },
      astaEnd: { intercept: 0, slope: 0 }
    },
    startDate: "2026-01-05T00:00:00.000Z",
    endDate: "2026-01-20T00:00:00.000Z",
    searchDays: 10
  });

  assert.equal(windows.length, 1);
  assert.equal(windows[0].conjunctionType, "inferior");
  assert.equal(windows[0].status, "candidate");
  assert.equal(windows[0].asta.direction, "set");
  assert.equal(windows[0].udaya.direction, "rise");
  assert.equal(windows[0].asta.predictedBoundaryDate, "2026-01-10");
  assert.equal(windows[0].udaya.predictedBoundaryDate, "2026-01-15");
});



test("enumerates a superior-conjunction window with reversed inner-planet directions", () => {
  const conjunctionDate = new Date("2026-02-10T00:00:00.000Z");
  let activeDirection = 0;
  const astronomy = {
    SearchRelativeLongitude(_body, target, start) {
      if (target !== 180 || start.getTime() >= conjunctionDate.getTime()) return null;
      return { date: conjunctionDate };
    },
    SearchRiseSet(_body, _observer, direction, start) {
      activeDirection = direction;
      return { date: new Date(start.getTime() + 12 * 3600000) };
    },
    Equator(body) {
      return { ra: body === "Sun" ? 1 : 2, dec: 0 };
    },
    Horizon(date, _observer, ra) {
      const dayOffset = (date.getTime() - conjunctionDate.getTime()) / DAY_MS;
      if (ra !== 1) return { altitude: 0.1 };
      return { altitude: activeDirection === 1 ? dayOffset : 5 - dayOffset };
    },
    Illumination() {
      return { mag: 1 };
    }
  };

  const windows = generateVisibilityWindows({
    astronomy,
    body: "Mercury",
    observer: { latitude: 28.6139, longitude: 77.209, height: 216 },
    modelByBoundary: {
      astaStart: { intercept: 0, slope: 0 },
      astaEnd: { intercept: 0, slope: 0 }
    },
    startDate: "2026-02-05T00:00:00.000Z",
    endDate: "2026-02-20T00:00:00.000Z",
    searchDays: 10
  });

  assert.equal(windows.length, 1);
  assert.equal(windows[0].conjunctionType, "superior");
  assert.equal(windows[0].status, "candidate");
  assert.equal(windows[0].asta.direction, "rise");
  assert.equal(windows[0].udaya.direction, "set");
  assert.equal(windows[0].asta.predictedBoundaryDate, "2026-02-10");
  assert.equal(windows[0].udaya.predictedBoundaryDate, "2026-02-15");
});

test("uses set-to-rise boundaries around an outer-planet solar conjunction", () => {
  const conjunctionDate = new Date("2026-03-10T00:00:00.000Z");
  let activeDirection = 0;
  const astronomy = {
    SearchRelativeLongitude(_body, target, start) {
      if (target !== 0 || start.getTime() >= conjunctionDate.getTime()) return null;
      return { date: conjunctionDate };
    },
    SearchRiseSet(_body, _observer, direction, start) {
      activeDirection = direction;
      return { date: new Date(start.getTime() + 12 * 3600000) };
    },
    Equator(body) {
      return { ra: body === "Sun" ? 1 : 2, dec: 0 };
    },
    Horizon(date, _observer, ra) {
      const dayOffset = (date.getTime() - conjunctionDate.getTime()) / DAY_MS;
      if (ra !== 1) return { altitude: 0.1 };
      return { altitude: activeDirection === -1 ? dayOffset : 5 - dayOffset };
    },
    Illumination() {
      return { mag: 1 };
    }
  };

  const windows = generateVisibilityWindows({
    astronomy,
    body: "Jupiter",
    observer: { latitude: 28.6139, longitude: 77.209, height: 216 },
    modelByBoundary: {
      astaStart: { intercept: 0, slope: 0 },
      astaEnd: { intercept: 0, slope: 0 }
    },
    startDate: "2026-03-05T00:00:00.000Z",
    endDate: "2026-03-20T00:00:00.000Z",
    searchDays: 10
  });

  assert.equal(windows.length, 1);
  assert.equal(windows[0].conjunctionType, "conjunction");
  assert.equal(windows[0].status, "candidate");
  assert.equal(windows[0].asta.direction, "set");
  assert.equal(windows[0].udaya.direction, "rise");
});


test("evaluates elongation and phase coefficients in a multifeature threshold", () => {
  const astronomy = fakeAstronomy(dayOffset => dayOffset);
  astronomy.AngleFromSun = () => 10;
  astronomy.Illumination = () => ({ mag: 1, phase_fraction: 0.5 });
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy,
    model: {
      intercept: 0,
      coefficients: {
        apparentMagnitude: 0,
        elongationDegrees: 0.1,
        illuminatedFraction: 0
      }
    }
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.predictedBoundaryDate, "2026-01-11");
  assert.equal(result.thresholdAltitudeDegrees, 1);
});



test("evaluates local azimuth separation in a multifeature threshold", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: {
      intercept: 0,
      coefficients: {
        azimuthSeparationDegrees: 0.1
      }
    }
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.predictedBoundaryDate, "2026-01-11");
  assert.equal(result.thresholdAltitudeDegrees, 1);
});


function fakeMotionAstronomy(longitudeRateDegPerDay) {
  const astronomy = fakeAstronomy(dayOffset => dayOffset);
  astronomy.GeoVector = (_body, date) => ({ date });
  astronomy.Ecliptic = vector => ({
    elon: 100 + ((vector.date.getTime() - anchorDate.getTime()) / DAY_MS) * longitudeRateDegPerDay
  });
  return astronomy;
}

test("detects geocentric retrograde motion and exposes its longitude rate as a model feature", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeMotionAstronomy(-2),
    model: { intercept: 0, coefficients: { retrograde: 1 } }
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.predictedBoundaryDate, "2026-01-11");
  assert.equal(result.longitudeRateDegPerDay, -2);
  assert.equal(result.retrogradeState, "retrograde");
  assert.equal(result.thresholdAltitudeDegrees, 1);
});

test("detects direct geocentric motion and supports continuous longitude-rate coefficients", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeMotionAstronomy(2),
    model: { intercept: 0, coefficients: { longitudeRateDegPerDay: 0.5 } }
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.predictedBoundaryDate, "2026-01-11");
  assert.equal(result.longitudeRateDegPerDay, 2);
  assert.equal(result.retrogradeState, "direct");
  assert.equal(result.thresholdAltitudeDegrees, 1);
});

test("does not silently substitute direct motion when ephemeris motion vectors are unavailable", () => {
  assert.throws(() => findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { retrograde: 1 } }
  }), /Missing finite visibility feature: retrograde/);
});

test("computes apparent elongation from topocentric equatorial positions when no AngleFromSun API exists", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { elongationDegrees: 1 } }
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.predictedBoundaryDate, "2026-01-25");
  assert.equal(result.thresholdAltitudeDegrees, 15);
});

test("supports local azimuth separation and illuminated fraction as visibility features", () => {
  const azimuthResult = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { azimuthSeparationDegrees: 1 } }
  });
  const phaseResult = findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { illuminatedFraction: 2 } }
  });

  assert.equal(azimuthResult.predictedBoundaryDate, "2026-01-20");
  assert.equal(azimuthResult.thresholdAltitudeDegrees, 10);
  assert.equal(phaseResult.predictedBoundaryDate, "2026-01-11");
  assert.equal(phaseResult.thresholdAltitudeDegrees, 1);
});

test("uses the actual local rise/set direction as an independent visibility feature", () => {
  const rise = findVisibilityBoundaryNearAnchor({
    ...base,
    direction: 1,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { eventDirection: 1 } }
  });
  const set = findVisibilityBoundaryNearAnchor({
    ...base,
    direction: -1,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { eventDirection: 1 } }
  });

  assert.equal(rise.eventDirection, 1);
  assert.equal(rise.thresholdAltitudeDegrees, 1);
  assert.equal(rise.predictedBoundaryDate, "2026-01-11");
  assert.equal(set.eventDirection, -1);
  assert.equal(set.thresholdAltitudeDegrees, -1);
  assert.equal(set.predictedBoundaryDate, "2026-01-09");
});

test("exposes magnitude-direction interaction for event-specific visibility thresholds", () => {
  const rise = findVisibilityBoundaryNearAnchor({
    ...base,
    direction: 1,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { magnitudeDirectionInteraction: 1 } }
  });
  const set = findVisibilityBoundaryNearAnchor({
    ...base,
    direction: -1,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { magnitudeDirectionInteraction: 1 } }
  });

  assert.equal(rise.magnitudeDirectionInteraction, 1);
  assert.equal(rise.thresholdAltitudeDegrees, 1);
  assert.equal(set.magnitudeDirectionInteraction, -1);
  assert.equal(set.thresholdAltitudeDegrees, -1);
});


test("uses conjunction family as an explicit visibility-model feature", () => {
  const result = findVisibilityBoundaryNearAnchor({
    ...base,
    conjunctionType: "superior",
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { conjunctionFamily: 1 } }
  });

  assert.equal(result.status, "candidate");
  assert.equal(result.predictedBoundaryDate, "2026-01-11");
  assert.equal(result.thresholdAltitudeDegrees, 1);
});

test("does not silently substitute a conjunction family when it is unavailable", () => {
  assert.throws(() => findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { conjunctionFamily: 1 } }
  }), /Missing finite visibility feature: conjunctionFamily/);
});


test("does not turn a missing conjunction family into a zero-valued interaction", () => {
  assert.throws(() => findVisibilityBoundaryNearAnchor({
    ...base,
    astronomy: fakeAstronomy(dayOffset => dayOffset),
    model: { intercept: 0, coefficients: { conjunctionFamilyDirectionInteraction: 1 } }
  }), /Missing finite visibility feature: conjunctionFamilyDirectionInteraction/);
});
