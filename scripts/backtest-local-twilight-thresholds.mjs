import * as Astronomy from "astronomy-engine";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { findLocalRiseSet } from "../local-horizon-events.mjs";

const inputPath = new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url);
const dataset = JSON.parse(await readFile(inputPath, "utf8"));
const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const planets = ["Jupiter", "Venus"];
const timezone = "Asia/Kolkata";
const trainingEndYear = 2025;
const scanStart = "2025-01-01";
const scanEnd = "2028-01-01";
const maxMatchDays = 21;

function localDateString(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(date);
}

function addDays(dateString, amount) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
}

function dateRange(start, endExclusive) {
  const dates = [];
  for (let date = start; date < endExclusive; date = addDays(date, 1)) dates.push(date);
  return dates;
}

function horizontalPosition(body, date) {
  const equatorial = Astronomy.Equator(body, date, observer, true, true);
  return Astronomy.Horizon(date, observer, equatorial.ra, equatorial.dec, "normal");
}

function localVisibilityGeometry(planet, date) {
  const planetHor = horizontalPosition(Astronomy.Body[planet], date);
  const sunHor = horizontalPosition(Astronomy.Body.Sun, date);
  const rawAzimuthDifference = Math.abs(
    ((planetHor.azimuth - sunHor.azimuth + 540) % 360) - 180
  );
  return {
    solarDepressionDegrees: -sunHor.altitude,
    azimuthDifferenceDegrees: rawAzimuthDifference
  };
}

