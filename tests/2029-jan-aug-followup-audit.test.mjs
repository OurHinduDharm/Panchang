import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const folder = join(process.cwd(), "data", "festivals");

test("2029 Narada Jayanti is present on Jyeshtha Krishna Pratipada with its article link", () => {
  const data = JSON.parse(readFileSync(join(folder, "2029-05.json"), "utf8"));
  const matches = data.events.filter(event => event.date === "2029-05-28" && /नारद/.test(event.title || ""));
  assert.equal(matches.length, 1);
  assert.equal(matches[0].title, "देवर्षि नारद जी की जयन्ती");
  assert.equal(matches[0].dateLabel, "28 मई");
  assert.equal(matches[0].hinduTithi, "ज्येष्ठ कृष्ण प्रतिपदा");
  assert.equal(matches[0].reviewStatus, "approved");
  assert.match(matches[0].sourceUrl, /hinducalendar\.html\?year=2029/);
  assert.match(matches[0].articleUrl, /About-Muni-Naradji-on-Devarshi-Narad-Jayanti/);
});

test("2029 Narali Purnima display label matches its August 24 observance date", () => {
  const data = JSON.parse(readFileSync(join(folder, "2029-08.json"), "utf8"));
  const event = data.events.find(item => item.title === "नारळी पूर्णिमा");
  assert.ok(event);
  assert.equal(event.date, "2029-08-24");
  assert.equal(event.dateLabel, "24 अगस्त");
  assert.equal(event.hinduTithi, "श्रावण शुक्ल पूर्णिमा");
});
