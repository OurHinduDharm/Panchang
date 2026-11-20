/**
 * Preserve the provenance of a saved observer height.
 * A numeric fallback must not turn an explicitly unknown elevation into a verified one.
 */
export function restoreSavedElevationStatus(location, saved) {
  if (!location) return null;
  // Preserve the observer's origin: a GPS point must never become a city center
  // merely because its saved coordinates also carry a reverse-geocoded city name.
  const restored = saved?.observerSource === "gps"
    ? {...location, observerSource: "gps"}
    : location;
  const status = saved?.elevationStatus;
  if (status === "unknown" || saved?.elevation == null || saved.elevation === "" ||
      (status != null && !["provided", "estimated"].includes(status))) {
    return {...restored, elevation: 0, elevationStatus: "unknown"};
  }
  if (status === "estimated") {
    return {...restored, elevationStatus: "estimated"};
  }
  if (status === "provided") return restored;
  if (!Number(saved.elevation)) {
    return {...location, elevation: 0, elevationStatus: "unknown"};
  }
  return location;
}
