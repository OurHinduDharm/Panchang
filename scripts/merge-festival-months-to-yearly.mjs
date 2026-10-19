#!/usr/bin/env node
/**
 * Read-only-by-default migration helper for monthly festival JSON files.
 * Combines one Gregorian year's YYYY-MM.json files into one year JSON while
 * preserving every event and its existing fields/review state. It never
 * recalculates dates, approves records, or edits the source month files.
 *
 * Usage:
 *   node scripts/merge-festival-months-to-yearly.mjs --year 2026
 *   node scripts/merge-festival-months-to-yearly.mjs --year 2026 --out /tmp/2026.json
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function validYear(value) {
  return /^\d{4}$/.test(String(value || "")) &&
    Number(value) >= 1900 && Number(value) <= 2200;
}

export function combineMonthlyFestivalFiles(inputDir, year) {
  if (!validYear(String(year))) throw new TypeError("year must be a four-digit year from 1900 to 2200");
  const dir = resolve(inputDir);
  const names = readdirSync(dir)
    .filter(name => new RegExp("^" + year + "-(0[1-9]|1[0-2])\\.json$").test(name))
    .sort();

  if (!names.length) throw new Error("No monthly JSON files found for " + year + " in " + dir);

  const events = [];
  const sourceMonths = [];
  const warnings = [];
  let needsReview = false;

  for (const name of names) {
    let monthData;
    try {
      monthData = JSON.parse(readFileSync(join(dir, name), "utf8"));
    } catch (error) {
      throw new Error(name + " is not valid JSON: " + error.message);
    }
    const expectedMonth = Number(name.slice(5, 7));
    if (monthData.year !== Number(year) || monthData.month !== expectedMonth) {
      warnings.push(name + ": top-level year/month does not match filename");
    }
    if (!Array.isArray(monthData.events)) {
      warnings.push(name + ": events is not an array; file skipped");
      continue;
    }
    sourceMonths.push(name);
    if (monthData.status !== "approved") needsReview = true;
    for (const event of monthData.events) {
      if (!event || typeof event !== "object" || Array.isArray(event)) {
        warnings.push(name + ": non-object event skipped");
        continue;
      }
      // Preserve the original record unchanged; provenance is held in a
      // parallel index so the existing event schema and links remain intact.
      events.push({ sourceMonth: name, event });
      if (event.reviewStatus && event.reviewStatus !== "approved") needsReview = true;
      if (!event.reviewStatus) needsReview = true;
    }
  }

  const seen = new Map();
  for (const item of events) {
    const event = item.event;
    const key = String(event.date || "") + "|" + String(event.title || "");
    if (seen.has(key)) {
      warnings.push("Possible duplicate (preserved, not removed): " + key +
        " in " + seen.get(key) + " and " + item.sourceMonth);
    } else {
      seen.set(key, item.sourceMonth);
    }
  }

  return {
    data: {
      schemaVersion: 1,
      year: Number(year),
      status: needsReview ? "needs-review" : "approved",
      sourceMonths,
      eventCount: events.length,
      events: events.map(item => item.event)
    },
    provenance: events.map((item, index) => ({
      index,
      sourceMonth: item.sourceMonth,
      date: item.event.date || null,
      title: item.event.title || ""
    })),
    warnings
  };
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (isDirectRun) {
  const year = option("--year");
  if (!validYear(year)) {
    process.stderr.write("Usage: node scripts/merge-festival-months-to-yearly.mjs --year YYYY [--input data/festivals] [--out FILE]\n");
    process.exitCode = 2;
  } else {
    try {
      const inputDir = option("--input") || "data/festivals";
      const result = combineMonthlyFestivalFiles(inputDir, Number(year));
      const output = JSON.stringify(result.data, null, 2) + "\n";
      const outputPath = option("--out");
      if (outputPath) {
        writeFileSync(resolve(outputPath), output, "utf8");
        process.stdout.write("Wrote " + resolve(outputPath) + "\n");
      } else {
        process.stdout.write(output);
      }
      process.stderr.write("Read " + result.data.sourceMonths.length + " month file(s); preserved " +
        result.data.eventCount + " event record(s). Status: " + result.data.status + ".\n");
      for (const warning of result.warnings) process.stderr.write("WARNING: " + warning + "\n");
      if (result.warnings.some(w => w.includes("is not valid JSON"))) process.exitCode = 1;
    } catch (error) {
      process.stderr.write(error.message + "\n");
      process.exitCode = 1;
    }
  }
}
