import test from "node:test";
import assert from "node:assert/strict";
import { calculateSpecialPunyaKaalMonth } from "../special-punya-kaal-runtime.mjs";

function fakePanchang(date) {
  const iso = new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 10);
  return {
    masa: "Vaishakha",
    paksha: "शुक्ल पक्ष",
    sunrise: new Date(iso + "T00:30:00.000Z"),
    sunset: new Date(iso + "T12:30:00.000Z"),
    tithis: [{ index: 1, name: "Pratipada", paksha: "Shukla", startTime: new Date(iso + "T00:00:00Z"), endTime: new Date(iso + "T23:00:00Z") }],
    nakshatras: [{ index: 1, name: "Ashwini", startTime: new Date(iso + "T00:00:00Z"), endTime: new Date(iso + "T23:00:00Z") }],
    yogas: [{ index: 1, name: "Priti", startTime: new Date(iso + "T00:00:00Z"), endTime: new Date(iso + "T23:00:00Z") }]
  };
}

test("on-demand scanner calculates selected month and includes both boundary days", async () => {
  const calls = [];
  const result = await calculateSpecialPunyaKaalMonth({
    year: 2028,
    month: 2,
    observer: { id: "test-observer" },
    getPanchangam: async (date, observer, options) => {
      calls.push({ date, observer, options });
      return fakePanchang(date);
    }
  });
  assert.equal(result.status, "research-only-not-approved");
  assert.equal(result.year, 2028);
  assert.equal(result.month, 2);
  assert.equal(result.scannedDays, 31);
  assert.equal(result.panchangCalls, 31);
  assert.equal(calls[0].date.toISOString(), "2028-01-31T06:30:00.000Z");
  assert.equal(calls.at(-1).date.toISOString(), "2028-03-02T06:30:00.000Z");
  assert.equal(calls[0].observer.id, "test-observer");
  assert.deepEqual(calls[0].options, { timezoneOffset: 330, calendarType: "purnimanta" });
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.candidates, []);
});

test("scanner rejects unsupported calendar/timezone profiles rather than silently mixing rules", async () => {
  await assert.rejects(() => calculateSpecialPunyaKaalMonth({
    year: 2028, month: 2, observer: {},
    getPanchangam: fakePanchang, timezoneOffsetMinutes: 0
  }), /Only the approved IST\/Purnimanta/);
});

test("scanner requires a real Panchang function and observer", async () => {
  await assert.rejects(() => calculateSpecialPunyaKaalMonth({
    year: 2028, month: 2, observer: {}, getPanchangam: null
  }), /getPanchangam/);
  await assert.rejects(() => calculateSpecialPunyaKaalMonth({
    year: 2028, month: 2, getPanchangam: fakePanchang
  }), /observer/);
});

test("scanner validates year and month", async () => {
  await assert.rejects(() => calculateSpecialPunyaKaalMonth({
    year: 2028, month: 13, observer: {}, getPanchangam: fakePanchang
  }), /valid year and month/);
});
