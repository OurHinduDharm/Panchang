import * as engine from "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
import { calculateAnnualTara } from "./research/annual-tara-runtime.mjs";
import { calculateAgastyaArghyaWindows } from "./research/agastya-arghya-window.mjs";
import { profiles } from "./research/annual-tara-profiles.mjs";
import { locations } from "./annual-tara-locations.mjs";

self.onmessage = ({data: {location, city, year}}) => {
  try {
    const result = calculateAnnualTara(
      engine, location ?? locations[city], year, profiles
    );
    const unavailable = result.canopusIssues;
    const events = result.events.map(({body, event, utcMilliseconds, model}) =>
      ({body, event, utcMilliseconds, model: model ?? "solar-altitude-threshold"}));
    // Independent Arghya window: calculated Canopus heliacal rise until local sunrise.
    // Never substitute a reference table for a missing astronomical event.
    const observer = new engine.Observer(result.observer.latitude, result.observer.longitude, result.observer.elevation);
    const arghya = calculateAgastyaArghyaWindows(events, observer,
      (site, start) => engine.SearchRiseSet("Sun", site, +1, start, 1));
    self.postMessage({
      events, arghya, unavailable, year: result.year,
      observer: result.observer,
      elevationSourceApproximate: result.elevationSourceApproximate
    });
  } catch (error) {
    self.postMessage({error: error instanceof Error ? error.message : "Calculation failed"});
  }
};
