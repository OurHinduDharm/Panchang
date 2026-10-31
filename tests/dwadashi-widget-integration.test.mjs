import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("annual review scans the Panchang engine at each local sunrise", async () => {
  const html = await read("festival-year-review.html");
  assert.match(html, /buildAnnualDwadashiPackage/);
  assert.match(html, /getPanchangam\(new Date\(dayRecord\.sunrise\),observer/);
  assert.match(html, /const dwadashiScanDays=yearDays\+31/);
  assert.match(html, /dwadashiDays\.push\(dayRecord\)/);
  assert.match(html, /buildAnnualDwadashiPackage\(dwadashiDays,dwadashiRules/);
  assert.match(html, /sunriseTithi=\{/);
  assert.match(html, /noonObservations/);
  assert.match(html, /approveChLabel/);
  assert.match(html, /downloadDwadashi/);
  assert.match(html, /renderDwadashiReview/);
  assert.match(html, /syncDwadashiPackageStatus/);
  assert.match(html, /approveChLabel/);
  assert.match(html, /dwadashiReview/);
});

test("monthly Vrat-Parv widget only imports approved annual Dwadashi records", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  assert.match(widget, /data\/dwadashi\/"\+year\+"\.json/);
  assert.match(widget, /data\.status!=="approved"/);
  assert.match(widget, /sameLatitude/);
  assert.match(widget, /sameLongitude/);
  assert.match(widget, /record\.status!=="approved"/);
  assert.match(widget, /mergeAnnualDwadashiEvents/);
  assert.match(widget, /annual\.tithiDates/);
  assert.match(widget, /category:"द्वादशी तिथि"/);
  assert.match(widget, /व्रत-विशेष के शास्त्रीय नियम/);
  assert.match(widget, /एकादशी\|पारण\|parana/);
});

test("upcoming festival widget prefers approved annual Chaturmas phases and retains legacy fallback", async () => {
  const widget = await read("festival-widget.js");
  assert.match(widget, /\.\.\/dwadashi\/.*year.*json/);
  assert.match(widget, /annual\.status === "approved"/);
  assert.match(widget, /candidate\.status === "approved"/);
  assert.match(widget, /completePhases/);
  assert.match(widget, /todayKey < phase\.endDate/);
  assert.match(widget, /पिछला चरण पूर्ण और अगला चरण वर्तमान होगा/);
  assert.match(widget, /\.\.\/chaturmas\//);
});

test("publication instructions keep unreviewed dates out of the live widgets", async () => {
  const readme = await read("data/dwadashi/README.md");
  assert.match(readme, /needs-review/);
  assert.match(readme, /udayavyapini-smarta-first-sunrise/);
  assert.match(readme, /अधिक मास/);
  assert.match(readme, /स्वीकृति बॉक्स/);
});
