import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const benchmark = JSON.parse(await readFile(
  new URL("../data/asta-udaya-benchmark.json", import.meta.url), "utf8"
));
const direct = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2024-2027.json", import.meta.url), "utf8"
));
const TIME_ZONE = "Asia/Kolkata";
const NEW_DELHI_PROXY = new Astronomy.Observer(28.6139, 77.2090, 216);

function dayNumber(value) {
  return Date.UTC(...value.slice(0, 10).split("-").map((part, index) =>
    index === 1 ? Number(part) - 1 : Number(part)
  )) / 86400000;
}

function observerFor(entry) {
  if (/New Delhi/i.test(entry.sourceLocation || "")) return NEW_DELHI_PROXY;
  const p = entry.testObserver;
  if (!Number.isFinite(p?.latitude) || !Number.isFinite(p?.longitude)) return null;
  return new Astronomy.Observer(p.latitude, p.longitude, p.elevationMeters ?? 0);
}

function nearestEvent(body, observer, anchor) {
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

function sunAltitude(date, observer) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}

function trainingSample(entry, boundaryName) {
  const observer = observerFor(entry);
  const anchor = new Date(entry.boundaries[boundaryName]);
  const current = nearestEvent(entry.planet, observer, anchor);
  if (!current) return null;
  const previousStart = new Date(anchor.getTime() - 36 * 3600000);
  const previous = Astronomy.SearchRiseSet(entry.planet, observer, current.direction, previousStart, 1, 0);
  if (!previous?.date) return null;
  const beforeAltitude = sunAltitude(previous.date, observer);
  const currentAltitude = sunAltitude(current.date, observer);
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

const trainingEntries = benchmark.cases.filter(entry =>
  ["published-reference", "independently-confirmed-city-label-only"].includes(entry.status) &&
  /New Delhi/i.test(entry.sourceLocation || "") &&
  entry.precision === "minute" &&
  observerFor(entry)
);

// Every holdout row below comes from a direct browser capture of the named
// Pithoragarh Drik page. User-transcribed rows are deliberately excluded.
const holdoutEntries = direct.windows.map(window => ({
  id: window.id,
  planet: window.planet,
  sourceLocation: window.sourceLocation,
  sourcePageUrl: window.sourcePageUrl,
  comparisonLevel: window.comparisonLevel,
  sourceStatus: window.sourceStatus,
  testObserver: window.testObserver,
  precision: window.sourcePrecision,
  boundaries: {
    astaStart: window.boundaries.astaStart.normalizedLocalDateTime,
    astaEnd: window.boundaries.astaEnd.normalizedLocalDateTime
  }
})).filter(entry =>
  entry.sourceStatus === "direct-page-captured-browser-verified" &&
  entry.comparisonLevel === "city-label-only" &&
  entry.precision === "minute" &&
  observerFor(entry)
);

const output = [];
for (const planet of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
  const planetTraining = trainingEntries.filter(entry => entry.planet === planet);
  const modelByBoundary = {};
  const trainingCounts = {};
  let ready = true;

  for (const boundary of ["astaStart", "astaEnd"]) {
    const samples = planetTraining.map(entry => trainingSample(entry, boundary)).filter(Boolean);
    trainingCounts[boundary] = samples.length;
    modelByBoundary[boundary] = fit(samples);
    if (!modelByBoundary[boundary]) ready = false;
  }

  const planetHoldouts = holdoutEntries.filter(entry => entry.planet === planet);
  if (!planetHoldouts.length) continue;
  if (!ready) {
    output.push({
      planet, available: false, trainingCounts,
      holdoutCount: planetHoldouts.length,
      reason: "Insufficient independent New Delhi calibration samples"
    });
    continue;
  }

  const years = [...new Set(planetHoldouts.map(entry =>
    Number(entry.boundaries.astaStart.slice(0, 4))
  ))];
  const predictions = [];
  for (const year of years) {
    const observer = observerFor(planetHoldouts.find(entry =>
      Number(entry.boundaries.astaStart.slice(0, 4)) === year
    ));
    const searchDays = planet === "Mercury" ? 45 : planet === "Mars" ? 90 : 60;
    const windows = generateVisibilityWindows({
      astronomy: Astronomy, body: planet, observer, modelByBoundary,
      startDate: new Date(Date.UTC(year, 0, 1)),
      endDate: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
      searchDays, timeZone: TIME_ZONE
    });
    const candidates = windows.filter(window =>
      window.status === "candidate" &&
      window.asta.predictedBoundaryDate?.slice(0, 4) === String(year)
    );
    const used = new Set();
    for (const entry of planetHoldouts.filter(item =>
      Number(item.boundaries.astaStart.slice(0, 4)) === year
    )) {
      const targetStart = entry.boundaries.astaStart.slice(0, 10);
      const ranked = candidates.map((window, index) => ({
        window, index,
        error: dayNumber(window.asta.predictedBoundaryDate) - dayNumber(targetStart)
      })).filter(item => !used.has(item.index))
        .sort((a, b) => Math.abs(a.error) - Math.abs(b.error));
      const best = ranked[0];
      if (!best || Math.abs(best.error) > 30) {
        predictions.push({
          id: entry.id, matched: false,
          publishedAstaDate: targetStart,
          sourcePageUrl: entry.sourcePageUrl
        });
        continue;
      }
      used.add(best.index);
      const publishedUdaya = entry.boundaries.astaEnd.slice(0, 10);
      predictions.push({
        id: entry.id, matched: true,
        sourcePageUrl: entry.sourcePageUrl,
        conjunctionType: best.window.conjunctionType,
        predictedAstaDate: best.window.asta.predictedBoundaryDate,
        predictedAstaTime: best.window.asta.predictedEventLocalTime,
        publishedAstaDate: targetStart,
        astaErrorDays: best.error,
        predictedUdayaDate: best.window.udaya.predictedBoundaryDate,
        predictedUdayaTime: best.window.udaya.predictedEventLocalTime,
        publishedUdayaDate: publishedUdaya,
        udayaErrorDays: dayNumber(best.window.udaya.predictedBoundaryDate) - dayNumber(publishedUdaya)
      });
    }
  }

  const matched = predictions.filter(x => x.matched);
  const summarize = key => {
    const errors = matched.map(x => x[key]);
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
  };
  output.push({
    planet, available: true, trainingCounts,
    holdoutCount: planetHoldouts.length, matchedCount: matched.length,
    unmatchedCount: predictions.length - matched.length,
    asta: summarize("astaErrorDays"),
    udaya: summarize("udayaErrorDays"),
    predictions
  });
}

console.log(JSON.stringify({
  title: "Pithoragarh direct-Drik cross-location blind Asta/Udaya holdout",
  training: "Independent New Delhi Drik published-reference pages only; no Pithoragarh values used to fit coefficients.",
  holdout: {
    source: "Direct Drik named-city Pithoragarh pages, captured by Playwright Chromium",
    sourcePages: direct.verifiedPages,
    windows: holdoutEntries.length,
    cityId: direct.sourceCityId,
    comparisonLevel: "city-label-only; Drik provider coordinates/elevation are not published"
  },
  method: "Fit each planet's solar-altitude-at-local-horizon threshold from New Delhi reference apparitions; use actual topocentric Pithoragarh planet rise/set instants for event clocks; infer blind Asta/Udaya dates around computed conjunctions.",
  warning: "Research diagnostic only. Same-city direct source validation is now available, but provider coordinates remain undisclosed and the current candidate model has not passed exact-date acceptance. Do not publish predictions yet.",
  output
}, null, 2));
