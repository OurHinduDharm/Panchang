import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const localData = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2021-2027.json", import.meta.url), "utf8"
));
const multiCityData = JSON.parse(await readFile(
  new URL("../data/drik-multicity-asta-udaya-2024-2028.json", import.meta.url), "utf8"
));

const TARGET_CITY = "Pithoragarh, Uttarakhand, India";
const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86400000;
const CITY_OBSERVERS = {
  "New Delhi, NCT, India": [28.6139, 77.2090, 216],
  "Mumbai, Maharashtra, India": [19.0760, 72.8777, 14],
  "Ujjain, Madhya Pradesh, India": [23.1765, 75.7885, 494],
  "Varanasi, Uttar Pradesh, India": [25.3176, 82.9739, 80],
  "Pithoragarh, Uttarakhand, India": [29.5828, 80.2182, 1650]
};

function observerFor(city) {
  const coordinates = CITY_OBSERVERS[city];
  if (!coordinates) throw new Error("No explicit observer proxy for " + city);
  return new Astronomy.Observer(...coordinates);
}
function dayNumber(value) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}
function clockMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
function clockError(predicted, published) {
  const a = clockMinutes(predicted), b = clockMinutes(published);
  if (a === null || b === null) return null;
  return ((a - b + 720 + 1440) % 1440) - 720;
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
function sunAltitude(date, observer) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}
function featuresAt(entry, boundaryName) {
  const observer = observerFor(entry.sourceLocation);
  const anchor = new Date(entry.boundaries[boundaryName].normalizedUtcInstant);
  const current = nearestEvent(entry.planet, observer, anchor);
  if (!current) return null;
  const previous = Astronomy.SearchRiseSet(
    entry.planet, observer, current.direction,
    new Date(anchor.getTime() - 36 * 3600000), 1, 0
  );
  if (!previous?.date) return null;
  const illumination = Astronomy.Illumination(entry.planet, current.date);
  const beforeAltitude = sunAltitude(previous.date, observer);
  const currentAltitude = sunAltitude(current.date, observer);
  return {
    apparentMagnitude: illumination.mag,
    eventDirection: current.direction,
    magnitudeDirectionInteraction: illumination.mag * current.direction,
    thresholdMidpoint: (beforeAltitude + currentAltitude) / 2
  };
}
function solve(matrix, vector) {
  const a = matrix.map((row, index) => [...row, vector[index]]);
  const n = vector.length;
  for (let column = 0; column < n; column++) {
    let pivot = column;
    for (let row = column + 1; row < n; row++) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    if (Math.abs(a[pivot][column]) < 1e-10) return null;
    [a[column], a[pivot]] = [a[pivot], a[column]];
    const divisor = a[column][column];
    for (let j = column; j <= n; j++) a[column][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const factor = a[row][column];
      for (let j = column; j <= n; j++) a[row][j] -= factor * a[column][j];
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
    exact: errors.filter(value => value === 0).length,
    withinOneDay: errors.filter(value => Math.abs(value) <= 1).length,
    withinTwoDays: errors.filter(value => Math.abs(value) <= 2).length,
    meanAbsoluteErrorDays: errors.length
      ? Number((errors.reduce((sum, value) => sum + Math.abs(value), 0) / errors.length).toFixed(3))
      : null,
    maxAbsoluteErrorDays: errors.length ? Math.max(...errors.map(Math.abs)) : null
  };
}
function normalizeLocal(entry) {
  return {
    ...entry,
    sourceLocation: TARGET_CITY
  };
}
function eligible(entry) {
  return entry.acceptanceEligible === true &&
    entry.sourceStatus === "direct-page-captured-browser-verified" &&
    entry.precision === "minute" &&
    entry.boundaries?.astaStart?.normalizedUtcInstant &&
    entry.boundaries?.astaEnd?.normalizedUtcInstant;
}

// The direct Pithoragarh ledger supplies 2021–2027 local history.
// Other-city training rows come only from direct, accepted 2024–2027 captures.
const localRows = localData.windows.filter(eligible).map(normalizeLocal);
const otherCityRows = multiCityData.windows.filter(entry =>
  eligible(entry) && entry.sourceLocation !== TARGET_CITY
);
const unique = new Map();
for (const entry of [...localRows, ...otherCityRows]) {
  const key = [
    entry.sourceLocation, entry.planet,
    entry.boundaries.astaStart.normalizedLocalDateTime,
    entry.boundaries.astaEnd.normalizedLocalDateTime
  ].join("|");
  if (!unique.has(key)) unique.set(key, entry);
}
const allEntries = [...unique.values()];
const targetRows = allEntries.filter(entry => entry.sourceLocation === TARGET_CITY);
const years = [...new Set(targetRows.map(entry => entry.sourcePageYear))].sort((a, b) => a - b);
const output = [];
const variantsByPlanet = {
  Mercury: [
    { name: "magnitude-only", keys: ["apparentMagnitude"] },
    { name: "magnitude+event-direction", keys: [
      "apparentMagnitude", "eventDirection", "magnitudeDirectionInteraction"
    ] }
  ],
  Venus: [{ name: "magnitude-only", keys: ["apparentMagnitude"] }],
  Mars: [{ name: "magnitude-only", keys: ["apparentMagnitude"] }],
  Jupiter: [{ name: "magnitude-only", keys: ["apparentMagnitude"] }],
  Saturn: [{ name: "magnitude-only", keys: ["apparentMagnitude"] }]
};

for (const planet of Object.keys(variantsByPlanet)) {
  const planetRows = allEntries.filter(entry => entry.planet === planet);
  for (const holdoutYear of years) {
    const holdouts = targetRows.filter(entry =>
      entry.planet === planet && entry.sourcePageYear === holdoutYear
    );
    if (!holdouts.length) continue;

    // Strict forward-only fold: no same-year or future-year record from any city
    // may enter training. Other-city training starts in 2024; Pithoragarh local
    // history reaches back to 2021.
    const pooledTraining = planetRows.filter(entry => entry.sourcePageYear < holdoutYear);
    const localTraining = targetRows.filter(entry =>
      entry.planet === planet && entry.sourcePageYear < holdoutYear
    );

    for (const trainingMode of ["pooled-prior-years-only", "local-prior-years-only"]) {
      const training = trainingMode === "local-prior-years-only" ? localTraining : pooledTraining;
      for (const variant of variantsByPlanet[planet]) {
        const modelByBoundary = {}, trainingCounts = {};
        let ready = true;
        for (const boundaryName of ["astaStart", "astaEnd"]) {
          const samples = training.map(entry => featuresAt(entry, boundaryName)).filter(Boolean);
          trainingCounts[boundaryName] = samples.length;
          modelByBoundary[boundaryName] = fit(samples, variant.keys);
          if (!modelByBoundary[boundaryName]) ready = false;
        }
        if (!ready) {
          output.push({
            planet, holdoutYear, trainingMode, model: variant.name,
            available: false, trainingWindows: training.length,
            holdoutWindows: holdouts.length, trainingCounts,
            reason: "Insufficient earlier-year training samples; future years are not allowed"
          });
          continue;
        }

        const observer = observerFor(TARGET_CITY);
        const searchDays = planet === "Mercury" ? 45 : planet === "Mars" ? 90 : 60;
        const eventYears = [...new Set(holdouts.map(entry =>
          Number(entry.boundaries.astaStart.normalizedLocalDateTime.slice(0, 4))
        ))].sort();
        const candidateRows = [];
        for (const eventYear of eventYears) {
          const candidates = generateVisibilityWindows({
            astronomy: Astronomy, body: planet, observer, modelByBoundary,
            startDate: new Date(Date.UTC(eventYear, 0, 1)),
            endDate: new Date(Date.UTC(eventYear, 11, 31, 23, 59, 59)),
            searchDays, timeZone: TIME_ZONE
          }).filter(window =>
            window.status === "candidate" &&
            window.asta.predictedBoundaryDate?.slice(0, 4) === String(eventYear)
          );
          candidateRows.push(...candidates);
        }

        const used = new Set(), predictions = [];
        for (const entry of holdouts) {
          const publishedStart = entry.boundaries.astaStart.normalizedLocalDateTime;
          const ranked = candidateRows.map((window, index) => ({
            window, index,
            error: dayNumber(window.asta.predictedBoundaryDate) - dayNumber(publishedStart)
          })).filter(item =>
            !used.has(item.index) &&
            Math.abs(item.error) <= 30
          ).sort((a, b) => Math.abs(a.error) - Math.abs(b.error));
          const best = ranked[0];
          if (!best) {
            predictions.push({ id: entry.id, matched: false });
            continue;
          }
          used.add(best.index);
          const publishedEnd = entry.boundaries.astaEnd.normalizedLocalDateTime;
          predictions.push({
            id: entry.id, matched: true,
            conjunctionType: best.window.conjunctionType,
            astaDirection: best.window.asta.direction,
            udayaDirection: best.window.udaya.direction,
            predictedAstaDate: best.window.asta.predictedBoundaryDate,
            publishedAstaDate: publishedStart.slice(0, 10),
            predictedAstaTime: best.window.asta.predictedEventLocalTime,
            publishedAstaTime: publishedStart.slice(11, 16),
            astaErrorDays: best.error,
            astaClockErrorMinutes: clockError(best.window.asta.predictedEventLocalTime, publishedStart.slice(11, 16)),
            predictedUdayaDate: best.window.udaya.predictedBoundaryDate,
            publishedUdayaDate: publishedEnd.slice(0, 10),
            predictedUdayaTime: best.window.udaya.predictedEventLocalTime,
            publishedUdayaTime: publishedEnd.slice(11, 16),
            udayaErrorDays: dayNumber(best.window.udaya.predictedBoundaryDate) - dayNumber(publishedEnd),
            udayaClockErrorMinutes: clockError(best.window.udaya.predictedEventLocalTime, publishedEnd.slice(11, 16))
          });
        }
        const matched = predictions.filter(item => item.matched);
        output.push({
          planet, holdoutYear, trainingMode, model: variant.name,
          available: true, trainingWindows: training.length,
          trainingSourceYears: [...new Set(training.map(entry => entry.sourcePageYear))].sort((a, b) => a - b),
          trainingCities: [...new Set(training.map(entry => entry.sourceLocation))].sort(),
          holdoutWindows: holdouts.length, matchedCount: matched.length,
          unmatchedCount: predictions.length - matched.length,
          astaDate: summarize(matched.map(item => item.astaErrorDays)),
          udayaDate: summarize(matched.map(item => item.udayaErrorDays)),
          astaClockMinutes: summarize(matched.map(item => item.astaClockErrorMinutes)),
          udayaClockMinutes: summarize(matched.map(item => item.udayaClockErrorMinutes)),
          predictions
        });
      }
    }
  }
}

console.log(JSON.stringify({
  title: "Pithoragarh forward-only Asta/Udaya validation",
  method: "For each held-out Pithoragarh source-page year, fit per-planet visibility models using only earlier source-page years. The pooled model may use earlier-year records from other directly captured cities; the local-only baseline uses only earlier Pithoragarh years. No future-year records are allowed in either training fold.",
  coverage: {
    acceptedRows: allEntries.length,
    pithoragarhWindows: targetRows.length,
    otherCityWindows: otherCityRows.length,
    pithoragarhYears: years
  },
  observerPolicy: "Pithoragarh observer 29.5828 N, 80.2182 E, 1650 m; other cities use explicit proxy observers. Drik internal observer coordinates/elevation remain undisclosed.",
  warning: "Research diagnostic only. A one-day date miss remains a release failure. Early years may be unavailable because the model is forbidden from training on future data.",
  output
}, null, 2));
