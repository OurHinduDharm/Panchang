import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../scripts/audit-mahapat-references.mjs", import.meta.url));
const minute = 60_000;
function runAudit() {
  return JSON.parse(execFileSync(process.execPath, [script], {
    encoding: "utf8", maxBuffer: 8 * 1024 * 1024
  }));
}
function classify(row) {
  if (row.status === "partial") return "missing-endpoint";
  if (row.status !== "paired") return "unresolved-association";
  const s = row.startDeltaMinutes, e = row.endDeltaMinutes;
  if (Math.abs(s) <= 3 && Math.abs(e) <= 3) return "within-three-minutes";
  const mid = (s + e) / 2, width = e - s;
  if (Math.abs(width) <= 3 && Math.abs(mid) > 3) return "common-time-shift";
  if (Math.abs(s) <= 3 && Math.abs(e) > 3) return "end-only-discrepancy";
  if (Math.abs(e) <= 3 && Math.abs(s) > 3) return "start-only-discrepancy";
  return "mixed-discrepancy";
}
test("exception diagnostics distinguish shifts, width changes and incomplete source", () => {
  const report = runAudit();
  assert.equal(report.contactModel.id, "taraprasad-30-arcmin");
  assert.equal(report.summary.completePairs, 30);
  assert.deepEqual(report.summary.over3MinuteRows, [1, 3, 9, 25, 26]);
  const expected = new Map([
    [1, "missing-endpoint"],
    [3, "common-time-shift"],
    [9, "end-only-discrepancy"],
    [25, "start-only-discrepancy"],
    [26, "end-only-discrepancy"]
  ]);
  for (const [number, category] of expected) {
    const row = report.rows[number - 1];
    assert.equal(row.sourceRow, number);
    assert.equal(classify(row), category, `row ${number}`);
    if (row.status === "paired") {
      const s = Date.parse(row.computedStartIST), e = Date.parse(row.computedEndIST);
      const ss = Date.parse(row.source.touchTimeIST), se = Date.parse(row.source.releaseTimeIST);
      assert.ok(s < e && ss < se, `event ordering row ${number}`);
      assert.ok(Math.abs(((s + e) - (ss + se)) / (2 * minute) -
        row.midpointDeltaMinutes) < 0.001);
      assert.ok(Math.abs(((e - s) - (se - ss)) / minute -
        row.durationDeltaMinutes) < 0.001);
    }
  }
  assert.equal(report.rows[0].source.touchTimeIST, null);
  assert.equal(report.rows[0].startDeltaMinutes, null);
  assert.ok(report.rows[0].sourceBoundaryArcminutes.end > 90);
  assert.ok(report.rows[2].durationDeltaMinutes > -1 &&
    report.rows[2].durationDeltaMinutes < 1);
  assert.deepEqual(report.unpairedCalculatedWithinSourceSpan, []);
});
