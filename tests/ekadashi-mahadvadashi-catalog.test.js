// Research guardrails for the source-attested Mahadvadashi catalogue.
// These checks validate catalogue integrity only; they do not decide vrata dates.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const catalog = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../data/ekadashi-mahadvadashi-research.json"), "utf8"
));

test("MDV-CAT-01: catalogue remains explicitly research-only", () => {
  assert.equal(catalog.status, "research-only-not-runtime");
  assert.match(catalog.policy.notFor, /Do not select fasting dates/);
});

test("MDV-CAT-02: all eight named Mahadvadashi categories are present exactly once", () => {
  const expected = [
    "unmilani", "vanjuli", "trisprsha", "pakshavardhini",
    "jaya", "vijaya", "jayanti", "papanashini"
  ];
  const ids = catalog.types.map(item => item.id);
  assert.equal(ids.length, 8);
  assert.deepEqual([...ids].sort(), [...expected].sort());
  assert.equal(new Set(ids).size, ids.length);
});

test("MDV-CAT-03: the four supplied nakshatra pairings stay distinct", () => {
  const pairings = catalog.types
    .filter(item => item.nakshatra)
    .map(item => [item.id, item.nakshatra])
    .sort((a, b) => a[0].localeCompare(b[0]));
  assert.deepEqual(pairings, [
    ["jayanti", "Punarvasu"],
    ["jaya", "Pushya"],
    ["papanashini", "Rohini"],
    ["vijaya", "Shravana"]
  ]);
});

test("MDV-CAT-04: each category records source text and unresolved implementation status", () => {
  for (const item of catalog.types) {
    assert.ok(item.nameSanskrit, `missing Sanskrit name for ${item.id}`);
    assert.ok(item.sourceDefinition, `missing source definition for ${item.id}`);
    assert.ok(item.workingMeaning, `missing cautious working meaning for ${item.id}`);
    assert.ok(item.requiredEvidence.length > 0, `missing inputs for ${item.id}`);
    assert.match(item.status, /not-operationalized|unresolved|needs-scope/);
  }
});

test("MDV-CAT-05: catalogue does not silently supply a default rule", () => {
  assert.match(catalog.policy.unresolvedHandling, /do not choose a default/i);
  assert.match(catalog.policy.intervalConvention, /half-open astronomical intervals/);
});
