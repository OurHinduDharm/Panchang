import assert from "node:assert/strict";
import test from "node:test";
import { equatorialToHorizontal } from "../research/equatorial-to-horizontal.mjs";

const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance,
    actual + " differs from " + expected);

test("equatorial coordinates transform to zenith at the equator", () => {
  const result = equatorialToHorizontal({
    latitudeDeg: 0,
    declinationDeg: 0,
    hourAngleDeg: 0
  });
  close(result.altitudeDeg, 90);
  assert.equal(result.azimuthDeg, null);
});

test("hour angle sign produces east/west azimuth correctly", () => {
  const east = equatorialToHorizontal({
    latitudeDeg: 0, declinationDeg: 0, hourAngleDeg: -90
  });
  const west = equatorialToHorizontal({
    latitudeDeg: 0, declinationDeg: 0, hourAngleDeg: 90
  });
  close(east.altitudeDeg, 0);
  close(east.azimuthDeg, 90);
  close(west.altitudeDeg, 0);
  close(west.azimuthDeg, 270);
});

test("north celestial pole altitude equals observer latitude", () => {
  const result = equatorialToHorizontal({
    latitudeDeg: 28.6,
    declinationDeg: 90,
    hourAngleDeg: 123
  });
  close(result.altitudeDeg, 28.6);
  close(result.azimuthDeg, 0);
});

test("hour angle wraps and invalid inputs are rejected", () => {
  const a = equatorialToHorizontal({
    latitudeDeg: 19.1, declinationDeg: 10, hourAngleDeg: 30
  });
  const b = equatorialToHorizontal({
    latitudeDeg: 19.1, declinationDeg: 10, hourAngleDeg: 390
  });
  close(a.altitudeDeg, b.altitudeDeg);
  close(a.azimuthDeg, b.azimuthDeg);
  assert.throws(() => equatorialToHorizontal({
    latitudeDeg: 91, declinationDeg: 0, hourAngleDeg: 0
  }), /latitudeDeg/);
  assert.throws(() => equatorialToHorizontal({
    latitudeDeg: 0, declinationDeg: 0, hourAngleDeg: NaN
  }), /hourAngleDeg/);
});
