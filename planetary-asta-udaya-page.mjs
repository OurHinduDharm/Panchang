const SOURCE_CITY = "Pithoragarh, Uttarakhand, India";
const SOURCE_STATUS = "direct-page-captured-browser-verified";
const TIME_ZONE = "Asia/Kolkata";

// Public annual Tara Asta/Udaya page is intentionally limited to the
// two high-demand muhurta planets. Other planetary research stays internal.
export const PLANET_ORDER = Object.freeze([
  { key: "Jupiter", name: "गुरु" },
  { key: "Venus", name: "शुक्र" }
]);

function validLocalDateTime(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function validBoundary(value) {
  return typeof value?.normalizedLocalDateTime === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/.test(value.normalizedLocalDateTime) &&
    Number.isFinite(Date.parse(value.normalizedLocalDateTime));
}

/**
 * Returns accepted Pithoragarh source windows and only explicitly accepted
 * local calculation records. Candidate calculations stay research-only.
 */
export function getPithoragarhAnnualWindows(dataset, sourceYear, calculatedDataset = null) {
  if (!dataset || !Array.isArray(dataset.windows)) {
    throw new TypeError("A planetary reference dataset with windows is required");
  }
  if (!Number.isInteger(sourceYear)) {
    throw new TypeError("sourceYear must be an integer");
  }

  const published = dataset.windows
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
    }));

  const calculatedLocationMatches =
    calculatedDataset?.location?.name === SOURCE_CITY &&
    calculatedDataset.location.latitude === 29.5828 &&
    calculatedDataset.location.longitude === 80.2182 &&
    calculatedDataset.location.elevationMeters === 1650 &&
    calculatedDataset.location.timeZone === TIME_ZONE &&
    calculatedDataset?.calculation?.modelId === "local-twilight-threshold-v1";

  const calculated = calculatedLocationMatches && Array.isArray(calculatedDataset.windows)
    ? calculatedDataset.windows
      .filter(entry =>
        entry.year === sourceYear &&
        entry.status === "calculated" &&
        entry.acceptanceEligible === true &&
        entry.publicationStatus === "accepted" &&
        PLANET_ORDER.some(planet => planet.key === entry.planet) &&
        validLocalDateTime(entry.astaStart) &&
        validLocalDateTime(entry.udaya) &&
        Date.parse(entry.udaya) > Date.parse(entry.astaStart)
      )
      .map(entry => ({
        id: entry.id,
        planet: entry.planet,
        sourceYear: entry.year,
        astaStart: entry.astaStart,
        udaya: entry.udaya
      }))
    : [];

  return [...published, ...calculated].sort((a, b) =>
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
