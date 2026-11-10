import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  formatDrikBoundary,
  getDrikPlanetaryReference,
  resolveDrikCity
} from "../research/drik-planetary-reference.mjs";

const dataset = JSON.parse(await readFile(
  new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url), "utf8"
));

test("compact production dataset contains only 200 unique year-verified windows", () => {
  assert.equal(dataset.uniqueAcceptedWindows, 200);
  assert.equal(dataset.windows.length, 200);
  assert.deepEqual(dataset.years, [2024, 2025, 2026, 2027]);
  assert.equal(dataset.cities.length, 5);
  assert.equal(dataset.planets.length, 5);
  assert.equal(dataset.provisionalExcludedWindows, 50);
  assert.ok(dataset.windows.every(row =>
    row.acceptanceEligible === true &&
    row.sourceStatus === "direct-page-captured-browser-verified" &&
    row.sourcePageYear >= 2024 && row.sourcePageYear <= 2027
  ));
});

test("resolves Hindi and English city names without nearest-city fallback", () => {
  assert.equal(resolveDrikCity({ city: "पिथौरागढ़", state: "उत्तराखंड" }),
    "Pithoragarh, Uttarakhand, India");
  assert.equal(resolveDrikCity({ city: "Mumbai" }), "Mumbai, Maharashtra, India");
  assert.equal(resolveDrikCity({ city: "Almora", state: "Uttarakhand" }), null);
});

test("uses direct city-matched windows for all five supported cities without substitution", () => {
  for (const city of dataset.cities) {
    for (const planet of dataset.planets) {
      const entry = dataset.windows.find(row =>
        row.sourceLocation === city.name && row.planet === planet
      );
      assert.ok(entry, `missing ${planet} window for ${city.name}`);
      const date = entry.boundaries.astaStart.normalizedLocalDateTime.slice(0, 10);
      const result = getDrikPlanetaryReference({
        dataset,
        location: { city: city.name },
        selectedDate: date,
        planet
      });
      assert.equal(result.status, "active", `${planet} / ${city.name}`);
      assert.equal(result.city, city.name);
      assert.equal(result.window.sourceLocation, city.name);
    }
  }
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

test("compact production dataset contains only 200 verified unique windows for five cities", () => {
  assert.equal(dataset.windows.length, 200);
  assert.equal(dataset.cities.length, 5);
  assert.deepEqual(dataset.years, [2024, 2025, 2026, 2027]);
  const counts = new Map();
  const keys = new Set();
  for (const entry of dataset.windows) {
    assert.equal(entry.acceptanceEligible, true);
    assert.equal(entry.sourceStatus, "direct-page-captured-browser-verified");
    assert.ok(dataset.years.includes(entry.sourcePageYear));
    assert.ok(entry.sourcePageUrl.startsWith("https://www.drikpanchang.com/"));
    const start = Date.parse(entry.boundaries.astaStart.normalizedLocalDateTime);
    const end = Date.parse(entry.boundaries.astaEnd.normalizedLocalDateTime);
    assert.ok(Number.isFinite(start) && Number.isFinite(end) && end > start);
    const key = [
      entry.sourceLocation, entry.planet,
      entry.boundaries.astaStart.normalizedLocalDateTime,
      entry.boundaries.astaEnd.normalizedLocalDateTime
    ].join("|");
    assert.ok(!keys.has(key), "duplicate city/planet Asta window: " + key);
    keys.add(key);
    counts.set(entry.sourceLocation, (counts.get(entry.sourceLocation) || 0) + 1);
  }
  assert.deepEqual([...counts.values()].sort((a, b) => a - b), [40, 40, 40, 40, 40]);
});

test("Mumbai has its own direct source window rather than borrowing New Delhi", () => {
  const result = getDrikPlanetaryReference({
    dataset,
    location: { city: "Mumbai", state: "Maharashtra" },
    selectedDate: "2024-01-01",
    planet: "Mercury"
  });
  assert.equal(result.status, "upcoming");
  assert.equal(result.city, "Mumbai, Maharashtra, India");
  assert.ok(result.window.sourcePageUrl.includes("geoname-id=1275339"));
});
