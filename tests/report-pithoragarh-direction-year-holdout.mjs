import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const direct = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2021-2027.json", import.meta.url), "utf8"
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
  return { longitudeRateDegPerDay, retrograde: longitudeRateDegPerDay < 0 ? 1 : 0 };
}
function nearestEvent(body, anchor) {
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
function sunAltitude(date) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}
function trainingSample(entry, boundaryName) {
  const anchor = new Date(entry.boundaries[boundaryName].instant);
  const event = nearestEvent(entry.planet, anchor);
  if (!event) return null;
  const previous = Astronomy.SearchRiseSet(
    entry.planet, observer, event.direction, new Date(anchor.getTime() - 36 * 3600000), 1, 0
  );
  if (!previous?.date) return null;
  const apparentMagnitude = Astronomy.Illumination(entry.planet, event.date).mag;
  const motion = motionAt(entry.planet, event.date);
  return {
    apparentMagnitude,
    eventDirection: event.direction,
    magnitudeDirectionInteraction: apparentMagnitude * event.direction,
    longitudeRateDegPerDay: motion.longitudeRateDegPerDay,
    retrograde: motion.retrograde,
    thresholdPrevious: sunAltitude(previous.date),
    thresholdCurrent: sunAltitude(event.date),
    thresholdMidpoint: (sunAltitude(previous.date) + sunAltitude(event.date)) / 2
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
function fitFeatures(samples, keys, targetKey) {
  const size = keys.length + 1;
  const xtx = Array.from({ length: size }, () => Array(size).fill(0));
  const xty = Array(size).fill(0);
  let count = 0;
  for (const sample of samples) {
    const row = [1, ...keys.map(key => sample[key])];
    if (row.some(value => !Number.isFinite(value))) continue;
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
function publishedConjunctionType(entry) {
  const start = new Date(entry.boundaries.astaStart.instant);
  const end = new Date(entry.boundaries.astaEnd.instant);
  const midpoint = new Date((start.getTime() + end.getTime()) / 2);
  const innerPlanet = entry.planet === 'Mercury' || entry.planet === 'Venus';
  const targets = innerPlanet ? [0, 180] : [0];
  const candidates = [];
  for (const targetRelLon of targets) {
    const event = Astronomy.SearchRelativeLongitude(entry.planet, targetRelLon, new Date(midpoint.getTime() - 90 * DAY_MS));
    if (event?.date) {
      const distanceDays = Math.abs(event.date.getTime() - midpoint.getTime()) / DAY_MS;
      if (distanceDays <= 90) candidates.push({ targetRelLon, distanceDays });
    }
  }
  candidates.sort((a, b) => a.distanceDays - b.distanceDays);
  if (!candidates.length || (candidates.length > 1 && Math.abs(candidates[0].distanceDays - candidates[1].distanceDays) < 1)) return null;
  return candidates[0].targetRelLon === 0
    ? (innerPlanet ? 'inferior' : 'conjunction')
    : 'superior';
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
for (const entry of direct.windows) {
  const key = [entry.planet, entry.boundaries.astaStart.normalizedLocalDateTime,
    entry.boundaries.astaEnd.normalizedLocalDateTime].join("|");
  if (!unique.has(key)) unique.set(key, {
    id: entry.id, planet: entry.planet, sourcePageYear: entry.sourcePageYear,
    boundaries: {
      astaStart: { instant: entry.boundaries.astaStart.normalizedUtcInstant, local: entry.boundaries.astaStart.normalizedLocalDateTime },
      astaEnd: { instant: entry.boundaries.astaEnd.normalizedUtcInstant, local: entry.boundaries.astaEnd.normalizedLocalDateTime }
    }
  });
}
const entries = [...unique.values()];
const output = [];

for (const planet of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
  const planetRows = entries.filter(entry => entry.planet === planet);
  const years = [...new Set(planetRows.map(entry => entry.sourcePageYear))].sort();
  const variants = planet === "Mercury"
    ? [
        { name: "magnitude-only", keys: ["apparentMagnitude"] },
        { name: "magnitude+event-direction", keys: ["apparentMagnitude", "eventDirection"] },
        { name: "magnitude+direction-interaction", keys: [
          "apparentMagnitude", "eventDirection", "magnitudeDirectionInteraction"
        ] }
      ]
    : [{ name: "magnitude-only", keys: ["apparentMagnitude"] }];

  for (const targetKey of ["thresholdCurrent", "thresholdMidpoint", "thresholdPrevious"]) {
    for (const variant of variants) {
      for (const holdoutYear of years) {
      const training = planetRows.filter(entry => entry.sourcePageYear !== holdoutYear);
      const holdouts = planetRows.filter(entry => entry.sourcePageYear === holdoutYear);
      const trainingSamplesByBoundary = {};
      for (const boundary of ["astaStart", "astaEnd"]) {
        trainingSamplesByBoundary[boundary] = training
          .map(entry => trainingSample(entry, boundary)).filter(Boolean);
      }
      const modelByBoundary = {}, trainingCounts = {};
      let ready = true;
      for (const boundary of ["astaStart", "astaEnd"]) {
        const samples = trainingSamplesByBoundary[boundary];
        trainingCounts[boundary] = samples.length;
        modelByBoundary[boundary] = fitFeatures(samples, variant.keys, targetKey);
        if (!modelByBoundary[boundary]) ready = false;
      }
      if (!ready) {
        output.push({
          planet, model: variant.name, thresholdTarget: targetKey, holdoutYear, available: false,
          trainingWindows: training.length, holdoutWindows: holdouts.length,
          trainingCounts, reason: "Insufficient independent-year samples or singular feature matrix"
        });
        continue;
      }

      const searchDays = planet === "Mercury" ? 45 : planet === "Mars" ? 90 : 60;
      const predictions = [];
      const eventYears = [...new Set(holdouts.map(entry =>
        Number(entry.boundaries.astaStart.local.slice(0, 4))
      ))].sort();
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
        const used = new Set();
        for (const entry of holdouts.filter(item =>
          Number(item.boundaries.astaStart.local.slice(0, 4)) === eventYear
        )) {
          const publishedAsta = entry.boundaries.astaStart;
          const publishedEnd = entry.boundaries.astaEnd;
          const conjunctionType = publishedConjunctionType(entry);
          const publishedAstaEvent = nearestEvent(planet, new Date(publishedAsta.instant));
          const publishedUdayaEvent = nearestEvent(planet, new Date(publishedEnd.instant));
          const ranked = candidates.map((window, index) => {
            const astaError = dayNumber(window.asta.predictedBoundaryDate) - dayNumber(publishedAsta.local);
            const udayaError = dayNumber(window.udaya.predictedBoundaryDate) - dayNumber(publishedEnd.local);
            return { window, index, astaError, udayaError, score: Math.abs(astaError) + Math.abs(udayaError) };
          }).filter(item => !used.has(item.index) && conjunctionType &&
            item.window.conjunctionType === conjunctionType &&
            publishedAstaEvent && publishedUdayaEvent &&
            item.window.asta.direction === (publishedAstaEvent.direction === 1 ? 'rise' : 'set') &&
            item.window.udaya.direction === (publishedUdayaEvent.direction === 1 ? 'rise' : 'set') &&
            Math.abs(item.astaError) <= 30 && Math.abs(item.udayaError) <= 30)
            .sort((a, b) => a.score - b.score);
          const best = ranked[0];
          if (!best) {
            predictions.push({ id: entry.id, matched: false, expectedConjunctionType: conjunctionType,
              publishedAstaDirection: publishedAstaEvent?.direction === 1 ? 'rise' : publishedAstaEvent ? 'set' : null,
              publishedUdayaDirection: publishedUdayaEvent?.direction === 1 ? 'rise' : publishedUdayaEvent ? 'set' : null });
            continue;
          }
          used.add(best.index);
          predictions.push({
            id: entry.id, matched: true,
            conjunctionType: best.window.conjunctionType,
            astaDirection: best.window.asta.direction,
            udayaDirection: best.window.udaya.direction,
            predictedAstaDate: best.window.asta.predictedBoundaryDate,
            publishedAstaDate: publishedAsta.local.slice(0, 10),
            predictedAstaTime: best.window.asta.predictedEventLocalTime,
            publishedAstaTime: publishedAsta.local.slice(11, 16),
            predictedUdayaDate: best.window.udaya.predictedBoundaryDate,
            publishedUdayaDate: publishedEnd.local.slice(0, 10),
            predictedUdayaTime: best.window.udaya.predictedEventLocalTime,
            publishedUdayaTime: publishedEnd.local.slice(11, 16),
            astaErrorDays: best.astaError,
            udayaErrorDays: best.udayaError,
            astaClockErrorMinutes: clockError(best.window.asta.predictedEventLocalTime, publishedAsta.local.slice(11, 16)),
            udayaClockErrorMinutes: clockError(best.window.udaya.predictedEventLocalTime, publishedEnd.local.slice(11, 16))
          });
        }
      }
      const matched = predictions.filter(item => item.matched);
      output.push({
        planet, model: variant.name, thresholdTarget: targetKey, holdoutYear, available: true,
        trainingWindows: training.length, holdoutWindows: holdouts.length,
        trainingCounts, matchedCount: matched.length,
        unmatchedCount: predictions.length - matched.length,
        astaDate: summarize(matched.map(x => x.astaErrorDays)),
        udayaDate: summarize(matched.map(x => x.udayaErrorDays)),
        astaClockMinutes: summarize(matched.map(x => x.astaClockErrorMinutes)),
        udayaClockMinutes: summarize(matched.map(x => x.udayaClockErrorMinutes)),
        predictions
      });
      }
    }
  }
}
console.log(JSON.stringify({
  title: "Pithoragarh leave-one-source-year-out event-direction and threshold-target validation",
  method: "For each held-out Drik source year, train only on the other direct Pithoragarh source years. Match only candidates with the same conjunction family as the nearest solar conjunction to the published window midpoint, the same topocentric local rise/set directions measured at both published boundaries, and both Asta-start and Asta-end civil-date errors within 30 days. Rank eligible candidates by the sum of absolute start/end date errors. Other planets use magnitude-only because their local annual sample counts are too small for extra coefficients.",
  motionDefinition: "Topocentric local rise/set direction (rise=+1, set=-1) plus magnitude interaction. Geocentric retrograde and longitude rate are calculated in the sample ledger but are not fitted in this experiment because previous blind tests did not show consistent gains. Threshold target variants: current event Sun altitude, midpoint of previous/current event Sun altitude, previous event Sun altitude.",
  holdoutSource: "Direct Drik Pithoragarh city pages; observer proxy 29.5828 N, 80.2182 E, 1650 m. Drik internal observer coordinates remain undisclosed.",
  warning: "Research-only; one-day civil-date error remains a release failure. Held-out year samples are never used to fit their own fold.",
  output
}, null, 2));
