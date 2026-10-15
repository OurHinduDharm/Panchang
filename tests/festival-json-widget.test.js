const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../data/festivals.json");
const widget = require("../festival-json-widget.js");
const fs = require("node:fs");

test("draft JSON renderer is configured for a rolling 14-day window", () => {
  const source = fs.readFileSync(require.resolve("../festival-json-widget.js"), "utf8");
  assert.match(source, /var DAYS_AHEAD = 14/);
  assert.match(source, /startDiff >= 0 && startDiff < DAYS_AHEAD/);
  assert.match(source, /ongoing \|\| \(startDiff >= 0 && startDiff < DAYS_AHEAD\)/);
});

test("14-day selection includes today and day 13, but excludes day 14", () => {
  const base = new Date(2026, 9, 15, 12);
  const sample = {
    festivals: [
      { id: "today", name: "आज", date: { start: "2026-10-15" } },
      { id: "day13", name: "तेरहवाँ दिन", date: { start: "2026-10-28" } },
      { id: "day14", name: "चौदह दिन बाद", date: { start: "2026-10-29" } }
    ]
  };
  assert.deepEqual(widget.selectUpcoming(sample, base).map((item) => item.id), ["today", "day13"]);
});

test("ongoing multi-day events remain visible, but expired daily observances do not", () => {
  const sample = {
    festivals: [
      { id: "ongoing", name: "चल रहा पर्व", date: { start: "2026-10-11", end: "2026-10-20" } },
      { id: "old-day", name: "बीता दैनिक पर्व", date: { start: "2026-10-14" } },
      { id: "today", name: "आज", date: { start: "2026-10-15" } }
    ]
  };
  assert.deepEqual(widget.selectUpcoming(sample, new Date(2026, 9, 15, 12)).map((item) => item.id), ["ongoing", "today"]);
});

test("invalid calendar dates and reversed ranges are excluded", () => {
  assert.equal(widget.validDate("2026-02-31"), null);
  assert.equal(widget.validDate("2026-10-15").getDate(), 15);
  const sample = {
    festivals: [
      { id: "invalid", date: { start: "2026-02-31" } },
      { id: "reversed", date: { start: "2026-10-18", end: "2026-10-17" } },
      { id: "valid", name: "सही", date: { start: "2026-10-16" } }
    ]
  };
  assert.deepEqual(widget.selectUpcoming(sample, new Date(2026, 9, 15, 12)).map((item) => item.id), ["valid"]);
});

test("related links are restricted to HTTP(S) and missing URLs render as text", () => {
  assert.equal(widget.safeHttpUrl("javascript:alert(1)"), "");
  assert.equal(widget.safeHttpUrl("data:text/html,unsafe"), "");
  assert.match(widget.safeHttpUrl("https://example.com/path"), /^https:\/\//);
  const source = fs.readFileSync(require.resolve("../festival-json-widget.js"), "utf8");
  assert.match(source, /entry\.title/);
  assert.match(source, /Keep the existing legacy-rendered list visible if JSON loading fails/);
  assert.match(source, /new DOMParser\(\)\.parseFromString/);
  assert.match(source, /Preserve existing legacy descriptions and links without injecting raw HTML/);
});

test("Govardhan and Bhai Dooj article titles have no fabricated URLs", () => {
  for (const id of ["festival-022", "festival-023"]) {
    const item = data.festivals.find((entry) => entry.id === id);
    assert.ok(item.relatedArticles.some((entry) => entry.title && !entry.url));
  }
});

test("Navaratri daily observances do not remain visible through the whole parent festival", () => {
  const visible = widget.selectUpcoming(data, new Date(2026, 9, 15, 12)).map((item) => item.id);
  assert.ok(visible.includes("festival-003"), "the parent Navaratri event should remain visible");
  assert.ok(visible.includes("festival-007"), "today's Navaratri observance should be visible");
  for (const id of ["festival-004", "festival-005", "festival-006"]) {
    assert.equal(visible.includes(id), false, id + " is an expired daily observance");
  }
});
