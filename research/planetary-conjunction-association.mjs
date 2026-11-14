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

/**
 * Pair research-only Asta/Udaya candidates around actual solar conjunctions.
 * The event direction is essential: a candidate on the wrong branch is rejected.
 */
const EXPECTED_BRANCH = Object.freeze({
  Jupiter: Object.freeze({
    conjunction: Object.freeze({ start: "set", end: "rise" })
  }),
  Venus: Object.freeze({
    "inferior-conjunction": Object.freeze({ start: "set", end: "rise" }),
    "superior-conjunction": Object.freeze({ start: "rise", end: "set" })
  })
});

export function expectedBoundaryEventType(planet, conjunctionKind, boundary) {
  if (!EXPECTED_BRANCH[planet]) throw new RangeError("planet must be Jupiter or Venus");
  if (!["astaStart", "astaEnd"].includes(boundary)) {
    throw new RangeError("boundary must be astaStart or astaEnd");
  }
  const branch = EXPECTED_BRANCH[planet][conjunctionKind];
  if (!branch) return null;
  return boundary === "astaStart" ? branch.start : branch.end;
}

const PAIR_DAY_MS = 86_400_000;

function ms(value) {
  const n = Date.parse(value);
  return Number.isFinite(n) ? n : NaN;
}

function nearestOnSide(candidates, { boundary, type, conjunctionMs, side, maxDays }) {
  return candidates
    .filter(candidate => candidate.boundary === boundary && (candidate.eventType ?? candidate.type) === type)
    .map(candidate => ({ candidate, deltaDays: (ms(candidate.instant) - conjunctionMs) / PAIR_DAY_MS }))
    .filter(item => Number.isFinite(item.deltaDays) &&
      (side === "before" ? item.deltaDays < 0 : item.deltaDays > 0) &&
      Math.abs(item.deltaDays) <= maxDays)
    .sort((a, b) => Math.abs(a.deltaDays) - Math.abs(b.deltaDays))[0] ?? null;
}

/**
 * Returns conjunction-centred windows with strict branch matching.
 * This is a research diagnostic, never publication approval.
 */
export function pairCandidatesAroundConjunctions({
  planet, candidates, conjunctions, maxDistanceDays = 90,
  durationReference = null
}) {
  if (!EXPECTED_BRANCH[planet]) throw new RangeError("planet must be Jupiter or Venus");
  if (!Array.isArray(candidates) || !Array.isArray(conjunctions)) {
    throw new TypeError("candidate and conjunction arrays are required");
  }
  if (!Number.isFinite(maxDistanceDays) || maxDistanceDays <= 0) {
    throw new RangeError("maxDistanceDays must be positive");
  }

  const windows = [];
  const rejected = [];
  for (const conjunction of conjunctions) {
    const conjunctionMs = ms(conjunction.instant);
    const branch = EXPECTED_BRANCH[planet][conjunction.kind];
    if (!Number.isFinite(conjunctionMs) || !branch) continue;
    const start = nearestOnSide(candidates, {
      boundary: "astaStart", type: branch.start,
      conjunctionMs, side: "before", maxDays: maxDistanceDays
    });
    const end = nearestOnSide(candidates, {
      boundary: "astaEnd", type: branch.end,
      conjunctionMs, side: "after", maxDays: maxDistanceDays
    });
    if (start && end && ms(start.candidate.instant) < ms(end.candidate.instant)) {
      windows.push(Object.freeze({
        planet,
        conjunctionKind: conjunction.kind,
        conjunctionInstant: conjunction.instant,
        astaStart: start.candidate.instant,
        udaya: end.candidate.instant,
        astaStartEventType: branch.start,
        udayaEventType: branch.end,
        daysBeforeConjunction: Number(Math.abs(start.deltaDays).toFixed(3)),
        daysAfterConjunction: Number(end.deltaDays.toFixed(3)),
        durationDays: Number(((ms(end.candidate.instant) - ms(start.candidate.instant)) / DAY_MS).toFixed(3)),
        durationPlausibility: (() => {
          // Venus has two physically different conjunction branches. Use the
          // matching same-city event-family reference instead of pooling both.
          // A legacy single reference remains supported for Jupiter/tests.
          const reference = durationReference?.byConjunctionKind &&
            typeof durationReference.byConjunctionKind === "object"
            ? durationReference.byConjunctionKind[conjunction.kind]
            : durationReference?.planet === planet &&
                (!durationReference.conjunctionKind ||
                  durationReference.conjunctionKind === conjunction.kind)
              ? durationReference
              : null;
          if (!reference || reference.planet !== planet ||
              (reference.conjunctionKind && reference.conjunctionKind !== conjunction.kind) ||
              !Number.isFinite(reference.minDays) ||
              !Number.isFinite(reference.maxDays) || reference.minDays < 0 ||
              reference.maxDays < reference.minDays) {
            return Object.freeze({
              status: "not-assessed",
              conjunctionKind: conjunction.kind,
              reason: "No valid same-city historical duration reference for this conjunction branch"
            });
          }
          const withinObservedRange =
            ((ms(end.candidate.instant) - ms(start.candidate.instant)) / DAY_MS) >= reference.minDays &&
            ((ms(end.candidate.instant) - ms(start.candidate.instant)) / DAY_MS) <= reference.maxDays;
          return Object.freeze({
            status: withinObservedRange ? "within-observed-range" : "outside-observed-range-review",
            conjunctionKind: conjunction.kind,
            referenceMinDays: reference.minDays,
            referenceMaxDays: reference.maxDays,
            referenceSampleCount: reference.sampleCount,
            referenceYears: reference.years,
            referenceLocation: reference.location,
            referenceEventTypes: reference.referenceEventTypes ?? null,
            confidence: reference.confidence ?? "unspecified",
            rule: "same-city, same-conjunction-branch duration is a review flag only; it never removes or approves a candidate"
          });
        })(),
        publicationEligible: false
      }));
    } else {
      rejected.push(Object.freeze({
        conjunctionKind: conjunction.kind,
        conjunctionInstant: conjunction.instant,
        missing: Object.freeze([
          ...(!start ? ["astaStart:" + branch.start + ":before"] : []),
          ...(!end ? ["astaEnd:" + branch.end + ":after"] : [])
        ])
      }));
    }
  }
  return Object.freeze({
    planet,
    windows: Object.freeze(windows),
    rejectedConjunctions: Object.freeze(rejected),
    publicationEligible: false,
    rule: "strict conjunction-side and local horizon-event direction; research only"
  });
}
