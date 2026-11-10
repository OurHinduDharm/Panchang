import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const [dataset, localDataset] = await Promise.all([
  readFile(new URL("../data/drik-multicity-asta-udaya-2024-2028.json", import.meta.url), "utf8")
    .then(JSON.parse),
  readFile(new URL("../data/drik-pithoragarh-asta-udaya-2021-2027.json", import.meta.url), "utf8")
    .then(JSON.parse)
]);
const CITY_OBSERVERS = {
  "New Delhi, NCT, India": [28.6139, 77.2090, 216],
  "Mumbai, Maharashtra, India": [19.0760, 72.8777, 14],
  "Ujjain, Madhya Pradesh, India": [23.1765, 75.7885, 494],
  "Varanasi, Uttar Pradesh, India": [25.3176, 82.9739, 80],
  "Pithoragarh, Uttarakhand, India": [29.5828, 80.2182, 1650]
};
const TARGET_CITY = "Pithoragarh, Uttarakhand, India";
const targetObserver = new Astronomy.Observer(...CITY_OBSERVERS[TARGET_CITY]);
const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86400000;

function observerFor(city) {
  const coords = CITY_OBSERVERS[city];
  if (!coords) throw new Error("No proxy observer for " + city);
  return new Astronomy.Observer(...coords);
}
function dayNumber(value) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}
function nearestEvent(body, observer, anchor) {
  const start = new Date(anchor.getTime() - 12 * 3600000);
  const events = [1, -1].map(direction => {
    const event = Astronomy.SearchRiseSet(body, observer, direction, start, 1, 0);
    return event?.date ? {
      direction, date: event.date,
      deltaMinutes: Math.abs(event.date.getTime() - anchor.getTime()) / 60000
    } : null;
  }).filter(Boolean).sort((a, b) => a.deltaMinutes - b.deltaMinutes);
  return events[0] && events[0].deltaMinutes <= 10 ? events[0] : null;
}
function sunAltitude(observer, date) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}
function trainingSample(entry, boundaryName) {
  const observer = observerFor(entry.sourceLocation);
  const anchor = new Date(entry.boundaries[boundaryName].normalizedUtcInstant);
  const event = nearestEvent(entry.planet, observer, anchor);
  if (!event) return null;
  const previous = Astronomy.SearchRiseSet(
    entry.planet, observer, event.direction,
    new Date(anchor.getTime() - 36 * 3600000), 1, 0
  );
  if (!previous?.date) return null;
  const magnitude = Astronomy.Illumination(entry.planet, event.date).mag;
  const previousAltitude = sunAltitude(observer, previous.date);
  const currentAltitude = sunAltitude(observer, event.date);
  return {
    apparentMagnitude: magnitude,
    eventDirection: event.direction,
    magnitudeDirectionInteraction: magnitude * event.direction,
    thresholdPrevious: previousAltitude,
    thresholdCurrent: currentAltitude,
    thresholdMidpoint: (previousAltitude + currentAltitude) / 2
  };
}
function solve(matrix, vector) {
  const a = matrix.map((row, i) => [...row, vector[i]]);
  const n = vector.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-10) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const divisor = a[col][col];
    for (let j = col; j <= n; j++) a[col][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = col; j <= n; j++) a[row][j] -= factor * a[col][j];
    }
  }
  return a.map(row => row[n]);
}
function fit(samples, keys, targetKey) {
  const size = keys.length + 1;
  const xtx = Array.from({ length: size }, () => Array(size).fill(0));
  const xty = Array(size).fill(0);
  let count = 0;
  for (const sample of samples) {
    const row = [1, ...keys.map(key => sample[key])];
    if (row.some(value => !Number.isFinite(value)) || !Number.isFinite(sample[targetKey])) continue;
    count++;
    for (let i = 0; i < size; i++) {
      xty[i] += row[i] * sample[targetKey];
      for (let j = 0; j < size; j++) xtx[i][j] += row[i] * row[j];
    }
  }
  if (count < size + 1) return null;
  for (let i = 1; i < size; i++) xtx[i][i] += 1e-7;
  const beta = solve(xtx, xty);
  return beta ? {
    intercept: beta[0],
    coefficients: Object.fromEntries(keys.map((key, index) => [key, beta[index + 1]]))
  } : null;
}
function summarize(values) {
  const errors = values.filter(Number.isFinite);
  return {
    count: errors.length,
    exact: errors.filter(x => x === 0).length,
    withinOneDay: errors.filter(x => Math.abs(x) <= 1).length,
    meanAbsoluteErrorDays: errors.length
      ? Number((errors.reduce((sum, x) => sum + Math.abs(x), 0) / errors.length).toFixed(3))
      : null,
    maxAbsoluteErrorDays: errors.length ? Math.max(...errors.map(Math.abs)) : null
  };
}

const unique = new Map();
const combinedWindows = [
  ...dataset.windows.filter(entry => entry.sourceLocation !== TARGET_CITY),
  ...localDataset.windows
];
for (const entry of combinedWindows) {
  if (entry.acceptanceEligible !== true || entry.sourceStatus !== "direct-page-captured-browser-verified") continue;
  const key = [
    entry.sourceLocation, entry.planet,
    entry.boundaries.astaStart.normalizedLocalDateTime,
    entry.boundaries.astaEnd.normalizedLocalDateTime
  ].join("|");
  if (!unique.has(key)) unique.set(key, entry);
}
const entries = [...unique.values()];
const targetRows = entries.filter(entry => entry.sourceLocation === TARGET_CITY);
const output = [];
const variants = [
  { name: "magnitude-only", keys: ["apparentMagnitude"] },
  { name: "magnitude+event-direction", keys: ["apparentMagnitude", "eventDirection"] },
  { name: "magnitude+direction-interaction", keys: [
    "apparentMagnitude", "eventDirection", "magnitudeDirectionInteraction"
  ] }
];

