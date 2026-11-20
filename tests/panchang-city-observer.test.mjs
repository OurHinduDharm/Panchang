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

test("Hindi alias resolves one fixed GeoNames city profile", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      states: {"39": "Uttarakhand"},
      districts: {"39.01": "Dehradun"},
      cities: [
        [900001, "Dehradun", "39", "01", 30.3165, 78.0322, 640, ["देहरादून"]],
        [900002, "Dehradun", "39", "01", 22.5, 75.5, 999, ["देहरादून"]]
      ]
    })
  });
  try {
    const selected = await resolveCityObserver({
      city: "देहरादून", lat: 30.3164, lon: 78.0321,
      elevation: 0, elevationStatus: "unknown"
    });
    assert.equal(selected.elevation, 640);
    assert.equal(selected.cityId, 900001);
    assert.equal(selected.elevationStatus, "estimated");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
