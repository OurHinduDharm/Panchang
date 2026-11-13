const SOURCE_CITY = "Pithoragarh, Uttarakhand, India";
const SOURCE_STATUS = "direct-page-captured-browser-verified";
const TIME_ZONE = "Asia/Kolkata";

// Public annual Tara Asta/Udaya page is intentionally limited to the
// two high-demand muhurta planets. Other planetary research stays internal.
export const PLANET_ORDER = Object.freeze([
  { key: "Jupiter", name: "गुरु" },
  { key: "Venus", name: "शुक्र" }
]);

function validBoundary(value) {
  return typeof value?.normalizedLocalDateTime === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/.test(value.normalizedLocalDateTime) &&
    Number.isFinite(Date.parse(value.normalizedLocalDateTime));
}

/**
 * Returns only directly captured Pithoragarh city-reference windows.
 * This is a published-reference listing, not a coordinate-exact prediction.
 */
export function getPithoragarhAnnualWindows(dataset, sourceYear) {
  if (!dataset || !Array.isArray(dataset.windows)) {
    throw new TypeError("A planetary reference dataset with windows is required");
  }
  if (!Number.isInteger(sourceYear)) {
    throw new TypeError("sourceYear must be an integer");
  }

  return dataset.windows
    .filter(entry =>
      entry.sourceLocation === SOURCE_CITY &&
      entry.sourcePageYear === sourceYear &&
      entry.sourceStatus === SOURCE_STATUS &&
      entry.acceptanceEligible === true &&
      entry.comparisonLevel === "city-label-only" &&
      entry.strictCoordinateAcceptanceEligible !== true &&
      PLANET_ORDER.some(planet => planet.key === entry.planet) &&
      validBoundary(entry.boundaries?.astaStart) &&
      validBoundary(entry.boundaries?.astaEnd) &&
      Date.parse(entry.boundaries.astaEnd.normalizedLocalDateTime) >
        Date.parse(entry.boundaries.astaStart.normalizedLocalDateTime)
    )
    .map(entry => ({
      id: entry.id,
      planet: entry.planet,
      sourceYear: entry.sourcePageYear,
      astaStart: entry.boundaries.astaStart.normalizedLocalDateTime,
      udaya: entry.boundaries.astaEnd.normalizedLocalDateTime
    }))
    .sort((a, b) =>
      Date.parse(a.astaStart) - Date.parse(b.astaStart) ||
      PLANET_ORDER.findIndex(p => p.key === a.planet) -
        PLANET_ORDER.findIndex(p => p.key === b.planet)
    );
}

export function formatPithoragarhBoundary(value) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return "—";
  const instant = new Date(value);
  const date = new Intl.DateTimeFormat("hi-IN", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(instant);
  const time = new Intl.DateTimeFormat("hi-IN", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(instant);
  return date + " · " + time;
}
