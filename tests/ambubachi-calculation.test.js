"use strict";

const assert = require("node:assert/strict");
const {
  AMBUBACHI_TARGET_LONGITUDE_DEGREES,
  AMBUBACHI_NIVRITTI_LONGITUDE_DEGREES,
  findSiderealSolarIngress,
  findAmbubachiSolarWindow,
  getAmbubachiRitualWindow
} = require("../ambubachi-calculation");

function test(name, fn) {
  fn();
  process.stdout.write("✓ " + name + "\n");
}

test("Ambubachi target is the beginning of Ardra first pada at Mithuna 6°40′", () => {
  assert.ok(Math.abs(AMBUBACHI_TARGET_LONGITUDE_DEGREES - 66.6666666667) < 1e-8);
});

test("Nivritti target is the end of Ardra first pada at Mithuna 10°", () => {
  assert.equal(AMBUBACHI_NIVRITTI_LONGITUDE_DEGREES, 70);
});

test("solar ingress finder bisects an increasing sidereal-longitude crossing", () => {
  const startMs = Date.UTC(2026, 5, 20, 0, 0, 0);
  const start = new Date(startMs);
  const longitudeAt = (date) => (64 + (date.getTime() - startMs) / (24 * 60 * 60 * 1000)) % 360;
  const found = findSiderealSolarIngress({
    start,
    end: new Date(Date.UTC(2026, 5, 25)),
    targetLongitudeDegrees: AMBUBACHI_TARGET_LONGITUDE_DEGREES,
    longitudeAt,
    stepHours: 6,
    toleranceMs: 1000
  });
  assert.ok(found instanceof Date);
  const expected = startMs + (AMBUBACHI_TARGET_LONGITUDE_DEGREES - 64) * 24 * 60 * 60 * 1000;
  assert.ok(Math.abs(found.getTime() - expected) <= 1500, "crossing should be found to within 1.5 seconds");
});

test("Ambubachi window calculates both pada boundaries independently", () => {
  const startMs = Date.UTC(2026, 5, 20, 0, 0, 0);
  const longitudeAt = (date) => (64 + (date.getTime() - startMs) / (24 * 60 * 60 * 1000)) % 360;
  const result = findAmbubachiSolarWindow({
    start: new Date(startMs),
    end: new Date(Date.UTC(2026, 5, 30)),
    longitudeAt,
    stepHours: 6,
    toleranceMs: 1000
  });
  assert.ok(result && result.pravritti instanceof Date && result.nivritti instanceof Date);
  assert.ok(result.nivritti > result.pravritti);
  const expectedPravritti = startMs + (AMBUBACHI_TARGET_LONGITUDE_DEGREES - 64) * 86400000;
  const expectedNivritti = startMs + (AMBUBACHI_NIVRITTI_LONGITUDE_DEGREES - 64) * 86400000;
  assert.ok(Math.abs(result.pravritti.getTime() - expectedPravritti) <= 1500);
  assert.ok(Math.abs(result.nivritti.getTime() - expectedNivritti) <= 1500);
  assert.equal(result.method, "sidereal-solar-longitude-ardra-pada-1");
});

test("solar ingress finder returns null when the target is not crossed", () => {
  const startMs = Date.UTC(2026, 5, 20);
  const longitudeAt = (date) => (40 + (date.getTime() - startMs) / (24 * 60 * 60 * 1000)) % 360;
  const found = findSiderealSolarIngress({
    start: new Date(startMs),
    end: new Date(startMs + 2 * 24 * 60 * 60 * 1000),
    targetLongitudeDegrees: AMBUBACHI_TARGET_LONGITUDE_DEGREES,
    longitudeAt
  });
  assert.equal(found, null);
});

test("provisional ritual window keeps three closure dates and a fourth-day reopening", () => {
  const window = getAmbubachiRitualWindow("2026-06-22");
  assert.deepEqual(window, {
    pravrittiDate: "2026-06-22",
    templeClosedDates: ["2026-06-23", "2026-06-24", "2026-06-25"],
    provisionalReopeningDate: "2026-06-26",
    reopeningTime: null,
    requiresOfficialConfirmation: true
  });
});

test("ritual window rejects invalid calendar dates", () => {
  assert.throws(() => getAmbubachiRitualWindow("2026-02-30"), /valid calendar date/);
});
