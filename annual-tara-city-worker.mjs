import * as engine from "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
import { calculateAnnualTara } from "./research/annual-tara-runtime.mjs";
import { calculateAgastyaArghyaWindows } from "./research/agastya-arghya-window.mjs";
import { profiles } from "./research/annual-tara-profiles.mjs";
import { locations } from "./annual-tara-locations.mjs";
import { kanyaIngressFromSunSign, kanyaPrecedingDawns } from "./research/agastya-traditional-decision.mjs";

self.onmessage = async ({data: {location, city, year}}) => {
  try {
    const result = calculateAnnualTara(
      engine, location ?? locations[city], year, profiles
    );
    const unavailable = result.canopusIssues;
    const events = result.events.filter(entry => entry.body !== "Star1" ||
      !unavailable.some(issue => issue.event === entry.event)).map(({body, event, utcMilliseconds, model}) =>
      ({body, event, utcMilliseconds, model: model ?? "solar-altitude-threshold"}));
    // Astronomical first-visible-rise to sunrise window, not a traditional ritual decision.
    // Never substitute a reference table for a missing astronomical event.
    const observer = new engine.Observer(result.observer.latitude, result.observer.longitude, result.observer.elevation);
    const arghya = calculateAgastyaArghyaWindows(events, observer,
      (site, start) => engine.SearchRiseSet("Sun", site, +1, start, 1));
    // Optional traditional calendar from solar ingress, independent of Canopus.
    // Fail closed without breaking the existing astronomy results.
    let kanyaCalendar = null, kanyaStatus = "ingress-unavailable";
    try {
      const lib = await import("https://esm.sh/@ishubhamx/panchangam-js@3.0.0");
      // Geocentric apparent ecliptic longitude and the same Lahiri ayanamsa
      // used by the daily Panchang. Avoid calculating all nine planets,
      // sunrise-dependent scalar fields or kundli for each bisection step.
      const signAt = ms => {
        const instant = new Date(ms);
        const longitude = engine.SunPosition(instant).elon;
        const ayanamsa = lib.getAyanamsa(instant);
        if (!Number.isFinite(longitude) || !Number.isFinite(ayanamsa)) return null;
        return Math.floor(((longitude - ayanamsa + 360) % 360) / 30);
      };
      const ingress = kanyaIngressFromSunSign(result.year,signAt);
      if (Number.isFinite(ingress)) kanyaStatus = "dawn-unavailable";
      const dawns = kanyaPrecedingDawns(ingress,date=>{
        const midnight = Date.parse(date+"T00:00:00+05:30");
        const dawn = engine.SearchAltitude("Sun",observer,+1,new Date(midnight),1,-12);
        const sunrise = engine.SearchRiseSet("Sun",observer,+1,new Date(midnight),1);
        return {dawnUtcMilliseconds:dawn?.date?.getTime(),sunriseUtcMilliseconds:sunrise?.date?.getTime()};
      });
      if(dawns.length===7) {
        kanyaCalendar = {ingressUtcMilliseconds:ingress,dawns};
        kanyaStatus = "calculated";
      }
    } catch (_) { kanyaStatus = "calculation-error"; }
    self.postMessage({
      events, arghya, kanyaCalendar, kanyaStatus, unavailable, year: result.year,
      observer: result.observer,
      elevationSourceApproximate: result.elevationSourceApproximate
    });
  } catch (error) {
    self.postMessage({error: error instanceof Error ? error.message : "Calculation failed"});
  }
};
