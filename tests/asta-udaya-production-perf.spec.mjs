import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.OHD_PERF_TEST_URL || "http://127.0.0.1:8080/index.html";

test("production Asta-Udaya baseline: repeated timings and unchanged output fingerprint", async () => {
  const browser = await chromium.launch({ headless: true });
  const reports = [];
  const errors = [];

  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.setItem("ohdPanchangLocation", JSON.stringify({
        name: "पिथौरागढ़, उत्तराखंड, भारत",
        lat: 29.5828,
        lon: 80.2182,
        elevation: 1650,
        state: "उत्तराखंड",
        city: "पिथौरागढ़"
      }));
    });
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      const value = message.text();
      if (value.includes("[OHD performance] Extra Panchang update")) reports.push(value);
    });

    const url = BASE_URL + "?perf=1&date=2026-10-31";
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    assert.ok(response?.ok(), "Panchang page must load");

    await page.waitForFunction(() => {
      const panel = document.querySelector("#ohd-perf-panel")?.textContent || "";
      const card = document.querySelector("#planetRiseSetCard")?.innerText || "";
      return panel.includes("planet rise/set calculation and card") && card.length > 20;
    }, null, { timeout: 180000 });

    const card = page.locator("#planetRiseSetCard");
    const firstFingerprint = (await card.innerText()).replace(/\s+/g, " ").trim();
    const firstPanel = await page.locator("#ohd-perf-panel").innerText();
    assert.match(firstPanel, /2026-10-31/);
    assert.match(firstPanel, /planet rise\/set calculation and card/);

    // Recalculate another date, then return to the fixed date to exercise in-page caches.
    await page.locator("#dateInput").fill("2026-11-01");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => {
      const panel = document.querySelector("#ohd-perf-panel")?.textContent || "";
      return panel.split("planet rise/set calculation and card").length - 1 >= 2;
    }, null, { timeout: 180000 });

    await page.locator("#dateInput").fill("2026-10-31");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => {
      const panel = document.querySelector("#ohd-perf-panel")?.textContent || "";
      return panel.split("planet rise/set calculation and card").length - 1 >= 3;
    }, null, { timeout: 180000 });

    const finalFingerprint = (await card.innerText()).replace(/\s+/g, " ").trim();
    assert.equal(finalFingerprint, firstFingerprint, "same fixed date and observer must produce identical visible Asta-Udaya output");
    assert.deepEqual(errors, [], "no uncaught browser errors");

    const finalPanel = await page.locator("#ohd-perf-panel").innerText();
    console.log("OHD Asta-Udaya performance baseline (fixed observer: Pithoragarh 29.5828, 80.2182, 1650 m)");
    console.log("Visible output fingerprint: " + firstFingerprint);
    console.log("Performance panel records:\n" + finalPanel);
  } finally {
    await browser.close();
  }
});
