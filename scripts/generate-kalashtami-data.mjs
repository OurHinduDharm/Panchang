import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";

const require = createRequire(import.meta.url);
const adapter = require("../kalashtami-panchang-adapter.js");
const latitude = 30.1265;
const longitude = 80.4817;
const elevation = 0;
const timezoneOffset = 330;
const currentYear = Number(new Intl.DateTimeFormat("en", {
  timeZone: "Asia/Kolkata", year: "numeric"
}).format(new Date()));
const firstYear = Number(process.env.KALASHTAMI_FIRST_YEAR || currentYear);
const lastYear = Number(process.env.KALASHTAMI_LAST_YEAR || firstYear + 2);

if (!Number.isInteger(firstYear) || !Number.isInteger(lastYear) ||
    firstYear < 1900 || lastYear > 2200 || lastYear < firstYear ||
    lastYear - firstYear > 10) {
  throw new RangeError("Use a valid year range no wider than 11 years (1900–2200).");
}

const years = [];
for (let year = firstYear; year <= lastYear; year += 1) {
  console.log(`Precomputing Kalashtami dates for ${year} at Pithoragarh…`);
  const result = await adapter.buildKalashtamiDays({
    year, latitude, longitude, elevation, timezoneOffset, getPanchangam, Observer,
    onProgress(progress) {
      if (progress.phase === "year-scan" && progress.processedDays % 70 === 0) {
        console.log(`${year}: scanned ${progress.processedDays}/${progress.totalDays} days`);
      } else if (progress.phase === "tithi-windows") {
        console.log(`${year}: checking tithi windows ${progress.processedCandidates}/${progress.totalCandidates}`);
      }
    }
  });

  // Runtime payload contains only the final decisions needed by the pilot UI.
  // Candidate-level diagnostics belong in tests/logs, not in the downloaded JSON.
  years.push({
    year: result.year,
    monthlyDecisionDays: result.monthlyDecisionDays,
    annualDecisionDays: result.annualDecisionDays
  });
}

const payload = {
  schemaVersion: 2,
  dataStatus: "pilot-location-specific-needs-calendar-validation",
  location: { name: "Pithoragarh", latitude, longitude, elevation, timezone: "Asia/Kolkata", timezoneOffset },
  calculationEngine: "@ishubhamx/panchangam-js@3.0.0",
  years
};

await mkdir("data", { recursive: true });
const output = JSON.stringify(payload) + "\n";
await writeFile("data/kalashtami-calculations.json", output);
console.log(`Wrote compact precomputed data: ${Buffer.byteLength(output)} bytes for ${years.length} years.`);
