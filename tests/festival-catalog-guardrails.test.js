const test = require("node:test");
const assert = require("node:assert/strict");
const festivalsData = require("../data/festivals.json");
const festivalSchema = require("../data/festival-schema.json");
const overrideData = require("../data/festival-overrides.json");
const overrideSchema = require("../data/festival-overrides.schema.json");

const festivals = festivalsData.festivals;
const byId = Object.fromEntries(festivals.map((item) => [item.id, item]));
const dateSchema = festivalSchema.properties.festivals.items.properties.date.properties;
const allowedTypes = dateSchema.type.enum;
const allowedRenderModes = dateSchema.renderMode.enum;
const allowedStatuses = festivalSchema.properties.festivals.items.properties.verificationStatus.enum;

function isRealIsoDate(value) {
  if (typeof value !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

test("all festival and override JSON files parse", () => {
  assert.equal(festivalSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(overrideSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.ok(Array.isArray(festivals));
  assert.ok(Array.isArray(overrideData.overrides));
});

test("catalog IDs are unique and all 122 legacy records remain traceable", () => {
  assert.equal(new Set(festivals.map((item) => item.id)).size, festivals.length);
  for (let number = 1; number <= 122; number += 1) {
    const id = "festival-" + String(number).padStart(3, "0");
    assert.ok(byId[id], "missing legacy record " + id);
    assert.ok(byId[id].sourceText, "missing legacy provenance for " + id);
  }
});

test("catalog date types, render modes and verification statuses match the schema enums", () => {
  for (const item of festivals) {
    assert.ok(item.id && item.name && item.date && item.date.type, "missing required fields");
    assert.ok(allowedTypes.includes(item.date.type), item.id + " has unsupported date.type " + item.date.type);
    if (item.date.renderMode) {
      assert.ok(allowedRenderModes.includes(item.date.renderMode), item.id + " has unsupported renderMode " + item.date.renderMode);
    }
    if (item.verificationStatus) {
      assert.ok(allowedStatuses.includes(item.verificationStatus), item.id + " has unsupported verificationStatus " + item.verificationStatus);
    }
    if (item.date.start != null) assert.ok(isRealIsoDate(item.date.start), item.id + " has invalid start date");
    if (item.date.end != null) assert.ok(isRealIsoDate(item.date.end), item.id + " has invalid end date");
    if (item.date.start && item.date.end) {
      assert.ok(item.date.end >= item.date.start, item.id + " has a reversed date range");
    }
  }
});

test("year-specific overrides remain reference-only until explicitly approved", () => {
  assert.equal(overrideData.policy.autoApply, false);
  assert.equal(new Set(overrideData.overrides.map((item) => item.id)).size, overrideData.overrides.length);
  for (const item of overrideData.overrides) {
    assert.ok(isRealIsoDate(item.displayDate), item.id + " has an invalid displayDate");
    assert.ok(item.source && item.source.title && item.note, item.id + " lacks evidence or rationale");
    if (item.festivalId) assert.ok(byId[item.festivalId], item.id + " references an unknown festival");
    if (item.status !== "approved-for-application") {
      assert.notEqual(item.status, "applied", item.id + " must not silently apply an unapproved override");
    }
  }
});

test("October owner references map to distinct catalog IDs without fake article URLs", () => {
  assert.equal(byId["festival-128"].date.start, "2026-10-22");
  assert.equal(byId["festival-129"].date.start, "2026-10-23");
  assert.equal(byId["festival-130"].date.start, "2026-10-26");
  for (const id of ["festival-128", "festival-129", "festival-130"]) {
    assert.ok(byId[id].relatedArticles.every((article) => !article.url), id + " must not contain a fabricated article URL");
  }
});
