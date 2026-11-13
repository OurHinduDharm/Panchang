import test from "node:test";
import assert from "node:assert/strict";
import {
  createSwissHeliacalAdapter,
  dateToJulianDayUT,
  HELIACAL_EVENT
} from "../research/swiss-ephemeris-heliacal-adapter.mjs";

const location = {
  latitude: 29.5828,
  longitude: 80.2182,
  elevationMeters: 1650
};

function jd(iso) {
  return dateToJulianDayUT(new Date(iso));
}

test("maps a Pithoragarh morning-first request to Swiss heliacal inputs", () => {
  let received;
  const adapter = createSwissHeliacalAdapter({
    heliacalFlags: 64,
    heliacalCall(args) {
      received = args;
      return {
        returnCode: 0,
        times: [
          jd("2026-10-29T00:00:00.000Z"),
          jd("2026-10-29T00:05:00.000Z"),
          jd("2026-10-29T00:12:00.000Z")
        ]
      };
    }
  });

  const result = adapter.calculate({
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    location,
    objectName: "Venus",
    eventType: HELIACAL_EVENT.MORNING_FIRST
  });

  assert.equal(received.julianDayUT, jd("2026-01-01T00:00:00.000Z"));
  assert.deepEqual(received.geographicPosition, [80.2182, 29.5828, 1650]);
  assert.deepEqual(received.atmosphericConditions, [0, 0, 0, 0]);
  assert.deepEqual(received.observerConditions, [36, 1, 0, 0, 0, 0]);
  assert.equal(received.eventType, 1);
  assert.equal(received.heliacalFlags, 64);
  assert.equal(result.eventType, "morning-first");
  assert.equal(result.eventClass, "local-heliacal-visibility");
  assert.equal(result.visibility.begin, "2026-10-29T00:00:00.000Z");
  assert.equal(result.visibility.optimum, "2026-10-29T00:05:00.000Z");
  assert.equal(result.visibility.end, "2026-10-29T00:12:00.000Z");
  assert.equal(result.terrainHorizon, "not-included");
});

test("maps an evening-last request separately from morning-first", () => {
  let eventType;
  const adapter = createSwissHeliacalAdapter({
    heliacalCall(args) {
      eventType = args.eventType;
      return { returnCode: 0, times: [jd("2026-10-12T12:30:00Z"), 0, 0] };
    }
  });
  const result = adapter.calculate({
    startDate: new Date("2026-01-01T00:00:00Z"),
    location,
    objectName: "Venus",
    eventType: HELIACAL_EVENT.EVENING_LAST
  });
  assert.equal(eventType, 2);
  assert.equal(result.eventType, "evening-last");
  assert.equal(result.visibility.optimum, null);
  assert.equal(result.visibility.end, null);
});

test("accepts explicit UT1 Julian Day to avoid UTC approximation", () => {
  let received;
  const adapter = createSwissHeliacalAdapter({
    heliacalCall(args) {
      received = args.julianDayUT;
      return { returnCode: 0, times: [jd("2026-10-12T12:00:00Z"), 0, 0] };
    }
  });
  const result = adapter.calculate({
    julianDayUT: 2461326.0,
    location,
    objectName: "Jupiter",
    eventType: HELIACAL_EVENT.EVENING_LAST
  });
  assert.equal(received, 2461326.0);
  assert.equal(result.utcConversion, "caller-supplied-UT1");
});

test("allows evening-first and morning-last only for inferior planets and Moon", () => {
  const adapter = createSwissHeliacalAdapter({
    heliacalCall: () => ({ returnCode: 0, times: [jd("2026-01-02T00:00:00Z"), 0, 0] })
  });
  assert.throws(() => adapter.calculate({
    startDate: new Date("2026-01-01T00:00:00Z"),
    location,
    objectName: "Jupiter",
    eventType: HELIACAL_EVENT.EVENING_FIRST
  }), /only supported/);
  assert.throws(() => adapter.calculate({
    startDate: new Date("2026-01-01T00:00:00Z"),
    location,
    objectName: "Saturn",
    eventType: HELIACAL_EVENT.MORNING_LAST
  }), /only supported/);
});

test("rejects invalid observer, event, times and native errors", () => {
  const adapter = createSwissHeliacalAdapter({
    heliacalCall: () => ({ returnCode: 0, times: [jd("2026-01-02T00:00:00Z"), 0, 0] })
  });
  assert.throws(() => adapter.calculate({
    startDate: new Date("2026-01-01T00:00:00Z"),
    location: { ...location, latitude: 61 },
    objectName: "Venus",
    eventType: 1
  }), /location.latitude/);
  assert.throws(() => adapter.calculate({
    startDate: new Date("2026-01-01T00:00:00Z"),
    location,
    objectName: "Venus",
    eventType: 5
  }), /eventType/);
  const badTimes = createSwissHeliacalAdapter({
    heliacalCall: () => ({ returnCode: 0, times: [0, 0, 0] })
  });
  assert.throws(() => badTimes.calculate({
    startDate: new Date("2026-01-01T00:00:00Z"),
    location,
    objectName: "Venus",
    eventType: 1
  }), /heliacal begin JD/);
  const failed = createSwissHeliacalAdapter({
    heliacalCall: () => ({ returnCode: -1, error: "native heliacal error" })
  });
  assert.throws(() => failed.calculate({
    startDate: new Date("2026-01-01T00:00:00Z"),
    location,
    objectName: "Venus",
    eventType: 1
  }), /native heliacal error/);
});

test("converts Unix epoch and rejects invalid date", () => {
  assert.equal(dateToJulianDayUT(new Date("1970-01-01T00:00:00Z")), 2440587.5);
  assert.throws(() => dateToJulianDayUT(new Date("invalid")), /valid Date/);
});
