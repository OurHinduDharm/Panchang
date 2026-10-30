import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const datasetPath = resolve(here, "../data/asta-udaya-benchmark.json");
const dataset = JSON.parse(readFileSync(datasetPath, "utf8"));

test("Asta-Udaya benchmark has explicit source provenance", () => {
  assert.equal(dataset.schemaVersion, 1);
  assert.ok(dataset.sources);
  assert.ok(Array.isArray(dataset.cases));
  for (const entry of dataset.cases) {
    assert.ok(entry.id, "each case needs a stable id");
    assert.ok(entry.planet, "each case needs a planet");
    assert.ok(entry.eventModel, "each case needs an explicit event model");
    assert.ok(dataset.sources[entry.sourceId], `missing source for ${entry.id}`);
    assert.ok(entry.precision, "each case needs a precision declaration");
    assert.ok(entry.boundaries, "each case needs boundary data");
  }
});

test("exact-time benchmark entries have timezone-aware timestamps and ordered boundaries", () => {
  const exactCases = dataset.cases.filter(entry => entry.precision === "minute");
  assert.ok(exactCases.length >= 1);
  for (const entry of exactCases) {
    const { astaStart, astaEnd } = entry.boundaries;
    assert.match(astaStart, /(?:Z|[+-]\d{2}:\d{2})$/, `${entry.id}: start needs an explicit timezone`);
    assert.match(astaEnd, /(?:Z|[+-]\d{2}:\d{2})$/, `${entry.id}: end needs an explicit timezone`);
    assert.ok(Date.parse(astaStart) < Date.parse(astaEnd), `${entry.id}: Asta start must precede end`);
  }
});

test("date-only official visibility data is never represented as an exact clock time", () => {
  const dateOnlyCases = dataset.cases.filter(entry => entry.precision === "date-only");
  assert.ok(dateOnlyCases.length >= 1);
  for (const entry of dateOnlyCases) {
    for (const value of Object.values(entry.boundaries)) {
      assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
    }
    assert.equal(entry.eventModel, "rashtriya-panchang-visibility-period");
  }
});

test("Pithoragarh and New Delhi references remain geographically distinct", () => {
  const pithoragarh = dataset.cases.filter(entry => entry.location.name === "Pithoragarh, Uttarakhand, India");
  const delhi = dataset.cases.filter(entry => entry.location.name === "New Delhi, NCT, India");
  assert.ok(pithoragarh.length >= 1);
  assert.ok(delhi.length >= 1);
  for (const entry of pithoragarh) {
    assert.equal(entry.location.timeZone, "Asia/Kolkata");
    assert.equal(entry.location.latitude, 29.5828);
    assert.equal(entry.location.longitude, 80.2182);
  }
  assert.notEqual(pithoragarh[0].location.name, delhi[0].location.name);
});

test("unverified historical transcriptions are explicitly excluded from benchmark cases", () => {
  assert.ok(Array.isArray(dataset.excludedUnverifiedData));
  const excludedIds = new Set(dataset.excludedUnverifiedData.map(entry => entry.id));
  assert.ok(excludedIds.has("old-pithoragarh-2026-venus-transcription"));
  assert.ok(excludedIds.has("old-pithoragarh-2027-jupiter-transcription"));
  assert.ok(!dataset.cases.some(entry => excludedIds.has(entry.id)));
});
