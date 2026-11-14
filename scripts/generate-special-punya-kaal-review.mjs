#!/usr/bin/env node
/**
 * Generate research-only special punya-kaal candidates for Pithoragarh.
 * Nothing produced here is auto-approved for public religious guidance.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";
import { buildVaruniCandidates } from "../special-punya-kaal.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data/reviews/special-punya-kaal-2026-2030-candidates.json");
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const OPTIONS = { timezoneOffset: 330, calendarType: "purnimanta" };
const YEARS = [2026, 2027, 2028, 2029, 2030];

function dateAtISTNoon(isoDate) {
  return new Date(isoDate + "T12:00:00+05:30");
}
function addDays(isoDate, amount) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + amount));
  return date.toISOString().slice(0, 10);
}
function iso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function monthName(value) {
  if (value && typeof value === "object") return String(value.name ?? value.value ?? "");
  return String(value ?? "");
}
function intervals(items) {
  return Array.isArray(items) ? items.map(item => ({
    index: Number(item?.index),
    name: item?.name ?? null,
    paksha: item?.paksha ?? null,
    startTime: iso(item?.startTime),
    endTime: iso(item?.endTime)
  })).filter(item => Number.isInteger(item.index) && item.startTime && item.endTime) : [];
}
function panchang(date) {
  return getPanchangam(dateAtISTNoon(date), LOCATION, OPTIONS);
}

const days = [];
const diagnostics = [];
let calls = 0;
for (const year of YEARS) {
  const start = `${year}-01-01`;
  const end = `${year + 1}-01-01`;
  for (let date = start; date < end; date = addDays(date, 1)) {
    const current = panchang(date);
    calls += 1;
    const record = {
      date,
      masa: monthName(current.masa ?? current.month),
      paksha: current.paksha,
      sunrise: iso(current.sunrise),
      tithis: intervals(current.tithis),
      nakshatras: intervals(current.nakshatras),
      yogas: intervals(current.yogas)
    };
    if (!record.sunrise || !record.tithis.length || !record.nakshatras.length || !record.yogas.length) {
      diagnostics.push({ date, missing: [
        !record.sunrise ? "sunrise" : null,
        !record.tithis.length ? "tithis" : null,
        !record.nakshatras.length ? "nakshatras" : null,
        !record.yogas.length ? "yogas" : null
      ].filter(Boolean) });
    }
    days.push(record);
  }
}
const candidates = buildVaruniCandidates(days);
const output = {
  status: "research-only-not-approved",
  generatedAt: new Date().toISOString(),
  engine: "@ishubhamx/panchangam-js@3.0.0",
  calendarType: "purnimanta",
  observer: { name: "Pithoragarh", latitude: 29.5828, longitude: 80.2182, elevation: 1650, timezone: "Asia/Kolkata", timezoneOffsetMinutes: 330 },
  years: YEARS,
  panchangCalls: calls,
  dayCount: days.length,
  diagnostics,
  candidateCount: candidates.length,
  candidates
};
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({
  status: output.status,
  years: output.years,
  panchangCalls: output.panchangCalls,
  dayCount: output.dayCount,
  diagnostics: output.diagnostics,
  candidateCount: output.candidateCount,
  candidates: output.candidates
}, null, 2));
