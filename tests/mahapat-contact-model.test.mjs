import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { contactModel, contactBoundaryDegrees, PRIMARY_CONTACT_MODEL, pataContactState } from "../research/paatadhikar/contact-boundary.mjs";

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


test("shastric boundary uses both actual semidiameters, not a fitted constant", () => {
  const base = {sunDeclination: 12, moonDeclination: 12, sunDistanceAU: 1, moonDistanceAU: 384400 / 149597870.7};
  const state = pataContactState(base);
  const near = pataContactState({...base, moonDistanceAU: 356000 / 149597870.7});
  const far = pataContactState({...base, moonDistanceAU: 406000 / 149597870.7});
  assert.equal(PRIMARY_CONTACT_MODEL, "apparent-disks");
  assert.equal(state.contactBoundary, state.semidiameterSum);
  assert.ok(near.contactBoundary > state.contactBoundary && state.contactBoundary > far.contactBoundary);
  assert.equal(state.vyatipataRelation, 0);
  assert.equal(state.vaidhritiRelation, 24);
  assert.equal(pataContactState({...base, moonDeclination: -12}).vaidhritiRelation, 0);
  const touching = pataContactState({...base, moonDeclination: 12 + state.contactBoundary});
  assert.ok(Math.abs(touching.vyatipataClearance) < 1e-12);
  assert.throws(() => pataContactState({...base, moonDistanceAU: 0}), RangeError);
});

test("signed relations are preserved on both sides of the celestial equator", () => {
  const base = {sunDeclination: 0.2, moonDeclination: -0.3, sunDistanceAU: 1, moonDistanceAU: 0.00257};
  const state = pataContactState(base);
  assert.ok(Math.abs(state.vyatipataRelation + 0.5) < 1e-12);
  assert.ok(Math.abs(state.vaidhritiRelation + 0.1) < 1e-12);
  assert.equal(pataContactState({...base, model: "drik-31-arcmin"}).contactBoundary, 31/60);
});
