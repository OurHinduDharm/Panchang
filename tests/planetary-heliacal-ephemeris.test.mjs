import test from "node:test";
import assert from "node:assert/strict";
import {
  getPlanetVisibilitySample,
  scanPlanetVisibilityWindow
} from "../planetary-heliacal-ephemeris.mjs";

function fakeAstronomy() {
  return {
    Body: { Jupiter: "Jupiter", Venus: "Venus", Sun: "Sun" },
    Equator(body) {
      return body === "Sun" ? { ra: 1, dec: 2 } : { ra: 3, dec: 4 };
    },
    Horizon(date, _observer, ra) {
      if (ra === 1) return { altitude: -10, azimuth: 90 };
      const minute = date.getUTCMinutes();
      return { altitude: 20, azimuth: 100 + minute / 10 };
    },
    Illumination() {
      return { mag: -2.0, phase_angle: 12, phase_fraction: 0.9 };
    }
  };
}

const observer = { latitude: 29.5828, longitude: 80.2182, height: 1650 };

test("creates a topocentric Jupiter sample with magnitude and Sun geometry", () => {
  const sample = getPlanetVisibilitySample({
    astronomy: fakeAstronomy(),
    planet: "Jupiter",
    observer,
    instant: "2028-01-01T00:00:00Z"
  });
  assert.equal(sample.planet, "Jupiter");
  assert.equal(sample.apparentMagnitude, -2);
  assert.equal(sample.objectAltitudeDeg, 20);
  assert.equal(sample.objectAzimuthDeg, 100);
  assert.equal(sample.sunAltitudeDeg, -10);
  assert.equal(sample.visibility.modelId, "schaefer-1985-twilight-visibility");
});

test("restricts the research adapter to Guru and Shukra", () => {
  assert.throws(() => getPlanetVisibilitySample({
    astronomy: fakeAstronomy(), planet: "Saturn", observer,
    instant: "2028-01-01T00:00:00Z"
  }), /Jupiter or Venus/);
});

test("scans a bounded interval and marks results as non-public candidates", () => {
  const result = scanPlanetVisibilityWindow({
    astronomy: fakeAstronomy(),
    planet: "Venus",
    observer,
    start: "2028-01-01T00:00:00Z",
    end: "2028-01-01T00:08:00Z",
    stepMinutes: 2
  });
  assert.equal(result.status, "visibility-candidate-found");
  assert.equal(result.publicationEligible, false);
  assert.ok(result.samples.length >= 5);
  assert.ok(result.firstVisibleSample);
  assert.ok(result.lastVisibleSample);
});

test("rejects invalid scan intervals and step sizes", () => {
  assert.throws(() => scanPlanetVisibilityWindow({
    astronomy: fakeAstronomy(), planet: "Jupiter", observer,
    start: "2028-01-02T00:00:00Z", end: "2028-01-01T00:00:00Z"
  }), /end must be after start/);
  assert.throws(() => scanPlanetVisibilityWindow({
    astronomy: fakeAstronomy(), planet: "Jupiter", observer,
    start: "2028-01-01T00:00:00Z", end: "2028-01-01T00:08:00Z",
    stepMinutes: 60
  }), /stepMinutes/);
});

test("attaches measured local horizon geometry to a visibility crossing", () => {
  const astronomy = {
    Body: { Jupiter: "Jupiter", Venus: "Venus", Sun: "Sun" },
    Equator(body) {
      return body === "Sun" ? { ra: 1, dec: 2 } : { ra: 3, dec: 4 };
    },
    Horizon(date, _observer, ra) {
      if (ra === 1) {
        return { altitude: date.getUTCMinutes() < 1 ? -5 : -15, azimuth: 90 };
      }
      return { altitude: 20, azimuth: 100 };
    },
    Illumination() {
      return { mag: 2, phase_angle: 12, phase_fraction: 0.9 };
    }
  };
  const result = scanPlanetVisibilityWindow({
    astronomy, planet: "Venus", observer,
    start: "2028-01-01T00:00:00Z",
    end: "2028-01-01T00:06:00Z",
    stepMinutes: 2,
    refineSeconds: 1
  });
  assert.equal(result.crossings.length, 1);
  assert.equal(result.crossings[0].type, "first-visible");
  assert.equal(result.crossings[0].planetAltitudeDeg, 20);
  assert.equal(result.crossings[0].planetAzimuthDeg, 100);
  assert.equal(result.crossings[0].horizonDirection, "east");
});
