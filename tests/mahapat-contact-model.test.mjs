import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { contactModel, contactBoundaryDegrees } from "../research/paatadhikar/contact-boundary.mjs";

test("source boundary is fixed at 30 arcminutes, physical disks retain their changing sizes", () => {
  for (const radius of [0.49, 0.51, 0.55]) {
    assert.equal(contactBoundaryDegrees("taraprasad-30-arcmin", radius), 0.5);
    assert.equal(contactBoundaryDegrees("apparent-disks", radius), radius);
    assert.equal(contactBoundaryDegrees("drik-31-arcmin", radius), 31 / 60);
  }
  assert.equal(contactModel().id, "apparent-disks");
  assert.match(contactModel("taraprasad-30-arcmin").status, /inferred/);
  assert.throws(() => contactModel("unknown"), RangeError);
  assert.throws(() => contactBoundaryDegrees("apparent-disks", NaN), RangeError);
});

test("30-arcminute convention explains most reference endpoints and preserves anomalies", () => {
  const report = JSON.parse(execFileSync(process.execPath,
    [fileURLToPath(new URL("../scripts/audit-mahapat-references.mjs", import.meta.url))],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));
  assert.equal(report.contactModel.id, "taraprasad-30-arcmin");
  assert.equal(report.summary.completePairs, 30);
  assert.equal(report.summary.partialPairs, 1);
  assert.equal(report.summary.bothEndpointsWithin3Minutes, 26);
  assert.ok(report.summary.medianAbsoluteStartMinutes < 0.5);
  assert.ok(report.summary.medianAbsoluteEndMinutes < 0.5);
  assert.deepEqual(report.summary.over3MinuteRows, [1, 3, 9, 25, 26]);
  assert.equal(report.apparentDiskBaseline.bothEndpointsWithin10Minutes, 21);
  assert.ok(report.rows[0].endDeltaMinutes < -210);
  assert.equal(report.rows[0].startDeltaMinutes, null);
  // The April discrepancy shifts both endpoints by ~35 min; it is not a width error.
  assert.ok(Math.abs(report.rows[2].midpointDeltaMinutes) > 35);
  assert.ok(Math.abs(report.rows[2].durationDeltaMinutes) < 1);
  const angularEndpoints = report.rows.flatMap(row => Object.values(row.sourceBoundaryArcminutes))
    .filter(value => value !== null);
  assert.equal(angularEndpoints.length, 61);
  assert.equal(angularEndpoints.filter(value => Math.abs(value - 30) < 0.5).length, 55);
  // Temporal subset check, not a claim of blind/previously unseen validation.
  const laterRows = report.rows.filter(row => row.source.touchTimeIST?.startsWith("2024"));
  assert.equal(laterRows.length, 8);
  assert.equal(laterRows.filter(row => row.maxAbsoluteDeltaMinutes < 1).length, 6);
  assert.deepEqual(report.unpairedCalculatedWithinSourceSpan, []);
});
