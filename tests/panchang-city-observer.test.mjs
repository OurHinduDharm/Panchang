import test from "node:test";
import assert from "node:assert/strict";
import {resolveCityObserver} from "../panchang-city-observer.mjs";
import {matchNearestPlace} from "../annual-tara-place-search.mjs";

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

test("Hindi alias resolves one GeoNames city profile", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      states: {"39": "Uttarakhand"},
      districts: {"39.01": "Haridwar"},
      cities: [
        [900001, "Haridwar", "39", "01", 29.9457, 78.1642, 314, ["हरिद्वार"]],
        [900002, "Haridwar", "39", "01", 22.5, 75.5, 999, ["हरिद्वार"]]
      ]
    })
  });
  try {
    const selected = await resolveCityObserver({
      city: "हरिद्वार", lat: 29.9456, lon: 78.1641,
      elevation: 0, elevationStatus: "unknown"
    });
    assert.equal(selected.elevation, 314);
    assert.equal(selected.cityId, 900001);
    assert.equal(selected.elevationStatus, "estimated");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("annual Tara city presets retain identical heights in daily Panchang", async () => {
  for (const [city, lat, lon, height] of [
    ["अल्मोड़ा", 29.59713, 79.65911, 1600],
    ["रामनगर", 29.3925, 79.1283, 364],
    ["देहरादून", 30.3165, 78.0322, 640],
    ["नई दिल्ली", 28.6139, 77.2090, 216]
  ]) {
    const selected = await resolveCityObserver({
      city, lat, lon, elevation: 0, elevationStatus: "unknown"
    });
    assert.equal(selected.elevation, height, city);
    assert.equal(selected.elevationStatus, "provided", city);
  }
});

test("same-name city after first 12 search results resolves by nearby coordinates", () => {
  const cities = Array.from({length: 14}, (_, i) => [
    910000 + i, "Exampletown", "39", "01",
    i === 13 ? 29.5 : 15 + i * 0.1,
    i === 13 ? 79.5 : 70 + i * 0.1,
    i === 13 ? 777 : 200, ["उदाहरणनगर"]
  ]);
  const selected = matchNearestPlace({
    states: {"39": "Uttarakhand"},
    districts: {"39.01": "Example District"},
    cities
  }, "उदाहरणनगर", 29.5001, 79.5001);
  assert.equal(selected.id, 910013);
  assert.equal(selected.elevation, 777);
});
