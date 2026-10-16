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
if (!Number.isInteger(firstYear) || !Number.isInteger(lastYear) || lastYear < firstYear || lastYear - firstYear > 10) {
  throw new RangeError("Use a valid year range no wider than 11 years.");
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
  years.push({
    year: result.year,
    latitude: result.latitude,
    longitude: result.longitude,
    elevation: result.elevation,
    monthlyDecisionDays: result.monthlyDecisionDays,
    annualDecisionDays: result.annualDecisionDays,
    candidateDates: result.candidateDates,
    note: result.note
  });
}
const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  location: { name: "Pithoragarh", latitude, longitude, elevation, timezone: "Asia/Kolkata", timezoneOffset },
  calculationEngine: "@ishubhamx/panchangam-js@3.0.0",
  dataStatus: "precomputed-draft-needs-calendar-validation",
  years
};
await mkdir("data", { recursive: true });
await writeFile("data/kalashtami-calculations.json", JSON.stringify(payload, null, 2) + "\n");
console.log(`Wrote precomputed data for ${years.length} years to data/kalashtami-calculations.json`);
