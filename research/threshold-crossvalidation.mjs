/**
 * Leave-one-year-out stability check for empirical Sun-depression thresholds.
 *
 * Every held-out year is removed as a whole (not just one boundary row) before
 * calculating the median threshold. This measures calibration stability; it
 * does not approve visibility dates or change the production candidate model.
 */
export function medianFinite(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function groupKey(item) {
  return [
    item.planet,
    item.boundary,
    item.expectedHorizonEventType
  ].join(":");
}

export function leaveOneYearOutThresholdAudit(observations, {
  maxTrainingYear = 2025,
  minTrainingSamples = 2
} = {}) {
  if (!Array.isArray(observations)) {
    throw new TypeError("observations must be an array");
  }
  if (!Number.isInteger(maxTrainingYear) || maxTrainingYear < 1900 ||
      !Number.isInteger(minTrainingSamples) || minTrainingSamples < 2) {
    throw new RangeError("invalid cross-validation year or sample minimum");
  }

  const eligible = observations.filter(item =>
    item.branchMatchesConjunction === true &&
    Number.isInteger(item.sourceYear) &&
    item.sourceYear <= maxTrainingYear &&
    Number.isFinite(item.sunDepressionDeg) &&
    ["Jupiter", "Venus"].includes(item.planet) &&
    ["astaStart", "astaEnd"].includes(item.boundary) &&
    ["rise", "set"].includes(item.expectedHorizonEventType)
  );
  const rows = eligible.map(target => {
    const key = groupKey(target);
    // Exclude the entire validation year to avoid same-year boundary leakage.
    const training = eligible.filter(item =>
      groupKey(item) === key && item.sourceYear !== target.sourceYear
    );
    const threshold = training.length >= minTrainingSamples
      ? medianFinite(training.map(item => item.sunDepressionDeg))
      : null;
    const residual = threshold === null
      ? null : target.sunDepressionDeg - threshold;
    return {
      targetId: target.sourceWindowId ?? null,
      targetYear: target.sourceYear,
      planet: target.planet,
      boundary: target.boundary,
      eventType: target.expectedHorizonEventType,
      group: key,
      validationSunDepressionDeg: Number(target.sunDepressionDeg.toFixed(6)),
      trainingSampleCount: training.length,
      trainingYears: [...new Set(training.map(item => item.sourceYear))].sort(),
      leaveOneYearOutThresholdDeg: threshold === null ? null : Number(threshold.toFixed(6)),
      signedResidualDeg: residual === null ? null : Number(residual.toFixed(6)),
      absoluteResidualDeg: residual === null ? null : Number(Math.abs(residual).toFixed(6)),
      status: threshold === null ? "insufficient-other-year-training-samples" : "evaluated"
    };
  }).sort((a, b) =>
    a.group.localeCompare(b.group) || a.targetYear - b.targetYear ||
    String(a.targetId).localeCompare(String(b.targetId))
  );

  const groups = [...new Set(rows.map(row => row.group))].sort().map(group => {
    const members = rows.filter(row => row.group === group);
    const evaluated = members.filter(row => row.status === "evaluated");
    const residuals = evaluated.map(row => row.signedResidualDeg);
    const absolute = evaluated.map(row => row.absoluteResidualDeg);
    const mean = values => values.length
      ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(6))
      : null;
    return {
      group,
      records: members.length,
      evaluatedRecords: evaluated.length,
      unresolvedRecords: members.length - evaluated.length,
      meanSignedResidualDeg: mean(residuals),
      meanAbsoluteResidualDeg: mean(absolute),
      maxAbsoluteResidualDeg: absolute.length ? Math.max(...absolute) : null,
      residuals: members
    };
  });

  return {
    schemaVersion: 1,
    policy: {
      method: "leave-one-calendar-year-out median threshold residual",
      maxTrainingYear,
      minTrainingSamples,
      wholeYearExcluded: true,
      holdoutTuning: false,
      timePredictionAttempted: false,
      publicationEligible: false
    },
    records: rows.length,
    evaluatedRecords: rows.filter(row => row.status === "evaluated").length,
    unresolvedRecords: rows.filter(row => row.status !== "evaluated").length,
    groups,
    publicationEligible: false,
    interpretation: "This diagnostic measures how stable the empirical Sun-depression threshold is when an entire source year is withheld. It is not a heliacal date/time validation and never changes or approves thresholds."
  };
}
