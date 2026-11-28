// Dedicated calculation worker for daily Guru/Shukra. Coordinates are kept
// in the worker's bounded memory cache; they are never sent to a server.
import * as engine from "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js";
import {calculateAnnualTara} from "./research/annual-tara-runtime.mjs";
import {profiles} from "./research/annual-tara-profiles.mjs";
import {selectDailyPlanetaryWindow} from "./research/daily-planetary-window.mjs";
const planetProfiles = profiles.filter(p=>p.key.startsWith("Jupiter|") || p.key.startsWith("Venus|"));
const cache = new Map();
self.onmessage = ({data}) => {
  const {id,location,date}=data;
  try {
    const year=Number(String(date).slice(0,4));
    if(!Number.isInteger(year)||year<2021||year>2035 ||
      ![location?.latitude,location?.longitude,location?.elevation].every(Number.isFinite)) throw Error("invalid observer or year");
    const getAnnual=y=>{
      const key=[location.latitude,location.longitude,location.elevation,y].join("/");
      if(!cache.has(key)){
        const result=calculateAnnualTara(engine,location,y,planetProfiles).events;
        if(cache.size>=12) cache.delete(cache.keys().next().value);
        cache.set(key,result);
      }
      return cache.get(key);
    };
    // Include the previous and following year as boundary context, not as
    // extra public selector years. Never borrow a different city's data.
    const events=[year-1,year,year+1].flatMap(getAnnual);
    const windows=Object.fromEntries(["Jupiter","Venus"].map(body=>[body,selectDailyPlanetaryWindow(events,body,date)]));
    self.postMessage({id,windows});
  } catch (_) { self.postMessage({id,windows:null}); }
};