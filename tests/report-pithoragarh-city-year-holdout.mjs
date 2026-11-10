import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const dataset = JSON.parse(await readFile(
  new URL("../data/drik-multicity-asta-udaya-2021-2027.json", import.meta.url), "utf8"
));
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
function wrap180(value) {
  return ((value + 540) % 360) - 180;
}
function motionAt(body, date) {
  const halfDay = 12 * 3600000;
  const before = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(date.getTime() - halfDay), true));
  const after = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(date.getTime() + halfDay), true));
  const longitudeRateDegPerDay = wrap180(after.elon - before.elon);
  return { longitudeRateDegPerDay, retrograde: longitudeRateDegPerDay < 0 ? 1 : 0 };
}
function equatorialSeparationDegrees(a, b) {
  const radians = Math.PI / 180;
  const raDelta = (a.ra - b.ra) * 15 * radians;
  const decA = a.dec * radians, decB = b.dec * radians;
  const cosine = Math.sin(decA) * Math.sin(decB) +
    Math.cos(decA) * Math.cos(decB) * Math.cos(raDelta);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) / radians;
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
  const illumination = Astronomy.Illumination(entry.planet, event.date);
  const motion = motionAt(entry.planet, event.date);
  const sunEq = Astronomy.Equator("Sun", event.date, observer, true, true);
  const planetEq = Astronomy.Equator(entry.planet, event.date, observer, true, true);
  const sunH = Astronomy.Horizon(event.date, observer, sunEq.ra, sunEq.dec, "normal");
  const planetH = Astronomy.Horizon(event.date, observer, planetEq.ra, planetEq.dec, "normal");
  const elongationDegrees = typeof Astronomy.AngleFromSun === "function"
    ? Astronomy.AngleFromSun(entry.planet, event.date)
    : equatorialSeparationDegrees(sunEq, planetEq);
  const azimuthSeparationDegrees = Math.abs(wrap180(sunH.azimuth - planetH.azimuth));
  const previousAltitude = sunAltitude(observer, previous.date);
  const currentAltitude = sunAltitude(observer, event.date);
  return {
    apparentMagnitude: illumination.mag,
    eventDirection: event.direction,
    magnitudeDirectionInteraction: illumination.mag * event.direction,
    elongationDegrees,
    azimuthSeparationDegrees,
    illuminatedFraction: illumination.phase_fraction,
    longitudeRateDegPerDay: motion.longitudeRateDegPerDay,
    retrograde: motion.retrograde,
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
const combinedWindows = dataset.windows;
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
const baseVariants = [
  { name: "magnitude-only", keys: ["apparentMagnitude"] },
  { name: "magnitude+event-direction", keys: ["apparentMagnitude", "eventDirection"] },
  { name: "magnitude+direction-interaction", keys: [
    "apparentMagnitude", "eventDirection", "magnitudeDirectionInteraction"
  ] }
];
const midpointVariants = [
  { name: "magnitude+longitude-rate", keys: ["apparentMagnitude", "longitudeRateDegPerDay"], targets: ["thresholdMidpoint"] },
  { name: "magnitude+phase", keys: ["apparentMagnitude", "illuminatedFraction"], targets: ["thresholdMidpoint"] },
  { name: "magnitude+direction+longitude-rate", keys: ["apparentMagnitude", "eventDirection", "longitudeRateDegPerDay"], targets: ["thresholdMidpoint"] },
  { name: "magnitude+direction+phase", keys: ["apparentMagnitude", "eventDirection", "illuminatedFraction"], targets: ["thresholdMidpoint"] },
  { name: "magnitude+elongation+azimuth+phase", keys: ["apparentMagnitude", "elongationDegrees", "azimuthSeparationDegrees", "illuminatedFraction"], targets: ["thresholdMidpoint"] },
  { name: "magnitude+elongation+azimuth+phase+direction", keys: ["apparentMagnitude", "elongationDegrees", "azimuthSeparationDegrees", "illuminatedFraction", "eventDirection"], targets: ["thresholdMidpoint"] },
  { name: "magnitude+elongation+azimuth+phase+motion+direction", keys: ["apparentMagnitude", "elongationDegrees", "azimuthSeparationDegrees", "illuminatedFraction", "retrograde", "longitudeRateDegPerDay", "eventDirection"], targets: ["thresholdMidpoint"] }
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
    const planetVariants = planet === "Mercury"
      ? [...baseVariants, ...midpointVariants]
      : planet === "Venus"
        ? [...baseVariants, ...midpointVariants.filter(x =>
            ["magnitude+longitude-rate", "magnitude+phase", "magnitude+direction+longitude-rate", "magnitude+direction+phase"].includes(x.name)
          )]
        : [baseVariants[0]];
    const trainingSamplesByBoundary = {};
    for (const boundaryName of ["astaStart", "astaEnd"]) {
      trainingSamplesByBoundary[boundaryName] = training
        .map(entry => trainingSample(entry, boundaryName)).filter(Boolean);
    }
    for (const variant of planetVariants) {
      for (const targetKey of variant.targets ?? ["thresholdCurrent", "thresholdMidpoint", "thresholdPrevious"]) {
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
  method: "For each Pithoragarh source year, exclude that entire city-year from training, but use all other four cities across all verified years plus Pithoragarh's other source years. Compare magnitude, event direction, phase, elongation, azimuth and retrograde/longitude-rate features; expanded feature variants use the midpoint solar-altitude target. Predict only the held-out Pithoragarh year.",
  observerPolicy: "Training samples use explicit proxy observers for New Delhi, Mumbai, Ujjain, Varanasi and Pithoragarh. Held-out predictions use Pithoragarh 29.5828 N, 80.2182 E, 1650 m. Drik provider coordinates remain undisclosed.",
  warning: "Research-only city-year holdout; no held-out city-year sample is used in fitting. One-day date error remains a release failure.",
  acceptedWindows: entries.length,
  output
}, null, 2));
