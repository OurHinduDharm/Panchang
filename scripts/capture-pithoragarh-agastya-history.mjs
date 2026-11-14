import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CITY = "Pithoragarh";
const CITY_ID = "1259503";
const YEARS = [2024, 2025, 2026, 2027];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  locale: "hi-IN",
  timezoneId: "Asia/Kolkata"
});
page.setDefaultNavigationTimeout(30000);
const captures = [];

try {
  for (const year of YEARS) {
    const url = new URL(
      "https://www.drikpanchang.com/rituals/agastya-arghya/agastya-arghya-date-time.html"
    );
    url.searchParams.set("geoname-id", CITY_ID);
    url.searchParams.set("year", String(year));
    url.searchParams.set("time-format", "24plushour");
    url.searchParams.set("lang", "hi");

    const capture = {
      requestedYear: year,
      city: "Pithoragarh, Uttarakhand, India",
      cityId: CITY_ID,
      requestedUrl: url.toString(),
      retrievedAt: new Date().toISOString(),
      httpStatus: null,
      pageTitle: null,
      renderedYear: null,
      cityConfirmed: false,
      eventConfirmed: false,
      requestedYearConfirmed: false,
      rawBodyText: null,
      rawLines: [],
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
      await page.waitForTimeout(500);
      capture.pageTitle = await page.title();
      const yearMatch = capture.pageTitle.match(/^(20\d{2})\b/);
      capture.renderedYear = yearMatch ? Number(yearMatch[1]) : null;
      capture.rawBodyText = await page.locator("body").innerText({ timeout: 15000 });
      capture.rawLines = capture.rawBodyText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
      const identityText = `${capture.pageTitle}\n${capture.rawBodyText}`;
      capture.cityConfirmed = identityText.toLowerCase().includes(CITY.toLowerCase());
      capture.eventConfirmed = /Agastya|अगस्त्य/i.test(identityText);
      capture.requestedYearConfirmed = capture.renderedYear === year;

      if (
        capture.httpStatus >= 200 && capture.httpStatus < 400 &&
        capture.cityConfirmed && capture.eventConfirmed &&
        capture.requestedYearConfirmed
      ) {
        capture.status = "raw-source-page-captured-identity-verified";
      } else {
        capture.status = "quarantined-city-event-or-year-mismatch";
      }
    } catch (error) {
      capture.status = "navigation-or-extraction-failed";
      capture.error = String(error?.message || error);
    }
    captures.push(capture);
  }

  const summary = {
    title: "Internal Pithoragarh Agastya Arghya historical source recovery",
    capturedAt: new Date().toISOString(),
    city: "Pithoragarh, Uttarakhand, India",
    cityId: CITY_ID,
    requestedYears: YEARS,
    eventDefinition: "traditional-agastya-arghya",
    policy: "Raw page evidence only. Page identity must confirm Pithoragarh, Agastya and requested year. Raw text is retained without inferring or changing production values. Every captured page requires manual event-field review and provenance approval.",
    attemptedPages: captures.length,
    identityVerifiedPages: captures.filter(row =>
      row.status === "raw-source-page-captured-identity-verified"
    ).length,
    quarantinedPages: captures.filter(row =>
      row.status !== "raw-source-page-captured-identity-verified"
    ).length,
    productionEligible: false,
    captures
  };
  const outputPath = resolve(
    process.env.OUTPUT_PATH || "artifacts/pithoragarh-agastya-2024-2027-source-recovery.json"
  );
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify({
    outputPath,
    attemptedPages: summary.attemptedPages,
    identityVerifiedPages: summary.identityVerifiedPages,
    quarantinedPages: summary.quarantinedPages,
    productionEligible: summary.productionEligible
  }, null, 2));
} finally {
  await browser.close();
}
