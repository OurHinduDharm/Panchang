import test from "node:test";
import assert from "node:assert/strict";
import {
  addIsoCalendarDays,
  getIsoDateInTimeZone,
  getTimeZoneOffsetMinutes,
  getWeekdayForIsoDate,
  isValidTimeZone,
  zonedDateTimeToUtc
} from "../location-timezone.mjs";

test("validates IANA timezone identifiers", () => {
  assert.equal(isValidTimeZone("Asia/Kolkata"), true);
  assert.equal(isValidTimeZone("Europe/London"), true);
  assert.equal(isValidTimeZone("Not/AZone"), false);
});

test("returns the correct DST-sensitive offsets", () => {
  assert.equal(getTimeZoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "Europe/London"), 0);
  assert.equal(getTimeZoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "Europe/London"), 60);
  assert.equal(getTimeZoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "America/New_York"), -300);
  assert.equal(getTimeZoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "America/New_York"), -240);
  assert.equal(getTimeZoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "Asia/Kolkata"), 330);
});

test("converts local noon to the matching UTC instant", () => {
  assert.equal(zonedDateTimeToUtc("2026-01-15", 12, 0, "Asia/Kolkata").toISOString(), "2026-01-15T06:30:00.000Z");
  assert.equal(zonedDateTimeToUtc("2026-01-15", 12, 0, "Europe/London").toISOString(), "2026-01-15T12:00:00.000Z");
  assert.equal(zonedDateTimeToUtc("2026-07-15", 12, 0, "Europe/London").toISOString(), "2026-07-15T11:00:00.000Z");
  assert.equal(zonedDateTimeToUtc("2026-07-15", 12, 0, "America/New_York").toISOString(), "2026-07-15T16:00:00.000Z");
});

test("keeps local calendar dates stable across UTC date boundaries", () => {
  const londonNoon = zonedDateTimeToUtc("2026-01-15", 12, 0, "Europe/London");
  const newYorkNoon = zonedDateTimeToUtc("2026-01-15", 12, 0, "America/New_York");
  assert.equal(getIsoDateInTimeZone(londonNoon, "Europe/London"), "2026-01-15");
  assert.equal(getIsoDateInTimeZone(newYorkNoon, "America/New_York"), "2026-01-15");
  assert.equal(addIsoCalendarDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addIsoCalendarDays("2026-01-01", -1), "2025-12-31");
  assert.equal(getWeekdayForIsoDate("2026-01-01"), 4);
});

test("uses the offset at the selected local date when crossing a DST boundary", () => {
  const before = zonedDateTimeToUtc("2026-03-28", 12, 0, "Europe/London");
  const after = zonedDateTimeToUtc("2026-03-29", 12, 0, "Europe/London");
  assert.equal(getTimeZoneOffsetMinutes(before, "Europe/London"), 0);
  assert.equal(getTimeZoneOffsetMinutes(after, "Europe/London"), 60);
});
