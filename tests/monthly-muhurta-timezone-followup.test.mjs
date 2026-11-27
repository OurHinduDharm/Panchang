import test from "node:test";
import assert from "node:assert/strict";
import {
  formatFestivalMuhurtaTime,
  formatFestivalMuhurtaInterval,
  getFestivalMuhurta,
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
  assert.match(source,/localIsoDate\(mainDate, timeZone\)/);
  assert.match(source,/localDateTimeToUtc\(addLocalIsoDays\(mainDateKey, offset\), 12, 0, timeZone\)/);
  assert.match(source,/localDateTimeToUtc\(nextLocalDate, 0, 0, timeZone\)/);
  assert.doesNotMatch(source,/Date\.UTC\(year, month - 1, day \+ 1\) - 330/);
});

test("Sāmaveda resolver supports explicit timezone without changing its India default",()=>{
  assert.match(source,/getSamavedaUpakarmaDateDecision\(days, timeZone = "Asia\/Kolkata"\)/);
  assert.match(source,/localDateKey\(candidate\.day\.date, timeZone\)/);
});

test("monthly event weekday is derived from its ISO calendar date, not viewer timezone",()=>{
  assert.match(widget,/\["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"\]\[dateObj\.getUTCDay\(\)\]/);
});

test("Chhath and moonlight boundaries follow the selected overseas local calendar",()=>{
  const timeZone="America/New_York";
  const mainDate=new Date("2026-11-15T17:00:00.000Z");
  const chhath=getFestivalMuhurta({muhurtaRule:"chhath-arghya"},{date:mainDate,timeZone,
    sunset:new Date("2026-11-15T21:00:00.000Z"),
    nextSunrise:new Date("2026-11-16T11:30:00.000Z")});
  const dateKey=value=>new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit"}).format(value);
  assert.deepEqual(chhath.milestones.map(item=>dateKey(item.date)),["2026-11-13","2026-11-14"]);
  const moonlight=getFestivalMuhurta({muhurtaRule:"moonlight-until-midnight"},{date:mainDate,
    moonrise:new Date("2026-11-15T22:00:00.000Z"),timeZone});
  assert.equal(moonlight.end.toISOString(),"2026-11-16T05:00:00.000Z");
});

test("parana labels both local dates only when the interval crosses midnight",()=>{
  const start=new Date("2026-11-21T07:28:00Z"),end=new Date("2026-11-21T23:26:00Z");
  const result={start,end,dateLabel:"21 नवंबर 2026"};
  const ist=formatFestivalMuhurtaInterval(result,"Asia/Kolkata");
  assert.match(ist,/21 नवंबर 2026 .*12:58.*22 नवंबर 2026 .*04:56/);
  const london=formatFestivalMuhurtaInterval(result,"Europe/London");
  assert.equal(london,result.dateLabel+" · "+formatFestivalMuhurtaTime(start,"Europe/London")+" – "+formatFestivalMuhurtaTime(end,"Europe/London"));
});
