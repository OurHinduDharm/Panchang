import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchPlace, uniqueSearchPlaces, searchTaraPlaces } from "./annual-tara-place-search.mjs";

const sample = {id: 1, name:"Delhi", country:"India", admin1:"Delhi", latitude:28.6139, longitude:77.209, elevation:216, timezone:"Asia/Kolkata"};
test("valid search result preserves observer and timezone", () => {
  const place = normalizeSearchPlace(sample);
  assert.equal(place.latitude, 28.6139);
  assert.equal(place.elevation, 216);
  assert.equal(place.timeZone, "Asia/Kolkata");
});
test("reject missing or invalid elevation, timezone and coordinates", () => {
  for (const changes of [{elevation:null},{elevation:""},{elevation:10000},{latitude:91},{longitude:181},{timezone:"Invalid/Zone"},{timezone:null}]) {
    assert.equal(normalizeSearchPlace({...sample,...changes}), null, JSON.stringify(changes));
  }
});
test("deduplicate coordinates but retain distinct locations", () => {
  assert.equal(uniqueSearchPlaces([sample,{...sample,id:2},{...sample,id:3,latitude:28.62}]).length,2);
});
test("search skips short inputs without requesting network", async () => {
  assert.deepEqual(await searchTaraPlaces("x"),[]);
});
test("non-India timezone is accepted", () => {
  assert.equal(normalizeSearchPlace({...sample,timezone:"Europe/London"}).timeZone,"Europe/London");
});
