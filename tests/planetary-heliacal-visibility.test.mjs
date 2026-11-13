import test from "node:test";
import assert from "node:assert/strict";
import { evaluateSchaefer1985Visibility } from "../planetary-heliacal-visibility.mjs";

test("Schaefer model returns finite diagnostics for a twilight sample", () => {
  const result = evaluateSchaefer1985Visibility({
    objectAltitudeDeg: 2.539,
    sunAltitudeDeg: -6.949,
    objectAzimuthDeg: 107.392,
    sunAzimuthDeg: 57.377,
    apparentMagnitude: -1.44
  });
  assert.equal(result.modelId, "schaefer-1985-twilight-visibility");
  assert.ok(Number.isFinite(result.airMass));
  assert.ok(Number.isFinite(result.skyBrightness));
  assert.ok(Number.isFinite(result.limitingMagnitude));
  assert.ok(result.visibilityMargin > 0);
  assert.equal(result.visible, true);
});

test("object below horizon or Sun outside twilight window cannot be visible", () => {
  const base = { objectAltitudeDeg: -0.1, sunAltitudeDeg: -8, objectAzimuthDeg: 90, sunAzimuthDeg: 80, apparentMagnitude: -2 };
  assert.equal(evaluateSchaefer1985Visibility(base).reason, "outside-observation-window");
  assert.equal(evaluateSchaefer1985Visibility({ ...base, objectAltitudeDeg: 5, sunAltitudeDeg: 2 }).visible, false);
  assert.equal(evaluateSchaefer1985Visibility({ ...base, objectAltitudeDeg: 5, sunAltitudeDeg: -20 }).visible, false);
});

test("fainter objects cannot become visible when all sky conditions are unchanged", () => {
  const sample = { objectAltitudeDeg: 8, sunAltitudeDeg: -10, objectAzimuthDeg: 100, sunAzimuthDeg: 70, apparentMagnitude: 1 };
  const bright = evaluateSchaefer1985Visibility(sample);
  const faint = evaluateSchaefer1985Visibility({ ...sample, apparentMagnitude: 8 });
  assert.equal(bright.limitingMagnitude, faint.limitingMagnitude);
  assert.equal(bright.visible, true);
  assert.equal(faint.visible, false);
});

test("invalid atmospheric inputs are rejected", () => {
  const sample = { objectAltitudeDeg: 10, sunAltitudeDeg: -10, objectAzimuthDeg: 100, sunAzimuthDeg: 70, apparentMagnitude: 1 };
  assert.throws(() => evaluateSchaefer1985Visibility(sample, { extinctionCoefficient: 0 }), /greater than zero/);
  assert.throws(() => evaluateSchaefer1985Visibility(sample, { twilightLimitDeg: 2 }), /between -30 and 0/);
});
