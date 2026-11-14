import test from "node:test";
import assert from "node:assert/strict";
import {
  CITY_LOCATION_CONFIG, PITTHORAGARH_REFERENCE_PROFILE, normalizeCoordinates,
  getCityElevation, searchIndianCities, createCityObserverProfile, clearCityElevationCache
} from "../planetary-city-location.mjs";

test("coordinate validation rejects invalid latitude and longitude", () => {
  assert.deepEqual(normalizeCoordinates("29.58", "80.21"), { latitude: 29.58, longitude: 80.21 });
  assert.throws(() => normalizeCoordinates(91, 80), /Latitude/);
  assert.throws(() => normalizeCoordinates(29, 181), /Longitude/);
});

test("Pithoragarh project reference retains its explicit 1650 m observer height", () => {
  assert.equal(PITTHORAGARH_REFERENCE_PROFILE.elevationMeters, 1650);
  assert.equal(PITTHORAGARH_REFERENCE_PROFILE.latitude, 29.5828);
  assert.equal(PITTHORAGARH_REFERENCE_PROFILE.longitude, 80.2182);
  assert.equal(PITTHORAGARH_REFERENCE_PROFILE.timeZone, "Asia/Kolkata");
});

test("city search restricts results to India and returns numeric coordinates", async () => {
  let requestedUrl = "";
  const fetchImpl = async url => {
    requestedUrl = url;
    return { ok: true, json: async () => [
      { lat: "28.6139", lon: "77.2090", name: "नई दिल्ली", display_name: "नई दिल्ली, भारत",
        address: { city: "नई दिल्ली", state: "दिल्ली", country_code: "in" } },
      { lat: "51.5", lon: "-0.1", name: "London", address: { city: "London", country_code: "gb" } }
    ] };
  };
  const places = await searchIndianCities("दिल्ली", { fetchImpl });
  assert.match(requestedUrl, /countrycodes=in/);
  assert.equal(places.length, 1);
  assert.equal(places[0].city, "नई दिल्ली");
  assert.equal(places[0].latitude, 28.6139);
  assert.equal(places[0].timeZone, CITY_LOCATION_CONFIG.timeZone);
});

test("elevation is fetched once per coordinate and cached in memory", async () => {
  clearCityElevationCache();
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return { ok: true, json: async () => ({ elevation: [216.7] }) };
  };
  const first = await getCityElevation(28.6139, 77.2090, { fetchImpl });
  const second = await getCityElevation(28.6139, 77.2090, { fetchImpl });
  assert.equal(first, 217);
  assert.equal(second, 217);
  assert.equal(calls, 1);
});

test("observer profile carries city-specific coordinates, DEM provenance and timezone", async () => {
  clearCityElevationCache();
  const profile = await createCityObserverProfile({
    id: "jaipur-rajasthan", name: "जयपुर, राजस्थान, भारत", city: "जयपुर",
    state: "राजस्थान", latitude: 26.9124, longitude: 75.7873, timeZone: "Asia/Kolkata"
  }, {
    fetchImpl: async () => ({ ok: true, json: async () => ({ elevation: [431] }) })
  });
  assert.equal(profile.city, "जयपुर");
  assert.equal(profile.elevationMeters, 431);
  assert.equal(profile.elevationExact, false);
  assert.equal(profile.elevationResolutionMeters, 90);
  assert.equal(profile.profileVersion, 1);
});

test("missing elevation is an error, never silently replaced with zero", async () => {
  clearCityElevationCache();
  await assert.rejects(
    getCityElevation(28.6, 77.2, { fetchImpl: async () => ({ ok: true, json: async () => ({ elevation: [] }) }) }),
    /Elevation data unavailable/
  );
});
