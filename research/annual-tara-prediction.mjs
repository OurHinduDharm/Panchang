import { createRequire } from "node:module";
import {
  LOCATION_PROFILES, CANOPUS_ASTROMETRY, propagateStarPosition, calibrateObservation,
  azimuthSeparationDegrees, fitTheilSenLine, median,
  scanDrikSolarAltitudeTransitions, scanDrikStarAzimuthTransitions
} from "./drik-ganita-time-separation.mjs";
import { createTaraContextFromPanchangLocation } from "./tara-astronomy-context.mjs";

const { Observer, SearchRiseSet, SearchAltitude, DefineStar, Equator, Horizon, GeoVector, Ecliptic } = createRequire(import.meta.url)("astronomy-engine");
const DAY_MS = 86_400_000;

export function canopusCoordinatesAt(date) {
  return propagateStarPosition(CANOPUS_ASTROMETRY, date);
}

function angularSeparationDegrees(a, b) {
  const raA = a.ra * 15 * Math.PI / 180;
  const raB = b.ra * 15 * Math.PI / 180;
  const decA = a.dec * Math.PI / 180;
  const decB = b.dec * Math.PI / 180;
  const cosine = Math.sin(decA) * Math.sin(decB) +
    Math.cos(decA) * Math.cos(decB) * Math.cos(raA - raB);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
}

function planetMotion(body, instantUtcMs) {
  const before = Ecliptic(GeoVector(body, new Date(instantUtcMs - 86_400_000), true)).elon;
  const after = Ecliptic(GeoVector(body, new Date(instantUtcMs + 86_400_000), true)).elon;
  const dailyLongitudeMotionDeg = ((after - before + 540) % 360 - 180) / 2;
  return { motionState: dailyLongitudeMotionDeg < 0 ? "retrograde" : "direct", dailyLongitudeMotionDeg };
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
    ? planetMotion(body, instantUtcMs)
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

// The scan receives fitted profiles and a location. There is no target-date input.
export function predictAnnualTara(selectedLocation, year, profiles) {
  const context = createTaraContextFromPanchangLocation(selectedLocation, Observer, year);
  const observer = context.astronomyObserver;
  const startLocalDayUtc = Date.parse(`${year}-01-01T00:00:00+05:30`);
  const endLocalDayUtc = Date.parse(`${year + 1}-01-01T00:00:00+05:30`);
  const planetProfiles = profiles.filter(profile => Number.isFinite(profile.thresholdSunAltitudeDeg));
  const predictions = [];
  for (const body of ["Venus", "Jupiter"]) {
    for (const branch of ["rise", "set"]) {
      const astaProfiles = {};
      const udayaProfiles = {};
      for (const profile of planetProfiles) {
        const [profileBody, profileBranch, event, state] = profile.key.split("|");
        if (profileBody !== body || profileBranch !== branch) continue;
        if (event === "Asta") astaProfiles[state] = profile.thresholdSunAltitudeDeg;
        if (event === "Udaya") udayaProfiles[state] = profile.thresholdSunAltitudeDeg;
      }
      if (!Object.keys(astaProfiles).length && !Object.keys(udayaProfiles).length) continue;
      const scan = scanDrikSolarAltitudeTransitions({
        SearchRiseSet, SearchAltitude, Equator, Horizon, body, observer, branch,
        // The preceding sample lets a crossing on January 1 belong to this year.
        startLocalDayUtc: startLocalDayUtc - DAY_MS, days: (endLocalDayUtc - startLocalDayUtc) / DAY_MS + 1,
        astaSunAltitudeDeg: astaProfiles,
        udayaSunAltitudeDeg: udayaProfiles,
        motionStateAt: (targetBody, instantUtcMs) =>
          planetMotion(targetBody, instantUtcMs).motionState
      });
      predictions.push(...scan.events);
    }
  }

  const starScans = [];
  for (const profile of profiles.filter(p => p.key.startsWith("Star1|"))) {
    const [, branch, event] = profile.key.split("|");
    const startDay = profile.centerDayOfYear - 1 - Math.floor(profile.seasonalWindowDays / 2);
    const scan = scanDrikStarAzimuthTransitions({
      SearchAltitude, Equator, Horizon, body: "Star1", observer, branch, event,
      startLocalDayUtc: startLocalDayUtc + startDay * DAY_MS, days: profile.seasonalWindowDays,
      slope: profile.slope, intercept: profile.intercept, residualThresholdDeg: profile.residualThresholdDeg,
      DefineStar, starCoordinatesAt: canopusCoordinatesAt
    });
    predictions.push(...scan.events);
    starScans.push({ profile, samples: scan.samples });
  }
  const events = predictions.filter(e => e.utcMilliseconds >= startLocalDayUtc && e.utcMilliseconds < endLocalDayUtc)
    .sort((a, b) => a.utcMilliseconds - b.utcMilliseconds);
  const canopusIssues = [];
  for (const [event, branch] of [["Udaya", "rise"], ["Asta", "set"]]) {
    const scan = starScans.find(s => s.profile.key === `Star1|${branch}|${event}|fixed-star|azimuth-linear`);
    const count = events.filter(e => e.body === "Star1" && e.event === event).length;
    if (count === 1) continue;
    let reason = "no-seasonal-threshold-crossing";
    if (!scan) reason = "no-fitted-profile";
    else if (!scan.samples.some((s, i, samples) => s.available && samples[i - 1]?.available)) {
      reason = "no-consecutive-horizon-samples";
    } else if (count > 1) reason = "multiple-seasonal-crossings";
    canopusIssues.push({ event, branch, count, reason });
  }
  return { observer: context.observer, year, events, starScans, canopusIssues };
}
