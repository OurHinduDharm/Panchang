import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  const requested = pathname === "/" ? "/test-astronomy.html" : pathname;
  const file = path.resolve(root, "." + requested);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

const errors = [];
let browser;
try {
  await new Promise(resolve => server.listen(4173, "127.0.0.1", resolve));
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  page.on("pageerror", error => errors.push("pageerror: " + error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push("console: " + message.text());
  });

  await page.goto("http://127.0.0.1:4173/test-astronomy.html", {
    waitUntil: "domcontentloaded",
    timeout: 90000
  });
  await page.waitForFunction(
    () => window.__SS_CH9_DIAGNOSTIC_READY__ === true,
    null,
    { timeout: 90000 }
  );

  await page.locator("#runLagnantaraBtn").click();
  await page.waitForFunction(
    () => document.querySelectorAll("#lagnantaraOutput tr.reference-row").length === 4,
    null,
    { timeout: 90000 }
  );

  const rows = await page.locator("#lagnantaraOutput tr.reference-row").allTextContents();
  const chapter7 = await page.locator("#chapter7DrikkarmaTestOutput").innerText();
  const output = await page.locator("#lagnantaraOutput").innerText();
  console.log("Chapter VII result:", chapter7);
  for (const row of rows) console.log("ASTA/Udaya reference:", row.replace(/\\s+/g, " ").trim());

  if (!chapter7.includes("7/7")) throw new Error("Chapter VII formula tests did not pass in browser.");
  if (rows.length !== 4) throw new Error("Expected four reference rows.");
  const branchMismatches = rows.filter(row =>
    row.includes("Ambiguous/unavailable") || row.includes("⚠ differs from fixture")
  );
  if (branchMismatches.length) {
    throw new Error("IX.2–3 branch classification did not match every expected reference: " + branchMismatches.join(" || "));
  }
  if (!output.includes("Current daily bracket") || !output.includes("Sequential daily bracket")) {
    throw new Error("Daily crossing table did not render fully.");
  }
  if (errors.length) throw new Error("Browser reported errors: " + errors.join(" || "));

  console.log("PASS — research page loaded in Chromium");
  console.log("PASS — all four Chapter IX reference branches matched their expected event classes");
  console.log("PASS — Chapter VII formula tests rendered in browser");
  console.log("PASS — current/sequential lagnāntara tables rendered without browser errors");
} catch (error) {
  console.error("FAIL — browser diagnostic:", error?.stack || error);
  if (errors.length) console.error("Browser errors:", errors.join(" || "));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
