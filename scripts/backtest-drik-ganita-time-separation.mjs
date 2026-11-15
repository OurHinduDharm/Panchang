import fs from "node:fs";
import { Observer, SearchAltitude, DefineStar } from "astronomy-engine";
import {
  calibrateObservation,
  summarizeCalibration
} from "../research/drik-ganita-time-separation.mjs";

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

const rows = [];
for (const observation of dataset.observations) {
  const location = LOCATIONS[observation.sourceId];
  if (!location) continue;
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  const localDayStartUtc = Date.parse(observation.date + "T00:00:00+05:30");
  const result = calibrateObservation({
    observation,
    SearchAltitude,
    observer,
    localDayStartUtc
  });
  rows.push({
    ...result,
    location: location.name,
    coordinateProfile: observation.sourceId.includes("drikpanchang")
      ? "approximate-source-city-coordinate"
      : "printed-panchang-calculation-centre"
  });
}

const eligible = rows.filter(row => row.available);
const report = {
  schemaVersion: 1,
  method: "geometric-horizon time-separation; 1 kala-degree = 4 minutes",
  horizon: "geometric centre at altitude 0 degrees; no refraction or photometric visibility",
  benchmarkCounts: {
    observations: dataset.observations.length,
    evaluated: rows.length,
    available: eligible.length,
    rejected: rows.length - eligible.length
  },
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
