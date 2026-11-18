import fs from "node:fs";
import * as Astronomy from "astronomy-engine";
import {
  calibrateObservation,
  parsePrintedClock,
  median,
  clockOfDayDifferenceMinutes,
  scanDrikTimeSeparationTransitions,
  scanDrikSolarAltitudeTransitions,
  azimuthSeparationDegrees,
  fitTheilSenLine,
  scanDrikStarAzimuthTransitions,
  summarizeCalibration,
  LOCATION_PROFILES,
  CANOPUS_ASTROMETRY,
  propagateStarPosition
} from "../research/drik-ganita-time-separation.mjs";

const { Observer, SearchRiseSet, SearchAltitude, DefineStar, Equator, Horizon, GeoVector, Ecliptic } = Astronomy.default || Astronomy;

const dataset = JSON.parse(fs.readFileSync(
  new URL("../research/drik-ganita-asta-udaya-benchmarks-2019-2027.json", import.meta.url),
  "utf8"
));
const observationIds = dataset.observations.map(item => item.id);
if (new Set(observationIds).size !== observationIds.length) {
  throw new Error("Benchmark observation IDs must be unique");
}

const LOCATIONS = LOCATION_PROFILES;
for (const sourceId of ["drikpanchang-almora", "drikpanchang-ramnagar"]) {
  const source = dataset.sources.find(item => item.id === sourceId);
  const profile = LOCATIONS[sourceId];
  const expected = source?.observerProfile;
  if (!expected ||
      expected.latitude !== profile.latitude ||
      expected.longitude !== profile.longitude ||
      expected.elevationMeters !== profile.elevation) {
    throw new Error(`Observer profile metadata mismatch for ${sourceId}`);
  }
}
for (const sourceId of ["drikpanchang-pithoragarh", "pithoragarh-project-target"]) {
  const source = dataset.observerProfiles?.find(item => item.id === sourceId);
  const profile = LOCATIONS[sourceId];
  if (!source || !profile ||
      source.latitude !== profile.latitude ||
      source.longitude !== profile.longitude ||
      source.elevationMeters !== profile.elevation) {
    throw new Error(`Pithoragarh observer profile metadata mismatch for ${sourceId}`);
  }
}

// SIMBAD/Hipparcos Canopus astrometry; refresh proper-motion position at each date.
function canopusCoordinatesAt(date) {
  return propagateStarPosition(CANOPUS_ASTROMETRY, date);
}

function eventClass(observation) {
  const label = String(observation.event || "");
  if (observation.planet === "अगस्त्य") {
    // Printed Agastya Udaya/Arghya is a traditional observance marker.
    // Only explicit Drik "तारा उदय क्षण" / "अस्त क्षण" labels are
    // geometric Canopus events; never pair these unlike event definitions.
    if (observation.sourceId?.startsWith("drikpanchang") &&
        label === "अगस्त्य तारा उदय क्षण") return "Agastya-Geometric-Udaya";
    if (observation.sourceId?.startsWith("drikpanchang") &&
        label === "अस्त क्षण") return "Agastya-Geometric-Asta";
    if (/अगस्त्योदय/.test(label)) return "Agastya-Traditional-Udaya";
    return null;
  }
  if (observation.sourceId === "ganesh-martand" || observation.sourceId === "tara-prasad") {
    if (label === "अस्त") return "Asta";
    if (label === "उदय") return "Udaya";
  }
  if (label === "अस्त प्रारम्भ") return "Asta";
  if (label === "अस्त समाप्त") return "Udaya";
  return null;
}
function eventInstant(observation) {
  const parsed = parsePrintedClock(observation.date, observation.timeRaw, observation.timeQualifierRaw);
  return parsed.valid ? parsed.instantUtcMs : null;
}
function pairSourceSets(observations, leftSourceId, rightSourceId) {
  const left = observations.filter(item => item.sourceId === leftSourceId);
  const right = observations.filter(item => item.sourceId === rightSourceId);
  const used = new Set();
  const pairs = [];
  for (const printed of left) {
    const kind = eventClass(printed);
    if (!kind) continue;
    const candidates = right.filter(item =>
      !used.has(item.id) &&
      item.planet === printed.planet &&
      eventClass(item) === kind
    ).map(item => {
      const a = eventInstant(printed), b = eventInstant(item);
      const calendarDiff = Math.abs(Date.parse(item.date) - Date.parse(printed.date)) / 86_400_000;
      const instantDiff = a !== null && b !== null ? Math.abs(b - a) / 86_400_000 : calendarDiff;
      return { item, calendarDiff, instantDiff, a, b };
    }).filter(candidate => candidate.calendarDiff <= 10)
      .sort((a, b) => a.instantDiff - b.instantDiff);
    const match = candidates[0];
    if (!match) continue;
    used.add(match.item.id);
    pairs.push({
      planet: printed.planet,
      event: kind,
      leftSource: leftSourceId,
      rightSource: rightSourceId,
      leftDate: printed.date,
      rightDate: match.item.date,
      calendarDateDifferenceDays: (Date.parse(match.item.date) - Date.parse(printed.date)) / 86_400_000,
      leftClockRaw: printed.timeRaw ?? null,
      rightClockRaw: match.item.timeRaw ?? null,
      clockInterpretationStatus: leftSourceId === "ganesh-martand" ? "provisional-HH.MM-IST" : "Tara-Prasad-notation-partly-ambiguous",
      provisionalClockDifferenceMinutes: match.a !== null && match.b !== null
        ? Math.abs(match.b - match.a) / 60_000 : null
    });
  }
  return pairs;
}

