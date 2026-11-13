import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CITY = "Pithoragarh, Uttarakhand, India";
const CITY_ID = "1259503";
const YEARS = [2028, 2029, 2030];
const BASE_URL = "https://www.drikpanchang.com/rituals/agastya-arghya/agastya-arghya-date-time.html";

function extractRelevantLines(body) {
  const pattern = /अगस्त्य|Agastya|अर्घ्य|Arghya|तारा उदय|तारा अस्त|Canopus/i;
  return body.split(/\r?\n/).map(line => line.trim()).filter(line => line && pattern.test(line));
}

const browser = await chromium.launch({ headless: true });
try {
  const captures = [];
  for (const year of YEARS) {
    const page = await browser.newPage({ locale: "hi-IN", timezoneId: "Asia/Kolkata" });
    const url = new URL(BASE_URL);
    url.searchParams.set("geoname-id", CITY_ID);
    url.searchParams.set("year", String(year));
    url.searchParams.set("time-format", "24plushour");
    url.searchParams.set("lang", "hi");
    const capture = {
      requestedYear: year,
      city: CITY,
      cityId: CITY_ID,
      requestedUrl: url.toString(),
      retrievedAt: new Date().toISOString(),
      httpStatus: null,
      pageTitle: null,
      cityConfirmed: false,
      eventConfirmed: false,
      requestedYearConfirmed: false,
      relevantRawLines: [],
      rawBodyText: "",
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
      await page.waitForTimeout(700);
      capture.pageTitle = await page.title();
      capture.rawBodyText = await page.locator("body").innerText({ timeout: 20000 });
      const identityText = capture.pageTitle + "\n" + capture.rawBodyText;
      capture.cityConfirmed = /Pithoragarh/i.test(identityText);
      capture.eventConfirmed = /अगस्त्य|Agastya|Canopus/i.test(identityText);
      capture.requestedYearConfirmed = new RegExp("(^|\\D)" + year + "(\\D|$)").test(identityText);
      capture.relevantRawLines = extractRelevantLines(capture.rawBodyText);
      const hasArghyaTime = capture.relevantRawLines.some(line => /अर्घ्य समय|Arghya.*time/i.test(line));
      const hasRise = capture.relevantRawLines.some(line => /तारा उदय|Tara.*rise/i.test(line));
      const hasSet = capture.relevantRawLines.some(line => /तारा अस्त|Tara.*set/i.test(line));
      const identityVerified = capture.httpStatus >= 200 && capture.httpStatus < 400 &&
        capture.cityConfirmed && capture.eventConfirmed && capture.requestedYearConfirmed;
      if (!identityVerified) {
        capture.status = "quarantined-city-event-or-year-mismatch";
      } else if (!hasArghyaTime || !hasRise || !hasSet) {
        capture.status = "quarantined-incomplete-event-fields";
      } else {
        capture.status = "source-page-identity-and-arghya-fields-captured";
      }
    } catch (error) {
      capture.status = "navigation-or-extraction-failed";
      capture.error = String(error?.message || error);
    }
    captures.push(capture);
    await page.close();
  }

  const verifiedPages = captures.filter(c => c.status === "source-page-identity-and-arghya-fields-captured");
  const quarantinedPages = captures.filter(c => c.status !== "source-page-identity-and-arghya-fields-captured");
  const output = {
    title: "Internal traditional Agastya Arghya source capture — Pithoragarh",
    capturedAt: new Date().toISOString(),
    requestedYears: YEARS,
    city: CITY,
    policy: "Raw source capture only. Traditional Agastya Arghya fields are kept separate from modern heliacal visibility. No candidate is published automatically.",
    attemptedPages: captures.length,
    verifiedForReviewPages: verifiedPages.length,
    quarantinedPages: quarantinedPages.length,
    productionEligiblePages: 0,
    captures
  };
  const outputPath = resolve(process.env.OUTPUT_PATH || "artifacts/agastya-arghya-source-candidates-2028-2030.json");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
  console.log(JSON.stringify({
    outputPath,
    attemptedPages: output.attemptedPages,
    verifiedForReviewPages: output.verifiedForReviewPages,
    quarantinedPages: output.quarantinedPages,
    productionEligiblePages: output.productionEligiblePages
  }, null, 2));
} finally {
  await browser.close();
}
