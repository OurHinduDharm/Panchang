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
      return rows >= 8 && text.includes("Swiss K") && text.includes("Observer ΔK");
    }, null, { timeout: 240000 });

    const output = page.locator("#lagnantaraLocationSweepOutput");
    const text = await output.innerText();
    const lagnantaraMainText = await page.locator("#lagnantaraOutput").innerText();
    assert.ok(lagnantaraMainText.includes("Venus") && lagnantaraMainText.includes("Jupiter"),
      "main Lagnantara diagnostic must render the configured Venus and Jupiter references");
    assert.ok(lagnantaraMainText.includes("2026-10-29"),
      "Venus Udaya reference date must align with the published Pithoragarh Asta-end boundary");
    assert.ok(!lagnantaraMainText.includes("2026-11-01"),
      "the stale post-event Venus Udaya sample date must not remain in the diagnostic");
    const venusUdayaRow = await page.locator("#lagnantaraOutput tbody tr")
      .evaluateAll(rows => rows.map(row => row.innerText)
        .find(text => text.startsWith("Venus\\tUdaya")) || "");
    assert.ok(venusUdayaRow, "dedicated Venus Udaya row must exist");
    assert.match(venusUdayaRow, /29 Oct 2026[\\s\\S]*K−C=-0\\./,
      "Venus Udaya K=C bracket must begin with a negative residual on 29 Oct");
    assert.match(venusUdayaRow, /30 Oct 2026[\\s\\S]*K−C=1\\./,
      "Venus Udaya K=C bracket must end with a positive residual on 30 Oct");
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
    assert.equal(rows.length, 16, "four event references × two observers × two K=C bracket samples must render exactly sixteen rows");
    for (const row of rows) {
      assert.doesNotMatch(row, /requested K=C संक्रमण नहीं मिला|Requested Asta\/Udaya bracket उपलब्ध|AE\/Swiss state या C उपलब्ध|NaN|undefined|null/);
      assert.match(row, /[0-9]+\.[0-9]+°/, "each successful row must include numeric angular results");
    }
    assert.deepEqual(pageErrors, [], "no uncaught browser errors");
    console.log("PASS: 4 Venus/Jupiter event cases × 2 observers × 2 actual K=C bracket samples = 16 rows");
    console.log("MAIN LAGNANTARA TABLE:\\n" + lagnantaraMainText);
    console.log("OBSERVER / SWISS SWEEP:\\n" + text);
  } finally {
    await browser.close();
  }
});
