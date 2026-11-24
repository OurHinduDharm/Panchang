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


const manifest2027 = JSON.parse(await readFile(new URL("../data/reviews/observance-rule-mapping-2027.json", import.meta.url), "utf8"));

test("2027 candidate mappings are explicit, source-linked, and review-only", async () => {
  const profiles = new Map(listObservanceRuleProfiles().map(profile => [profile.id, profile]));
  const months = await Promise.all(Array.from({ length: 12 }, (_, index) =>
    readFile(new URL(`../data/festivals/2027-${String(index + 1).padStart(2, "0")}.json`, import.meta.url), "utf8").then(JSON.parse)
  ));
  const sourceKeys = new Set(months.flatMap(month => month.events.map(event => `${event.date}::${event.title}`)));
  assert.equal(manifest2027.status, "review-only-not-approved");
  assert.equal(manifest2027.year, 2027);
  assert.equal(manifest2027.mappings.length, manifest2027.counts.mappedRecords);
  assert.equal(new Set(manifest2027.mappings.map(item => item.recordKey)).size, manifest2027.mappings.length);
  assert.equal(new Set(manifest2027.mappings.map(item => item.observanceId)).size, manifest2027.counts.distinctObservanceIds);
  assert.equal(new Set(manifest2027.mappings.map(item => item.ruleId)).size, manifest2027.counts.distinctRuleIds);
  for (const item of manifest2027.mappings) {
    const profile = profiles.get(item.ruleId);
    assert.ok(profile, `unknown ruleId: ${item.ruleId}`);
    assert.ok(Number.isInteger(item.targetTithiIndex));
    assert.ok(profile.tithiIndices.includes(item.targetTithiIndex), `invalid tithi selector: ${item.title}`);
    assert.ok(sourceKeys.has(item.recordKey), `missing source record: ${item.recordKey}`);
    assert.ok(item.reason && item.classification);
    assert.notEqual(item.classification, "approved");
  }
  assert.ok(manifest2027.mappings.every(item => !("finalDate" in item) && !("publishable" in item)));
  assert.ok(manifest2027.mappings.filter(item => item.ruleId === "sankashti-moonrise").every(item => item.classification === "blocked-awaiting-annual-panchang-input"));
  assert.ok(!manifest2027.mappings.some(item => item.ruleId === "ekadashi-smarta-udaya" && /वैष्णव/.test(item.title)));
  assert.ok(manifest2027.mappings.some(item => item.recordKey === "2027-10-07::दुर्गाष्टमी / महाष्टमी / मासिक दुर्गाष्टमी — माँ महागौरी"));
  assert.ok(manifest2027.mappings.some(item => item.recordKey === "2027-10-08::महानवमी / माँ सिद्धिदात्री पूजन"));
  assert.ok(manifest2027.excludedOrDeferred.some(item => item.title === "बंगाल विजयादशमी"));
  assert.ok(manifest2027.excludedOrDeferred.some(item => item.title === "मैसूर दशहरा"));
});

test("2027 Karwa Chauth remains separate from the coincident Sankashti record", () => {
  const sankashti = manifest2027.mappings.find(item => item.date === "2027-10-18" && item.ruleId === "sankashti-moonrise");
  assert.ok(sankashti);
  assert.equal(sankashti.coincidentObservance, "2027-10-18::करक चतुर्थी / करवा चौथ");
  assert.match(sankashti.reason, /अलग वक्रतुण्ड संकष्टी रिकॉर्ड/);
  assert.ok(manifest2027.excludedOrDeferred.some(item => item.date === "2027-10-18" && item.title === "करक चतुर्थी / करवा चौथ"));
});

const manifest2028 = JSON.parse(await readFile(new URL("../data/reviews/observance-rule-mapping-2028.json", import.meta.url), "utf8"));

