/**
 * Location contract for offline Guru/Shukra/Agastya calculations.
 * No default city, nearest-city substitution or fabricated elevation.
 * This module does not itself calculate heliacal events.
 */
export function normalizeTaraObserver(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Observer must be an object");
  }
  const { latitude, longitude, elevation } = input;
  if (typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError("Invalid latitude");
  }
  if (typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError("Invalid longitude");
  }
  if (elevation !== undefined && elevation !== null &&
      (typeof elevation !== "number" || !Number.isFinite(elevation) || elevation < -500 || elevation > 9000)) {
    throw new RangeError("Invalid elevation");
  }
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const observer = {
    latitude, longitude,
    elevation: elevation ?? null,
    elevationStatus: elevation == null ? "unknown" : "provided",
    name: name || null
  };
  return Object.freeze(observer);
}

export function requireTaraElevation(observer) {
  const value = normalizeTaraObserver(observer);
  if (value.elevation === null) {
    throw new Error("Elevation required for this calculation; do not substitute zero");
  }
  return value;
}

export function taraObserverKey(input) {
  const observer = normalizeTaraObserver(input);
  return [observer.latitude.toFixed(6), observer.longitude.toFixed(6),
    observer.elevation === null ? "unknown" : observer.elevation.toFixed(1)].join(":");
}
