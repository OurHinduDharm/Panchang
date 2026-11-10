import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as Astronomy from "astronomy-engine";

const here = dirname(fileURLToPath(import.meta.url));
const dataset = JSON.parse(readFileSync(resolve(here, "../data/asta-udaya-benchmark.json"), "utf8"));

// Explicit city-centre diagnostic proxy only. The source providers do not
// publish their internal observer coordinates; this is not coordinate-exact.
const observer = new Astronomy.Observer(28.6139, 77.2090, 216);
const SOURCE_CASES = {
  "venus-new-delhi-2026": { astaStart: -1, astaEnd: 1 },
  "venus-new-delhi-2027": { astaStart: 1, astaEnd: -1 },
  "jupiter-new-delhi-2027": { astaStart: -1, astaEnd: 1 },
  "saturn-new-delhi-2027": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2026-december-to-2027-january": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2027-february": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2027-april-to-may": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2027-june-to-july": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2027-august": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2027-october": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2027-november-to-2028-january": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2026-january-february": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2026-march": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2026-april-may": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2026-june-july": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2026-august-september": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2026-october-november": { astaStart: -1, astaEnd: 1 },
  "mars-new-delhi-2026": { astaStart: -1, astaEnd: 1 },
  "venus-new-delhi-2025-december-to-2026-february": { astaStart: 1, astaEnd: -1 },
  "jupiter-new-delhi-2026": { astaStart: -1, astaEnd: 1 },
  "saturn-new-delhi-2026": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2025-january-february": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2025-march-april": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2025-may-june": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2025-july-august": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2025-september-october": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2025-november": { astaStart: -1, astaEnd: 1 },
  "venus-new-delhi-2025-march": { astaStart: -1, astaEnd: 1 },
  "jupiter-new-delhi-2025": { astaStart: -1, astaEnd: 1 },
  "saturn-new-delhi-2025": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2024-february-march": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2024-april-may": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2024-june": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2024-august": { astaStart: -1, astaEnd: 1 },
  "mercury-new-delhi-2024-september-october": { astaStart: 1, astaEnd: -1 },
  "mercury-new-delhi-2024-november-december": { astaStart: -1, astaEnd: 1 },
  "venus-new-delhi-2024": { astaStart: 1, astaEnd: -1 },
  "saturn-new-delhi-2024": { astaStart: -1, astaEnd: 1 }
};

// Derived only from the four indexed Pithoragarh Venus 2025 transitions.
// This is a held-out diagnostic range, not an accepted universal threshold.
const PITHORAGARH_VENUS_THRESHOLD = {
  refracted: { lower: -5.85697, upper: -5.82432 },
  geometric: { lower: -6.46385, upper: -6.43144 }
};

function round(value, digits = 5) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
}

function sunAltitude(date, refraction) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, refraction).altitude;
}

function localPlanetEvent(body, anchor, direction, dayOffset) {
  const start = new Date(anchor.getTime() + dayOffset * 86400000 - 12 * 3600000);
  const result = Astronomy.SearchRiseSet(body, observer, direction, start, 1, 0);
  return result?.date ?? null;
}

function planetObservables(body, date) {
  const eq = Astronomy.Equator(body, date, observer, true, true);
  const illumination = Astronomy.Illumination(body, date);
  return {
    planetAltitudeDegrees: round(Astronomy.Horizon(date, observer, eq.ra, eq.dec, "normal").altitude),
    apparentElongationDegrees: round(Astronomy.AngleFromSun(body, date)),
    apparentMagnitude: round(illumination.mag, 4),
    illuminatedFraction: round(illumination.phase_fraction, 6)
  };
}

function intersects(a, b) {
  return Math.max(a.lower, b.lower) < Math.min(a.upper, b.upper);
}

