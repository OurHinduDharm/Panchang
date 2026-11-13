/**
 * City-specific planetary horizon-event series and empirical twilight-threshold
 * crossings. Thresholds must be calibrated from same-city reference records.
 *
 * This is a research candidate generator, not a publication-ready visibility
 * claim. It models the Sun's depression at the planet's local rise/set event.
 */
import { getPlanetVisibilitySample } from "./planetary-heliacal-ephemeris.mjs";

const DAY_MS = 86_400_000;
const ALLOWED_PLANETS = Object.freeze(["Jupiter", "Venus"]);

function asDate(value, label) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError(label + " must be a valid date");
  return date;
}

function validate({ astronomy, planet, observer, start, end }) {
  if (!ALLOWED_PLANETS.includes(planet)) throw new RangeError("planet must be Jupiter or Venus");
  if (!astronomy?.Body?.[planet] || typeof astronomy.SearchRiseSet !== "function") {
    throw new TypeError("Astronomy Engine Body and SearchRiseSet are required");
  }
  if (!observer || !Number.isFinite(Number(observer.latitude)) ||
      !Number.isFinite(Number(observer.longitude)) || !Number.isFinite(Number(observer.height))) {
    throw new TypeError("A complete city observer is required");
  }
  const rangeStart = asDate(start, "start");
  const rangeEnd = asDate(end, "end");
  if (rangeEnd <= rangeStart) throw new RangeError("end must be after start");
  return { rangeStart, rangeEnd };
}

function utcMidnight(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Enumerates the planet's actual local rise and set events for one observer.
 * Astronomy Engine corrects the apparent horizon event for standard refraction.
 */
export function scanPlanetHorizonEvents({ astronomy, planet, observer, start, end }) {
  const { rangeStart, rangeEnd } = validate({ astronomy, planet, observer, start, end });
  const body = astronomy.Body[planet];
  const events = [];
  const first = utcMidnight(rangeStart);
  const last = utcMidnight(rangeEnd);

  for (let day = first.getTime(); day <= last.getTime(); day += DAY_MS) {
    const dayStart = new Date(day);
    for (const direction of [1, -1]) {
      const event = astronomy.SearchRiseSet(body, observer, direction, dayStart, 1.1);
      const instant = event?.date instanceof Date ? event.date : null;
      if (!instant || instant < rangeStart || instant > rangeEnd) continue;
      const sample = getPlanetVisibilitySample({
        astronomy, planet, observer, instant
      });
      events.push(Object.freeze({
        type: direction > 0 ? "rise" : "set",
        instant: instant.toISOString(),
        sunAltitudeDeg: sample.sunAltitudeDeg,
        sunDepressionDeg: -sample.sunAltitudeDeg,
        planetAltitudeDeg: sample.objectAltitudeDeg,
        apparentMagnitude: sample.apparentMagnitude
      }));
    }
  }

  events.sort((a, b) => a.instant.localeCompare(b.instant));
  const unique = events.filter((event, index) =>
    index === 0 || event.instant !== events[index - 1].instant
  );
  return Object.freeze({
    modelId: "astronomy-engine-city-planet-horizon-series-v1",
    planet,
    observer: Object.freeze({
      latitude: Number(observer.latitude),
      longitude: Number(observer.longitude),
      elevationMeters: Number(observer.height)
    }),
    range: Object.freeze({
      start: rangeStart.toISOString(),
      end: rangeEnd.toISOString()
    }),
    events: Object.freeze(unique),
    publicationEligible: false
  });
}

/**
 * Finds when the Sun's depression at a given planet rise/set event crosses an
 * empirically calibrated threshold. Linear interpolation is a candidate
 * estimate; production use must refine and validate the crossing.
 */
export function findHorizonTwilightThresholdCrossings({
  horizonSeries, thresholdDepressionDeg, eventType
}) {
  if (!horizonSeries || !Array.isArray(horizonSeries.events)) {
    throw new TypeError("A horizon event series is required");
  }
  if (!Number.isFinite(thresholdDepressionDeg) || thresholdDepressionDeg <= 0 || thresholdDepressionDeg >= 30) {
    throw new RangeError("thresholdDepressionDeg must be between 0 and 30");
  }
  if (eventType !== undefined && !["rise", "set"].includes(eventType)) {
    throw new RangeError("eventType must be rise or set");
  }

  const types = eventType ? [eventType] : ["rise", "set"];
  const candidates = [];
  for (const type of types) {
    const series = horizonSeries.events.filter(event => event.type === type);
    for (let index = 1; index < series.length; index++) {
      const previous = series[index - 1];
      const current = series[index];
      const a = previous.sunDepressionDeg - thresholdDepressionDeg;
      const b = current.sunDepressionDeg - thresholdDepressionDeg;
      if (a === 0) {
        candidates.push({ type, instant: previous.instant, thresholdDepressionDeg, interpolation: "exact-sample" });
      } else if (a * b < 0) {
        const fraction = (thresholdDepressionDeg - previous.sunDepressionDeg) /
          (current.sunDepressionDeg - previous.sunDepressionDeg);
        const instantMs = Date.parse(previous.instant) +
          fraction * (Date.parse(current.instant) - Date.parse(previous.instant));
        candidates.push({
          type,
          instant: new Date(instantMs).toISOString(),
          thresholdDepressionDeg,
          interpolation: "linear-between-adjacent-daily-horizon-events",
          bracket: [previous.instant, current.instant],
          bracketDepressionDeg: [previous.sunDepressionDeg, current.sunDepressionDeg]
        });
      }
    }
  }
  candidates.sort((a, b) => a.instant.localeCompare(b.instant));
  return Object.freeze(candidates.map(candidate => Object.freeze(candidate)));
}
