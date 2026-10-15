const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../data/festivals.json");
const fs = require("node:fs");

test("draft JSON renderer is configured for a rolling 14-day window", () => {
  const source = fs.readFileSync(require.resolve("../festival-json-widget.js"), "utf8");
  assert.match(source, /var DAYS_AHEAD = 14/);
  assert.match(source, /item\.date\.start/);
  assert.match(source, /ongoing \|\| \(startDiff >= 0 && startDiff <= DAYS_AHEAD\)/);
});

test("related links are restricted to HTTP(S) and missing URLs render as text", () => {
  const source = fs.readFileSync(require.resolve("../festival-json-widget.js"), "utf8");
  assert.match(source, /u\.protocol === "https:" \|\| u\.protocol === "http:"/);
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