const rows = [];
for (const [id, directions] of Object.entries(SOURCE_CASES)) {
  const entry = dataset.cases.find(item => item.id === id);
  if (!entry || entry.status === "user-transcribed-reference-not-independently-page-verified") {
    throw new Error("Missing independently sourced New Delhi case: " + id);
  }
  if (entry.sourceObserver?.coordinates !== null) {
    throw new Error("Source observer provenance changed; review proxy comparison");
  }

  const caseRows = [];
  for (const boundary of ["astaStart", "astaEnd"]) {
    const published = new Date(entry.boundaries[boundary]);
    const direction = directions[boundary];
    const previous = localPlanetEvent(entry.planet, published, direction, -1);
    const current = localPlanetEvent(entry.planet, published, direction, 0);
    if (!previous || !current) throw new Error("Missing local event for " + id + " " + boundary);

    const previousRefracted = sunAltitude(previous, "normal");
    const currentRefracted = sunAltitude(current, "normal");
    const previousGeometric = sunAltitude(previous, false);
    const currentGeometric = sunAltitude(current, false);
    const previousPlanet = planetObservables(entry.planet, previous);
    const currentPlanet = planetObservables(entry.planet, current);
    const interval = (a, b) => ({ lower: Math.min(a, b), upper: Math.max(a, b) });
    const refractedInterval = interval(previousRefracted, currentRefracted);
    const geometricInterval = interval(previousGeometric, currentGeometric);
    const signedDifferenceMinutes = (current.getTime() - published.getTime()) / 60000;

    caseRows.push({
      boundary,
      expectedEvent: direction === 1 ? "rise" : "set",
      publishedLocal: entry.boundaries[boundary],
      proxyLocalEventUTC: current.toISOString(),
      proxyEventSignedDifferenceMinutes: round(signedDifferenceMinutes, 2),
      previousEventSunAltitudeRefracted: round(previousRefracted),
      boundaryEventSunAltitudeRefracted: round(currentRefracted),
      previousEventSunAltitudeGeometric: round(previousGeometric),
      boundaryEventSunAltitudeGeometric: round(currentGeometric),
      previousPlanetObservables: previousPlanet,
      boundaryPlanetObservables: currentPlanet,
      refractedTransitionInterval: {
        lower: round(refractedInterval.lower),
        upper: round(refractedInterval.upper),
        overlapsPithoragarhVenusRange: intersects(refractedInterval, PITHORAGARH_VENUS_THRESHOLD.refracted)
      },
      geometricTransitionInterval: {
        lower: round(geometricInterval.lower),
        upper: round(geometricInterval.upper),
        overlapsPithoragarhVenusRange: intersects(geometricInterval, PITHORAGARH_VENUS_THRESHOLD.geometric)
      }
    });
  }

  rows.push({
    id,
    planet: entry.planet,
    sourceLocation: entry.sourceLocation,
    source: entry.sourceId,
    comparisonLevel: entry.comparisonLevel,
    observerProxy: { latitude: observer.latitude, longitude: observer.longitude, elevationMeters: observer.height },
    boundaries: caseRows
  });
}

const thresholdGroups = {};
for (const item of rows) {
  for (const boundary of item.boundaries) {
    const key = item.planet + ":" + boundary.boundary;
    const interval = boundary.refractedTransitionInterval;
    (thresholdGroups[key] ??= []).push({
      caseId: item.id,
      lower: interval.lower,
      upper: interval.upper,
      apparentMagnitude: boundary.boundaryPlanetObservables.apparentMagnitude,
      elongation: boundary.boundaryPlanetObservables.apparentElongationDegrees,
      phase: boundary.boundaryPlanetObservables.illuminatedFraction
    });
  }
}
const thresholdSummary = Object.fromEntries(
  Object.entries(thresholdGroups).map(([key, samples]) => {
    const lower = Math.max(...samples.map(item => item.lower));
    const upper = Math.min(...samples.map(item => item.upper));
    const magnitudes = samples.map(item => item.apparentMagnitude);
    const elongations = samples.map(item => item.elongation);
    return [key, {
      sampleCount: samples.length,
      commonInterval: lower < upper ? { lowerExclusive: round(lower), upperInclusive: round(upper) } : null,
      intersectionWidthDegrees: round(upper - lower, 5),
      apparentMagnitudeRange: [Math.min(...magnitudes), Math.max(...magnitudes)],
      elongationRangeDegrees: [Math.min(...elongations), Math.max(...elongations)],
      samples
    }];
  })
);


