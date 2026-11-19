import test from "node:test";
import assert from "node:assert/strict";
import * as AstronomyModule from "astronomy-engine";
import { createAstronomyEngineMahapataEphemeris } from
  "../research/paatadhikar/astronomy-engine-adapter.mjs";
import {
  diagnoseMahapata, scanMahapataCandidates
} from "../research/paatadhikar/mahapata-math.mjs";

test("adapter rejects unsupported engines or invalid dates", () => {
  assert.throws(() => createAstronomyEngineMahapataEphemeris({}), TypeError);
  const ephemeris = createAstronomyEngineMahapataEphemeris(AstronomyModule);
  assert.throws(() => ephemeris(new Date(NaN)), TypeError);
});

test("real ephemeris supplies geocentric ecliptic-of-date Sun/Moon and obliquity", () => {
  const ephemeris = createAstronomyEngineMahapataEphemeris(AstronomyModule);
  const date = new Date("2026-11-19T00:00:00.000Z");
  const result = ephemeris(date);
  assert.ok(result.obliquityDeg > 22 && result.obliquityDeg < 25);
  for (const body of [result.sun, result.moon]) {
    assert.ok(body.longitudeDeg >= 0 && body.longitudeDeg < 360);
    assert.ok(Math.abs(body.latitudeDeg) <= 6);
  }
  const d = diagnoseMahapata(result);
  assert.ok(Number.isFinite(d.sunDeclinationDeg));
  assert.ok(Number.isFinite(d.moonDeclinationDeg));
});

test("full-year 2026 research candidates agree at 3-hour and 10-minute scan steps", () => {
  const ephemeris = createAstronomyEngineMahapataEphemeris(AstronomyModule);
  const startUtcMs = Date.parse("2026-01-01T00:00:00Z");
  const endUtcMs = Date.parse("2027-01-01T00:00:00Z");
  const events = scanMahapataCandidates({
    ephemeris, startUtcMs, endUtcMs, stepMs: 3 * 3_600_000
  });
  const finerScan = scanMahapataCandidates({
    ephemeris, startUtcMs, endUtcMs, stepMs: 10 * 60_000
  });
  assert.equal(events.filter(event => event.eventClass === "Vyatipata").length, 14);
  assert.equal(events.filter(event => event.eventClass === "Vaidhriti").length, 13);
  assert.equal(events.length, finerScan.length);
  for (const [index, event] of finerScan.entries()) {
    assert.equal(events[index].eventClass, event.eventClass);
    assert.ok(Math.abs(events[index].utcMilliseconds - event.utcMilliseconds) <= 2);
  }
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    assert.ok(event.utcMilliseconds >= startUtcMs && event.utcMilliseconds <= endUtcMs);
    assert.ok(["Vyatipata", "Vaidhriti"].includes(event.eventClass));
    assert.ok(Math.abs(event.declinationDifferenceDeg) < 0.0001);
    assert.equal(event.status, "research-candidate-unverified");
    if (i) assert.ok(event.utcMilliseconds > events[i - 1].utcMilliseconds);
  }
});
