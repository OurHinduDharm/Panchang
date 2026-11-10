import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const dataset = JSON.parse(await readFile(
  new URL("../data/drik-multicity-asta-udaya-2024-2028.json", import.meta.url), "utf8"
));
const TIME_ZONE = "Asia/Kolkata";
const CITY_OBSERVERS = {
  "New Delhi, NCT, India": [28.6139, 77.2090, 216],
  "Mumbai, Maharashtra, India": [19.0760, 72.8777, 14],
  "Ujjain, Madhya Pradesh, India": [23.1765, 75.7885, 494],
  "Varanasi, Uttar Pradesh, India": [25.3176, 82.9739, 80],
  "Pithoragarh, Uttarakhand, India": [29.5828, 80.2182, 1650]
};
const DAY_MS = 86400000;

function observerFor(city) {
  const values = CITY_OBSERVERS[city];
  if (!values) throw new Error("Missing explicit proxy observer for " + city);
  return new Astronomy.Observer(...values);
}
function dayNumber(value) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}
function clockMinutes(value) {
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
function clockError(predicted, published) {
  const a = clockMinutes(predicted), b = clockMinutes(published);
  if (a === null || b === null) return null;
  return ((a - b + 720 + 1440) % 1440) - 720;
}
function summarizeClock(values) {
  const errors = values.filter(Number.isFinite);
  return {
    count: errors.length,
    withinOneMinute: errors.filter(x => Math.abs(x) <= 1).length,
    withinFiveMinutes: errors.filter(x => Math.abs(x) <= 5).length,
    withinTenMinutes: errors.filter(x => Math.abs(x) <= 10).length,
    meanAbsoluteErrorMinutes: errors.length
      ? Number((errors.reduce((sum, x) => sum + Math.abs(x), 0) / errors.length).toFixed(2))
      : null,
    maxAbsoluteErrorMinutes: errors.length ? Math.max(...errors.map(Math.abs)) : null
  };
}
function nearestEvent(body, observer, anchor) {
  const start = new Date(anchor.getTime() - 12 * 3600000);
  const options = [1, -1].map(direction => {
    const event = Astronomy.SearchRiseSet(body, observer, direction, start, 1, 0);
    return event?.date ? {
      direction, date: event.date,
      deltaMinutes: Math.abs(event.date.getTime() - anchor.getTime()) / 60000
    } : null;
  }).filter(Boolean).sort((a, b) => a.deltaMinutes - b.deltaMinutes);
  return options[0] && options[0].deltaMinutes <= 10 ? options[0] : null;
}
function featuresAt(body, observer, date, direction) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  const planet = Astronomy.Equator(body, date, observer, true, true);
  const sunHorizon = Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal");
  const planetHorizon = Astronomy.Horizon(date, observer, planet.ra, planet.dec, "normal");
  const azimuthSeparationDegrees = Math.abs(
    ((sunHorizon.azimuth - planetHorizon.azimuth + 540) % 360) - 180
  );
  const illumination = Astronomy.Illumination(body, date);
  const apparentMagnitude = illumination.mag;
  const elongationDegrees = Astronomy.AngleFromSun(body, date);
  return {
    apparentMagnitude,
    elongationDegrees,
    illuminatedFraction: illumination.phase_fraction,
    azimuthSeparationDegrees,
    eventDirection: direction,
    magnitudeDirectionInteraction: apparentMagnitude * direction
  };
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
  const beforeSun = Astronomy.Equator("Sun", previous.date, observer, true, true);
  const beforeHorizon = Astronomy.Horizon(previous.date, observer, beforeSun.ra, beforeSun.dec, "normal");
  const currentSun = Astronomy.Equator("Sun", event.date, observer, true, true);
  const currentHorizon = Astronomy.Horizon(event.date, observer, currentSun.ra, currentSun.dec, "normal");
  return {
    ...featuresAt(entry.planet, observer, event.date, event.direction),
    thresholdMidpoint: (beforeHorizon.altitude + currentHorizon.altitude) / 2
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
function fit(samples, keys) {
  const size = keys.length + 1;
  const xtx = Array.from({ length: size }, () => Array(size).fill(0));
  const xty = Array(size).fill(0);
  let count = 0;
  for (const sample of samples) {
    const row = [1, ...keys.map(key => sample[key])];
    if (row.some(value => !Number.isFinite(value))) continue;
    count++;
    for (let i = 0; i < size; i++) {
      xty[i] += row[i] * sample.thresholdMidpoint;
      for (let j = 0; j < size; j++) xtx[i][j] += row[i] * row[j];
    }
  }
  if (count < size + 2) return null;
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
    withinTwoDays: errors.filter(x => Math.abs(x) <= 2).length,
    meanAbsoluteErrorDays: errors.length
      ? Number((errors.reduce((sum, x) => sum + Math.abs(x), 0) / errors.length).toFixed(3))
      : null,
    maxAbsoluteErrorDays: errors.length ? Math.max(...errors.map(Math.abs)) : null
  };
}

// Exclude every unverified requested-2028 page and deduplicate annual overlap.
const unique = new Map();
for (const entry of dataset.windows) {
  if (!entry.acceptanceEligible || entry.sourceStatus !== "direct-page-captured-browser-verified") continue;
  const key = [
    entry.sourceLocation, entry.planet,
    entry.boundaries.astaStart.normalizedLocalDateTime,
    entry.boundaries.astaEnd.normalizedLocalDateTime
  ].join("|");
  if (!unique.has(key)) unique.set(key, entry);
}
const entries = [...unique.values()];
const variants = [
  { name: "magnitude-only", keys: ["apparentMagnitude"] },
  { name: "magnitude+event-direction", keys: ["apparentMagnitude", "eventDirection", "magnitudeDirectionInteraction"] },
  { name: "geometry+event-direction", keys: [
    "apparentMagnitude", "elongationDegrees", "illuminatedFraction",
    "azimuthSeparationDegrees", "eventDirection", "magnitudeDirectionInteraction"
  ] }
];
const cities = Object.keys(CITY_OBSERVERS);
const output = [];

for (const planet of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
  const planetRows = entries.filter(entry => entry.planet === planet);
  for (const holdoutCity of cities) {
    const training = planetRows.filter(entry => entry.sourceLocation !== holdoutCity);
    const holdouts = planetRows.filter(entry => entry.sourceLocation === holdoutCity);
    if (!holdouts.length) continue;

    for (const variant of variants) {
      const modelByBoundary = {}, trainingCounts = {};
      let ready = true;
      for (const boundaryName of ["astaStart", "astaEnd"]) {
        const samples = training.map(entry => trainingSample(entry, boundaryName)).filter(Boolean);
        trainingCounts[boundaryName] = samples.length;
        modelByBoundary[boundaryName] = fit(samples, variant.keys);
        if (!modelByBoundary[boundaryName]) ready = false;
      }
      if (!ready) {
        output.push({
          planet, holdoutCity, model: variant.name, available: false,
          trainingWindows: training.length, holdoutWindows: holdouts.length,
          trainingCounts, reason: "Insufficient independent-city training samples or singular model"
        });
        continue;
      }

      const years = [...new Set(holdouts.map(entry => entry.sourcePageYear))].sort();
      const predictions = [];
      for (const year of years) {
        const observer = observerFor(holdoutCity);
        const searchDays = planet === "Mercury" ? 45 : planet === "Mars" ? 90 : 60;
        const candidates = generateVisibilityWindows({
          astronomy: Astronomy, body: planet, observer, modelByBoundary,
          startDate: new Date(Date.UTC(year, 0, 1)),
          endDate: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
          searchDays, timeZone: TIME_ZONE
        }).filter(window =>
          window.status === "candidate" &&
          window.asta.predictedBoundaryDate?.slice(0, 4) === String(year)
        );
        const used = new Set();
        for (const entry of holdouts.filter(item => item.sourcePageYear === year)) {
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
          const publishedUdaya = entry.boundaries.astaEnd.normalizedLocalDateTime;
          const predictedAstaDate = best.window.asta.predictedBoundaryDate;
          const predictedUdayaDate = best.window.udaya.predictedBoundaryDate;
          const predictedAstaTime = best.window.asta.predictedEventLocalTime;
          const predictedUdayaTime = best.window.udaya.predictedEventLocalTime;
          predictions.push({
            id: entry.id, matched: true,
            predictedAstaDate,
            publishedAstaDate: publishedAsta.slice(0, 10),
            predictedAstaTime,
            publishedAstaTime: publishedAsta.slice(11, 16),
            astaErrorDays: best.error,
            astaClockErrorMinutes: clockError(predictedAstaTime, publishedAsta.slice(11, 16)),
            predictedUdayaDate,
            publishedUdayaDate: publishedUdaya.slice(0, 10),
            predictedUdayaTime,
            publishedUdayaTime: publishedUdaya.slice(11, 16),
            udayaErrorDays: dayNumber(predictedUdayaDate) - dayNumber(publishedUdaya),
            udayaClockErrorMinutes: clockError(predictedUdayaTime, publishedUdaya.slice(11, 16))
          });
        }
      }
      const matched = predictions.filter(item => item.matched);
      output.push({
        planet, holdoutCity, model: variant.name,
        available: true, trainingWindows: training.length,
        holdoutWindows: holdouts.length, trainingCounts,
        matchedCount: matched.length, unmatchedCount: predictions.length - matched.length,
        astaDate: summarize(matched.map(x => x.astaErrorDays)),
        udayaDate: summarize(matched.map(x => x.udayaErrorDays)),
        astaClock: summarizeClock(matched.map(x => x.astaClockErrorMinutes)),
        udayaClock: summarizeClock(matched.map(x => x.udayaClockErrorMinutes)),
        predictions
      });
    }
  }
}

console.log(JSON.stringify({
  title: "Five-city leave-one-city-out Drik Asta/Udaya transfer validation",
  method: "For each held-out city, fit each planet's local-solar-altitude visibility boundary using only the other four cities, then predict every held-out year from computed conjunctions and the held-out city's topocentric rise/set events. Compare magnitude-only, event-direction interaction, and local geometry feature models.",
  observerPolicy: "Explicit city proxy observers: New Delhi 28.6139/77.2090/216m; Mumbai 19.0760/72.8777/14m; Ujjain 23.1765/75.7885/494m; Varanasi 25.3176/82.9739/80m; Pithoragarh 29.5828/80.2182/1650m. Drik provider coordinates/elevation are undisclosed; this is city-proxy validation, not exact provider-observer identity.",
  exclusionPolicy: "Only browser-verified 2024–2027 rows are accepted. Requested 2028 pages that rendered 2027 are excluded. Annual overlap is deduplicated per city/planet/boundary pair.",
  warning: "Research-only. No model is approved for publication solely by this diagnostic; one-day civil-date misses remain release failures.",
  acceptedWindowCount: entries.length,
  output
}, null, 2));
