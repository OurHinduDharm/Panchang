import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const calculator = fileURLToPath(new URL("../scripts/compare-mahapat-ephemeris.mjs", import.meta.url));
const fixtures = JSON.parse(readFileSync(new URL("../data/reviews/mahapata-fixtures-2026-2030.json", import.meta.url)));

test("2026-2030 seed discovery agrees with independent 60/30 minute full-range scans", () => {
  const outputs = [60, 30].map(step => JSON.parse(execFileSync(process.execPath,
    [calculator, "--audit", `--audit-step-minutes=${step}`],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 })));
  for (const output of outputs) {
    assert.equal(output.eventCount, 135);
    assert.equal(output.reviewItemCount, 8);
    assert.equal(output.discoveryAudit.rootCount, 135);
    assert.deepEqual(output.discoveryAudit.unrepresentedRoots, []);
    assert.deepEqual(output.discoveryAudit.duplicateIntervals, []);
    assert.deepEqual(output.discoveryAudit.longIntervals, []);
    // Recalculate the archived windows: a static fixture alone cannot test the solver.
    for (const fixture of fixtures.events) {
      const actual = output.events.find(event => event.type === fixture.type &&
        Math.abs(Date.parse(event.startTimeIST) - Date.parse(fixture.startTimeIST)) < 1000);
      assert.ok(actual, `missing live window ${fixture.startTimeIST}`);
      assert.ok(Math.abs(Date.parse(actual.endTimeIST) - Date.parse(fixture.endTimeIST)) < 1000);
    }
  }
  const [coarse, fine] = outputs.map(output => output.discoveryAudit.roots);
  for (const root of coarse) {
    assert.ok(fine.some(other => other.type === root.type &&
      Math.abs(Date.parse(other.truePataIST) - Date.parse(root.truePataIST)) < 1000));
  }
});
