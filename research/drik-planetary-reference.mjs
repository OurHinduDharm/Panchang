const CITY_ALIASES = [
  { key: "New Delhi, NCT, India", pattern: /new delhi|\bdelhi\b|नई दिल्ली|दिल्ली/i },
  { key: "Mumbai, Maharashtra, India", pattern: /mumbai|मुंबई|बंबई/i },
  { key: "Ujjain, Madhya Pradesh, India", pattern: /ujjain|उज्जैन/i },
  { key: "Varanasi, Uttar Pradesh, India", pattern: /varanasi|वाराणसी|काशी/i },
  { key: "Pithoragarh, Uttarakhand, India", pattern: /pithoragarh|पिथौरागढ़/i }
];

const SUPPORTED_PLANETS = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

function normalizeIsoDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return match[0];
}

function boundaryDate(value) {
  return normalizeIsoDate(value?.normalizedLocalDateTime);
}

export function resolveDrikCity(location) {
  const text = [location?.city, location?.state, location?.name]
    .filter(Boolean).join(" ");
  if (!text) return null;
  return CITY_ALIASES.find(city => city.pattern.test(text))?.key ?? null;
}

/**
 * Returns only directly captured, browser-verified city/year records.
 * This is a published-reference lookup, not an ephemeris prediction.
 */
export function getDrikPlanetaryReference({ dataset, location, selectedDate, planet }) {
  const date = normalizeIsoDate(selectedDate);
  if (!date) return { status: "unavailable", reason: "invalid-date", city: null, window: null };
  if (!SUPPORTED_PLANETS.includes(planet)) {
    return { status: "unavailable", reason: "unsupported-planet", city: null, window: null };
  }
  const city = resolveDrikCity(location);
  if (!city) return { status: "unavailable", reason: "city-not-covered", city: null, window: null };
  if (!dataset || !Array.isArray(dataset.windows)) {
    return { status: "unavailable", reason: "dataset-unavailable", city, window: null };
  }

  const unique = new Map();
  for (const entry of dataset.windows) {
    if (
      entry.sourceLocation !== city ||
      entry.planet !== planet ||
      entry.acceptanceEligible !== true ||
      entry.sourceStatus !== "direct-page-captured-browser-verified"
    ) continue;
    const start = boundaryDate(entry.boundaries?.astaStart);
    const end = boundaryDate(entry.boundaries?.astaEnd);
    const startInstant = entry.boundaries?.astaStart?.normalizedLocalDateTime;
    const endInstant = entry.boundaries?.astaEnd?.normalizedLocalDateTime;
    if (
      !start || !end || end < start ||
      typeof startInstant !== "string" || typeof endInstant !== "string" ||
      !Number.isFinite(Date.parse(startInstant)) ||
      !Number.isFinite(Date.parse(endInstant)) ||
      Date.parse(endInstant) <= Date.parse(startInstant)
    ) continue;
    const key = startInstant + "|" + endInstant;
    if (!unique.has(key)) unique.set(key, entry);
  }

  const windows = [...unique.values()].sort((a, b) =>
    a.boundaries.astaStart.normalizedLocalDateTime.localeCompare(
      b.boundaries.astaStart.normalizedLocalDateTime
    )
  );
  const active = windows.find(entry => {
    const start = boundaryDate(entry.boundaries.astaStart);
    const end = boundaryDate(entry.boundaries.astaEnd);
    return date >= start && date <= end;
  });
  if (active) return { status: "active", reason: null, city, window: active };

  const upcoming = windows.find(entry => boundaryDate(entry.boundaries.astaStart) > date);
  if (upcoming) return { status: "upcoming", reason: null, city, window: upcoming };

  return {
    status: "no-upcoming-reference",
    reason: windows.length ? "outside-captured-date-range" : "no-verified-window-listed",
    city,
    window: null
  };
}

export function formatDrikBoundary(value) {
  const raw = value?.normalizedLocalDateTime;
  if (!raw || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/.test(raw)) return null;
  const instant = new Date(raw);
  if (!Number.isFinite(instant.getTime())) return null;
  const dateText = new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric"
  }).format(instant);
  const timeText = new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true
  }).format(instant);
  return { date: dateText, time: timeText, iso: raw };
}
