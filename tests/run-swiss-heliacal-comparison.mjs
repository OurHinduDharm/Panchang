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
  assert.ok(result.result.scenarios.every(scenario => scenario.results?.length === 10), "each scenario must compare all ten published and provisional Pithoragarh boundaries");
  console.log(JSON.stringify(result.result, null, 2));
} finally {
  await browser.close();
}