function pithoragarhSunriseSunsetSanity() {
  const dateIso = "2026-11-17";
  const timezoneOffsetMinutes = 330;
  const drikProfile = LOCATION_PROFILES["drikpanchang-pithoragarh"];
  const targetProfile = LOCATION_PROFILES["pithoragarh-project-target"];
  const calculate = (location, direction) => {
    const observer = new Observer(location.latitude, location.longitude, location.elevation);
    const start = Date.parse(`${dateIso}T00:00:00+05:30`);
    const event = SearchRiseSet("Sun", observer, direction, new Date(start), 1, 0);
    const instant = event?.date instanceof Date ? event.date.getTime()
      : event?.date ? new Date(event.date).getTime() : NaN;
    if (!Number.isFinite(instant)) return null;
    return Math.round(instant);
  };
  const drikSunrise = calculate(drikProfile, 1);
  const drikSunset = calculate(drikProfile, -1);
  const targetSunrise = calculate(targetProfile, 1);
  const targetSunset = calculate(targetProfile, -1);
  const sourceSunrise = Date.parse(`${dateIso}T06:35:00+05:30`);
  const sourceSunset = Date.parse(`${dateIso}T17:13:00+05:30`);
  const sunriseResidualMinutes = drikSunrise === null ? null : (drikSunrise - sourceSunrise) / 60_000;
  const sunsetResidualMinutes = drikSunset === null ? null : (drikSunset - sourceSunset) / 60_000;
  if (![sunriseResidualMinutes, sunsetResidualMinutes].every(value =>
    Number.isFinite(value) && Math.abs(value) <= 2
  )) {
    throw new Error("Pithoragarh Drik observer sunrise/sunset sanity check exceeded 2 minutes");
  }
  const clock = instant => Number.isFinite(instant)
    ? new Date(instant + timezoneOffsetMinutes * 60_000).toISOString().slice(11, 19) : null;
  return {
    date: dateIso,
    drikSourcePage: "https://www.drikpanchang.com/astronomy/sunrisemoonrise/daily/sunrisemoonrise.html?geoname-id=1259503",
    providerPublished: { sunrise: "06:35:00", sunset: "17:13:00" },
    drikObserver: {
      ...drikProfile,
      computed: { sunrise: clock(drikSunrise), sunset: clock(drikSunset) },
      sourceResidualMinutes: {
        sunrise: sunriseResidualMinutes,
        sunset: sunsetResidualMinutes
      }
    },
    projectObserver: {
      ...targetProfile,
      computed: { sunrise: clock(targetSunrise), sunset: clock(targetSunset) },
      differenceFromDrikObserverMinutes: {
        sunrise: drikSunrise === null || targetSunrise === null ? null : (targetSunrise - drikSunrise) / 60_000,
        sunset: drikSunset === null || targetSunset === null ? null : (targetSunset - drikSunset) / 60_000
      }
    }
  };
}

function buildSourceAgreement(observations) {
  return {
    primaryGaneshVsDrikAlmora: pairSourceSets(observations, "ganesh-martand", "drikpanchang-almora"),
    secondaryTaraPrasadVsDrikRamnagar: pairSourceSets(observations, "tara-prasad", "drikpanchang-ramnagar")
  };
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
function apparentAtSourceTime(body, observer, instantUtcMs) {
  const date = new Date(instantUtcMs);
  if (body === "Star1") {
    const position = canopusCoordinatesAt(date);
    DefineStar(body, position.raHours, position.decDegrees, position.distanceLightYears);
  }
  const sunEquator = Equator("Sun", date, observer, true, true);
  const bodyEquator = Equator(body, date, observer, true, true);
  const sunHorizon = Horizon(date, observer, sunEquator.ra, sunEquator.dec, "normal");
  const bodyHorizon = Horizon(date, observer, bodyEquator.ra, bodyEquator.dec, "normal");
  let motionState = "fixed-star";
  let dailyLongitudeMotionDeg = null;
  if (body === "Venus" || body === "Jupiter") {
    const before = Ecliptic(GeoVector(body, new Date(instantUtcMs - 86_400_000), true)).elon;
    const after = Ecliptic(GeoVector(body, new Date(instantUtcMs + 86_400_000), true)).elon;
    dailyLongitudeMotionDeg = ((after - before + 540) % 360 - 180) / 2;
    motionState = dailyLongitudeMotionDeg < 0 ? "retrograde" : "direct";
  }
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



function summarizeSolarAltitudeCalibration(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!row.available || !row.sourceId?.startsWith("drikpanchang") ||
        row.bodyEventResidualMinutes > 15 || !row.horizonAtComputedBodyEvent) continue;
    const key = [row.sourceId, row.body, row.branch, row.eventType, row.horizonAtComputedBodyEvent.motionState].join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row.horizonAtComputedBodyEvent.sunAltitudeDeg);
  }
  return [...groups.entries()].map(([key, values]) => ({
    key,
    samples: values.length,
    sourceId: key.split("|")[0],
    motionState: key.split("|")[4],
    medianSunAltitudeDeg: median(values),
    minSunAltitudeDeg: Math.min(...values),
    maxSunAltitudeDeg: Math.max(...values)
  }));
}

