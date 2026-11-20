import test from "node:test";
import assert from "node:assert/strict";
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
