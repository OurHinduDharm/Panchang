import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  page.on("console", message => {
    if (message.type() === "error") process.stderr.write("[browser] " + message.text() + "\n");
  });
  page.on("pageerror", error => process.stderr.write("[pageerror] " + error.message + "\n"));
  await page.goto("http://127.0.0.1:8080/tests/swiss-heliacal-comparison.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__SWISS_RESULT__ || window.__SWISS_ERROR__, { timeout: 120000 });
  const result = await page.evaluate(() => ({
    result: window.__SWISS_RESULT__ || null,
    error: window.__SWISS_ERROR__ || null
  }));
  assert.equal(result.error, null, result.error || "Swiss heliacal comparison failed");
  assert.equal(result.result?.scenarios?.length, 8, "all eight Swiss visibility scenarios must be compared");
  assert.ok(result.result.scenarios.every(scenario =>
    scenario.results?.length === 10 &&
    Number.isFinite(scenario.meanAbsoluteDateErrorDays) &&
    Number.isFinite(scenario.publishedReferenceMaeDays) &&
    scenario.results.every(item => Number.isFinite(item.signedDateOffsetDays) && Number.isFinite(item.nonComparableClockOffsetMinutes))
  ), "each scenario must compare all ten Pithoragarh boundary dates and keep clock offsets explicitly non-comparable");
  assert.equal(result.result.visibilityLimitProfiles?.length, 10, "all ten boundary visibility profiles must be reported");
  assert.ok(result.result.visibilityLimitProfiles.every(profile =>
    profile.samples?.length === 7 &&
    profile.samples.some(sample => sample.status === "calculated") &&
    profile.samples.filter(sample => sample.status === "calculated").every(sample =>
      Number.isFinite(sample.planetAltitudeDegrees) &&
      Number.isFinite(sample.sunAltitudeDegrees) &&
      Number.isFinite(sample.limitingMagnitude) &&
      Number.isFinite(sample.planetMagnitude) &&
      Number.isFinite(sample.visibilityMargin)
    )
  ), "each boundary must include finite visibility-limit samples on at least one side");
  console.log(JSON.stringify(result.result, null, 2));
} finally {
  await browser.close();
}
