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

test("event deep link applies one observer across the daily page, date changes and reload", async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({timezoneId: "America/Los_Angeles"});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  const base = "http://127.0.0.1:8080/index.html";
  const saved = {name: "पुराना स्थान", lat: 29.5828, lon: 80.2182, elevation: 1650};
  await context.addInitScript(value => {
    if (!localStorage.getItem("ohdPanchangLocation"))
      localStorage.setItem("ohdPanchangLocation", JSON.stringify(value));
  }, saved);
  try {
    const params = new URLSearchParams({date: "2027-08-17", lat: "28.6139", lon: "77.209",
      elevation: "216", place: "नई दिल्ली & नगर", city: "नई दिल्ली", state: "दिल्ली"});
    await page.goto(base + "?" + params);
    const sunCard = page.locator("#result .card").filter({has: page.getByText("🌅 सूर्य व 🌙 चंद्र समय", {exact: true})});
    try {
      await sunCard.waitFor({timeout: 90000});
    } catch (error) {
      const diagnostics = await page.evaluate(() => ({
        location: window.getPanchangLocation?.() || null,
        selectedCity: document.querySelector("#selectedCity")?.innerText || "",
        result: document.querySelector("#result")?.innerText?.slice(0, 1200) || "",
        date: document.querySelector("#dateInput")?.value || ""
      })).catch(() => null);
      throw new Error(`Daily Panchang card did not render: ${error.message}; diagnostics=${JSON.stringify(diagnostics)}; pageErrors=${errors.join(" | ")}`);
    }
    const expected = await page.evaluate(async () => {
      const {Observer, getPanchangam} = await import("https://esm.sh/@ishubhamx/panchangam-js@3.0.0");
      const p = getPanchangam(new Date("2027-08-17T12:00:00+05:30"),
        new Observer(28.6139, 77.209, 216), {timezoneOffset: 330, calendarType: "purnimanta"});
      return {iso: new Date(p.sunrise).toISOString(), time: new Intl.DateTimeFormat("hi-IN", {
        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true
      }).format(p.sunrise), festivals: (p.festivals || []).map(f => f.name || f.title || String(f))};
    });
    const checkObserver = async () => {
      const data = await page.evaluate(() => ({
        observer: window.getPanchangLocation(), iso: new Date(window.__panchangTest.sunrise).toISOString(),
        saved: JSON.parse(localStorage.getItem("ohdPanchangLocation"))
      }));
      assert.deepEqual(data.observer, {name: "नई दिल्ली & नगर", city: "नई दिल्ली", state: "दिल्ली",
        lat: 28.6139, lon: 77.209, elevation: 216, elevationStatus: "provided"});
      assert.deepEqual(data.saved, saved);
      assert.equal(data.iso, expected.iso);
      assert.ok((await sunCard.innerText()).includes(expected.time));
      const firstHora = page.locator("#horaCard details .time-row").first();
      await firstHora.waitFor({state: "attached"});
      assert.ok((await firstHora.textContent()).includes(expected.time));
      await page.locator("#ohdHinduFestivalsCard").waitFor();
      assert.deepEqual(await page.locator("#ohdHinduFestivalsCard li").allTextContents(), expected.festivals);
    };
    await checkObserver();
    await page.getByRole("button", {name: /अगला दिन/}).click();
    assert.equal(await page.locator("#dateInput").inputValue(), "2027-08-18");
    assert.equal(new URL(page.url()).searchParams.get("lat"), "28.6139");
    await page.getByRole("button", {name: /पिछला दिन/}).click();
    await page.reload();
    await sunCard.waitFor();
    await checkObserver();

    // Replacing the observer manually must remove only the event's location.
    await page.route("https://nominatim.openstreetmap.org/search?**", route => route.fulfill({
      json: [{name: "वाराणसी", display_name: "वाराणसी, उत्तर प्रदेश", lat: "25.31", lon: "83.01",
        address: {city: "वाराणसी", state: "उत्तर प्रदेश"}}]
    }));
    await page.locator("#cityInput").fill("वाराणसी");
    await page.getByRole("button", {name: /खोजें/}).click();
    await page.locator("#suggestions .city").click();
    const after = new URL(page.url()).searchParams;
    assert.equal(after.get("date"), "2027-08-17");
    assert.ok(["lat", "lon", "elevation", "elevationStatus", "place", "city", "state"].every(k => !after.has(k)));
    // The click clears the old event URL synchronously, while observer lookup is async.
    // Wait for the resolved city estimate to replace the temporary unknown observer.
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem("ohdPanchangLocation") || "null")?.elevationStatus === "estimated",
      null,
      {timeout: 15000}
    );
    await page.reload();
    await sunCard.waitFor();
    assert.match(await page.locator("#selectedCity").innerText(), /वाराणसी/);

    await page.goto(base + "?date=2027-08-17&lat=29");
    await page.getByText("पहले अपना शहर चुनें।").waitFor();
    assert.equal(await page.locator("#result .grid").count(), 0);
    params.set("date", "2027-02-30");
    await page.goto(base + "?" + params);
    await page.getByText("कृपया सही तारीख चुनें।").waitFor();
    assert.equal(await page.locator("#dateInput").inputValue(), "");
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
