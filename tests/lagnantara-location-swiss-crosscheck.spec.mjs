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
        .find(text => text.startsWith("Venus\tUdaya")) || "");
    assert.ok(venusUdayaRow, "dedicated Venus Udaya row must exist");
    const beforeIndex = venusUdayaRow.indexOf("29 Oct 2026");
    const afterIndex = venusUdayaRow.indexOf("30 Oct 2026");
    assert.ok(beforeIndex >= 0 && afterIndex > beforeIndex,
      "Venus Udaya bracket must list 29 Oct before 30 Oct");
    assert.ok(venusUdayaRow.slice(beforeIndex, afterIndex).includes("K−C=-0."),
      "29 Oct sample must have a negative K−C residual");
    assert.ok(venusUdayaRow.slice(afterIndex).includes("K−C=1."),
      "30 Oct sample must have a positive K−C residual");
    assert.ok(lagnantaraMainText.includes("Ch. III+VII source K"),
      "main diagnostic must show the separate PR #22 Chapter III/VII source-sequence candidate");
    const sourceCells = await page.locator("#lagnantaraOutput tbody tr")
      .evaluateAll(rows => {
        const row = rows.find(item =>
          item.cells?.[0]?.innerText.trim() === "Venus" &&
          item.cells?.[1]?.innerText.trim() === "Udaya"
        );
        return row ? [...row.cells].map(cell => cell.innerText) : [];
      });
    assert.equal(sourceCells.length, 15, "main Lagnantara row must expose all 15 comparison columns");
    assert.equal(sourceCells[10], "8.00°", "Venus east-rising must use the Chapter IX.7 east-rising C=8° branch");
    const jupiterAstaC = await page.locator("#lagnantaraOutput tbody tr")
      .evaluateAll(rows => {
        const row = rows.find(item =>
          item.cells?.[0]?.innerText.trim() === "Jupiter" &&
          item.cells?.[1]?.innerText.trim() === "Asta"
        );
        return row?.cells?.[10]?.innerText.trim() || "";
      });
    assert.equal(jupiterAstaC, "11.00°", "Jupiter event geometry must use the Chapter IX.6 C=11° branch");
    assert.ok(Number.isFinite(Number.parseFloat(sourceCells[6])),
      "Chapter III + VII source-sequence K must be a finite numeric result");
    assert.ok(sourceCells[14].length > 0,
      "Chapter III + VII source-sequence daily bracket must be reported");
    const sourceUdaya = sourceCells[14].slice(sourceCells[14].indexOf("Bracket 2"));
    assert.ok(sourceUdaya.includes("28 Oct 2026") && sourceUdaya.includes("29 Oct 2026"),
      "PR #22 Chapter III + VII source sequence must bracket Venus Udaya on 28→29 Oct");
    const sourceBefore = sourceUdaya.indexOf("28 Oct 2026");
    const sourceAfter = sourceUdaya.indexOf("29 Oct 2026");
    assert.ok(sourceUdaya.slice(sourceBefore, sourceAfter).includes("K−C=-1."),
      "28 Oct source-sequence sample must be below C");
    assert.ok(sourceUdaya.slice(sourceAfter).includes("K−C=0."),
      "29 Oct source-sequence sample must be above C");
    console.log("PR #22 source-sequence Venus Udaya row:", sourceCells.join(" | "));
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
