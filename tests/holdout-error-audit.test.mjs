import test from "node:test";
import assert from "node:assert/strict";
import { auditHoldoutRecord, auditReport, localDateKey } from "../research/holdout-error-audit.mjs";

test("localDateKey applies India offset across UTC midnight", () => {
  assert.equal(localDateKey("2026-08-11T20:00:00.000Z"), "2026-08-12");
});

test("audit separates same-local-date clock error from date mismatch", () => {
  const sameDate = auditHoldoutRecord({
    sourceUtcInstant: "2026-08-11T23:33:00.000Z",
    prediction: { instant: "2026-08-10T23:35:38.715Z" }
  });
  assert.equal(sameDate.audit.dateErrorDays, -1);
  assert.equal(sameDate.audit.status, "local-date-mismatch");
  assert.equal(sameDate.audit.publicationEligible, false);

  const clockOnly = auditHoldoutRecord({
    sourceUtcInstant: "2026-08-11T23:33:00.000Z",
    prediction: { instant: "2026-08-12T01:03:00.000Z" }
  });
  assert.equal(clockOnly.audit.dateErrorDays, 0);
  assert.equal(clockOnly.audit.status, "same-local-date-time-mismatch");
});

test("audit report flags low training sample counts and never approves publication", () => {
  const report = auditReport({ cities: [{
    city: "Test",
    holdout: [{
      sourceUtcInstant: "2026-01-01T00:00:00.000Z",
      prediction: { instant: "2026-01-01T00:05:00.000Z" },
      training: { sampleCount: 2 }
    }]
  }] });
  assert.equal(report.cities[0].strictErrorSummary.within15Minutes, 1);
  assert.equal(report.cities[0].strictErrorSummary.lowTrainingSampleRecords, 1);
  assert.equal(report.publicationEligible, false);
});

test("audits threshold residual and conjunction branch independently of date error", () => {
  const record = auditHoldoutRecord({
    sourceUtcInstant: "2026-08-11T23:32:50.000Z",
    expectedHorizonEventType: "rise",
    horizonEventType: "rise",
    conjunctionKind: "conjunction",
    conjunctionInstant: "2026-07-29T00:00:00.000Z",
    sunDepressionDeg: 9.63,
    training: {
      sampleCount: 2,
      thresholdDepressionDeg: 9.16,
      trainingMinDeg: 9.12,
      trainingMaxDeg: 9.20
    },
    prediction: {
      type: "rise",
      instant: "2026-08-10T23:35:38.715Z",
      bracket: ["2026-08-10T23:35:38.715Z", "2026-08-11T23:32:44.697Z"]
    }
  });
  assert.equal(record.audit.sourceBranchMatchesConjunction, true);
  assert.equal(record.audit.predictionBranchMatchesConjunction, true);
  assert.ok(record.audit.sourceMinusThresholdDeg > 0.46);
  assert.equal(record.audit.sourceWithinTrainingDepressionRange, false);
  assert.equal(record.audit.thresholdBracketContainsSourceInstant, true);
  assert.equal(record.audit.publicationEligible, false);
});
