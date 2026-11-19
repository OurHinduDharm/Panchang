import { createRequire } from "node:module";
import {
  LOCATION_PROFILES, calibrateObservation,
  azimuthSeparationDegrees, fitTheilSenLine, median
} from "./drik-ganita-time-separation.mjs";
import { calculateAnnualTara, canopusCoordinatesAt, planetMotion } from "./annual-tara-runtime.mjs";
export { canopusCoordinatesAt };

const engine = createRequire(import.meta.url)("astronomy-engine");
const { Observer, SearchRiseSet, SearchAltitude, DefineStar, Equator, Horizon } = engine;

function angularSeparationDegrees(a, b) {
  const raA = a.ra * 15 * Math.PI / 180;
  const raB = b.ra * 15 * Math.PI / 180;
  const decA = a.dec * Math.PI / 180;
  const decB = b.dec * Math.PI / 180;
  const cosine = Math.sin(decA) * Math.sin(decB) +
    Math.cos(decA) * Math.cos(decB) * Math.cos(raA - raB);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
}

export function apparentAtSourceTime(body, observer, instantUtcMs) {
  const date = new Date(instantUtcMs);
  if (body === "Star1") {
    const position = canopusCoordinatesAt(date);
    DefineStar(body, position.raHours, position.decDegrees, position.distanceLightYears);
  }
  const sunEquator = Equator("Sun", date, observer, true, true);
  const bodyEquator = Equator(body, date, observer, true, true);
  const sunHorizon = Horizon(date, observer, sunEquator.ra, sunEquator.dec, "normal");
  const bodyHorizon = Horizon(date, observer, bodyEquator.ra, bodyEquator.dec, "normal");
  const { motionState, dailyLongitudeMotionDeg } = body === "Venus" || body === "Jupiter"
    ? planetMotion(engine, body, instantUtcMs)
    : { motionState: "fixed-star", dailyLongitudeMotionDeg: null };
  return {
    sunAltitudeDeg: sunHorizon.altitude,
    bodyAltitudeDeg: bodyHorizon.altitude,
    sunAzimuthDeg: sunHorizon.azimuth,
    bodyAzimuthDeg: bodyHorizon.azimuth,
    topocentricSeparationDeg: angularSeparationDegrees(sunEquator, bodyEquator),
    motionState,
    dailyLongitudeMotionDeg
  };
}

export function quantile(values, probability) {
  const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position), upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function measureTaraObservation(observation) {
  const location = LOCATION_PROFILES[observation.sourceId];
  if (!location) return null;
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const localDayStartUtc = Date.parse(observation.date + "T00:00:00+05:30");
  if (observation.planet === "अगस्त्य") {
    const position = canopusCoordinatesAt(new Date(localDayStartUtc + 12 * 60 * 60_000));
    DefineStar("Star1", position.raHours, position.decDegrees, position.distanceLightYears);
  }
  const result = calibrateObservation({
    observation,
    SearchRiseSet,
    SearchAltitude,
    observer,
    localDayStartUtc
  });
  const horizonAtSourceTime = result.clock?.valid && result.body
    ? apparentAtSourceTime(result.body, observer, result.clock.instantUtcMs)
    : null;
  const horizonAtComputedBodyEvent = result.available && result.body
    ? apparentAtSourceTime(result.body, observer, result.bodyEventUtcMs)
    : null;
  return {
    ...result,
    horizonAtSourceTime,
    horizonAtComputedBodyEvent,
    location: location.name,
    coordinateProfile: observation.sourceId === "drikpanchang-almora" || observation.sourceId === "drikpanchang-ramnagar"
      ? "official-Drik-Panchang-location-details"
      : observation.sourceId === "drikpanchang-pithoragarh"
        ? "provider-default-Drik-Panchang-Pithoragarh-observer"
        : "printed-panchang-calculation-centre"
  };
}

// Fit once, using only eligible observations from the named source and cutoff.
export function fitAnnualTaraProfiles(rows, trainingSourceId, trainingThroughYear) {
  const eligible = rows.filter(row => row.available && row.sourceId === trainingSourceId &&
    row.bodyEventResidualMinutes <= 15 && row.horizonAtComputedBodyEvent &&
    Number(row.date.slice(0, 4)) <= trainingThroughYear);
  const training = eligible.filter(row => row.body !== "Star1");
  const thresholdMap = new Map();
  for (const row of training) {
    const motionState = row.horizonAtComputedBodyEvent.motionState;
    const key = [row.body, row.branch, row.eventType, motionState].join("|");
    if (!thresholdMap.has(key)) thresholdMap.set(key, []);
    thresholdMap.get(key).push(row.horizonAtComputedBodyEvent.sunAltitudeDeg);
  }
  const planetThresholdQuantile = 0.25;
  const planetProfiles = [...thresholdMap].map(([key, values]) => {
    const q = key === "Venus|set|Udaya|direct" ? 0.95 : planetThresholdQuantile;
    return { key, thresholdSunAltitudeDeg: quantile(values, q), quantile: q };
  });
  const agastyaProfiles = [];
  for (const [event, branch] of [["Udaya", "rise"], ["Asta", "set"]]) {
    const starTraining = eligible.filter(row =>
      row.body === "Star1" && row.branch === branch && row.eventType === event);
    const points = starTraining.map(row => ({
      x: azimuthSeparationDegrees(
        row.horizonAtComputedBodyEvent.bodyAzimuthDeg,
        row.horizonAtComputedBodyEvent.sunAzimuthDeg
      ),
      y: row.horizonAtComputedBodyEvent.sunAltitudeDeg
    }));
    const fit = fitTheilSenLine(points);
    if (!fit) continue;
    const trainingResiduals = points.map(point =>
      point.y - (fit.slope * point.x + fit.intercept)
    );
    // Candidate tail offsets are kept body/event-specific. This is a research
    // policy under holdout review, not an accepted production constant.
    const residualQuantile = event === "Asta" ? 0.9 : 0.25;
    const residualThresholdDeg = quantile(trainingResiduals, residualQuantile);
    const trainingDayNumbers = starTraining.map(row => {
      const date = new Date(row.date + "T00:00:00Z");
      return Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86_400_000);
    });
    const centerDayOfYear = Math.round(median(trainingDayNumbers));
    agastyaProfiles.push({
      key: `Star1|${branch}|${event}|fixed-star|azimuth-linear`,
      slope: fit.slope,
      intercept: fit.intercept,
      trainingSamples: fit.samples,
      medianSunAltitudeDeg: median(points.map(point => point.y)),
      residualQuantile,
      residualThresholdDeg,
      centerDayOfYear,
      seasonalWindowDays: 91,
      trainingSourceIds: starTraining.map(row => row.id)
    });
  }

  return {
    trainingSamples: training.length,
    planetThresholdQuantile,
    thresholdProfiles: [...planetProfiles, ...agastyaProfiles]
  };
}

export function predictAnnualTara(selectedLocation, year, profiles) {
  return calculateAnnualTara(engine, selectedLocation, year, profiles);
}
