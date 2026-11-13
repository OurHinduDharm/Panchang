/**
 * Research-only conjunction association for Guru/Shukra visibility candidates.
 *
 * Astronomy Engine convention:
 * - Jupiter: 180° is conjunction (0° is opposition).
 * - Venus: 0° is inferior conjunction; 180° is superior conjunction.
 * Candidate dates are annotated, never auto-approved or silently discarded.
 */
const DAY_MS = 86_400_000;
const TARGETS = Object.freeze({
  Jupiter: Object.freeze([{ targetRelLon: 180, kind: "conjunction" }]),
  Venus: Object.freeze([
    { targetRelLon: 0, kind: "inferior-conjunction" },
    { targetRelLon: 180, kind: "superior-conjunction" }
  ])
});

function validDate(value, label) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError(label + " must be a valid date");
  return date;
}

function eventDate(event) {
  const value = event?.date instanceof Date ? event.date : event?.date ?? event;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

/** Enumerate conjunctions in [start, end), using Astronomy Engine's own event search. */
export function findPlanetConjunctions({ astronomy, planet, start, end }) {
  if (!TARGETS[planet]) throw new RangeError("planet must be Jupiter or Venus");
  if (typeof astronomy?.SearchRelativeLongitude !== "function" || !astronomy?.Body?.[planet]) {
    throw new TypeError("Astronomy Engine SearchRelativeLongitude and planet Body are required");
  }
  const rangeStart = validDate(start, "start");
  const rangeEnd = validDate(end, "end");
  if (rangeEnd <= rangeStart) throw new RangeError("end must be after start");

  const events = [];
  for (const target of TARGETS[planet]) {
    let cursor = rangeStart;
    for (let guard = 0; guard < 20; guard++) {
      const found = eventDate(astronomy.SearchRelativeLongitude(
        astronomy.Body[planet], target.targetRelLon, cursor
      ));
      if (!found || found >= rangeEnd) break;
      if (found >= rangeStart) {
        events.push(Object.freeze({
          kind: target.kind,
          targetRelLon: target.targetRelLon,
          instant: found.toISOString()
        }));
      }
      cursor = new Date(found.getTime() + 60_000);
    }
  }
  events.sort((a, b) => a.instant.localeCompare(b.instant));
  return Object.freeze(events.filter((event, index) =>
    index === 0 || event.instant !== events[index - 1].instant
  ));
}

/**
 * Attach the nearest conjunction to each raw boundary candidate.
 * signedDaysFromConjunction > 0 means the candidate is after conjunction.
 */
export function associateCandidatesWithConjunctions({ candidates, conjunctions, maxDistanceDays = 180 }) {
  if (!Array.isArray(candidates) || !Array.isArray(conjunctions)) {
    throw new TypeError("candidate and conjunction arrays are required");
  }
  if (!Number.isFinite(maxDistanceDays) || maxDistanceDays <= 0) {
    throw new RangeError("maxDistanceDays must be positive");
  }
  const parsed = conjunctions.map(event => ({
    ...event,
    ms: Date.parse(event.instant)
  })).filter(event => Number.isFinite(event.ms));

  return Object.freeze(candidates.map(candidate => {
    const candidateMs = Date.parse(candidate.instant);
    if (!Number.isFinite(candidateMs)) {
      return Object.freeze({ ...candidate, conjunctionAssociation: null });
    }
    const nearest = parsed.map(event => ({
      event,
      signedDays: (candidateMs - event.ms) / DAY_MS
    })).sort((a, b) => Math.abs(a.signedDays) - Math.abs(b.signedDays))[0];
    const withinRange = nearest && Math.abs(nearest.signedDays) <= maxDistanceDays;
    return Object.freeze({
      ...candidate,
      conjunctionAssociation: withinRange ? Object.freeze({
        kind: nearest.event.kind,
        instant: nearest.event.instant,
        signedDaysFromConjunction: Number(nearest.signedDays.toFixed(3)),
        side: nearest.signedDays < 0 ? "before" : "after"
      }) : null
    });
  }));
}
