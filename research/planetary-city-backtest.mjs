/**
 * Same-location back-test of the city heliacal candidate model against
 * directly captured Pithoragarh Guru/Shukra source boundaries.
 *
 * Usage: node research/planetary-city-backtest.mjs [--output file.json]
 * This is a diagnostic only. It never changes accepted/public datasets.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Astronomy from "astronomy-engine";
import {
  calculateCityHeliacalCandidates
} from "../planetary-city-heliacal-engine.mjs";
import {
  getPlanetVisibilitySample
} from "../planetary-heliacal-ephemeris.mjs";
import {
  scanPlanetHorizonEvents,
  findHorizonTwilightThresholdCrossings,
  calculateCityAstaUdayaCandidates
} from "../planetary-city-horizon-threshold.mjs";
import {
  findPlanetConjunctions,
  associateCandidatesWithConjunctions,
  pairCandidatesAroundConjunctions
} from "./planetary-conjunction-association.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = path.join(ROOT, "data/drik-planetary-reference-2024-2027.json");
const PROFILE = Object.freeze({
  latitude: 29.5828,
  longitude: 80.2182,
  height: 1650
});
const observer = new Astronomy.Observer(
  PROFILE.latitude, PROFILE.longitude, PROFILE.height
);
const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const CALIBRATION_PATH = path.join(ROOT, "research/pithoragarh-horizon-thresholds-2021-2025.json");
const calibration = JSON.parse(fs.readFileSync(CALIBRATION_PATH, "utf8"));
const sourceRows = data.windows.filter(row =>
  row.acceptanceEligible === true &&
  row.sourceLocation?.includes("Pithoragarh") &&
  ["Jupiter", "Venus"].includes(row.planet)
);

function nearestHorizonEvent(planet, referenceMs) {
  const body = Astronomy.Body[planet];
  const searchStart = new Date(referenceMs - 12 * 60 * 60_000);
  const rise = Astronomy.SearchRiseSet(body, observer, +1, searchStart, 1.5);
  const set = Astronomy.SearchRiseSet(body, observer, -1, searchStart, 1.5);
  const options = [
    rise?.date ? { type: "rise", instant: rise.date.toISOString() } : null,
    set?.date ? { type: "set", instant: set.date.toISOString() } : null
  ].filter(Boolean).map(event => ({
    ...event,
    errorMinutes: (Date.parse(event.instant) - referenceMs) / 60_000
  }));
  options.sort((a, b) => Math.abs(a.errorMinutes) - Math.abs(b.errorMinutes));
  return options[0] || null;
}

function nearestCandidate(candidates, expectedType, referenceMs) {
  const matching = candidates
    .filter(candidate => candidate.type === expectedType)
    .map(candidate => ({
      ...candidate,
      errorMinutes: (Date.parse(candidate.instant) - referenceMs) / 60_000
    }))
    .sort((a, b) => Math.abs(a.errorMinutes) - Math.abs(b.errorMinutes));
  return matching[0] || null;
}

const results = [];
for (const row of sourceRows) {
  for (const [boundaryName, expectedType] of [
    ["astaStart", "asta-candidate"],
    ["astaEnd", "udaya-candidate"]
  ]) {
    const boundary = row.boundaries?.[boundaryName];
    if (!boundary?.normalizedUtcInstant) continue;
    const referenceMs = Date.parse(boundary.normalizedUtcInstant);
    const start = new Date(referenceMs - 36 * 60 * 60_000);
    const end = new Date(referenceMs + 36 * 60 * 60_000);
    const calculated = calculateCityHeliacalCandidates({
      astronomy: Astronomy,
      planet: row.planet,
      observer,
      start,
      end,
      stepMinutes: 2,
      refineSeconds: 15
    });
    const nearest = nearestCandidate(calculated.candidates, expectedType, referenceMs);
    const nearestHorizon = nearestHorizonEvent(row.planet, referenceMs);
    const atSource = getPlanetVisibilitySample({
      astronomy: Astronomy,
      planet: row.planet,
      observer,
      instant: boundary.normalizedUtcInstant
    });
    results.push({
      sourceWindowId: row.id,
      planet: row.planet,
      sourceYear: row.sourcePageYear,
      boundary: boundaryName,
      expectedTransition: expectedType,
      sourceLocalDateTime: boundary.normalizedLocalDateTime,
      sourceUtcInstant: boundary.normalizedUtcInstant,
      nearestHorizonEvent: nearestHorizon,
      sourceGeometry: {
        planetAltitudeDeg: atSource.objectAltitudeDeg,
        sunAltitudeDeg: atSource.sunAltitudeDeg,
        sunDepressionDeg: -atSource.sunAltitudeDeg,
        planetAzimuthDeg: atSource.objectAzimuthDeg,
        sunAzimuthDeg: atSource.sunAzimuthDeg,
        apparentMagnitude: atSource.apparentMagnitude,
        modelVisibility: atSource.visibility.visible,
        visibilityMargin: atSource.visibility.visibilityMargin ?? null,
        visibilityReason: atSource.visibility.reason
      },
      nearestModelCandidate: nearest,
      allNearbyCandidates: calculated.candidates,
      horizonWithin1Minute: nearestHorizon ? Math.abs(nearestHorizon.errorMinutes) <= 1 : false,
      horizonWithin5Minutes: nearestHorizon ? Math.abs(nearestHorizon.errorMinutes) <= 5 : false,
      within15Minutes: nearest ? Math.abs(nearest.errorMinutes) <= 15 : false,
      within1Hour: nearest ? Math.abs(nearest.errorMinutes) <= 60 : false,
      within1Day: nearest ? Math.abs(nearest.errorMinutes) <= 1440 : false
    });
  }
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

const trainingThresholds = {};
for (const planet of ["Jupiter", "Venus"]) {
  for (const boundary of ["astaStart", "astaEnd"]) {
    for (const eventType of ["rise", "set"]) {
      const values = results
        .filter(row => row.planet === planet && row.boundary === boundary &&
          row.sourceYear <= 2025 && row.nearestHorizonEvent?.type === eventType)
        .map(row => row.sourceGeometry.sunDepressionDeg);
      if (values.length) {
        trainingThresholds[planet + ":" + boundary + ":" + eventType] = {
          sampleCount: values.length,
          thresholdDepressionDeg: median(values)
        };
      }
    }
  }
}

const holdoutHorizonSeries = {};
for (const planet of ["Jupiter", "Venus"]) {
  holdoutHorizonSeries[planet] = scanPlanetHorizonEvents({
    astronomy: Astronomy,
    planet,
    observer,
    start: "2026-01-01T00:00:00.000Z",
    end: "2028-01-01T00:00:00.000Z"
  });
}

const thresholdPredictions = results
  .filter(row => row.sourceYear >= 2026)
  .map(row => {
    const prefix = row.planet + ":" + row.boundary + ":";
    const candidates = Object.entries(trainingThresholds)
      .filter(([key]) => key.startsWith(prefix))
      .flatMap(([key, value]) => findHorizonTwilightThresholdCrossings({
        horizonSeries: holdoutHorizonSeries[row.planet],
        thresholdDepressionDeg: value.thresholdDepressionDeg,
        eventType: key.slice(prefix.length)
      }).map(candidate => ({
        ...candidate,
        trainingThresholdDepressionDeg: value.thresholdDepressionDeg,
        trainingSampleCount: value.sampleCount
      })));
    const referenceMs = Date.parse(row.sourceUtcInstant);
    const nearest = candidates
      .map(candidate => ({
        ...candidate,
        errorMinutes: (Date.parse(candidate.instant) - referenceMs) / 60_000
      }))
      .sort((a, b) => Math.abs(a.errorMinutes) - Math.abs(b.errorMinutes))[0] || null;
    return {
      sourceWindowId: row.sourceWindowId,
      planet: row.planet,
      sourceYear: row.sourceYear,
      boundary: row.boundary,
      nearestThresholdPrediction: nearest,
      within15Minutes: nearest ? Math.abs(nearest.errorMinutes) <= 15 : false,
      within1Hour: nearest ? Math.abs(nearest.errorMinutes) <= 60 : false,
      within1Day: nearest ? Math.abs(nearest.errorMinutes) <= 1440 : false,
      within3Days: nearest ? Math.abs(nearest.errorMinutes) <= 4320 : false
    };
  });

function getSameCityDurationReference(planet) {
  const durations = sourceRows
    .filter(row => row.planet === planet && row.sourceLocation === "Pithoragarh, Uttarakhand, India")
    .map(row => {
      const start = Date.parse(row.boundaries?.astaStart?.normalizedUtcInstant);
      const end = Date.parse(row.boundaries?.astaEnd?.normalizedUtcInstant);
      return Number.isFinite(start) && Number.isFinite(end) && end > start
        ? { days: (end - start) / 86_400_000, year: row.sourcePageYear }
        : null;
    })
    .filter(Boolean);
  if (!durations.length) return null;
  return {
    planet,
    minDays: Number(Math.min(...durations.map(row => row.days)).toFixed(3)),
    maxDays: Number(Math.max(...durations.map(row => row.days)).toFixed(3)),
    sampleCount: durations.length,
    years: [...new Set(durations.map(row => row.year))].sort((a, b) => a - b),
    location: "Pithoragarh, Uttarakhand, India",
    sourceDataset: "data/drik-planetary-reference-2024-2027.json",
    comparisonLevel: "city-label-only"
  };
}

const futureCandidates2028To2030 = ["Jupiter", "Venus"].map(planet => {
  const raw = calculateCityAstaUdayaCandidates({
    astronomy: Astronomy,
    planet,
    observer,
    start: "2028-01-01T00:00:00.000Z",
    end: "2031-01-01T00:00:00.000Z",
    thresholds: calibration.thresholdsDeg[planet]
  });
  const conjunctions = findPlanetConjunctions({
    astronomy: Astronomy, planet,
    start: "2027-01-01T00:00:00.000Z",
    end: "2031-01-01T00:00:00.000Z"
  });
  const annotatedCandidates = associateCandidatesWithConjunctions({
    candidates: raw.candidates, conjunctions, maxDistanceDays: 180
  });
  const pairing = pairCandidatesAroundConjunctions({
    planet,
    candidates: raw.candidates,
    conjunctions,
    maxDistanceDays: 90,
    durationReference: getSameCityDurationReference(planet)
  });
  return {
    ...raw,
    conjunctions,
    candidates: annotatedCandidates,
    conjunctionPairing: pairing,
    interpretation: "Strict conjunction-side and horizon-event direction pairing is research-only; windows are not publication-approved."
  };
});

const errors = results
  .map(row => row.nearestModelCandidate?.errorMinutes)
  .filter(Number.isFinite)
  .map(Math.abs)
  .sort((a, b) => a - b);
const medianAbsoluteError = errors.length
  ? (errors.length % 2
      ? errors[(errors.length - 1) / 2]
      : (errors[errors.length / 2 - 1] + errors[errors.length / 2]) / 2)
  : null;
const report = {
  reportVersion: 1,
  model: "city-topocentric-schaefer-heliacal-candidate-v1",
  sourceDataset: "data/drik-planetary-reference-2024-2027.json",
  sourceScope: "directly captured Pithoragarh Jupiter/Venus reference boundaries",
  futureCandidateRange: "2028-2030",
  futureCandidates2028To2030,
  observer: PROFILE,
  timezoneForSourceDisplay: "Asia/Kolkata",
  records: results.length,
  horizonThresholdTrainingYears: "2021-2025",
  horizonThresholdHoldoutYears: "2026-2027",
  trainingThresholds,
  thresholdHoldout: {
    records: thresholdPredictions.length,
    matched: thresholdPredictions.filter(row => row.nearestThresholdPrediction).length,
    within15Minutes: thresholdPredictions.filter(row => row.within15Minutes).length,
    within1Hour: thresholdPredictions.filter(row => row.within1Hour).length,
    within1Day: thresholdPredictions.filter(row => row.within1Day).length,
    within3Days: thresholdPredictions.filter(row => row.within3Days).length,
    predictions: thresholdPredictions
  },
  matchedBoundaries: results.filter(row => row.nearestModelCandidate).length,
  nearestHorizonEventsFound: results.filter(row => row.nearestHorizonEvent).length,
  horizonWithin1Minute: results.filter(row => row.horizonWithin1Minute).length,
  horizonWithin5Minutes: results.filter(row => row.horizonWithin5Minutes).length,
  horizonEventDirections: {
    rise: results.filter(row => row.nearestHorizonEvent?.type === "rise").length,
    set: results.filter(row => row.nearestHorizonEvent?.type === "set").length
  },
  within15Minutes: results.filter(row => row.within15Minutes).length,
  within1Hour: results.filter(row => row.within1Hour).length,
  within1Day: results.filter(row => row.within1Day).length,
  medianAbsoluteErrorMinutes: medianAbsoluteError,
  maxAbsoluteErrorMinutes: errors.length ? errors.at(-1) : null,
  publicationEligible: false,
  interpretation: "Schaefer visibility and nearest geometric horizon crossings are separate diagnostics. Horizon-event agreement does not by itself prove the heliacal classification or date-generation rule. No candidate is approved for public display.",
  results
};

const outputArg = process.argv.indexOf("--output");
if (outputArg >= 0 && process.argv[outputArg + 1]) {
  fs.writeFileSync(process.argv[outputArg + 1], JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
