import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDrikBoundary,
  pairDrikEventRows,
  summarizeSourceCaptures
} from "../scripts/annual-tara-source-normalizer.mjs";

test("normalizes 24-plus source clocks without losing raw source text", () => {
  const boundary = parseDrikBoundary("April 23, 2024, Tuesday at 29:07+");
  assert.equal(boundary.rawText, "April 23, 2024, Tuesday at 29:07+");
  assert.equal(boundary.normalizedLocalDateTime, "2024-04-24T05:07:00+05:30");
  assert.equal(boundary.dayRollover, 1);
});

test("keeps ordinary local times on their printed date", () => {
  const boundary = parseDrikBoundary("June 8, 2028, Wednesday at 19:51");
  assert.equal(boundary.normalizedLocalDateTime, "2028-06-08T19:51:00+05:30");
  assert.equal(boundary.dayRollover, 0);
});

test("rejects malformed dates, invalid clocks and unrecognized source text", () => {
  assert.equal(parseDrikBoundary("not a source boundary"), null);
  assert.equal(parseDrikBoundary("February 30, 2028, Wednesday at 19:51"), null);
  assert.equal(parseDrikBoundary("June 8, 2028, Wednesday at 48:00"), null);
});

test("pairs multiple separate Asta windows in source order", () => {
  const row = (event, value) => ({
    event,
    boundary: parseDrikBoundary(value)
  });
  const result = pairDrikEventRows([
    row("astaStart", "March 20, 2025, Thursday at 18:42"),
    row("astaEnd", "March 22, 2025, Saturday at 29:40+"),
    row("astaStart", "December 10, 2025, Wednesday at 30:25+"),
    row("astaEnd", "February 2, 2026, Monday at 18:15")
  ]);
  assert.equal(result.windows.length, 2);
  assert.equal(result.unpaired.length, 0);
  assert.equal(result.windows[0].astaEnd.normalizedLocalDateTime, "2025-03-23T05:40:00+05:30");
  assert.equal(result.windows[1].astaStart.normalizedLocalDateTime, "2025-12-11T06:25:00+05:30");
});

test("quarantines incomplete and reversed boundaries instead of inventing a pair", () => {
  const row = (event, value) => ({
    event,
    boundary: parseDrikBoundary(value)
  });
  const result = pairDrikEventRows([
    row("astaEnd", "March 22, 2025, Saturday at 05:40"),
    row("astaStart", "March 20, 2025, Thursday at 18:42")
  ]);
  assert.equal(result.windows.length, 0);
  assert.equal(result.unpaired.length, 2);
});


test("never counts quarantined source windows as verified review windows", () => {
  const summary = summarizeSourceCaptures([
    {
      status: "quarantined-city-planet-or-year-mismatch",
      windows: [{}, {}]
    },
    {
      status: "source-page-identity-and-boundaries-captured",
      windows: [{}]
    },
    {
      status: "quarantined-incomplete-or-unparsed-event-boundaries",
      windows: [{}, {}, {}]
    }
  ]);
  assert.equal(summary.attemptedPages, 3);
  assert.equal(summary.identityAndBoundaryVerifiedPages, 1);
  assert.equal(summary.quarantinedPages, 2);
  assert.equal(summary.verifiedCandidateWindows, 1);
  assert.equal(summary.quarantinedCandidateWindows, 5);
  assert.equal(summary.totalCandidateWindows, 6);
});

test("reports zero verified candidates when every requested page is quarantined", () => {
  const summary = summarizeSourceCaptures([
    { status: "quarantined-city-planet-or-year-mismatch", windows: [{}] },
    { status: "quarantined-city-planet-or-year-mismatch", windows: [{}] }
  ]);
  assert.equal(summary.verifiedCandidateWindows, 0);
  assert.equal(summary.quarantinedCandidateWindows, 2);
  assert.equal(summary.totalCandidateWindows, 2);
});
