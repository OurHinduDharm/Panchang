/**
 * Research-only audit: does Sun/planet azimuth separation explain variation
 * in the observed Sun-depression threshold better than a fixed median?
 *
 * This does NOT generate event timestamps, tune against holdout years, or
 * authorize publication. It only tests source-boundary geometry.
 */
import fs from "node:fs";

export function signedAzimuthDifference(planetAzimuthDeg, sunAzimuthDeg) {
  if (!Number.isFinite(planetAzimuthDeg) || !Number.isFinite(sunAzimuthDeg)) {
    return null;
  }
  return ((planetAzimuthDeg - sunAzimuthDeg + 540) % 360) - 180;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function fitLinearThreshold(samples) {
  if (!Array.isArray(samples) || samples.length < 3) {
    return { status: "insufficient-samples", sampleCount: samples?.length ?? 0 };
  }
  const points = samples.filter(sample =>
    Number.isFinite(sample.azimuthSeparationDeg) &&
    Number.isFinite(sample.sunDepressionDeg)
  );
  if (points.length < 3) {
    return { status: "insufficient-samples", sampleCount: points.length };
  }

  const meanX = points.reduce((sum, item) => sum + item.azimuthSeparationDeg, 0) / points.length;
  const meanY = points.reduce((sum, item) => sum + item.sunDepressionDeg, 0) / points.length;
  let covariance = 0;
  let variance = 0;
  for (const point of points) {
    const dx = point.azimuthSeparationDeg - meanX;
    covariance += dx * (point.sunDepressionDeg - meanY);
    variance += dx * dx;
  }
  const slope = variance > 1e-12 ? covariance / variance : 0;
  const intercept = meanY - slope * meanX;
  return Object.freeze({
    status: "fitted",
    sampleCount: points.length,
    interceptDeg: intercept,
    slopeDegPerAzimuthDeg: slope
  });
}

function geometryOf(record, city = "Pithoragarh") {
  if (record?.branchMatchesConjunction === false) return null;
  const geometry = record?.sourceGeometry ?? record;
  if (!geometry) return null;
  const delta = signedAzimuthDifference(
    geometry.planetAzimuthDeg,
    geometry.sunAzimuthDeg
  );
  const depression = Number.isFinite(geometry.sunDepressionDeg)
    ? geometry.sunDepressionDeg
    : Number.isFinite(geometry.sunAltitudeDeg) ? -geometry.sunAltitudeDeg
      : Number.isFinite(record.sunDepressionDeg) ? record.sunDepressionDeg : null;
  if (delta === null || !Number.isFinite(depression)) return null;
  return {
    city: record.city ?? city,
    sourceWindowId: record.sourceWindowId,
    sourceYear: record.sourceYear,
    planet: record.planet,
    boundary: record.boundary,
    horizonEventType: record.nearestHorizonEvent?.type ??
      record.horizonEventType ?? record.expectedHorizonEventType ?? null,
    branchMatchesConjunction: record.branchMatchesConjunction ?? null,
    sunDepressionDeg: depression,
    signedAzimuthDifferenceDeg: delta,
    azimuthSeparationDeg: Math.abs(delta),
    apparentMagnitude: geometry.apparentMagnitude ?? record.apparentMagnitude ?? null,
    planetAltitudeDeg: geometry.planetAltitudeDeg ?? record.planetAltitudeDeg ?? null
  };
}

function groupKey(row) {
  return [row.city, row.planet, row.boundary, row.horizonEventType].join(":");
}

function summarizeGroup(key, rows, trainingEndYear, minTrainingSamples) {
  const training = rows.filter(row => row.sourceYear <= trainingEndYear);
  const holdout = rows.filter(row => row.sourceYear > trainingEndYear);
  const loo = [];

  for (const target of training) {
    const rest = training.filter(row => row.sourceYear !== target.sourceYear);
    const fit = fitLinearThreshold(rest);
    if (fit.status !== "fitted") continue;
    const linearPrediction = fit.interceptDeg +
      fit.slopeDegPerAzimuthDeg * target.azimuthSeparationDeg;
    const medianPrediction = median(rest.map(row => row.sunDepressionDeg));
    loo.push({
      targetYear: target.sourceYear,
      sourceWindowId: target.sourceWindowId,
      actualSunDepressionDeg: target.sunDepressionDeg,
      azimuthSeparationDeg: target.azimuthSeparationDeg,
      linearThresholdPredictionDeg: linearPrediction,
      linearAbsoluteErrorDeg: Math.abs(target.sunDepressionDeg - linearPrediction),
      medianThresholdPredictionDeg: medianPrediction,
      medianAbsoluteErrorDeg: Math.abs(target.sunDepressionDeg - medianPrediction)
    });
  }

  const fullFit = fitLinearThreshold(training);
  const fullMedian = median(training.map(row => row.sunDepressionDeg));
  const validHoldout = holdout.map(target => {
    const linearPrediction = fullFit.status === "fitted"
      ? fullFit.interceptDeg + fullFit.slopeDegPerAzimuthDeg * target.azimuthSeparationDeg
      : null;
    return {
      targetYear: target.sourceYear,
      sourceWindowId: target.sourceWindowId,
      actualSunDepressionDeg: target.sunDepressionDeg,
      azimuthSeparationDeg: target.azimuthSeparationDeg,
      linearThresholdPredictionDeg: linearPrediction,
      linearResidualDeg: linearPrediction === null
        ? null : target.sunDepressionDeg - linearPrediction,
      medianThresholdPredictionDeg: fullMedian,
      medianResidualDeg: fullMedian === null
        ? null : target.sunDepressionDeg - fullMedian,
      status: training.length < minTrainingSamples || fullFit.status !== "fitted"
        ? "insufficient-training-review-only"
        : "diagnostic-only-no-event-time-prediction"
    };
  });

  const mean = values => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
  return {
    group: key,
    trainingSampleCount: training.length,
    trainingYears: [...new Set(training.map(row => row.sourceYear))].sort((a,b)=>a-b),
    holdoutSampleCount: holdout.length,
    model: fullFit,
    fixedMedianThresholdDeg: fullMedian,
    leaveOneYearOut: {
      evaluatedSamples: loo.length,
      linearMeanAbsoluteErrorDeg: mean(loo.map(row => row.linearAbsoluteErrorDeg)),
      medianMeanAbsoluteErrorDeg: mean(loo.map(row => row.medianAbsoluteErrorDeg)),
      rows: loo
    },
    holdout: validHoldout
  };
}

export function auditAzimuthConditionedThresholds(report, {
  trainingEndYear = 2025,
  minTrainingSamples = 4
} = {}) {
  if (!report || (!Array.isArray(report.results) && !Array.isArray(report.cities))) {
    throw new TypeError("A planetary city back-test report is required");
  }
  const records = Array.isArray(report.results)
    ? report.results.map(record => ({ record, city: report.observer?.name ?? "Pithoragarh" }))
    : report.cities.flatMap(city =>
        (city.sourceObservations ?? []).map(record => ({
          record,
          city: city.city ?? "unknown-city"
        }))
      );
  const groups = new Map();
  for (const item of records) {
    const record = item.record;
    if (!Number.isInteger(record.sourceYear) ||
        !["Jupiter", "Venus"].includes(record.planet) ||
        !["astaStart", "astaEnd"].includes(record.boundary)) continue;
    const row = geometryOf(record, item.city);
    if (!row || !["rise", "set"].includes(row.horizonEventType)) continue;
    const key = groupKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const audits = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rows]) => summarizeGroup(key, rows, trainingEndYear, minTrainingSamples));

  return Object.freeze({
    schemaVersion: 1,
    model: "azimuth-conditioned-sun-depression-linear-diagnostic-v1",
    sourceReportModel: report.model ?? null,
    observer: report.observer ?? null,\n    inputShape: Array.isArray(report.results) ? "single-city-source-results" : "multi-city-source-observations",
    trainingPolicy: `Source years <= ${trainingEndYear}; whole target year excluded in each leave-one-year-out fit.`,
    feature: "absolute signed local azimuth difference between planet and Sun at the captured local planet rise/set event; each city is isolated",
    comparison: "same-branch fixed median versus a simple linear azimuth-conditioned threshold; source geometry only",
    groups: audits,
    publicationEligible: false,
    interpretation: "This is a small-sample, per-city diagnostic only. It does not predict an Asta/Udaya timestamp, alter the existing threshold engine, establish a physical visibility law, or approve any public data. A lower leave-one-year-out error in a small sample is a hypothesis requiring independent years and cities."
  });
}

const inputIndex = process.argv.indexOf("--input");
const outputIndex = process.argv.indexOf("--output");
if (inputIndex >= 0 && process.argv[inputIndex + 1]) {
  const input = JSON.parse(fs.readFileSync(process.argv[inputIndex + 1], "utf8"));
  const audit = auditAzimuthConditionedThresholds(input);
  if (outputIndex >= 0 && process.argv[outputIndex + 1]) {
    fs.writeFileSync(process.argv[outputIndex + 1], JSON.stringify(audit, null, 2) + "\n");
  }
  console.log(JSON.stringify(audit, null, 2));
}
