import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

test("Sūrya-siddhānta Lagnāntara compares Venus/Jupiter Asta/Udaya across the two explicit Pithoragarh observers", async () => {
  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", error => pageErrors.push(error.message));
    const response = await page.goto("http://127.0.0.1:8080/test-astronomy.html", {
      waitUntil: "domcontentloaded",
      timeout: 90000
    });
    assert.ok(response?.ok(), "astronomy validation page must load");
    await page.waitForSelector("#runLagnantaraBtn", { timeout: 90000 });
    await page.locator("#runLagnantaraBtn").click();

    await page.waitForFunction(() => {
      const output = document.querySelector("#lagnantaraLocationSweepOutput");
      const text = output?.innerText || "";
      const rows = output?.querySelectorAll("tbody tr").length || 0;
      return rows >= 8 && text.includes("Swiss Final K") && text.includes("Observer ΔK");
    }, null, { timeout: 240000 });

    const output = page.locator("#lagnantaraLocationSweepOutput");
    const text = await output.innerText();
    for (const required of [
      "Venus Asta",
      "Venus Udaya",
      "Jupiter Asta",
      "Jupiter Udaya",
      "OurHinduDharm Pithoragarh",
      "TKS reference Pithoragarh"
    ]) {
      assert.ok(text.includes(required), `missing expected sweep case: ${required}`);
    }

    const rows = await output.locator("tbody tr").allInnerTexts();
    assert.equal(rows.length, 8, "four event references × two observers must render exactly eight rows");
    for (const row of rows) {
      assert.doesNotMatch(row, /आवश्यक ग्रह-स्थिति|स्थानीय नागरिक तिथि|NaN|undefined|null/);
      assert.match(row, /[0-9]+\.[0-9]+°/, "each successful row must include numeric angular results");
    }
    assert.deepEqual(pageErrors, [], "no uncaught browser errors");
    console.log("PASS: 4 Venus/Jupiter event cases × 2 observer configurations = 8 rows");
    console.log(text);
  } finally {
    await browser.close();
  }
});
