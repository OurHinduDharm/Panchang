import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");

test("production Asta/Udaya display does not use fixed angular crossing direction", () => {
  assert.doesNotMatch(source, /findThresholdCrossingInstant|findNearestAngularBoundary|PLANET_ASTA_THRESHOLDS/);
  assert.match(source, /getDrikPlanetaryReference/);
  assert.match(source, /renderDrikPlanetReferenceCard/);
});

test("daily Sun and Moon rise/set remain sourced from the Panchang calculation", () => {
  assert.match(source, /sunrise: pHora\\.sunrise/);
  assert.match(source, /sunset: pHora\\.sunset/);
  assert.match(source, /moonrise: pHora\\.moonrise/);
  assert.match(source, /moonset: pHora\\.moonset/);
});
