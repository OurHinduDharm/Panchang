/**
 * Research-only physical heliacal visibility audit for Canopus (Agastya).
 *
 * Distinguishes modern Schaefer visibility transitions from Drik's traditional
 * Agastya Arghya calendar event. It never overwrites the traditional data.
 */
import fs from "node:fs";
import * as Astronomy from "astronomy-engine";
import { getCanopusVisibilitySample } from "../agastya-canopus-position.mjs";

const OBSERVER_PROFILE = Object.freeze({
  latitude:29.5828, longitude:80.2182, height:1650,
  name:"Pithoragarh, Uttarakhand, India"
});
const TIME_ZONE_OFFSET_MINUTES=330;
const DAY_MS=86_400_000;

function dateOf(value) {
  const date=value instanceof Date?new Date(value):new Date(value);
  if(!Number.isFinite(date.getTime())) throw new TypeError("A valid date is required");
  return date;
}
function asDate(event) {
  const date=event?.date instanceof Date?event.date:new Date(event?.date??NaN);
  return Number.isFinite(date.getTime())?date:null;
}
function localDate(instant) {
  const shifted=new Date(instant.getTime()+TIME_ZONE_OFFSET_MINUTES*60_000);
  return shifted.toISOString().slice(0,10);
}
function localClock(instant) {
  const shifted=new Date(instant.getTime()+TIME_ZONE_OFFSET_MINUTES*60_000);
  return shifted.toISOString().slice(11,16);
}
function utcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
}

export function locateVisibilityTransition({before,after,sampleAt,transition,precisionSeconds=1}) {
  if(!before||!after||typeof sampleAt!=="function") throw new TypeError("Transition endpoints and sampler are required");
  if(!["appearance","disappearance"].includes(transition)) throw new RangeError("transition must be appearance or disappearance");
  const beforeVisible=before.visible===true,afterVisible=after.visible===true;
  if(transition==="appearance"&&(beforeVisible||!afterVisible)) throw new RangeError("appearance requires invisible then visible endpoints");
  if(transition==="disappearance"&&(!beforeVisible||afterVisible)) throw new RangeError("disappearance requires visible then invisible endpoints");
  let lo=dateOf(before.instant),hi=dateOf(after.instant);
  if(hi<=lo) throw new RangeError("after must be later than before");
  while(hi.getTime()-lo.getTime()>precisionSeconds*1000) {
    const mid=new Date((lo.getTime()+hi.getTime())/2);
    const visible=sampleAt(mid).visible===true;
    if(transition==="appearance") {
      if(visible) hi=mid; else lo=mid;
    } else {
      if(visible) lo=mid; else hi=mid;
    }
  }
  const instant=transition==="appearance"?hi:lo;
  return Object.freeze({instant:instant.toISOString(),localDate:localDate(instant),localTime:localClock(instant),transition,precisionSeconds});
}

export function findAnnualVisibilityTransitions(dailyRows) {
  const rows=[...dailyRows].sort((a,b)=>a.date.localeCompare(b.date));
  const morningRises=[],eveningSets=[];
  for(let i=1;i<rows.length;i++) {
    const previous=rows[i-1],current=rows[i];
    if(previous.morningVisible===false&&current.morningVisible===true) {
      morningRises.push({date:current.date,firstVisible:current.morningFirstVisible??null});
    }
    if(previous.eveningVisible===true&&current.eveningVisible===false) {
      eveningSets.push({date:previous.date,lastVisible:previous.eveningLastVisible??null});
    }
  }
  return {morningRises,eveningSets};
}

function sample(instant,observer,visibilityOptions) {
  const result=getCanopusVisibilitySample({
    astronomy:Astronomy,observer,instant,visibilityOptions,refraction:"normal"
  });
  return {
    instant:result.instant,
    visible:result.visibility.visible===true,
    altitudeDeg:result.altitudeDeg,
    azimuthDeg:result.azimuthDeg,
    sunAltitudeDeg:result.sunAltitudeDeg,
    sunAzimuthDeg:result.sunAzimuthDeg,
    visibilityMargin:result.visibility.visibilityMargin??null,
    limitingMagnitude:result.visibility.limitingMagnitude??null,
    reason:result.visibility.reason
  };
}

