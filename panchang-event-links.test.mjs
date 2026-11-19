import test from "node:test";
import assert from "node:assert/strict";
import {readPanchangLinkLocation,buildPanchangEventUrl} from "./panchang-event-links.mjs";
const place={name:"पिथौरागढ़",latitude:29.5828,longitude:80.2182,elevation:1650};
test("event link round trip retains date and observer",()=>{
 const url=new URL(buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/","2026-09-07",place));
 assert.equal(url.searchParams.get("date"),"2026-09-07");
 assert.deepEqual(readPanchangLinkLocation(url.searchParams),{name:place.name,city:place.name,lat:place.latitude,lon:place.longitude,elevation:place.elevation});
});
test("missing and invalid location parameters are rejected",()=>{
 for(const query of ["?lat=29&lon=80","?lat=91&lon=80&elevation=10&place=A","?lat=29&lon=80&elevation=&place=A"]){
  assert.equal(readPanchangLinkLocation(new URLSearchParams(query)),null);
 }
});
test("invalid event date rejected",()=>{
 assert.throws(()=>buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/","bad",place));
});
