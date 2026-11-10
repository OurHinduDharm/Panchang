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

test("every 2030 Pithoragarh Pradosh card has local Trayodashi during Pradosh and its rule", () => {
  const pradoshEvents = events.filter(event => /प्रदोष/.test(event.title || ""));
  assert.ok(pradoshEvents.length >= 24 && pradoshEvents.length <= 26);
  const failures = [];
  for (const event of pradoshEvents) {
    const p = getPanchangam(localNoon(event.date), LOCATION, OPTIONS);
    const next = getPanchangam(localNoon(nextDate(event.date)), LOCATION, OPTIONS);
    const sunset = asDate(p && p.sunset);
    const nextSunrise = asDate(next && next.sunrise);
    if (!sunset || !nextSunrise || nextSunrise <= sunset) {
      failures.push({ date: event.date, reason: "missing sunset/sunrise" });
      continue;
    }
    const pradoshEnd = new Date(sunset.getTime() + (nextSunrise.getTime() - sunset.getTime()) / 5);
    const rows = [...(p.tithis || []), ...(next.tithis || [])];
    const overlaps = rows.some(row => {
      if (![12, 27].includes(Number(row.index))) return false;
      const start = asDate(row.startTime), end = asDate(row.endTime);
      return start && end && end > sunset && start < pradoshEnd;
    });
    if (!overlaps) failures.push({ date: event.date, reason: "Trayodashi does not overlap local Pradosh" });
    if (!ruleIds(event).includes("pradosh-kala")) {
      failures.push({ date: event.date, reason: "pradosh-kala rule missing" });
    }
  }
  assert.deepEqual(failures, []);
});
