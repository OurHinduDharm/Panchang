import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { combineMonthlyFestivalFiles } from "../scripts/merge-festival-months-to-yearly.mjs";

function fixtureDir() {
  const dir = mkdtempSync(join(tmpdir(), "ohd-festival-years-"));
  mkdirSync(dir, { recursive: true });
  return dir;
}
function writeMonth(dir, month, status, events) {
  writeFileSync(join(dir, "2026-" + String(month).padStart(2, "0") + ".json"), JSON.stringify({
    schemaVersion: 1, year: 2026, month, status, events
  }));
}

test("combines only selected year's months and preserves event content and links", () => {
  const dir = fixtureDir();
  try {
    const original = { date: "2026-10-17", title: "सप्तमी", description: "विवरण", articleUrl: "https://example.org/article", reviewStatus: "needs-review" };
    writeMonth(dir, 10, "needs-review", [original]);
    writeMonth(dir, 11, "needs-review", [{ date: "2026-11-05", title: "एकादशी", reviewStatus: "needs-review" }]);
    writeFileSync(join(dir, "2027-01.json"), JSON.stringify({ year: 2027, month: 1, events: [{ title: "दूसरा वर्ष" }] }));
    const result = combineMonthlyFestivalFiles(dir, 2026);
    assert.equal(result.data.year, 2026);
    assert.equal(result.data.status, "needs-review");
    assert.deepEqual(result.data.sourceMonths, ["2026-10.json", "2026-11.json"]);
    assert.deepEqual(result.data.events[0], original);
    assert.equal(result.data.events[0].articleUrl, original.articleUrl);
    assert.equal(result.data.eventCount, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("preserves duplicate date/title records and reports them instead of silently deleting", () => {
  const dir = fixtureDir();
  try {
    const item = { date: "2026-10-17", title: "पर्व", reviewStatus: "approved" };
    writeMonth(dir, 10, "approved", [item]);
    writeMonth(dir, 11, "approved", [item]);
    const result = combineMonthlyFestivalFiles(dir, 2026);
    assert.equal(result.data.events.length, 2);
    assert.ok(result.warnings.some(w => w.includes("Possible duplicate (preserved")));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("any missing or pending review status prevents yearly data from being marked approved", () => {
  const dir = fixtureDir();
  try {
    writeMonth(dir, 10, "approved", [{ date: "2026-10-01", title: "A", reviewStatus: "approved" }]);
    writeMonth(dir, 11, "approved", [{ date: "2026-11-01", title: "B" }]);
    assert.equal(combineMonthlyFestivalFiles(dir, 2026).data.status, "needs-review");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("rejects an invalid year and a directory without that year's monthly files", () => {
  const dir = fixtureDir();
  try {
    assert.throws(() => combineMonthlyFestivalFiles(dir, 1800), /year must be/);
    assert.throws(() => combineMonthlyFestivalFiles(dir, 2026), /No monthly JSON files/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
