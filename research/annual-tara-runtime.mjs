import {
  CANOPUS_ASTROMETRY, propagateStarPosition, scanDrikSolarAltitudeTransitions,
  scanDrikStarAzimuthTransitions
} from "./drik-ganita-time-separation.mjs";
import { createTaraContextFromPanchangLocation } from "./tara-astronomy-context.mjs";

const DAY_MS = 86_400_000;

export function canopusCoordinatesAt(date) {
  return propagateStarPosition(CANOPUS_ASTROMETRY, date);
}

export function planetMotion({Ecliptic, GeoVector}, body, instantUtcMs) {
  const before = Ecliptic(GeoVector(body, new Date(instantUtcMs - 86_400_000), true)).elon;
  const after = Ecliptic(GeoVector(body, new Date(instantUtcMs + 86_400_000), true)).elon;
  const dailyLongitudeMotionDeg = ((after - before + 540) % 360 - 180) / 2;
  return { motionState: dailyLongitudeMotionDeg < 0 ? "retrograde" : "direct", dailyLongitudeMotionDeg };
}

function isNightCrossing(event) {
  return event.thresholdSunAltitudeDeg + event.afterResidualDeg < 0;
}

// The scan receives fitted profiles and the selected city's fixed observer profile.
// There is no target-date input or elevation fallback.
export function calculateAnnualTara(engine, selectedLocation, year, profiles) {
  const {Observer, SearchRiseSet, SearchAltitude, DefineStar, Equator, Horizon} = engine;
  const context = createTaraContextFromPanchangLocation(
    selectedLocation, Observer, year
  );
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
        startLocalDayUtc: startLocalDayUtc - DAY_MS,
        days: (endLocalDayUtc - startLocalDayUtc) / DAY_MS + 1,
        astaSunAltitudeDeg: astaProfiles,
        udayaSunAltitudeDeg: udayaProfiles,
        motionStateAt: (targetBody, instantUtcMs) =>
          planetMotion(engine, targetBody, instantUtcMs).motionState
      });
      predictions.push(...scan.events);
    }
  }

  const starScans = [];
  for (const profile of profiles.filter(p => p.key.startsWith("Star1|"))) {
    const [, branch, event] = profile.key.split("|");
    const startDay = profile.centerDayOfYear - 1 - Math.floor(profile.seasonalWindowDays / 2);
    const starOptions = {
      SearchAltitude, Equator, Horizon, body: "Star1", observer, branch, event,
      startLocalDayUtc: startLocalDayUtc + startDay * DAY_MS, days: profile.seasonalWindowDays,
      slope: profile.slope, intercept: profile.intercept, residualThresholdDeg: profile.residualThresholdDeg,
      DefineStar, starCoordinatesAt: canopusCoordinatesAt
    };
    let scan = scanDrikStarAzimuthTransitions(starOptions);
    let nightEvents = scan.events.filter(isNightCrossing);
    let model = "azimuth-linear";
    if (!nightEvents.length && profile.medianSunAltitudeDeg < 0 &&
        Number.isFinite(profile.medianSunAltitudeDeg)) {
      scan = scanDrikStarAzimuthTransitions({
        ...starOptions, slope: 0, intercept: profile.medianSunAltitudeDeg, residualThresholdDeg: 0
      });
      nightEvents = scan.events.filter(isNightCrossing);
      model = "solar-altitude-median";
    }
    predictions.push(...nightEvents.map(entry => ({...entry, model})));
    starScans.push({ profile, model, samples: scan.samples });
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
  return {
    observer: context.observer,
    elevationSourceApproximate: context.elevationSourceApproximate,
    year, events, starScans, canopusIssues
  };
}
