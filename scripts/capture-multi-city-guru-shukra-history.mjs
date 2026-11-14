import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pairDrikEventRows, parseDrikBoundary, summarizeSourceCaptures } from "./annual-tara-source-normalizer.mjs";

// Pithoragarh 2021–2025 is already captured separately. This pass fills
// the 2021–2023 history gap for the other four named cities only.
const CITIES = [
  { name: "New Delhi", state: "Delhi", id: "1261481" },
  { name: "Mumbai", state: "Maharashtra", id: "1275339" },
  { name: "Ujjain", state: "Madhya Pradesh", id: "1253914" },
  { name: "Varanasi", state: "Uttar Pradesh", id: "1253405" }
];
const TARGETS = [
  { planet: "Jupiter", slug: "guru", names: /Jupiter|Guru/i },
  { planet: "Venus", slug: "shukra", names: /Venus|Shukra/i }
];
const YEARS = [2021, 2022, 2023];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  locale: "en-IN",
  timezoneId: "Asia/Kolkata"
});
page.setDefaultNavigationTimeout(30000);
const captures = [];

try {
  for (const city of CITIES) {
    for (const target of TARGETS) {
      for (const year of YEARS) {
        const url = new URL(
          `https://www.drikpanchang.com/planet/asta/${target.slug}-asta-date-time.html`
        );
        url.searchParams.set("geoname-id", city.id);
        url.searchParams.set("year", String(year));
        url.searchParams.set("time-format", "24plushour");
        url.searchParams.set("lang", "en");

        const capture = {
          planet: target.planet,
          requestedYear: year,
          city: `${city.name}, ${city.state}, India`,
          cityId: city.id,
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
            timeout: 30000
          });
          capture.httpStatus = response?.status() ?? null;
          await page.waitForTimeout(450);
          capture.pageTitle = await page.title();
          const yearMatch = capture.pageTitle.match(/^(20\d{2})\b/);
          capture.renderedYear = yearMatch ? Number(yearMatch[1]) : null;
          const body = await page.locator("body").innerText({ timeout: 15000 });
          const lines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
          const identityText = `${capture.pageTitle}\n${body}`;
          capture.cityConfirmed = identityText.toLowerCase().includes(city.name.toLowerCase());
          capture.planetConfirmed = target.names.test(identityText);
          capture.requestedYearConfirmed = capture.renderedYear === year;

          for (let index = 0; index < lines.length; index++) {
            const eventMatch = lines[index].match(/Tara Asta (Starts|Ends) On/i);
            if (!eventMatch) continue;
            const rawValue = lines[index + 1] || "";
            capture.rawEventRows.push({
              event: eventMatch[1].toLowerCase() === "starts" ? "astaStart" : "astaEnd",
              rawLabel: lines[index],
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
  }

  const summary = {
    title: "Internal multi-city Guru-Shukra historical source capture",
    capturedAt: new Date().toISOString(),
    requestedYears: YEARS,
    cities: CITIES.map(city => ({
      name: city.name,
      state: city.state,
      country: "India",
      geonameId: city.id
    })),
    planets: TARGETS.map(target => target.planet),
    policy: "2021–2023 history-gap capture for New Delhi, Mumbai, Ujjain and Varanasi. Pithoragarh is handled by its separate 2021–2025 capture. Every page must confirm requested city, planet and year. Raw printed text is retained; mismatches and incomplete rows are quarantined. This artifact never edits production data.",
    ...summarizeSourceCaptures(captures),
    captures
  };
  const outputPath = resolve(process.env.OUTPUT_PATH || "artifacts/multi-city-guru-shukra-2021-2023.json");
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
