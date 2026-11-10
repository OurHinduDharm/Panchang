import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as Astronomy from "astronomy-engine";

const here = dirname(fileURLToPath(import.meta.url));
const dataset = JSON.parse(readFileSync(resolve(here, "../data/asta-udaya-benchmark.json"), "utf8"));
const NEW_DELHI_PROXY = new Astronomy.Observer(28.6139, 77.2090, 216);

const DIRECTIONS = {
  "venus-new-delhi-2023": { astaStart: -1, astaEnd: 1 },
  "venus-new-delhi-2024": { astaStart: 1, astaEnd: -1 },
  "venus-new-delhi-2025-march": { astaStart: -1, astaEnd: 1 },
  "venus-new-delhi-2025-december-to-2026-february": { astaStart: 1, astaEnd: -1 },
  "venus-new-delhi-2026": { astaStart: -1, astaEnd: 1 },
  "venus-new-delhi-2027": { astaStart: 1, astaEnd: -1 },
  "venus-pithoragarh-2025-march": { astaStart: -1, astaEnd: 1 },
  "venus-pithoragarh-2025-december-to-2026-february": { astaStart: 1, astaEnd: -1 }
};

const NEW_DELHI_IDS = [
  "venus-new-delhi-2023",
  "venus-new-delhi-2024",
  "venus-new-delhi-2025-march",
  "venus-new-delhi-2025-december-to-2026-february",
  "venus-new-delhi-2026",
  "venus-new-delhi-2027"
];
const PITHORAGARH_IDS = [
  "venus-pithoragarh-2025-march",
  "venus-pithoragarh-2025-december-to-2026-february"
];

function round(value, digits = 5) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
}

function observerFor(entry) {
  const point = entry.testObserver;
  if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) {
    return new Astronomy.Observer(point.latitude, point.longitude, point.elevationMeters || 0);
  }
  return NEW_DELHI_PROXY;
}

function localPlanetEvent(body, observer, anchor, direction, dayOffset) {
  const start = new Date(anchor.getTime() + dayOffset * 86400000 - 12 * 3600000);
  const result = Astronomy.SearchRiseSet(body, observer, direction, start, 1, 0);
  return result?.date ?? null;
}

function sunAltitude(date, observer) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}

function planetMagnitude(body, date) {
  return Astronomy.Illumination(body, date).mag;
}

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

function boundarySample(entry, boundaryName) {
  const observer = observerFor(entry);
  const direction = DIRECTIONS[entry.id][boundaryName];
  const anchor = new Date(entry.boundaries[boundaryName]);
  const previous = localPlanetEvent(entry.planet, observer, anchor, direction, -1);
  const current = localPlanetEvent(entry.planet, observer, anchor, direction, 0);
  if (!previous || !current) throw new Error("Missing adjacent local rise/set event: " + entry.id + " " + boundaryName);
  const previousSun = sunAltitude(previous, observer);
  const currentSun = sunAltitude(current, observer);
  return {
    id: entry.id,
    boundary: boundaryName,
    year: Number(entry.boundaries[boundaryName].slice(0, 4)),
    observer: entry.testObserver.name,
    sourceLocation: entry.sourceLocation,
    comparisonLevel: entry.comparisonLevel,
    publishedLocal: entry.boundaries[boundaryName],
    direction: direction === 1 ? "rise" : "set",
    previousSunAltitude: previousSun,
    boundarySunAltitude: currentSun,
    thresholdMidpoint: (Math.min(previousSun, currentSun) + Math.max(previousSun, currentSun)) / 2,
    previousMagnitude: planetMagnitude(entry.planet, previous),
    boundaryMagnitude: planetMagnitude(entry.planet, current),
    previousEventUTC: previous.toISOString(),
    boundaryEventUTC: current.toISOString()
  };
}

function fit(samples) {
  const mx = samples.reduce((sum, item) => sum + item.magnitude, 0) / samples.length;
  const my = samples.reduce((sum, item) => sum + item.thresholdMidpoint, 0) / samples.length;
  const denominator = samples.reduce((sum, item) => sum + (item.magnitude - mx) ** 2, 0);
  if (samples.length < 3 || denominator === 0) throw new Error("Insufficient Venus calibration samples");
  const slope = samples.reduce((sum, item) =>
    sum + (item.magnitude - mx) * (item.thresholdMidpoint - my), 0
  ) / denominator;
  return { intercept: my - slope * mx, slope };
}

