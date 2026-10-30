import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

test("real browser executes the location-bound Swiss heliacal validation", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  try {
    const response = await page.goto(
      process.env.ASTA_UDAYA_TEST_URL || "http://127.0.0.1:8080/test-astronomy.html",
      { waitUntil: "domcontentloaded", timeout: 60000 }
    );
    assert.ok(response && response.ok(), "test-astronomy.html must load successfully");

    await page.waitForFunction(() => {
      const lat = document.querySelector("#configLatitude")?.textContent || "";
      const lon = document.querySelector("#configLongitude")?.textContent || "";
      return lat.includes("29.5828") && lon.includes("80.2182");
    }, null, { timeout: 30000 });

    await page.locator("#runHeliacalBtn").click();

    await page.waitForFunction(() => {
      const output = document.querySelector("#heliacalOutput")?.innerText || "";
      return output.includes("Beginning of visibility (UTC)") ||
        output.includes("Swiss heliacal validation failed") ||
        output.includes("No eligible Pithoragarh benchmark");
    }, null, { timeout: 180000 });

    const output = await page.locator("#heliacalOutput").innerText();
    console.log("Swiss heliacal browser result for review:\\n" + output);
    assert.ok(
      output.includes("Beginning of visibility (UTC)"),
      "Swiss WASM must return and render actual visibility results; static HTML/unit tests are not enough. Output was: " + output.slice(0, 1800)
    );
    assert.match(output, /Pithoragarh, Uttarakhand, India/);
    assert.match(output, /same-city|source coordinates undisclosed/i);
    assert.match(output, /Swiss minus published boundary: [+-]?\d+(?:\.\d+)? minutes/, "finite event-time difference must be rendered");

    // Event-side sanity checks only: Evening Last should precede the Asta-start
    // reference, while Morning First should follow the Asta-end reference.
    // This does not assert that Swiss and Drik use equivalent event definitions.
    const settingBlock = output.match(/Venus — Asta आरम्भ — सायंकाल अंतिम दृश्यता([\\s\\S]*?)(?=Venus — Asta समाप्त|$)/);
    const risingBlock = output.match(/Venus — Asta समाप्त — प्रातः प्रथम दृश्यता([\\s\\S]*?)(?=Visibility point|$)/);
    const settingDelta = settingBlock?.[1]?.match(/Swiss minus published boundary: ([+-]?\\d+(?:\\.\\d+)?) minutes/);
    const risingDelta = risingBlock?.[1]?.match(/Swiss minus published boundary: ([+-]?\\d+(?:\\.\\d+)?) minutes/);
    assert.ok(settingDelta, "Evening Last boundary delta must be present");
    assert.ok(risingDelta, "Morning First boundary delta must be present");
    assert.ok(Number(settingDelta[1]) < 0, "Evening Last candidate should be before the published Asta-start");
    assert.ok(Number(risingDelta[1]) > 0, "Morning First candidate should be after the published Asta-end");
    assert.doesNotMatch(output, /New Delhi, NCT, India/);
    assert.doesNotMatch(output, /Swiss heliacal validation failed/i);
    assert.deepEqual(pageErrors, [], "browser page must not throw uncaught JavaScript errors");
  } finally {
    await browser.close();
  }
});