for (const planet of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
  const planetTargetRows = targetRows.filter(entry => entry.planet === planet);
  const years = [...new Set(planetTargetRows.map(entry => entry.sourcePageYear))].sort();
  for (const holdoutYear of years) {
    const holdouts = planetTargetRows.filter(entry => entry.sourcePageYear === holdoutYear);
    const training = entries.filter(entry =>
      entry.planet === planet &&
      !(entry.sourceLocation === TARGET_CITY && entry.sourcePageYear === holdoutYear)
    );
    const planetVariants = planet === "Mercury" || planet === "Venus"
      ? variants
      : [variants[0]];
    const trainingSamplesByBoundary = {};
    for (const boundaryName of ["astaStart", "astaEnd"]) {
      trainingSamplesByBoundary[boundaryName] = training
        .map(entry => trainingSample(entry, boundaryName)).filter(Boolean);
    }
    for (const targetKey of ["thresholdCurrent", "thresholdMidpoint", "thresholdPrevious"]) {
      for (const variant of planetVariants) {
        const modelByBoundary = {}, trainingCounts = {};
        let ready = true;
        for (const boundaryName of ["astaStart", "astaEnd"]) {
          const samples = trainingSamplesByBoundary[boundaryName];
          trainingCounts[boundaryName] = samples.length;
          modelByBoundary[boundaryName] = fit(samples, variant.keys, targetKey);
          if (!modelByBoundary[boundaryName]) ready = false;
        }
        if (!ready) {
          output.push({
            planet, holdoutYear, model: variant.name, thresholdTarget: targetKey,
            available: false, trainingWindows: training.length,
            holdoutWindows: holdouts.length, trainingCounts
          });
          continue;
        }

        const predictions = [];
        const eventYears = [...new Set(holdouts.map(entry =>
          Number(entry.boundaries.astaStart.normalizedLocalDateTime.slice(0, 4))
        ))].sort();
        for (const eventYear of eventYears) {
          const searchDays = planet === "Mercury" ? 45 : planet === "Mars" ? 90 : 60;
          const candidates = generateVisibilityWindows({
            astronomy: Astronomy, body: planet, observer: targetObserver, modelByBoundary,
            startDate: new Date(Date.UTC(eventYear, 0, 1)),
            endDate: new Date(Date.UTC(eventYear, 11, 31, 23, 59, 59)),
            searchDays, timeZone: TIME_ZONE
          }).filter(window =>
            window.status === "candidate" &&
            window.asta.predictedBoundaryDate?.slice(0, 4) === String(eventYear)
          );
          const used = new Set();
          for (const entry of holdouts.filter(item =>
            Number(item.boundaries.astaStart.normalizedLocalDateTime.slice(0, 4)) === eventYear
          )) {
            const publishedAsta = entry.boundaries.astaStart.normalizedLocalDateTime;
            const ranked = candidates.map((window, index) => ({
              window, index,
              error: dayNumber(window.asta.predictedBoundaryDate) - dayNumber(publishedAsta)
            })).filter(item => !used.has(item.index))
              .sort((a, b) => Math.abs(a.error) - Math.abs(b.error));
            const best = ranked[0];
            if (!best || Math.abs(best.error) > 30) {
              predictions.push({ id: entry.id, matched: false });
              continue;
            }
            used.add(best.index);
            const publishedEnd = entry.boundaries.astaEnd.normalizedLocalDateTime;
            predictions.push({
              id: entry.id, matched: true,
              astaErrorDays: best.error,
              udayaErrorDays: dayNumber(best.window.udaya.predictedBoundaryDate) - dayNumber(publishedEnd)
            });
          }
        }
        const matched = predictions.filter(item => item.matched);
        output.push({
          planet, holdoutYear, model: variant.name, thresholdTarget: targetKey,
          available: true, trainingWindows: training.length, holdoutWindows: holdouts.length,
          trainingCounts, matchedCount: matched.length, unmatchedCount: predictions.length - matched.length,
          astaDate: summarize(matched.map(x => x.astaErrorDays)),
          udayaDate: summarize(matched.map(x => x.udayaErrorDays)),
          predictions
        });
      }
    }
  }
}
console.log(JSON.stringify({
  title: "Pithoragarh city-year holdout: pooled multi-city + local historical calibration",
  method: "For each Pithoragarh source year, exclude that entire city-year from training, but use all other four cities across all verified years plus Pithoragarh's other source years. Compare magnitude-only and event-direction models and three solar-altitude target definitions. Predict only the held-out Pithoragarh year.",
  observerPolicy: "Training samples use explicit proxy observers for New Delhi, Mumbai, Ujjain, Varanasi and Pithoragarh. Held-out predictions use Pithoragarh 29.5828 N, 80.2182 E, 1650 m. Drik provider coordinates remain undisclosed.",
  warning: "Research-only city-year holdout; no held-out city-year sample is used in fitting. One-day date error remains a release failure.",
  acceptedWindows: entries.length,
  output
}, null, 2));
