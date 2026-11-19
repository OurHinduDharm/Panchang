import * as engine from "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
import { calculateAnnualTara } from "./research/annual-tara-runtime.mjs";
import { profiles } from "./research/annual-tara-profiles.mjs";
import { LOCATION_PROFILES } from "./research/drik-ganita-time-separation.mjs";

const locations = {
  ...LOCATION_PROFILES,
  delhi: { latitude: 28.6139, longitude: 77.2090, elevation: 216 },
  dehradun: { latitude: 30.3165, longitude: 78.0322, elevation: 640 }
};

self.onmessage = ({data: {city, year}}) => {
  const result = calculateAnnualTara(engine, locations[city], year, profiles);
  const unavailable = new Set(result.canopusIssues.map(issue => issue.event));
  for (const entry of result.events.filter(e => e.body === "Star1")) {
    // A daytime geometric horizon crossing cannot signal twilight visibility.
    if (entry.thresholdSunAltitudeDeg + entry.afterResidualDeg >= 0) unavailable.add(entry.event);
  }
  const events = result.events.filter(e => e.body !== "Star1" || !unavailable.has(e.event))
    .map(({body, event, utcMilliseconds}) => ({body, event, utcMilliseconds}));
  self.postMessage({events, unavailable: [...unavailable]});
};
