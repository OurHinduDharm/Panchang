import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  parsePrintedClock,
  clockOfDayDifferenceMinutes,
  MINUTES_PER_TIME_DEGREE,
  resolveDrikHorizonBranch,
  findLocalRiseSetEvent,
  azimuthSeparationDegrees,
  fitTheilSenLine,
  scanDrikStarAzimuthTransitions,
  sourceObservationToReference,
  measureDrikTimeSeparation,
  calibrateObservation,
  scanDrikTimeSeparationTransitions,
  measureSunAltitudeAtTargetRiseSet,
  scanDrikSolarAltitudeTransitions,
  summarizeCalibration
} from "../research/drik-ganita-time-separation.mjs";

test("clock-of-day residual is independent of a one-day date offset", () => {
  const observed = Date.parse("2027-08-16T19:27:00Z");
  const predictedNextDay = Date.parse("2027-08-17T19:23:14Z");
  assert.ok(Math.abs(clockOfDayDifferenceMinutes(predictedNextDay, observed) + 3.7667) < 0.01);
  assert.equal(clockOfDayDifferenceMinutes(Date.parse("2027-08-17T00:05:00Z"), Date.parse("2027-08-16T23:55:00Z")), 10);
  assert.equal(clockOfDayDifferenceMinutes(Date.parse("2027-08-16T23:55:00Z"), Date.parse("2027-08-17T00:05:00Z")), -10);
});

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
  assert.equal(resolveDrikHorizonBranch({ planet: "अगस्त्य", event: "अगस्त्य तारा उदय क्षण", sourceId: "drikpanchang-almora" }), "rise");
  assert.equal(resolveDrikHorizonBranch({ planet: "अगस्त्य", event: "अस्त क्षण", sourceId: "drikpanchang-almora" }), "set");
  assert.equal(resolveDrikHorizonBranch({ planet: "अगस्त्य", event: "अगस्त्योदय", sourceId: "ganesh-martand" }), null);
});

