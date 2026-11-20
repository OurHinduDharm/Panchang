import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import tzLookup from "../vendor/tz-lookup-11.8.0.mjs";
import {getIsoDateInTimeZone,getTimeZoneOffsetForLocalDay,zonedDateTimeToUtc} from "../location-timezone.mjs";
const widget=fs.readFileSync(new URL("../monthly-vrat-parv-widget.js",import.meta.url),"utf8");
const muhurta=fs.readFileSync(new URL("../festival-muhurta.js",import.meta.url),"utf8");
const tithi=fs.readFileSync(new URL("../tithi-vyapti.js",import.meta.url),"utf8");
test("timezone lookup covers Pithoragarh and overseas cities",()=>{
 assert.equal(tzLookup(29.5828,80.2182),"Asia/Kolkata");
 assert.equal(tzLookup(51.5072,-0.1276),"Europe/London");
 assert.equal(tzLookup(40.7128,-74.0060),"America/New_York");
});
test("monthly Panchang uses local noon and DST-aware offsets",()=>{
 assert.match(widget,/zonedDateTimeToUtc\(dateIso,12,0,timeZone\)/);
 assert.match(widget,/getTimeZoneOffsetForLocalDay\(instant,timeZone\)/);
 assert.doesNotMatch(widget,/timezoneOffset:330|T06:30:00\.000Z/);
});
test("global search avoids the non-commercial elevation API",()=>{
 assert.doesNotMatch(widget,/countrycodes=in|api\.open-meteo\.com\/v1\/elevation/);
 assert.match(widget,/elevationStatus:"unknown"/);
 assert.match(widget,/tzLookup\(selected\.lat,selected\.lon\)/);
});
test("local muhurta and tithi formatters accept the selected timezone",()=>{
 assert.match(widget,/formatFestivalMuhurtaTime\(windowItem\.start,values\.location\.timeZone\)/);
 assert.match(widget,/formatTithiPoint\(base\.end,dateIso,getLocationTimeZone\(\)\)/);
 assert.match(muhurta,/getFestivalMuhurtaContext\(panchang, nextPanchang, date, location, getFollowingPanchang, timeZone = "Asia\/Kolkata"\)/);
 assert.match(tithi,/formatTithiPoint\(value, eventDate, timeZone = "Asia\/Kolkata"\)/);
});
test("Bhai Dooj date decision accepts the selected timezone",()=>{
 assert.match(muhurta,/getBhaiDoojDateDecision\(previousDay, currentDay, nextDay, timeZone = "Asia\/Kolkata"\)/);
});
test("DST offsets are resolved for the selected local civil day",()=>{
 const london=zonedDateTimeToUtc("2026-03-29",12,0,"Europe/London");
 assert.equal(getTimeZoneOffsetForLocalDay(london,"Europe/London"),60);
 assert.equal(getIsoDateInTimeZone(london,"Europe/London"),"2026-03-29");
 const ny=zonedDateTimeToUtc("2026-03-08",12,0,"America/New_York");
 assert.equal(getTimeZoneOffsetForLocalDay(ny,"America/New_York"),-300);
});
