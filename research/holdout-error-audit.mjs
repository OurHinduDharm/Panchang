/**
 * Adds strict date/time diagnostics to the city-wise Guru/Shukra holdout report.
 * It deliberately does not tune thresholds or change the underlying predictions.
 *
 * Usage:
 * node research/holdout-error-audit.mjs --input multi-city-planetary-backtest.json --output multi-city-planetary-error-audit.json
 */
import fs from "node:fs";

export function localDateKey(instant, offsetMinutes = 330) {
  const shifted = new Date(Date.parse(instant) + offsetMinutes * 60_000);
  if (!Number.isFinite(shifted.getTime())) return null;
  return shifted.toISOString().slice(0, 10);
}

function dayNumber(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function auditHoldoutRecord(record, offsetMinutes = 330) {
  const sourceInstant = record.sourceUtcInstant;
  const predictedInstant = record.prediction?.instant;
  const sourceMs = Date.parse(sourceInstant);
  const predictedMs = Date.parse(predictedInstant);
  const hasSource = Boolean(sourceInstant) && Number.isFinite(sourceMs);
  const hasPrediction = Boolean(predictedInstant) && Number.isFinite(predictedMs);
  const training = record.training;
  const threshold = training?.thresholdDepressionDeg;
  const sourceDepression = record.sunDepressionDeg;
  const hasThresholdResidual = Number.isFinite(threshold) && Number.isFinite(sourceDepression);
  const thresholdResidualDeg = hasThresholdResidual ? sourceDepression - threshold : null;
  const thresholdRangeAvailable = Number.isFinite(training?.trainingMinDeg) &&
    Number.isFinite(training?.trainingMaxDeg);
  const sourceWithinTrainingRange = hasThresholdResidual && thresholdRangeAvailable
    ? sourceDepression >= training.trainingMinDeg && sourceDepression <= training.trainingMaxDeg
    : null;
  const bracket = record.prediction?.bracket;
  const bracketTimes = Array.isArray(bracket) ? bracket.map(Date.parse) : [];
  const thresholdBracketContainsSource = hasSource && bracketTimes.length === 2 &&
    bracketTimes.every(Number.isFinite) &&
    sourceMs >= Math.min(...bracketTimes) && sourceMs <= Math.max(...bracketTimes);
  const branchExpected = record.expectedHorizonEventType ?? null;
  const branchObserved = record.horizonEventType ?? null;
  const sourceBranchMatches = branchExpected && branchObserved
    ? branchExpected === branchObserved
    : null;
  const predictionBranchMatches = branchExpected && record.prediction?.type
    ? branchExpected === record.prediction.type
    : null;

  const diagnostics = {
    conjunctionKind: record.conjunctionKind ?? null,
    conjunctionInstant: record.conjunctionInstant ?? null,
    expectedHorizonEventType: branchExpected,
    observedHorizonEventType: branchObserved,
    sourceBranchMatchesConjunction: sourceBranchMatches,
    predictionBranchMatchesConjunction: predictionBranchMatches,
    sourceSunDepressionDeg: Number.isFinite(sourceDepression) ? sourceDepression : null,
    trainedThresholdDepressionDeg: Number.isFinite(threshold) ? threshold : null,
    sourceMinusThresholdDeg: Number.isFinite(thresholdResidualDeg)
      ? Number(thresholdResidualDeg.toFixed(4)) : null,
    sourceWithinTrainingDepressionRange: sourceWithinTrainingRange,
    thresholdTrainingSampleCount: training?.sampleCount ?? 0,
    thresholdBracketContainsSourceInstant: thresholdBracketContainsSource
  };

  if (!hasSource || !hasPrediction) {
    return {
      ...record,
      audit: {
        ...diagnostics,
        resolved: false,
        status: record.status || "unresolved-no-valid-prediction",
        publicationEligible: false
      }
    };
  }

  const signedTimeErrorMinutes = (predictedMs - sourceMs) / 60_000;
  const sourceLocalDate = localDateKey(sourceInstant, offsetMinutes);
  const predictedLocalDate = localDateKey(predictedInstant, offsetMinutes);
  const dateErrorDays = dayNumber(predictedLocalDate) - dayNumber(sourceLocalDate);
  const absoluteTimeErrorMinutes = Math.abs(signedTimeErrorMinutes);
  let status;
  if (absoluteTimeErrorMinutes <= 15) status = "within-15-minutes";
  else if (absoluteTimeErrorMinutes <= 60) status = "within-1-hour";
  else if (dateErrorDays === 0) status = "same-local-date-time-mismatch";
  else status = "local-date-mismatch";

  return {
    ...record,
    audit: {
      ...diagnostics,
      resolved: true,
      sourceLocalDate,
      predictedLocalDate,
      dateErrorDays,
      signedTimeErrorMinutes: Number(signedTimeErrorMinutes.toFixed(2)),
      absoluteTimeErrorMinutes: Number(absoluteTimeErrorMinutes.toFixed(2)),
      status,
      publicationEligible: false
    }
  };
}

export function auditReport(report) {
  const cities = (report.cities || []).map(city => {
    const holdout = (city.holdout || []).map(record => auditHoldoutRecord(record));
    const resolved = holdout.filter(record => record.audit.resolved);
    const count = status => holdout.filter(record => record.audit.status === status).length;
    const absErrors = resolved.map(record => record.audit.absoluteTimeErrorMinutes);
    const dateErrors = resolved.map(record => Math.abs(record.audit.dateErrorDays));
    const mean = values => values.length
      ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
      : null;
    return {
      ...city,
      holdout: holdout.map(record => ({
        ...record,
        // Retain legacy day-level flags for comparison, but do not use them as acceptance criteria.
        legacyWithin1Day: record.within1Day === true
      })),
      strictErrorSummary: {
        records: holdout.length,
        resolved: resolved.length,
        within15Minutes: count("within-15-minutes"),
        within1Hour: count("within-1-hour"),
        sameLocalDateButTimeMismatch: count("same-local-date-time-mismatch"),
        localDateMismatch: count("local-date-mismatch"),
        unresolved: count("unresolved-no-valid-prediction"),
        meanAbsoluteTimeErrorMinutes: mean(absErrors),
        maxAbsoluteTimeErrorMinutes: absErrors.length ? Math.max(...absErrors) : null,
        meanAbsoluteLocalDateErrorDays: mean(dateErrors),
        lowTrainingSampleRecords: holdout.filter(record =>
          (record.training?.sampleCount ?? 0) < 4
        ).length
      }
    };
  });
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceReport: "multi-city-planetary-backtest.json",
    policy: {
      timezone: "Asia/Kolkata",
      utcOffsetMinutes: 330,
      strictTimeAcceptanceMinutes: 15,
      strictDateAndTimeMustBothBeReviewed: true,
      minimumTrainingSamplesForConfidence: 4,
      holdoutThresholdTuning: false,
      publicationEligible: false
    },
    cities,
    publicationEligible: false,
    interpretation: "This is a diagnostic audit only. A result within one calendar day is not automatically accepted. Date error is computed on the Asia/Kolkata local calendar; signed and absolute clock-time errors are reported separately. Fewer than four same-city training samples are flagged low-confidence. No thresholds are changed and no result is publication-approved."
  };
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const input = arg("--input");
  const output = arg("--output");
  if (!input || !output) throw new Error("--input and --output are required");
  const report = auditReport(JSON.parse(fs.readFileSync(input, "utf8")));
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report.cities.map(city => ({
    city: city.city,
    strictErrorSummary: city.strictErrorSummary
  })), null, 2));
}