test("traditional Agastya Udaya dates are excluded from geometric Canopus calibration", () => {
  const traditional = sourceObservationToReference({
    id: "gm-agastya", sourceId: "ganesh-martand", planet: "अगस्त्य",
    event: "अगस्त्योदय", date: "2026-09-01", timeRaw: "13.13"
  });
  assert.equal(traditional.body, "Star1");
  assert.equal(traditional.eventType, null);
  assert.equal(traditional.branch, null);
  assert.equal(traditional.usableForCalibration, false);

  const drik = sourceObservationToReference({
    id: "drik-agastya", sourceId: "drikpanchang-almora", planet: "अगस्त्य",
    event: "अगस्त्य तारा उदय क्षण", date: "2026-09-07", timeRaw: "04:46"
  });
  assert.equal(drik.eventType, "Udaya");
  assert.equal(drik.branch, "rise");
  assert.equal(drik.usableForCalibration, true);
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
    SearchRiseSet: (body, observer, direction, dateStart) => ({
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
    SearchRiseSet: (body, observer, direction, dateStart) => ({
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
    { available: true, body: "Venus", branch: "rise", sourceId: "drikpanchang-almora", calibratedTimeDegrees: 8, bodyEventResidualMinutes: 1, id: "a" },
    { available: true, body: "Venus", branch: "rise", sourceId: "drikpanchang-almora", calibratedTimeDegrees: 10, bodyEventResidualMinutes: 3, id: "b" },
    { available: true, body: "Venus", branch: "rise", sourceId: "ganesh-martand", calibratedTimeDegrees: 12, bodyEventResidualMinutes: 2, id: "c" }
  ]);
  assert.equal(summary[0].medianThresholdDegrees, 9);
  assert.equal(summary[0].thresholdFitSamples, 2);
  assert.equal(summary[0].medianBodyEventResidualMinutes, 2);
});

test("daily time-separation scanner detects downward Asta and upward Udaya", () => {
  const start = Date.UTC(2026, 0, 1);
  const gaps = [12, 10, 8, 10, 12];
  const result = scanDrikTimeSeparationTransitions({
    body: "Venus", observer: {}, branch: "rise",
    startLocalDayUtc: start, days: gaps.length, astaThresholdTimeDegrees: 9, udayaThresholdTimeDegrees: 11,
    SearchRiseSet: (body, observer, direction, dateStart) => {
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
    SearchRiseSet: (body, observer, direction, dateStart) => {
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

test("Jupiter only emits Asta from setting and Udaya from rising", () => {
  const start = Date.UTC(2026, 0, 1);
  const gaps = [12, 8, 12];
  const mock = (body, observer, direction, dateStart) => {
    const index = Math.round((dateStart.getTime() - start) / 86_400_000);
    const offset = body === "Sun" ? 300 : 300 + gaps[index] * MINUTES_PER_TIME_DEGREE;
    return { date: new Date(dateStart.getTime() + offset * 60_000) };
  };
  const setting = scanDrikTimeSeparationTransitions({
    SearchRiseSet: mock, body: "Jupiter", observer: {}, branch: "set",
    startLocalDayUtc: start, days: 3, thresholdTimeDegrees: 10
  });
  const rising = scanDrikTimeSeparationTransitions({
    SearchRiseSet: mock, body: "Jupiter", observer: {}, branch: "rise",
    startLocalDayUtc: start, days: 3, thresholdTimeDegrees: 10
  });
  assert.deepEqual(setting.events.map(event => event.event), ["Asta"]);
  assert.deepEqual(rising.events.map(event => event.event), ["Udaya"]);
});

test("calibration thresholds stay separate for Asta and Udaya", () => {
  const summary = summarizeCalibration([
    { available: true, body: "Venus", branch: "rise", sourceId: "drikpanchang-almora", eventType: "Asta", calibratedTimeDegrees: 8, bodyEventResidualMinutes: 1, id: "asta" },
    { available: true, body: "Venus", branch: "rise", sourceId: "drikpanchang-almora", eventType: "Udaya", calibratedTimeDegrees: 10, bodyEventResidualMinutes: 1, id: "udaya" }
  ]);
  assert.equal(summary.length, 2);
  assert.deepEqual(summary.map(item => item.eventType).sort(), ["Asta", "Udaya"]);
});

test("Sun altitude is measured at the target's local apparent rise/set event", () => {
  const start = Date.UTC(2026, 0, 1);
  const result = measureSunAltitudeAtTargetRiseSet({
    SearchRiseSet: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + 6 * 60 * 60_000)
    }),
    Equator: () => ({ ra: 0, dec: 0 }),
    Horizon: date => ({ altitude: date.getUTCHours() === 6 ? -7.25 : 0 }),
    body: "Jupiter", observer: {}, branch: "rise", localDayStartUtc: start
  });
  assert.equal(result.available, true);
  assert.equal(result.sunAltitudeDeg, -7.25);
});

test("solar-altitude threshold scanner detects Udaya then Asta", () => {
  const start = Date.UTC(2026, 0, 1);
  const alts = [-5, -6, -7, -6, -5];
  const result = scanDrikSolarAltitudeTransitions({
    SearchRiseSet: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + 6 * 60 * 60_000)
    }),
    Equator: () => ({ ra: 0, dec: 0 }),
    Horizon: date => {
      const index = Math.floor((date.getTime() - start) / 86_400_000);
      return { altitude: alts[index] };
    },
    body: "Venus", observer: {}, branch: "rise",
    startLocalDayUtc: start, days: alts.length,
    astaSunAltitudeDeg: -6.5, udayaSunAltitudeDeg: -6.5
  });
  assert.deepEqual(result.events.map(event => event.event), ["Udaya", "Asta"]);
});

test("Jupiter solar-altitude scanner restricts Asta to setting and Udaya to rising", () => {
  const start = Date.UTC(2026, 0, 1);
  const alts = [-5, -7, -5];
  const args = {
    SearchRiseSet: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + 6 * 60 * 60_000)
    }),
    Equator: () => ({ ra: 0, dec: 0 }),
    Horizon: date => ({ altitude: alts[Math.floor((date.getTime() - start) / 86_400_000)] }),
    body: "Jupiter", observer: {}, startLocalDayUtc: start, days: 3,
    astaSunAltitudeDeg: -6, udayaSunAltitudeDeg: -6
  };
  const setting = scanDrikSolarAltitudeTransitions({ ...args, branch: "set" });
  const rising = scanDrikSolarAltitudeTransitions({ ...args, branch: "rise" });
  assert.deepEqual(setting.events.map(event => event.event), ["Asta"]);
  assert.deepEqual(rising.events.map(event => event.event), ["Udaya"]);
});

