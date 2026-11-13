/**
 * City-level observer profiles for Guru, Shukra and Agastya calculations.
 * Geocoding: OpenStreetMap Nominatim (India-only search).
 * Elevation: Open-Meteo Elevation API (Copernicus DEM).
 * No location is written to localStorage/cookies. Callers own session state.
 */
export const CITY_LOCATION_CONFIG = Object.freeze({
  countryCode: "in",
  timeZone: "Asia/Kolkata",
  elevationProvider: "Open-Meteo / Copernicus DEM",
  elevationResolutionMeters: 90
});

export const PITTHORAGARH_REFERENCE_PROFILE = Object.freeze({
  id: "pithoragarh-uttarakhand-in",
  name: "पिथौरागढ़, उत्तराखंड, भारत",
  city: "पिथौरागढ़",
  state: "उत्तराखंड",
  country: "भारत",
  countryCode: "in",
  latitude: 29.5828,
  longitude: 80.2182,
  elevationMeters: 1650,
  timeZone: "Asia/Kolkata",
  elevationSource: "manually-verified-project-reference",
  elevationExact: false
});

const elevationCache = new Map();

function assertCoordinate(value, min, max, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new RangeError(label + " is outside its valid range");
  }
  return number;
}

export function normalizeCoordinates(latitude, longitude) {
  return Object.freeze({
    latitude: assertCoordinate(latitude, -90, 90, "Latitude"),
    longitude: assertCoordinate(longitude, -180, 180, "Longitude")
  });
}

export async function getCityElevation(latitude, longitude, options = {}) {
  const coordinates = normalizeCoordinates(latitude, longitude);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new TypeError("A Fetch implementation is required");
  const cacheKey = coordinates.latitude.toFixed(5) + "|" + coordinates.longitude.toFixed(5);
  if (!options.bypassCache && elevationCache.has(cacheKey)) return elevationCache.get(cacheKey);

  const url = new URL("https://api.open-meteo.com/v1/elevation");
  url.searchParams.set("latitude", String(coordinates.latitude));
  url.searchParams.set("longitude", String(coordinates.longitude));
  const response = await fetchImpl(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Elevation_HTTP_" + response.status);
  const data = await response.json();
  const elevation = Array.isArray(data.elevation) ? Number(data.elevation[0]) : NaN;
  if (!Number.isFinite(elevation) || elevation < -500 || elevation > 9000) {
    throw new Error("Elevation data unavailable or invalid");
  }
  const rounded = Math.round(elevation);
  elevationCache.set(cacheKey, rounded);
  return rounded;
}

export async function searchIndianCities(query, options = {}) {
  const normalizedQuery = String(query || "").trim();
  if (normalizedQuery.length < 2) throw new TypeError("Enter at least two characters for a city search");
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new TypeError("A Fetch implementation is required");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(Math.min(8, Math.max(1, Number(options.limit) || 5))));
  url.searchParams.set("countrycodes", CITY_LOCATION_CONFIG.countryCode);
  url.searchParams.set("accept-language", "hi");
  url.searchParams.set("q", normalizedQuery);

  const response = await fetchImpl(url.toString(), { headers: { Accept: "application/json" }, signal: options.signal });
  if (!response.ok) throw new Error("Geocoding_HTTP_" + response.status);
  const places = await response.json();
  if (!Array.isArray(places)) throw new Error("Invalid geocoding response");

  return places.flatMap(place => {
    try {
      const coordinates = normalizeCoordinates(place.lat, place.lon);
      const address = place.address || {};
      const countryCode = String(address.country_code || "in").toLowerCase();
      if (countryCode !== "in") return [];
      const city = address.city || address.town || address.village ||
        address.municipality || address.county || place.name || normalizedQuery;
      const state = address.state || address.state_district || "";
      const stableText = [city, state, coordinates.latitude.toFixed(4), coordinates.longitude.toFixed(4)].join("|");
      return [{
        id: "osm-" + stableText.toLowerCase().replace(/[^a-z0-9|.-]/g, "-"),
        name: place.display_name || [city, state, "भारत"].filter(Boolean).join(", "),
        city,
        state,
        country: "भारत",
        countryCode: "in",
        ...coordinates,
        timeZone: CITY_LOCATION_CONFIG.timeZone,
        geocodingSource: "OpenStreetMap Nominatim"
      }];
    } catch {
      return [];
    }
  });
}

export async function createCityObserverProfile(place, options = {}) {
  if (!place || typeof place !== "object") throw new TypeError("A selected city result is required");
  const coordinates = normalizeCoordinates(place.latitude, place.longitude);
  const elevationMeters = await getCityElevation(coordinates.latitude, coordinates.longitude, options);
  return Object.freeze({
    id: String(place.id || "city-" + coordinates.latitude.toFixed(4) + "-" + coordinates.longitude.toFixed(4)),
    name: String(place.name || place.city || "चुना हुआ शहर"),
    city: String(place.city || place.name || ""),
    state: String(place.state || ""),
    country: String(place.country || "भारत"),
    countryCode: String(place.countryCode || "in").toLowerCase(),
    ...coordinates,
    elevationMeters,
    timeZone: place.timeZone || CITY_LOCATION_CONFIG.timeZone,
    geocodingSource: place.geocodingSource || "user-selected-coordinates",
    elevationSource: CITY_LOCATION_CONFIG.elevationProvider,
    elevationResolutionMeters: CITY_LOCATION_CONFIG.elevationResolutionMeters,
    elevationExact: false,
    profileVersion: 1
  });
}

export function clearCityElevationCache() {
  elevationCache.clear();
}
