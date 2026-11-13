import { findAngularCombustionBoundaries } from "./planetary-angular-combustion.mjs";
import {
  buildMotionThresholdSegments,
  createPlanetEphemerisAdapter,
  findGeocentricMotionStations
} from "./planetary-ephemeris-adapter.mjs";

const HOUR_MS = 3_600_000;

function wrapSigned(angle) {
  const wrapped = ((angle % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

/**
 * End-to-end classical angular combustion calculation using actual
 * geocentric apparent ecliptic longitudes and detected geocentric stations.
 *
 * This deliberately does not calculate local heliacal visibility.
 */
export function calculatePlanetaryAngularCombustion({
  astronomy,
  body,
  start,
  end,
  thresholdByMotion,
  stationStepHours = 12,
  elongationStepMinutes = 180,
  stationToleranceSeconds = 30,
  boundaryToleranceSeconds = 1
}) {
  if (!(start instanceof Date) || !Number.isFinite(start.getTime()) ||
      !(end instanceof Date) || !Number.isFinite(end.getTime()) || end <= start) {
    throw new RangeError("start and end must be valid dates with end after start");
  }
  const ephemeris = createPlanetEphemerisAdapter({ astronomy, body });
  const stations = findGeocentricMotionStations({
    sampleLongitude: ephemeris.sampleLongitude,
    start: new Date(start.getTime() - 6 * HOUR_MS),
    end: new Date(end.getTime() + 6 * HOUR_MS),
    coarseStepHours: stationStepHours,
    derivativeHalfWindowHours: 3,
    toleranceSeconds: stationToleranceSeconds
  });

  const motionProbeBefore = ephemeris.sampleLongitude(new Date(start.getTime() - 3 * HOUR_MS));
  const motionProbeAfter = ephemeris.sampleLongitude(new Date(start.getTime() + 3 * HOUR_MS));
  const initialRate = wrapSigned(motionProbeAfter - motionProbeBefore);
  if (Math.abs(initialRate) < 1e-10) {
    throw new Error("Initial planetary motion is too close to a station to classify safely");
  }
  const initialMotion = initialRate < 0 ? "retrograde" : "direct";

  const segments = buildMotionThresholdSegments({
    start,
    end,
    stations,
    initialMotion,
    thresholdByMotion
  });
  const events = findAngularCombustionBoundaries({
    sampleElongation: ephemeris.sampleElongation,
    segments,
    coarseStepMinutes: elongationStepMinutes,
    toleranceSeconds: boundaryToleranceSeconds
  });

  return Object.freeze({
    body,
    interval: Object.freeze({ start: start.toISOString(), end: end.toISOString() }),
    thresholdByMotion: Object.freeze({ ...thresholdByMotion }),
    initialMotion,
    stations,
    segments,
    events,
    method: "astronomy-engine-geocentric-apparent-ecliptic-longitude-with-station-segmented-thresholds",
    visibilityDecision: "not-evaluated"
  });
}
