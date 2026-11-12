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

test("2029 Magha Purnima combines Lalita Jayanti and Guru Ravidas Jayanti without duplicate same-tithi cards", () => {
  const data = JSON.parse(readFileSync(join(folder, "2029-01.json"), "utf8"));
  const matches = data.events.filter(event => event.date === "2029-01-30" && /माघ पूर्णिमा/.test(event.title || ""));
  assert.equal(matches.length, 1);
  assert.match(matches[0].title, /ललिता षोडशी महाविद्या जयंती/);
  assert.match(matches[0].title, /गुरु रविदास जयंती/);
  assert.equal(matches[0].hinduTithi, "माघ शुक्ल पूर्णिमा");
  assert.match(matches[0].sourceUrl, /30%2F01%2F2029/);
  assert.match(matches[0].description, /संत रविदास/);
});

test("2029 Phalguna Purnima combines Mahalakshmi and Chaitanya Jayanti while Holika Dahan remains separate", () => {
  const data = JSON.parse(readFileSync(join(folder, "2029-02.json"), "utf8"));
  const purnima = data.events.find(event => event.date === "2029-02-28" && /फाल्गुन पूर्णिमा/.test(event.title || ""));
  assert.ok(purnima);
  assert.match(purnima.title, /श्री महालक्ष्मी जयंती/);
  assert.match(purnima.title, /चैतन्य महाप्रभु जयंती/);
  assert.equal(purnima.hinduTithi, "फाल्गुन शुक्ल पूर्णिमा");
  assert.match(purnima.description, /हरिनाम-संकीर्तन/);
  assert.ok(data.events.some(event => event.date === "2029-02-28" && event.title === "होलिका दहन" && event.muhurtaRule === "holika-dahan-pradosh"));
  assert.equal(data.events.filter(event => event.date === "2029-02-28" && /महालक्ष्मी जयंती/.test(event.title || "")).length, 0);
});
