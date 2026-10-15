// Source-grounded contract tests for the Dharmasindhu Śravaṇa-Dvādaśī rule profile.
// This intentionally tests only the rule-selection guardrails. It does NOT compute
// astronomical intervals, choose a vrata date, or modify production/Blogger runtime.
// Source transcription: https://www.transliteral.org/pages/z80503221630/view

const test = require("node:test");
const assert = require("node:assert/strict");

function ruleProfile(input) {
  if (!input || typeof input !== "object") {
    return { status: "unresolved", reason: "missing-input" };
  }
  const { month, paksha, isShravanaDvadashi, vishnuShrinkhalaYoga, priorTantraTwoFast } = input;
  if (!month || !paksha || typeof isShravanaDvadashi !== "boolean") {
    return { status: "unresolved", reason: "missing-observance-identity" };
  }
  if (!isShravanaDvadashi) {
    return { status: "not-applicable", reason: "not-identified-as-shravana-dvadashi" };
  }
  if (typeof vishnuShrinkhalaYoga !== "boolean") {
    return { status: "unresolved", reason: "vishnu-shrinkhala-status-required" };
  }

  const bhadrapadaSpecial = month === "Bhadrapada" && paksha === "Shukla";
  const middle20GhatikaRule = bhadrapadaSpecial
    ? "consider-only-if-feasible-and-never-cross-dvadashi"
    : "do-not-apply-bhadrapada-specific-exclusion";

  if (!vishnuShrinkhalaYoga) {
    return {
      status: "rule-profile",
      paranaProfile: "principal-view-after-both-dvadashi-and-shravana-end-on-trayodashi",
      secondaryView: "end-of-either-one-is-a-minor-view",
      middle20GhatikaRule
    };
  }

  if (typeof priorTantraTwoFast !== "boolean") {
    return { status: "unresolved", reason: "prior-tantra-two-fast-status-required" };
  }
  if (!priorTantraTwoFast) {
    return {
      status: "unresolved",
      reason: "yoga-present-but-prior-tantra-two-fast-condition-not-met"
    };
  }
  return {
    status: "rule-profile",
    paranaProfile: "conditional-yoga-prior-tantra-duration-comparison-required",
    durationComparisonRequired: true,
    doNotComputeExactTimeYet: true,
    middle20GhatikaRule
  };
}

test("RULE-01: missing identity is unresolved rather than guessed", () => {
  assert.deepEqual(ruleProfile({}), {
    status: "unresolved",
    reason: "missing-observance-identity"
  });
});

test("RULE-02: missing Vishnu-shrinkhala determination blocks branch selection", () => {
  assert.deepEqual(ruleProfile({
    month: "Bhadrapada", paksha: "Shukla", isShravanaDvadashi: true
  }), {
    status: "unresolved",
    reason: "vishnu-shrinkhala-status-required"
  });
});

test("RULE-03: without Vishnu-shrinkhala, principal view waits for both ends; one-end view is secondary", () => {
  const result = ruleProfile({
    month: "Bhadrapada", paksha: "Shukla", isShravanaDvadashi: true,
    vishnuShrinkhalaYoga: false
  });
  assert.equal(result.paranaProfile, "principal-view-after-both-dvadashi-and-shravana-end-on-trayodashi");
  assert.equal(result.secondaryView, "end-of-either-one-is-a-minor-view");
  assert.equal(result.middle20GhatikaRule, "consider-only-if-feasible-and-never-cross-dvadashi");
});

test("RULE-04: yoga branch requires explicit prior-tantra two-fast status", () => {
  assert.deepEqual(ruleProfile({
    month: "Bhadrapada", paksha: "Shukla", isShravanaDvadashi: true,
    vishnuShrinkhalaYoga: true
  }), {
    status: "unresolved",
    reason: "prior-tantra-two-fast-status-required"
  });
});

test("RULE-05: a yoga result without the prior-tantra condition stays unresolved", () => {
  assert.deepEqual(ruleProfile({
    month: "Bhadrapada", paksha: "Shukla", isShravanaDvadashi: true,
    vishnuShrinkhalaYoga: true, priorTantraTwoFast: false
  }), {
    status: "unresolved",
    reason: "yoga-present-but-prior-tantra-two-fast-condition-not-met"
  });
});

test("RULE-05: yoga plus prior-tantra profile requires comparing remaining durations; no time is invented", () => {
  const result = ruleProfile({
    month: "Bhadrapada", paksha: "Shukla", isShravanaDvadashi: true,
    vishnuShrinkhalaYoga: true, priorTantraTwoFast: true
  });
  assert.equal(result.paranaProfile, "conditional-yoga-prior-tantra-duration-comparison-required");
  assert.equal(result.durationComparisonRequired, true);
  assert.equal(result.doNotComputeExactTimeYet, true);
});

test("RULE-07: middle-20-ghatika exclusion is not generalized to Magha/Falguna Krishna", () => {
  for (const month of ["Magha", "Phalguna"]) {
    const result = ruleProfile({
      month, paksha: "Krishna", isShravanaDvadashi: true,
      vishnuShrinkhalaYoga: false
    });
    assert.equal(result.middle20GhatikaRule, "do-not-apply-bhadrapada-specific-exclusion");
  }
});

test("RULE-08: non-Shravana-Dvadashi observance is not processed by this special rule", () => {
  assert.deepEqual(ruleProfile({
    month: "Bhadrapada", paksha: "Shukla", isShravanaDvadashi: false,
    vishnuShrinkhalaYoga: false
  }), {
    status: "not-applicable",
    reason: "not-identified-as-shravana-dvadashi"
  });
});
