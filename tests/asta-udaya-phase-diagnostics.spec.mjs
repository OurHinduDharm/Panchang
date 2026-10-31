import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

test("Asta-Udaya perf diagnostics are present and visible output stays stable", async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => localStorage.setItem("ohdPanchangLocation", JSON.stringify({
      name: "पिथौरागढ़, उत्तराखंड, भारत",
      lat: 29.5828,
      lon: 80.2182,
      elevation: 1650,
      state: "उत्तराखंड",
      city: "पिथौरागढ़"
    })));
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto("http://127.0.0.1:8080/index.html?perf=1&date=2026-10-31", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    assert.ok(response?.ok(), "Panchang page must load");
    await page.waitForFunction(() => {
      const panel = document.querySelector("#ohd-perf-panel")?.textContent || "";
      const card = document.querySelector("#planetRiseSetCard")?.innerText || "";
      return panel.includes("planetDiagnostics") && card.length > 20;
    }, null, { timeout: 180000 });

    const card = page.locator("#planetRiseSetCard");
    const initialFingerprint = (await card.innerText()).replace(/\s+/g, " ").trim();
    const panel = await page.locator("#ohd-perf-panel").innerText();
    assert.match(panel, /"dailyRequests":\s*[1-9]\d*/);
    assert.match(panel, /"dailyCacheHits":\s*\d+/);
    assert.match(panel, /"dailyCacheMisses":\s*\d+/);
    assert.match(panel, /"dailyEphemerisCalls":\s*\d+/);
    assert.match(panel, /"bisectionEvaluations":\s*\d+/);
    assert.match(panel, /"boundaryScanDays":\s*\d+/);
    assert.match(panel, /"pairedBoundaryCacheHits":\s*\d+/);

    await page.locator("#dateInput").fill("2026-11-01");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => (document.querySelector("#ohd-perf-panel")?.textContent || "").split("planetDiagnostics").length >= 2, null, { timeout: 180000 });
    await page.locator("#dateInput").fill("2026-10-31");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => (document.querySelector("#ohd-perf-panel")?.textContent || "").split("planetDiagnostics").length >= 3, null, { timeout: 180000 });

    const finalFingerprint = (await card.innerText()).replace(/\s+/g, " ").trim();
    assert.equal(finalFingerprint, initialFingerprint, "visible Asta-Udaya result must remain identical after date round-trip");
    assert.deepEqual(errors, [], "no uncaught browser errors");
    console.log("Asta-Udaya diagnostic counters rendered; visible fingerprint unchanged:\\n" + initialFingerprint);
    console.log(panel);
  } finally {
    await browser.close();
  }
});
