#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import panchangPackage from "@ishubhamx/panchangam-js";

const { getPanchangam, Observer } = panchangPackage;
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const OPTIONS = { timezoneOffset: 330, calendarType: "purnimanta" };
const DATA_DIR = path.join(process.cwd(), "data", "festivals");

function atLocalNoon(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 6, 30, 0));
}
function shiftDate(isoDate, days) {
  const date = atLocalNoon(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function asDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
function iso(value) {
  const date = asDate(value);
  return date ? date.toISOString() : null;
}
function tithiName(value) {
  if (value && typeof value === "object") return value.name ?? value.label ?? value.value ?? String(value.index ?? "");
  return value == null ? null : String(value);
}
function tithiIndex(value) {
  if (value && typeof value === "object") return value.index ?? value.number ?? value.value ?? null;
  return null;
}
function contains(interval, time) {
  const start = asDate(interval.startTime);
  const end = asDate(interval.endTime);
  return !!start && !!end && start.getTime() <= time && time < end.getTime();
}
function tithiAt(intervals, time) {
  if (!Number.isFinite(time)) return null;
  const found = intervals.find(item => contains(item, time));
  return found ? {
    name: tithiName(found),
    index: tithiIndex(found),
    start: iso(found.startTime),
    end: iso(found.endTime)
  } : null;
}
function panchangFor(date) {
  return getPanchangam(atLocalNoon(date), LOCATION, OPTIONS);
}

const events = [];
for (let month = 1; month <= 12; month++) {
  const file = path.join(DATA_DIR, `2028-${String(month).padStart(2, "0")}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing month file: ${file}`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const event of data.events || []) events.push(event);
}
events.sort((a, b) => a.date.localeCompare(b.date) || (a.title || "").localeCompare(b.title || ""));
const dates = [...new Set(events.map(event => event.date))];
const cache = new Map();
for (const date of dates) {
  for (const day of [shiftDate(date, -1), date, shiftDate(date, 1)]) {
    if (!cache.has(day)) cache.set(day, panchangFor(day));
  }
}
const report = events.map(event => {
  const previous = cache.get(shiftDate(event.date, -1));
  const current = cache.get(event.date);
  const next = cache.get(shiftDate(event.date, 1));
  const intervals = [...(previous?.tithis || []), ...(current?.tithis || []), ...(next?.tithis || [])];
  const sunrise = asDate(current?.sunrise)?.getTime() ?? NaN;
  const sunset = asDate(current?.sunset)?.getTime() ?? NaN;
  const nextSunrise = asDate(next?.sunrise)?.getTime() ?? NaN;
  const moonrise = asDate(current?.moonrise)?.getTime() ?? NaN;
  const midday = Number.isFinite(sunrise) && Number.isFinite(sunset) ? sunrise + (sunset - sunrise) / 2 : NaN;
  const aparahna = Number.isFinite(sunrise) && Number.isFinite(sunset) ? sunrise + (sunset - sunrise) * 3 / 5 : NaN;
  const pradosha = Number.isFinite(sunset) && Number.isFinite(nextSunrise) ? sunset + (nextSunrise - sunset) / 5 : NaN;
  const nishita = Number.isFinite(sunset) && Number.isFinite(nextSunrise) ? sunset + (nextSunrise - sunset) / 2 : NaN;
  return {
    date: event.date,
    title: event.title,
    expectedTithi: event.hinduTithi || null,
    rules: event.muhurtaRules || (event.muhurtaRule ? [event.muhurtaRule] : []),
    sunrise: iso(current?.sunrise),
    sunset: iso(current?.sunset),
    moonrise: iso(current?.moonrise),
    tithiAtSunrise: tithiAt(intervals, sunrise),
    tithiAtMadhyahna: tithiAt(intervals, midday),
    tithiAtAparahna: tithiAt(intervals, aparahna),
    tithiAtPradosha: tithiAt(intervals, pradosha),
    tithiAtNishita: tithiAt(intervals, nishita),
    tithiAtMoonrise: tithiAt(intervals, moonrise)
  };
});
const chandraDarshan = report.find(row => row.date === "2028-07-23" && row.title === "चन्द्र दर्शन");
if (!chandraDarshan || chandraDarshan.expectedTithi !== "श्रावण शुक्ल द्वितीया" || chandraDarshan.tithiAtMoonrise?.index !== 1) {
  throw new Error("2028 Chandra Darshan must remain on 23 July with local Shukla Dwitiya at moonrise");
}
if (!report.length) throw new Error("No 2028 festival events found for Pithoragarh audit");
const missing = report.filter(row => !row.sunrise || !row.sunset || !row.tithiAtSunrise);
console.log("OHD_2028_PITHORAGARH_FESTIVAL_DATE_AUDIT=" + JSON.stringify({
  location: { name: "Pithoragarh", latitude: 29.5828, longitude: 80.2182, elevation: 1650 },
  timezoneOffsetMinutes: 330,
  eventCount: report.length,
  missingPanchangCount: missing.length,
  events: report
}));
if (missing.length) throw new Error("Pithoragarh Panchang data missing for one or more 2028 festival dates");
