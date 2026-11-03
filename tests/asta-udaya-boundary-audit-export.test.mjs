import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../test-astronomy.html", import.meta.url), "utf8");
const start = source.indexOf("async function copyHistoricalBoundaryGeometryJSON()");
const end = source.indexOf("\nfunction classicalResidual", start);
assert.notEqual(start, -1, "boundary JSON export function must exist");
assert.notEqual(end, -1, "boundary JSON export function must have a bounded end");

test("historical boundary JSON export marks unverified references and preserves observer provenance", async () => {
  let copied = null;
  let notice = "";
  const sandbox = {
    Date,
    UNVERIFIED_PITHORAGARH_BOUNDARY_TRANSCRIPTIONS: [
      { planet: "Venus", event: "Asta begins — evening boundary", localTime: "2026-10-12T18:05:00" },
      { planet: "Venus", event: "Asta ends — morning boundary", localTime: "2026-10-29T05:49:00" }
    ],
    BODY_NAMES: { Venus: "VENUS" },
    CONFIG: { latitude: 29.5828, longitude: 80.2182, elevation: 1650 },
    getClassicalGeometry(_body, date, _planet) {
      assert.ok(date instanceof Date);
      return {
        motionType: "Direct",
        eclipticSeparation: 9.7,
        trueSeparation: 9.8,
        threshold: 10,
        eclipticResidual: -0.3,
        trueResidual: -0.2
      };
    },
    getHorizontal(_body, date) {
      assert.ok(date instanceof Date);
      return { altitude: 4.1, azimuth: 100 };
    },
    getSunHorizontal(date) {
      assert.ok(date instanceof Date);
      return { altitude: -6.2, azimuth: 95 };
    },
    angularDifference(a, b) {
      return Math.abs(a - b);
    },
    navigator: {
      clipboard: {
        async writeText(value) { copied = value; }
      }
    },
    document: {
      getElementById() {
        return { insertAdjacentHTML(_where, html) { notice = html; } };
      }
    },
    console
  };

  vm.runInNewContext(source.slice(start, end), sandbox);
  await sandbox.copyHistoricalBoundaryGeometryJSON();

  const report = JSON.parse(copied);
  assert.equal(report.reportType, "unverified-historical-boundary-geometry-diagnostic");
  assert.equal(report.events.length, 2);
  assert.equal(report.referenceStatus, "unverified-historical-transcription-not-acceptance-target");
  assert.equal(report.events[0].referenceStatus, "unverified-historical-transcription-not-acceptance-target");
  assert.equal(report.observerDefaults.latitude, 29.5828);
  assert.equal(report.observerDefaults.longitude, 80.2182);
  assert.equal(report.observerDefaults.elevationMeters, 1650);
  assert.equal(report.events[0].referenceLocalTime, "2026-10-12T18:05:00");
  assert.equal(report.events[0].timeZone, "Asia/Kolkata");
  assert.equal(report.events[0].instantUTC, "2026-10-12T12:35:00.000Z");
  assert.equal(report.events[0].observer.latitude, 29.5828);
  assert.equal(report.events[0].observer.longitude, 80.2182);
  assert.equal(report.events[0].calculated.eclipticSeparationDegrees, 9.7);
  assert.match(report.importantLimit, /unverified historical project transcriptions/i);
  assert.match(report.importantLimit, /not proof of naked-eye visibility/i);
  assert.match(report.events[0].method.status, /Diagnostic only/);
  assert.match(notice, /निदान है/);
});

test("boundary JSON export button is connected without changing the existing geometry audit", () => {
  assert.match(source, /id="copyDrikBoundaryBtn"/);
  assert.match(source, /getElementById\("copyDrikBoundaryBtn"\)/);
  assert.match(source, /await copyHistoricalBoundaryGeometryJSON\(\)/);
  assert.match(source, /runHistoricalBoundaryGeometryAudit\(\)/);
});

test("historical boundary inputs cannot be presented as confirmed Drik acceptance references", () => {
  assert.match(source, /UNVERIFIED_PITHORAGARH_BOUNDARY_TRANSCRIPTIONS/);
  assert.match(source, /unverified-historical-transcription-not-acceptance-target/);
  assert.match(source, /Historical Pithoragarh Boundary Geometry — Unverified Transcriptions/);
  assert.match(source, /named-city Drik source से स्वतंत्र रूप से पुनः सत्यापित नहीं हुए हैं/);
  assert.doesNotMatch(source, /<h2>Drik Panchang Published Boundary Audit/);
  assert.match(source, /id="runHistoricalBoundaryBtn"/);
});
