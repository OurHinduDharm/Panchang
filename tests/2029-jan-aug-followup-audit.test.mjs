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

test("2029 Magha Purnima, Lalita Jayanti and Guru Ravidas Jayanti retain independent cards", () => {
  const data = JSON.parse(readFileSync(join(folder, "2029-01.json"), "utf8"));
  const onDate = data.events.filter(event => event.date === "2029-01-30");
  for (const title of ["माघ पूर्णिमा", "ललिता षोडशी महाविद्या जयंती", "गुरु रविदास जयंती"]) {
    const event = onDate.find(item => item.title === title);
    assert.ok(event, "Missing independent card: " + title);
    assert.equal(event.hinduTithi, "माघ शुक्ल पूर्णिमा");
  }
  assert.match(onDate.find(item => item.title === "माघ पूर्णिमा").sourceUrl, /30%2F01%2F2029/);
  assert.match(onDate.find(item => item.title === "ललिता षोडशी महाविद्या जयंती").articleUrl, /Stotratmak-Worship/);
  assert.match(onDate.find(item => item.title === "गुरु रविदास जयंती").description, /संत रविदास/);
});

test("2029 Phalguna Purnima, Mahalakshmi and Chaitanya Jayanti retain independent cards; Holika Dahan stays separate", () => {
  const data = JSON.parse(readFileSync(join(folder, "2029-02.json"), "utf8"));
  const onDate = data.events.filter(event => event.date === "2029-02-28");
  for (const title of ["फाल्गुन पूर्णिमा", "श्री महालक्ष्मी जयंती", "चैतन्य महाप्रभु जयंती", "होलिका दहन"]) {
    assert.ok(onDate.some(event => event.title === title), "Missing independent card: " + title);
  }
  for (const title of ["फाल्गुन पूर्णिमा", "श्री महालक्ष्मी जयंती", "चैतन्य महाप्रभु जयंती"]) {
    assert.equal(onDate.find(event => event.title === title).hinduTithi, "फाल्गुन शुक्ल पूर्णिमा");
  }
  assert.equal(onDate.find(event => event.title === "होलिका दहन").muhurtaRule, "holika-dahan-pradosh");
  assert.match(onDate.find(event => event.title === "श्री महालक्ष्मी जयंती").articleUrl, /About-Mahalakshmi/);
  assert.match(onDate.find(event => event.title === "चैतन्य महाप्रभु जयंती").description, /हरिनाम-संकीर्तन/);
});
