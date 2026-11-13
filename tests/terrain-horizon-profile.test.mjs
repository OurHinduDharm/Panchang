import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTerrainHorizonProfile,
  evaluateTerrainVisibility,
  getTerrainHorizonAltitude
} from "../research/terrain-horizon-profile.mjs";

const observer = {
  latitude: 29.5828,
  longitude: 80.2182,
  elevationMeters: 1650
};

function cardinalRays() {
  return [
    { azimuthDeg: 0, samples: [{ distanceMeters: 1000, elevationMeters: 1750 }] },
    { azimuthDeg: 90, samples: [{ distanceMeters: 1000, elevationMeters: 1850 }] },
    { azimuthDeg: 180, samples: [{ distanceMeters: 1000, elevationMeters: 1750 }] },
    { azimuthDeg: 270, samples: [{ distanceMeters: 1000, elevationMeters: 1650 }] }
  ];
}

test("builds an azimuth-dependent horizon from DEM ray elevations", () => {
  const profile = buildTerrainHorizonProfile({
    observer,
    rays: cardinalRays(),
    maxInterpolationGapDeg: 90,
    source: "synthetic-test-dem"
  });
  assert.equal(profile.samples.length, 4);
  assert.equal(profile.source, "synthetic-test-dem");
  assert.ok(profile.samples[1].horizonAltitudeDeg > profile.samples[0].horizonAltitudeDeg);
});

test("interpolates horizon across north wrap and intermediate azimuth", () => {
  const profile = buildTerrainHorizonProfile({
    observer,
    rays: cardinalRays(),
    maxInterpolationGapDeg: 90
  });
  const eastNorth = getTerrainHorizonAltitude(profile, 45);
  const northWest = getTerrainHorizonAltitude(profile, 315);
  assert.ok(eastNorth > profile.samples[0].horizonAltitudeDeg);
  assert.ok(northWest < profile.samples[0].horizonAltitudeDeg);
});

test("reports terrain obstruction separately from astronomical altitude", () => {
  const profile = buildTerrainHorizonProfile({
    observer,
    rays: cardinalRays(),
    maxInterpolationGapDeg: 90
  });
  const blocked = evaluateTerrainVisibility({
    profile,
    azimuthDeg: 90,
    apparentAltitudeDeg: 5,
    clearanceMarginDeg: 0.25
  });
  const clear = evaluateTerrainVisibility({
    profile,
    azimuthDeg: 90,
    apparentAltitudeDeg: 12,
    clearanceMarginDeg: 0.25
  });
  assert.equal(blocked.status, "terrain-obstructed");
  assert.equal(clear.status, "above-terrain-horizon");
});

test("applies Earth-curvature correction only when configured refraction coefficient is supplied", () => {
  const geometric = buildTerrainHorizonProfile({
    observer,
    rays: cardinalRays(),
    maxInterpolationGapDeg: 90,
    refractionCoefficient: 0
  });
  const refracted = buildTerrainHorizonProfile({
    observer,
    rays: cardinalRays(),
    maxInterpolationGapDeg: 90,
    refractionCoefficient: 0.13
  });
  assert.ok(refracted.samples[0].horizonAltitudeDeg > geometric.samples[0].horizonAltitudeDeg);
});

test("rejects incomplete azimuth coverage, duplicate directions and missing DEM samples", () => {
  assert.throws(() => buildTerrainHorizonProfile({
    observer,
    rays: [
      { azimuthDeg: 0, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] },
      { azimuthDeg: 90, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] },
      { azimuthDeg: 180, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] }
    ]
  }), /coverage gap/);
  assert.throws(() => buildTerrainHorizonProfile({
    observer,
    rays: [
      { azimuthDeg: 0, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] },
      { azimuthDeg: 0, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] },
      { azimuthDeg: 180, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] }
    ],
    maxInterpolationGapDeg: 180
  }), /Duplicate/);
  assert.throws(() => buildTerrainHorizonProfile({
    observer,
    rays: [
      { azimuthDeg: 0, samples: [] },
      { azimuthDeg: 120, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] },
      { azimuthDeg: 240, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] }
    ],
    maxInterpolationGapDeg: 180
  }), /at least one valid DEM sample/);
});

test("validates observer and ray geometry", () => {
  assert.throws(() => buildTerrainHorizonProfile({
    observer: { ...observer, elevationMeters: NaN },
    rays: cardinalRays(),
    maxInterpolationGapDeg: 90
  }), /elevationMeters/);
  assert.throws(() => buildTerrainHorizonProfile({
    observer,
    rays: [
      { azimuthDeg: 0, samples: [{ distanceMeters: 0, elevationMeters: 1700 }] },
      { azimuthDeg: 120, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] },
      { azimuthDeg: 240, samples: [{ distanceMeters: 100, elevationMeters: 1700 }] }
    ],
    maxInterpolationGapDeg: 180
  }), /distanceMeters/);
});
