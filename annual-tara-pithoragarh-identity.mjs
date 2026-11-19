import { locations } from "./annual-tara-locations.mjs";

const canonical = locations["pithoragarh-project-target"];

function hasCityIdentity(place) {
  return place?.id === canonical.id && place.countryCode === "IN" &&
    place.stateCode === "39" && place.timeZone === "Asia/Kolkata";
}

export function isProjectPithoragarh(place) {
  return hasCityIdentity(place) && place.latitude === canonical.latitude &&
    place.longitude === canonical.longitude && place.elevation === canonical.elevation;
}

export function resolvePithoragarhSearch(place) {
  if (!hasCityIdentity(place) || !Number.isFinite(place.latitude) ||
      !Number.isFinite(place.longitude)) return null;
  const km = Math.hypot((place.latitude - canonical.latitude) * 111,
    (place.longitude - canonical.longitude) * 96);
  return km <= 3 ? canonical : null;
}
