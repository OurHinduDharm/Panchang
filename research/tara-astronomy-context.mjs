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
  const {observer, elevationSourceApproximate} = resolveTaraLocation(selectedLocation);
  const context = createTaraAstronomyContext({ location: observer, Observer, year });
  return Object.freeze({...context, elevationSourceApproximate});
}

export function resolveTaraLocation(selectedLocation) {
  if (!selectedLocation || typeof selectedLocation !== "object" || Array.isArray(selectedLocation)) {
    throw new Error("Select a city with coordinates and elevation before calculating Tara events");
  }
  const latitude = numericField(selectedLocation.lat ?? selectedLocation.latitude);
  const longitude = numericField(selectedLocation.lon ?? selectedLocation.longitude);
  const elevation = numericField(selectedLocation.elevation);
  if (!Number.isFinite(elevation)) {
    throw new Error("Selected city elevation is missing; repair the city profile instead of using a fallback");
  }
  const observer = requireTaraElevation({
    latitude, longitude, elevation, name: selectedLocation.name
  });
  return {
    observer,
    elevationSourceApproximate: selectedLocation.elevationStatus === "estimated"
  };
}

function numericField(value) {
  if (typeof value === "number") return value;
  return typeof value === "string" && value.trim() ? Number(value) : NaN;
}
