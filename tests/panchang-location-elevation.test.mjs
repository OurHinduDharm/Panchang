import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {restoreSavedElevationStatus} from "../panchang-location-elevation.mjs";

const parsed = {lat: 29, lon: 80, elevation: 0, elevationStatus: "provided"};

test("a nonzero fallback does not erase explicitly unknown elevation", () => {
  const restored = restoreSavedElevationStatus({...parsed, elevation: 1586}, {
    lat: 29, lon: 80, elevation: 1586, elevationStatus: "unknown"
  });
  assert.equal(restored.elevation, 0);
  assert.equal(restored.elevationStatus, "unknown");
});

test("measured sea-level elevation remains valid", () => {
  const restored = restoreSavedElevationStatus(parsed, {
    lat: 0, lon: 0, elevation: 0, elevationStatus: "provided"
  });
  assert.equal(restored.elevation, 0);
  assert.equal(restored.elevationStatus, "provided");
});

test("sourced estimates retain their distinct provenance", () => {
  const restored = restoreSavedElevationStatus({...parsed, elevation: 1586}, {
    lat: 29, lon: 80, elevation: 1586, elevationStatus: "estimated"
  });
  assert.equal(restored.elevation, 1586);
  assert.equal(restored.elevationStatus, "estimated");
});

test("missing elevation remains unknown even when parser supplied a numeric fallback", () => {
  const restored = restoreSavedElevationStatus(parsed, {lat: 29, lon: 80});
  assert.equal(restored.elevationStatus, "unknown");
});

test("an estimated zero-meter height keeps its estimate provenance", () => {
  const restored = restoreSavedElevationStatus({...parsed, elevation: 0}, {
    lat: 0, lon: 0, elevation: 0, elevationStatus: "estimated"
  });
  assert.equal(restored.elevation, 0);
  assert.equal(restored.elevationStatus, "estimated");
});

test("invalid saved provenance cannot be upgraded to provided", () => {
  const restored = restoreSavedElevationStatus(parsed, {
    lat: 29, lon: 80, elevation: 1586, elevationStatus: "measured-ish"
  });
  assert.equal(restored.elevation, 0);
  assert.equal(restored.elevationStatus, "unknown");
});

test("daily Panchang persists only public city identifiers and marks GPS elevation unknown", () => {
  const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  assert.match(source, /localStorage\.removeItem\("ohdPanchangLocation"\)/);
  assert.doesNotMatch(source, /localStorage\.setItem\("ohdPanchangLocation"/);
  assert.match(source, /localStorage\.setItem\(cityPreferenceKey, "profile:"/);
  assert.match(source, /localStorage\.setItem\(cityPreferenceKey, "geonames:"/);
  assert.match(source, /observerSource: "gps"[\s\S]*?elevationStatus: "unknown"/);
  assert.doesNotMatch(source, /position\.coords\.altitude/);
});

test("saved GPS observer identity survives elevation restoration", () => {
  const saved = {
    lat: 29.584, lon: 80.219, elevation: 0,
    elevationStatus: "unknown", observerSource: "gps"
  };
  const restored = restoreSavedElevationStatus({ ...parsed, lat: saved.lat, lon: saved.lon }, saved);
  assert.equal(restored.observerSource, "gps");
  assert.equal(restored.elevationStatus, "unknown");
  assert.equal(restored.lat, 29.584);
  assert.equal(restored.lon, 80.219);
});