function fitMagnitudeThreshold(samples) {
  const meanMagnitude = samples.reduce((sum, item) => sum + item.magnitude, 0) / samples.length;
  const meanAltitude = samples.reduce((sum, item) => sum + item.thresholdMidpoint, 0) / samples.length;
  const denominator = samples.reduce((sum, item) => sum + (item.magnitude - meanMagnitude) ** 2, 0);
  if (!denominator) throw new Error("Cannot fit magnitude threshold with zero magnitude variance");
  const slope = samples.reduce((sum, item) =>
    sum + (item.magnitude - meanMagnitude) * (item.thresholdMidpoint - meanAltitude), 0
  ) / denominator;
  return { intercept: meanAltitude - slope * meanMagnitude, slope };
}

function evaluateMagnitudeHoldout(train, test) {
  if (train.length < 4 || test.length < 4) {
    return { available: false, reason: "At least four independent windows per year are required" };
  }
  const model = fitMagnitudeThreshold(train);
  const baseline = train.reduce((sum, item) => sum + item.thresholdMidpoint, 0) / train.length;
  const errors = test.map(item => ({
    id: item.id,
    actualThresholdMidpoint: round(item.thresholdMidpoint, 5),
    predictedThresholdMidpoint: round(model.intercept + model.slope * item.magnitude, 5),
    apparentMagnitude: item.magnitude,
    absoluteErrorDegrees: round(Math.abs(model.intercept + model.slope * item.magnitude - item.thresholdMidpoint), 5),
    constantBaselineAbsoluteErrorDegrees: round(Math.abs(baseline - item.thresholdMidpoint), 5)
  }));
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    available: true,
    trainCount: train.length,
    testCount: test.length,
    model: { intercept: round(model.intercept, 6), slopeDegreesPerMagnitude: round(model.slope, 6) },
    testMaeDegrees: round(mean(errors.map(item => item.absoluteErrorDegrees)), 5),
    constantBaselineMaeDegrees: round(mean(errors.map(item => item.constantBaselineAbsoluteErrorDegrees)), 5),
    maxAbsoluteErrorDegrees: round(Math.max(...errors.map(item => item.absoluteErrorDegrees)), 5),
    errors
  };
}



const localRiseSetClockSummary = (() => {
  const samples = rows.flatMap(item => item.boundaries.map(boundary => ({
    planet: item.planet,
    caseId: item.id,
    boundary: boundary.boundary,
    signedDifferenceMinutes: boundary.proxyEventSignedDifferenceMinutes
  })));
  const meanAbs = items => items.reduce((sum, item) => sum + Math.abs(item.signedDifferenceMinutes), 0) / items.length;
  return {
    sampleCount: samples.length,
    meanAbsoluteDifferenceMinutes: round(meanAbs(samples), 4),
    maxAbsoluteDifferenceMinutes: round(Math.max(...samples.map(item => Math.abs(item.signedDifferenceMinutes))), 4),
    signedDifferenceRangeMinutes: [
      round(Math.min(...samples.map(item => item.signedDifferenceMinutes)), 4),
      round(Math.max(...samples.map(item => item.signedDifferenceMinutes)), 4)
    ],
    byPlanet: Object.fromEntries(
      [...new Set(samples.map(item => item.planet))].map(planet => {
        const items = samples.filter(item => item.planet === planet);
        return [planet, {
          count: items.length,
          meanAbsoluteDifferenceMinutes: round(meanAbs(items), 4),
          maxAbsoluteDifferenceMinutes: round(Math.max(...items.map(item => Math.abs(item.signedDifferenceMinutes))), 4)
        }];
      })
    )
  };
})();

