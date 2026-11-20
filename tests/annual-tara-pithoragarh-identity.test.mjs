import test from "node:test";
import assert from "node:assert/strict";
import { locations } from "../annual-tara-locations.mjs";
import { isProjectPithoragarh, resolvePithoragarhSearch } from "../annual-tara-pithoragarh-identity.mjs";

const place = {...locations["pithoragarh-project-target"], name: "Pithorāgarh",
  latitude: 29.58349, longitude: 80.20947, elevation: 1586};

test("verified source ID and nearby city point select the exact project observer", () => {
  const observer = resolvePithoragarhSearch(place);
  assert.equal(observer, locations["pithoragarh-project-target"]);
  assert.deepEqual([observer.latitude, observer.longitude, observer.elevation], [29.5828, 80.2182, 1650]);
  assert.ok(isProjectPithoragarh(observer));
  assert.equal(isProjectPithoragarh(place), false);
});

test("district, missing ID, close homonym or wrong region cannot claim the record", () => {
  for (const change of [{id: 1259504}, {id: null}, {id: ""}, {countryCode: "NP"},
    {timeZone: "Asia/Kathmandu"}, {stateCode: "36"}, {latitude: 30.5}, {longitude: null}]) {
    assert.equal(resolvePithoragarhSearch({...place, ...change}), null);
    assert.equal(isProjectPithoragarh({...place, ...change}), false);
  }
  assert.equal(isProjectPithoragarh({...locations["pithoragarh-project-target"], id: 1259504}), false);
});
