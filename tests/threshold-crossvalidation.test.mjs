import test from "node:test";
import assert from "node:assert/strict";
import { leaveOneYearOutThresholdAudit } from "../research/threshold-crossvalidation.mjs";

const observation = (year, value, id, extra = {}) => ({
  sourceYear: year,
  sourceWindowId: id,
  planet: "Venus",
  boundary: "astaEnd",
  expectedHorizonEventType: "set",
  branchMatchesConjunction: true,
  sunDepressionDeg: value,
  ...extra
});

test("leaves the complete target year out before fitting its threshold", () => {
  const report = leaveOneYearOutThresholdAudit([
    observation(2021, 5.6, "a"),
    observation(2022, 5.8, "b"),
    observation(2023, 6.0, "c"),
    observation(2024, 6.2, "d")
  ]);
  const rows = report.groups[0].residuals;
  const target2024 = rows.find(row => row.targetYear === 2024);
  assert.equal(target2024.trainingSampleCount, 3);
  assert.deepEqual(target2024.trainingYears, [2021, 2022, 2023]);
  assert.equal(target2024.leaveOneYearOutThresholdDeg, 5.8);
  assert.equal(target2024.signedResidualDeg, 0.4);
  assert.equal(report.policy.wholeYearExcluded, true);
  assert.equal(report.publicationEligible, false);
});

test("does not borrow samples across planet, boundary, city and branch labels", () => {
  const report = leaveOneYearOutThresholdAudit([
    observation(2021, 5.6, "v21"),
    observation(2022, 5.8, "v22"),
    observation(2023, 6.0, "v23"),
    observation(2021, 10.1, "j21", { planet: "Jupiter" }),
    observation(2022, 10.2, "j22", { planet: "Jupiter" }),
    observation(2023, 10.3, "j23", { planet: "Jupiter" }),
    observation(2021, 5.9, "wrong-branch", { expectedHorizonEventType: "rise" }),
    observation(2022, 6.0, "wrong-branch-2", { expectedHorizonEventType: "rise" })
  ]);
  const venusSet = report.groups.find(group => group.group === "Venus:astaEnd:set");
  assert.equal(venusSet.records, 3);
  assert.equal(venusSet.residuals.find(row => row.targetYear === 2021).trainingSampleCount, 2);
  assert.ok(report.groups.some(group => group.group === "Jupiter:astaEnd:set"));
  assert.ok(report.groups.some(group => group.group === "Venus:astaEnd:rise"));
});

test("marks a year unresolved when fewer than two other-year samples remain", () => {
  const report = leaveOneYearOutThresholdAudit([
    observation(2024, 5.6, "a"),
    observation(2025, 5.8, "b")
  ]);
  assert.equal(report.evaluatedRecords, 0);
  assert.equal(report.unresolvedRecords, 2);
  assert.ok(report.groups[0].residuals.every(row =>
    row.status === "insufficient-other-year-training-samples"
  ));
});

test("rejects malformed policy settings", () => {
  assert.throws(() => leaveOneYearOutThresholdAudit([], { minTrainingSamples: 1 }), /invalid cross-validation/);
  assert.throws(() => leaveOneYearOutThresholdAudit(null), /observations must be an array/);
});
