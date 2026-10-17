/**
 * Conservative festival review gate.
 *
 * This module never calculates tithi or changes calendar dates. It classifies
 * a candidate only after a caller supplies a completed Panchang calculation
 * and a reviewed rule profile. Missing evidence always means manual review.
 */

const VALID_REVIEW_MODES = new Set(["routine", "manual"]);

export function classifyFestivalReview(event, evidence = {}, ruleProfile = {}) {
  const reasons = [];
  if (!event || typeof event !== "object") {
    return result("needs-review", ["event-missing"]);
  }

  if (ruleProfile.reviewMode === "manual") {
    return result("manual-review", ["rule-requires-human-review"]);
  }
  if (!VALID_REVIEW_MODES.has(ruleProfile.reviewMode)) {
    reasons.push("rule-profile-not-approved-for-auto-review");
  }
  if (!ruleProfile.ruleId || !ruleProfile.ruleVersion) {
    reasons.push("missing-reviewed-rule-version");
  }
  if (!evidence.calculationCompleted) reasons.push("panchang-calculation-not-completed");
  if (!evidence.calculationTestsPassed) reasons.push("calculation-tests-not-passed");
  if (!evidence.expectedTithi || !evidence.computedTithi) reasons.push("tithi-evidence-missing");
  if (evidence.expectedTithi && evidence.computedTithi &&
      evidence.expectedTithi !== evidence.computedTithi) {
    reasons.push("computed-tithi-mismatch");
  }
  if (!evidence.computedDate || !event.date) reasons.push("date-evidence-missing");
  if (evidence.computedDate && event.date && evidence.computedDate !== event.date) {
    reasons.push("computed-date-mismatch");
  }
  if (evidence.conflict === true) reasons.push("known-calendar-conflict");
  if (evidence.exceptionDetected === true) reasons.push("rule-exception-detected");
  if (evidence.independentCheckPassed !== true) reasons.push("independent-check-not-passed");
  if (event.reviewStatus === "user-confirmed-hard-copy") {
    return result("manual-confirmed", ["confirmed-by-user-hard-copy"]);
  }

  return reasons.length ? result("needs-review", reasons) :
    result("auto-approved", ["reviewed-rule-and-calculation-gates-passed"]);

  function result(status, why) {
    return { status, reasons: why };
  }
}

/**
 * Evaluate records without mutating them. The caller must provide rule profiles
 * and evidence explicitly; this prevents missing metadata from becoming approval.
 */
export function evaluateFestivalBatch(events, getEvidence, getRuleProfile) {
  if (!Array.isArray(events)) throw new TypeError("events must be an array");
  return events.map(event => ({
    date: event?.date ?? null,
    title: event?.title ?? "",
    ...classifyFestivalReview(
      event,
      typeof getEvidence === "function" ? getEvidence(event) ?? {} : {},
      typeof getRuleProfile === "function" ? getRuleProfile(event) ?? {} : {}
    )
  }));
}
