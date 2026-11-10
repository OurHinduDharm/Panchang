import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");

test("direct Drik reference JSON is fetched once and browser-cacheable", () => {
  assert.match(source, /let drikPithoragarhDataPromise = null/);
  assert.match(source, /if \\(!drikPithoragarhDataPromise\\)/);
  assert.match(source, /drikPithoragarhDataPromise = fetch\\(url, \\{ cache: "force-cache" \}\\)/);
});

test("the production display does not run daily ephemeris scans or threshold bisection", () => {
  assert.doesNotMatch(source, /PLANET_ASTA_THRESHOLDS|findNearestAngularBoundary|findThresholdCrossingInstant|planetDailyCache|planetEventBracketCache/);
  assert.match(source, /direct Drik reference lookup and card/);
});