test("solar-altitude transition reports the first qualifying actual target rise/set event", () => {
  const start = Date.UTC(2026, 0, 1);
  const alts = [-5, -6, -7, -6, -5];
  const result = scanDrikSolarAltitudeTransitions({
    SearchRiseSet: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + 6 * 60 * 60_000)
    }),
    Equator: () => ({ ra: 0, dec: 0 }),
    Horizon: date => ({ altitude: alts[Math.floor((date.getTime() - start) / 86_400_000)] }),
    body: "Venus", observer: {}, branch: "rise",
    startLocalDayUtc: start, days: alts.length,
    astaSunAltitudeDeg: -6.5, udayaSunAltitudeDeg: -6.5
  });
  assert.equal(result.events[0].event, "Udaya");
  assert.equal(result.events[0].utcMilliseconds, start + 2 * 86_400_000 + 6 * 60 * 60_000);
  assert.equal(result.events[1].event, "Asta");
  assert.equal(result.events[1].utcMilliseconds, start + 3 * 86_400_000 + 6 * 60 * 60_000);
});

test("time separation compares Sun event with the requested target body event", async () => {
  const { measureDrikTimeSeparation } = await import("../research/drik-ganita-time-separation.mjs");
  const calls = [];
  const SearchRiseSet = (body, observer, direction, date) => {
    calls.push(body);
    return { date: new Date(date.getTime() + (body === "Sun" ? 6 : 7) * 60 * 60 * 1000) };
  };
  const result = measureDrikTimeSeparation({
    SearchRiseSet, body: "Venus", observer: {}, branch: "rise",
    localDayStartUtc: Date.UTC(2026, 0, 1)
  });
  assert.deepEqual(calls, ["Sun", "Venus"]);
  assert.equal(result.available, true);
  assert.equal(result.gapMinutes, 60);
});


test("solar-altitude scanner uses separate Venus direct/retrograde profiles and never bridges a station", () => {
  const start = Date.UTC(2026, 0, 1);
  const alts = [-5, -7, -9, -7, -5];
  const states = ["direct", "direct", "retrograde", "retrograde", "retrograde"];
  const result = scanDrikSolarAltitudeTransitions({
    SearchRiseSet: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + 6 * 60 * 60_000)
    }),
    Equator: () => ({ ra: 0, dec: 0 }),
    Horizon: date => ({
      altitude: alts[Math.floor((date.getTime() - start) / 86_400_000)]
    }),
    body: "Venus", observer: {}, branch: "rise",
    startLocalDayUtc: start, days: alts.length,
    astaSunAltitudeDeg: { direct: -6, retrograde: -8 },
    udayaSunAltitudeDeg: { direct: -6, retrograde: -8 },
    motionStateAt: (body, instant) =>
      states[Math.floor((instant - start - 6 * 60 * 60_000) / 86_400_000)]
  });
  assert.deepEqual(result.events.map(event => [event.event, event.motionState]), [
    ["Udaya", "direct"],
    ["Asta", "retrograde"]
  ]);
  assert.deepEqual(result.events.map(event => event.utcMilliseconds), [
    start + 86_400_000 + 6 * 60 * 60_000,
    start + 3 * 86_400_000 + 6 * 60 * 60_000
  ]);
});


