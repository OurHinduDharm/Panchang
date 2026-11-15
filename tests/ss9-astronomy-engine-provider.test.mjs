import assert from "node:assert/strict";
import test from "node:test";
import { createSs9ApparentSampleAt, CANOPUS_CATALOG_REFERENCE } from "../research/astronomy-engine-ss9-provider.mjs";

test("Astronomy Engine adapter returns apparent geocentric positions for Venus and Jupiter", () => {
  const instant = Date.UTC(2026, 10, 16, 0, 0, 0);
  for (const body of ["Venus", "Jupiter"]) {
    const sample = createSs9ApparentSampleAt(body)(instant);
    for (const point of [sample.sunEquatorial, sample.objectEquatorial]) {
      assert.ok(Number.isFinite(point.rightAscensionDeg));
      assert.ok(Number.isFinite(point.declinationDeg));
    }
    assert.ok(Number.isFinite(sample.elongationDeg));
    assert.equal(sample.frame, "EQD apparent geocentric; true equator of date");
  }
});

test("Agastya provider uses Canopus HIP 30438 catalogue provenance", () => {
  const sample = createSs9ApparentSampleAt("Agastya")(Date.UTC(2026, 7, 1));
  assert.ok(Number.isFinite(sample.objectEquatorial.rightAscensionDeg));
  assert.ok(Number.isFinite(sample.objectEquatorial.declinationDeg));
  assert.equal(CANOPUS_CATALOG_REFERENCE.hip, 30438);
  assert.match(CANOPUS_CATALOG_REFERENCE.source, /SIMBAD HIP 30438/);
});