test("2028 candidate mappings are explicit, source-linked, and review-only", async () => {
  const profiles = new Map(listObservanceRuleProfiles().map(profile => [profile.id, profile]));
  const months = await Promise.all(Array.from({ length: 12 }, (_, index) =>
    readFile(new URL(`../data/festivals/2028-${String(index + 1).padStart(2, "0")}.json`, import.meta.url), "utf8").then(JSON.parse)
  ));
  const sourceKeys = new Set(months.flatMap(month => month.events.map(event => `${event.date}::${event.title}`)));
  assert.equal(manifest2028.status, "review-only-not-approved");
  assert.equal(manifest2028.year, 2028);
  assert.equal(manifest2028.mappings.length, manifest2028.counts.mappedRecords);
  assert.equal(new Set(manifest2028.mappings.map(item => item.recordKey)).size, manifest2028.mappings.length);
  assert.equal(new Set(manifest2028.mappings.map(item => item.observanceId)).size, manifest2028.counts.distinctObservanceIds);
  assert.equal(new Set(manifest2028.mappings.map(item => item.ruleId)).size, manifest2028.counts.distinctRuleIds);
  for (const item of manifest2028.mappings) {
    const profile = profiles.get(item.ruleId);
    assert.ok(profile, `unknown ruleId: ${item.ruleId}`);
    assert.ok(Number.isInteger(item.targetTithiIndex));
    assert.ok(profile.tithiIndices.includes(item.targetTithiIndex), `invalid tithi selector: ${item.title}`);
    assert.ok(sourceKeys.has(item.recordKey), `missing source record: ${item.recordKey}`);
    assert.ok(item.reason && item.classification);
    assert.notEqual(item.classification, "approved");
  }
  assert.ok(manifest2028.mappings.every(item => !("finalDate" in item) && !("publishable" in item)));
  assert.ok(manifest2028.mappings.filter(item => item.ruleId === "sankashti-moonrise").every(item => item.classification === "blocked-awaiting-annual-panchang-input"));
  assert.ok(manifest2028.mappings.some(item => item.recordKey === "2028-05-24::शनि जयंती" && item.targetTithiIndex === 29));
  assert.ok(manifest2028.mappings.some(item => item.recordKey === "2028-09-27::विजयादशमी / नवरात्रि पारण" && item.targetTithiIndex === 9 && item.classification === "manual-review"));
  assert.ok(manifest2028.mappings.some(item => item.recordKey === "2028-02-23::महाशिवरात्रि / मासिक शिवरात्रि" && item.ruleId === "mahashivaratri-nishita"));
  assert.ok(!manifest2028.mappings.some(item => item.recordKey === "2028-02-23::महाशिवरात्रि / मासिक शिवरात्रि" && item.ruleId === "masik-shivaratri-nishita"));
  const sankashti = manifest2028.mappings.find(item => item.date === "2028-10-07" && item.ruleId === "sankashti-moonrise");
  assert.equal(sankashti.coincidentObservance, "करक चतुर्थी / करवा चौथ");
  assert.ok(manifest2028.excludedOrDeferred.some(item => item.title === "करक चतुर्थी / करवा चौथ"));
  assert.ok(manifest2028.excludedOrDeferred.some(item => item.title === "गौरी गणेश चतुर्थी / गणेश जयंती"));
  assert.ok(manifest2028.excludedOrDeferred.some(item => item.date === "2028-08-10" && item.title === "नाग पंचमी"));
});

test("2028 regional Bengal Vijayadashami is not mapped to the general rule", () => {
  assert.ok(!manifest2028.mappings.some(item => item.recordKey === "2028-09-28::बंगाल विजयादशमी"));
  assert.ok(manifest2028.excludedOrDeferred.some(item => item.date === "2028-09-28" && item.title === "बंगाल विजयादशमी"));
});

const manifest2029 = JSON.parse(await readFile(new URL("../data/reviews/observance-rule-mapping-2029.json", import.meta.url), "utf8"));

test("2029 candidate mappings are explicit, source-linked, and review-only", async () => {
  const profiles = new Map(listObservanceRuleProfiles().map(profile => [profile.id, profile]));
  const months = await Promise.all(Array.from({ length: 12 }, (_, index) =>
    readFile(new URL(`../data/festivals/2029-${String(index + 1).padStart(2, "0")}.json`, import.meta.url), "utf8").then(JSON.parse)
  ));
  const sourceKeys = new Set(months.flatMap(month => month.events.map(event => `${event.date}::${event.title}`)));
  assert.equal(manifest2029.status, "review-only-not-approved");
  assert.equal(manifest2029.year, 2029);
  assert.equal(manifest2029.mappings.length, manifest2029.counts.mappedRecords);
  assert.equal(new Set(manifest2029.mappings.map(item => item.recordKey)).size, manifest2029.mappings.length);
  assert.equal(new Set(manifest2029.mappings.map(item => item.observanceId)).size, manifest2029.counts.distinctObservanceIds);
  assert.equal(new Set(manifest2029.mappings.map(item => item.ruleId)).size, manifest2029.counts.distinctRuleIds);
  for (const item of manifest2029.mappings) {
    const profile = profiles.get(item.ruleId);
    assert.ok(profile, `unknown ruleId: ${item.ruleId}`);
    assert.ok(Number.isInteger(item.targetTithiIndex));
    assert.ok(profile.tithiIndices.includes(item.targetTithiIndex), `invalid tithi selector: ${item.title}`);
    assert.ok(sourceKeys.has(item.recordKey), `missing source record: ${item.recordKey}`);
    assert.ok(item.reason && item.classification);
    assert.notEqual(item.classification, "approved");
  }
  assert.ok(manifest2029.mappings.every(item => !("finalDate" in item) && !("publishable" in item)));
  assert.ok(manifest2029.mappings.filter(item => item.ruleId === "sankashti-moonrise").every(item => item.classification === "blocked-awaiting-annual-panchang-input"));
  assert.ok(manifest2029.mappings.some(item => item.recordKey === "2029-09-19::बुध प्रदोष व्रत" && item.targetTithiIndex === 12 && item.classification === "manual-review"));
  assert.ok(manifest2029.mappings.some(item => item.recordKey === "2029-06-12::शनि जयंती" && item.targetTithiIndex === 29));
  assert.ok(manifest2029.mappings.some(item => item.recordKey === "2029-04-28::हनुमान जयंती" && item.targetTithiIndex === 14));
  const sankashti = manifest2029.mappings.find(item => item.date === "2029-10-26" && item.ruleId === "sankashti-moonrise");
  assert.equal(sankashti.coincidentObservance, "करवा चौथ");
  assert.ok(manifest2029.excludedOrDeferred.some(item => item.title === "करवा चौथ"));
  assert.ok(manifest2029.excludedOrDeferred.some(item => item.title === "गौरी गणेश चतुर्थी / गणेश जयंती"));
});

