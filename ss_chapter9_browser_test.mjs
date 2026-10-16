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

  // Verify the raw TKS capture form can represent the fixture-reported sunset to seconds.
  await page.locator("#setFixtureSunsetBtn").click();
  const rawCapturePreset = await page.evaluate(() => ({
    date: document.querySelector("#rawTksDate").value,
    time: document.querySelector("#rawTksTime").value,
    type: document.querySelector("#rawTksTime").type,
    inputmode: document.querySelector("#rawTksTime").inputMode,
    help: document.querySelector("#rawTksTime").getAttribute("aria-describedby"),
    jd: window.expectedJulianDateUtcFromLocal("2026-10-12", "17:42:21", 5.5)
  }));
  console.log("Raw TKS event-side capture preset:", JSON.stringify(rawCapturePreset));
  if (rawCapturePreset.date !== "2026-10-12" ||
      rawCapturePreset.time !== "17:42:21" ||
      rawCapturePreset.type !== "text" ||
      rawCapturePreset.inputmode !== "numeric" ||
      rawCapturePreset.help !== "rawTksTimeHelp" ||
      Math.abs(rawCapturePreset.jd - 2461326.008576389) > 0.00000001) {
    throw new Error("Raw TKS capture form failed second-precision sunset preset or UTC Julian Day conversion.");
  }
  await page.locator("#rawTksTime").fill("17:42:21");
  const typedSeconds = await page.locator("#rawTksTime").inputValue();
  if (typedSeconds !== "17:42:21") {
    throw new Error("Raw TKS text time field did not preserve manually entered seconds.");
  }
  await page.locator("#setFixtureSunsetBtn").click();

  // Verify a distinct sunrise-side preset is available for the eastern Venus Udaya capture.
  await page.locator("#setFixtureSunriseBtn").click();
  const rawSunrisePreset = await page.evaluate(() => ({
    date: document.querySelector("#rawTksDate").value,
    time: document.querySelector("#rawTksTime").value,
    jd: window.expectedJulianDateUtcFromLocal("2026-10-12", "06:08:39", 5.5)
  }));
  console.log("Raw TKS sunrise-side capture preset:", JSON.stringify(rawSunrisePreset));
  if (rawSunrisePreset.date !== "2026-10-12" ||
      rawSunrisePreset.time !== "06:08:39" ||
      Math.abs(rawSunrisePreset.jd - 2461325.526840278) > 0.00000001) {
    throw new Error("Raw TKS sunrise capture preset failed second-precision UTC Julian Day conversion.");
  }

  // Exercise the new 3-D frame panel in the real browser, not just static HTML wiring.
  await page.locator("#runFrameCompareBtn").click();
  await page.waitForFunction(
    () => document.querySelectorAll("#frameCompareOutput tbody tr").length === 2,
    null,
    { timeout: 30000 }
  );
  const frameRows = await page.locator("#frameCompareOutput tbody tr").evaluateAll(rows =>
    rows.map(row => ({
      body: row.cells[0]?.textContent || "?",
      values: [...row.cells].slice(1).map(cell => cell.textContent || "")
    }))
  );
  console.log("3-D frame comparison:", JSON.stringify(frameRows));
  if (frameRows.length !== 2 || frameRows.some(row =>
      row.values.length !== 8 ||
      row.values.some(value => !Number.isFinite(Number(value.replace("°", "")))) ||
      Math.abs(Number(row.values[6].replace("°", ""))) > 0.00001 ||
      Math.abs(Number(row.values[7].replace("°", ""))) > 0.00001
  )) {
    throw new Error("3-D frame panel failed finite-value or EQD↔ECT reconstruction-residual checks.");
  }

  // Exercise Chapter VII frame sensitivity at the actual Venus sunset-side sample (17:42 IST).
  await page.locator("#runChapter7FrameSensitivityInlineBtn").click();
  await page.waitForFunction(
    () => document.querySelectorAll("#chapter7FrameSensitivityOutput tbody tr").length >= 70,
    null,
    { timeout: 30000 }
  );
  const chapter7FrameRows = await page.locator("#chapter7FrameSensitivityOutput tbody tr").evaluateAll(rows =>
    rows.map(row => ({
      body: row.cells[0]?.textContent || "?",
      path: row.cells[1]?.textContent || "?",
      field: row.cells[2]?.textContent || "?",
      value: row.cells[3]?.textContent || ""
    }))
  );
  const chapter7FrameSummary = await page.locator("#chapter7FrameSensitivityOutput").innerText();
  console.log("Chapter VII 17:42 IST frame sensitivity:", JSON.stringify(chapter7FrameRows));
  if (chapter7FrameRows.length < 70 ||
      !chapter7FrameSummary.includes("2026-10-12 17:42 IST") ||
      chapter7FrameRows.some(row =>
        row.value !== "—" &&
        !Number.isFinite(Number(row.value.replace("°", "")))
      )) {
    throw new Error("Chapter VII sunset-side frame sensitivity did not render finite intermediate values.");
  }

  await page.locator("#runLagnantaraBtn").click();
  await page.waitForFunction(
    () => document.querySelectorAll("#lagnantaraOutput tr.reference-row").length === 4,
    null,
    { timeout: 90000 }
  );

  await page.waitForFunction(
    () => {
      const text = document.querySelector("#sameInstantTksAuditOutput")?.innerText || "";
      return text.includes("2026-10-12 17:42 IST") &&
        text.includes("12:12:00 UTC") &&
        text.includes("reference-only");
    },
    null,
    { timeout: 90000 }
  );

  const sameInstantAudit = await page.locator("#sameInstantTksAuditOutput").innerText();
  console.log("Selected-instant Venus candidate audit:", sameInstantAudit.replace(/\\s+/g, " ").trim());
  if (!sameInstantAudit.includes("2026-10-12 17:42 IST") ||
      !sameInstantAudit.includes("12:12:00 UTC") ||
      !sameInstantAudit.includes("reference-only") ||
      !sameInstantAudit.includes("7.698°") ||
      sameInstantAudit.includes("comparison failed")) {
    throw new Error("Venus candidate audit did not render the selected IST/UTC instant and provenance-pending TKS reference.");
  }
  if (!/Swiss Ephemeris K \(same geometry\)[\s\S]*?\d+\.\d+°[\s\S]*?Swiss−AE:\s*[+-]?\d+\.\d+°/.test(sameInstantAudit) ||
      sameInstantAudit.includes("Swiss Ephemeris K (same geometry)\nUnavailable")) {
    throw new Error("Independent Swiss Venus K did not render a finite value and Swiss−AE delta.");
  }

  await page.locator("#runElevationHorizonBtn").click();
  await page.waitForFunction(
    () => document.querySelectorAll("#elevationHorizonOutput tbody tr").length === 5,
    null,
    { timeout: 30000 }
  );
  const horizonRows = await page.locator("#elevationHorizonOutput tbody tr").allTextContents();
  console.log("Elevation/horizon sensitivity:", horizonRows.map(row => row.replace(/\s+/g, " ").trim()));
  if (horizonRows.length !== 5 ||
      horizonRows.some(row => !row.includes("m")) ||
      !horizonRows[1].includes("1563 m") ||
      !horizonRows[3].includes("100 m")) {
    throw new Error("Elevation/horizon audit did not render all five labeled scenarios.");
  }

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
      angularBracket: row.cells[19]?.textContent || "",
      estimateDays: row.dataset.timeEstimateDays,
      bracketErrorDays: row.dataset.estimateBracketErrorDays,
      shortHorizonErrorDays: row.dataset.shortHorizonErrorDays
    }))
  );
  const chapter7 = await page.locator("#chapter7DrikkarmaTestOutput").innerText();
  const chapter3 = await page.locator("#chapter3LagnantaraTestOutput").innerText();
  const output = await page.locator("#lagnantaraOutput").innerText();
  const venusSnapshotAudit = await page.locator("#sameInstantTksAuditOutput").innerText();
  if (!venusSnapshotAudit.includes("2026-10-12 17:42 IST") ||
      !venusSnapshotAudit.includes("12:12:00 UTC") ||
      !venusSnapshotAudit.includes("reference-only")) {
    throw new Error("Editable Venus candidate instant did not render the expected IST/UTC labels or TKS provenance warning: " + venusSnapshotAudit);
  }
  console.log("Selected-instant Venus audit:", venusSnapshotAudit.replace(/\\s+/g, " ").slice(0, 500));
  console.log("Chapter VII result:", chapter7);
  console.log("Chapter III result:", chapter3);
  for (const row of rows) console.log("ASTA/Udaya reference:", row.replace(/\s+/g, " ").trim());
  for (const [index, detail] of correctionDetails.entries()) {
    console.log("Dṛkkarma component audit:", index + " " + detail.replace(/\s+/g, " ").trim());
  }
  for (const item of estimates) console.log("IX.10–11 estimate audit:", JSON.stringify(item));

  if (!/Chapter VII formula checks: \d+\/\d+ passed\./.test(chapter7) || chapter7.includes("✗")) {
    throw new Error("Chapter VII formula tests did not pass in browser.");
  }
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
        !detail.includes("Sequential: frame correction") ||
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
    item.shortHorizonErrorDays === "" ||
    !Number.isFinite(Number(item.estimateDays)) ||
    !Number.isFinite(Number(item.bracketErrorDays)) ||
    !Number.isFinite(Number(item.shortHorizonErrorDays))
  );
  if (invalidEstimates.length) {
    throw new Error("Missing/non-finite IX.10–11 long-range or short-horizon estimate comparison: " + JSON.stringify(invalidEstimates));
  }
  const notableEstimateErrors = estimates.filter(item => Number(item.bracketErrorDays) > 0.25);
  if (notableEstimateErrors.length) {
    console.warn("REVIEW — long-range IX.10–11 estimate differs from daily-bracket interpolation by more than 0.25 day; see the separate short-horizon check: " + JSON.stringify(notableEstimateErrors));
  }
  const notableShortHorizonErrors = estimates.filter(item => Number(item.shortHorizonErrorDays) > 0.5);
  if (notableShortHorizonErrors.length) {
    console.warn("REVIEW — short-horizon IX.10–11 estimate differs from daily-bracket interpolation by more than 0.5 day: " + JSON.stringify(notableShortHorizonErrors));
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
  if (!output.includes("Current K bracket") || !output.includes("Sequential K bracket") ||
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
  console.log("PASS — Chapter VII formula, coordinate-frame, and hemisphere/input invariants rendered in browser");
  console.log("PASS — Chapter III sign-rising interpolation tests rendered in browser");
  console.log("PASS — all four ecliptic-longitude and true-elongation diagnostics are finite and displayed separately from classical K");
  console.log("PASS — all four apparent ecliptic-angle threshold scans rendered separately from the classical K brackets");
  console.log("PASS — all four cases expose Aksha, Ayana, total, and sequential correction components");
  console.log("PASS — baseline and sequential Aksha coordinate assumptions are exposed separately for source audit");
  console.log("PASS — all four signed IX.10–11 estimates are finite; discrepancies above 0.25 day are flagged REVIEW. This is a numerical-wiring check, not publication-accuracy validation.");
  console.log("PASS — current/sequential lagnāntara tables rendered without browser errors");
} catch (error) {
  console.error("FAIL — browser diagnostic:", error?.stack || error);
  if (errors.length) console.error("Browser errors:", errors.join(" || "));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
