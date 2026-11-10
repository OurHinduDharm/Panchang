import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

test("Asta-Udaya perf diagnostics are opt-in and visible output stays stable", async () => {
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
      return panel.includes("planetaryReference") && card.includes("Drik मूल स्रोत");
    }, null, { timeout: 180000 });

    const card = page.locator("#planetRiseSetCard");
    const initialFingerprint = (await card.innerText()).replace(/\s+/g, " ").trim();
    const panel = await page.locator("#ohd-perf-panel").innerText();
    assert.match(panel, /direct-drik-city-data; no ephemeris scan/);
    assert.doesNotMatch(initialFingerprint, /आभासी कोणीय|सत्यापनाधीन|कोणीय अनुमानित/);
    assert.match(initialFingerprint, /अस्त प्रारम्भ/);
    assert.match(initialFingerprint, /पुनः उदय/);

    await page.locator("#dateInput").fill("2026-11-01");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => (document.querySelector("#ohd-perf-panel")?.textContent || "").split("planetDiagnostics").length >= 2, null, { timeout: 180000 });
    await page.locator("#dateInput").fill("2026-10-31");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => (document.querySelector("#ohd-perf-panel")?.textContent || "").split("planetDiagnostics").length >= 3, null, { timeout: 180000 });

    const finalFingerprint = (await card.innerText()).replace(/\s+/g, " ").trim();
    assert.equal(finalFingerprint, initialFingerprint, "visible Asta-Udaya result must remain identical after date round-trip");
    assert.deepEqual(errors, [], "no uncaught browser errors");

    const normalPage = await browser.newPage();
    await normalPage.addInitScript(() => localStorage.setItem("ohdPanchangLocation", JSON.stringify({
      name: "पिथौरागढ़, उत्तराखंड, भारत",
      lat: 29.5828,
      lon: 80.2182,
      elevation: 1650
    })));
    const normalResponse = await normalPage.goto("http://127.0.0.1:8080/index.html?date=2026-10-31", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    assert.ok(normalResponse?.ok(), "normal Panchang page must load");
    await normalPage.waitForFunction(() => (document.querySelector("#planetRiseSetCard")?.innerText || "").includes("Drik मूल स्रोत"), null, { timeout: 180000 });
    assert.equal(await normalPage.locator("#ohd-perf-panel").count(), 0, "normal page must not render diagnostics");
    await normalPage.close();

    console.log("Asta-Udaya diagnostic counters rendered only in opt-in mode; visible fingerprint unchanged:\\n" + initialFingerprint);
    console.log(panel);
  } finally {
    await browser.close();
  }
});


test("Drik capture is hard-pinned to Pithoragarh and rejects city fallback", () => {
  const script = readFileSync(new URL("./capture-drik-pithoragarh-asta.mjs", import.meta.url), "utf8");
  assert.match(script, /const CITY_ID = "1259503"/);
  assert.match(script, /url\.searchParams\.set\("geoname-id", CITY_ID\)/);
  assert.match(script, /capture\.cityConfirmed = \/Pithoragarh\/i\.test\(body\)/);
  assert.match(script, /page-loaded-city-and-planet-confirmed/);
  assert.match(script, /No New Delhi fallback/);
});
