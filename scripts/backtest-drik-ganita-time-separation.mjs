import fs from "node:fs";
import * as Astronomy from "astronomy-engine";
import {
  calibrateObservation,
  parsePrintedClock,
  summarizeCalibration
} from "../research/drik-ganita-time-separation.mjs";

const { Observer, SearchRiseSet, DefineStar, Equator, Horizon } = Astronomy.default || Astronomy;

const dataset = JSON.parse(fs.readFileSync(
  new URL("../research/drik-ganita-asta-udaya-benchmarks-2019-2027.json", import.meta.url),
  "utf8"
));

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
    if (/उदय/.test(label)) return "Agastya-Udaya";
    if (/अस्त/.test(label)) return "Agastya-Asta";
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
      absoluteInstantDifferenceMinutes: match.a !== null && match.b !== null
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
  return {
    sunAltitudeDeg: sunHorizon.altitude,
    bodyAltitudeDeg: bodyHorizon.altitude,
    sunAzimuthDeg: sunHorizon.azimuth,
    bodyAzimuthDeg: bodyHorizon.azimuth,
    topocentricSeparationDeg: angularSeparationDegrees(sunEquator, bodyEquator)
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
    observer,
    localDayStartUtc
  });
  const horizonAtSourceTime = result.clock?.valid && result.body
    ? apparentAtSourceTime(result.body, observer, result.clock.instantUtcMs)
    : null;
  rows.push({
    ...result,
    horizonAtSourceTime,
    location: location.name,
    coordinateProfile: observation.sourceId.includes("drikpanchang")
      ? "approximate-source-city-coordinate"
      : "printed-panchang-calculation-centre"
  });
}

const eligible = rows.filter(row => row.available);
const report = {
  schemaVersion: 1,
  method: "local apparent rise/set time-separation; one time-degree = one mean sidereal day / 360",
  horizon: "standard apparent rise/set events; no photometric or naked-eye brightness model",
  benchmarkCounts: {
    observations: dataset.observations.length,
    evaluated: rows.length,
    available: eligible.length,
    rejected: rows.length - eligible.length
  },
  sourceAgreement: buildSourceAgreement(dataset.observations),
  calibrationGroups: summarizeCalibration(eligible),
  observations: rows,
  notes: [
    "This is a Drik-Ganita calibration hypothesis, not a final published calculation.",
    "Drik city coordinates are proxies where exact page coordinates were not captured.",
    "Source clock records with ambiguous AM/PM notation are excluded, not guessed.",
    "Agastya uses an approximate Canopus J2000 position and needs a pinned catalogue/proper-motion source.",
    "No Surya-Siddhanta K/C formulas or physical/photometric visibility model are used."
  ]
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
