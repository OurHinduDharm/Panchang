import fs from "node:fs";
import { LOCATION_PROFILES } from "../research/drik-ganita-time-separation.mjs";
import { fitAnnualTaraProfiles, measureTaraObservation, predictAnnualTara } from "../research/annual-tara-prediction.mjs";

const trainingSourceId = "drikpanchang-almora";
const trainingThroughYear = 2025;
const { observations } = JSON.parse(fs.readFileSync(
  new URL("../research/drik-ganita-asta-udaya-benchmarks-2019-2027.json", import.meta.url), "utf8"
));
const training = observations.filter(row => row.sourceId === trainingSourceId &&
  Number(row.date.slice(0, 4)) <= trainingThroughYear).map(measureTaraObservation);
const { thresholdProfiles } = fitAnnualTaraProfiles(training, trainingSourceId, trainingThroughYear);

function forecast(location, year) {
  const { observer, events, canopusIssues } = predictAnnualTara(location, year, thresholdProfiles);
  return {
    year, observer, canopusIssues,
    events: events.map(({ body, event, branch, utcMilliseconds }) => ({
      body: body === "Star1" ? "Canopus" : body, event, branch,
      local: new Date(utcMilliseconds + 330 * 60_000).toISOString().replace("Z", "+05:30")
    }))
  };
}

const args = process.argv.slice(2);
let forecasts;
if (args.length === 0) {
  const cities = ["pithoragarh-project-target", "drikpanchang-almora", "drikpanchang-ramnagar"];
  forecasts = cities.flatMap(city => [2026, 2027, 2028, 2029, 2030].map(year =>
    forecast(LOCATION_PROFILES[city], year)));
} else if (args.length === 4) {
  const [year, lat, lon, elevation] = args;
  forecasts = [forecast({ lat, lon, elevation, elevationStatus: "provided" }, Number(year))];
} else {
  throw new Error("Usage: node scripts/predict-annual-tara.mjs [year latitude longitude elevationMeters]");
}

console.log(JSON.stringify({ status: "calculated-research-candidate", timeZone: "Asia/Kolkata",
  trainingSourceId, trainingThroughYear, forecasts }, null, 2));
