import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");

test("production Asta/Udaya display does not use fixed angular crossing direction", () => {
  assert.doesNotMatch(source, /findThresholdCrossingInstant|findNearestAngularBoundary|PLANET_ASTA_THRESHOLDS/);
  assert.ok(source.includes("getDrikPlanetaryReference"));
  assert.ok(source.includes("renderDrikPlanetReferenceCard"));
});

test("daily Sun and Moon rise/set remain sourced from the Panchang calculation", () => {
  assert.ok(source.includes("sunrise: pHora.sunrise"));
  assert.ok(source.includes("sunset: pHora.sunset"));
  assert.ok(source.includes("moonrise: pHora.moonrise"));
  assert.ok(source.includes("moonset: pHora.moonset"));
});