function buildHeldOutValidation(rows, holdoutYear, trainingThroughYear, sourceId = "drikpanchang-almora") {
  // A location's fitted thresholds must never be trained with another city's rows.
  const location = LOCATIONS[sourceId];
  if (!location) throw new Error("Unknown validation observer: " + sourceId);
  const training = rows.filter(row =>
    row.available &&
    row.sourceId === sourceId &&
    row.body !== "Star1" &&
    row.bodyEventResidualMinutes <= 15 &&
    row.horizonAtComputedBodyEvent &&
    Number(row.date.slice(0, 4)) <= trainingThroughYear
  );
  const thresholdMap = new Map();
  for (const row of training) {
    const motionState = row.horizonAtComputedBodyEvent.motionState;
    const key = [row.body, row.branch, row.eventType, motionState].join("|");
    if (!thresholdMap.has(key)) thresholdMap.set(key, []);
    thresholdMap.get(key).push(row.horizonAtComputedBodyEvent.sunAltitudeDeg);
  }
  const planetThresholdQuantile = 0.25;
  const profileQuantiles = new Map([...thresholdMap.entries()].map(([key]) => {
    // A sparse direct-motion Venus Udaya branch showed a stable upper-tail
    // boundary in the pre-2026 expanding window; all other planet profiles
    // retain the broadly validated lower-quartile threshold.
    const quantileValue = key === "Venus|set|Udaya|direct" ? 0.95 : planetThresholdQuantile;
    return [key, quantileValue];
  }));
  const thresholds = new Map([...thresholdMap.entries()].map(([key, values]) =>
    [key, quantile(values, profileQuantiles.get(key))]
  ));
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const startLocalDayUtc = Date.parse(`${holdoutYear}-01-01T00:00:00+05:30`);
  const predictions = [];
  for (const body of ["Venus", "Jupiter"]) {
    for (const branch of ["rise", "set"]) {
      const states = [...new Set([...thresholds.keys()]
        .filter(key => key.startsWith([body, branch].join("|")))
        .map(key => key.split("|")[3]))];
      if (!states.length) continue;
      const astaProfiles = Object.fromEntries(states
        .filter(state => thresholds.has([body, branch, "Asta", state].join("|")))
        .map(state => [state, thresholds.get([body, branch, "Asta", state].join("|"))]));
      const udayaProfiles = Object.fromEntries(states
        .filter(state => thresholds.has([body, branch, "Udaya", state].join("|")))
        .map(state => [state, thresholds.get([body, branch, "Udaya", state].join("|"))]));
      if (!Object.keys(astaProfiles).length && !Object.keys(udayaProfiles).length) continue;
      const scan = scanDrikSolarAltitudeTransitions({
        SearchRiseSet, SearchAltitude, Equator, Horizon, body, observer, branch,
        startLocalDayUtc,
        days: (holdoutYear % 4 === 0 && (holdoutYear % 100 !== 0 || holdoutYear % 400 === 0)) ? 366 : 365,
        astaSunAltitudeDeg: astaProfiles,
        udayaSunAltitudeDeg: udayaProfiles,
        motionStateAt: (targetBody, instantUtcMs) =>
          apparentAtSourceTime(targetBody, observer, instantUtcMs).motionState
      });
      predictions.push(...scan.events);
    }
  }

  const agastyaProfiles = [];
  const agastyaSampleWindows = [];
  for (const [event, branch] of [["Udaya", "rise"], ["Asta", "set"]]) {
    const starTraining = rows.filter(row =>
      row.available &&
      row.sourceId === sourceId &&
      row.body === "Star1" &&
      row.branch === branch &&
      row.eventType === event &&
      row.bodyEventResidualMinutes <= 15 &&
      row.horizonAtComputedBodyEvent &&
      Number(row.date.slice(0, 4)) <= trainingThroughYear
    );
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
    const starWindowStartUtc = startLocalDayUtc + (centerDayOfYear - 1 - 45) * 86_400_000;
    const scan = scanDrikStarAzimuthTransitions({
      SearchAltitude, Equator, Horizon, body: "Star1", observer, branch,
      startLocalDayUtc: starWindowStartUtc, days: 91,
      event, slope: fit.slope, intercept: fit.intercept, residualThresholdDeg,
      DefineStar, starCoordinatesAt: canopusCoordinatesAt
    });
    predictions.push(...scan.events);
    const holdoutRows = rows.filter(row =>
      row.available && row.sourceId === sourceId && row.body === "Star1" &&
      row.branch === branch && row.eventType === event &&
      Number(row.date.slice(0, 4)) === holdoutYear
    );
    const holdoutDayStarts = holdoutRows.map(row => Date.parse(row.date + "T00:00:00+05:30"));
    agastyaSampleWindows.push({
      key: `Star1|${branch}|${event}|fixed-star|azimuth-linear`,
      samples: scan.samples.filter(sample => sample.available &&
        holdoutDayStarts.some(day => Math.abs(sample.dayStartUtc - day) <= 3 * 86_400_000)
      ).map(sample => ({
        localDate: new Date(sample.dayStartUtc + 330 * 60_000).toISOString().slice(0, 10),
        sunAltitudeDeg: sample.sunAltitudeDeg,
        azimuthSeparationDeg: sample.azimuthSeparationDeg,
        thresholdSunAltitudeDeg: sample.thresholdSunAltitudeDeg,
        residualDeg: sample.residualDeg
      }))
    });
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

  const observed = rows.filter(row =>
    row.available &&
    row.sourceId === sourceId &&
    row.bodyEventResidualMinutes <= 15 &&
    Number(row.date.slice(0, 4)) === holdoutYear
  );
  const unused = new Set(observed);
  const matches = [];
  const unmatchedPredictions = [];
  const ambiguousMatches = [];
  for (const predicted of predictions.sort((a, b) => a.utcMilliseconds - b.utcMilliseconds)) {
    const predictedLocalDate = new Date(predicted.utcMilliseconds + 330 * 60_000)
      .toISOString().slice(0, 10);
    const candidates = [...unused].filter(row =>
      row.body === predicted.body &&
      row.branch === predicted.branch &&
      row.eventType === predicted.event
    ).map(row => {
      const observedLocalDate = new Date(row.clock.instantUtcMs + 330 * 60_000)
        .toISOString().slice(0, 10);
      const dateOffsetDays = Math.round(
        (Date.parse(predictedLocalDate + "T00:00:00Z") -
         Date.parse(observedLocalDate + "T00:00:00Z")) / 86_400_000
      );
      return { row, dateOffsetDays, observedLocalDate };
    }).filter(item => Math.abs(item.dateOffsetDays) <= 2)
      .sort((a, b) => Math.abs(a.dateOffsetDays) - Math.abs(b.dateOffsetDays));
    if (!candidates.length) {
      unmatchedPredictions.push({
        body: predicted.body, event: predicted.event, branch: predicted.branch,
        motionState: predicted.motionState, predictedLocalDate
      });
      continue;
    }
    if (candidates.length > 1 &&
        Math.abs(candidates[0].dateOffsetDays) === Math.abs(candidates[1].dateOffsetDays)) {
      ambiguousMatches.push({
        body: predicted.body, event: predicted.event, branch: predicted.branch,
        predictedLocalDate, candidateSourceIds: candidates
          .filter(item => Math.abs(item.dateOffsetDays) === Math.abs(candidates[0].dateOffsetDays))
          .map(item => item.row.id)
      });
      continue;
    }
    const match = candidates[0];
    unused.delete(match.row);
    const sourceInstant = match.row.clock.instantUtcMs;
    const sourceGeometry = match.row.horizonAtComputedBodyEvent;
    const sourceAzimuthSeparationDeg = predicted.body === "Star1" && sourceGeometry
      ? azimuthSeparationDegrees(sourceGeometry.bodyAzimuthDeg, sourceGeometry.sunAzimuthDeg)
      : null;
    const sourceModelThreshold = predicted.body === "Star1" &&
      Number.isFinite(predicted.azimuthModelSlope) &&
      Number.isFinite(predicted.azimuthModelIntercept) &&
      Number.isFinite(sourceAzimuthSeparationDeg)
      ? predicted.azimuthModelSlope * sourceAzimuthSeparationDeg + predicted.azimuthModelIntercept
      : predicted.thresholdSunAltitudeDeg;
    matches.push({
      body: predicted.body,
      event: predicted.event,
      branch: predicted.branch,
      motionState: predicted.motionState,
      predictedLocal: new Date(predicted.utcMilliseconds + 330 * 60_000).toISOString().replace("Z", "+05:30"),
      sourceId: match.row.id,
      sourceLocal: new Date(sourceInstant + 330 * 60_000).toISOString().replace("Z", "+05:30"),
      dateOffsetDays: match.dateOffsetDays,
      thresholdSunAltitudeDeg: predicted.thresholdSunAltitudeDeg,
      azimuthSeparationDeg: predicted.azimuthSeparationDeg ?? null,
      sourceAzimuthSeparationDeg,
      beforeSunAltitudeDeg: predicted.beforeSunAltitudeDeg,
      afterSunAltitudeDeg: predicted.afterSunAltitudeDeg,
      sourceSunAltitudeDeg: sourceGeometry?.sunAltitudeDeg ?? null,
      sourceModelThresholdSunAltitudeDeg: sourceModelThreshold,
      sourceThresholdMarginDeg: Number.isFinite(sourceGeometry?.sunAltitudeDeg) &&
        Number.isFinite(sourceModelThreshold)
        ? sourceGeometry.sunAltitudeDeg - sourceModelThreshold
        : null,
      beforeResidualDeg: predicted.beforeResidualDeg ?? null,
      afterResidualDeg: predicted.afterResidualDeg ?? null,
      absoluteInstantResidualMinutes: Math.abs(predicted.utcMilliseconds - sourceInstant) / 60_000,
      clockOfDayResidualMinutes: clockOfDayDifferenceMinutes(predicted.utcMilliseconds, sourceInstant)
    });
  }
  // Diagnose missed Canopus events without changing the fitted model or hiding misses.
  // A source row can be unmatched because the threshold never crossed, the
  // prediction landed outside the two-day matching window, or another event
  // consumed its candidate. Keep the actual sampled residuals for inspection.
  const unmatchedAgastyaDiagnostics = [...unused]
    .filter(row => row.body === "Star1")
    .map(row => {
      const event = row.eventType;
      const branch = row.branch;
      const key = `Star1|${branch}|${event}|fixed-star|azimuth-linear`;
      const window = agastyaSampleWindows.find(item => item.key === key);
      const sourceDate = new Date(row.clock.instantUtcMs + 330 * 60_000)
        .toISOString().slice(0, 10);
      const profile = agastyaProfiles.find(item => item.key === key);
      return {
        sourceId: row.id,
        sourceLocalDate: sourceDate,
        event,
        branch,
        trainingSamples: profile?.trainingSamples ?? 0,
        residualThresholdDeg: profile?.residualThresholdDeg ?? null,
        nearbyDailySamples: (window?.samples ?? []).filter(sample =>
          Math.abs(Date.parse(sample.localDate) - Date.parse(sourceDate)) <= 3 * 86_400_000
        ),
        nearestPredictions: predictions.filter(item =>
          item.body === "Star1" && item.event === event && item.branch === branch
        ).map(item => ({
          predictedLocalDate: new Date(item.utcMilliseconds + 330 * 60_000)
            .toISOString().slice(0, 10),
          dateOffsetDays: Math.round((
            Date.parse(new Date(item.utcMilliseconds + 330 * 60_000).toISOString().slice(0, 10)) -
            Date.parse(sourceDate)
          ) / 86_400_000)
        }))
      };
    });
  const dateOffsets = matches.map(match => Math.abs(match.dateOffsetDays));
  const absoluteClockResiduals = matches.map(match => Math.abs(match.clockOfDayResidualMinutes));
  const absoluteInstantResiduals = matches.map(match => match.absoluteInstantResidualMinutes);
  const predictionKeys = predictions.map(item =>
    [item.body, item.event, item.branch, new Date(item.utcMilliseconds + 330 * 60_000).toISOString().slice(0, 10)].join("|")
  );
  const duplicatePredictionKeys = predictionKeys.filter((key, index) => predictionKeys.indexOf(key) !== index);
  return {
    holdoutYear,
    sourceId,
    observer: { name: location.name, latitude: location.latitude, longitude: location.longitude, elevation: location.elevation },
    trainingThroughYear,
    trainingSamples: training.length,
    planetThresholdQuantile,
    thresholdProfiles: [
      ...[...thresholds.entries()].map(([key, value]) => ({
        key, thresholdSunAltitudeDeg: value, quantile: profileQuantiles.get(key)
      })),
      ...agastyaProfiles
    ],
    agastyaSampleWindows,
    predictedEvents: predictions.length,
    observedHoldoutEvents: observed.length,
    matchedEvents: matches.length,
    dateAccuracy: {
      exactDate: dateOffsets.filter(days => days === 0).length,
      withinOneDay: dateOffsets.filter(days => days <= 1).length,
      moreThanOneDay: dateOffsets.filter(days => days > 1).length
    },
    clockOfDayResidualMinutes: {
      medianAbsolute: median(absoluteClockResiduals),
      maximumAbsolute: absoluteClockResiduals.length ? Math.max(...absoluteClockResiduals) : null
    },
    absoluteInstantResidualMinutes: {
      medianAbsolute: median(absoluteInstantResiduals),
      maximumAbsolute: absoluteInstantResiduals.length ? Math.max(...absoluteInstantResiduals) : null
    },
    unmatchedPredictions,
    unmatchedObserved: [...unused].map(row => row.id),
    unmatchedAgastyaDiagnostics,
    ambiguousMatches,
    duplicatePredictionKeys: [...new Set(duplicatePredictionKeys)],
    matches
  };
}

function quantile(values, probability) {
  const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position), upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function buildPlanetThresholdQuantileDiagnostics(rows) {
  const sourceId = "drikpanchang-almora";
  const location = LOCATIONS[sourceId];
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const probabilities = [0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 1];
  const output = [];
  const scenarios = [
    ...[2022, 2023, 2024, 2025, 2026].map(holdoutYear => ({
      holdoutYear, trainingThroughYear: holdoutYear - 1, mode: "expanding"
    })),
    { holdoutYear: 2027, trainingThroughYear: 2025, mode: "fixed-origin" },
    { holdoutYear: 2027, trainingThroughYear: 2026, mode: "rolling-origin" }
  ];
  for (const { holdoutYear, trainingThroughYear, mode } of scenarios) {
    const holdouts = rows.filter(row =>
      row.available &&
      row.sourceId === sourceId &&
      row.body !== "Star1" &&
      row.bodyEventResidualMinutes <= 15 &&
      row.horizonAtComputedBodyEvent &&
      Number(row.date.slice(0, 4)) === holdoutYear
    );
    for (const probability of probabilities) {
      const results = [];
      for (const row of holdouts) {
        const state = row.horizonAtComputedBodyEvent.motionState;
        const training = rows.filter(candidate =>
          candidate.available &&
          candidate.sourceId === sourceId &&
          candidate.body === row.body &&
          candidate.branch === row.branch &&
          candidate.eventType === row.eventType &&
          candidate.horizonAtComputedBodyEvent?.motionState === state &&
          candidate.bodyEventResidualMinutes <= 15 &&
          candidate.horizonAtComputedBodyEvent &&
          Number(candidate.date.slice(0, 4)) <= trainingThroughYear
        );
        if (training.length < 3) continue;
        const threshold = quantile(
          training.map(item => item.horizonAtComputedBodyEvent.sunAltitudeDeg),
          probability
        );
        const startLocalDayUtc = Date.parse(row.date + "T00:00:00+05:30") - 3 * 86_400_000;
        const scan = scanDrikSolarAltitudeTransitions({
          SearchRiseSet, SearchAltitude, Equator, Horizon,
          body: row.body, observer, branch: row.branch,
          startLocalDayUtc, days: 7,
          astaSunAltitudeDeg: row.eventType === "Asta" ? { [state]: threshold } : {},
          udayaSunAltitudeDeg: row.eventType === "Udaya" ? { [state]: threshold } : {},
          motionStateAt: (targetBody, instantUtcMs) =>
            apparentAtSourceTime(targetBody, observer, instantUtcMs).motionState
        });
        const predicted = scan.events[0] ?? null;
        const predictedLocalDate = predicted
          ? new Date(predicted.utcMilliseconds + 330 * 60_000).toISOString().slice(0, 10)
          : null;
        const dateOffsetDays = predictedLocalDate
          ? Math.round((Date.parse(predictedLocalDate + "T00:00:00Z") -
              Date.parse(row.date + "T00:00:00Z")) / 86_400_000)
          : null;
        results.push({
          sourceId: row.id,
          body: row.body,
          event: row.eventType,
          branch: row.branch,
          motionState: state,
          trainingSamples: training.length,
          thresholdQuantile: probability,
          thresholdSunAltitudeDeg: threshold,
          sourceSunAltitudeDeg: row.horizonAtComputedBodyEvent.sunAltitudeDeg,
          sourceThresholdMarginDeg: row.horizonAtComputedBodyEvent.sunAltitudeDeg - threshold,
          predictedLocalDate,
          dateOffsetDays,
          clockOfDayResidualMinutes: predicted
            ? clockOfDayDifferenceMinutes(predicted.utcMilliseconds, row.clock.instantUtcMs)
            : null
        });
      }
      const offsets = results.filter(item => item.dateOffsetDays !== null)
        .map(item => Math.abs(item.dateOffsetDays));
      const clockResiduals = results.filter(item => Number.isFinite(item.clockOfDayResidualMinutes))
        .map(item => Math.abs(item.clockOfDayResidualMinutes));
      output.push({
        holdoutYear,
        trainingThroughYear,
        mode,
        quantile: probability,
        observations: results.length,
        predicted: offsets.length,
        exactDate: offsets.filter(value => value === 0).length,
        withinOneDay: offsets.filter(value => value <= 1).length,
        unmatched: results.length - offsets.length,
        medianAbsoluteClockResidualMinutes: median(clockResiduals),
        maximumAbsoluteClockResidualMinutes: clockResiduals.length ? Math.max(...clockResiduals) : null,
        results
      });
    }
  }
  return output;
}


function buildAgastyaResidualQuantileDiagnostics(rows) {
  const sourceId = "drikpanchang-almora";
  const location = LOCATIONS[sourceId];
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const probabilities = [0.1, 0.25, 0.5, 0.75, 0.9];
  const scenarios = [
    ...[2023, 2024, 2025, 2026].map(holdoutYear => ({
      holdoutYear, trainingThroughYear: holdoutYear - 1, mode: "expanding"
    })),
    { holdoutYear: 2027, trainingThroughYear: 2025, mode: "fixed-origin" },
    { holdoutYear: 2027, trainingThroughYear: 2026, mode: "rolling-origin" }
  ];
  const output = [];
  for (const scenario of scenarios) {
    for (const [event, branch] of [["Udaya", "rise"], ["Asta", "set"]]) {
      const training = rows.filter(row =>
        row.available &&
        row.sourceId === sourceId &&
        row.body === "Star1" &&
        row.branch === branch &&
        row.eventType === event &&
        row.bodyEventResidualMinutes <= 15 &&
        row.horizonAtComputedBodyEvent &&
        Number(row.date.slice(0, 4)) <= scenario.trainingThroughYear
      );
      if (training.length < 3) continue;
      const points = training.map(row => ({
        x: azimuthSeparationDegrees(
          row.horizonAtComputedBodyEvent.bodyAzimuthDeg,
          row.horizonAtComputedBodyEvent.sunAzimuthDeg
        ),
        y: row.horizonAtComputedBodyEvent.sunAltitudeDeg,
        id: row.id
      }));
      const fit = fitTheilSenLine(points);
      if (!fit) continue;
      const trainingResiduals = points.map(point =>
        point.y - (fit.slope * point.x + fit.intercept)
      );
      const centerDayOfYear = Math.round(median(training.map(row => {
        const d = new Date(row.date + "T00:00:00Z");
        return Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86_400_000);
      })));
      const observed = rows.filter(row =>
        row.available &&
        row.sourceId === sourceId &&
        row.body === "Star1" &&
        row.branch === branch &&
        row.eventType === event &&
        row.bodyEventResidualMinutes <= 15 &&
        Number(row.date.slice(0, 4)) === scenario.holdoutYear
      );
      if (!observed.length) continue;
      for (const probability of probabilities) {
        const residualThresholdDeg = quantile(trainingResiduals, probability);
        const startLocalDayUtc = Date.parse(`${scenario.holdoutYear}-01-01T00:00:00+05:30`) +
          (centerDayOfYear - 1 - 45) * 86_400_000;
        const scan = scanDrikStarAzimuthTransitions({
          SearchAltitude, Equator, Horizon, body: "Star1", observer, branch,
          startLocalDayUtc, days: 91, event,
          slope: fit.slope, intercept: fit.intercept, residualThresholdDeg,
          DefineStar, starCoordinatesAt: canopusCoordinatesAt
        });
        for (const row of observed) {
          const sourceDate = row.date;
          const sourceInstant = row.clock.instantUtcMs;
          const candidates = scan.events.map(predicted => {
            const predictedDate = new Date(predicted.utcMilliseconds + 330 * 60_000)
              .toISOString().slice(0, 10);
            const dateOffsetDays = Math.round(
              (Date.parse(predictedDate + "T00:00:00Z") -
               Date.parse(sourceDate + "T00:00:00Z")) / 86_400_000
            );
            return {
              predictedLocal: new Date(predicted.utcMilliseconds + 330 * 60_000)
                .toISOString().replace("Z", "+05:30"),
              predictedDate,
              dateOffsetDays,
              absoluteClockResidualMinutes: Math.abs(
                clockOfDayDifferenceMinutes(predicted.utcMilliseconds, sourceInstant)
              )
            };
          }).sort((a, b) => Math.abs(a.dateOffsetDays) - Math.abs(b.dateOffsetDays));
          const best = candidates[0] || null;
          output.push({
            holdoutYear: scenario.holdoutYear,
            trainingThroughYear: scenario.trainingThroughYear,
            mode: scenario.mode,
            event,
            branch,
            quantile: probability,
            residualThresholdDeg,
            trainingSamples: training.length,
            sourceId: row.id,
            sourceDate,
            predictedDate: best?.predictedDate ?? null,
            dateOffsetDays: best?.dateOffsetDays ?? null,
            clockOfDayResidualMinutes: best?.absoluteClockResidualMinutes ?? null,
            candidateCount: candidates.length,
            candidateDates: candidates.map(item => item.predictedDate)
          });
        }
      }
    }
  }
  return output;
}


