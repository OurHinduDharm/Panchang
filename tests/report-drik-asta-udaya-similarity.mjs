import { readFile } from "node:fs/promises";
import { Equator, Horizon, Illumination, Observer, SearchRiseSet } from "astronomy-engine";

const dataset = JSON.parse(await readFile(new URL("../data/asta-udaya-benchmark.json", import.meta.url), "utf8"));
const thresholds = { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15 };

function localNoon(dateString) {
  return new Date(dateString + "T12:00:00+05:30");
}

function addDays(dateString, days) {
  const date = new Date(dateString + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function angularSeparation(body, date, observer) {
  const planet = Equator(body, date, observer, true, true);
  const sun = Equator("Sun", date, observer, true, true);
  const vector = point => {
    const ra = point.ra * Math.PI / 12;
    const dec = point.dec * Math.PI / 180;
    return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  };
  const a = vector(planet);
  const b = vector(sun);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return Math.acos(dot) * 180 / Math.PI;
}

function formatIST(date) {
  return new Date(date.getTime() + 330 * 60000)
    .toISOString()
    .replace("Z", "+05:30");
}

function horizontalPosition(body, date, observer, refraction = null) {
  const equatorial = Equator(body, date, observer, true, true);
  return Horizon(
    date,
    observer,
    equatorial.ra,
    equatorial.dec,
    refraction
  );
}

function wrap180(degrees) {
  return ((degrees + 180) % 360 + 360) % 360 - 180;
}

function round4(value) {
  return Number(value.toFixed(4));
}

function findBoundary(body, timestamp, threshold, type, observer) {
  const target = Date.parse(timestamp);
  const centerDate = timestamp.slice(0, 10);
  let previousDate = addDays(centerDate, -30);
  let previousValue = angularSeparation(body, localNoon(previousDate), observer);

  for (let day = -29; day <= 30; day++) {
    const date = addDays(centerDate, day);
    const value = angularSeparation(body, localNoon(date), observer);
    const crossed = type === "asta"
      ? previousValue > threshold && value <= threshold
      : previousValue <= threshold && value > threshold;
    if (crossed) {
      let low = localNoon(previousDate).getTime();
      let high = localNoon(date).getTime();
      for (let i = 0; i < 24 && high - low > 30000; i++) {
        const middle = (low + high) / 2;
        const angle = angularSeparation(body, new Date(middle), observer);
        const past = type === "asta" ? angle <= threshold : angle > threshold;
        if (past) high = middle;
        else low = middle;
      }
      return new Date((low + high) / 2);
    }
    previousDate = date;
    previousValue = value;
  }
  return null;
}

const report = [];
for (const entry of dataset.cases) {
  if (entry.precision !== "minute" || !entry.testObserver?.latitude || !entry.testObserver?.longitude) continue;
  const observer = new Observer(
    entry.testObserver.latitude,
    entry.testObserver.longitude,
    entry.testObserver.elevationMeters ?? 0
  );
  const threshold = thresholds[entry.planet];
  for (const [key, type] of [["astaStart", "asta"], ["astaEnd", "udaya"]]) {
    const published = entry.boundaries[key];
    const publishedInstant = new Date(published);
    const calculated = findBoundary(entry.planet, published, threshold, type, observer);
    const sunHorizontal = horizontalPosition("Sun", publishedInstant, observer, "normal");
    const planetHorizontal = horizontalPosition(entry.planet, publishedInstant, observer, "normal");
    const sunGeometric = horizontalPosition("Sun", publishedInstant, observer);
    const planetGeometric = horizontalPosition(entry.planet, publishedInstant, observer);
    const publishedSeparation = angularSeparation(entry.planet, publishedInstant, observer);\n    const publishedIllumination = Illumination(entry.planet, publishedInstant);
    const horizonCrossingDirection = sunHorizontal.azimuth < 180 ? 1 : -1;
    const horizonCrossing = SearchRiseSet(
      entry.planet,
      observer,
      horizonCrossingDirection,
      new Date(publishedInstant.getTime() - 12 * 3600000),
      1,
      0
    );
    const horizonCrossingDate = horizonCrossing?.date ?? null;
    const geometryValues = [
      sunHorizontal.altitude, planetHorizontal.altitude,
      sunHorizontal.azimuth, planetHorizontal.azimuth,
      sunGeometric.altitude, planetGeometric.altitude,
      publishedSeparation
    ];
    if (!geometryValues.every(Number.isFinite)) {
      throw new Error("Non-finite horizon geometry for " + entry.id + " " + key);
    }
    report.push({
      case: entry.id,
      sourceId: entry.sourceId,
      planet: entry.planet,
      apparitionKey: [entry.planet, entry.boundaries.astaStart, entry.boundaries.astaEnd].join("|"),
      location: entry.sourceLocation,
      boundary: key,
      boundaryKind: type,
      publishedIST: published,
      modelIST: calculated ? formatIST(calculated) : null,
      publishedAngularSeparationDegrees: round4(publishedSeparation),\n      publishedApparentMagnitude: round4(publishedIllumination.mag),\n      publishedPhaseAngleDegrees: round4(publishedIllumination.phase_angle),\n      publishedPhaseFraction: round4(publishedIllumination.phase_fraction),\n      heliocentricDistanceAu: round4(publishedIllumination.helio_dist),\n      geocentricDistanceAu: round4(publishedIllumination.geo_dist),
      thresholdMinusPublishedAngleDegrees: round4(threshold - publishedSeparation),
      publishedSunAltitudeDegrees: round4(sunHorizontal.altitude),
      publishedPlanetAltitudeDegrees: round4(planetHorizontal.altitude),
      publishedPlanetMinusSunAltitudeDegrees: round4(planetHorizontal.altitude - sunHorizontal.altitude),
      publishedSunAzimuthDegrees: round4(sunHorizontal.azimuth),
      publishedPlanetAzimuthDegrees: round4(planetHorizontal.azimuth),
      publishedAzimuthDifferenceDegrees: round4(Math.abs(wrap180(planetHorizontal.azimuth - sunHorizontal.azimuth))),
      geometricSunAltitudeDegrees: round4(sunGeometric.altitude),
      geometricPlanetAltitudeDegrees: round4(planetGeometric.altitude),
      horizonCrossingDirection: horizonCrossingDirection > 0 ? "rise" : "set",
      horizonCrossingIST: horizonCrossingDate ? formatIST(horizonCrossingDate) : null,
      horizonCrossingDeltaMinutes: horizonCrossingDate
        ? Math.round((horizonCrossingDate.getTime() - publishedInstant.getTime()) / 60000)
        : null,
      signedDifferenceMinutes: calculated ? Math.round((calculated.getTime() - publishedInstant.getTime()) / 60000) : null,
      thresholdDegrees: threshold,
      observer: { latitude: observer.latitude, longitude: observer.longitude, elevationMeters: observer.height },
      status: calculated ? "diagnostic-only" : "no-crossing-found"
    });
  }
}

const uniqueBoundaryMap = new Map();
for (const row of report) {
  const key = [row.planet, row.boundary, row.publishedIST].join("|");
  const existing = uniqueBoundaryMap.get(key);
  if (existing) {
    existing.duplicateCaseIds.push(row.case);
    if (!existing.sourceIds.includes(row.sourceId)) existing.sourceIds.push(row.sourceId);
  } else {
    uniqueBoundaryMap.set(key, {
      ...row,
      duplicateCaseIds: [],
      sourceIds: [row.sourceId]
    });
  }
}
const uniqueBoundaries = [...uniqueBoundaryMap.values()];

function summarize(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  return {
    count: sorted.length,
    min: Number(sorted[0].toFixed(4)),
    median: Number(sorted[Math.floor(sorted.length / 2)].toFixed(4)),
    max: Number(sorted.at(-1).toFixed(4)),
    mean: Number((sorted.reduce((sum, value) => sum + value, 0) / sorted.length).toFixed(4))
  };
}

const horizonCrossingOffsets = uniqueBoundaries.map(row => row.horizonCrossingDeltaMinutes);
if (horizonCrossingOffsets.some(value => !Number.isFinite(value))) {
  throw new Error("Missing local rise/set crossing for one or more published boundaries");
}
const maxAbsoluteHorizonCrossingDeltaMinutes = Math.max(...horizonCrossingOffsets.map(Math.abs));
if (maxAbsoluteHorizonCrossingDeltaMinutes > 1) {
  throw new Error("A published boundary differs from local planet rise/set by more than one minute");
}

function localMidnight(dateString) {
  return new Date(dateString + "T00:00:00+05:30");
}

const twilightPredictions = [];
for (const target of uniqueBoundaries) {
  const training = uniqueBoundaries.filter(row =>
    row.planet === target.planet &&
    row.horizonCrossingDirection === target.horizonCrossingDirection &&
    row.apparitionKey !== target.apparitionKey
  );
  if (training.length < 2) {
    twilightPredictions.push({
      planet: target.planet,
      boundary: target.boundary,
      publishedIST: target.publishedIST,
      horizonCrossingDirection: target.horizonCrossingDirection,
      trainingSampleCount: training.length,
      status: "insufficient-independent-apparition-training"
    });
    continue;
  }

  const sortedTrainingAltitudes = training
    .map(row => row.publishedSunAltitudeDegrees)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const thresholdSunAltitude = sortedTrainingAltitudes[Math.floor(sortedTrainingAltitudes.length / 2)];
  const observer = new Observer(
    target.observer.latitude,
    target.observer.longitude,
    target.observer.elevationMeters
  );
  const centerDate = target.publishedIST.slice(0, 10);
  const candidates = [];

  for (let offset = -30; offset <= 30; offset++) {
    const dateString = addDays(centerDate, offset);
    const crossing = SearchRiseSet(
      target.planet,
      observer,
      target.horizonCrossingDirection === "rise" ? 1 : -1,
      localMidnight(dateString),
      1,
      0
    );
    if (!crossing) continue;
    const sun = horizontalPosition("Sun", crossing.date, observer, "normal");
    candidates.push({
      date: dateString,
      time: crossing.date,
      sunAltitudeDegrees: sun.altitude,
      thresholdResidualDegrees: Math.abs(sun.altitude - thresholdSunAltitude)
    });
  }

  candidates.sort((a, b) =>
    a.thresholdResidualDegrees - b.thresholdResidualDegrees ||
    Math.abs(a.time.getTime() - Date.parse(target.publishedIST)) -
      Math.abs(b.time.getTime() - Date.parse(target.publishedIST))
  );
  const predicted = candidates[0];
  twilightPredictions.push({
    planet: target.planet,
    boundary: target.boundary,
    publishedIST: target.publishedIST,
    predictedIST: predicted ? formatIST(predicted.time) : null,
    horizonCrossingDirection: target.horizonCrossingDirection,
    trainingSampleCount: training.length,
    thresholdSunAltitudeDegrees: round4(thresholdSunAltitude),
    predictedSunAltitudeDegrees: predicted ? round4(predicted.sunAltitudeDegrees) : null,
    thresholdResidualDegrees: predicted ? round4(predicted.thresholdResidualDegrees) : null,
    signedDifferenceMinutes: predicted
      ? Math.round((predicted.time.getTime() - Date.parse(target.publishedIST)) / 60000)
      : null,
    status: predicted ? "leave-one-apparition-out-diagnostic" : "no-daily-crossing-found"
  });
}

const twilightSummaryByPlanet = {};
for (const planet of [...new Set(twilightPredictions.map(row => row.planet))].sort()) {
  for (const direction of ["rise", "set"]) {
    const rows = twilightPredictions.filter(row =>
      row.planet === planet &&
      row.horizonCrossingDirection === direction &&
      Number.isFinite(row.signedDifferenceMinutes)
    );
    if (!rows.length) continue;
    twilightSummaryByPlanet[planet] ??= {};
    twilightSummaryByPlanet[planet][direction] = {
      predictions: rows.length,
      meanAbsoluteErrorMinutes: round4(rows.reduce((sum, row) => sum + Math.abs(row.signedDifferenceMinutes), 0) / rows.length),
      medianAbsoluteErrorMinutes: summarize(rows.map(row => Math.abs(row.signedDifferenceMinutes)))?.median ?? null,
      maxAbsoluteErrorMinutes: Math.max(...rows.map(row => Math.abs(row.signedDifferenceMinutes)))
    };
  }
}

const summaryByPlanet = {};
for (const planet of [...new Set(uniqueBoundaries.map(row => row.planet))].sort()) {
  const rows = uniqueBoundaries.filter(row => row.planet === planet);
  summaryByPlanet[planet] = {
    uniqueBoundaries: rows.length,
    planetAltitudeDegrees: summarize(rows.map(row => row.publishedPlanetAltitudeDegrees)),
    sunAltitudeDegrees: summarize(rows.map(row => row.publishedSunAltitudeDegrees)),
    angularSeparationDegrees: summarize(rows.map(row => row.publishedAngularSeparationDegrees)),\n    apparentMagnitude: summarize(rows.map(row => row.publishedApparentMagnitude)),\n    phaseAngleDegrees: summarize(rows.map(row => row.publishedPhaseAngleDegrees)),\n    phaseFraction: summarize(rows.map(row => row.publishedPhaseFraction)),
    azimuthDifferenceDegrees: summarize(rows.map(row => row.publishedAzimuthDifferenceDegrees)),
    horizonCrossingDeltaMinutes: summarize(rows.map(row => row.horizonCrossingDeltaMinutes))
  };
}

console.log(JSON.stringify({
  title: "Drik boundary geometry diagnostic — topocentric angle and local horizon",
  warning: "Not a Drik clone or acceptance result. Pithoragarh provider coordinates are undisclosed; this compares a project-selected observer at the same city label. Horizontal coordinates are diagnostic samples at the published instant, not inferred Drik thresholds. Source provenance is retained per boundary.",
  uniqueBoundaryCount: uniqueBoundaries.length,
  maxAbsoluteHorizonCrossingDeltaMinutes,
  summaryByPlanet,
  twilightSelector: {
    method: "Leave-one-apparition-out median Sun apparent-altitude threshold, then choose the nearest daily planet rise/set crossing within +/-30 days.",
    warning: "Exploratory diagnostic only. Training boundaries are mostly user-transcribed; the threshold is not accepted as Drik's visibility criterion.",
    summaryByPlanet: twilightSummaryByPlanet,
    predictions: twilightPredictions
  },
  uniqueBoundaries,
  cases: report
}, null, 2));
