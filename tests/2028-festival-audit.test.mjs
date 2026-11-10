import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) =>
  JSON.parse(readFileSync(join(folder, "2028-" + String(i + 1).padStart(2, "0") + ".json"), "utf8")));
const events = months.flatMap(data => data.events || []);

test("2028 festival catalog follows the Smarta-only Ekadashi policy", () => {
  const excluded = events.filter(event =>
    event.category === "एकादशी" && /(गौण|वैष्णव)/.test(event.title || ""));
  assert.deepEqual(excluded, []);
});

test("2028 monthly festival files have approved records dated within their month", () => {
  for (const [index, data] of months.entries()) {
    assert.equal(data.year, 2028);
    assert.equal(data.month, index + 1);
    assert.equal(data.status, "approved");
    for (const event of data.events || []) {
      assert.equal(event.reviewStatus, "approved", event.date + ": " + event.title);
      assert.match(event.date, /^2028-\d{2}-\d{2}$/);
      assert.equal(Number(event.date.slice(5, 7)), index + 1,
        event.date + " is stored in the wrong monthly file");
    }
  }
});

test("2028 has one card per same-date Hindu tithi", () => {
  const seen = new Map();
  for (const event of events) {
    if (!event.hinduTithi) continue;
    const key = String(event.date) + "|" + String(event.hinduTithi);
    assert.ok(!seen.has(key),
      "Duplicate same-date/tithi cards: " + key + ": " + seen.get(key) + " / " + event.title);
    seen.set(key, event.title);
  }
});

test("2028 Pithoragarh-visible lunar eclipses retain local contact times", () => {
  const july = events.find(event => event.date === "2028-07-06" && /आंशिक चंद्रग्रहण/.test(event.title || ""));
  assert.ok(july);
  assert.equal(july.hinduTithi, "आषाढ़ शुक्ल पूर्णिमा");
  assert.match(july.description, /10:39 बजे से 7 जुलाई रात 1:00 बजे तक/);
  assert.match(july.sourceUrl, /timeanddate\.com\/eclipse\/in\/india\/pithoragarh/);

  const december = events.find(event => event.date === "2028-12-31" && /पूर्ण चंद्रग्रहण/.test(event.title || ""));
  assert.ok(december);
  assert.equal(december.hinduTithi, "पौष शुक्ल पूर्णिमा");
  assert.match(december.description, /9:46 से 10:57 बजे तक/);
  assert.match(december.description, /1:10 बजे समाप्त/);
});
