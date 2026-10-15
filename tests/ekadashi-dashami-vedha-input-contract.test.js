// Research-only contract tests for separating Arunodaya and sunrise observations.
// This file does NOT decide whether Dashami-vedha disqualifies a vrata date.
// No universal Arunodaya duration or 45/55-ghati threshold is encoded here.
// Run: node --test tests/ekadashi-dashami-vedha-input-contract.test.js

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

function tithiAt(interval, observation) {
  if (!interval || typeof interval !== "object") {
    return { status: "unresolved", reason: "missing-tithi-interval" };
  }
  const start = instant(interval.start);
  const end = instant(interval.end);
  const at = instant(observation);
  if (start === null || end === null || at === null || start >= end) {
    return { status: "unresolved", reason: "invalid-or-missing-time-input" };
  }
  // Tithi interval is half-open [start, end): exact end belongs to the next tithi.
  return { status: at >= start && at < end ? "present" : "absent" };
}

function observeDashami({ dashami, arunodaya, sunrise }) {
  if (instant(arunodaya) === null || instant(sunrise) === null) {
    return { status: "unresolved", reason: "both-arunodaya-and-sunrise-required" };
  }
  return {
    status: "observations-ready",
    arunodaya: tithiAt(dashami, arunodaya),
    sunrise: tithiAt(dashami, sunrise),
    decision: "not-decided-by-this-contract"
  };
}

test("DV-IN-01: Dashami can be present at Arunodaya but absent at sunrise", () => {
  assert.deepEqual(observeDashami({
    dashami: { start: 100, end: 200 },
    arunodaya: 150,
    sunrise: 220
  }), {
    status: "observations-ready",
    arunodaya: { status: "present" },
    sunrise: { status: "absent" },
    decision: "not-decided-by-this-contract"
  });
});

test("DV-IN-02: Dashami can be absent at Arunodaya but present at sunrise", () => {
  assert.deepEqual(observeDashami({
    dashami: { start: 180, end: 260 },
    arunodaya: 150,
    sunrise: 220
  }), {
    status: "observations-ready",
    arunodaya: { status: "absent" },
    sunrise: { status: "present" },
    decision: "not-decided-by-this-contract"
  });
});

test("DV-IN-03: exact tithi end is not counted as present", () => {
  assert.deepEqual(tithiAt({ start: 100, end: 200 }, 200), { status: "absent" });
});

test("DV-IN-04: missing either observation stays unresolved", () => {
  assert.deepEqual(observeDashami({
    dashami: { start: 100, end: 200 },
    arunodaya: 150
  }), {
    status: "unresolved",
    reason: "both-arunodaya-and-sunrise-required"
  });
});

test("DV-IN-05: reversed or malformed tithi interval stays unresolved", () => {
  assert.deepEqual(tithiAt({ start: 200, end: 100 }, 150), {
    status: "unresolved",
    reason: "invalid-or-missing-time-input"
  });
});


test("DV-IN-06: observation immediately before tithi start is absent", () => {
  assert.deepEqual(tithiAt({ start: 100, end: 200 }, 99), { status: "absent" });
});

test("DV-IN-07: exact tithi start is present", () => {
  assert.deepEqual(tithiAt({ start: 100, end: 200 }, 100), { status: "present" });
});

test("DV-IN-08: observation immediately before tithi end is present", () => {
  assert.deepEqual(tithiAt({ start: 100, end: 200 }, 199), { status: "present" });
});

test("DV-IN-09: exact tithi end is absent (half-open interval)", () => {
  assert.deepEqual(tithiAt({ start: 100, end: 200 }, 200), { status: "absent" });
});
