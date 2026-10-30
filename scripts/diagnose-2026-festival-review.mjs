#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import panchangPackage from "@ishubhamx/panchangam-js";

const { getPanchangam, Observer } = panchangPackage;
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const TZ = 330;
const DATA_DIR = path.join(process.cwd(), "data", "festivals");

function atLocalNoon(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 6, 30, 0));
}
function iso(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
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
  const start = new Date(interval.startTime).getTime();
  const end = new Date(interval.endTime).getTime();
  return Number.isFinite(start) && Number.isFinite(end) && start <= time && time < end;
}
function tithiAt(intervals, time) {
  const found = intervals.find(item => contains(item, time));
  return found ? { name: tithiName(found), index: tithiIndex(found), start: iso(found.startTime), end: iso(found.endTime) } : null;
}
function dateKey(date) {
  return date.toISOString().slice(0, 10);
}
function shiftDate(value, days) {
  const date = new Date(value + "T12:00:00+05:30");
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
function panchangFor(dateKeyValue) {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  return getPanchangam(atLocalNoon(year, month, day), LOCATION, {
    timezoneOffset: TZ,
    calendarType: "purnimanta"
  });
}

const events = [];
for (let month = 1; month <= 12; month++) {
  const file = path.join(DATA_DIR, `2026-${String(month).padStart(2, "0")}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing month file: ${file}`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const event of data.events || []) {
    if (event.reviewStatus === "needs-review") events.push(event);
  }
}
const uniqueDates = [...new Set(events.map(event => event.date))].sort();
const cache = new Map();
for (const date of uniqueDates) {
  for (const day of [shiftDate(date, -1), date, shiftDate(date, 1)]) {
    if (!cache.has(day)) cache.set(day, panchangFor(day));
  }
}

const report = events.map(event => {
  const p = cache.get(event.date);
  const previous = cache.get(shiftDate(event.date, -1));
  const next = cache.get(shiftDate(event.date, 1));
  const intervals = [
    ...(previous?.tithis || []),
    ...(p?.tithis || []),
    ...(next?.tithis || [])
  ];
  const sunrise = p?.sunrise ? new Date(p.sunrise).getTime() : NaN;
  const sunset = p?.sunset ? new Date(p.sunset).getTime() : NaN;
  const nextSunrise = next?.sunrise ? new Date(next.sunrise).getTime() : NaN;
  const moonrise = p?.moonrise ? new Date(p.moonrise).getTime() : NaN;
  const midday = Number.isFinite(sunrise) && Number.isFinite(sunset) ? sunrise + (sunset - sunrise) / 2 : NaN;
  const aparahna = Number.isFinite(sunrise) && Number.isFinite(sunset) ? sunrise + (sunset - sunrise) * 3 / 5 : NaN;
  const pradosha = Number.isFinite(sunset) && Number.isFinite(nextSunrise) ? sunset + (nextSunrise - sunset) / 5 : NaN;
  const nishita = Number.isFinite(sunset) && Number.isFinite(nextSunrise) ? sunset + (nextSunrise - sunset) / 2 : NaN;
  return {
    date: event.date,
    title: event.title,
    expectedTithi: event.hinduTithi || null,
    reviewStatus: event.reviewStatus,
    sunrise: iso(p?.sunrise),
    sunset: iso(p?.sunset),
    moonrise: iso(p?.moonrise),
    tithiAtSunrise: tithiAt(intervals, sunrise),
    tithiAtMadhyahna: tithiAt(intervals, midday),
    tithiAtAparahna: tithiAt(intervals, aparahna),
    tithiAtPradosha: tithiAt(intervals, pradosha),
    tithiAtNishita: tithiAt(intervals, nishita),
    tithiAtMoonrise: tithiAt(intervals, moonrise),
    tithiIntervals: intervals.map(item => ({
      name: tithiName(item),
      index: tithiIndex(item),
      start: iso(item.startTime),
      end: iso(item.endTime)
    }))
  };
});

console.log("OHD_2026_REMAINING_FESTIVAL_REVIEW_AUDIT=" + JSON.stringify({
  location: { name: "Pithoragarh", latitude: 29.5828, longitude: 80.2182, elevation: 1650 },
  timezoneOffsetMinutes: TZ,
  events: report
}));
if (report.length !== events.length) throw new Error("Review audit lost festival records");
if (report.some(item => !item.sunrise || !item.sunset || !item.tithiIntervals.length)) {
  throw new Error("Pithoragarh Panchang data missing for one or more review dates");
}
