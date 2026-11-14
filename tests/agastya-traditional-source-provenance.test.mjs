import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const audit = JSON.parse(fs.readFileSync(new URL(
  "../research/agastya/traditional-arghya-source-provenance-audit.json", import.meta.url
), "utf8"));
const production = JSON.parse(fs.readFileSync(new URL(
  "../data/agastya-arghya-pithoragarh.json", import.meta.url
), "utf8"));

test("Agastya source audit covers exactly the existing public years without changing public data", () => {
  assert.deepEqual(audit.records.map(row => row.year), production.years.map(row => row.year));
  assert.equal(audit.policy.publicDataChanged, false);
  for (const row of audit.records) {
    const current = production.years.find(item => item.year === row.year);
    assert.equal(row.arghyaDate, current.arghyaDate);
    assert.equal(row.taraRise, current.taraRise);
    assert.equal(row.arghyaEnd, current.arghyaEnd);
  }
});

test("legacy 2024-2027 records are never counted as source-verified or consensus eligible", () => {
  const legacy = audit.records.filter(row => row.year >= 2024 && row.year <= 2027);
  assert.equal(legacy.length, 4);
  for (const row of legacy) {
    assert.equal(row.evidenceStatus, "legacy-unverified");
    assert.equal(row.sourceCapture, null);
    assert.equal(row.consensusEligible, false);
  }
});

test("2028-2030 captures preserve raw rollover notation and remain single-source only", () => {
  const captured = audit.records.filter(row => row.year >= 2028);
  assert.equal(captured.length, 3);
  for (const row of captured) {
    assert.equal(row.evidenceStatus, "captured-single-source");
    assert.equal(row.sourceCapture.provider, "Drik Panchang");
    assert.equal(row.sourceCapture.locationMatch, "city-label-only");
    assert.equal(row.sourceCapture.coordinateExact, false);
    assert.match(row.sourceCapture.rawTaraRise, /28:/);
    assert.equal(row.consensusEligible, false);
  }
});

test("different-city comparisons are explicitly context-only and cannot enter Pithoragarh consensus", () => {
  assert.ok(audit.nonComparableReferences.length >= 4);
  assert.ok(audit.nonComparableReferences.every(row => row.use === "context-only"));
  assert.equal(audit.policy.doNotAverageDifferentCities, true);
  assert.equal(audit.policy.doNotTreatSameProviderDifferentCityAsIndependentConfirmation, true);
});

test("traditional Arghya remains separate from modern Canopus heliacal visibility", () => {
  assert.equal(audit.eventDefinition, "traditional-agastya-arghya");
  assert.equal(audit.policy.keepTraditionalArghyaSeparateFromModernHeliacalFirstVisibility, true);
});
