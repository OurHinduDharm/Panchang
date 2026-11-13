const PROFILE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertFiniteRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(label + " must be between " + min + " and " + max);
  }
}

export function validateObserverProfile(profile) {
  if (!profile || typeof profile !== "object") {
    throw new TypeError("A location profile is required");
  }
  if (typeof profile.id !== "string" || !PROFILE_ID_PATTERN.test(profile.id)) {
    throw new TypeError("profile.id must be a stable lowercase hyphenated identifier");
  }
  if (typeof profile.name !== "string" || !profile.name.trim()) {
    throw new TypeError("profile.name is required");
  }
  assertFiniteRange(profile.latitude, -90, 90, "latitude");
  assertFiniteRange(profile.longitude, -180, 180, "longitude");
  assertFiniteRange(profile.elevationMeters, -500, 100000, "elevationMeters");
  if (typeof profile.timeZone !== "string" || !profile.timeZone.trim()) {
    throw new TypeError("profile.timeZone is required");
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: profile.timeZone }).format(new Date(0));
  } catch {
    throw new RangeError("profile.timeZone must be a valid IANA time-zone identifier");
  }
  return Object.freeze({
    ...profile,
    name: profile.name.trim(),
    observer: Object.freeze({
      latitude: profile.latitude,
      longitude: profile.longitude,
      height: profile.elevationMeters
    })
  });
}

export function validateObserverProfileDataset(dataset) {
  if (!dataset || dataset.schemaVersion !== 1 || !Array.isArray(dataset.profiles)) {
    throw new TypeError("Unsupported observer profile dataset");
  }
  const ids = new Set();
  const profiles = dataset.profiles.map(profile => {
    const valid = validateObserverProfile(profile);
    if (ids.has(valid.id)) throw new RangeError("Duplicate observer profile id: " + valid.id);
    ids.add(valid.id);
    return valid;
  });
  return Object.freeze(profiles);
}

export function findObserverProfile(dataset, id) {
  if (typeof id !== "string" || !id.trim()) return null;
  const profiles = validateObserverProfileDataset(dataset);
  return profiles.find(profile => profile.id === id) ?? null;
}

/**
 * Builds an ephemeral user-selected location profile.
 * It is intentionally not persisted or silently substituted for a named city.
 */
export function createCustomObserverProfile({
  latitude,
  longitude,
  elevationMeters,
  timeZone,
  name = "चयनित स्थान"
}) {
  return validateObserverProfile({
    id: "custom-location",
    name,
    latitude,
    longitude,
    elevationMeters,
    timeZone,
    coordinateSource: "user-input",
    elevationSource: "user-input",
    status: "custom"
  });
}
