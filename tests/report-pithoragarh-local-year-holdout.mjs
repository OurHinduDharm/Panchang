import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const direct = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2024-2027.json", import.meta.url), "utf8"
));
const TIME_ZONE = "Asia/Kolkata";
const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);

function dayNumber(value) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function clockMinutes(value) {
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function clockErrorMinutes(predicted, published) {
  const a = clockMinutes(predicted), b = clockMinutes(published);
  if (a === null || b === null) return null;
  return ((a - b + 720 + 1440) % 1440) - 720;
}

function nearestEvent(body, anchor) {
  const start = new Date(anchor.getTime() - 12 * 3600000);
  const options = [1, -1].map(direction => {
    const event = Astronomy.SearchRiseSet(body, observer, direction, start, 1, 0);
    return event?.date ? {
      direction,
      date: event.date,
      deltaMinutes: Math.abs(event.date.getTime() - anchor.getTime()) / 60000
    } : null;
  }).filter(Boolean).sort((a, b) => a.deltaMinutes - b.deltaMinutes);
  if (!options.length || options[0].deltaMinutes > 10) return null;
  return options[0];
}

function sunAltitude(date) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}

function trainingSample(entry, boundaryName) {
  const anchor = new Date(entry.boundaries[boundaryName]);
  const current = nearestEvent(entry.planet, anchor);
  if (!current) return null;
  const previous = Astronomy.SearchRiseSet(
    entry.planet, observer, current.direction,
    new Date(anchor.getTime() - 36 * 3600000), 1, 0
  );
  if (!previous?.date) return null;
  const beforeAltitude = sunAltitude(previous.date);
  const currentAltitude = sunAltitude(current.date);
  return {
    id: entry.id,
    magnitude: Astronomy.Illumination(entry.planet, current.date).mag,
    thresholdMidpoint: (beforeAltitude + currentAltitude) / 2,
    direction: current.direction
  };
}

function fit(samples) {
  const mx = samples.reduce((sum, x) => sum + x.magnitude, 0) / samples.length;
  const my = samples.reduce((sum, x) => sum + x.thresholdMidpoint, 0) / samples.length;
  const denominator = samples.reduce((sum, x) => sum + (x.magnitude - mx) ** 2, 0);
  if (samples.length < 3 || denominator < 1e-9) return null;
  const slope = samples.reduce((sum, x) =>
    sum + (x.magnitude - mx) * (x.thresholdMidpoint - my), 0) / denominator;
  return { intercept: my - slope * mx, slope };
}

function summarize(values, within) {
  const errors = values.filter(Number.isFinite);
  return {
    count: errors.length,
    exact: errors.filter(x => x === 0).length,
    withinOne: errors.filter(x => Math.abs(x) <= within).length,
    meanAbsolute: errors.length
      ? Number((errors.reduce((sum, x) => sum + Math.abs(x), 0) / errors.length).toFixed(3))
      : null,
    maxAbsolute: errors.length ? Math.max(...errors.map(Math.abs)) : null
  };
}

const unique = new Map();
for (const window of direct.windows) {
  const key = [window.planet,
    window.boundaries.astaStart.normalizedLocalDateTime,
    window.boundaries.astaEnd.normalizedLocalDateTime].join("|");
  if (!unique.has(key)) {
    unique.set(key, {
      id: window.id,
      planet: window.planet,
      sourceLocation: window.sourceLocation,
      sourcePageUrl: window.sourcePageUrl,
      boundaries: {
        astaStart: window.boundaries.astaStart.normalizedLocalDateTime,
        astaEnd: window.boundaries.astaEnd.normalizedLocalDateTime
      }
    });
  }
}
const entries = [...unique.values()];
const output = [];

for (const planet of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
  const planetEntries = entries.filter(entry => entry.planet === planet);
  const years = [...new Set(planetEntries.map(entry =>
    Number(entry.boundaries.astaStart.slice(0, 4))
  ))].sort();

  for (const holdoutYear of years) {
    const training = planetEntries.filter(entry =>
      Number(entry.boundaries.astaStart.slice(0, 4)) !== holdoutYear
    );
    const holdouts = planetEntries.filter(entry =>
      Number(entry.boundaries.astaStart.slice(0, 4)) === holdoutYear
    );
    const modelByBoundary = {}, trainingCounts = {};
    let ready = true;

    for (const boundary of ["astaStart", "astaEnd"]) {
      const samples = training.map(entry => trainingSample(entry, boundary)).filter(Boolean);
      trainingCounts[boundary] = samples.length;
      modelByBoundary[boundary] = fit(samples);
      if (!modelByBoundary[boundary]) ready = false;
    }
    if (!ready) {
      output.push({
        planet, holdoutYear, available: false,
        trainingWindows: training.length, holdoutWindows: holdouts.length,
        trainingCounts, reason: "Fewer than three usable training samples for a boundary"
      });
      continue;
    }

    const searchDays = planet === "Mercury" ? 45 : planet === "Mars" ? 90 : 60;
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
      const publishedAsta = entry.boundaries.astaStart;
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
      const publishedEnd = entry.boundaries.astaEnd;
      predictions.push({
        id: entry.id, matched: true,
        predictedAstaDate: best.window.asta.predictedBoundaryDate,
        publishedAstaDate: publishedAsta.slice(0, 10),
        astaErrorDays: best.error,
        astaClockErrorMinutes: clockErrorMinutes(
          best.window.asta.predictedEventLocalTime, publishedAsta.slice(11, 16)
        ),
        predictedUdayaDate: best.window.udaya.predictedBoundaryDate,
        publishedUdayaDate: publishedEnd.slice(0, 10),
        udayaErrorDays: dayNumber(best.window.udaya.predictedBoundaryDate) - dayNumber(publishedEnd),
        udayaClockErrorMinutes: clockErrorMinutes(
          best.window.udaya.predictedEventLocalTime, publishedEnd.slice(11, 16)
        )
      });
    }

    const matched = predictions.filter(x => x.matched);
    output.push({
      planet, holdoutYear, available: true,
      trainingWindows: training.length, holdoutWindows: holdouts.length,
      trainingCounts, matchedCount: matched.length,
      unmatchedCount: predictions.length - matched.length,
      astaDate: summarize(matched.map(x => x.astaErrorDays), 1),
      udayaDate: summarize(matched.map(x => x.udayaErrorDays), 1),
      astaClock: summarize(matched.map(x => x.astaClockErrorMinutes), 5),
      udayaClock: summarize(matched.map(x => x.udayaClockErrorMinutes), 5),
      predictions
    });
  }
}

console.log(JSON.stringify({
  title: "Pithoragarh location-calibrated leave-one-year-out Asta/Udaya validation",
  method: "For each planet and held-out start year, fit magnitude-to-solar-altitude boundary models only on other directly captured Pithoragarh years, then predict the held-out year from conjunctions and topocentric local horizon events.",
  holdoutSource: "Direct Drik Pithoragarh pages; provider coordinates are undisclosed; project observer 29.5828 N, 80.2182 E, 1650 m",
  warning: "Research-only cross-validation. Do not use the held-out evaluation rows to fit the same fold. City-label-only source coordinates remain a systematic uncertainty.",
  output
}, null, 2));