function scanTwilightWindow({start,end,period,observer,visibilityOptions,stepSeconds=120}) {
  const startMs=start.getTime(),endMs=end.getTime();
  if(endMs<=startMs) return {visible:false,first:null,last:null,samples:0};
  const points=[];
  for(let ms=startMs;ms<=endMs;ms+=stepSeconds*1000) {
    points.push(sample(new Date(Math.min(ms,endMs)),observer,visibilityOptions));
  }
  if(points.at(-1).instant!==end.toISOString()) points.push(sample(end,observer,visibilityOptions));
  let first=null,last=null;
  for(let i=1;i<points.length;i++) {
    const before=points[i-1],after=points[i];
    if(!before.visible&&after.visible&&!first) {
      first=locateVisibilityTransition({
        before:{instant:before.instant,visible:false},
        after:{instant:after.instant,visible:true},
        sampleAt:instant=>sample(instant,observer,visibilityOptions),
        transition:"appearance",precisionSeconds:1
      });
    }
    if(before.visible&&!after.visible) {
      last=locateVisibilityTransition({
        before:{instant:before.instant,visible:true},
        after:{instant:after.instant,visible:false},
        sampleAt:instant=>sample(instant,observer,visibilityOptions),
        transition:"disappearance",precisionSeconds:1
      });
    }
  }
  const visiblePoints=points.filter(point=>point.visible);
  if(!first&&points[0]?.visible) first={instant:points[0].instant,localDate:localDate(new Date(points[0].instant)),localTime:localClock(new Date(points[0].instant)),transition:"already-visible-at-window-start"};
  if(!last&&points.at(-1)?.visible) {
    const p=points.at(-1);
    last={instant:p.instant,localDate:localDate(new Date(p.instant)),localTime:localClock(new Date(p.instant)),transition:"still-visible-at-window-end"};
  }
  const withMargins=points.filter(point=>Number.isFinite(point.visibilityMargin));
  const bestVisibilitySample=withMargins.sort((a,b)=>b.visibilityMargin-a.visibilityMargin)[0]??null;
  const peakAltitudeSample=points.reduce((best,point)=>
    !best||point.altitudeDeg>best.altitudeDeg?point:best,null);
  return {
    visible:visiblePoints.length>0,
    first,last,samples:points.length,
    maxVisibilityMargin:bestVisibilitySample?.visibilityMargin??null,
    bestVisibilitySample,
    peakAltitudeSample
  };
}

function dailyTwilight(date,observer,visibilityOptions) {
  const day=utcDay(date);
  const sun=Astronomy.Body.Sun;
  const dawn=asDate(Astronomy.SearchAltitude(sun,observer,+1,day,1.25,-18));
  const sunrise=asDate(Astronomy.SearchRiseSet(sun,observer,+1,day,1.25));
  const sunset=asDate(Astronomy.SearchRiseSet(sun,observer,-1,day,1.25));
  const dusk=asDate(Astronomy.SearchAltitude(sun,observer,-1,day,1.25,-18));
  const morning=dawn&&sunrise&&sunrise>dawn
    ?scanTwilightWindow({start:dawn,end:sunrise,period:"morning",observer,visibilityOptions}):{visible:false,first:null,last:null,samples:0};
  const evening=sunset&&dusk&&dusk>sunset
    ?scanTwilightWindow({start:sunset,end:dusk,period:"evening",observer,visibilityOptions}):{visible:false,first:null,last:null,samples:0};
  return {
    date:localDate(date),
    morningVisible:morning.visible,
    morningFirstVisible:morning.first,
    morningSamples:morning.samples,
    morningMaxVisibilityMargin:morning.maxVisibilityMargin??null,
    morningBestVisibilitySample:morning.bestVisibilitySample??null,
    morningPeakAltitudeSample:morning.peakAltitudeSample??null,
    eveningVisible:evening.visible,
    eveningLastVisible:evening.last,
    eveningSamples:evening.samples,
    eveningMaxVisibilityMargin:evening.maxVisibilityMargin??null,
    eveningBestVisibilitySample:evening.bestVisibilitySample??null,
    eveningPeakAltitudeSample:evening.peakAltitudeSample??null
  };
}

function parseLocalDateTime(value) {
  return new Date(value+"+05:30");
}

