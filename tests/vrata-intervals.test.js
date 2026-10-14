// Standalone contract tests for vrata interval mathematics.
// This file intentionally contains its own tiny test-only helper.
// It does NOT import or change app.js, festivals.json, or Blogger runtime.
// Run from the repository root with: node --test tests/vrata-intervals.test.js

const test = require("node:test");
const assert = require("node:assert/strict");

function toTimestamp(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function intervalRelation(a, b) {
  const read = (interval) => {
    if (!interval || typeof interval !== "object") return null;
    const start = toTimestamp(interval.start);
    const end = toTimestamp(interval.end);
    if (start === null || end === null) return null;
    if (!(start < end)) return null;
    return { start, end };
  };

  const left = read(a);
  if (!left) {
    return { status: "unresolved", reason: "invalid-or-missing-A-endpoint" };
  }
  const right = read(b);
  if (!right) {
    return { status: "unresolved", reason: "invalid-or-missing-B-endpoint" };
  }

  const overlapStart = Math.max(left.start, right.start);
  const overlapEnd = Math.min(left.end, right.end);
  if (overlapStart >= overlapEnd) {
    return { status: "no-overlap", reason: overlapStart === overlapEnd ? "touching-boundary" : "disjoint" };
  }
  return { status: "overlap", start: overlapStart, end: overlapEnd };
}

test("INT-01: reports partial overlap", () => {
  assert.deepEqual(intervalRelation({ start: 100, end: 200 }, { start: 150, end: 250 }),
    { status: "overlap", start: 150, end: 200 });
});

test("INT-02: reports contained interval overlap", () => {
  assert.deepEqual(intervalRelation({ start: 100, end: 200 }, { start: 120, end: 180 }),
    { status: "overlap", start: 120, end: 180 });
});

test("INT-03: touching boundary is not positive-duration overlap", () => {
  assert.deepEqual(intervalRelation({ start: 100, end: 200 }, { start: 200, end: 250 }),
    { status: "no-overlap", reason: "touching-boundary" });
});

test("INT-04: reports a gap as no overlap", () => {
  assert.deepEqual(intervalRelation({ start: 100, end: 150 }, { start: 160, end: 200 }),
    { status: "no-overlap", reason: "disjoint" });
});

test("INT-05: reports identical intervals", () => {
  assert.deepEqual(intervalRelation({ start: 100, end: 200 }, { start: 100, end: 200 }),
    { status: "overlap", start: 100, end: 200 });
});

test("INT-06: missing A.start is unresolved, not false", () => {
  assert.deepEqual(intervalRelation({ end: 200 }, { start: 100, end: 200 }),
    { status: "unresolved", reason: "invalid-or-missing-A-endpoint" });
});

test("INT-07: reversed interval is unresolved", () => {
  assert.deepEqual(intervalRelation({ start: 200, end: 100 }, { start: 100, end: 250 }),
    { status: "unresolved", reason: "invalid-or-missing-A-endpoint" });
});

test("INT-08: zero-duration interval is unresolved", () => {
  assert.deepEqual(intervalRelation({ start: 100, end: 100 }, { start: 100, end: 250 }),
    { status: "unresolved", reason: "invalid-or-missing-A-endpoint" });
});

test("INT-09: malformed timestamp is unresolved", () => {
  assert.deepEqual(intervalRelation({ start: "not-a-date", end: 200 }, { start: 100, end: 200 }),
    { status: "unresolved", reason: "invalid-or-missing-A-endpoint" });
});

test("INT-10: missing B.end is unresolved", () => {
  assert.deepEqual(intervalRelation({ start: 100, end: 200 }, { start: 100 }),
    { status: "unresolved", reason: "invalid-or-missing-B-endpoint" });
});

test("accepts parseable ISO timestamps without changing interval semantics", () => {
  assert.deepEqual(
    intervalRelation(
      { start: "2026-10-14T00:00:00.000Z", end: "2026-10-14T02:00:00.000Z" },
      { start: "2026-10-14T01:00:00.000Z", end: "2026-10-14T03:00:00.000Z" }
    ),
    { status: "overlap", start: Date.parse("2026-10-14T01:00:00.000Z"), end: Date.parse("2026-10-14T02:00:00.000Z") }
  );
});
