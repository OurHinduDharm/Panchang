import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const direct = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2024-2027.json", import.meta.url), "utf8"
));
const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86400000;

function dayNumber(value) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}
function wrap180(value) { return ((value + 540) % 360) - 180; }
function motionAt(body, date) {
  const halfDay = 12 * 3600000;
  const before = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(date.getTime() - halfDay), true));
  const after = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(date.getTime() + halfDay), true));
  const longitudeRateDegPerDay = wrap180(after.elon - before.elon);
  return {
    longitudeRateDegPerDay,
    retrograde: longitudeRateDegPerDay < 0 ? 1 : 0
  };
}
function nearestEvent(body, anchor) {
  const start = new Date(anchor.getTime() - 12 * 3600000);
  const events = [1, -1].map(direction => {
    const result = Astronomy.SearchRiseSet(body, observer, direction, start, 1, 0);
    return result?.date ? {
      direction, date: result.date,
      deltaMinutes: Math.abs(result.date.getTime() - anchor.getTime()) / 60000
    } : null;
  }).filter(Boolean).sort((a, b) => a.deltaMinutes - b.deltaMinutes);
  return events[0] && events[0].deltaMinutes <= 10 ? events[0] : null;
}
function sunAltitude(date) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}
function equatorialSeparationDegrees(a, b) {
  const radians = Math.PI / 180;
  const raDelta = (a.ra - b.ra) * 15 * radians;
  const decA = a.dec * radians, decB = b.dec * radians;
  const cosine = Math.sin(decA) * Math.sin(decB) +
    Math.cos(decA) * Math.cos(decB) * Math.cos(raDelta);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) / radians;
}

