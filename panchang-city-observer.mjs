import {searchTaraPlaces} from "./annual-tara-place-search.mjs";
import {locations} from "./annual-tara-locations.mjs";

const norm = value => String(value || "").normalize("NFC").trim().toLocaleLowerCase();
const distanceKm = (a, b) => {
  const lat = (a.lat + b.latitude) / 2 * Math.PI / 180;
  return Math.hypot((a.lat - b.latitude) * 111.2,
    (a.lon - b.longitude) * 111.2 * Math.cos(lat));
};

/** Resolve one stable city observer from the existing GeoNames city index.
 * Never pretend an unmatched OSM coordinate has a known elevation.
 */
export async function resolveCityObserver(location) {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lon)) return location;
  const city = norm(location.city);
  if (!city) return location;
  const canonical = locations["pithoragarh-project-target"];
  if (["पिथौरागढ़", "पिथौरागढ", "pithoragarh"].includes(city) &&
      distanceKm(location, canonical) <= 3) {
    return {...location, lat: canonical.latitude, lon: canonical.longitude,
      elevation: canonical.elevation, elevationStatus: "provided",
      elevationSource: "OurHinduDharm canonical city profile"};
  }
  try {
    const candidates = await searchTaraPlaces(location.city);
    const matches = candidates.filter(place =>
      [place.city, ...place.name.split(",").slice(0, 1)].some(name => norm(name) === city) &&
      distanceKm(location, place) <= 10 &&
      Number.isFinite(place.elevation));
    matches.sort((a, b) => distanceKm(location, a) - distanceKm(location, b));
    if (!matches.length) return location;
    const place = matches[0];
    return {...location, lat: place.latitude, lon: place.longitude,
      elevation: place.elevation, elevationStatus: place.elevationStatus,
      elevationSource: place.elevationSource, cityId: place.id};
  } catch {
    return location;
  }
}
