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
    let kanyaCalendar = null;
    try {
      const lib = await import("https://esm.sh/@ishubhamx/panchangam-js@3.0.0");
      const site = new lib.Observer(result.observer.latitude,result.observer.longitude,result.observer.elevation);
      const signAt = ms => {
        const sun = lib.getPanchangam(new Date(ms),site,{timezoneOffset:330,calendarType:"purnimanta"})?.planetaryPositions?.sun;
        let raw = sun?.rashiName ?? sun?.signName ?? sun?.rashi ?? sun?.rashiIndex ?? sun?.sign;
        if(raw && typeof raw === "object") raw = raw.index ?? raw.number ?? raw.value ?? raw.name ?? raw.label;
        if(Number.isInteger(raw)) return raw;
        const name = String(raw??"").toLowerCase();
        return /simha|leo|सिंह/.test(name)?4:/kanya|virgo|कन्या/.test(name)?5:null;
      };
      const ingress = kanyaIngressFromSunSign(result.year,signAt);
      const dawns = kanyaPrecedingDawns(ingress,date=>{
        const midnight = Date.parse(date+"T00:00:00+05:30");
        const sunset = engine.SearchRiseSet("Sun",observer,-1,new Date(midnight-18*3600000),1);
        const sunrise = engine.SearchRiseSet("Sun",observer,+1,new Date(midnight),1);
        return {sunsetUtcMilliseconds:sunset?.date?.getTime(),sunriseUtcMilliseconds:sunrise?.date?.getTime()};
      });
      if(dawns.length===7) kanyaCalendar = {ingressUtcMilliseconds:ingress,dawns};
    } catch (_) {}
    self.postMessage({
      events, arghya, kanyaCalendar, unavailable, year: result.year,
      observer: result.observer,
      elevationSourceApproximate: result.elevationSourceApproximate
    });
  } catch (error) {
    self.postMessage({error: error instanceof Error ? error.message : "Calculation failed"});
  }
};
