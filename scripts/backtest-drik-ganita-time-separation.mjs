import fs from "node:fs";
import * as Astronomy from "astronomy-engine";
import {
  calibrateObservation,
  parsePrintedClock,
  median,
  clockOfDayDifferenceMinutes,
  scanDrikTimeSeparationTransitions,
  scanDrikSolarAltitudeTransitions,
  summarizeCalibration
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

const LOCATIONS = {
  "ganesh-martand": { name: "Almora", latitude: 29 + 37 / 60, longitude: 79 + 40 / 60, elevation: 0 },
  "drikpanchang-almora": { name: "Almora (coordinate proxy)", latitude: 29 + 37 / 60, longitude: 79 + 40 / 60, elevation: 0 },
  "tara-prasad": { name: "Ramnagar", latitude: 29.5, longitude: 79 + 8 / 60, elevation: 0 },
  "drikpanchang-ramnagar": { name: "Ramnagar (coordinate proxy)", latitude: 29.5, longitude: 79 + 8 / 60, elevation: 0 }
};

// Canopus (Agastya), J2000 approximate catalog position.
// Replace with a pinned astrometric catalogue record before production use.
DefineStar("Star1", 6.3991969, -52.69566, 310);


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
    const key = [row.body, row.branch, row.eventType, row.horizonAtComputedBodyEvent.motionState].join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row.horizonAtComputedBodyEvent.sunAltitudeDeg);
  }
  return [...groups.entries()].map(([key, values]) => ({
    key,
    samples: values.length,
    motionState: key.split("|")[3],
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
  const thresholds = new Map([...thresholdMap.entries()].map(([key, values]) => [key, median(values)]));
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const startLocalDayUtc = Date.parse(`${holdoutYear}-01-01T00:00:00+05:30`);
  const predictions = [];
  for (const body of ["Venus", "Jupiter", "Star1"]) {
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
      beforeSunAltitudeDeg: predicted.beforeSunAltitudeDeg,
      afterSunAltitudeDeg: predicted.afterSunAltitudeDeg,
      sourceSunAltitudeDeg: match.row.horizonAtComputedBodyEvent?.sunAltitudeDeg ?? null,
      sourceThresholdMarginDeg: Number.isFinite(match.row.horizonAtComputedBodyEvent?.sunAltitudeDeg)
        ? match.row.horizonAtComputedBodyEvent.sunAltitudeDeg - predicted.thresholdSunAltitudeDeg
        : null,
      absoluteInstantResidualMinutes: Math.abs(predicted.utcMilliseconds - sourceInstant) / 60_000,
      clockOfDayResidualMinutes: clockOfDayDifferenceMinutes(predicted.utcMilliseconds, sourceInstant)
    });
  }
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
    thresholdProfiles: [...thresholds.entries()].map(([key, value]) => ({ key, thresholdSunAltitudeDeg: value })),
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
    ambiguousMatches,
    duplicatePredictionKeys: [...new Set(duplicatePredictionKeys)],
    matches
  };
}

const rows = [];
for (const observation of dataset.observations) {
  const location = LOCATIONS[observation.sourceId];
  if (!location) continue;
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const localDayStartUtc = Date.parse(observation.date + "T00:00:00+05:30");
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
    coordinateProfile: observation.sourceId.includes("drikpanchang")
      ? "approximate-source-city-coordinate"
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
  timeSeparationDiagnosticGroups: summarizeCalibration(eligible),
  solarAltitudeCalibrationGroups: summarizeSolarAltitudeCalibration(rows),
  observations: rows,
  notes: [
    "This is a Drik-Ganita calibration hypothesis, not a final published calculation.",
    "The local time-separation degrees are retained as diagnostics only; held-out predictions use calibrated topocentric Sun altitude at the target rise/set event.",
    "Drik city coordinates are proxies where exact page coordinates were not captured.",
    "Source clock records with ambiguous AM/PM notation are excluded, not guessed.",
    "Ganesh Martand HH.MM clock notation is source-confirmed IST hour-minute with next-day rollover examples; its timestamps remain an independent cross-check and are not pooled into Drik threshold fitting because event-definition equivalence is not assumed.",
    "Drik event clocks are the primary time-calibration observations because they align with computed local apparent rise/set events.",
    "Agastya uses an approximate Canopus J2000 position and needs a pinned catalogue/proper-motion source.",
    "No Surya-Siddhanta K/C formulas or physical/photometric visibility model are used."
  ]
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
