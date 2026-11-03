import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const datasetPath = resolve(here, "../data/asta-udaya-benchmark.json");
const dataset = JSON.parse(readFileSync(datasetPath, "utf8"));

test("Asta-Udaya benchmark has explicit source provenance for every active case", () => {
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
    assert.equal(typeof entry.sourceLocation, "string");
    assert.ok(["city-label-only", "coordinate-exact"].includes(entry.comparisonLevel));
    assert.ok(entry.sourceObserver?.coordinateStatus);
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
    assert.equal(entry.comparisonLevel, "city-label-only");
    assert.equal(entry.sourceObserver.coordinates, null);
  }
  for (const entry of delhi) {
    assert.equal(entry.testObserver.latitude, undefined, "Delhi coordinates must not be borrowed from Pithoragarh");
    assert.equal(entry.testObserver.longitude, undefined, "Delhi coordinates must not be borrowed from Pithoragarh");
    assert.equal(entry.comparisonLevel, "city-label-only");
    assert.equal(entry.sourceObserver.coordinates, null);
  }
});

test("New Delhi Venus 2026 and 2027 pairs are independently confirmed but remain city-label-only", () => {
  const source = dataset.sources["drik-venus-2026-2027-city-benchmarks"];
  assert.ok(source);
  assert.equal(source.independentChecks.length, 2);
  for (const check of source.independentChecks) {
    assert.equal(check.city, "New Delhi");
    assert.equal(check.status, "independently-confirmed");
    const entry = dataset.cases.find(item => item.id === `venus-new-delhi-${check.year}`);
    assert.ok(entry);
    assert.equal(entry.status, "independently-confirmed-city-label-only");
    assert.equal(entry.acceptanceEligible, true);
    assert.equal(entry.boundaries.astaStart, check.verifiedStartLocal);
    assert.equal(entry.boundaries.astaEnd, check.verifiedEndLocal);
    assert.equal(entry.sourceLocation, "New Delhi, NCT, India");
  }
});

test("unverified historical transcriptions are explicitly quarantined from active acceptance cases", () => {
  assert.ok(Array.isArray(dataset.excludedUnverifiedData));
  const excludedIds = new Set(dataset.excludedUnverifiedData.map(entry => entry.id));
  assert.ok(excludedIds.has("old-pithoragarh-2026-venus-transcription"));
  assert.ok(excludedIds.has("old-pithoragarh-2027-jupiter-transcription"));
  assert.ok(!dataset.cases.some(entry => excludedIds.has(entry.id)));
});

test("Pithoragarh 2027 and Varanasi transcriptions remain provisional, not acceptance targets", () => {
  assert.ok(Array.isArray(dataset.provisionalTranscriptions));
  const expected = new Set([
    "venus-pithoragarh-2027-unverified",
    "venus-varanasi-2026-unverified",
    "venus-varanasi-2027-unverified"
  ]);
  const actual = new Set(dataset.provisionalTranscriptions.map(entry => entry.id));
  for (const id of expected) assert.ok(actual.has(id), `missing provisional reference ${id}`);
  for (const entry of dataset.provisionalTranscriptions) {
    assert.equal(entry.status, "transcription-unverified");
    assert.equal(entry.acceptanceEligible, false);
    assert.ok(entry.reason);
    assert.ok(!dataset.cases.some(active => active.id === entry.id), "provisional data must not enter active cases");
  }
});

test("Rashtriya Panchang Central Station is kept separate from every city-level Drik reference", () => {
  const central = dataset.cases.find(entry => entry.id === "venus-central-station-2026-visibility-period");
  assert.ok(central);
  assert.equal(central.comparisonLevel, "coordinate-exact");
  assert.equal(central.testObserver.latitude, central.sourceObserver.latitude);
  assert.equal(central.testObserver.longitude, central.sourceObserver.longitude);
  assert.equal(central.sourceLocation, "Central Station of India");
  assert.ok(dataset.cases.filter(entry => entry.sourceLocation !== central.sourceLocation)
    .every(entry => entry.comparisonLevel === "city-label-only"));
});
