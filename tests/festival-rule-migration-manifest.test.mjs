import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { listObservanceRuleProfiles } from "../festival-observance-rules.mjs";

const manifest = JSON.parse(await readFile(new URL("../data/reviews/observance-rule-mapping-2026.json", import.meta.url), "utf8"));

test("2026 observance mapping references only registered shared rule IDs", () => {
  const profiles = new Map(listObservanceRuleProfiles().map(profile => [profile.id, profile]));
  for (const item of manifest.mappings) {
    assert.ok(item.observanceId, "each mapped occurrence needs an explicit observanceId");
    assert.ok(Number.isInteger(item.targetTithiIndex) || Array.isArray(item.targetTithiIndices), `missing explicit tithi selector: ${item.title}`);
    assert.ok(profiles.has(item.ruleId), `unknown ruleId: ${item.ruleId}`);
    const profile = profiles.get(item.ruleId);
    const targetIndices = item.targetTithiIndices ?? [item.targetTithiIndex];
    assert.ok(targetIndices.every(index => profile.tithiIndices.includes(index)), `tithi selector is outside ${item.ruleId}: ${item.title}`);
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


test("2026 manifest counts and record keys match all twelve source catalogues", async () => {
  const months = await Promise.all(Array.from({ length: 12 }, (_, index) =>
    readFile(new URL(`../data/festivals/2026-${String(index + 1).padStart(2, "0")}.json`, import.meta.url), "utf8")
      .then(JSON.parse)
  ));
  const sourceKeys = new Set(months.flatMap(month =>
    month.events.map(event => `${event.date}::${event.title}`)
  ));
  const manifestKeys = manifest.mappings.map(item => item.recordKey);
  assert.equal(new Set(manifestKeys).size, manifestKeys.length);
  assert.ok(manifestKeys.every(key => sourceKeys.has(key)), "every mapping must reference an existing source record");
  assert.equal(manifest.counts.mappedRecords, manifest.mappings.length);
  assert.equal(manifest.counts.mappedOccurrences, manifest.mappings.length);
  assert.equal(manifest.counts.distinctObservanceIds, new Set(manifest.mappings.map(item => item.observanceId)).size);
  assert.equal(manifest.counts.distinctRuleIds, new Set(manifest.mappings.map(item => item.ruleId)).size);
});


test("all 2026 Sankashti records except the Karwa Chauth-specific record are explicitly mapped", async () => {
  const months = await Promise.all(Array.from({ length: 12 }, (_, index) =>
    readFile(new URL(`../data/festivals/2026-${String(index + 1).padStart(2, "0")}.json`, import.meta.url), "utf8")
      .then(JSON.parse)
  ));
  const sourceRecords = months.flatMap(month => month.events)
    .filter(event => /संकष्टी|संकट चौथ/i.test(String(event.title || "")));
  const expected = sourceRecords.filter(event => !/करकचतुर्थी/i.test(String(event.title || "")));
  const mapped = new Set(manifest.mappings.map(item => item.recordKey));
  for (const event of expected) {
    assert.ok(mapped.has(`${event.date}::${event.title}`), `unmapped Sankashti record: ${event.date} ${event.title}`);
  }
  const karwa = sourceRecords.find(event => /करकचतुर्थी/i.test(String(event.title || "")));
  assert.ok(karwa);
  assert.ok(manifest.excludedOrDeferred.some(item => item.date === karwa.date && item.title === karwa.title));
});
