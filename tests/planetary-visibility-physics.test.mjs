import test from "node:test";
import assert from "node:assert/strict";
import {
  angularSeparationAltAz,
  classifyTwilight,
  computeVisibilityPhysics,
  kastenYoungAirmass
} from "../research/planetary-visibility-physics.mjs";

test("Kasten-Young airmass is approximately 1 at zenith and finite near horizon", () => {
  assert.ok(Math.abs(kastenYoungAirmass(90) - 1) < 1e-9);
  assert.ok(kastenYoungAirmass(0) > 30);
  assert.equal(kastenYoungAirmass(-5), null);
  assert.equal(kastenYoungAirmass(-6), null);
});

test("horizontal angular separation handles identical, opposite and right-angle directions", () => {
  const point = { altitude: 0, azimuth: 0 };
  assert.ok(angularSeparationAltAz(point, point) < 1e-7);
  assert.ok(Math.abs(angularSeparationAltAz(point, { altitude: 0, azimuth: 180 }) - 180) < 1e-7);
  assert.ok(Math.abs(angularSeparationAltAz(point, { altitude: 0, azimuth: 90 }) - 90) < 1e-7);
});

test("twilight classes use standard solar-altitude boundaries", () => {
  assert.equal(classifyTwilight(1), "daylight");
  assert.equal(classifyTwilight(-3), "civil");
  assert.equal(classifyTwilight(-9), "nautical");
  assert.equal(classifyTwilight(-15), "astronomical");
  assert.equal(classifyTwilight(-20), "night");
});

test("visibility diagnostics expose atmosphere, twilight and lunar geometry without inventing a verdict", () => {
  const result = computeVisibilityPhysics({
    planet: { altitude: 5, azimuth: 90, apparentMagnitude: 1.2, illuminatedFraction: 0.8 },
    sun: { altitude: -8, azimuth: 100 },
    moon: { altitude: 25, azimuth: 180, illuminatedFraction: 0.5 },
    atmosphere: { extinctionCoefficientMagPerAirmass: 0.2 }
  });
  assert.equal(result.status, "diagnostic-only");
  assert.equal(result.twilightClass, "nautical");
  assert.ok(result.airmass > 1);
  assert.ok(result.extinctionCorrectedMagnitude > result.apparentMagnitude);
  assert.ok(result.sunPlanetSeparationDegrees > 0);
  assert.ok(result.moonPlanetSeparationDegrees > 0);
  assert.equal(Object.hasOwn(result, "visible"), false);
});

test("rejects an implicit or invalid atmosphere coefficient", () => {
  const args = {
    planet: { altitude: 5, azimuth: 90, apparentMagnitude: 1.2, illuminatedFraction: 0.8 },
    sun: { altitude: -8, azimuth: 100 },
    moon: { altitude: 25, azimuth: 180, illuminatedFraction: 0.5 }
  };
  assert.throws(() => computeVisibilityPhysics(args), /must be supplied/);
  assert.throws(() => computeVisibilityPhysics({
    ...args,
    atmosphere: { extinctionCoefficientMagPerAirmass: -0.1 }
  }), /must be supplied/);
});

test("does not extrapolate the air-mass model below its declared domain", () => {
  const result = computeVisibilityPhysics({
    planet: { altitude: -6, azimuth: 90, apparentMagnitude: 1.2, illuminatedFraction: 0.8 },
    sun: { altitude: -18, azimuth: 100 },
    moon: { altitude: 10, azimuth: 180, illuminatedFraction: 0.5 },
    atmosphere: { extinctionCoefficientMagPerAirmass: 0.2 }
  });
  assert.equal(result.status, "airmass-out-of-domain");
  assert.equal(result.extinctionCorrectedMagnitude, null);
});
