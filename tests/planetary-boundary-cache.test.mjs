import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");
const worker = await readFile(new URL("../daily-tara-planet-worker.mjs", import.meta.url), "utf8");

test("daily and annual model results use bounded memory caches, never reference downloads", () => {
  assert.match(source,/dailyPlanetResults\.has\(key\)/);
  assert.match(source,/dailyPlanetPending\?\.key === key/);
  assert.match(source,/dailyPlanetResults\.size >= 32/);
  assert.match(worker,/cache\.size>=12/);
  assert.match(worker,/location\.latitude,location\.longitude,location\.elevation,y/);
  assert.doesNotMatch(source,/drikPlanetaryReferenceDataPromise|drik-planetary-reference-2024-2027\.json/);
});

test("production display delegates the annual ephemeris scan to a dedicated worker", () => {
  assert.doesNotMatch(source, /PLANET_ASTA_THRESHOLDS|findNearestAngularBoundary|findThresholdCrossingInstant|planetDailyCache|planetEventBracketCache|calculateAnnualTara\(/);
  assert.match(source,/new Worker\(bootstrap \|\| url,\{type:"module"\}\)/);
  assert.match(worker,/calculateAnnualTara\(engine,location,y,planetProfiles\)/);
  assert.match(source,/dailyPlanetPending\?\.id === id/);
  assert.match(source,/renderVersion !== planetReferenceRenderVersion/);
});