function solarDepression(date) {
  return localVisibilityGeometry("Jupiter", date).solarDepressionDegrees;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function localDateTime(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(date).filter(x => x.type !== "literal");
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":" + p.minute + ":" + p.second;
}

const sourceBoundaries = dataset.windows
  .filter(row =>
    row.sourceLocation === "Pithoragarh, Uttarakhand, India" &&
    planets.includes(row.planet) &&
    row.acceptanceEligible === true &&
    row.sourceStatus === "direct-page-captured-browser-verified"
  )
  .flatMap(row => ["astaStart", "astaEnd"].map(boundary => {
    const source = row.boundaries[boundary];
    const sourceInstant = new Date(source.normalizedUtcInstant);
    const localDate = source.normalizedLocalDateTime.slice(0, 10);
    const sourceDay = findLocalRiseSet({
      astronomy: Astronomy,
      body: row.planet,
      observer,
      localDate,
      timeZone: timezone
    });
    const nearest = ["rise", "set"]
      .map(direction => ({
        direction,
        event: sourceDay[direction],
        differenceMs: sourceDay[direction]
          ? Math.abs(new Date(sourceDay[direction].instant).getTime() - sourceInstant.getTime())
          : Number.POSITIVE_INFINITY
      }))
      .sort((a, b) => a.differenceMs - b.differenceMs)[0];
    if (!nearest?.event || nearest.differenceMs > 5 * 60_000) {
      throw new Error("Could not classify source horizon direction: " + row.id + ":" + boundary);
    }
    return {
      id: row.id + ":" + boundary,
      windowId: row.id,
      planet: row.planet,
      boundary,
      direction: nearest.direction,
      sourceDateTime: source.normalizedLocalDateTime,
      sourceInstant,
      ...localVisibilityGeometry(row.planet, sourceInstant),
      sourceYear: Number(source.normalizedLocalDateTime.slice(0, 4))
    };
  }));

const thresholds = [];
for (const planet of planets) {
  for (const boundary of ["astaStart", "astaEnd"]) {
    for (const direction of ["rise", "set"]) {
      const training = sourceBoundaries.filter(row =>
        row.planet === planet && row.boundary === boundary &&
        row.direction === direction && row.sourceYear <= trainingEndYear
      );
      if (!training.length) continue;
      const xs = training.map(row => row.azimuthDifferenceDegrees);
      const ys = training.map(row => row.solarDepressionDegrees);
      const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
      const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
      const varianceX = xs.reduce((sum, value) => sum + (value - meanX) ** 2, 0);
      const slope = training.length >= 3 && varianceX > 1e-9
        ? xs.reduce((sum, value, index) => sum + (value - meanX) * (ys[index] - meanY), 0) / varianceX
        : 0;
      const boundedSlope = Math.max(-0.25, Math.min(0.25, slope));
      const intercept = meanY - boundedSlope * meanX;
      thresholds.push({
        planet,
        boundary,
        direction,
        interceptDegrees: intercept,
        slopeDegreesPerAzimuthDegree: boundedSlope,
        trainingSamples: training.length,
        trainingYears: [...new Set(training.map(row => row.sourceYear))].sort(),
        trainingResidualsDegrees: training.map(row => Number((
          row.solarDepressionDegrees -
          (intercept + boundedSlope * row.azimuthDifferenceDegrees)
        ).toFixed(5)))
      });
    }
  }
}

const thresholdMap = new Map(thresholds.map(row => [
  row.planet + ":" + row.boundary + ":" + row.direction,
  row
]));
const dailyEvents = new Map();
const dates = dateRange(scanStart, scanEnd);

for (const planet of planets) {
  const eventsByDirection = { rise: [], set: [] };
  for (const localDate of dates) {
    const events = findLocalRiseSet({
      astronomy: Astronomy,
      body: planet,
      observer,
      localDate,
      timeZone: timezone
    });
    for (const direction of ["rise", "set"]) {
      const event = events[direction];
      if (!event) continue;
      const instant = new Date(event.instant);
      eventsByDirection[direction].push({
        instant,
        localDateTime: localDateTime(instant),
        ...localVisibilityGeometry(planet, instant)
      });
    }
  }
  dailyEvents.set(planet, eventsByDirection);
}

const candidateRows = [];
for (const thresholdRow of thresholds) {
  const { planet, boundary, direction, interceptDegrees, slopeDegreesPerAzimuthDegree } = thresholdRow;
  const thresholdAt = event => interceptDegrees + slopeDegreesPerAzimuthDegree * event.azimuthDifferenceDegrees;
  const eventsByDirection = dailyEvents.get(planet);
  {
      const series = eventsByDirection[direction];
      for (let index = 1; index < series.length; index++) {
        const previous = series[index - 1];
        const current = series[index];
        const previousThreshold = thresholdAt(previous);
        const currentThreshold = thresholdAt(current);
        const a = previous.solarDepressionDegrees - previousThreshold;
        const b = current.solarDepressionDegrees - currentThreshold;
        if (a * b > 0 || b === a) continue;
        // The actual Asta/Udaya timestamp is the planet's local horizon
        // crossing on one civil date. Threshold crossing only selects which
        // daily rise/set event is the boundary; do not interpolate across
        // the ~24-hour spacing between consecutive daily events.
        const chosen = Math.abs(a) <= Math.abs(b) ? previous : current;
        const instant = chosen.instant;
        candidateRows.push({
          planet,
          boundary,
          direction,
          previousThresholdDegrees: Number(previousThreshold.toFixed(5)),
          currentThresholdDegrees: Number(currentThreshold.toFixed(5)),
          previousLocalDateTime: previous.localDateTime,
          currentLocalDateTime: current.localDateTime,
          previousSolarDepressionDegrees: Number(previous.solarDepressionDegrees.toFixed(5)),
          currentSolarDepressionDegrees: Number(current.solarDepressionDegrees.toFixed(5)),
          previousAzimuthDifferenceDegrees: Number(previous.azimuthDifferenceDegrees.toFixed(5)),
          currentAzimuthDifferenceDegrees: Number(current.azimuthDifferenceDegrees.toFixed(5)),
          instant,
          localDateTime: localDateTime(instant)
        });
      }
  }
}

const holdout = sourceBoundaries.filter(row => row.sourceYear > trainingEndYear);
const matched = [];
const usedCandidates = new Set();
for (const source of holdout) {
  const choices = candidateRows
    .map((candidate, index) => ({
      candidate, index,
      differenceMinutes: (candidate.instant.getTime() - source.sourceInstant.getTime()) / 60_000
    }))
    .filter(item =>
      item.candidate.planet === source.planet &&
      item.candidate.boundary === source.boundary &&
      item.candidate.direction === source.direction &&
      !usedCandidates.has(item.index) &&
      Math.abs(item.differenceMinutes) <= maxMatchDays * 1440
    )
    .sort((a, b) => Math.abs(a.differenceMinutes) - Math.abs(b.differenceMinutes));
  const best = choices[0];
  if (!best) {
    matched.push({
      sourceBoundaryId: source.id,
      planet: source.planet,
      boundary: source.boundary,
      direction: source.direction,
      sourceDateTime: source.sourceDateTime,
      matched: false
    });
    continue;
  }
  usedCandidates.add(best.index);
  matched.push({
    sourceBoundaryId: source.id,
    planet: source.planet,
    boundary: source.boundary,
    direction: source.direction,
    sourceDateTime: source.sourceDateTime,
    predictedDateTime: best.candidate.localDateTime,
    predictedDirection: best.candidate.direction,
    candidateBracket: {
      previousLocalDateTime: best.candidate.previousLocalDateTime,
      currentLocalDateTime: best.candidate.currentLocalDateTime,
      previousSolarDepressionDegrees: best.candidate.previousSolarDepressionDegrees,
      currentSolarDepressionDegrees: best.candidate.currentSolarDepressionDegrees,
      previousAzimuthDifferenceDegrees: best.candidate.previousAzimuthDifferenceDegrees,
      currentAzimuthDifferenceDegrees: best.candidate.currentAzimuthDifferenceDegrees
    },
    differenceMinutes: Number(best.differenceMinutes.toFixed(2)),
    absoluteDifferenceMinutes: Number(Math.abs(best.differenceMinutes).toFixed(2)),
    matched: true
  });
}

const sourceDayDiagnostics = [];
for (const source of holdout) {
  const localDate = source.sourceDateTime.slice(0, 10);
  const day = findLocalRiseSet({
    astronomy: Astronomy,
    body: source.planet,
    observer,
    localDate,
    timeZone: timezone
  });
  sourceDayDiagnostics.push({
    sourceBoundaryId: source.id,
    sourceDateTime: source.sourceDateTime,
    rise: day.rise ? {
      localDate: day.rise.localDate,
      localTime: day.rise.localTime,
      solarDepressionDegrees: Number(solarDepression(new Date(day.rise.instant)).toFixed(5))
    } : null,
    set: day.set ? {
      localDate: day.set.localDate,
      localTime: day.set.localTime,
      solarDepressionDegrees: Number(solarDepression(new Date(day.set.instant)).toFixed(5))
    } : null
  });
}

const groupedSummary = [];
for (const planet of planets) {
  for (const boundary of ["astaStart", "astaEnd"]) {
    for (const direction of ["rise", "set"]) {
    const rows = matched.filter(row => row.planet === planet && row.boundary === boundary && row.direction === direction && row.matched);
    const abs = rows.map(row => row.absoluteDifferenceMinutes);
    groupedSummary.push({
      planet, boundary, direction,
      holdoutMatches: rows.length,
      holdoutUnmatched: matched.filter(row => row.planet === planet && row.boundary === boundary && !row.matched).length,
      medianAbsoluteErrorMinutes: abs.length ? Number(median(abs).toFixed(2)) : null,
      maxAbsoluteErrorMinutes: abs.length ? Number(Math.max(...abs).toFixed(2)) : null,
      errors: rows.map(row => ({
        source: row.sourceDateTime,
        predicted: row.predictedDateTime,
        direction: row.predictedDirection,
        differenceMinutes: row.differenceMinutes
      }))
    });
    }
  }
}

const output = {
  schemaVersion: "1.0.0",
  generatedAtUtc: new Date().toISOString(),
  engine: "astronomy-engine@2.1.19 (MIT)",
  observer: { latitude: observer.latitude, longitude: observer.longitude, elevationMeters: observer.height, exactProviderCoordinates: false },
  trainingPolicy: "Only source boundaries whose local event year is <= 2025 fit a direction-specific linear arcus-visionis proxy: solar depression as a function of absolute Sun/planet azimuth separation. No 2026-2027 source boundary is used for fitting.",
  trainingEndYear,
  thresholds: thresholds.map(row => ({ ...row, thresholdDegrees: Number(row.thresholdDegrees.toFixed(5)) })),
  scanRange: { start: scanStart, endExclusive: scanEnd, localDays: dates.length },
  candidateCount: candidateRows.length,
  holdoutBoundaryCount: holdout.length,
  matched,
  sourceDayDiagnostics,
  groupedSummary,
  conclusion: "diagnostic-only; the fitted azimuth correction is a small-sample empirical proxy, not a validated universal visibility law; no production values generated",
  limitations: [
    "The named-city source does not publish its exact observer coordinates/elevation.",
    "The model uses representative Pithoragarh coordinates and a fixed local atmosphere/refraction model.",
    "Linear interpolation is between consecutive daily planet horizon crossings; errors must be evaluated on holdout years.",
    "A small holdout sample cannot establish long-term validity."
  ]
};

const outputPath = process.env.OUTPUT_PATH || "artifacts/local-twilight-threshold-backtest.json";
const slash = outputPath.lastIndexOf("/");
await mkdir(slash >= 0 ? outputPath.slice(0, slash) : ".", { recursive: true });
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({
  result: "PASS",
  training: output.thresholds,
  holdoutBoundaryCount: output.holdoutBoundaryCount,
  groupedSummary,
  outputPath
}, null, 2));
