import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  formatDrikBoundary,
  getDrikPlanetaryReference,
  resolveDrikCity
} from "../research/drik-planetary-reference.mjs";

const dataset = JSON.parse(await readFile(
  new URL("../data/drik-pithoragarh-asta-udaya-2024-2027.json", import.meta.url), "utf8"
));

test("resolves Hindi and English city names without nearest-city fallback", () => {
  assert.equal(resolveDrikCity({ city: "पिथौरागढ़", state: "उत्तराखंड" }),
    "Pithoragarh, Uttarakhand, India");
  assert.equal(resolveDrikCity({ city: "Mumbai" }), "Mumbai, Maharashtra, India");
  assert.equal(resolveDrikCity({ city: "Almora", state: "Uttarakhand" }), null);
});

test("returns a directly captured Pithoragarh window for a date inside its Asta period", () => {
  const entry = dataset.windows.find(row =>
    row.sourceLocation === "Pithoragarh, Uttarakhand, India" &&
    row.planet === "Venus" &&
    row.acceptanceEligible === true &&
    row.sourceStatus === "direct-page-captured-browser-verified"
  );
  assert.ok(entry);
  const date = entry.boundaries.astaStart.normalizedLocalDateTime.slice(0, 10);
  const result = getDrikPlanetaryReference({
    dataset,
    location: { city: "पिथौरागढ़" },
    selectedDate: date,
    planet: "Venus"
  });
  assert.equal(result.status, "active");
  assert.equal(result.window.boundaries.astaStart.normalizedLocalDateTime,
    entry.boundaries.astaStart.normalizedLocalDateTime);
});

test("returns the next published window before Asta and never substitutes another city", () => {
  const result = getDrikPlanetaryReference({
    dataset,
    location: { city: "Pithoragarh" },
    selectedDate: "2024-01-01",
    planet: "Mercury"
  });
  assert.equal(result.status, "upcoming");
  assert.ok(result.window.boundaries.astaStart.normalizedLocalDateTime.startsWith("2024-"));

  const unsupported = getDrikPlanetaryReference({
    dataset,
    location: { city: "Almora" },
    selectedDate: "2026-11-10",
    planet: "Mercury"
  });
  assert.equal(unsupported.status, "unavailable");
  assert.equal(unsupported.reason, "city-not-covered");
  assert.equal(unsupported.window, null);
});

test("does not turn a missing future row into a zero-event assertion", () => {
  const result = getDrikPlanetaryReference({
    dataset,
    location: { city: "Pithoragarh" },
    selectedDate: "2028-01-01",
    planet: "Mars"
  });
  assert.equal(result.status, "no-upcoming-reference");
  assert.equal(result.reason, "outside-captured-date-range");
  assert.equal(result.window, null);
});

test("formats normalized IST timestamps and preserves 24+ rollover normalization", () => {
  const boundary = {
    normalizedLocalDateTime: "2024-02-07T06:22:00+05:30"
  };
  const formatted = formatDrikBoundary(boundary);
  assert.ok(formatted.date.includes("7"));
  assert.ok(formatted.time);
  assert.equal(formatted.iso, "2024-02-07T06:22:00+05:30");
  assert.equal(formatDrikBoundary({ normalizedLocalDateTime: "2024-02-07T06:22:00Z" }), null);
});
