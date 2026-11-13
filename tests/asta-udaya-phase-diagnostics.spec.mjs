import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

test("Guru-Shukra date display is compact and perf diagnostics remain opt-in", async () => {
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
      return panel.includes("planetaryReference") && card.includes("अस्त प्रारम्भ") && !card.includes("Drik मूल स्रोत");
    }, null, { timeout: 180000 });

    const card = page.locator("#planetRiseSetCard");
    const initialFingerprint = (await card.innerText()).replace(/\s+/g, " ").trim();
    const panel = await page.locator("#ohd-perf-panel").innerText();
    assert.match(panel, /direct-drik-city-data; Mars daily horizon rise\/set/);
    assert.doesNotMatch(initialFingerprint, /आभासी कोणीय|सत्यापनाधीन|कोणीय अनुमानित/);
    assert.match(initialFingerprint, /अस्त प्रारम्भ/);
    assert.match(initialFingerprint, /पुनः उदय/);
    assert.match(initialFingerprint, /गुरु/);
    assert.match(initialFingerprint, /शुक्र/);
    assert.doesNotMatch(initialFingerprint, /सूर्य|चंद्रमा|मंगल|बुध|शनि/);
    assert.match(initialFingerprint, /उदय/);

    await page.locator("#dateInput").fill("2026-11-01");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => (document.querySelector("#ohd-perf-panel")?.textContent || "").split("planetaryReference").length >= 2, null, { timeout: 180000 });
    await page.locator("#dateInput").fill("2026-10-31");
    await page.locator("#dateInput").dispatchEvent("change");
    await page.waitForFunction(() => (document.querySelector("#ohd-perf-panel")?.textContent || "").split("planetaryReference").length >= 3, null, { timeout: 180000 });

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
    await normalPage.waitForFunction(() => { const card = document.querySelector("#planetRiseSetCard")?.innerText || ""; return card.includes("अस्त प्रारम्भ") && !card.includes("Drik मूल स्रोत"); }, null, { timeout: 180000 });
    assert.equal(await normalPage.locator("#ohd-perf-panel").count(), 0, "normal page must not render diagnostics");
    await normalPage.close();

    const mumbaiPage = await browser.newPage();
    await mumbaiPage.addInitScript(() => localStorage.setItem("ohdPanchangLocation", JSON.stringify({
      name: "Mumbai, Maharashtra, India",
      lat: 19.0760,
      lon: 72.8777,
      elevation: 14,
      state: "Maharashtra",
      city: "Mumbai"
    })));
    const mumbaiResponse = await mumbaiPage.goto("http://127.0.0.1:8080/index.html?date=2026-10-31", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    assert.ok(mumbaiResponse?.ok(), "Mumbai Panchang page must load");
    await mumbaiPage.waitForFunction(() => {
      const card = document.querySelector("#planetRiseSetCard")?.innerText || "";
      return card.includes("अस्त प्रारम्भ") && !card.includes("Drik मूल स्रोत");
    }, null, { timeout: 180000 });
    const mumbaiCard = await mumbaiPage.locator("#planetRiseSetCard").innerText();
    assert.doesNotMatch(mumbaiCard, /Drik Panchang के पिथौरागढ़/);
    assert.doesNotMatch(mumbaiCard, /आभासी कोणीय|सत्यापनाधीन|कोणीय अनुमानित/);
    await mumbaiPage.close();

    console.log("Asta-Udaya diagnostic counters rendered only in opt-in mode; visible fingerprint unchanged:\\n" + initialFingerprint);
    console.log(panel);
  } finally {
    await browser.close();
  }
});


test("production Asta/Udaya card has no provisional angular-threshold engine", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  assert.match(source, /loadDrikPlanetaryReferenceData/);
  assert.match(source, /drik-planetary-reference-2024-2027\.json/);
  assert.match(source, /getDrikPlanetaryReference/);
  assert.doesNotMatch(source, /PLANET_ASTA_THRESHOLDS|findThresholdCrossingInstant|findNearestAngularBoundary|getLocalNoon\(/);
  assert.doesNotMatch(source, /आभासी कोणीय|सत्यापनाधीन|कोणीय अनुमानित/);
});
