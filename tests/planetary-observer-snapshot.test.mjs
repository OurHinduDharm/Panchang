import assert from "node:assert/strict";
import test from "node:test";
import * as Astronomy from "astronomy-engine";
import { calculatePlanetObserverSnapshot } from "../research/planetary-observer-snapshot.mjs";

const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const date = new Date("2026-10-19T00:00:00.000Z");

test("planet snapshot separates geocentric elongation from local topocentric direction", () => {
  const result = calculatePlanetObserverSnapshot({
    astronomy: Astronomy,
    body: "Venus",
    date,
    observer
  });
  assert.equal(result.body, "Venus");
  assert.equal(result.instant, date.toISOString());
  assert.ok(result.geocentricElongationDeg >= 0 && result.geocentricElongationDeg <= 180);
  assert.ok(result.topocentric.rightAscensionHours >= 0 && result.topocentric.rightAscensionHours < 24);
  assert.ok(result.topocentric.declinationDeg >= -90 && result.topocentric.declinationDeg <= 90);
  assert.ok(result.topocentric.altitudeDeg >= -90 && result.topocentric.altitudeDeg <= 90);
  assert.ok(result.topocentric.azimuthDeg >= 0 && result.topocentric.azimuthDeg < 360);
  assert.equal(result.visibilityDecision, "not-evaluated");
});

test("same instant produces different topocentric altitude at different observer locations", () => {
  const pithoragarh = calculatePlanetObserverSnapshot({
    astronomy: Astronomy, body: "Jupiter", date, observer
  });
  const mumbai = calculatePlanetObserverSnapshot({
    astronomy: Astronomy,
    body: "Jupiter",
    date,
    observer: new Astronomy.Observer(19.116667, 72.85, 14.2)
  });
  assert.notEqual(pithoragarh.topocentric.altitudeDeg, mumbai.topocentric.altitudeDeg);
  assert.equal(pithoragarh.geocentricElongationDeg, mumbai.geocentricElongationDeg);
});

test("invalid body, date and observer are rejected", () => {
  assert.throws(() => calculatePlanetObserverSnapshot({
    astronomy: Astronomy, body: "Sun", date, observer
  }), /supported planet/);
  assert.throws(() => calculatePlanetObserverSnapshot({
    astronomy: Astronomy, body: "Venus", date: new Date("invalid"), observer
  }), /valid Date/);
  assert.throws(() => calculatePlanetObserverSnapshot({
    astronomy: Astronomy, body: "Venus", date, observer: { latitude: 91, longitude: 0, height: 0 }
  }), /outside supported bounds/);
});
