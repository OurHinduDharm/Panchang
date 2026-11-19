import * as engine from "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
import { calculateAnnualTara } from "./research/annual-tara-runtime.mjs";
import { profiles } from "./research/annual-tara-profiles.mjs";
import { locations } from "./annual-tara-locations.mjs";

self.onmessage = ({data: {location, city, year}}) => {
  const result = calculateAnnualTara(engine, location ?? locations[city], year, profiles);
  const unavailable = new Set(result.canopusIssues.map(issue => issue.event));
  const events = result.events.filter(e => e.body !== "Star1" || !unavailable.has(e.event))
    .map(({body, event, utcMilliseconds}) => ({body, event, utcMilliseconds}));
  self.postMessage({events, unavailable: [...unavailable]});
};
