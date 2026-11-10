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
  "mercury-new-delhi-2027-november-to-2028-january": { astaStart: 1, astaEnd: -1 }
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

console.log(JSON.stringify({
  title: "New Delhi out-of-sample twilight-threshold diagnostic",
  sampleCaseCount: rows.length,
  boundaryCount: rows.reduce((sum, item) => sum + item.boundaries.length, 0),
  pithoragarhVenusThresholdIntervals: PITHORAGARH_VENUS_THRESHOLD,
  planetAndBoundaryThresholdSummary: thresholdSummary,
  interpretation: "Diagnostic only. New Delhi source coordinates are undisclosed; a city-centre proxy is used solely to test day-level threshold transfer. Do not claim coordinate-exact validation or promote this threshold to production.",
  cases: rows
}, null, 2));
