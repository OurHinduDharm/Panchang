import test from "node:test";
import assert from "node:assert/strict";
import { classifyFestivalReview, evaluateFestivalBatch } from "../scripts/festival-auto-review.mjs";

const event = { date: "2026-10-03", title: "मासिक कालाष्टमी", reviewStatus: "needs-review" };
const routineRule = { reviewMode: "routine", ruleId: "krishna-ashtami-nishita", ruleVersion: "1" };
const goodEvidence = {
  calculationCompleted: true,
  calculationTestsPassed: true,
  expectedTithi: "कृष्ण अष्टमी",
  computedTithi: "कृष्ण अष्टमी",
  computedDate: "2026-10-03",
  conflict: false,
  exceptionDetected: false,
  independentCheckPassed: true
};

test("routine event auto-passes only when every evidence gate passes", () => {
  assert.deepEqual(classifyFestivalReview(event, goodEvidence, routineRule), {
    status: "auto-approved",
    reasons: ["reviewed-rule-and-calculation-gates-passed"]
  });
});

test("missing calculation evidence never auto-approves", () => {
  const result = classifyFestivalReview(event, {}, routineRule);
  assert.equal(result.status, "needs-review");
  assert.ok(result.reasons.includes("panchang-calculation-not-completed"));
  assert.ok(result.reasons.includes("independent-check-not-passed"));
});

test("date or tithi mismatch requires review", () => {
  const result = classifyFestivalReview(event, {
    ...goodEvidence,
    computedDate: "2026-10-04",
    computedTithi: "कृष्ण नवमी"
  }, routineRule);
  assert.equal(result.status, "needs-review");
  assert.ok(result.reasons.includes("computed-date-mismatch"));
  assert.ok(result.reasons.includes("computed-tithi-mismatch"));
});

test("disputed rules always go to human review", () => {
  assert.equal(classifyFestivalReview(event, goodEvidence, {
    reviewMode: "manual", ruleId: "ekadashi", ruleVersion: "1"
  }).status, "manual-review");
});

test("unknown rule profile cannot auto-approve", () => {
  assert.equal(classifyFestivalReview(event, goodEvidence, {}).status, "needs-review");
});

test("hard-copy confirmation is preserved as a separate state", () => {
  assert.equal(classifyFestivalReview({
    ...event, reviewStatus: "user-confirmed-hard-copy"
  }, goodEvidence, routineRule).status, "manual-confirmed");
});

test("batch evaluation does not mutate input records and defaults missing evidence to review", () => {
  const before = JSON.stringify([event]);
  const results = evaluateFestivalBatch([event], () => ({}), () => routineRule);
  assert.equal(JSON.stringify([event]), before);
  assert.equal(results[0].status, "needs-review");
});