const planetLeaveOneOutCrossValidation = Object.fromEntries(
  ["astaStart", "astaEnd"].map(boundaryName => {
    const samples = Object.entries(thresholdGroups)
      .filter(([key]) => key.endsWith(":" + boundaryName))
      .flatMap(([key, group]) => {
        const planet = key.split(":")[0];
        return group.map(item => ({
          planet,
          id: item.caseId,
          magnitude: item.apparentMagnitude,
          thresholdMidpoint: (item.lower + item.upper) / 2
        }));
      });
    return [boundaryName, Object.fromEntries(
      [...new Set(samples.map(item => item.planet))].map(heldOutPlanet => {
        const train = samples.filter(item => item.planet !== heldOutPlanet);
        const test = samples.filter(item => item.planet === heldOutPlanet);
        const model = fitMagnitudeThreshold(train);
        const baseline = train.reduce((sum, item) => sum + item.thresholdMidpoint, 0) / train.length;
        const errors = test.map(item => ({
          absoluteError: Math.abs(model.intercept + model.slope * item.magnitude - item.thresholdMidpoint),
          baselineAbsoluteError: Math.abs(baseline - item.thresholdMidpoint)
        }));
        const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
        return [heldOutPlanet, {
          trainCount: train.length,
          testCount: test.length,
          testMaeDegrees: round(mean(errors.map(item => item.absoluteError)), 5),
          constantBaselineMaeDegrees: round(mean(errors.map(item => item.baselineAbsoluteError)), 5),
          maxAbsoluteErrorDegrees: round(Math.max(...errors.map(item => item.absoluteError)), 5)
        }];
      })
    )];
  })
);

const mercuryMagnitudeCrossValidation = Object.fromEntries(
  ["astaStart", "astaEnd"].map(boundaryName => {
    const samples = rows
      .filter(item => item.planet === "Mercury")
      .flatMap(item => item.boundaries
        .filter(boundary => boundary.boundary === boundaryName)
        .map(boundary => ({
          id: item.id,
          year: Number(boundary.publishedLocal.slice(0, 4)),
          magnitude: boundary.boundaryPlanetObservables.apparentMagnitude,
          thresholdMidpoint: (boundary.refractedTransitionInterval.lower + boundary.refractedTransitionInterval.upper) / 2
        }))
      );
    const years = [2024, 2025, 2026, 2027];
    const yearPairs = {};
    for (const trainYear of years) {
      for (const testYear of years) {
        if (trainYear === testYear) continue;
        yearPairs[trainYear + "To" + testYear] = evaluateMagnitudeHoldout(
          samples.filter(item => item.year === trainYear),
          samples.filter(item => item.year === testYear)
        );
      }
    }
    return [boundaryName, {
      totalSamples: samples.length,
      yearPairs
    }];
  })
);


function localDateString(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return values.year + "-" + values.month + "-" + values.day;
}