test("Drik-Ganita benchmark observation IDs are unique", () => {
  const dataset = JSON.parse(fs.readFileSync(
    new URL("../research/drik-ganita-asta-udaya-benchmarks-2019-2027.json", import.meta.url),
    "utf8"
  ));
  const ids = dataset.observations.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
});


test("Agastya uses the geometric zero-altitude crossing, not refraction-corrected apparent rise/set", () => {
  const start = Date.UTC(2026, 8, 7);
  const calls = [];
  const result = findLocalRiseSetEvent({
    SearchRiseSet: () => {
      calls.push("apparent-rise-set");
      return { date: new Date(start + 7 * 60_000) };
    },
    SearchAltitude: (body, observer, direction, dateStart, limitDays, altitude) => {
      calls.push({ body, direction, altitude });
      return { date: new Date(dateStart.getTime() + 2 * 60_000) };
    },
    body: "Star1", observer: {}, direction: "rise", localDayStartUtc: start
  });
  assert.equal(result, start + 2 * 60_000);
  assert.deepEqual(calls, [{ body: "Star1", direction: 1, altitude: 0 }]);
});


test("Agastya azimuth separation wraps across north correctly", () => {
  assert.equal(azimuthSeparationDegrees(359, 1), 2);
  assert.equal(azimuthSeparationDegrees(10, 350), 20);
});

test("Theil-Sen fit recovers a robust straight-line threshold", () => {
  const fit = fitTheilSenLine([
    { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }, { x: 4, y: 20 }
  ]);
  assert.ok(Math.abs(fit.slope - 2) < 1e-12);
  assert.ok(Math.abs(fit.intercept) < 1e-12);
  assert.equal(fit.samples, 4);
});

test("Agastya Udaya uses a downward azimuth-corrected residual crossing", () => {
  const start = Date.UTC(2026, 8, 1);
  const altitudes = [-5, -7, -8];
  const result = scanDrikStarAzimuthTransitions({
    SearchAltitude: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + 6 * 60 * 60_000)
    }),
    Equator: body => ({ ra: body === "Sun" ? 0 : 1, dec: 0 }),
    Horizon: (date, observer, ra) => {
      const index = Math.floor((date.getTime() - start) / 86_400_000);
      return {
        altitude: ra === 0 ? altitudes[index] : 0.5,
        azimuth: ra === 0 ? 0 : 90
      };
    },
    observer: {}, branch: "rise", event: "Udaya",
    startLocalDayUtc: start, days: 3, slope: 0, intercept: -6
  });
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].event, "Udaya");
  assert.equal(result.events[0].utcMilliseconds, start + 86_400_000 + 6 * 60 * 60_000);
  assert.equal(result.events[0].azimuthSeparationDeg, 90);
});

test("Agastya Asta requires a setting branch and upward residual crossing", () => {
  const start = Date.UTC(2026, 3, 1);
  const altitudes = [-7, -5, -4];
  const result = scanDrikStarAzimuthTransitions({
    SearchAltitude: (body, observer, direction, dateStart) => ({
      date: new Date(dateStart.getTime() + 18 * 60 * 60_000)
    }),
    Equator: body => ({ ra: body === "Sun" ? 0 : 1, dec: 0 }),
    Horizon: (date, observer, ra) => {
      const index = Math.floor((date.getTime() - start) / 86_400_000);
      return { altitude: ra === 0 ? altitudes[index] : 0.5, azimuth: ra === 0 ? 0 : 90 };
    },
    observer: {}, branch: "set", event: "Asta",
    startLocalDayUtc: start, days: 3, slope: 0, intercept: -6
  });
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].event, "Asta");
  assert.equal(result.events[0].utcMilliseconds, start + 86_400_000 + 18 * 60 * 60_000);
  assert.throws(() => scanDrikStarAzimuthTransitions({
    SearchAltitude: () => null, Equator: () => ({}), Horizon: () => ({}),
    observer: {}, branch: "rise", event: "Asta",
    startLocalDayUtc: start, days: 3, slope: 0, intercept: -6
  }), /Agastya Udaya requires rise/);
});
