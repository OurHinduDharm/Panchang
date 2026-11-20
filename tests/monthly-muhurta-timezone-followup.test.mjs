import test from "node:test";
import assert from "node:assert/strict";
import {
  formatFestivalMuhurtaTime,
  getFestivalMuhurtaContext,
  getSamavedaUpakarmaDateDecision
} from "../festival-muhurta.js";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../festival-muhurta.js",import.meta.url),"utf8");
const widget=fs.readFileSync(new URL("../monthly-vrat-parv-widget.js",import.meta.url),"utf8");

test("festival muhurta clock formatter renders the same instant in selected local zones",()=>{
  const instant="2026-11-20T18:30:00.000Z";
  assert.notEqual(formatFestivalMuhurtaTime(instant,"Asia/Kolkata"),formatFestivalMuhurtaTime(instant,"America/New_York"));
  assert.match(formatFestivalMuhurtaTime(instant,"Europe/London"),/\d/);
});

test("festival context retains selected timezone for local weekday and date rules",()=>{
  const context=getFestivalMuhurtaContext({}, {}, new Date("2026-11-20T12:00:00Z"), {}, null, "America/New_York");
  assert.equal(context.timeZone,"America/New_York");
  assert.match(source,/function localWeekday\(dateValue, timeZone = "Asia\/Kolkata"\)/);
  assert.match(source,/localWeekday\(context\.date, context\.timeZone\)/);
});

test("Chhath milestones and moonlight midnight use location-local calendar boundaries",()=>{
  assert.match(source,/getIsoDateInTimeZone\(mainDate, timeZone\)/);
  assert.match(source,/zonedDateTimeToUtc\(addIsoCalendarDays\(mainDateKey, offset\), 12, 0, timeZone\)/);
  assert.match(source,/zonedDateTimeToUtc\(nextLocalDate, 0, 0, timeZone\)/);
  assert.doesNotMatch(source,/Date\.UTC\(year, month - 1, day \+ 1\) - 330/);
});

test("Sāmaveda resolver supports explicit timezone without changing its India default",()=>{
  assert.match(source,/getSamavedaUpakarmaDateDecision\(days, timeZone = "Asia\/Kolkata"\)/);
  assert.match(source,/localDateKey\(candidate\.day\.date, timeZone\)/);
});

test("monthly event weekday is derived from its ISO calendar date, not viewer timezone",()=>{
  assert.match(widget,/\["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"\]\[dateObj\.getUTCDay\(\)\]/);
});