export function buildAgastyaPhysicalVisibilityAudit({
  startYear=2024,endYear=2030,observerProfile=OBSERVER_PROFILE,
  arghyaData,visibilityOptions={extinctionCoefficient:0.25,zenithLimitingMagnitude:6}
}={}) {
  if(!Number.isInteger(startYear)||!Number.isInteger(endYear)||endYear<startYear) throw new RangeError("Invalid year range");
  if(!arghyaData||!Array.isArray(arghyaData.years)) throw new TypeError("Traditional Agastya Arghya data is required");
  const observer=new Astronomy.Observer(observerProfile.latitude,observerProfile.longitude,observerProfile.height);
  const scanStart=new Date(Date.UTC(startYear-1,11,30));
  const scanEnd=new Date(Date.UTC(endYear+1,0,2));
  const daily=[];
  for(let day=scanStart.getTime();day<=scanEnd.getTime();day+=DAY_MS) {
    daily.push(dailyTwilight(new Date(day),observer,visibilityOptions));
  }
  const transitions=findAnnualVisibilityTransitions(daily);
  const annual=[];
  for(let year=startYear;year<=endYear;year++) {
    const rise=transitions.morningRises.find(item=>item.date.startsWith(String(year)+"-"))??null;
    const set=transitions.eveningSets.find(item=>item.date.startsWith(String(year)+"-"))??null;
    const source=arghyaData.years.find(item=>item.year===year)??null;
    let traditionalComparison=null;
    if(source?.taraRise) {
      const instant=parseLocalDateTime(source.arghyaDate+"T"+source.taraRise);
      const atTraditionalRise=sample(instant,observer,visibilityOptions);
      let atTraditionalSet=null;
      if(source.taraSetDate&&source.taraSet) {
        atTraditionalSet=sample(parseLocalDateTime(source.taraSetDate+"T"+source.taraSet),observer,visibilityOptions);
      }
      traditionalComparison={
        eventDefinition:"Drik traditional Agastya Tara Udaya / Tara Asta and Arghya source times",
        sourceStatus:source.source?.status??"historical-source-audit",
        physicalVisibilityAtSourceRise:atTraditionalRise.visible,
        physicalSampleAtSourceRise:atTraditionalRise,
        physicalVisibilityAtSourceSet:atTraditionalSet?.visible??null,
        physicalSampleAtSourceSet:atTraditionalSet
      };
    }
    annual.push({
      year,
      physicalHeliacalRising:rise,
      physicalHeliacalSetting:set,
      traditionalDrikArghya:source?{
        date:source.arghyaDate,
        taraRise:source.taraRise,
        taraSetDate:source.taraSetDate,
        taraSet:source.taraSet,
        comparison:traditionalComparison
      }:null
    });
  }
  return Object.freeze({
    schemaVersion:1,
    model:"canopus-topocentric-schaefer-1985-twilight-visibility-diagnostic-v1",
    observer:{...observerProfile},
    visibilityOptions,
    scanRange:{start:scanStart.toISOString(),end:scanEnd.toISOString(),dailyRows:daily.length},
    annual,
    daily,
    limitations:[
      "physical heliacal visibility candidates are not Drik traditional Agastya Arghya dates",
      "Schaefer visibility depends on assumed extinction and zenith limiting magnitude, not live weather",
      "terrain skyline, buildings, local light pollution and observer eyesight are not measured",
      "city label is not equivalent to exact Drik observer coordinates",
      "all outputs are research-only and publication-ineligible"
    ],
    publicationEligible:false
  });
}

function arg(name,defaultValue) {
  const index=process.argv.indexOf(name);
  return index>=0?process.argv[index+1]:defaultValue;
}
if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href) {
  const dataPath=arg("--arghya-data","data/agastya-arghya-pithoragarh.json");
  const output=arg("--output","agastya-physical-visibility-audit.json");
  const result=buildAgastyaPhysicalVisibilityAudit({
    startYear:Number(arg("--start-year","2024")),
    endYear:Number(arg("--end-year","2030")),
    arghyaData:JSON.parse(fs.readFileSync(dataPath,"utf8"))
  });
  fs.writeFileSync(output,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result.annual.map(row=>({
    year:row.year,
    heliacalRise:row.physicalHeliacalRising?.date??null,
    heliacalSet:row.physicalHeliacalSetting?.date??null,
    traditionalArghya:row.traditionalDrikArghya?.date??null,
    physicalVisibleAtTraditionalRise:row.traditionalDrikArghya?.comparison?.physicalVisibilityAtSourceRise??null
  })),null,2));
}
