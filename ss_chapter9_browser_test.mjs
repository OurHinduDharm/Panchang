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

  // Independently inspect the sky geometry at each supplied published local boundary.
  await page.locator("#runDrikBoundaryBtn").click();
  await page.waitForFunction(
    () => document.querySelectorAll("#drikBoundaryOutput tbody tr").length === 20,
    null,
    { timeout: 30000 }
  );
  const publishedBoundaryGeometry = await page.locator("#drikBoundaryOutput tbody tr").evaluateAll(rows =>
    rows.map(row => ({
      planet: row.cells[0]?.textContent.trim() || "?",
      event: row.cells[1]?.textContent.trim() || "?",
      localTime: row.cells[2]?.textContent.trim() || "?",
      motion: row.cells[3]?.textContent.trim() || "?",
      eclipticSeparation: row.cells[4]?.textContent.trim() || "",
      trueElongation: row.cells[5]?.textContent.trim() || "",
      threshold: row.cells[6]?.textContent.trim() || "",
      sunAltitude: row.cells[9]?.textContent.trim() || "",
      planetAltitude: row.cells[10]?.textContent.trim() || "",
      azimuthDifference: row.cells[11]?.textContent.trim() || ""
    }))
  );
  console.log("Published-time sky geometry:", JSON.stringify(publishedBoundaryGeometry));
  if (publishedBoundaryGeometry.length !== 20 ||
      publishedBoundaryGeometry.some(row =>
        !row.localTime.includes("IST") ||
        !/^[-+]?\d+(?:\.\d+)?°$/.test(row.eclipticSeparation) ||
        !/^[-+]?\d+(?:\.\d+)?°$/.test(row.trueElongation) ||
        !/^[-+]?\d+(?:\.\d+)?°$/.test(row.sunAltitude) ||
        !/^[-+]?\d+(?:\.\d+)?°$/.test(row.planetAltitude)
      )) {
    throw new Error("Published-time geometry audit did not produce four complete finite local-sky rows.");
  }
  console.log("PASS — all 20 user-supplied timestamps have independently calculated local-sky geometry");

  // Exercise the exact-time Drik boundary audit against both ecliptic and true-3D thresholds.
  // This is a comparison only: a mathematical threshold crossing is not asserted to be a visibility event.
  await page.locator("#runExactBoundaryAuditBtn").click();
  await page.waitForFunction(
    () => document.querySelectorAll("#exactBoundaryAuditOutput tbody tr").length === 4,
    null,
    { timeout: 30000 }
  );
  const exactBoundaryRows = await page.locator("#exactBoundaryAuditOutput tbody tr").evaluateAll(rows =>
    rows.map(row => ({
      planet: row.cells[0]?.textContent.trim() || "?",
      label: row.cells[1]?.textContent.trim() || "?",
      published: row.cells[2]?.textContent.trim() || "?",
      ecliptic: row.cells[3]?.innerText.replace(/\\s+/g, " ").trim() || "",
      true3d: row.cells[4]?.innerText.replace(/\\s+/g, " ").trim() || ""
    }))
  );
  console.log("Exact-time Drik boundary audit:", JSON.stringify(exactBoundaryRows));
  if (exactBoundaryRows.length !== 4 ||
      exactBoundaryRows.some(row =>
        !row.published.includes("IST") ||
        !row.ecliptic.includes("संदर्भ से समय-अंतर") ||
        !row.true3d.includes("संदर्भ से समय-अंतर") ||
        !row.ecliptic.includes("सीमा (SS IX.7 नहीं):") ||
        !row.true3d.includes("सीमा (SS IX.7 नहीं):")
      )) {
    throw new Error("Exact-time boundary audit did not render all four published timestamps and both model deltas.");
  }
  console.log("PASS — all four published local boundaries compared with ecliptic and true-3D threshold crossings");

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
  const dailyAudit = await page.locator("#lagnantaraOutput tr.reference-row").evaluateAll(rows =>
    rows.map(row => {
      const detail = row.nextElementSibling;
      const table = detail?.querySelector("details details table");
      const headers = [...(table?.querySelectorAll("thead th") || [])].map(th => th.textContent.trim());
      const sampleRows = [...(table?.querySelectorAll("tbody tr") || [])];
      return {
        planet: row.cells[0]?.textContent || "?",
        event: row.cells[1]?.textContent || "?",
        sampleCount: sampleRows.length,
        headers,
        firstRow: sampleRows[0] ? [...sampleRows[0].cells].map(cell => cell.textContent.trim()) : [],
        bracketErrors: sampleRows.map(sampleRow =>
          sampleRow.cells[headers.indexOf("Error vs bracket (days)")]?.textContent.trim() || ""
        )
      };
    })
  );
  console.log("Daily IX.10–11 sample audit:", JSON.stringify(dailyAudit));
  if (dailyAudit.length !== 4 || dailyAudit.some(item =>
      item.sampleCount < 20 ||
      !item.headers.includes("Raw planet longitude (°)") ||
      !item.headers.includes("Corrected planet longitude (°)") ||
      !item.headers.includes("Signed lagnāntara (°)") ||
      !item.headers.includes("K−C (°)") ||
      !item.headers.includes("Signed K-rate IX.10–11 (prāṇa/day)") ||
      !item.headers.includes("Empirical raw-K rate (prāṇa/day)") ||
      !item.headers.includes("Empirical Akṣa-only K-rate (prāṇa/day)") ||
      !item.headers.includes("Empirical Āyana-only K-rate (prāṇa/day)") ||
      !item.headers.includes("Δ Akṣa correction (arcmin/day)") ||
      !item.headers.includes("Δ Āyana correction (arcmin/day)") ||
      !item.headers.includes("Empirical next-sample ΔK/day (prāṇa/day)") ||
      !item.headers.includes("Correction contribution to ΔK/day (prāṇa/day)") ||
      !item.headers.includes("IX.10–11 minus empirical rate") ||
      !item.headers.includes("Corrected planet motion (arcmin/day; diagnostic)") ||
      !item.headers.includes("Event-to-event Sun motion (arcmin/day)") ||
      !item.headers.includes("Event-to-event corrected planet motion (arcmin/day)") ||
      !item.headers.includes("IX.11 rate using event-frame signs + event-to-event motion") ||
      !item.headers.includes("Event-frame rate minus empirical K-rate") ||
      !item.headers.includes("IX.11 rate using original signs + original-frame event motion") ||
      !item.headers.includes("Original-sign rate minus empirical K-rate") ||
      !item.headers.includes("IX.11 rate using corrected planet motion") ||
      !item.headers.includes("Corrected-motion rate minus empirical K-rate") ||
      !item.headers.includes("Predicted event") ||
      !item.headers.includes("Error vs bracket (days)") ||
      item.firstRow.length !== 32 ||
      !item.bracketErrors.some(value => Number.isFinite(Number(value)) && value !== "") ||
      !item.bracketErrors.some(value => value === "—")
  )) {
    throw new Error("Daily IX.10–11 audit must expose numeric bracket errors only for matching event branches and em dashes for non-comparable rows.");
  }

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
        !detail.includes("IX.11 Sun time-motion (prāṇa/day)") ||
        !detail.includes("IX.11 planet time-motion (prāṇa/day)") ||
        !detail.includes("IX.10 signed K-rate (prāṇa/day)") ||
        !detail.includes("IX.10 target difference (prāṇa)") ||
        !detail.includes("IX.11 original-sign U (Sun / planet; prāṇa)") ||
        !detail.includes("IX.11 western event-frame U comparison (Sun / planet; prāṇa)") ||
        !detail.includes("IX.10–11 alternative estimate using original-sign U (days; unadjudicated)") ||
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
