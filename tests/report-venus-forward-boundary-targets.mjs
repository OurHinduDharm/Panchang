import { readFile } from "node:fs/promises";
import * as Astronomy from "astronomy-engine";
import { generateVisibilityWindows } from "../research/planetary-visibility-selector.mjs";

const data = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2021-2027.json", import.meta.url),
  "utf8"
));
const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86400000;
const TARGETS = ["thresholdCurrent", "thresholdMidpoint", "thresholdPrevious"];

function dayNumber(value) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}
function nearestEvent(body, anchor) {
  const start = new Date(anchor.getTime() - 12 * 3600000);
  const events = [1, -1].map(direction => {
    const result = Astronomy.SearchRiseSet(body, observer, direction, start, 1, 0);
    return result?.date ? {
      direction,
      date: result.date,
      deltaMinutes: Math.abs(result.date.getTime() - anchor.getTime()) / 60000
    } : null;
  }).filter(Boolean).sort((a, b) => a.deltaMinutes - b.deltaMinutes);
  return events[0] && events[0].deltaMinutes <= 10 ? events[0] : null;
}
function sunAltitude(date) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}
function sample(entry, boundaryName) {
  const anchor = new Date(entry.boundaries[boundaryName].normalizedUtcInstant);
  const current = nearestEvent("Venus", anchor);
  if (!current) return null;
  const previous = Astronomy.SearchRiseSet(
    "Venus", observer, current.direction,
    new Date(anchor.getTime() - 36 * 3600000), 1, 0
  );
  if (!previous?.date) return null;
  const before = sunAltitude(previous.date);
  const now = sunAltitude(current.date);
  return {
    apparentMagnitude: Astronomy.Illumination("Venus", current.date).mag,
    thresholdCurrent: now,
    thresholdMidpoint: (before + now) / 2,
    thresholdPrevious: before
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
function fit(samples, target) {
  const usable = samples.filter(row =>
    Number.isFinite(row.apparentMagnitude) && Number.isFinite(row[target])
  );
  if (usable.length < 3) return null;
  const xMean = usable.reduce((sum, row) => sum + row.apparentMagnitude, 0) / usable.length;
  const yMean = usable.reduce((sum, row) => sum + row[target], 0) / usable.length;
  const denominator = usable.reduce((sum, row) =>
    sum + (row.apparentMagnitude - xMean) ** 2, 0
  );
  if (denominator < 1e-9) return null;
  const slope = usable.reduce((sum, row) =>
    sum + (row.apparentMagnitude - xMean) * (row[target] - yMean), 0
  ) / denominator;
  return { intercept: yMean - slope * xMean, slope, sampleCount: usable.length };
}
function summarizeDays(values) {
  const valid = values.filter(Number.isFinite);
  return {
    count: valid.length,
    exact: valid.filter(value => value === 0).length,
    withinOneDay: valid.filter(value => Math.abs(value) <= 1).length,
    meanAbsoluteErrorDays: valid.length
      ? Number((valid.reduce((sum, value) => sum + Math.abs(value), 0) / valid.length).toFixed(3))
      : null,
    maxAbsoluteErrorDays: valid.length ? Math.max(...valid.map(Math.abs)) : null
  };
}
function summarizeMinutes(values) {
  const valid = values.filter(Number.isFinite);
  return {
    count: valid.length,
    withinOneMinute: valid.filter(value => Math.abs(value) <= 1).length,
    withinFiveMinutes: valid.filter(value => Math.abs(value) <= 5).length,
    meanAbsoluteErrorMinutes: valid.length
      ? Number((valid.reduce((sum, value) => sum + Math.abs(value), 0) / valid.length).toFixed(2))
      : null,
    maxAbsoluteErrorMinutes: valid.length ? Math.max(...valid.map(Math.abs)) : null
  };
}
function clockError(predicted, published) {
  const parse = value => {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };
  const a = parse(predicted), b = parse(published);
  return a === null || b === null ? null : ((a - b + 720 + 1440) % 1440) - 720;
}
const entries = data.windows.filter(entry =>
  entry.planet === "Venus" &&
  entry.sourceLocation === "Pithoragarh, Uttarakhand, India" &&
  entry.acceptanceEligible === true &&
  entry.sourceStatus === "direct-page-captured-browser-verified" &&
  entry.precision === "minute" &&
  entry.boundaries?.astaStart?.normalizedUtcInstant &&
  entry.boundaries?.astaEnd?.normalizedUtcInstant
);
const years = [...new Set(entries.map(entry => entry.sourcePageYear))].sort((a, b) => a - b);
const output = [];

for (const astaTarget of TARGETS) {
  for (const udayaTarget of TARGETS) {
    const predictions = [];
    for (const holdoutYear of years) {
      const holdouts = entries.filter(entry => entry.sourcePageYear === holdoutYear);
      const training = entries.filter(entry => entry.sourcePageYear < holdoutYear);
      if (!holdouts.length) continue;

      const modelByBoundary = {};
      let ready = true;
      for (const [boundaryName, target] of [
        ["astaStart", astaTarget],
        ["astaEnd", udayaTarget]
      ]) {
        const samples = training.map(entry => sample(entry, boundaryName)).filter(Boolean);
        modelByBoundary[boundaryName] = fit(samples, target);
        if (!modelByBoundary[boundaryName]) ready = false;
      }
      if (!ready) {
        predictions.push({
          holdoutYear,
          available: false,
          reason: "Insufficient earlier-year Venus samples"
        });
        continue;
      }

      const eventYears = [...new Set(holdouts.map(entry =>
        Number(entry.boundaries.astaStart.normalizedLocalDateTime.slice(0, 4))
      ))].sort((a, b) => a - b);
      const candidates = eventYears.flatMap(eventYear =>
        generateVisibilityWindows({
          astronomy: Astronomy,
          body: "Venus",
          observer,
          modelByBoundary,
          startDate: new Date(Date.UTC(eventYear, 0, 1)),
          endDate: new Date(Date.UTC(eventYear, 11, 31, 23, 59, 59)),
          searchDays: 60,
          timeZone: TIME_ZONE
        }).filter(window =>
          window.status === "candidate" &&
          window.asta.predictedBoundaryDate?.slice(0, 4) === String(eventYear)
        )
      );

      const used = new Set();
      for (const entry of holdouts) {
        const publishedAsta = entry.boundaries.astaStart.normalizedLocalDateTime;
        const ranked = candidates.map((window, index) => ({
          window, index,
          error: dayNumber(window.asta.predictedBoundaryDate) - dayNumber(publishedAsta)
        })).filter(item => !used.has(item.index) && Math.abs(item.error) <= 30)
          .sort((a, b) => Math.abs(a.error) - Math.abs(b.error));
        const best = ranked[0];
        if (!best) {
          predictions.push({ holdoutYear, id: entry.id, matched: false });
          continue;
        }
        used.add(best.index);
        const publishedUdaya = entry.boundaries.astaEnd.normalizedLocalDateTime;
        predictions.push({
          holdoutYear,
          id: entry.id,
          matched: true,
          predictedAstaDate: best.window.asta.predictedBoundaryDate,
          publishedAstaDate: publishedAsta.slice(0, 10),
          astaErrorDays: best.error,
          astaClockErrorMinutes: clockError(
            best.window.asta.predictedEventLocalTime, publishedAsta.slice(11, 16)
          ),
          predictedUdayaDate: best.window.udaya.predictedBoundaryDate,
          publishedUdayaDate: publishedUdaya.slice(0, 10),
          udayaErrorDays: dayNumber(best.window.udaya.predictedBoundaryDate) - dayNumber(publishedUdaya),
          udayaClockErrorMinutes: clockError(
            best.window.udaya.predictedEventLocalTime, publishedUdaya.slice(11, 16)
          )
        });
      }
    }
    const matched = predictions.filter(item => item.matched);
    output.push({
      astaTarget,
      udayaTarget,
      matchedCount: matched.length,
      unavailableFolds: predictions.filter(item => item.available === false).length,
      astaDates: summarizeDays(matched.map(item => item.astaErrorDays)),
      udayaDates: summarizeDays(matched.map(item => item.udayaErrorDays)),
      astaClockMinutes: summarizeMinutes(matched.map(item => item.astaClockErrorMinutes)),
      udayaClockMinutes: summarizeMinutes(matched.map(item => item.udayaClockErrorMinutes)),
      predictions
    });
  }
}

console.log(JSON.stringify({
  title: "Venus Pithoragarh forward-only boundary-target ablation",
  method: "For every held-out source year, fit each boundary independently using only earlier Pithoragarh source years. Compare current-event, midpoint and previous-event solar-altitude targets across all nine Asta/Udaya target pairs.",
  observer: "29.5828 N, 80.2182 E, 1650 m project proxy; Drik observer coordinates are undisclosed.",
  source: "Direct browser-verified Pithoragarh Venus annual pages; city-label-only comparison.",
  warning: "Research-only. A target combination is not promoted on the strength of one favorable 2027 fold; compare all forward-only years and exact clock errors.",
  output
}, null, 2));
