import tzLookup from "../vendor/tz-lookup-11.8.0.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  addIsoCalendarDays,
  getIsoDateInTimeZone,
  getTimeZoneOffsetMinutes,
  getTimeZoneOffsetForLocalDay,
  getWeekdayForIsoDate,
  isValidTimeZone,
  zonedDateTimeToUtc
} from "../location-timezone.mjs";

test("resolves city coordinates to IANA timezones locally", () => {
  assert.equal(tzLookup(29.5828, 80.2182), "Asia/Kolkata");
  assert.equal(tzLookup(51.5072, -0.1276), "Europe/London");
  assert.equal(tzLookup(40.7128, -74.006), "America/New_York");
});

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

test("uses the offset at local midnight on DST transition days", () => {
  const londonSpring = new Date("2026-03-29T12:00:00Z");
  const londonAutumn = new Date("2026-10-25T12:00:00Z");
  const newYorkSpring = new Date("2026-03-08T16:00:00Z");
  assert.equal(getTimeZoneOffsetMinutes(londonSpring, "Europe/London"), 60);
  assert.equal(getTimeZoneOffsetForLocalDay(londonSpring, "Europe/London"), 0);
  assert.equal(getTimeZoneOffsetMinutes(londonAutumn, "Europe/London"), 0);
  assert.equal(getTimeZoneOffsetForLocalDay(londonAutumn, "Europe/London"), 60);
  assert.equal(getTimeZoneOffsetMinutes(newYorkSpring, "America/New_York"), -240);
  assert.equal(getTimeZoneOffsetForLocalDay(newYorkSpring, "America/New_York"), -300);
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

test("daily and supplementary Panchang use the selected location timezone", async () => {
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
  const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const eclipse = await readFile(new URL("../eclipse-panchang.js", import.meta.url), "utf8");
  assert.match(app, /tzLookup/);
  assert.match(app, /getTimeZoneOffsetForLocalDay/);
  assert.doesNotMatch(app, /timezoneOffset\s*:\s*330/);
  assert.match(source, /location\.timeZone/);
  assert.match(source, /getTimeZoneOffsetForLocalDay/);
  assert.match(source, /getIsoDateInTimeZone/);
  assert.doesNotMatch(source, /timezoneOffset\s*:\s*330/);
  assert.doesNotMatch(source, /timeZone\s*:\s*"Asia\/Kolkata"/);
});
