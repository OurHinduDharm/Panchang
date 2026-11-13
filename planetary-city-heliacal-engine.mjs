/**
 * End-to-end local twilight-window builder for Guru/Shukra heliacal research.
 *
 * The ephemeris and Schaefer visibility adapter remain research-only.
 * Every result is a candidate; no annual/public dataset is modified here.
 */
import { scanPlanetVisibilityWindow } from "./planetary-heliacal-ephemeris.mjs";

const DAY_MS = 86_400_000;
const ASTRONOMICAL_TWILIGHT_DEG = -18;

function validDate(value, label) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError(label + " must be a valid date");
  return date;
}

function toDate(event) {
  if (!event) return null;
  const value = event.date instanceof Date ? event.date : new Date(event.date || event);
  return Number.isFinite(value.getTime()) ? value : null;
}

function validateInputs(astronomy, observer) {
  if (!astronomy || typeof astronomy.SearchAltitude !== "function" ||
      typeof astronomy.SearchRiseSet !== "function" || !astronomy.Body?.Sun) {
    throw new TypeError("Astronomy Engine SearchAltitude, SearchRiseSet and Body.Sun are required");
  }
  if (!observer || !Number.isFinite(Number(observer.latitude)) ||
      !Number.isFinite(Number(observer.longitude)) || !Number.isFinite(Number(observer.height))) {
    throw new TypeError("A complete city observer is required");
  }
}

function utcMidnight(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function findTwilightDay(astronomy, observer, dayStart) {
  const sun = astronomy.Body.Sun;
  const searchDays = 1.25;
  const dawn = toDate(astronomy.SearchAltitude(sun, observer, +1, dayStart, searchDays, ASTRONOMICAL_TWILIGHT_DEG));
  const sunrise = toDate(astronomy.SearchRiseSet(sun, observer, +1, dayStart, searchDays));
  // Direction selects rising (+1) or setting (-1); positive limitDays searches forward.
  const sunset = toDate(astronomy.SearchRiseSet(sun, observer, -1, dayStart, searchDays));
  const dusk = toDate(astronomy.SearchAltitude(sun, observer, -1, dayStart, searchDays, ASTRONOMICAL_TWILIGHT_DEG));

  const windows = [];
  if (dawn && sunrise && sunrise > dawn) {
    windows.push({ period: "morning", start: dawn, end: sunrise });
  }
  if (sunset && dusk && dusk > sunset) {
    windows.push({ period: "evening", start: sunset, end: dusk });
  }
  return windows;
}

/**
 * Creates morning/evening astronomical-twilight windows for one observer.
 * SearchAltitude uses the Sun's geometric centre at -18 degrees; SearchRiseSet
 * supplies the refracted sunrise/sunset event. Missing polar/daylight events
 * are omitted, never replaced with another date or city.
 */
export function buildLocalTwilightWindows({ astronomy, observer, start, end }) {
  validateInputs(astronomy, observer);
  const rangeStart = validDate(start, "start");
  const rangeEnd = validDate(end, "end");
  if (rangeEnd <= rangeStart) throw new RangeError("end must be after start");

  const windows = [];
  const firstDay = utcMidnight(rangeStart);
  const lastDay = utcMidnight(rangeEnd);
  for (let day = firstDay.getTime(); day <= lastDay.getTime(); day += DAY_MS) {
    const daily = findTwilightDay(astronomy, observer, new Date(day));
    for (const window of daily) {
      const clippedStart = new Date(Math.max(window.start.getTime(), rangeStart.getTime()));
      const clippedEnd = new Date(Math.min(window.end.getTime(), rangeEnd.getTime()));
      if (clippedEnd > clippedStart) {
        windows.push(Object.freeze({
          period: window.period,
          start: clippedStart.toISOString(),
          end: clippedEnd.toISOString(),
          twilightSunAltitudeDeg: ASTRONOMICAL_TWILIGHT_DEG
        }));
      }
    }
  }
  return Object.freeze(windows);
}

/**
 * Classifies all four twilight visibility transitions without conflating
 * morning and evening phases. Inner planets (especially Venus) can use all
 * four across inferior and superior conjunctions.
 */
export function classifyHeliacalTransition(period, crossingType) {
  if (!["morning", "evening"].includes(period)) {
    throw new RangeError("period must be morning or evening");
  }
  if (!["first-visible", "last-visible"].includes(crossingType)) {
    throw new RangeError("crossingType must be first-visible or last-visible");
  }
  const visibilityPhase = period + "-" + crossingType;
  return Object.freeze({
    visibilityPhase,
    type: crossingType === "first-visible" ? "udaya-candidate" : "asta-candidate",
    horizonDirection: period === "morning" ? "east" : "west"
  });
}

/**
 * Scans every local morning/evening twilight window and labels transitions:
 * evening last-visible = Asta candidate; morning first-visible = Udaya candidate.
 * It intentionally reports all transitions for review rather than guessing
 * one continuous Asta interval from unmatched events.
 */
export function calculateCityHeliacalCandidates({
  astronomy, planet, observer, start, end, stepMinutes = 2,
  refineSeconds = 30, visibilityOptions = {}
}) {
  validateInputs(astronomy, observer);
  const windows = buildLocalTwilightWindows({ astronomy, observer, start, end });
  const scans = windows.map(window => {
    const result = scanPlanetVisibilityWindow({
      astronomy, planet, observer,
      start: window.start,
      end: window.end,
      stepMinutes,
      refineSeconds,
      visibilityOptions
    });
    const transitions = result.crossings.map(crossing => {
      const classification = ["first-visible", "last-visible"].includes(crossing.type)
        ? classifyHeliacalTransition(window.period, crossing.type)
        : {
            visibilityPhase: window.period + "-other-transition",
            type: "other-visibility-transition",
            horizonDirection: window.period === "morning" ? "east" : "west"
          };
      return {
        ...classification,
        period: window.period,
        instant: crossing.instant
      };
    });
    return Object.freeze({ window, result, transitions });
  });

  const candidates = scans.flatMap(scan => scan.transitions)
    .sort((a, b) => a.instant.localeCompare(b.instant));
  return Object.freeze({
    modelId: "city-topocentric-schaefer-heliacal-candidate-v1",
    status: candidates.length ? "candidate-events-found" : "no-boundary-crossing-found",
    planet,
    observer: Object.freeze({
      latitude: Number(observer.latitude),
      longitude: Number(observer.longitude),
      elevationMeters: Number(observer.height)
    }),
    range: Object.freeze({
      start: validDate(start, "start").toISOString(),
      end: validDate(end, "end").toISOString()
    }),
    twilightWindows: windows,
    scans,
    candidates,
    publicationEligible: false,
    limitations: [
      "research candidates only; no same-city source acceptance has been performed",
      "Schaefer atmospheric inputs are assumptions, not live weather observations",
      "local terrain skyline, buildings and observer-specific horizon are not included",
      "morning Udaya and evening Asta candidates must be independently reviewed"
    ]
  });
}
