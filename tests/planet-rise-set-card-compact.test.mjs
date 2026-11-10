import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("function createPlanetCard(data, dailyEvents = {})");
const end = source.indexOf("function createHoraCard(", start);
assert.ok(start >= 0 && end > start, "planet rise/set card function must exist");
const card = source.slice(start, end);

test("planet card keeps daily Sun/Moon rise and set plus five Tara Asta rows", () => {
  assert.match(card, /name: "सूर्य", udaya: dailyEvents\.sunrise/);
  assert.match(card, /name: "चंद्रमा", udaya: dailyEvents\.moonrise/);
  assert.match(card, /अस्त प्रारम्भ/);
  assert.match(card, /पुनः उदय/);
  assert.match(card, /ग्रहों का तारा अस्त एवं पुनः उदय/);
});

test("planet card does not add the long source-coordinate disclaimer", () => {
  assert.doesNotMatch(card, /sourceNote|आंतरिक अक्षांश|ऊँचाई प्रकाशित नहीं करता/);
  assert.doesNotMatch(card, /स्रोत: Drik Panchang का/);
  assert.doesNotMatch(card, /Drik मूल स्रोत|planet\.sourceUrl|href=.*sourceUrl/);
});

test("missing Mars or unsupported city is shown briefly without a false zero-event claim", () => {
  assert.match(card, /आगामी अस्त-अवधि उपलब्ध नहीं/);
  assert.match(card, /इस स्थान के लिए जानकारी उपलब्ध नहीं/);
  assert.doesNotMatch(card, /कोई अस्त नहीं|zero events|अस्त नहीं होगा/);
});
