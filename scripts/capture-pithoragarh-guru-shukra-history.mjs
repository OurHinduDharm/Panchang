import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pairDrikEventRows, parseDrikBoundary, summarizeSourceCaptures } from "./annual-tara-source-normalizer.mjs";

// Pithoragarh-only historical supplement. These rows are kept separate from
// the 2021-2025 calibration until the source audit and duplicate checks pass.
const CITY = { name: "Pithoragarh", state: "Uttarakhand", id: "1259503" };
const TARGETS = [
  { planet: "Jupiter", slug: "guru", names: /Jupiter|Guru/i },
  { planet: "Venus", slug: "shukra", names: /Venus|Shukra/i }
];
const YEARS = [2016, 2017, 2018, 2019, 2020];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  locale: "en-IN",
  timezoneId: "Asia/Kolkata"
});
page.setDefaultNavigationTimeout(30000);
const captures = [];

try {
  for (const target of TARGETS) {
    for (const year of YEARS) {
      const url = new URL(
        `https://www.drikpanchang.com/planet/asta/${target.slug}-asta-date-time.html`
      );
      url.searchParams.set("geoname-id", CITY.id);
      url.searchParams.set("year", String(year));
      url.searchParams.set("time-format", "24plushour");
      url.searchParams.set("lang", "en");

      const capture = {
        planet: target.planet,
        requestedYear: year,
        city: `${CITY.name}, ${CITY.state}, India`,
        cityId: CITY.id,
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
        capture.cityConfirmed = identityText.toLowerCase().includes(CITY.name.toLowerCase());
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

  const summary = {
    title: "Internal Pithoragarh Guru-Shukra historical source capture",
    capturedAt: new Date().toISOString(),
    requestedYears: YEARS,
    cities: [{
      name: CITY.name,
      state: CITY.state,
      country: "India",
      geonameId: CITY.id
    }],
    planets: TARGETS.map(target => target.planet),
    policy: "Pithoragarh-only 2016-2020 historical supplement. Each Drik page must confirm the requested city, planet and year. Raw printed text and source URLs are retained; incomplete or mismatched pages are quarantined. Do not merge these rows into calibration until source identity, normalization, duplicates and event definitions are reviewed. This artifact never edits production data.",
    ...summarizeSourceCaptures(captures),
    captures
  };
  const outputPath = resolve(
    process.env.OUTPUT_PATH || "artifacts/pithoragarh-guru-shukra-history-2016-2020.json"
  );
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
