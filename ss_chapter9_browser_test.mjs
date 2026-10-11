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
  const correctionDetails = await page.locator("#lagnantaraOutput tr.reference-row").evaluateAll(elements =>
    elements.map(row => row.nextElementSibling?.textContent || "")
  );
  const estimates = await page.locator("#lagnantaraOutput tr.reference-row").evaluateAll(elements =>
    elements.map(row => ({
      planet: row.cells[0]?.textContent || "?",
      event: row.cells[1]?.textContent || "?",
      eclipticLongitudeSeparation: row.cells[8]?.textContent || "",
      trueElongation: row.cells[9]?.textContent || "",
      angularBracket: row.cells[18]?.textContent || "",
      estimateDays: row.dataset.timeEstimateDays,
      bracketErrorDays: row.dataset.estimateBracketErrorDays
    }))
  );
  const chapter7 = await page.locator("#chapter7DrikkarmaTestOutput").innerText();
  const chapter3 = await page.locator("#chapter3LagnantaraTestOutput").innerText();
  const output = await page.locator("#lagnantaraOutput").innerText();
  console.log("Chapter VII result:", chapter7);
  console.log("Chapter III result:", chapter3);
  for (const row of rows) console.log("ASTA/Udaya reference:", row.replace(/\s+/g, " ").trim());
  for (const [index, detail] of correctionDetails.entries()) {
    console.log("Dṛkkarma component audit:", index + " " + detail.replace(/\s+/g, " ").trim());
  }
  for (const item of estimates) console.log("IX.10–11 estimate audit:", JSON.stringify(item));

  if (!chapter7.includes("9/9")) throw new Error("Chapter VII formula tests did not pass in browser.");
  if (!chapter3.includes("5/5")) throw new Error("Chapter III rising-asus tests did not pass in browser.");
  if (rows.length !== 4) throw new Error("Expected four reference rows.");
  if (correctionDetails.length !== 4 ||
      correctionDetails.some(detail =>
        !detail.includes("Aksha dṛkkarma") ||
        !detail.includes("Ayana dṛkkarma") ||
        !detail.includes("Total dṛkkarma") ||
        !detail.includes("Sequential: Aksha dṛkkarma") ||
        !detail.includes("Sequential: planet RA used for Aksha") ||
        !detail.includes("Sequential: planet declination used for half-day") ||
        detail.includes("RA of intermediate ecliptic point")
      )) {
    throw new Error("One or more event cases are missing the dṛkkarma component audit.");
  }
  const invalidGeometry = estimates.filter(item =>
    !item.eclipticLongitudeSeparation.includes("°") ||
    !item.trueElongation.includes("°") ||
    !Number.isFinite(Number(item.eclipticLongitudeSeparation.replace("°", ""))) ||
    !Number.isFinite(Number(item.trueElongation.replace("°", ""))) ||
    !item.angularBracket ||
    (!item.angularBracket.includes("Δλ−C=") && !item.angularBracket.includes("No crossing"))
  );
  if (invalidGeometry.length) {
    throw new Error("Missing/non-finite independent angular-separation diagnostics: " + JSON.stringify(invalidGeometry));
  }
  const invalidEstimates = estimates.filter(item =>
    item.estimateDays === "" || item.bracketErrorDays === "" ||
    !Number.isFinite(Number(item.estimateDays)) ||
    !Number.isFinite(Number(item.bracketErrorDays))
  );
  if (invalidEstimates.length) {
    throw new Error("Missing/non-finite IX.10–11 estimate or bracket comparison: " + JSON.stringify(invalidEstimates));
  }
  const notableEstimateErrors = estimates.filter(item => Number(item.bracketErrorDays) > 0.25);
  if (notableEstimateErrors.length) {
    console.warn("REVIEW — IX.10–11 local-motion estimate differs from the daily-bracket interpolation by more than 0.25 day: " + JSON.stringify(notableEstimateErrors));
  }
  const largeEstimateErrors = estimates.filter(item => Number(item.bracketErrorDays) > 0.75);
  if (largeEstimateErrors.length) {
    throw new Error("IX.10–11 estimates differ from linearly interpolated daily brackets by more than 0.75 day: " + JSON.stringify(largeEstimateErrors));
  }
  const branchMismatches = rows.filter(row =>
    row.includes("Ambiguous/unavailable") || row.includes("⚠ differs from fixture")
  );
  if (branchMismatches.length) {
    throw new Error("IX.2–3 branch classification did not match every expected reference: " + branchMismatches.join(" || "));
  }
  if (!output.includes("Classical K bracket") || !output.includes("Sequential K bracket") ||
      !output.includes("Ecliptic Δλ bracket") ||
      !output.includes("IX.10–11 sequential estimate (days)")) {
    throw new Error("Daily crossing / IX.10–11 estimate table did not render fully.");
  }
  if (rows.some(row => row.includes("NaN"))) {
    throw new Error("A reference row contains a NaN calculation.");
  }
  if (errors.length) throw new Error("Browser reported errors: " + errors.join(" || "));

  console.log("PASS — research page loaded in Chromium");
  console.log("PASS — all four Chapter IX reference branches matched their expected event classes");
  console.log("PASS — Chapter VII formula and hemisphere/input invariants rendered in browser");
  console.log("PASS — Chapter III sign-rising interpolation tests rendered in browser");
  console.log("PASS — all four ecliptic-longitude and true-elongation diagnostics are finite and displayed separately from classical K");
  console.log("PASS — all four apparent ecliptic-angle threshold scans rendered separately from the classical K brackets");
  console.log("PASS — all four cases expose Aksha, Ayana, total, and sequential correction components");
  console.log("PASS — Aksha uses the planet's own RA/declination, not the intermediate Ayana-corrected point");
  console.log("PASS — all four signed IX.10–11 estimates are finite and within 0.75 day of the daily-bracket interpolation");
  console.log("PASS — current/sequential lagnāntara tables rendered without browser errors");
} catch (error) {
  console.error("FAIL — browser diagnostic:", error?.stack || error);
  if (errors.length) console.error("Browser errors:", errors.join(" || "));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
