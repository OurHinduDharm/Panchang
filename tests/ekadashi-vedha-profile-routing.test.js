// Research-only routing tests: preserve separate Smarta and Vaishnava Dashami-vedha observations.
// This does NOT select an Ekadashi fasting date or implement duration/tie-break rules.
// Rule leads recorded in data/references/vrata-decision-test-matrix.md; verify the chosen print edition before runtime use.

const test = require("node:test");
const assert = require("node:assert/strict");

function asInstant(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const n = Date.parse(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function contains(interval, time) {
  if (!interval) return { status: "unresolved", reason: "missing-dashami-interval" };
  const start = asInstant(interval.start);
  const end = asInstant(interval.end);
  const at = asInstant(time);
  if (start === null || end === null || at === null || start >= end) {
    return { status: "unresolved", reason: "invalid-or-missing-time-input" };
  }
  return { status: at >= start && at < end ? "present" : "absent" };
}

function inspectProfile(input) {
  if (!input || !["smarta-sunrise-vedha", "vaishnava-arunodaya-vedha"].includes(input.profile)) {
    return { status: "unresolved", reason: "explicit-smarta-or-vaishnava-profile-required" };
  }
  const observationTime = input.profile === "smarta-sunrise-vedha"
    ? input.sunrise
    : input.arunodaya;
  if (asInstant(observationTime) === null) {
    return { status: "unresolved", reason: "profile-specific-observation-time-required" };
  }
  return {
    status: "observation-ready",
    profile: input.profile,
    observation: contains(input.dashami, observationTime),
    fastingDateDecision: "not-decided-by-this-test"
  };
}

test("VP-01: no default tradition is inferred", () => {
  assert.deepEqual(inspectProfile({
    dashami: { start: 100, end: 200 }, arunodaya: 150, sunrise: 220
  }), {
    status: "unresolved",
    reason: "explicit-smarta-or-vaishnava-profile-required"
  });
});

test("VP-02: Smarta profile inspects Dashami at sunrise only", () => {
  assert.deepEqual(inspectProfile({
    profile: "smarta-sunrise-vedha",
    dashami: { start: 100, end: 200 },
    arunodaya: 150,
    sunrise: 220
  }), {
    status: "observation-ready",
    profile: "smarta-sunrise-vedha",
    observation: { status: "absent" },
    fastingDateDecision: "not-decided-by-this-test"
  });
});

test("VP-03: Vaishnava profile inspects Dashami at Arunodaya only", () => {
  assert.deepEqual(inspectProfile({
    profile: "vaishnava-arunodaya-vedha",
    dashami: { start: 100, end: 200 },
    arunodaya: 150,
    sunrise: 220
  }), {
    status: "observation-ready",
    profile: "vaishnava-arunodaya-vedha",
    observation: { status: "present" },
    fastingDateDecision: "not-decided-by-this-test"
  });
});

test("VP-04: missing profile-specific timestamp remains unresolved", () => {
  assert.deepEqual(inspectProfile({
    profile: "vaishnava-arunodaya-vedha",
    dashami: { start: 100, end: 200 },
    sunrise: 220
  }), {
    status: "unresolved",
    reason: "profile-specific-observation-time-required"
  });
});

test("VP-05: invalid Dashami interval remains unresolved", () => {
  assert.deepEqual(inspectProfile({
    profile: "smarta-sunrise-vedha",
    dashami: { start: 200, end: 100 },
    arunodaya: 150,
    sunrise: 220
  }), {
    status: "observation-ready",
    profile: "smarta-sunrise-vedha",
    observation: { status: "unresolved", reason: "invalid-or-missing-time-input" },
    fastingDateDecision: "not-decided-by-this-test"
  });
});
