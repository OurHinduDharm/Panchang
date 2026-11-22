import test from "node:test";
import assert from "node:assert/strict";
import { diagnoseException, exceptionReport } from "../scripts/diagnose-mahapat-exceptions.mjs";

const base = {
  status: "paired", sourceRow: 3,
  source: { type: "vaidhrti", touchTimeIST: "2023-04-17T01:41:00+05:30", releaseTimeIST: "2023-04-17T05:17:00+05:30" },
  computedStartIST: "2023-04-17T01:05:37+05:30",
  computedEndIST: "2023-04-17T04:41:19+05:30",
  truePataIST: "2023-04-17T02:53:00+05:30",
  startDeltaMinutes: -35.37, endDeltaMinutes: -35.67
};
test("classify common shift without pretending to correct the source", () => {
  const r = diagnoseException(base);
  assert.equal(r.category, "common-time-shift");
  assert.ok(Math.abs(r.midpointDeltaMinutes + 35.52) < 0.01);
  assert.ok(Math.abs(r.durationDeltaMinutes + 0.3) < 0.01);
  assert.equal(r.checks.sourceChronological, true);
  assert.equal(r.checks.computedChronological, true);
  assert.equal(r.checks.truePataInsideCalculated, true);
});
test("one-sided anomalies and missing endpoints remain distinct", () => {
  assert.equal(diagnoseException({ ...base, startDeltaMinutes: -0.08, endDeltaMinutes: 50.35 }).category, "end-only-discrepancy");
  assert.equal(diagnoseException({ ...base, startDeltaMinutes: -19.52, endDeltaMinutes: 0.27 }).category, "start-only-discrepancy");
  assert.equal(diagnoseException({ ...base, startDeltaMinutes: 0.58, endDeltaMinutes: -47.26 }).category, "end-only-discrepancy");
  const partial = diagnoseException({ ...base, status: "partial", startDeltaMinutes: null, endDeltaMinutes: -211.65 });
  assert.equal(partial.category, "missing-endpoint");
  assert.equal(partial.midpointDeltaMinutes, null);
  assert.equal(partial.durationDeltaMinutes, null);
});
test("report retains anomalies and refuses invalid tolerance", () => {
  const report = exceptionReport({ contactModel: { id: "taraprasad-30-arcmin" }, rows: [base] });
  assert.equal(report.summary.exceptions, 1);
  assert.equal(report.contactModel, "taraprasad-30-arcmin");
  assert.throws(() => exceptionReport({ rows: [] }, 0), RangeError);
});