function trainingSample(entry, boundary) {
  const anchor = new Date(entry.boundaries[boundary]);
  const current = nearestEvent(entry.planet, anchor);
  if (!current) return null;
  const previous = Astronomy.SearchRiseSet(
    entry.planet, observer, current.direction,
    new Date(anchor.getTime() - 36 * 3600000), 1, 0
  );
  if (!previous?.date) return null;
  const motion = motionAt(entry.planet, current.date);
  const illumination = Astronomy.Illumination(entry.planet, current.date);
  const sunEq = Astronomy.Equator("Sun", current.date, observer, true, true);
  const planetEq = Astronomy.Equator(entry.planet, current.date, observer, true, true);
  const sunH = Astronomy.Horizon(current.date, observer, sunEq.ra, sunEq.dec, "normal");
  const planetH = Astronomy.Horizon(current.date, observer, planetEq.ra, planetEq.dec, "normal");
  const elongationDegrees = typeof Astronomy.AngleFromSun === "function"
    ? Astronomy.AngleFromSun(entry.planet, current.date)
    : equatorialSeparationDegrees(sunEq, planetEq);
  const azimuthSeparationDegrees = Math.abs(
    ((sunH.azimuth - planetH.azimuth + 540) % 360) - 180
  );
  return {
    apparentMagnitude: illumination.mag,
    retrograde: motion.retrograde,
    longitudeRateDegPerDay: motion.longitudeRateDegPerDay,
    eventDirection: current.direction,
    elongationDegrees,
    azimuthSeparationDegrees,
    illuminatedFraction: illumination.phase_fraction,
    thresholdMidpoint: (sunAltitude(previous.date) + sunAltitude(current.date)) / 2
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
function fitFeatures(samples, keys) {
  const size = keys.length + 1;
  if (samples.length < size + 1) return null;
  const xtx = Array.from({ length: size }, () => Array(size).fill(0));
  const xty = Array(size).fill(0);
  for (const sample of samples) {
    const row = [1, ...keys.map(key => sample[key])];
    if (row.some(value => !Number.isFinite(value))) continue;
    for (let i = 0; i < size; i++) {
      xty[i] += row[i] * sample.thresholdMidpoint;
      for (let j = 0; j < size; j++) xtx[i][j] += row[i] * row[j];
    }
  }
  // Small ridge penalty stabilizes correlated ephemeris features without
  // regularizing the intercept.
  for (let i = 1; i < size; i++) xtx[i][i] += 1e-7;
  const beta = solve(xtx, xty);
  if (!beta) return null;
  return {
    intercept: beta[0],
    coefficients: Object.fromEntries(keys.map((key, index) => [key, beta[index + 1]]))
  };
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
function summary(values, tolerance) {
  const errors = values.filter(Number.isFinite);
  return {
    count: errors.length,
    exact: errors.filter(x => x === 0).length,
    withinTolerance: errors.filter(x => Math.abs(x) <= tolerance).length,
    meanAbsolute: errors.length
      ? Number((errors.reduce((sum, x) => sum + Math.abs(x), 0) / errors.length).toFixed(3))
      : null,
    maxAbsolute: errors.length ? Math.max(...errors.map(Math.abs)) : null
  };
}

const unique = new Map();
for (const row of direct.windows) {
  const key = [row.planet, row.boundaries.astaStart.normalizedLocalDateTime,
    row.boundaries.astaEnd.normalizedLocalDateTime].join("|");
  if (!unique.has(key)) unique.set(key, {
    id: row.id, planet: row.planet,
    boundaries: {
      astaStart: row.boundaries.astaStart.normalizedLocalDateTime,
      astaEnd: row.boundaries.astaEnd.normalizedLocalDateTime
    }
  });
}
const entries = [...unique.values()];
const variants = [
  { name: "magnitude-only", keys: ["apparentMagnitude"] },
  { name: "magnitude+retrograde", keys: ["apparentMagnitude", "retrograde"] },
  { name: "magnitude+longitude-rate", keys: ["apparentMagnitude", "longitudeRateDegPerDay"] },
  { name: "magnitude+retrograde+rate", keys: ["apparentMagnitude", "retrograde", "longitudeRateDegPerDay"] },
  { name: "magnitude+elongation", keys: ["apparentMagnitude", "elongationDegrees"] },
  { name: "magnitude+azimuth-separation", keys: ["apparentMagnitude", "azimuthSeparationDegrees"] },
  { name: "magnitude+phase", keys: ["apparentMagnitude", "illuminatedFraction"] },
  { name: "magnitude+elongation+azimuth+phase", keys: ["apparentMagnitude", "elongationDegrees", "azimuthSeparationDegrees", "illuminatedFraction"] },
  { name: "magnitude+elongation+azimuth+phase+motion", keys: ["apparentMagnitude", "elongationDegrees", "azimuthSeparationDegrees", "illuminatedFraction", "retrograde", "longitudeRateDegPerDay"] },
  { name: "magnitude+event-direction", keys: ["apparentMagnitude", "eventDirection"] },
  { name: "magnitude+phase+event-direction", keys: ["apparentMagnitude", "illuminatedFraction", "eventDirection"] },
  { name: "magnitude+elongation+azimuth+phase+direction", keys: ["apparentMagnitude", "elongationDegrees", "azimuthSeparationDegrees", "illuminatedFraction", "eventDirection"] },
  { name: "magnitude+elongation+azimuth+phase+motion+direction", keys: ["apparentMagnitude", "elongationDegrees", "azimuthSeparationDegrees", "illuminatedFraction", "retrograde", "longitudeRateDegPerDay", "eventDirection"] }
];
const output = [];

for (const planet of ["Mercury", "Venus"]) {
  const planetRows = entries.filter(entry => entry.planet === planet);
  const years = [...new Set(planetRows.map(entry =>
    Number(entry.boundaries.astaStart.slice(0, 4))
  ))].sort();
  for (const variant of variants) {
    for (const holdoutYear of years) {
      const training = planetRows.filter(entry =>
        Number(entry.boundaries.astaStart.slice(0, 4)) !== holdoutYear
      );
      const holdouts = planetRows.filter(entry =>
        Number(entry.boundaries.astaStart.slice(0, 4)) === holdoutYear
      );
      const modelByBoundary = {}, trainingCounts = {};
      let ready = true;
      for (const boundary of ["astaStart", "astaEnd"]) {
        const samples = training.map(entry => trainingSample(entry, boundary)).filter(Boolean);
        trainingCounts[boundary] = samples.length;
        modelByBoundary[boundary] = fitFeatures(samples, variant.keys);
        if (!modelByBoundary[boundary]) ready = false;
      }
      if (!ready) {
        output.push({
          planet, model: variant.name, holdoutYear, available: false,
          trainingWindows: training.length, holdoutWindows: holdouts.length,
          trainingCounts, reason: "Insufficient non-held-out samples or singular feature matrix"
        });
        continue;
      }

      const searchDays = planet === "Mercury" ? 45 : 60;
      const candidates = generateVisibilityWindows({
        astronomy: Astronomy, body: planet, observer, modelByBoundary,
        startDate: new Date(Date.UTC(holdoutYear, 0, 1)),
        endDate: new Date(Date.UTC(holdoutYear, 11, 31, 23, 59, 59)),
        searchDays, timeZone: TIME_ZONE
      }).filter(window =>
        window.status === "candidate" &&
        window.asta.predictedBoundaryDate?.slice(0, 4) === String(holdoutYear)
      );

      const used = new Set(), predictions = [];
      for (const entry of holdouts) {
        const publishedStart = entry.boundaries.astaStart;
        const ranked = candidates.map((window, index) => ({
          window, index,
          error: dayNumber(window.asta.predictedBoundaryDate) - dayNumber(publishedStart)
        })).filter(item => !used.has(item.index))
          .sort((a, b) => Math.abs(a.error) - Math.abs(b.error));
        const best = ranked[0];
        if (!best || Math.abs(best.error) > 30) {
          predictions.push({ id: entry.id, matched: false });
          continue;
        }
        used.add(best.index);
        const publishedEnd = entry.boundaries.astaEnd;
        predictions.push({
          id: entry.id, matched: true,
          astaErrorDays: best.error,
          udayaErrorDays: dayNumber(best.window.udaya.predictedBoundaryDate) - dayNumber(publishedEnd),
          astaClockErrorMinutes: clockError(best.window.asta.predictedEventLocalTime, publishedStart.slice(11, 16)),
          udayaClockErrorMinutes: clockError(best.window.udaya.predictedEventLocalTime, publishedEnd.slice(11, 16))
        });
      }
      const matched = predictions.filter(item => item.matched);
      output.push({
        planet, model: variant.name, holdoutYear,
        available: true, trainingWindows: training.length,
        holdoutWindows: holdouts.length, trainingCounts,
        matchedCount: matched.length, unmatchedCount: predictions.length - matched.length,
        astaDate: summary(matched.map(x => x.astaErrorDays), 1),
        udayaDate: summary(matched.map(x => x.udayaErrorDays), 1),
        astaClockMinutes: summary(matched.map(x => x.astaClockErrorMinutes), 5),
        udayaClockMinutes: summary(matched.map(x => x.udayaClockErrorMinutes), 5),
        predictions
      });
    }
  }
}
console.log(JSON.stringify({
  title: "Mercury/Venus Pithoragarh retrograde/direct feature model comparison",
  method: "Leave-one-start-year-out cross-validation on directly captured Pithoragarh Drik windows. Compare magnitude-only against magnitude + geocentric retrograde flag, longitude rate, and both features. Fit excludes every boundary from the held-out start year.",
  motionDefinition: "Apparent geocentric ecliptic longitude rate from Astronomy Engine GeoVector/Ecliptic over a centered 24-hour interval; negative is retrograde, positive is direct.",
  warning: "Research diagnostic only; model variants must be compared across all held-out years and must not be selected by a single favorable fold.",
  output
}, null, 2));