function dayNumber(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function predictMercuryBoundaryDate(entry, boundaryName, direction, model) {
  const anchor = new Date(entry.boundaries[boundaryName]);
  const samples = [];
  for (let dayOffset = -20; dayOffset <= 20; dayOffset++) {
    const eventDate = localPlanetEvent(entry.planet, anchor, direction, dayOffset);
    if (!eventDate) continue;
    const sun = sunAltitude(eventDate, "normal");
    const planet = planetObservables(entry.planet, eventDate);
    const threshold = model.intercept + model.slope * planet.apparentMagnitude;
    samples.push({
      dayOffset,
      localDate: localDateString(eventDate),
      eventUTC: eventDate.toISOString(),
      sunAltitude: sun,
      apparentMagnitude: planet.apparentMagnitude,
      predictedThreshold: threshold,
      residual: sun - threshold
    });
  }
  samples.sort((a, b) => a.dayOffset - b.dayOffset);

  const crossings = [];
  for (let i = 1; i < samples.length; i++) {
    const previous = samples[i - 1];
    const current = samples[i];
    const crossed = boundaryName === "astaStart"
      ? previous.residual < 0 && current.residual >= 0
      : previous.residual > 0 && current.residual <= 0;
    if (crossed) crossings.push({ previous, current });
  }

  const publishedDate = entry.boundaries[boundaryName].slice(0, 10);
  const ranked = crossings.map(crossing => ({
    ...crossing,
    predictedBoundaryDate: crossing.current.localDate,
    signedDateOffsetDays: dayNumber(crossing.current.localDate) - dayNumber(publishedDate)
  })).sort((a, b) => Math.abs(a.signedDateOffsetDays) - Math.abs(b.signedDateOffsetDays));

  return {
    publishedDate,
    crossingCountWithin40Days: crossings.length,
    nearestCrossing: ranked[0] ? {
      predictedBoundaryDate: ranked[0].predictedBoundaryDate,
      signedDateOffsetDays: ranked[0].signedDateOffsetDays,
      previousResidual: round(ranked[0].previous.residual, 5),
      boundaryResidual: round(ranked[0].current.residual, 5),
      previousEventDate: ranked[0].previous.localDate,
      boundaryEventDate: ranked[0].current.localDate
    } : null
  };
}

const mercuryBoundaryDateHoldouts = Object.fromEntries(
  ["astaStart", "astaEnd"].map(boundaryName => {
    const samples = rows
      .filter(item => item.planet === "Mercury")
      .flatMap(item => item.boundaries
        .filter(boundary => boundary.boundary === boundaryName)
        .map(boundary => ({
          entry: dataset.cases.find(candidate => candidate.id === item.id),
          id: item.id,
          year: Number(boundary.publishedLocal.slice(0, 4)),
          magnitude: boundary.boundaryPlanetObservables.apparentMagnitude,
          thresholdMidpoint: (boundary.refractedTransitionInterval.lower + boundary.refractedTransitionInterval.upper) / 2
        }))
      );
    const years = [2024, 2025, 2026, 2027];
    const testYear = (train, test) => {
      if (train.length < 4 || test.length < 4) return { available: false };
      const model = fitMagnitudeThreshold(train);
      return {
        trainCount: train.length,
        testCount: test.length,
        model: { intercept: round(model.intercept, 6), slope: round(model.slope, 6) },
        predictions: test.map(sample => ({
          id: sample.id,
          ...predictMercuryBoundaryDate(
            sample.entry,
            boundaryName,
            SOURCE_CASES[sample.id][boundaryName],
            model
          )
        }))
      };
    };
    const yearPairs = {};
    for (const trainYear of years) {
      for (const testYearNumber of years) {
        if (trainYear === testYearNumber) continue;
        yearPairs[trainYear + "To" + testYearNumber] = testYear(
          samples.filter(item => item.year === trainYear),
          samples.filter(item => item.year === testYearNumber)
        );
      }
    }
    return [boundaryName, { yearPairs }];
  })
);

console.log(JSON.stringify({
  title: "New Delhi out-of-sample twilight-threshold diagnostic",
  sampleCaseCount: rows.length,
  boundaryCount: rows.reduce((sum, item) => sum + item.boundaries.length, 0),
  pithoragarhVenusThresholdIntervals: PITHORAGARH_VENUS_THRESHOLD,
  localRiseSetClockSummary,
  planetAndBoundaryThresholdSummary: thresholdSummary,
  mercuryMagnitudeCrossValidation,
  planetLeaveOneOutCrossValidation,
  mercuryBoundaryDateHoldouts,
  interpretation: "Diagnostic only. New Delhi source coordinates are undisclosed; a city-centre proxy is used solely to test day-level threshold transfer. Do not claim coordinate-exact validation or promote this threshold to production.",
  cases: rows
}, null, 2));