function buildAgastyaAzimuthModelDiagnostics(rows) {
  const training = rows.filter(row =>
    row.available &&
    row.sourceId === "drikpanchang-almora" &&
    row.body === "Star1" &&
    row.bodyEventResidualMinutes <= 15 &&
    row.horizonAtComputedBodyEvent &&
    Number(row.date.slice(0, 4)) <= 2025
  );
  const groups = new Map();
  for (const row of training) {
    const key = [row.branch, row.eventType].join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      x: azimuthSeparationDegrees(
        row.horizonAtComputedBodyEvent.bodyAzimuthDeg,
        row.horizonAtComputedBodyEvent.sunAzimuthDeg
      ),
      y: row.horizonAtComputedBodyEvent.sunAltitudeDeg,
      id: row.id
    });
  }
  return [...groups.entries()].map(([key, points]) => {
    const fit = fitTheilSenLine(points);
    const linearErrors = [], constantErrors = [], slopes = [];
    for (let index = 0; index < points.length; index++) {
      const holdout = points[index];
      const subset = points.filter((_, i) => i !== index);
      const line = fitTheilSenLine(subset);
      if (line) {
        linearErrors.push(Math.abs(holdout.y - (line.slope * holdout.x + line.intercept)));
        slopes.push(line.slope);
      }
      constantErrors.push(Math.abs(holdout.y - median(subset.map(item => item.y))));
    }
    return {
      key,
      model: "Theil-Sen: Sun altitude = intercept + slope × horizontal azimuth separation",
      samples: points.length,
      slope: fit?.slope ?? null,
      intercept: fit?.intercept ?? null,
      leaveOneYearOutMeanAbsoluteErrorLinearDeg: linearErrors.length
        ? linearErrors.reduce((sum, value) => sum + value, 0) / linearErrors.length : null,
      leaveOneYearOutMeanAbsoluteErrorConstantDeg: constantErrors.length
        ? constantErrors.reduce((sum, value) => sum + value, 0) / constantErrors.length : null,
      leaveOneYearOutSlopeRange: slopes.length
        ? { min: Math.min(...slopes), max: Math.max(...slopes) } : null,
      trainingSourceIds: points.map(item => item.id)
    };
  });
}


