import * as engine from "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
import { calculateAnnualTara } from "./research/annual-tara-runtime.mjs";
import { profiles } from "./research/annual-tara-profiles.mjs";
import { locations } from "./annual-tara-locations.mjs";

self.onmessage = ({data: {location, city, year}}) => {
  try {
    const result = calculateAnnualTara(
      engine, location ?? locations[city], year, profiles,
      {allowSeaLevelApproximation: true}
    );
    const unavailable = result.canopusIssues;
    const events = result.events.map(({body, event, utcMilliseconds, model}) =>
      ({body, event, utcMilliseconds, model: model ?? "solar-altitude-threshold"}));
    self.postMessage({
      events, unavailable, year: result.year,
      observer: result.observer,
      elevationApproximate: result.elevationApproximate,
      elevationSourceApproximate: result.elevationSourceApproximate
    });
  } catch (error) {
    self.postMessage({error: error instanceof Error ? error.message : "Calculation failed"});
  }
};
