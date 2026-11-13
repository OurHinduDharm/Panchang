import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("function createPlanetCard(data, dailyEvents = {})");
const end = source.indexOf("function createHoraCard(", start);
assert.ok(start >= 0 && end > start, "planet rise/set card function must exist");
const card = source.slice(start, end);

test("planet card contains only Guru and Shukra Tara Asta dates", () => {
  assert.match(card, /अस्त प्रारम्भ/);
  assert.match(card, /पुनः उदय/);
  assert.match(card, /गुरु, शुक्र एवं अगस्त्य तारा उदय-अस्त/);
  assert.doesNotMatch(card, /सूर्य|चंद्रमा|मंगल|बुध|शनि/);
});

test("planet card does not add the long source-coordinate disclaimer", () => {
  assert.doesNotMatch(card, /sourceNote|आंतरिक अक्षांश|ऊँचाई प्रकाशित नहीं करता/);
  assert.doesNotMatch(card, /स्रोत: Drik Panchang का/);
  assert.doesNotMatch(card, /Drik मूल स्रोत|planet\.sourceUrl|href=.*sourceUrl/);
});

test("public card does not show additional planetary rows", () => {
  assert.doesNotMatch(card, /name: "मंगल|planet\\.name === "मंगल"/);
  assert.doesNotMatch(card, /name: "सूर्य|name: "चंद्रमा"/);
});