const manifest2030 = JSON.parse(await readFile(new URL("../data/reviews/observance-rule-mapping-2030.json", import.meta.url), "utf8"));

test("2030 candidate mappings are explicit, source-linked, and review-only", async () => {
  const profiles = new Map(listObservanceRuleProfiles().map(profile => [profile.id, profile]));
  const months = await Promise.all(Array.from({ length: 12 }, (_, index) =>
    readFile(new URL(`../data/festivals/2030-${String(index + 1).padStart(2, "0")}.json`, import.meta.url), "utf8").then(JSON.parse)
  ));
  const sourceKeys = new Set(months.flatMap(month => month.events.map(event => `${event.date}::${event.title}`)));
  assert.equal(manifest2030.status, "review-only-not-approved");
  assert.equal(manifest2030.year, 2030);
  assert.equal(manifest2030.mappings.length, manifest2030.counts.mappedRecords);
  assert.equal(new Set(manifest2030.mappings.map(item => item.recordKey)).size, manifest2030.mappings.length);
  assert.equal(new Set(manifest2030.mappings.map(item => item.observanceId)).size, manifest2030.counts.distinctObservanceIds);
  assert.equal(new Set(manifest2030.mappings.map(item => item.ruleId)).size, manifest2030.counts.distinctRuleIds);
  for (const item of manifest2030.mappings) {
    const profile = profiles.get(item.ruleId);
    assert.ok(profile, `unknown ruleId: ${item.ruleId}`);
    const selectors = Number.isInteger(item.targetTithiIndex) ? [item.targetTithiIndex] : item.targetTithiIndices;
    assert.ok(Array.isArray(selectors) && selectors.length > 0);
    for (const selector of selectors) assert.ok(profile.tithiIndices.includes(selector), `invalid tithi selector: ${item.title}`);
    assert.ok(sourceKeys.has(item.recordKey), `missing source record: ${item.recordKey}`);
    assert.ok(item.reason && item.classification);
    assert.notEqual(item.classification, "approved");
  }
  assert.ok(manifest2030.mappings.every(item => !("finalDate" in item) && !("publishable" in item)));
  assert.ok(manifest2030.mappings.filter(item => item.ruleId === "sankashti-moonrise").every(item => item.classification === "blocked-awaiting-annual-panchang-input"));
  assert.ok(manifest2030.mappings.some(item => item.recordKey === "2030-08-20::श्रीकृष्ण जन्माष्टमी (स्मार्त)" && item.targetTithiIndex === 22));
  assert.ok(!manifest2030.mappings.some(item => /मासिक कृष्ण जन्माष्टमी/.test(item.title)));
  assert.ok(manifest2030.mappings.some(item => item.recordKey === "2030-04-07::चैत्र नवरात्र चतुर्थी — माँ कूष्माण्डा" && Array.isArray(item.targetTithiIndices)));
  assert.ok(manifest2030.mappings.some(item => item.recordKey === "2030-06-28::शुक्र प्रदोष व्रत / मासिक शिवरात्रि" && item.ruleId === "pradosh-trayodashi" && item.coincidentObservance === "मासिक शिवरात्रि"));
  assert.ok(manifest2030.mappings.some(item => item.recordKey === "2030-10-15::वक्रतुण्ड संकष्टी चतुर्थी" && item.coincidentObservance === "करवा चौथ"));
  assert.ok(!manifest2030.mappings.some(item => /शनि जयंती/.test(item.title)));
  assert.ok(manifest2030.excludedOrDeferred.some(item => item.date === "2030-05-31" && /शनि जयंती/.test(item.title)));
  assert.ok(manifest2030.excludedOrDeferred.some(item => item.date === "2030-06-01" && /शनि जयंती/.test(item.title)));
  assert.ok(manifest2030.excludedOrDeferred.some(item => item.title === "करवा चौथ"));
  assert.ok(manifest2030.excludedOrDeferred.some(item => item.title === "चन्द्र दर्शन / माघ गुप्त नवरात्र प्रारंभ — माँ शैलपुत्री"));
  assert.ok(manifest2030.excludedOrDeferred.some(item => item.title === "आषाढ़ गुप्त नवरात्र प्रारंभ — माँ शैलपुत्री"));
});
