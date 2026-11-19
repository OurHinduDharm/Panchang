import test from "node:test";
import assert from "node:assert/strict";
import {isProjectPithoragarh,resolvePithoragarhSearch} from "./annual-tara-pithoragarh-identity.mjs";
const match={id:"1259503",nameLocal:"Pithoragarh",admin1:"Uttarakhand",countryCode:"IN",timeZone:"Asia/Kolkata",latitude:29.58349,longitude:80.20947,elevation:1586};
test("verified city search resolves to project canonical observer",()=>{
 const canonical=resolvePithoragarhSearch(match);
 assert.ok(isProjectPithoragarh(canonical));
 assert.equal(canonical.elevation,1650);
});
test("name-only and distant homonyms cannot claim regional record",()=>{
 for(const candidate of [
  {...match,latitude:30.5},
  {...match,admin1:"Other"},
  {...match,countryCode:"NP"},
  {...match,id:"unknown"},
  {...match,nameLocal:"Other"}
 ]) assert.equal(resolvePithoragarhSearch(candidate),null);
});
test("nearby noncanonical observer does not inherit regional record",()=>{
 assert.equal(isProjectPithoragarh({latitude:29.58349,longitude:80.20947,elevation:1586}),false);
});
