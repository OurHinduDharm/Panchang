import test from "node:test";
import assert from "node:assert/strict";
import * as Astronomy from "astronomy-engine";
import {
  findDailyPanchangRiseSet,
  findLocalRiseSet,
  PANCHANG_BODIES
} from "../local-horizon-events.mjs";

function mockAstronomy(events) {
  return {
    SearchRiseSet(body, observer, direction, start, limitDays, metersAboveGround) {
      const value = events[body]?.[direction === 1 ? "rise" : "set"];
      if (value === undefined || value === null) return null;
      return { date: new Date(value) };
    }
  };
}

const observer = { latitude: 29.5828, longitude: 80.2182, height: 1650 };

test("converts Kolkata local civil dates to exact UTC day bounds", () => {
  const astronomy = mockAstronomy({});
  const result = findLocalRiseSet({
    astronomy, body: "Sun", observer,
    localDate: "2026-09-13", timeZone: "Asia/Kolkata"
  });
  assert.equal(result.status, "no-event-in-local-day");
});

test("uses 23-hour and 25-hour civil days across DST transitions", () => {
  const calls = [];
  const astronomy = {
    SearchRiseSet(_body, _observer, direction, start, limitDays) {
      calls.push({ direction, start: start.toISOString(), limitDays });
      return null;
    }
  };

  findLocalRiseSet({
    astronomy, body: "Sun", observer,
    localDate: "2026-03-08", timeZone: "America/New_York"
  });
  findLocalRiseSet({
    astronomy, body: "Sun", observer,
    localDate: "2026-11-01", timeZone: "America/New_York"
  });

  assert.equal(calls[0].start, "2026-03-08T04:59:59.999Z");
  assert.ok(Math.abs(calls[0].limitDays - 23 / 24 - 0.001) < 1e-9);
  assert.equal(calls[2].start, "2026-11-01T03:59:59.999Z");
  assert.ok(Math.abs(calls[2].limitDays - 25 / 24 - 0.001) < 1e-9);
});

test("returns only rise and set events that fall inside the requested local date", () => {
  const astronomy = mockAstronomy({
    Venus: {
      rise: "2026-09-13T01:15:00.000Z",
      set: "2026-09-13T13:40:00.000Z"
    }
  });
  const result = findLocalRiseSet({
    astronomy, body: "Venus", observer,
    localDate: "2026-09-13", timeZone: "Asia/Kolkata"
  });

  assert.equal(result.status, "both-events-found");
  assert.deepEqual(result.rise, {
    instant: "2026-09-13T01:15:00.000Z",
    localDate: "2026-09-13",
    localTime: "06:45:00",
    direction: "rise"
  });
  assert.equal(result.set.localTime, "19:10:00");
});

test("does not move a next-day crossing into the requested date", () => {
  const astronomy = mockAstronomy({
    Moon: {
      rise: "2026-09-14T00:10:00.000Z",
      set: null
    }
  });
  const result = findLocalRiseSet({
    astronomy, body: "Moon", observer,
    localDate: "2026-09-13"
  });
  assert.equal(result.rise, null);
  assert.equal(result.status, "no-event-in-local-day");
});

test("returns null instead of inventing a rise or set when Astronomy Engine finds none", () => {
  const result = findLocalRiseSet({
    astronomy: mockAstronomy({ Saturn: { rise: null, set: null } }),
    body: "Saturn", observer,
    localDate: "2026-09-13"
  });
  assert.equal(result.rise, null);
  assert.equal(result.set, null);
  assert.equal(result.status, "no-event-in-local-day");
});

test("validates body, observer, date, timezone and above-ground height", () => {
  const astronomy = mockAstronomy({});
  assert.throws(() => findLocalRiseSet({
    astronomy, body: "Earth", observer, localDate: "2026-09-13"
  }), /body must be one of/);
  assert.throws(() => findLocalRiseSet({
    astronomy, body: "Sun", observer: { latitude: 91, longitude: 0, height: 0 },
    localDate: "2026-09-13"
  }), /observer coordinates/);
  assert.throws(() => findLocalRiseSet({
    astronomy, body: "Sun", observer, localDate: "2026-02-30"
  }), /valid Gregorian date/);
  assert.throws(() => findLocalRiseSet({
    astronomy, body: "Sun", observer, localDate: "2026-09-13", timeZone: "Not/AZone"
  }), /time zone/i);
  assert.throws(() => findLocalRiseSet({
    astronomy, body: "Sun", observer, localDate: "2026-09-13", metersAboveGround: -1
  }), /metersAboveGround/);
});

test("calculates real Pithoragarh rise and set events for all seven bodies", () => {
  const result = findDailyPanchangRiseSet({
    astronomy: Astronomy,
    observer: new Astronomy.Observer(observer.latitude, observer.longitude, observer.height),
    localDate: "2026-09-13",
    timeZone: "Asia/Kolkata"
  });

  assert.equal(result.length, 7);
  assert.deepEqual(result.map(item => item.body), PANCHANG_BODIES);
  for (const item of result) {
    assert.ok(["both-events-found", "rise-only", "set-only", "no-event-in-local-day"].includes(item.status));
    for (const event of [item.rise, item.set]) {
      if (!event) continue;
      assert.equal(event.localDate, "2026-09-13");
      assert.match(event.localTime, /^\d{2}:\d{2}:\d{2}$/);
      assert.ok(Number.isFinite(Date.parse(event.instant)));
    }
  }
  const sun = result.find(item => item.body === "Sun");
  assert.equal(sun.status, "both-events-found");
  assert.ok(sun.rise.localTime >= "05:00:00" && sun.rise.localTime <= "06:30:00");
  assert.ok(sun.set.localTime >= "17:30:00" && sun.set.localTime <= "19:00:00");
});

test("rejects invalid body subsets for the seven-body daily calculator", () => {
  assert.throws(() => findDailyPanchangRiseSet({
    astronomy: mockAstronomy({}), observer,
    localDate: "2026-09-13", bodies: ["Sun", "Sun"]
  }), /non-empty unique subset/);
});
