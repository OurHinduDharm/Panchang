import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { build } from "esbuild";

const root = resolve(".");
// Bundle the actual pinned ayanamsa implementation directly, not the
// package barrel (which eagerly loads a Node-only kundli exporter).
const ayanamsaPath = "./node_modules/@ishubhamx/panchangam-js/dist/core/ayanamsa.js";
const panchangBundle = (await build({
  stdin:{contents:`export { getAyanamsa } from "${ayanamsaPath}";`,resolveDir:root},
  bundle:true,format:"esm",platform:"browser",write:false
})).outputFiles[0].contents;
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (path === "/__test-panchang.mjs") return res.writeHead(200, {"Content-Type":"text/javascript"}).end(panchangBundle);
  const file = resolve(root, "." + (path === "/" ? "/index.html" : path));
  if (!file.startsWith(root + sep)) return res.writeHead(403).end();
  try {
    let data = await readFile(file);
    if (path === "/annual-tara-city-worker.mjs" || path === "/daily-tara-planet-worker.mjs") {
      // A worker module fetch bypasses normal page routes. Serve the same pinned
      // npm distribution in CI so the model test does not depend on jsDelivr.
      const cdn = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
      assert.ok(data.toString().includes(cdn));
      data = data.toString().replace(cdn, "/node_modules/astronomy-engine/esm/astronomy.js")
        .replace("https://esm.sh/@ishubhamx/panchangam-js@3.0.0", "/__test-panchang.mjs");
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
  page.on("console", message => { if (message.text().includes("Kanya calculation:")) console.log(message.text()); });
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
  // A missing ingress section must fail this test even when the planet cards render.
  assert.ok(located.kanyaCalendar, "Kanya calendar must be calculated by the actual worker: " + located.kanyaStatus);
  const {ingressUtcMilliseconds: ingress, dawns} = located.kanyaCalendar;
  assert.ok(Math.abs(ingress-Date.parse("2027-09-17T14:10:34+05:30")) < 2*3600000, new Date(ingress).toISOString());
  assert.deepEqual(dawns.map(d=>d.date), Array.from({length:7},(_,i)=>"2027-09-"+(11+i)));
  assert.ok(dawns.every(d=>d.startUtcMilliseconds<d.endUtcMilliseconds && d.endUtcMilliseconds<=ingress &&
    d.endUtcMilliseconds-d.startUtcMilliseconds>20*60000 && d.endUtcMilliseconds-d.startUtcMilliseconds<100*60000));
  const section = page.locator(".planet").filter({hasText:"कन्या संक्रान्ति से पूर्व अगस्त्यार्घ्य"});
  assert.equal(await section.count(),1);
  assert.equal(await section.locator("ol li").count(),7);
  assert.match(await section.innerText(), /संक्रान्ति के बाद अर्घ्यकाल समाप्त/);
  const rules = section.locator("ul li");
  assert.equal(await rules.count(),3);
  assert.match(await rules.nth(0).innerText(), /स्कन्दपुराण.*पूर्व सात दिन प्रतिदिन/);
  assert.match(await rules.nth(1).innerText(), /पद्मपुराण.*निर्णयसिन्धु.*सात रात्रियों तक/);
  assert.match(await rules.nth(2).innerText(), /भविष्यपुराण.*व्रतहेमाद्रि.*कन्या संक्रान्ति से पूर्व सात दिन/);
  assert.match(await rules.nth(0).innerText(), /\(एवं सप्तदिनं दत्त्वा अर्घ्यं प्रागुदयान्मुनेः॥/);
  assert.match(await rules.nth(1).innerText(), /\(आसप्तरात्रादुदयाद्यमस्य दातव्यमेतत्सकलं नरेण।/);
  assert.match(await rules.nth(2).innerText(), /\(कन्यायामागते सूर्येऽर्वाग्वै सप्तमे दिने। कन्यायां समनुप्राप्ते ह्यर्घकालो निवर्तते॥\)/);
  // Test the production daily worker against the actual annual worker.
  const daily = await page.evaluate(() => new Promise((resolve,reject)=>{
    const worker=new Worker("./daily-tara-planet-worker.mjs",{type:"module"});
    const timer=setTimeout(()=>{worker.terminate();reject(new Error("daily worker timed out"));},30000);
    worker.onerror=e=>{clearTimeout(timer);worker.terminate();reject(new Error(e.message));};
    worker.onmessage=({data})=>{clearTimeout(timer);worker.terminate();resolve(data);};
    worker.postMessage({id:17,date:"2027-01-01",location:{latitude:25.3176,longitude:82.9739,elevation:81}});
  }));
  assert.equal(daily.id,17);
  const dailyGuru=daily.windows?.Jupiter;
  assert.ok(dailyGuru,"daily Guru interval");
  const annualGuru=located.events.filter(e=>e.body==="Jupiter");
  assert.equal(dailyGuru.astaUtcMilliseconds,annualGuru.find(e=>e.event==="Asta").utcMilliseconds);
  assert.equal(dailyGuru.udayaUtcMilliseconds,annualGuru.find(e=>e.event==="Udaya").utcMilliseconds);
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
  const yearOptions = await page.locator("#forecast-year option").evaluateAll(options => options.map(option => option.value));
  assert.equal(yearOptions[0], "2021");
  assert.equal(yearOptions.at(-1), "2035");
  await page.selectOption("#forecast-year", "2035");
  await page.locator("#city-events .planet").first().waitFor();
  const year2035 = await page.locator("#city-events").innerText();
  assert.equal(await page.locator(".planet").count(), 3);
  const year2035Links = await page.locator("#city-events .event-link").evaluateAll(links =>
    links.map(link => new URL(link.href).searchParams.get("date")));
  assert.equal(year2035Links.length, 6);
  assert.ok(year2035Links.every(date => date?.startsWith("2035-")), JSON.stringify(year2035Links));
  await page.selectOption("#forecast-year", "2027");
  await page.locator("#city-events .planet").first().waitFor();
  assert.equal(await page.locator("#city-events").innerText(), delhi);
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
  const arghya = page.locator(".planet").filter({hasText: "उदय से सूर्योदय तक"});
  await arghya.waitFor();
  const recorded = await arghya.innerText();
  assert.match(recorded, /उदय से सूर्योदय तक —/);
  assert.match(recorded, /अगस्त्यार्घ्य हेतु दृश्यता-आधारित दर्शनकाल/);
  assert.match(recorded, /अवधि —/);
  assert.doesNotMatch(recorded, /पारम्परिक अगस्त्यार्घ्य का निर्णय अलग है/);
  assert.doesNotMatch(recorded, /अर्घ्य देने का समय —/);
  assert.match(recorded, /उदय — 6 सितंबर/);
  assert.match(recorded, /अस्त — 16 अप्रैल/);
  assert.doesNotMatch(recorded, /पारंपरिक पिथौरागढ़ अर्घ्य-संदर्भ|गणना-प्रोफाइल उपलब्ध नहीं/);
  await page.locator("#place-search").fill("पिथौरागढ़");
  await page.locator("#place-search").press("Enter");
  await page.getByRole("button", {name: /Pithoragarh.*Uttarakhand/}).click();
  assert.equal(await page.locator("#city").inputValue(), "");
  assert.equal(await arghya.innerText(), recorded);
  assert.equal(new URL(page.url()).searchParams.get("geoname"), "1259503");
  await page.reload();
  await arghya.waitFor();
  assert.equal(await arghya.innerText(), recorded);

  await page.setViewportSize({width: 1280, height: 800});
  await page.locator("#place-search").fill("Ramnagar");
  const town = page.getByRole("button", {name: /Ramnagar.*Nainital/});
  await town.focus();
  await town.press("Enter");
  await page.locator(".planet").first().waitFor();
  assert.equal(await arghya.count(), 1);
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
  await restore.getByText(/उदय से सूर्योदय तक —/).waitFor();
  assert.match(await restore.locator("#selected-place").innerText(), /पिथौरागढ़/);
  await restore.close();

  // New dropdown cities resolve the exact same indexed observer as search.
  await page.selectOption("#city", "geoname:1253405");
  await page.locator("#city-events .planet").first().waitFor();
  assert.match(await page.locator("#selected-place").innerText(), /Varanasi/);
  assert.equal(new URL(page.url()).searchParams.get("geoname"), "1253405");
  const indexedLink = await page.getByRole("link", {name:"गुरु अस्त का पंचांग देखें"}).getAttribute("href");
  const indexedEvents = await page.locator("#city-events").innerText();
  await page.reload();
  await page.locator("#city-events .planet").first().waitFor();
  assert.equal(await page.locator("#city").inputValue(), "geoname:1253405");
  assert.equal(await page.locator("#city-events").innerText(), indexedEvents);
  await page.locator("#place-search").fill("काशी");
  await page.locator("#place-search").press("Enter");
  await page.getByRole("button", {name:/Varanasi.*Uttar Pradesh/}).click();
  await page.locator("#city-events .planet").first().waitFor();
  assert.equal(await page.getByRole("link", {name:"गुरु अस्त का पंचांग देखें"}).getAttribute("href"), indexedLink);
  assert.equal(await page.locator("#city").inputValue(), "geoname:1253405");
  await page.selectOption("#city", "geoname:1279259");
  await page.locator("#city-events .planet").first().waitFor();
  assert.match(await page.locator("#selected-place").innerText(), /Agra/);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

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
