import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePrintedClock,
  MINUTES_PER_TIME_DEGREE,
  resolveDrikHorizonBranch,
  sourceObservationToReference,
  measureDrikTimeSeparation,
  calibrateObservation,
  scanDrikTimeSeparationTransitions,
  summarizeCalibration
} from "../research/drik-ganita-time-separation.mjs";

test("Ganesh Martand >24-hour clock notation rolls to the next civil date", () => {
  const parsed = parsePrintedClock("2019-07-20", "34.07");
  assert.equal(parsed.valid, true);
  assert.equal(parsed.dayRollover, 1);
  assert.equal(parsed.normalizedUtc, "2019-07-21T04:37:00.000Z");
});

test("Drik HH:mm clock is parsed without changing the source date", () => {
  const parsed = parsePrintedClock("2026-10-12", "18:07");
  assert.equal(parsed.valid, true);
  assert.equal(parsed.dayRollover, 0);
  assert.equal(parsed.normalizedUtc, "2026-10-12T12:37:00.000Z");
});

test("ambiguous AM/PM notation is rejected rather than guessed", () => {
  assert.equal(parsePrintedClock("2023-08-04", "15.00", "pm").reason,
    "ambiguous-12h-qualifier");
});

test("horizon branch follows the printed east/west direction", () => {
  assert.equal(resolveDrikHorizonBranch({ planet: "शुक्र", event: "अस्त", direction: "पूर्व" }), "rise");
  assert.equal(resolveDrikHorizonBranch({ planet: "शुक्र", event: "उदय", direction: "पश्चिम" }), "set");
  assert.equal(resolveDrikHorizonBranch({ planet: "शुक्र", event: "अस्त", direction: "पश्चिम" }), "set");
  assert.equal(resolveDrikHorizonBranch({ planet: "शुक्र", event: "उदय", direction: "पूर्व" }), "rise");
  assert.equal(resolveDrikHorizonBranch({ planet: "बृहस्पति", event: "अस्त प्रारम्भ" }), "set");
  assert.equal(resolveDrikHorizonBranch({ planet: "बृहस्पति", event: "अस्त समाप्त" }), "rise");
  assert.equal(resolveDrikHorizonBranch({ planet: "अगस्त्य", event: "अगस्त्य तारा उदय क्षण" }), "rise");
  assert.equal(resolveDrikHorizonBranch({ planet: "अगस्त्य", event: "अस्त क्षण" }), "set");
});

test("source conversion preserves raw time and selects an event branch", () => {
  const ref = sourceObservationToReference({
    id: "gm-test", sourceId: "ganesh-martand", planet: "शुक्र",
    event: "अस्त", date: "2026-10-12", timeRaw: "17.40", direction: "पूर्व"
  });
  assert.equal(ref.body, "Venus");
  assert.equal(ref.branch, "rise");
  assert.equal(ref.usableForCalibration, true);
});

test("time separation converts minutes using one sidereal time-degree", () => {
  const start = Date.UTC(2026, 9, 12);
  const result = measureDrikTimeSeparation({
    body: "Jupiter",
    observer: {},
    branch: "rise",
    localDayStartUtc: start,
    SearchAltitude: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + (body === "Sun" ? 30 : 70) * 60_000)
    })
  });
  assert.equal(result.available, true);
  assert.equal(result.gapMinutes, 40);
  assert.ok(Math.abs(result.timeDegrees - 40 / MINUTES_PER_TIME_DEGREE) < 1e-10);
});

test("calibration reports source-time residual against body horizon crossing", () => {
  const start = Date.parse("2026-10-12T00:00:00+05:30");
  const observation = {
    id: "drik-test", sourceId: "drikpanchang-almora", planet: "बृहस्पति",
    event: "अस्त प्रारम्भ", date: "2026-10-12", timeRaw: "18:07"
  };
  const result = calibrateObservation({
    observation, observer: {}, localDayStartUtc: start,
    SearchAltitude: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + (
        body === "Sun" ? 18 * 60 : 18 * 60 + 7
      ) * 60_000)
    })
  });
  assert.equal(result.available, true);
  assert.equal(result.bodyEventResidualMinutes, 0);
  assert.ok(Math.abs(result.calibratedTimeDegrees - 7 / MINUTES_PER_TIME_DEGREE) < 1e-10);
});

test("calibration summary uses median thresholds and residuals", () => {
  const summary = summarizeCalibration([
    { available: true, body: "Venus", branch: "rise", calibratedTimeDegrees: 8, bodyEventResidualMinutes: 1, id: "a" },
    { available: true, body: "Venus", branch: "rise", calibratedTimeDegrees: 10, bodyEventResidualMinutes: 3, id: "b" },
    { available: true, body: "Venus", branch: "rise", calibratedTimeDegrees: 12, bodyEventResidualMinutes: 2, id: "c" }
  ]);
  assert.equal(summary[0].medianThresholdDegrees, 10);
  assert.equal(summary[0].medianBodyEventResidualMinutes, 2);
});

test("daily time-separation scanner detects downward Asta and upward Udaya", () => {
  const start = Date.UTC(2026, 0, 1);
  const gaps = [12, 10, 8, 10, 12];
  const result = scanDrikTimeSeparationTransitions({
    body: "Jupiter", observer: {}, branch: "rise",
    startLocalDayUtc: start, days: gaps.length, astaThresholdTimeDegrees: 9, udayaThresholdTimeDegrees: 11,
    SearchAltitude: (body, observer, direction, dateStart) => {
      const index = Math.round((dateStart.getTime() - start) / 86_400_000);
      const offsetMinutes = body === "Sun" ? 300 : 300 + gaps[index] * MINUTES_PER_TIME_DEGREE;
      return { date: new Date(dateStart.getTime() + offsetMinutes * 60_000) };
    }
  });
  assert.deepEqual(result.events.map(event => event.event), ["Asta", "Udaya"]);
  assert.deepEqual(result.events.map(event => event.thresholdTimeDegrees), [9, 11]);
});

test("Drik Venus records without a printed direction resolve from the computed event clock", () => {
  const start = Date.parse("2026-10-12T00:00:00+05:30");
  const observation = {
    id: "drik-venus-no-direction", sourceId: "drikpanchang-almora",
    planet: "शुक्र", event: "अस्त प्रारम्भ", date: "2026-10-12", timeRaw: "18:07"
  };
  const result = calibrateObservation({
    observation, observer: {}, localDayStartUtc: start,
    SearchAltitude: (body, observer, direction, dateStart) => {
      const offset = direction === -1
        ? (body === "Sun" ? 18 * 60 : 18 * 60 + 7)
        : (body === "Sun" ? 6 * 60 : 6 * 60 + 5);
      return { date: new Date(dateStart.getTime() + offset * 60_000) };
    }
  });
  assert.equal(result.available, true);
  assert.equal(result.branch, "set");
  assert.equal(result.inferredBranch, true);
  assert.equal(result.bodyEventResidualMinutes, 0);
});
