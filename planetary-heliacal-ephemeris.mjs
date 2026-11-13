/**
 * Topocentric ephemeris adapter for heliacal visibility research.
 *
 * Requires the MIT-licensed astronomy-engine package (2.1.19 in CI).
 * This module deliberately does not publish events: callers must compare
 * candidate windows with local source observations before acceptance.
 */
import { evaluateSchaefer1985Visibility } from "./planetary-heliacal-visibility.mjs";

const ALLOWED_PLANETS = Object.freeze(["Jupiter", "Venus"]);
const DEFAULT_STEP_MINUTES = 2;
const DEFAULT_REFINE_SECONDS = 30;

function validDate(value, label) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError(label + " must be a valid date");
  return date;
}

function validateObserver(observer) {
  if (!observer || !Number.isFinite(Number(observer.latitude)) ||
      !Number.isFinite(Number(observer.longitude)) ||
      !Number.isFinite(Number(observer.height))) {
    throw new TypeError("A complete Astronomy Engine observer is required");
  }
  return observer;
}

function bodyId(astronomy, planet) {
  if (!ALLOWED_PLANETS.includes(planet)) {
    throw new RangeError("planet must be Jupiter or Venus");
  }
  const body = astronomy?.Body?.[planet];
  if (body === undefined) throw new TypeError("Astronomy Engine Body." + planet + " is unavailable");
  return body;
}

/** Returns one topocentric sky sample suitable for the Schaefer evaluator. */
export function getPlanetVisibilitySample({
  astronomy, planet, observer, instant, visibilityOptions = {}
}) {
  validateObserver(observer);
  const date = validDate(instant, "instant");
  const body = bodyId(astronomy, planet);
  if (typeof astronomy.Equator !== "function" ||
      typeof astronomy.Horizon !== "function" ||
      typeof astronomy.Illumination !== "function") {
    throw new TypeError("Astronomy Engine Equator, Horizon and Illumination APIs are required");
  }

  const targetEq = astronomy.Equator(body, date, observer, true, true);
  const sunEq = astronomy.Equator(astronomy.Body.Sun, date, observer, true, true);
  const targetHor = astronomy.Horizon(date, observer, targetEq.ra, targetEq.dec, "normal");
  const sunHor = astronomy.Horizon(date, observer, sunEq.ra, sunEq.dec, "normal");
  const illumination = astronomy.Illumination(body, date);

  const geometry = {
    instant: date.toISOString(),
    planet,
    objectAltitudeDeg: targetHor.altitude,
    objectAzimuthDeg: targetHor.azimuth,
    sunAltitudeDeg: sunHor.altitude,
    sunAzimuthDeg: sunHor.azimuth,
    apparentMagnitude: illumination.mag,
    phaseAngleDeg: illumination.phase_angle,
    phaseFraction: illumination.phase_fraction
  };
  return {
    ...geometry,
    visibility: evaluateSchaefer1985Visibility(geometry, visibilityOptions)
  };
}

function interpolateCrossing(astronomy, args, left, right, targetVisible, toleranceMs) {
  let lo = left.getTime();
  let hi = right.getTime();
  const evaluate = ms => getPlanetVisibilitySample({
    ...args, instant: new Date(ms)
  }).visibility;
  while (hi - lo > toleranceMs) {
    const mid = Math.floor((lo + hi) / 2);
    const state = evaluate(mid);
    if (state.visible === targetVisible) hi = mid;
    else lo = mid;
  }
  return new Date(hi).toISOString();
}

/**
 * Scans a caller-supplied morning/evening UTC interval. The caller should
 * bound it with locally computed astronomical twilight and sunrise/sunset.
 * Returned crossing times are model candidates, not accepted/public events.
 */
export function scanPlanetVisibilityWindow({
  astronomy, planet, observer, start, end, stepMinutes = DEFAULT_STEP_MINUTES,
  refineSeconds = DEFAULT_REFINE_SECONDS, visibilityOptions = {}
}) {
  validateObserver(observer);
  bodyId(astronomy, planet);
  const startDate = validDate(start, "start");
  const endDate = validDate(end, "end");
  if (endDate <= startDate) throw new RangeError("end must be after start");
  if (!Number.isFinite(stepMinutes) || stepMinutes <= 0 || stepMinutes > 30) {
    throw new RangeError("stepMinutes must be in (0, 30]");
  }
  if (!Number.isFinite(refineSeconds) || refineSeconds < 1 || refineSeconds > 300) {
    throw new RangeError("refineSeconds must be in [1, 300]");
  }

  const args = { astronomy, planet, observer, visibilityOptions };
  const stepMs = stepMinutes * 60_000;
  const toleranceMs = refineSeconds * 1000;
  const samples = [];
  for (let ms = startDate.getTime(); ms <= endDate.getTime(); ms += stepMs) {
    samples.push(getPlanetVisibilitySample({ ...args, instant: new Date(Math.min(ms, endDate.getTime())) }));
    if (ms + stepMs > endDate.getTime() && ms < endDate.getTime()) {
      samples.push(getPlanetVisibilitySample({ ...args, instant: endDate }));
      break;
    }
  }
  if (samples.length === 1 && samples[0].instant !== endDate.toISOString()) {
    samples.push(getPlanetVisibilitySample({ ...args, instant: endDate }));
  }

  const visibleSamples = samples.filter(sample => sample.visibility.visible);
  const crossings = [];
  for (let i = 1; i < samples.length; i++) {
    const previous = samples[i - 1];
    const current = samples[i];
    const a = previous.visibility;
    const b = current.visibility;
    if (!Number.isFinite(a.visibilityMargin) || !Number.isFinite(b.visibilityMargin)) continue;
    if (a.visible !== b.visible) {
      const instant = interpolateCrossing(
        astronomy, args, new Date(previous.instant), new Date(current.instant),
        b.visible, toleranceMs
      );
      const crossingSample = getPlanetVisibilitySample({
        ...args,
        instant
      });
      const planetAzimuthDeg = crossingSample.objectAzimuthDeg;
      crossings.push({
        type: b.visible ? "first-visible" : "last-visible",
        instant,
        planetAltitudeDeg: crossingSample.objectAltitudeDeg,
        planetAzimuthDeg,
        horizonDirection: Number.isFinite(planetAzimuthDeg)
          ? (planetAzimuthDeg >= 0 && planetAzimuthDeg < 180 ? "east" : "west")
          : null
      });
    }
  }

  return Object.freeze({
    modelId: "schaefer-1985-with-astronomy-engine-2.1.19",
    status: visibleSamples.length ? "visibility-candidate-found" : "no-visible-sample",
    planet,
    scanStart: startDate.toISOString(),
    scanEnd: endDate.toISOString(),
    stepMinutes,
    refinementToleranceSeconds: refineSeconds,
    samples,
    crossings,
    firstVisibleSample: visibleSamples[0] || null,
    lastVisibleSample: visibleSamples.at(-1) || null,
    publicationEligible: false,
    limitations: [
      "Schaefer visibility assumptions are not local weather measurements",
      "terrain skyline and buildings are not included",
      "candidate times require same-location source validation"
    ]
  });
}