function buildAgastyaSeparationDiagnostics(rows) {
  const training = rows.filter(row =>
    row.available &&
    row.sourceId === "drikpanchang-almora" &&
    row.body === "Star1" &&
    row.bodyEventResidualMinutes <= 15 &&
    row.horizonAtComputedBodyEvent &&
    Number(row.date.slice(0, 4)) <= 2025
  );
  const thresholds = new Map();
  for (const row of training) {
    const key = [row.branch, row.eventType].join("|");
    if (!thresholds.has(key)) thresholds.set(key, []);
    thresholds.get(key).push(row.horizonAtComputedBodyEvent.topocentricSeparationDeg);
  }
  const thresholdMap = new Map([...thresholds.entries()].map(([key, values]) => [key, median(values)]));
  return rows.filter(row =>
    row.available &&
    row.sourceId?.startsWith("drikpanchang") &&
    row.body === "Star1" &&
    row.bodyEventResidualMinutes <= 15
  ).map(row => {
    const location = LOCATIONS[row.sourceId];
    const observer = new Observer(location.latitude, location.longitude, location.elevation);
    const threshold = thresholdMap.get([row.branch, row.eventType].join("|")) ?? null;
    const center = Date.parse(row.date + "T00:00:00+05:30");
    const samples = [];
    for (let offset = -4; offset <= 4; offset++) {
      const localDayStartUtc = center + offset * 86_400_000;
      const position = canopusCoordinatesAt(new Date(localDayStartUtc + 12 * 60 * 60_000));
      DefineStar("Star1", position.raHours, position.decDegrees, position.distanceLightYears);
      const event = SearchAltitude(
        "Star1", observer, row.branch === "rise" ? 1 : -1,
        new Date(localDayStartUtc), 1, 0
      );
      const instant = event?.date instanceof Date ? event.date.getTime()
        : event?.date ? new Date(event.date).getTime() : NaN;
      if (!Number.isFinite(instant)) continue;
      const geometry = apparentAtSourceTime("Star1", observer, instant);
      samples.push({
        localDate: new Date(localDayStartUtc + 330 * 60_000).toISOString().slice(0, 10),
        eventLocal: new Date(instant + 330 * 60_000).toISOString(),
        separationDeg: geometry.topocentricSeparationDeg,
        sunAltitudeDeg: geometry.sunAltitudeDeg
      });
    }
    const crossings = [];
    if (Number.isFinite(threshold)) {
      for (let index = 1; index < samples.length; index++) {
        const before = samples[index - 1], after = samples[index];
        if ((before.separationDeg - threshold) * (after.separationDeg - threshold) <= 0) {
          crossings.push({
            localDate: after.localDate,
            direction: after.separationDeg > before.separationDeg ? "increasing" : "decreasing"
          });
        }
      }
    }
    return {
      sourceId: row.id,
      sourceDate: row.date,
      eventType: row.eventType,
      branch: row.branch,
      sourceClock: row.clock.normalizedUtc,
      geometricEventResidualMinutes: row.bodyEventResidualMinutes,
      sourceSeparationDeg: row.horizonAtComputedBodyEvent.topocentricSeparationDeg,
      trainingMedianSeparationDeg: threshold,
      sourceThresholdMarginDeg: Number.isFinite(threshold)
        ? row.horizonAtComputedBodyEvent.topocentricSeparationDeg - threshold : null,
      crossingDates: crossings,
      samples
    };
  });
}


