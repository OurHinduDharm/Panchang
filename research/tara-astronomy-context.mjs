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
  const {observer, elevationApproximate} = resolveTaraLocation(selectedLocation, options);
  const context = createTaraAstronomyContext({ location: observer, Observer, year });
  return Object.freeze({...context, elevationApproximate});
}

export function resolveTaraLocation(selectedLocation, options = {}) {
  if (!selectedLocation || typeof selectedLocation !== "object" || Array.isArray(selectedLocation)) throw new Error("Select a Panchang location before calculating Tara events");
  const latitude = numericField(selectedLocation.lat ?? selectedLocation.latitude);
  const longitude = numericField(selectedLocation.lon ?? selectedLocation.longitude);
  const rawElevation = selectedLocation.elevation;
  const elevation = numericField(rawElevation);
  // Historical app.js selections store a placeholder zero for missing altitudes.
  const legacyZero = ("lat" in selectedLocation || "lon" in selectedLocation) &&
    elevation === 0 && selectedLocation.elevationStatus !== "provided";
  const missing = rawElevation == null || (typeof rawElevation === "string" && !rawElevation.trim()) ||
    selectedLocation.elevationStatus === "unknown" || legacyZero;
  if (missing && options.allowSeaLevelApproximation !== true) {
    throw new Error("Elevation unavailable; explicitly opt in to sea-level approximation");
  }
  const observer = requireTaraElevation({
    latitude, longitude, elevation: missing ? 0 : elevation, name: selectedLocation.name
  });
  return {observer, elevationApproximate: missing};
}

function numericField(value) {
  if (typeof value === "number") return value;
  return typeof value === "string" && value.trim() ? Number(value) : NaN;
}
