// Test-only branch selector for the conditional Dharmasindhu Śravaṇa-Dvādaśī parāṇa rule.
// This does not calculate astronomical intervals or produce a clock-time recommendation.
// Source transcription to verify against the reviewed Sanskrit/Khemraj edition:
// https://www.transliteral.org/pages/z80503221630/view

const test = require("node:test");
const assert = require("node:assert/strict");

function compareRemainingDurations({ comparisonAt, dvadashiEnd, shravanaEnd }) {
  const at = Date.parse(comparisonAt);
  const dEnd = Date.parse(dvadashiEnd);
  const sEnd = Date.parse(shravanaEnd);

  if (![at, dEnd, sEnd].every(Number.isFinite)) {
    return { status: "unresolved", reason: "invalid-or-missing-timestamp" };
  }
  if (dEnd <= at || sEnd <= at) {
    return { status: "unresolved", reason: "both-intervals-must-still-be-active" };
  }

  // Since both remaining durations are measured from the same instant,
  // comparing their end timestamps compares the remaining durations.
  if (dEnd > sEnd) {
    return {
      status: "rule-profile",
      branch: "dvadashi-remains-longer",
      paranaBoundary: "shravana-end-while-dvadashi-remains",
      exactClockTime: null
    };
  }
  if (sEnd > dEnd) {
    return {
      status: "rule-profile",
      branch: "shravana-remains-longer",
      paranaBoundary: "within-dvadashi;-do-not-cross-dvadashi-end",
      exactClockTime: null
    };
  }
  return { status: "unresolved", reason: "equal-end-times-need-textual-interpretation" };
}

test("DUR-01: longer remaining Dvadashi selects Shravana-end boundary", () => {
  assert.deepEqual(compareRemainingDurations({
    comparisonAt: "2026-09-23T00:00:00+05:30",
    dvadashiEnd: "2026-09-23T22:50:00+05:30",
    shravanaEnd: "2026-09-23T09:09:00+05:30"
  }), {
    status: "rule-profile",
    branch: "dvadashi-remains-longer",
    paranaBoundary: "shravana-end-while-dvadashi-remains",
    exactClockTime: null
  });
});

test("DUR-02: longer remaining Shravana forbids crossing Dvadashi end", () => {
  assert.deepEqual(compareRemainingDurations({
    comparisonAt: "2026-09-23T00:00:00+05:30",
    dvadashiEnd: "2026-09-23T06:00:00+05:30",
    shravanaEnd: "2026-09-23T09:09:00+05:30"
  }), {
    status: "rule-profile",
    branch: "shravana-remains-longer",
    paranaBoundary: "within-dvadashi;do-not-cross-dvadashi-end",
    exactClockTime: null
  });
});

test("DUR-03: equal end times remain unresolved rather than guessed", () => {
  assert.deepEqual(compareRemainingDurations({
    comparisonAt: "2026-09-23T00:00:00+05:30",
    dvadashiEnd: "2026-09-23T09:09:00+05:30",
    shravanaEnd: "2026-09-23T09:09:00+05:30"
  }), {
    status: "unresolved",
    reason: "equal-end-times-need-textual-interpretation"
  });
});

test("DUR-04: near-simultaneous ends are compared by exact timestamps, not rounded minutes", () => {
  const result = compareRemainingDurations({
    comparisonAt: "2026-09-23T00:00:00+05:30",
    dvadashiEnd: "2026-09-23T09:09:30+05:30",
    shravanaEnd: "2026-09-23T09:09:00+05:30"
  });
  assert.equal(result.status, "rule-profile");
  assert.equal(result.branch, "dvadashi-remains-longer");
  assert.equal(result.paranaBoundary, "shravana-end-while-dvadashi-remains");
  assert.equal(result.exactClockTime, null);
});

test("DUR-05: Dvadashi already ended at the comparison instant remains unresolved", () => {
  assert.deepEqual(compareRemainingDurations({
    comparisonAt: "2026-09-23T09:09:00+05:30",
    dvadashiEnd: "2026-09-23T09:09:00+05:30",
    shravanaEnd: "2026-09-23T10:00:00+05:30"
  }), {
    status: "unresolved",
    reason: "both-intervals-must-still-be-active"
  });
});

test("DUR-06: an interval already ended at the comparison instant is unresolved", () => {
  assert.deepEqual(compareRemainingDurations({
    comparisonAt: "2026-09-23T09:09:00+05:30",
    dvadashiEnd: "2026-09-23T22:50:00+05:30",
    shravanaEnd: "2026-09-23T09:09:00+05:30"
  }), {
    status: "unresolved",
    reason: "both-intervals-must-still-be-active"
  });
});

test("DUR-07: missing or invalid timestamps are unresolved", () => {
  assert.deepEqual(compareRemainingDurations({
    comparisonAt: "not-a-date",
    dvadashiEnd: "2026-09-23T22:50:00+05:30",
    shravanaEnd: "2026-09-23T09:09:00+05:30"
  }), {
    status: "unresolved",
    reason: "invalid-or-missing-timestamp"
  });
});
