import test from "node:test";
import assert from "node:assert/strict";
import {resolveCityObserver} from "../panchang-city-observer.mjs";

test("Pithoragarh search uses the single canonical city height", async () => {
  const selected = await resolveCityObserver({
    city: "पिथौरागढ़", lat: 29.583, lon: 80.218, elevation: 0,
    elevationStatus: "unknown"
  });
  assert.equal(selected.elevation, 1650);
  assert.equal(selected.lat, 29.5828);
  assert.equal(selected.lon, 80.2182);
});

test("a distant city with the same name cannot inherit Pithoragarh height", async () => {
  const selected = await resolveCityObserver({
    city: "पिथौरागढ़", lat: 22, lon: 75, elevation: 0,
    elevationStatus: "unknown"
  });
  assert.equal(selected.elevationStatus, "unknown");
});

test("unidentified city retains explicitly unknown height", async () => {
  const selected = await resolveCityObserver({
    city: "", lat: 28, lon: 77, elevation: 0, elevationStatus: "unknown"
  });
  assert.equal(selected.elevationStatus, "unknown");
});
