import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

const root = resolve(".");
const server = createServer(async (req, res) => {
  const file = resolve(root, "." + new URL(req.url, "http://localhost").pathname);
  if (!file.startsWith(root + sep)) return res.writeHead(403).end();
  try {
    const data = await readFile(file);
    const mime = { ".html": "text/html", ".mjs": "text/javascript", ".json": "application/json" };
    res.writeHead(200, {"Content-Type": mime[extname(file)] || "application/octet-stream"}).end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  await page.goto("http://127.0.0.1:" + server.address().port + "/planetary-asta-udaya.html");
  await page.selectOption("#city", "delhi");
  await page.selectOption("#forecast-year", "2027");
  await page.waitForSelector("#city-events .planet");
  const delhi = await page.locator("#city-events").innerText();
  assert.match(delhi, /19:32/);
  assert.match(delhi, /05:22/);
  assert.match(delhi, /19:57/);
  assert.match(delhi, /04:49/);
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
  assert.equal(await page.locator("#pithoragarh-records").isVisible(), false);
  await page.selectOption("#city", "dehradun");
  await page.waitForSelector("#city-events .planet");
  assert.match(await page.locator("#city-events").innerText(), /19:34/);
  await page.selectOption("#city", "delhi");
  assert.equal(await page.locator("#city-events").innerText(), delhi);
} finally {
  await browser?.close();
  server.close();
}
