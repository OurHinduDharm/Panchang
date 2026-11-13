import test from "node:test";
import assert from "node:assert/strict";
import {
  AGASTYA_CANOPUS_CATALOG,
  getCanopusJ2000Direction,
  getCanopusHorizontalPosition,
  getCanopusVisibilitySample
} from "../agastya-canopus-position.mjs";

test("Canopus catalog metadata is tied to SIMBAD/HIP 30438", () => {
  assert.equal(AGASTYA_CANOPUS_CATALOG.id, "HIP 30438");
  assert.equal(AGASTYA_CANOPUS_CATALOG.referenceEpoch, "J2000.0");
  assert.equal(AGASTYA_CANOPUS_CATALOG.apparentVisualMagnitude, -0.74);
  assert.ok(AGASTYA_CANOPUS_CATALOG.sourceUrl.includes("simbad"));
});

test("proper-motion propagation returns a finite normalized direction", () => {
  const direction = getCanopusJ2000Direction("2028-09-01T00:00:00Z");
  assert.ok(Math.abs(Math.hypot(direction.x, direction.y, direction.z) - 1) < 1e-12);
  assert.ok(Object.values(direction).every(Number.isFinite));
});

test("rejects invalid dates", () => {
  assert.throws(() => getCanopusJ2000Direction("not-a-date"), /valid date/);
});

function mockAstronomy() {
  return {
    Body: { Sun: "Sun" },
    VectorFromSphere(sphere, date) {
      return { x: sphere.dist, y: 0, z: 0, t: date };
    },
    Rotation_EQJ_HOR() { return { id: "eqj-hor" }; },
    RotateVector(_rotation, vector) { return vector; },
    HorizonFromVector() { return { lat: 8.2, lon: 123.4 }; },
    Equator() { return { ra: 1, dec: 2 }; },
    Horizon() { return { altitude: -10, azimuth: 90 }; }
  };
}

test("uses Astronomy Engine's J2000-to-horizontal transform", () => {
  const calls = [];
  const astronomy = mockAstronomy();
  const originalVector = astronomy.VectorFromSphere;
  astronomy.VectorFromSphere = (sphere, date) => {
    calls.push(["vector", sphere, date.toISOString()]);
    return originalVector(sphere, date);
  };
  astronomy.Rotation_EQJ_HOR = (date, observer) => {
    calls.push(["rotation", date.toISOString(), observer.latitude]);
    return { id: "eqj-hor" };
  };
  astronomy.HorizonFromVector = (_vector, refraction) => {
    calls.push(["horizon", refraction]);
    return { lat: 8.2, lon: 123.4 };
  };
  const result = getCanopusHorizontalPosition({
    astronomy,
    observer: { latitude: 29.5828, longitude: 80.2182, height: 1650 },
    instant: "2028-09-01T00:00:00Z"
  });
  assert.equal(result.altitudeDeg, 8.2);
  assert.equal(result.azimuthDeg, 123.4);
  assert.equal(result.apparentMagnitude, -0.74);
  assert.deepEqual(calls.map(call => call[0]), ["vector", "rotation", "horizon"]);
});

test("evaluates Canopus against the Sun's local twilight geometry", () => {
  const result = getCanopusVisibilitySample({
    astronomy: mockAstronomy(),
    observer: { latitude: 29.5828, longitude: 80.2182, height: 1650 },
    instant: "2028-09-01T00:00:00Z"
  });
  assert.equal(result.object, "Canopus");
  assert.equal(result.sunAltitudeDeg, -10);
  assert.equal(result.visibility.modelId, "schaefer-1985-twilight-visibility");
});
