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

test("source city labels and our observer coordinates are never conflated", () => {
  const pithoragarh = dataset.cases.filter(entry => entry.sourceLocation === "Pithoragarh, Uttarakhand, India");
  const delhi = dataset.cases.filter(entry => entry.sourceLocation === "New Delhi, NCT, India");
  assert.ok(pithoragarh.length >= 1);
  assert.ok(delhi.length >= 1);
  for (const entry of pithoragarh) {
    assert.equal(entry.testObserver.timeZone, "Asia/Kolkata");
    assert.equal(entry.testObserver.latitude, 29.5828);
    assert.equal(entry.testObserver.longitude, 80.2182);
  }
  assert.notEqual(pithoragarh[0].sourceLocation, delhi[0].sourceLocation);
});

test("unverified historical transcriptions are explicitly excluded from benchmark cases", () => {
  assert.ok(Array.isArray(dataset.excludedUnverifiedData));
  const excludedIds = new Set(dataset.excludedUnverifiedData.map(entry => entry.id));
  assert.ok(excludedIds.has("old-pithoragarh-2026-venus-transcription"));
  assert.ok(excludedIds.has("old-pithoragarh-2027-jupiter-transcription"));
  assert.ok(!dataset.cases.some(entry => excludedIds.has(entry.id)));
});


test("every benchmark case is bound to one explicit source location", () => {
  for (const entry of dataset.cases) {
    assert.equal(typeof entry.sourceLocation, "string", `${entry.id}: sourceLocation is required`);
    assert.equal(entry.location, undefined, `${entry.id}: ambiguous legacy location field is forbidden`);
    assert.ok(entry.sourceLocation.trim(), `${entry.id}: sourceLocation cannot be blank`);
    assert.ok(
      ["city-label-only", "coordinate-exact"].includes(entry.comparisonLevel),
      `${entry.id}: comparisonLevel must be explicit`
    );
    assert.ok(entry.sourceObserver, `${entry.id}: sourceObserver provenance is required`);
    assert.ok(entry.sourceObserver.coordinateStatus, `${entry.id}: source coordinate status is required`);
    if (entry.comparisonLevel === "coordinate-exact") {
      assert.equal(typeof entry.sourceObserver.latitude, "number", `${entry.id}: exact latitude required`);
      assert.equal(typeof entry.sourceObserver.longitude, "number", `${entry.id}: exact longitude required`);
      assert.equal(entry.testObserver.latitude, entry.sourceObserver.latitude);
      assert.equal(entry.testObserver.longitude, entry.sourceObserver.longitude);
    }
    if (entry.comparisonLevel === "city-label-only") {
      assert.equal(entry.sourceObserver.coordinates, null, `${entry.id}: undisclosed source coordinates must remain null`);
    }
  }
});

test("Pithoragarh and New Delhi references cannot be treated as interchangeable", () => {
  const pithoragarh = dataset.cases.filter(entry => entry.sourceLocation === "Pithoragarh, Uttarakhand, India");
  const delhi = dataset.cases.filter(entry => entry.sourceLocation === "New Delhi, NCT, India");
  assert.ok(pithoragarh.length >= 1);
  assert.ok(delhi.length >= 1);
  assert.ok(pithoragarh.every(entry => entry.comparisonLevel === "city-label-only"));
  assert.ok(delhi.every(entry => entry.comparisonLevel === "city-label-only"));
  assert.ok(pithoragarh.every(entry => entry.testObserver.latitude === 29.5828));
  assert.ok(delhi.every(entry => entry.testObserver.latitude === undefined));
});
