import test from "node:test";
import assert from "node:assert/strict";
import * as engine from "astronomy-engine";
import {agastyaRiseSolarDepression,reviewAgastyaLatitudeRise} from "../research/agastya-latitude-depression.mjs";

const references=[
 ["Pithoragarh",29.5828,80.2182,1650,2027,"2027-09-07","calibration"],
 ["Pathankot",32.2748,75.6521,330,2027,"2027-09-17","calibration"],
 ["Perundurai",11.2756,77.5879,290,2027,"2027-07-29","calibration"],
 ["Delhi",28.6139,77.209,216,2027,"2027-09-04","held-out city"],
 ["Varanasi",25.3176,82.9739,81,2027,"2027-08-27","held-out city"],
 ...[2024,2025,2026,2028,2029,2030].map(y=>["Pithoragarh",29.5828,80.2182,1650,y,y+"-09-07","held-out year"]),
 ["Delhi",28.6139,77.209,216,2024,"2024-09-04","held-out year"],
 ["Moradabad",28.8386,78.7733,198,2026,"2026-09-05","held-out city/year"]
];
test("latitude depression is bounded, monotonic and cannot extrapolate into polar singularity",()=>{
 assert.ok(agastyaRiseSolarDepression(32)>agastyaRiseSolarDepression(12));
 for(const x of [0,10,33,37.3,90,NaN,null])assert.equal(agastyaRiseSolarDepression(x),null);
 assert.equal(reviewAgastyaLatitudeRise(engine,{latitude:35,longitude:75,elevation:0},2027).events.length,0);
 assert.equal(reviewAgastyaLatitudeRise(engine,{latitude:29,longitude:75},2027).events.length,0);
});
test("actual Astronomy Engine scan of calibration and held-out dates is review-only",()=>{
 for(const [city,latitude,longitude,elevation,year,reference,group] of references){
  const r=reviewAgastyaLatitudeRise(engine,{latitude,longitude,elevation},year);
  assert.equal(r.publishable,false);
  assert.equal(r.events.length,1,city+" "+year+" unique rise");
  const date=new Date(r.events[0].utcMilliseconds+19800000).toISOString().slice(0,10);
  const errorDays=(Date.parse(date)-Date.parse(reference))/86400000;
  console.log("Agastya latitude review:",JSON.stringify({city,year,group,reference,date,errorDays,solarDepression:r.solarDepressionDeg}));
  // Independent engine agreement to two civil days is a research gate;
  // an exact publisher-equivalent formula is not claimed.
  assert.ok(Math.abs(errorDays)<=2,city+" "+year+" error "+errorDays);
 }
});
