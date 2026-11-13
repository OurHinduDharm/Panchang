import assert from "node:assert/strict";
import test from "node:test";
import { calculatePlanetObserverSnapshot } from "../research/planetary-observer-snapshot.mjs";

function fakeAstronomy() {
  return {
    Refraction: { Normal: "normal", None: "none" },
    GeoVector(body) {
      return body === "Sun"
        ? { x: 1, y: 0, z: 0 }
        : { x: 0.8, y: 0.6, z: 0 };
    },
    Equator(body) {
      return { ra: body === "Venus" ? 10 : 11, dec: 5 };
    },
    Horizon(date, observer, ra, dec, refraction) {
      return {
        altitude: observer.latitude / 2 + observer.longitude / 100,
        azimuth: (ra * 15 + observer.longitude + 360) % 360,
        refraction
      };
    }
  };
}

const astronomy = fakeAstronomy();
const observer = { latitude: 29.5828, longitude: 80.2182, height: 1650 };
const date = new Date("2026-10-19T00:00:00.000Z");

test("planet snapshot separates geocentric elongation from local topocentric direction", () => {
  const result = calculatePlanetObserverSnapshot({ astronomy, body: "Venus", date, observer });
  assert.equal(result.body, "Venus");
  assert.equal(result.instant, date.toISOString());
  assert.ok(Math.abs(result.geocentricElongationDeg - 36.86989764584402) < 1e-9);
  assert.equal(result.topocentric.rightAscensionHours, 10);
  assert.equal(result.topocentric.declinationDeg, 5);
  assert.equal(result.topocentric.altitudeDeg, observer.latitude / 2 + observer.longitude / 100);
  assert.ok(Math.abs(result.topocentric.azimuthDeg - 8.2182) < 1e-9);
  assert.equal(result.visibilityDecision, "not-evaluated");
});

test("same geocentric geometry gives observer-specific topocentric altitude and azimuth", () => {
  const pithoragarh = calculatePlanetObserverSnapshot({ astronomy, body: "Jupiter", date, observer });
  const mumbai = calculatePlanetObserverSnapshot({
    astronomy, body: "Jupiter", date,
    observer: { latitude: 19.116667, longitude: 72.85, height: 14.2 }
  });
  assert.notEqual(pithoragarh.topocentric.altitudeDeg, mumbai.topocentric.altitudeDeg);
  assert.equal(pithoragarh.geocentricElongationDeg, mumbai.geocentricElongationDeg);
});

test("invalid body, date and observer are rejected", () => {
  assert.throws(() => calculatePlanetObserverSnapshot({ astronomy, body: "Sun", date, observer }), /supported planet/);
  assert.throws(() => calculatePlanetObserverSnapshot({ astronomy, body: "Venus", date: new Date("invalid"), observer }), /valid Date/);
  assert.throws(() => calculatePlanetObserverSnapshot({
    astronomy, body: "Venus", date, observer: { latitude: 91, longitude: 0, height: 0 }
  }), /outside supported bounds/);
});
