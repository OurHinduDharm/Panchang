import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { listObservanceRuleProfiles } from "../festival-observance-rules.mjs";

const manifest = JSON.parse(await readFile(new URL("../data/reviews/observance-rule-mapping-2026.json", import.meta.url), "utf8"));

test("2026 observance mapping references only registered shared rule IDs", () => {
  const registered = new Set(listObservanceRuleProfiles().map(profile => profile.id));
  for (const item of manifest.mappings) {
    assert.ok(item.observanceId, "each mapped occurrence needs an explicit observanceId");
    assert.ok(Number.isInteger(item.targetTithiIndex) || Array.isArray(item.targetTithiIndices), `missing explicit tithi selector: ${item.title}`);
    assert.ok(registered.has(item.ruleId), `unknown ruleId: ${item.ruleId}`);
    assert.ok(item.date && /^2026-\d{2}-\d{2}$/.test(item.date));
    assert.ok(item.hinduTithi, `missing Hindu tithi: ${item.title}`);
    assert.ok(item.classification);
    assert.ok(item.reason);
  }
});

test("2026 mapping remains review-only and never changes publication records", () => {
  assert.equal(manifest.status, "review-only-not-approved");
  assert.equal(manifest.year, 2026);
  assert.equal(manifest.mappings.length, manifest.counts.mappedRecords);
  assert.equal(new Set(manifest.mappings.map(item => item.observanceId)).size, manifest.counts.distinctObservanceIds);
  assert.equal(manifest.counts.mappedOccurrences, manifest.counts.distinctObservanceIds);
  assert.equal(manifest.counts.possibleDuplicateRecords, 1);
  assert.equal(new Set(manifest.mappings.map(item => item.ruleId)).size, manifest.counts.distinctRuleIds);
  assert.ok(manifest.mappings.every(item => item.classification !== "approved"));
  assert.ok(manifest.mappings.every(item => !("finalDate" in item) && !("publishable" in item)));
});

test("muhurtaRule remains explicitly separate from observance rule mapping", () => {
  assert.match(manifest.fieldPolicy.muhurtaRule, /never used as a substitute/);
  assert.ok(manifest.mappings.every(item => !("muhurtaRule" in item)));
});
