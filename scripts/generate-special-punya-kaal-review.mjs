#!/usr/bin/env node
/**
 * Generate research-only special punya-kaal candidates for Pithoragarh.
 * Uses the same on-demand month scanner as the browser integration.
 * Nothing produced here is auto-approved for public religious guidance.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";
import { calculateSpecialPunyaKaalMonth } from "../special-punya-kaal-runtime.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
import { parseVaruniReviewYears, buildVaruniReviewCards } from "./varuni-annual-review-cards.mjs";
const args = process.argv.slice(2);
const YEARS = parseVaruniReviewYears(args);
const explicitYear = args.length > 0;
const OUT = path.join(ROOT, "data/reviews", explicitYear
  ? "special-punya-kaal-" + YEARS[0] + "-candidates.json"
  : "special-punya-kaal-2026-2030-candidates.json");
const LOCATION = new Observer(29.5828, 80.2182, 1650);

const monthlyScans = [];
const candidates = [];
const mahodayaCandidates = [];
const diagnostics = [];
let panchangCalls = 0;
let scannedDays = 0;

for (const year of YEARS) {
  for (let month = 1; month <= 12; month += 1) {
    const result = await calculateSpecialPunyaKaalMonth({
      year,
      month,
      observer: LOCATION,
      getPanchangam,
      timezoneOffsetMinutes: 330,
      calendarType: "purnimanta"
    });
    monthlyScans.push({
      year,
      month,
      panchangCalls: result.panchangCalls,
      scannedDays: result.scannedDays,
      diagnostics: result.diagnostics.length
    });
    panchangCalls += result.panchangCalls;
    scannedDays += result.scannedDays;
    diagnostics.push(...result.diagnostics.map(item => ({ year, month, ...item })));
    candidates.push(...result.candidates.filter(item =>
      item.labels?.[0] === "वारुणी योग" ||
      item.labels?.[0] === "महावारुणी योग" ||
      item.labels?.[0] === "महामहावारुणी योग"
    ));
    mahodayaCandidates.push(...result.candidates.filter(item =>
      item.labels?.[0] === "महोदय योग"
    ));
  }
}

const output = {
  status: "research-only-not-approved",
  generatedAt: new Date().toISOString(),
  engine: "@ishubhamx/panchangam-js@3.0.0",
  calculation: "special-punya-kaal-runtime.mjs",
  calendarType: "purnimanta",
  observer: {
    name: "Pithoragarh",
    latitude: 29.5828,
    longitude: 80.2182,
    elevation: 1650,
    timezone: "Asia/Kolkata",
    timezoneOffsetMinutes: 330
  },
  years: YEARS,
  scanMode: "on-demand-monthly",
  monthlyScans,
  panchangCalls,
  scannedDays,
  diagnostics,
  candidateCount: candidates.length,
  candidates,
  monthlyFestivalReviewCards: buildVaruniReviewCards(candidates, YEARS, diagnostics),
  mahodayaCandidateCount: mahodayaCandidates.length,
  mahodayaCandidates
};

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({
  status: output.status,
  years: output.years,
  scanMode: output.scanMode,
  monthlyScans: output.monthlyScans.length,
  panchangCalls: output.panchangCalls,
  scannedDays: output.scannedDays,
  diagnostics: output.diagnostics,
  candidateCount: output.candidateCount,
  candidates: output.candidates,
  mahodayaCandidateCount: output.mahodayaCandidateCount,
  mahodayaCandidates: output.mahodayaCandidates
}, null, 2));
