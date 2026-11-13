import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMotionThresholdSegments,
  createPlanetEphemerisAdapter,
  findGeocentricMotionStations
} from "../research/planetary-ephemeris-adapter.mjs";

const DAY = 86_400_000;
const base = Date.parse("2026-01-01T00:00:00.000Z");

test("adapter converts signed relative longitude to the smaller Sun separation", () => {
  const astronomy = {
    PairLongitude: () => 350,
    GeoVector: () => ({ x: 1, y: 0, z: 0 }),
    Ecliptic: () => ({ elon: 42 })
  };
  const adapter = createPlanetEphemerisAdapter({ astronomy, body: "Venus" });
  assert.equal(adapter.sampleElongation(new Date(base)), 10);
  assert.equal(adapter.sampleLongitude(new Date(base)), 42);
});

test("detects direct-to-retrograde and retrograde-to-direct stations", () => {
  // Synthetic longitude has a local maximum at day 5 and local minimum at day 15.
  const sampleLongitude = date => {
    const d = (date.getTime() - base) / DAY;
    const raw = 100 + 0.12 * (d - 5) * (d - 15) * (d - 25) / 100;
    return ((raw % 360) + 360) % 360;
  };
  const stations = findGeocentricMotionStations({
    sampleLongitude,
    start: new Date(base),
    end: new Date(base + 30 * DAY),
    coarseStepHours: 12,
    derivativeHalfWindowHours: 2,
    toleranceSeconds: 10
  });
  assert.equal(stations.length, 2);
  assert.equal(stations[0].transition, "direct-to-retrograde");
  assert.equal(stations[1].transition, "retrograde-to-direct");
});

test("segments use the threshold belonging to each real motion interval", () => {
  const start = new Date(base);
  const station = new Date(base + 5 * DAY);
  const end = new Date(base + 10 * DAY);
  const segments = buildMotionThresholdSegments({
    start, end,
    initialMotion: "direct",
    stations: [{ instant: station.toISOString(), motionAfter: "retrograde" }],
    thresholdByMotion: { direct: 10, retrograde: 8 }
  });
  assert.deepEqual(segments.map(s => [s.motion, s.thresholdDeg]), [
    ["direct", 10],
    ["retrograde", 8]
  ]);
  assert.equal(segments[0].end.toISOString(), station.toISOString());
  assert.equal(segments[1].start.toISOString(), station.toISOString());
});