function buildPithoragarhTransferValidation(rows) {
  const trainingSourceId = "drikpanchang-almora";
  const targetSourceId = "drikpanchang-pithoragarh";
  const trainingThroughYear = 2025;
  const trainingLocation = LOCATIONS[trainingSourceId];
  const targetLocation = LOCATIONS[targetSourceId];
  const projectLocation = LOCATIONS["pithoragarh-project-target"];
  const targetObserver = new Observer(
    targetLocation.latitude, targetLocation.longitude, targetLocation.elevation
  );
  const projectObserver = new Observer(
    projectLocation.latitude, projectLocation.longitude, projectLocation.elevation
  );
  const trainingRows = rows.filter(row =>
    row.available &&
    row.sourceId === trainingSourceId &&
    row.body !== "Star1" &&
    row.bodyEventResidualMinutes <= 15 &&
    row.horizonAtComputedBodyEvent &&
    Number(row.date.slice(0, 4)) <= trainingThroughYear
  );
  const trainingGroups = new Map();
  for (const row of trainingRows) {
    const state = row.horizonAtComputedBodyEvent.motionState;
    const key = [row.body, row.branch, row.eventType, state].join("|");
    if (!trainingGroups.has(key)) trainingGroups.set(key, []);
    trainingGroups.get(key).push(row.horizonAtComputedBodyEvent.sunAltitudeDeg);
  }
  const profileQuantiles = new Map([...trainingGroups.keys()].map(key => [
    key, key === "Venus|set|Udaya|direct" ? 0.95 : 0.25
  ]));
  const thresholdProfiles = new Map([...trainingGroups.entries()].map(([key, values]) => [
    key, quantile(values, profileQuantiles.get(key))
  ]));
  const targetRows = rows.filter(row =>
    row.sourceId === targetSourceId &&
    row.body !== "Star1" &&
    row.available &&
    row.bodyEventResidualMinutes <= 15 &&
    row.horizonAtComputedBodyEvent
  );
  if (!trainingRows.length || !targetRows.length) {
    throw new Error("Pithoragarh transfer check requires independent Almora training and Pithoragarh target observations");
  }
  if (trainingRows.some(row => row.sourceId !== trainingSourceId) ||
      targetRows.some(row => row.sourceId !== targetSourceId)) {
    throw new Error("Cross-location transfer source contamination detected");
  }
  const targetIds = targetRows.map(row => row.id);
  if (new Set(targetIds).size !== targetIds.length) {
    throw new Error("Pithoragarh transfer observation IDs must be unique");
  }
  const results = [];
  const missingThresholds = [];
  for (const row of targetRows) {
    const state = row.horizonAtComputedBodyEvent.motionState;
    const key = [row.body, row.branch, row.eventType, state].join("|");
    const threshold = thresholdProfiles.get(key);
    if (!Number.isFinite(threshold)) {
      missingThresholds.push({
        sourceId: row.id, body: row.body, event: row.eventType,
        branch: row.branch, motionState: state, thresholdKey: key
      });
      continue;
    }
    const sourceDateStartUtc = Date.parse(row.date + "T00:00:00+05:30");
    const startLocalDayUtc = sourceDateStartUtc - 3 * 86_400_000;
    const scan = scanDrikSolarAltitudeTransitions({
      SearchRiseSet, SearchAltitude, Equator, Horizon,
      body: row.body, observer: targetObserver, branch: row.branch,
      startLocalDayUtc, days: 7,
      astaSunAltitudeDeg: row.eventType === "Asta" ? { [state]: threshold } : {},
      udayaSunAltitudeDeg: row.eventType === "Udaya" ? { [state]: threshold } : {},
      motionStateAt: (body, instantUtcMs) =>
        apparentAtSourceTime(body, targetObserver, instantUtcMs).motionState
    });
    const projectScan = scanDrikSolarAltitudeTransitions({
      SearchRiseSet, SearchAltitude, Equator, Horizon,
      body: row.body, observer: projectObserver, branch: row.branch,
      startLocalDayUtc, days: 7,
      astaSunAltitudeDeg: row.eventType === "Asta" ? { [state]: threshold } : {},
      udayaSunAltitudeDeg: row.eventType === "Udaya" ? { [state]: threshold } : {},
      motionStateAt: (body, instantUtcMs) =>
        apparentAtSourceTime(body, projectObserver, instantUtcMs).motionState
    });
    const projectCandidates = projectScan.events.map(predicted => {
      const predictedLocal = new Date(predicted.utcMilliseconds + 330 * 60_000)
        .toISOString().replace("Z", "+05:30");
      const predictedDate = predictedLocal.slice(0, 10);
      const dateOffsetDays = Math.round(
        (Date.parse(predictedDate + "T00:00:00Z") -
         Date.parse(row.date + "T00:00:00Z")) / 86_400_000
      );
      return { predicted, predictedLocal, predictedDate, dateOffsetDays };
    }).sort((a, b) =>
      Math.abs(a.dateOffsetDays) - Math.abs(b.dateOffsetDays) ||
      a.predicted.utcMilliseconds - b.predicted.utcMilliseconds
    );
    const projectBest = projectCandidates[0] || null;
    const candidates = scan.events.map(predicted => {
      const predictedLocal = new Date(predicted.utcMilliseconds + 330 * 60_000)
        .toISOString().replace("Z", "+05:30");
      const predictedDate = predictedLocal.slice(0, 10);
      const dateOffsetDays = Math.round(
        (Date.parse(predictedDate + "T00:00:00Z") -
         Date.parse(row.date + "T00:00:00Z")) / 86_400_000
      );
      return { predicted, predictedLocal, predictedDate, dateOffsetDays };
    }).sort((a, b) =>
      Math.abs(a.dateOffsetDays) - Math.abs(b.dateOffsetDays) ||
      a.predicted.utcMilliseconds - b.predicted.utcMilliseconds
    );
    const best = candidates[0] || null;
    results.push({
      sourceId: row.id,
      sourceDate: row.date,
      sourceClockRaw: row.timeRaw,
      body: row.body,
      event: row.eventType,
      branch: row.branch,
      motionState: state,
      thresholdKey: key,
      thresholdQuantile: profileQuantiles.get(key),
      thresholdSunAltitudeDeg: threshold,
      sourceSunAltitudeDeg: row.horizonAtComputedBodyEvent.sunAltitudeDeg,
      sourceThresholdMarginDeg: row.horizonAtComputedBodyEvent.sunAltitudeDeg - threshold,
      predictedLocal: best?.predictedLocal ?? null,
      predictedDate: best?.predictedDate ?? null,
      dateOffsetDays: best?.dateOffsetDays ?? null,
      projectObserverPredictedLocal: projectBest?.predictedLocal ?? null,
      projectObserverPredictedDate: projectBest?.predictedDate ?? null,
      projectObserverDateOffsetDays: projectBest?.dateOffsetDays ?? null,
      projectObserverClockResidualMinutes: projectBest
        ? clockOfDayDifferenceMinutes(projectBest.predicted.utcMilliseconds, row.clock.instantUtcMs)
        : null,
      clockOfDayResidualMinutes: best
        ? clockOfDayDifferenceMinutes(best.predicted.utcMilliseconds, row.clock.instantUtcMs)
        : null,
      candidates: candidates.map(item => item.predictedLocal)
    });
  }
  const matched = results.filter(row => row.predictedDate);
  const offsets = matched.map(row => Math.abs(row.dateOffsetDays));
  const clockResiduals = matched.map(row => Math.abs(row.clockOfDayResidualMinutes));
  const projectMatched = results.filter(row => row.projectObserverPredictedDate);
  const projectOffsets = projectMatched.map(row => Math.abs(row.projectObserverDateOffsetDays));
  const projectClockResiduals = projectMatched.map(row => Math.abs(row.projectObserverClockResidualMinutes));
  return {
    validationType: "cross-location transfer; thresholds trained on Almora only",
    trainingSourceId,
    targetSourceId,
    trainingThroughYear,
    trainingSamples: trainingRows.length,
    targetObserver: {
      name: targetLocation.name,
      latitude: targetLocation.latitude,
      longitude: targetLocation.longitude,
      elevation: targetLocation.elevation
    },
    projectObserver: {
      name: projectLocation.name,
      latitude: projectLocation.latitude,
      longitude: projectLocation.longitude,
      elevation: projectLocation.elevation
    },
    targetObservations: targetRows.length,
    matchedEvents: matched.length,
    exactDate: offsets.filter(value => value === 0).length,
    withinOneDay: offsets.filter(value => value <= 1).length,
    moreThanOneDay: offsets.filter(value => value > 1).length,
    medianAbsoluteClockResidualMinutes: median(clockResiduals),
    maximumAbsoluteClockResidualMinutes: clockResiduals.length ? Math.max(...clockResiduals) : null,
    projectObserverMatchedEvents: projectMatched.length,
    projectObserverExactDate: projectOffsets.filter(value => value === 0).length,
    projectObserverWithinOneDay: projectOffsets.filter(value => value <= 1).length,
    projectObserverMedianAbsoluteClockResidualMinutes: median(projectClockResiduals),
    projectObserverMaximumAbsoluteClockResidualMinutes: projectClockResiduals.length
      ? Math.max(...projectClockResiduals) : null,
    missingThresholds,
    results
  };
}


