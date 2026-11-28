import {CANOPUS_ASTROMETRY,propagateStarPosition,scanDrikStarAzimuthTransitions} from "./drik-ganita-time-separation.mjs";

// Two-parameter empirical proxy for the increasing extinction at low
// culmination. Fit only Pithoragarh, Pathankot, Perundurai 2027. The 37.3°
// denominator reference is approximate northern geometric visibility limit.
// Not a classical formula or a validated physical atmosphere model.
// The calibrated range is enforced; outside it the existing public method
// remains unchanged. No target calendar date enters the calculator.
export const AGASTYA_RISE_REVIEW_MODEL=Object.freeze({
  intercept:9.984385535955107,coefficient:34.09106559579235,
  northernLimitDeg:37.3,minLatitudeDeg:11.2756,maxLatitudeDeg:32.2748
});
export function agastyaRiseSolarDepression(latitude){
  const m=AGASTYA_RISE_REVIEW_MODEL;
  if(!Number.isFinite(latitude)||latitude<m.minLatitudeDeg||latitude>m.maxLatitudeDeg)return null;
  return m.intercept+m.coefficient/(m.northernLimitDeg-latitude);
}
export function reviewAgastyaLatitudeRise(engine,location,year){
  const pending=reason=>({status:"manual-review",reason,events:[],publishable:false});
  if(!Number.isInteger(year)||year<1900||year>2100)return pending("invalid-year");
  const {latitude,longitude,elevation}=location??{};
  const depression=agastyaRiseSolarDepression(latitude);
  if(depression===null||!Number.isFinite(longitude)||Math.abs(longitude)>180||
    !Number.isFinite(elevation))return pending("outside-calibrated-domain-or-missing-observer");
  const observer=new engine.Observer(latitude,longitude,elevation);
  const start=Date.parse(year+"-01-01T00:00:00+05:30"),end=Date.parse((year+1)+"-01-01T00:00:00+05:30");
  const scan=scanDrikStarAzimuthTransitions({
    SearchAltitude:engine.SearchAltitude,Equator:engine.Equator,Horizon:engine.Horizon,
    DefineStar:engine.DefineStar,starCoordinatesAt:d=>propagateStarPosition(CANOPUS_ASTROMETRY,d),
    body:"Star1",observer,branch:"rise",event:"Udaya",startLocalDayUtc:start,
    days:(end-start)/86400000,slope:0,intercept:-depression,residualThresholdDeg:0
  });
  const events=scan.events.filter(e=>{
    const date=new Date(e.utcMilliseconds),sun=engine.Equator("Sun",date,observer,true,true);
    const h=engine.Horizon(date,observer,sun.ra,sun.dec,"normal");
    return h.altitude<0&&h.azimuth>=0&&h.azimuth<180;
  });
  if(events.length!==1)return {...pending("unique-morning-crossing-required"),count:events.length};
  return {status:"candidate-only",events,solarDepressionDeg:depression,publishable:false,
    definition:"annual-geometric-star-rise-with-empirical-solar-depression",
    warning:"not-an-independent-traditional-udaya-proof"};
}
