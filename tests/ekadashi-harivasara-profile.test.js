// Test-only Hari-vasara interval profile. Not a public parana calculator.
// The first-quarter model is scoped to the cited Dvadashi-bhuyastva passage;
// it must not be treated as a universal Ekadashi rule.

const test = require("node:test");
const assert = require("node:assert/strict");

function instant(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function evaluate(input) {
  if (!input || input.profile !== "dharmasindhu-dvadashi-bhuyastva-first-quarter") {
    return { status: "unresolved", reason: "explicit-harivasara-profile-required" };
  }
  const start = instant(input.dvadashiStart);
  const end = instant(input.dvadashiEnd);
  const candidate = instant(input.candidate);
  if (start === null || end === null || candidate === null || start >= end) {
    return { status: "unresolved", reason: "invalid-or-missing-interval-or-candidate" };
  }
  const boundary = start + (end - start) / 4;
  return {
    status: candidate < boundary ? "blocked-during-harivasara" : "outside-harivasara",
    sourceId: "PAR-HV-01",
    profile: input.profile,
    boundary,
    exactClockTime: null
  };
}

test("HV-PROFILE-01: no implicit universal Hari-vasara profile", () => {
  assert.deepEqual(evaluate({ dvadashiStart: 1000, dvadashiEnd: 1600, candidate: 1100 }), {
    status: "unresolved",
    reason: "explicit-harivasara-profile-required"
  });
});

test("HV-PROFILE-02: candidate before first-quarter boundary is blocked in this profile", () => {
  assert.deepEqual(evaluate({
    profile: "dharmasindhu-dvadashi-bhuyastva-first-quarter",
    dvadashiStart: 1000, dvadashiEnd: 1600, candidate: 1149
  }), {
    status: "blocked-during-harivasara",
    sourceId: "PAR-HV-01",
    profile: "dharmasindhu-dvadashi-bhuyastva-first-quarter",
    boundary: 1150,
    exactClockTime: null
  });
});

test("HV-PROFILE-03: exact end boundary is outside the half-open interval", () => {
  assert.equal(evaluate({
    profile: "dharmasindhu-dvadashi-bhuyastva-first-quarter",
    dvadashiStart: 1000, dvadashiEnd: 1600, candidate: 1150
  }).status, "outside-harivasara");
});

test("HV-PROFILE-04: missing or reversed interval stays unresolved", () => {
  assert.deepEqual(evaluate({
    profile: "dharmasindhu-dvadashi-bhuyastva-first-quarter",
    dvadashiStart: 1600, dvadashiEnd: 1000, candidate: 1200
  }), {
    status: "unresolved",
    reason: "invalid-or-missing-interval-or-candidate"
  });
});