const rows = [];
for (const observation of dataset.observations) {
  const location = LOCATIONS[observation.sourceId];
  if (!location) continue;
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
  rows.push({
    ...result,
    horizonAtSourceTime,
    horizonAtComputedBodyEvent,
    location: location.name,
    coordinateProfile: observation.sourceId === "drikpanchang-almora" || observation.sourceId === "drikpanchang-ramnagar"
      ? "official-Drik-Panchang-location-details"
      : "printed-panchang-calculation-centre"
  });
}

const eligible = rows.filter(row => row.available);
const report = {
  schemaVersion: 1,
  method: "local apparent rise/set event with calibrated topocentric Sun-altitude threshold",
  horizon: "standard apparent rise/set events; no photometric or naked-eye brightness model",
  benchmarkCounts: {
    observations: dataset.observations.length,
    evaluated: rows.length,
    available: eligible.length,
    rejected: rows.length - eligible.length
  },
  sourceAgreement: buildSourceAgreement(dataset.observations),
  heldOutValidation2026: buildHeldOutValidation(rows, 2026, 2025, "drikpanchang-almora"),
  // Fixed-origin 2027 holdout excludes all 2026 observations from training.
  heldOutValidation2027FixedThrough2025: buildHeldOutValidation(rows, 2027, 2025, "drikpanchang-almora"),
  // Rolling-origin 2027 holdout intentionally includes 2026 training observations.
  heldOutValidation2027RollingThrough2026: buildHeldOutValidation(rows, 2027, 2026, "drikpanchang-almora"),
  // Explicit fixed-vs-rolling Agastya comparison. Never silently treat the
  // earlier, better holdout as proof that the rolling model is release-ready.
  agastya2027TrainingDrift: (() => {
    const fixed = buildHeldOutValidation(rows, 2027, 2025, "drikpanchang-almora");
    const rolling = buildHeldOutValidation(rows, 2027, 2026, "drikpanchang-almora");
    const key = "Star1|set|Asta|fixed-star|azimuth-linear";
    const summarize = holdout => ({
      trainingThroughYear: holdout.trainingThroughYear,
      profile: holdout.agastyaProfiles.find(item => item.key === key) ?? null,
      match: holdout.matches.find(item => item.body === "Star1" &&
        item.event === "Asta" && item.branch === "set") ?? null,
      missedSourceIds: holdout.unmatchedObserved.filter(id =>
        id === "drik-almora-agastya-asta-2027"),
      diagnostics: holdout.unmatchedAgastyaDiagnostics.filter(item =>
        item.sourceId === "drik-almora-agastya-asta-2027")
    });
    return {
      referenceSourceId: "drik-almora-agastya-asta-2027",
      fixed: summarize(fixed),
      rolling: summarize(rolling),
      regression: fixed.matches.some(item => item.body === "Star1" &&
        item.event === "Asta" && item.branch === "set" &&
        item.dateOffsetDays === 0) &&
        rolling.unmatchedObserved.includes("drik-almora-agastya-asta-2027")
    };
  })(),
  timeSeparationDiagnosticGroups: summarizeCalibration(eligible),
  solarAltitudeCalibrationGroups: summarizeSolarAltitudeCalibration(rows),
  agastyaSeparationDiagnostics: buildAgastyaSeparationDiagnostics(rows),
  agastyaAzimuthModelDiagnostics: buildAgastyaAzimuthModelDiagnostics(rows),
  agastyaResidualQuantileDiagnostics: buildAgastyaResidualQuantileDiagnostics(rows),
  planetThresholdQuantileDiagnostics: buildPlanetThresholdQuantileDiagnostics(rows),
  pithoragarhObserverSanity: pithoragarhSunriseSunsetSanity(),
  pithoragarhCrossLocationTransfer: buildPithoragarhTransferValidation(rows),
  observations: rows,
  notes: [
    "This is a Drik-Ganita calibration hypothesis, not a final published calculation.",
    "The local time-separation degrees are retained as diagnostics only; held-out predictions use calibrated topocentric Sun altitude at the target rise/set event.",
    "Drik Almora and Ramnagar are recalculated with the exact coordinates/elevations published on Drik's own location detail pages; Ganesh Martand and Tara Prasad retain their separately transcribed source centres.",
    "Source clock records with ambiguous AM/PM notation are excluded, not guessed.",
    "Ganesh Martand HH.MM clock notation is source-confirmed IST hour-minute with next-day rollover examples; its timestamps remain an independent cross-check and are not pooled into Drik threshold fitting because event-definition equivalence is not assumed.",
    "Drik event clocks are the primary time-calibration observations because they align with computed local apparent rise/set events.",
    "Agastya uses an approximate Canopus J2000 position and needs a pinned catalogue/proper-motion source.",
    "No Surya-Siddhanta K/C formulas or physical/photometric visibility model are used."
  ]
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
