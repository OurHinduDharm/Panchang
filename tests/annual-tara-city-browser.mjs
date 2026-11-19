import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

const root = resolve(".");
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const file = resolve(root, "." + (path === "/" ? "/index.html" : path));
  if (!file.startsWith(root + sep)) return res.writeHead(403).end();
  try {
    let data = await readFile(file);
    if (path === "/annual-tara-city-worker.mjs") {
      // A worker module fetch bypasses normal page routes. Serve the same pinned
      // npm distribution in CI so the model test does not depend on jsDelivr.
      const cdn = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
      assert.ok(data.toString().includes(cdn));
      data = data.toString().replace(cdn, "/node_modules/astronomy-engine/esm/astronomy.js");
    }
    const mime = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".json": "application/json" };
    res.writeHead(200, {"Content-Type": mime[extname(file)] || "application/octet-stream"}).end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 390, height: 844}, hasTouch: true,
    isMobile: true, timezoneId: "America/Los_Angeles"});
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const started = Date.now();
  await page.goto("http://127.0.0.1:" + server.address().port + "/planetary-asta-udaya.html");
  await page.selectOption("#city", "delhi");
  await page.selectOption("#forecast-year", "2027");
  await page.waitForSelector("#city-events .planet");
  const delhi = await page.locator("#city-events").innerText();
  assert.match(delhi, /सायं 07:32 बजे/);
  assert.match(delhi, /प्रातः 05:22 बजे/);
  assert.match(delhi, /सायं 07:57 बजे/);
  assert.match(delhi, /प्रातः 04:49 बजे/);
  // A city-search result can use the same worker without a preset id.
  const located = await page.evaluate(() => new Promise((resolve, reject) => {
    const worker = new Worker("./annual-tara-city-worker.mjs", {type: "module"});
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Coordinate-only annual forecast timed out"));
    }, 30_000);
    const finish = () => { clearTimeout(timeout); worker.terminate(); };
    worker.onerror = event => { finish(); reject(new Error(event.message)); };
    worker.onmessage = ({data}) => { finish(); resolve(data); };
    worker.postMessage({location: {name: "वाराणसी", lat: 25.3176, lon: 82.9739,
      elevation: 81, elevationStatus: "provided"}, year: 2027});
  }));
  const guru = located.events.filter(e => e.body === "Jupiter");
  assert.deepEqual(guru.map(e => e.event), ["Asta", "Udaya"]);
  assert.ok(guru.every(e => Number.isFinite(e.utcMilliseconds)));
  assert.equal(await page.locator("#pithoragarh-records").count(), 0);
  await page.selectOption("#city", "dehradun");
  await page.waitForSelector("#city-events .planet");
  assert.match(await page.locator("#city-events").innerText(), /सायं 07:34 बजे/);
  await page.selectOption("#city", "delhi");
  assert.equal(await page.locator("#city-events").innerText(), delhi);
  assert.equal(await page.locator(".planet").count(), 3);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const annualUrl = new URL(page.url());
  assert.equal(annualUrl.searchParams.get("city"), "delhi");
  assert.equal(annualUrl.searchParams.get("year"), "2027");
  const guruLink = page.getByRole("link", {name: "गुरु अस्त का पंचांग देखें"});
  const linked = new URL(await guruLink.getAttribute("href"));
  assert.equal(linked.searchParams.get("date"), "2027-08-17");
  assert.equal(linked.searchParams.get("lat"), "28.6139");
  assert.equal(linked.searchParams.get("lon"), "77.209");
  assert.equal(linked.searchParams.get("elevation"), "216");

  await page.selectOption("#forecast-year", "2026");
  await page.selectOption("#city", "pithoragarh-project-target");
  const arghya = page.locator(".planet").filter({hasText: "अगस्त्य अर्घ्य"});
  await arghya.waitFor();
  const recorded = await arghya.innerText();
  assert.match(recorded, /अगस्त्य अर्घ्य — 7 सितंबर 2026/);
  assert.match(recorded, /प्रातः 04:44 बजे से प्रातः 05:49 बजे/);
  await page.locator("#place-search").fill("पिथौरागढ़");
  await page.locator("#place-search").press("Enter");
  await page.getByRole("button", {name: /Pithoragarh.*Uttarakhand/}).click();
  assert.equal(await page.locator("#city").inputValue(), "");
  assert.equal(await arghya.innerText(), recorded);
  assert.equal(new URL(page.url()).searchParams.get("geoname"), "1259503");
  await page.reload();
  await arghya.waitFor();
  assert.equal(await arghya.innerText(), recorded);
  const setUrl = new URL(await arghya.getByRole("link", {name: /अगस्त्य अस्त/}).getAttribute("href"));
  assert.deepEqual(["date", "lat", "lon", "elevation"].map(key => setUrl.searchParams.get(key)),
    ["2026-04-15", "29.5828", "80.2182", "1650"]);

  await page.setViewportSize({width: 1280, height: 800});
  await page.locator("#place-search").fill("Ramnagar");
  const town = page.getByRole("button", {name: /Ramnagar.*Nainital/});
  await town.focus();
  await town.press("Enter");
  await page.locator(".planet").first().waitFor();
  assert.equal(await arghya.count(), 0);
  assert.equal(await page.locator(".planet").count(), 3);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector("#city-events"))
    .gridTemplateColumns.trim().split(/ +/).length), 3);
  // Begin a search, then switch immediately. A late result must never reopen it.
  await page.locator("#place-search").fill("Almora");
  await page.selectOption("#city", "delhi");
  await page.locator(".planet").first().waitFor();
  assert.equal(await page.locator("#place-results").isVisible(), false);
  assert.match(await page.locator("#selected-place").innerText(), /नई दिल्ली/);

  // Hold the real index response: changing the year must not cancel restoration.
  const restore = await browser.newPage({viewport: {width: 1280, height: 800}});
  let releaseIndex, indexRequested;
  const pending = new Promise(resolve => { releaseIndex = resolve; });
  const requested = new Promise(resolve => { indexRequested = resolve; });
  await restore.route("**/tara-india-places.json", async route => {
    indexRequested();
    await pending;
    await route.continue();
  });
  await restore.goto("http://127.0.0.1:" + server.address().port +
    "/planetary-asta-udaya.html?geoname=1259503&year=2027");
  await requested;
  await restore.selectOption("#forecast-year", "2026");
  releaseIndex();
  await restore.getByText("अगस्त्य अर्घ्य — 7 सितंबर 2026 (सोमवार)").waitFor();
  assert.match(await restore.locator("#selected-place").innerText(), /पिथौरागढ़/);
  await restore.close();

  // Verify the actual iframe link points outside the annual calendar.
  await page.goto("http://127.0.0.1:" + server.address().port + "/planetary-asta-udaya.html", {waitUntil: "domcontentloaded"});
  await page.setContent('<iframe title="वार्षिक पंचांग" src="/planetary-asta-udaya.html?city=delhi&year=2027"></iframe>');
  const frameLink = page.frameLocator("iframe").getByRole("link", {name: "गुरु अस्त का पंचांग देखें"});
  await frameLink.waitFor();
  const blogLink = new URL(await frameLink.getAttribute("href"));
  assert.equal(blogLink.origin + blogLink.pathname, "https://ourhindudharm.blogspot.com/p/panchang-today.html");
  assert.equal(blogLink.search, linked.search);
  assert.equal(await frameLink.getAttribute("target"), "_top");
  assert.deepEqual(errors, []);
  console.log("Annual mobile and desktop interactions, search, reload, and iframe links passed in", Date.now() - started, "ms");
} finally {
  await browser?.close();
  server.close();
}
