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
export function createTaraContextFromPanchangLocation(selectedLocation, Observer, year) {
  if (!selectedLocation) throw new Error("Select a Panchang location before calculating Tara events");
  return createTaraAstronomyContext({location:selectedLocation,Observer,year});
}
