import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [drik, independent] = await Promise.all([
  readFile(new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/independent-asta-udaya-crosschecks-2026-2027.json", import.meta.url), "utf8").then(JSON.parse)
]);

test("Panchang Guru cross-check ledger has independently documented engine provenance", () => {
  const source = independent.sources.find(item => item.id === "panchang-guru-trikala");
  assert.ok(source);
  assert.match(source.method.engine, /Trikala/);
  assert.match(source.method.planetaryPositions, /VSOP87/);
  assert.equal(source.sourceLocation, "New Delhi, India");
  assert.equal(source.trainingEligible, false);
  assert.equal(source.crossValidationEligible, true);
  assert.equal(source.windows.length, 7);
  assert.ok(source.windows.every(row => row.sourcePage && row.astaStart && row.astaEnd));
});

test("Panchang Guru windows reconcile to same-city direct Drik windows without hiding date differences", () => {
  const source = independent.sources.find(item => item.id === "panchang-guru-trikala");
  const drikRows = drik.windows.filter(row =>
    row.sourceLocation === "New Delhi, NCT, India" &&
    row.acceptanceEligible &&
    row.sourceStatus === "direct-page-captured-browser-verified"
  );
  assert.equal(drikRows.length > 0, true);
  const used = new Set();
  const comparisons = source.windows.map(reference => {
    const ranked = drikRows.filter(row => row.planet === reference.planet && !used.has(row.id))
      .map(row => ({
        row,
        score:
          Math.abs(Date.parse(row.boundaries.astaStart.normalizedLocalDateTime) - Date.parse(reference.astaStart)) +
          Math.abs(Date.parse(row.boundaries.astaEnd.normalizedLocalDateTime) - Date.parse(reference.astaEnd))
      })).sort((a, b) => a.score - b.score);
    assert.ok(ranked.length, "missing same-city Drik row for " + reference.planet);
    used.add(ranked[0].row.id);
    return { reference, drik: ranked[0].row };
  });
  assert.equal(comparisons.length, 7);
  for (const { reference, drik: row } of comparisons) {
    for (const boundary of ["astaStart", "astaEnd"]) {
      const sourceValue = reference[boundary];
      const drikValue = row.boundaries[boundary].normalizedLocalDateTime;
      const differenceMinutes = Math.round((Date.parse(sourceValue) - Date.parse(drikValue)) / 60000);
      assert.ok(Math.abs(differenceMinutes) <= 1445,
        reference.planet + " " + boundary + " unexpectedly differs by more than about one day");
    }
  }
  const venus2025_26 = comparisons.find(item =>
    item.reference.planet === "Venus" && item.reference.labelYear === 2026 &&
    item.reference.astaStart.startsWith("2025-12-12")
  );
  assert.ok(venus2025_26);
  assert.notEqual(
    venus2025_26.reference.astaStart.slice(0, 10),
    venus2025_26.drik.boundaries.astaStart.normalizedLocalDateTime.slice(0, 10),
    "The known one-day Asta date-assignment discrepancy must remain visible"
  );
});

test("Rashtriya Panchang heliacal records preserve 24+ hour rollover and event semantics", () => {
  const source = independent.sources.find(item => item.id === "rashtriya-panchang-imd-heliacal");
  assert.ok(source);
  assert.match(source.method.eventMeaning, /Heliacal/);
  assert.equal(source.events.length, 20);
  const rollover = source.events.filter(event => event.dayRollover === 1);
  assert.equal(rollover.length, 4);
  assert.ok(rollover.every(event => event.localDateTime.slice(11, 13) !== "24" &&
    event.localDateTime.slice(11, 13) !== "25" &&
    event.localDateTime.slice(11, 13) !== "26"));
  assert.equal(source.trainingEligible, false);
});

test("Sūrya Siddhānta API stays a separate documented model, not a visibility fit", () => {
  const source = independent.sources.find(item => item.id === "tathaastu-surya-siddhanta");
  assert.ok(source);
  assert.equal(source.crossValidationEligible, false);
  assert.equal(source.trainingEligible, false);
  assert.equal(source.method.thresholdsDegrees.Mars, 17);
  assert.equal(source.method.thresholdsDegrees.Jupiter, 11);
  assert.equal(source.method.thresholdsDegrees.Saturn, 15);
  assert.equal(source.method.thresholdsDegrees.Venus.inferiorConjunction, 8);
  assert.equal(source.method.thresholdsDegrees.Venus.superiorConjunction, 10);
});
