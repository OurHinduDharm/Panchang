import test from "node:test";
import assert from "node:assert/strict";
import {readPanchangLinkLocation,buildPanchangEventUrl,hasPanchangLinkLocation,clearPanchangLinkLocation} from "../panchang-event-links.mjs";
const place={name:"पिथौरागढ़",latitude:29.5828,longitude:80.2182,elevation:1650};
test("event link round trip retains date and observer",()=>{
 const url=new URL(buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/","2026-09-07",place));
 assert.equal(url.searchParams.get("date"),"2026-09-07");
 assert.deepEqual(readPanchangLinkLocation(url.searchParams),{name:"निर्देशांक 29.5828, 80.2182",city:"",state:"",elevationStatus:"provided",lat:place.latitude,lon:place.longitude,elevation:place.elevation});
 assert.equal(url.searchParams.has("place"), false);
});
test("missing and invalid location parameters are rejected",()=>{
 for(const query of ["?lat=29&lon=80","?lat=91&lon=80&elevation=10&place=A","?lat=29&lon=80&elevation=&place=A"]){
  assert.equal(readPanchangLinkLocation(new URLSearchParams(query)),null);
 }
});
test("invalid event date rejected",()=>{
 assert.throws(()=>buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/","bad",place));
});

test("calendar validation rejects impossible dates",()=>{
 for (const date of ["2026-02-30","2026-13-01","2026-04-31","2025-02-29"]) {
  assert.throws(()=>buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/",date,place));
 }
 assert.doesNotThrow(()=>buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/","2028-02-29",place));
});
test("event link refuses malformed observer",()=>{
 for(const change of [{elevation:""},{elevation:10000},{latitude:91},{longitude:null}]){
  assert.throws(()=>buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/","2026-09-07",{...place,...change}));
 }
});
test("legacy date-only links have no invented location",()=>{
 const params=new URLSearchParams("date=2026-09-07");
 assert.equal(readPanchangLinkLocation(params),null);
});

test("duplicate coordinates, nondecimal numbers and invalid heights cannot select an observer", () => {
  const good = new URLSearchParams("lat=29&lon=80&elevation=0&place=Harbour");
  assert.equal(readPanchangLinkLocation(good).elevation, 0);
  for (const [key, value] of [["lon", "0x50"], ["lat", "  "], ["elevation", "-501"], ["elevation", "Infinity"]]) {
    const params = new URLSearchParams(good);
    params.set(key, value);
    assert.equal(readPanchangLinkLocation(params), null);
  }
  good.append("lat", "28");
  assert.equal(readPanchangLinkLocation(good), null);
});


test("daily links omit redundant city/state and clear stale legacy values", () => {
 const url = new URL(buildPanchangEventUrl("https://ourhindudharm.blogspot.com/p/panchang-today.html?city=Delhi&state=Delhi&lat=1&lon=2&elevation=3", "2026-09-07", {...place, city:"Pithoragarh", admin1:"Uttarakhand"}));
 assert.equal(url.searchParams.has("city"), false);
 assert.equal(url.searchParams.has("state"), false);
 assert.equal(url.searchParams.get("lat"), "29.5828");
 assert.equal(url.searchParams.has("place"), false);
 assert.equal(readPanchangLinkLocation(url.searchParams).elevation, 1650);
});
test("city/state-only legacy links are recognized and cleared", () => {
 for (const query of ["?city=Delhi", "?state=Delhi", "?city=Delhi&state=Delhi"]) {
  const url = new URL("https://example.com/" + query);
  assert.equal(hasPanchangLinkLocation(url.searchParams), true);
  assert.equal(readPanchangLinkLocation(url.searchParams), null);
  clearPanchangLinkLocation(url);
  assert.equal(hasPanchangLinkLocation(url.searchParams), false);
 }
});


test("legacy named links retain their display label without affecting observer", () => {
 const params = new URLSearchParams("date=2026-09-07&lat=29.5828&lon=80.2182&elevation=1650&place=Pithoragarh&city=Pithoragarh&state=Uttarakhand");
 assert.equal(readPanchangLinkLocation(params).name, "Pithoragarh");
 assert.equal(readPanchangLinkLocation(params).lat, 29.5828);
});
test("coordinate-only links accept measured sea level but not missing elevation", () => {
 const sea = new URLSearchParams("lat=0&lon=0&elevation=0");
 assert.equal(readPanchangLinkLocation(sea).elevation, 0);
 sea.delete("elevation");
 assert.equal(readPanchangLinkLocation(sea), null);
});


test("unverified elevation cannot be published in a daily event URL", () => {
 assert.throws(() => buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/", "2026-09-07", {...place, elevation: 0, elevationStatus: "unknown"}));
 assert.doesNotThrow(() => buildPanchangEventUrl("https://ourhindudharm.github.io/Panchang/", "2026-09-07", {...place, elevation: 0, elevationStatus: "provided"}));
});
