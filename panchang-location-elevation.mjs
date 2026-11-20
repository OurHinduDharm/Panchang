/**
 * Preserve the provenance of a saved observer height.
 * A numeric fallback must not turn an explicitly unknown elevation into a verified one.
 */
export function restoreSavedElevationStatus(location, saved) {
  if (!location) return null;
  const status = saved?.elevationStatus;
  if (status === "unknown" || saved?.elevation == null || saved.elevation === "" ||
      (status != null && !["provided", "estimated"].includes(status))) {
    return {...location, elevation: 0, elevationStatus: "unknown"};
  }
  if (status === "estimated") {
    return {...location, elevationStatus: "estimated"};
  }
  if (status === "provided") return location;
  if (!Number(saved.elevation)) {
    return {...location, elevation: 0, elevationStatus: "unknown"};
  }
  return location;
}
