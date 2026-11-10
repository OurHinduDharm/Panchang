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
const ruleIds = event => Array.isArray(event.muhurtaRules)
  ? event.muhurtaRules : (event.muhurtaRule ? [event.muhurtaRule] : []);

test("all 2030 Pithoragarh Sankashti cards have Krishna Chaturthi at local moonrise", () => {
  const sankashtiEvents = events.filter(event => /संकष्टी/.test(event.title || ""));
  assert.equal(sankashtiEvents.length, 12);
  const failures = [];
  for (const event of sankashtiEvents) {
    const p = getPanchangam(localNoon(event.date), LOCATION, OPTIONS);
    const moonrise = asDate(p && p.moonrise);
    const rows = Array.isArray(p && p.tithis) ? p.tithis : [];
    const overlaps = rows.some(row => {
      if (Number(row.index) !== 18) return false;
      const start = asDate(row.startTime), end = asDate(row.endTime);
      return start && end && moonrise && start <= moonrise && end > moonrise;
    });
    if (!moonrise) failures.push({ date: event.date, reason: "missing moonrise" });
    else if (!overlaps) failures.push({ date: event.date, reason: "Krishna Chaturthi absent at moonrise" });
    if (!ruleIds(event).some(rule => ["sankashti-chaturthi-moonrise", "karwa-chauth-puja"].includes(rule))) {
      failures.push({ date: event.date, reason: "moonrise/puja rule missing" });
    }
  }
  assert.deepEqual(failures, []);
});
