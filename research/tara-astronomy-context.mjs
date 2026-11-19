import { requireTaraElevation, taraObserverKey } from "./tara-location-observer.mjs";

/**
 * Connect the shared Panchang observer to Astronomy Engine without bundling
 * another astronomy library. Caller injects its existing Observer constructor.
 * Does not equate geometric rise/set with heliacal visibility.
 */
export function createTaraAstronomyContext({ location, Observer, year }) {
  const observer = requireTaraElevation(location);
  if (typeof Observer !== "function") throw new TypeError("Astronomy Engine Observer constructor required");
  if (!Number.isInteger(year) || year < 1600 || year > 2500) throw new RangeError("Invalid calculation year");
  return Object.freeze({
    observer,
    astronomyObserver: new Observer(observer.latitude, observer.longitude, observer.elevation),
    year,
    cacheKey: `tara:v1:${year}:${taraObserverKey(observer)}`
  });
}

/**
 * Consume the existing location selection; no city lookup or silent fallback.
 * The caller owns persistence and supplies the already-selected location.
 */
export function createTaraContextFromPanchangLocation(selectedLocation, Observer, year, options = {}) {
  if (!selectedLocation) throw new Error("Select a Panchang location before calculating Tara events");
  // The existing Panchang stores lat/lon, not latitude/longitude.
  const latitude = selectedLocation.lat ?? selectedLocation.latitude;
  const longitude = selectedLocation.lon ?? selectedLocation.longitude;
  const rawElevation = selectedLocation.elevation;
  const hasElevation = rawElevation !== null && rawElevation !== undefined && rawElevation !== "";
  if (!hasElevation && options.allowSeaLevelApproximation !== true) {
    throw new Error("Elevation unavailable; explicitly opt in to sea-level approximation");
  }
  const elevation = hasElevation ? Number(rawElevation) : 0;
  const context = createTaraAstronomyContext({
    location: {latitude: Number(latitude), longitude: Number(longitude), elevation, name:selectedLocation.name},
    Observer, year
  });
  return Object.freeze({
    ...context,
    elevationApproximate: !hasElevation
  });
}
