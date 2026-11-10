import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const OPTIONS = { timezoneOffset: 330, calendarType: "purnimanta" };
const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) =>
  JSON.parse(readFileSync(join(folder, "2030-" + String(i + 1).padStart(2, "0") + ".json"), "utf8"))
);
const events = months.flatMap(month => month.events || []);
const asDate = value => {
  const result = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(result.getTime()) ? result : null;
};
const localNoon = iso => new Date(iso + "T06:30:00.000Z");
const nextDate = iso => {
  const d = new Date(iso + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
const ruleIds = event => Array.isArray(event.muhurtaRules)
  ? event.muhurtaRules : (event.muhurtaRule ? [event.muhurtaRule] : []);

test("every 2030 Pithoragarh Shivaratri card has Krishna Chaturdashi during local Nishita", () => {
  const shivaratriEvents = events.filter(event => /शिवरात्रि/.test(event.title || ""));
  assert.ok(shivaratriEvents.length >= 12 && shivaratriEvents.length <= 13);
  const failures = [];
  for (const event of shivaratriEvents) {
    const p = getPanchangam(localNoon(event.date), LOCATION, OPTIONS);
    const next = getPanchangam(localNoon(nextDate(event.date)), LOCATION, OPTIONS);
    const sunset = asDate(p && p.sunset);
    const nextSunrise = asDate(next && next.sunrise);
    if (!sunset || !nextSunrise || nextSunrise <= sunset) {
      failures.push({ date: event.date, reason: "missing sunset/sunrise" });
      continue;
    }
    const night = nextSunrise.getTime() - sunset.getTime();
    const nishitaStart = new Date(sunset.getTime() + night * 7 / 15);
    const nishitaEnd = new Date(sunset.getTime() + night * 8 / 15);
    const rows = [...(p.tithis || []), ...(next.tithis || [])];
    const overlaps = rows.some(row => {
      if (Number(row.index) !== 28) return false;
      const start = asDate(row.startTime), end = asDate(row.endTime);
      return start && end && end > nishitaStart && start < nishitaEnd;
    });
    if (!overlaps) failures.push({ date: event.date, reason: "Krishna Chaturdashi does not overlap Nishita" });
    if (!ruleIds(event).some(rule => ["masik-shivaratri-nishita", "mahashivaratri-nishita"].includes(rule))) {
      failures.push({ date: event.date, reason: "Nishita rule missing" });
    }
    if (/महाशिवरात्रि/.test(event.title || "") &&
        !ruleIds(event).includes("mahashivaratri-four-prahar")) {
      failures.push({ date: event.date, reason: "Mahashivaratri four-prahar rule missing" });
    }
  }
  assert.deepEqual(failures, []);
});
