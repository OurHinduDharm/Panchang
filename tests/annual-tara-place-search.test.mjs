import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { matchPlaces, searchTaraPlaces } from "../annual-tara-place-search.mjs";
import { normalizeTaraObserver } from "../research/tara-location-observer.mjs";

const index = JSON.parse(readFileSync(new URL("../data/tara-india-places.json", import.meta.url)));

test("Hindi, accented and English searches reach the same real GeoNames point", () => {
  for (const query of ["पिथौरागढ़", "Pithorāgarh", " Pithoragarh "]) {
    const [place] = matchPlaces(index, query);
    assert.deepEqual([place.id, place.latitude, place.longitude, place.elevation],
      [1259503, 29.58349, 80.20947, 1586]);
    assert.deepEqual([place.city, place.admin2, place.admin1, place.countryCode],
      ["Pithoragarh", "Pithoragarh", "Uttarakhand", "IN"]);
  }
});

test("search preserves homonyms and gives exact city names precedence", () => {
  const towns = matchPlaces(index, "Ramnagar");
  assert.ok(towns.length >= 3);
  assert.ok(new Set(towns.map(t => t.admin2)).size >= 3);
  assert.ok(towns.some(t => t.id === 1258637 && t.admin2 === "Nainital"));
  assert.equal(matchPlaces(index, "New Delhi")[0].city, "New Delhi");
  assert.equal(matchPlaces(index, "काशी")[0].id, 1253405);
});

test("all indexed cities have distinct stable IDs and finite point elevations", () => {
  assert.ok(index.cities.length > 7000);
  assert.equal(new Set(index.cities.map(row => row[0])).size, index.cities.length);
  for (const [id, city, state, , latitude, longitude, elevation] of index.cities) {
    assert.ok(Number.isSafeInteger(id) && city && index.states[state]);
    assert.ok(Number.isFinite(elevation));
    normalizeTaraObserver({latitude, longitude, elevation});
  }
});

test("short inputs skip loading and unknown cities produce no match", async () => {
  assert.deepEqual(await searchTaraPlaces("x"), []);
  assert.deepEqual(matchPlaces(index, "no-such-Indian-place"), []);
});