function predictBoundary(entry, boundaryName, model) {
  const observer = observerFor(entry);
  const direction = DIRECTIONS[entry.id][boundaryName];
  const anchor = new Date(entry.boundaries[boundaryName]);
  const samples = [];
  for (let dayOffset = -20; dayOffset <= 20; dayOffset++) {
    const date = localPlanetEvent(entry.planet, observer, anchor, direction, dayOffset);
    if (!date) continue;
    const sun = sunAltitude(date, observer);
    const magnitude = planetMagnitude(entry.planet, date);
    const threshold = model.intercept + model.slope * magnitude;
    samples.push({
      dayOffset,
      localDate: localDateString(date),
      sunAltitude: sun,
      magnitude,
      threshold,
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
    predictedDate: crossing.current.localDate,
    signedDateOffsetDays: dayNumber(crossing.current.localDate) - dayNumber(publishedDate)
  })).sort((a, b) => Math.abs(a.signedDateOffsetDays) - Math.abs(b.signedDateOffsetDays));
  const best = ranked[0];
  return {
    publishedDate,
    crossingCountWithin40Days: crossings.length,
    predictedDate: best?.predictedDate ?? null,
    signedDateOffsetDays: best?.signedDateOffsetDays ?? null,
    residualBefore: best ? round(best.previous.residual, 5) : null,
    residualAfter: best ? round(best.current.residual, 5) : null
  };
}

const entries = dataset.cases.filter(entry =>
  [...NEW_DELHI_IDS, ...PITHORAGARH_IDS].includes(entry.id)
);
if (entries.length !== NEW_DELHI_IDS.length + PITHORAGARH_IDS.length) {
  throw new Error("Expected all five New Delhi and both Pithoragarh Venus windows");
}

const allSamples = entries.flatMap(entry =>
  ["astaStart", "astaEnd"].map(boundaryName => boundarySample(entry, boundaryName))
);


const newDelhiLeaveOneApparitionOut = [];
for (const heldOutEntry of entries.filter(entry => NEW_DELHI_IDS.includes(entry.id))) {
  for (const boundaryName of ["astaStart", "astaEnd"]) {
    const training = allSamples.filter(sample =>
      NEW_DELHI_IDS.includes(sample.id) &&
      sample.id !== heldOutEntry.id &&
      sample.boundary === boundaryName
    ).map(sample => ({
      magnitude: sample.boundaryMagnitude,
      thresholdMidpoint: sample.thresholdMidpoint,
      id: sample.id
    }));
    const model = fit(training);
    newDelhiLeaveOneApparitionOut.push({
      heldOutCase: heldOutEntry.id,
      boundary: boundaryName,
      trainingCount: training.length,
      trainingCases: [...new Set(training.map(item => item.id))],
      prediction: predictBoundary(heldOutEntry, boundaryName, model)
    });
  }
}

const holdouts = [];
for (const pithoragarhId of PITHORAGARH_IDS) {
  const pithoragarhEntry = entries.find(entry => entry.id === pithoragarhId);
  const sameApparitionNewDelhiId = pithoragarhId === "venus-pithoragarh-2025-march"
    ? "venus-new-delhi-2025-march"
    : "venus-new-delhi-2025-december-to-2026-february";

  for (const boundaryName of ["astaStart", "astaEnd"]) {
    const training = allSamples.filter(sample =>
      NEW_DELHI_IDS.includes(sample.id) &&
      sample.id !== sameApparitionNewDelhiId &&
      sample.boundary === boundaryName
    ).map(sample => ({
      magnitude: sample.boundaryMagnitude,
      thresholdMidpoint: sample.thresholdMidpoint,
      id: sample.id
    }));
    const model = fit(training);
    holdouts.push({
      pithoragarhCase: pithoragarhId,
      boundary: boundaryName,
      trainingCases: [...new Set(training.map(item => item.id))],
      trainingCount: training.length,
      model: { intercept: round(model.intercept, 6), slope: round(model.slope, 6) },
      prediction: predictBoundary(pithoragarhEntry, boundaryName, model)
    });
  }
}

console.log(JSON.stringify({
  title: "Venus cross-location and cross-apparition threshold holdout",
  trainingLocation: "New Delhi, India (city-centre proxy; provider coordinates undisclosed)",
  holdoutLocation: "Pithoragarh, Uttarakhand, India (project observer 29.5828 N, 80.2182 E, 1650 m)",
  excludedSameApparition: true,
  trainingAndHoldoutSampleCount: allSamples.length,
  interpretation: "Research-only diagnostic. New Delhi training cases from the same apparition as each Pithoragarh holdout are excluded to avoid same-apparition leakage. Pithoragarh provider coordinates remain undisclosed, so this is city-label validation, not exact observer equivalence. Do not promote coefficients to production.",
  newDelhiLeaveOneApparitionOut,
  holdouts
}, null, 2));
