import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateSs9Visibility, evaluateSs9VisibilityFromEquatorial, eclipticToEquatorial,
  geometricHorizonDipDegrees, obliqueAscensionDegrees, refineSs9Transition
} from "../research/ss9-location-model.mjs";

test("ecliptic to equatorial conversion returns finite coordinates", () => {
  const eq = eclipticToEquatorial({ longitudeDeg: 90, latitudeDeg: 0 }, 23.4393);
  assert.ok(Math.abs(eq.declinationDeg - 23.4393) < 1e-4);
  assert.ok(Number.isFinite(eq.rightAscensionDeg));
});

test("oblique ascension changes with observer latitude", () => {
  const eq = { rightAscensionDeg: 120, declinationDeg: 20 };
  const equator = obliqueAscensionDegrees(eq, 0);
  const almora = obliqueAscensionDegrees(eq, 29 + 37 / 60);
  const ramnagar = obliqueAscensionDegrees(eq, 29.5);
  assert.notEqual(equator, almora);
  assert.notEqual(almora, ramnagar);
  assert.ok(Math.abs(almora - ramnagar) < 0.2);
});

test("SS9 K/C state is latitude-aware and uses strict K > C", () => {
  const sun = { longitudeDeg: 100, latitudeDeg: 0 };
  const object = { longitudeDeg: 112, latitudeDeg: 0 };
  const equator = evaluateSs9Visibility({ body: "Jupiter", sun, object, latitudeDeg: 0, obliquityDeg: 23.4393 });
  const almora = evaluateSs9Visibility({ body: "Jupiter", sun, object, latitudeDeg: 29 + 37 / 60, obliquityDeg: 23.4393 });
  assert.ok(equator.available && almora.available);
  assert.notEqual(equator.K, almora.K);
  assert.equal(equator.visible, equator.K > 11);
  assert.equal(almora.visible, almora.K > 11);
});

test("Venus requires an explicit 8 or 10 degree branch", () => {
  const args = {
    body: "Venus", sun: { longitudeDeg: 10, latitudeDeg: 0 },
    object: { longitudeDeg: 19, latitudeDeg: 0 },
    latitudeDeg: 29.6166667, obliquityDeg: 23.4393
  };
  assert.throws(() => evaluateSs9Visibility(args), /explicit SS Ch.9 limitDeg/);
  assert.equal(evaluateSs9Visibility({ ...args, limitDeg: 8 }).limitDeg, 8);
  assert.equal(evaluateSs9Visibility({ ...args, limitDeg: 10 }).limitDeg, 10);
  assert.throws(() => evaluateSs9Visibility({ ...args, limitDeg: 9 }), /8° or 10° branch/);
});

test("Agastya uses the 13 degree stellar limit", () => {
  const result = evaluateSs9Visibility({
    body: "Agastya", sun: { longitudeDeg: 100, latitudeDeg: 0 },
    object: { longitudeDeg: 115, latitudeDeg: -52 },
    latitudeDeg: 29.6166667, obliquityDeg: 23.4393
  });
  assert.equal(result.limitDeg, 13);
  assert.equal(result.available, true);
});

test("refinement locates a synthetic Udaya crossing", () => {
  const crossing = Date.UTC(2026, 0, 1, 12);
  const sampleAt = ms => ({
    sun: { longitudeDeg: 100, latitudeDeg: 0 },
    object: { longitudeDeg: ms < crossing ? 100 : 112, latitudeDeg: 0 },
    obliquityDeg: 23.4393
  });
  const result = refineSs9Transition({
    body: "Jupiter", latitudeDeg: 0,
    startUtcMs: crossing - 3_600_000, endUtcMs: crossing + 3_600_000,
    sampleAt, toleranceMs: 1_000
  });
  assert.equal(result.event, "Udaya");
  assert.equal(result.direction, "east");
  assert.ok(Math.abs(result.utcMilliseconds - crossing) <= 1_000);
});

test("elevation changes horizon dip only, not the classical K/C input", () => {
  assert.equal(geometricHorizonDipDegrees(0), 0);
  assert.ok(geometricHorizonDipDegrees(1571) > geometricHorizonDipDegrees(272));
});

test("direct apparent equatorial coordinates can be evaluated without a frame conversion", () => {
  const result = evaluateSs9VisibilityFromEquatorial({
    body: "Jupiter",
    sunEquatorial: { rightAscensionDeg: 100, declinationDeg: 20 },
    objectEquatorial: { rightAscensionDeg: 112, declinationDeg: 22 },
    latitudeDeg: 29.6166667
  });
  assert.equal(result.available, true);
  assert.equal(result.visible, result.K > 11);
});

test("transition solver accepts direct apparent-equatorial provider samples", () => {
  const crossing = Date.UTC(2026, 0, 1, 12);
  const sampleAt = ms => ({
    sunEquatorial: { rightAscensionDeg: 100, declinationDeg: 20 },
    objectEquatorial: {
      rightAscensionDeg: ms < crossing ? 100 : 112,
      declinationDeg: 20
    },
    elongationDeg: ms < crossing ? 0 : 12
  });
  const result = refineSs9Transition({
    body: "Jupiter", latitudeDeg: 0,
    startUtcMs: crossing - 3_600_000,
    endUtcMs: crossing + 3_600_000,
    sampleAt, toleranceMs: 1_000
  });
  assert.equal(result.event, "Udaya");
  assert.equal(result.direction, "east");
  assert.ok(Math.abs(result.utcMilliseconds - crossing) <= 1_000);
});
