import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pairDrikEventRows, parseDrikBoundary, summarizeSourceCaptures } from "./annual-tara-source-normalizer.mjs";

const CITY = "Pithoragarh, Uttarakhand, India";
const CITY_ID = "1259503";
const TARGETS = [
  { planet: "Jupiter", slug: "guru", names: /Jupiter|Guru/i },
  { planet: "Venus", slug: "shukra", names: /Venus|Shukra/i }
];

function yearRange() {
  const currentYear = new Date().getUTCFullYear();
  const start = Number(process.env.START_YEAR || currentYear);
  const end = Number(process.env.END_YEAR || currentYear + 2);
  if (!Number.isInteger(start) || !Number.isInteger(end) ||
      start < 2000 || end > 2100 || end < start || end - start > 5) {
    throw new Error("Use a valid year range from 2000–2100, maximum six years.");
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

const years = yearRange();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  locale: "en-IN",
  timezoneId: "Asia/Kolkata"
});
page.setDefaultNavigationTimeout(25000);
const captures = [];

try {
  for (const target of TARGETS) {
    for (const year of years) {
      const url = new URL(
        `https://www.drikpanchang.com/planet/asta/${target.slug}-asta-date-time.html`
      );
      url.searchParams.set("geoname-id", CITY_ID);
      url.searchParams.set("year", String(year));
      url.searchParams.set("time-format", "24plushour");
      url.searchParams.set("lang", "en");

      const capture = {
        planet: target.planet,
        requestedYear: year,
        city: CITY,
        cityId: CITY_ID,
        requestedUrl: url.toString(),
        retrievedAt: new Date().toISOString(),
        httpStatus: null,
        pageTitle: null,
        renderedYear: null,
        cityConfirmed: false,
        planetConfirmed: false,
        requestedYearConfirmed: false,
        rawEventRows: [],
        windows: [],
        unpairedRows: [],
        status: "not-attempted",
        productionEligible: false,
        error: null
      };

      try {
        const response = await page.goto(url.toString(), {
          waitUntil: "domcontentloaded",
          timeout: 25000
        });
        capture.httpStatus = response?.status() ?? null;
        await page.waitForTimeout(450);
        capture.pageTitle = await page.title();
        const yearMatch = capture.pageTitle.match(/^(20\d{2})\b/);
        capture.renderedYear = yearMatch ? Number(yearMatch[1]) : null;
        const body = await page.locator("body").innerText({ timeout: 15000 });
        const lines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        capture.cityConfirmed = /Pithoragarh/i.test(body);
        capture.planetConfirmed = target.names.test(body);
        capture.requestedYearConfirmed = capture.renderedYear === year;

        for (let index = 0; index < lines.length; index++) {
          const label = lines[index];
          const eventMatch = label.match(/Tara Asta (Starts|Ends) On/i);
          if (!eventMatch) continue;
          const rawValue = lines[index + 1] || "";
          capture.rawEventRows.push({
            event: eventMatch[1].toLowerCase() === "starts" ? "astaStart" : "astaEnd",
            rawLabel: label,
            rawValue,
            boundary: parseDrikBoundary(rawValue)
          });
        }

        const paired = pairDrikEventRows(capture.rawEventRows);
        capture.windows = paired.windows;
        capture.unpairedRows = paired.unpaired;

        const identityVerified =
          capture.httpStatus >= 200 && capture.httpStatus < 400 &&
          capture.cityConfirmed && capture.planetConfirmed &&
          capture.requestedYearConfirmed;
        if (!identityVerified) {
          capture.status = "quarantined-city-planet-or-year-mismatch";
        } else if (!capture.windows.length || capture.unpairedRows.length) {
          capture.status = "quarantined-incomplete-or-unparsed-event-boundaries";
        } else {
          capture.status = "source-page-identity-and-boundaries-captured";
        }
      } catch (error) {
        capture.status = "navigation-or-extraction-failed";
        capture.error = String(error?.message || error);
      }
      captures.push(capture);
    }
  }

  const summary = {
    title: "Internal Guru-Shukra annual source capture — Pithoragarh",
    capturedAt: new Date().toISOString(),
    requestedYears: years,
    city: CITY,
    policy: "Candidate capture only. Every page must confirm its requested city, planet and year. Raw source text is retained. Incomplete, mismatched or unparsed records are quarantined. This workflow never edits or publishes production data.",
    ...summarizeSourceCaptures(captures),
    captures
  };
  const outputPath = resolve(process.env.OUTPUT_PATH || "artifacts/guru-shukra-source-candidates.json");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify({
    outputPath,
    attemptedPages: summary.attemptedPages,
    identityAndBoundaryVerifiedPages: summary.identityAndBoundaryVerifiedPages,
    quarantinedPages: summary.quarantinedPages,
    verifiedCandidateWindows: summary.verifiedCandidateWindows,
    quarantinedCandidateWindows: summary.quarantinedCandidateWindows,
    totalCandidateWindows: summary.totalCandidateWindows
  }, null, 2));
} finally {
  await browser.close();
}
