import assert from "node:assert/strict";
import test from "node:test";
import { findAngularCombustionBoundaries } from "../research/planetary-angular-combustion.mjs";

const epoch = Date.parse("2026-10-19T00:00:00.000Z");
const hours = value => new Date(epoch + value * 60 * 60 * 1000);
const segment = (startHour, endHour, thresholdDeg, motion = "direct") => ({
  start: hours(startHour),
  end: hours(endHour),
  thresholdDeg,
  motion
});

test("finds an angular asta boundary and refines it to the requested tolerance", () => {
  const events = findAngularCombustionBoundaries({
    sampleElongation: date => 12 - 0.5 * ((date.getTime() - epoch) / 3_600_000),
    segments: [segment(0, 8, 10, "direct")],
    coarseStepMinutes: 180,
    toleranceSeconds: 1
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, "asta-start");
  assert.equal(events[0].motion, "direct");
  assert.equal(events[0].thresholdDeg, 10);
  assert.ok(Math.abs(Date.parse(events[0].instant) - hours(4).getTime()) <= 1000);
});

test("finds the return crossing as udaya", () => {
  const events = findAngularCombustionBoundaries({
    sampleElongation: date => 7 + 0.5 * ((date.getTime() - epoch) / 3_600_000),
    segments: [segment(0, 8, 9, "retrograde")],
    coarseStepMinutes: 120,
    toleranceSeconds: 1
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, "udaya");
  assert.equal(events[0].motion, "retrograde");
  assert.ok(Math.abs(Date.parse(events[0].instant) - hours(4).getTime()) <= 1000);
});

test("a retrograde/direct threshold change cannot create a false crossing", () => {
  const events = findAngularCombustionBoundaries({
    sampleElongation: () => 9,
    segments: [
      segment(0, 6, 10, "direct"),
      segment(6, 12, 8, "retrograde")
    ]
  });

  assert.deepEqual(events, []);
});

test("rejects overlapping segments and invalid elongation", () => {
  assert.throws(() => findAngularCombustionBoundaries({
    sampleElongation: () => 9,
    segments: [segment(0, 8, 10), segment(7, 12, 8, "retrograde")]
  }), /must not overlap/);

  assert.throws(() => findAngularCombustionBoundaries({
    sampleElongation: () => 181,
    segments: [segment(0, 2, 10)]
  }), /sampled elongation/);
});
