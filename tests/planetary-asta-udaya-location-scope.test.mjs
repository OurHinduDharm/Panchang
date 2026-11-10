import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getDrikPlanetaryReference } from "../research/drik-planetary-reference.mjs";
import test from "node:test";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");
const dataset = JSON.parse(await readFile(
  new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url), "utf8"
));

test("production Panchang uses direct city references, not geocentric fixed-angle thresholds", () => {
  assert.ok(source.includes("getDrikPlanetaryReference"));
  assert.ok(source.includes("drik-planetary-reference-2024-2027.json"));
  assert.doesNotMatch(source, /PLANET_ASTA_THRESHOLDS|findNearestAngularBoundary|findThresholdCrossingInstant/);
});

test("five supported cities use their own direct records and an unsupported city receives no fallback", () => {
  const pithoragarh = getDrikPlanetaryReference({
    dataset, location: { city: "पिथौरागढ़" },
    selectedDate: "2026-10-31", planet: "Venus"
  });
  assert.ok(["active", "upcoming"].includes(pithoragarh.status));
  assert.ok(pithoragarh.window);

  const mumbai = getDrikPlanetaryReference({
    dataset, location: { city: "Mumbai", state: "Maharashtra" },
    selectedDate: "2026-10-31", planet: "Venus"
  });
  assert.ok(["active", "upcoming"].includes(mumbai.status));
  assert.equal(mumbai.city, "Mumbai, Maharashtra, India");
  assert.equal(mumbai.window.sourceLocation, "Mumbai, Maharashtra, India");

  const otherCity = getDrikPlanetaryReference({
    dataset, location: { city: "Agra", state: "Uttar Pradesh" },
    selectedDate: "2026-10-31", planet: "Venus"
  });
  assert.equal(otherCity.status, "unavailable");
  assert.equal(otherCity.reason, "city-not-covered");
  assert.equal(otherCity.window, null);
});
