import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getFestivalMuhurta } from "../festival-muhurta.js";

test("monthly Krishna Janmashtami uses its own muhurta label", () => {
  const result = getFestivalMuhurta(
    { title: "मासिक कृष्ण जन्माष्टमी", muhurtaRule: "janmashtami-nishita" },
    {}
  );
  assert.equal(result.label, "मासिक कृष्ण जन्माष्टमी — निशीथ पूजा मुहूर्त");
});

test("annual Shri Krishna Janmashtami keeps the annual muhurta label", () => {
  const result = getFestivalMuhurta(
    { title: "श्रीकृष्ण जन्माष्टमी (स्मार्त)", muhurtaRule: "janmashtami-nishita" },
    {}
  );
  assert.equal(result.label, "श्रीकृष्ण जन्माष्टमी — निशीथ पूजा मुहूर्त");
});

test("2026 Kalabhairav Jayanti and monthly Krishna Janmashtami are separate cards", () => {
  const data = JSON.parse(readFileSync(new URL("../data/festivals/2026-12.json", import.meta.url), "utf8"));
  const sameDate = data.events.filter(event => event.date === "2026-12-01");
  assert.ok(sameDate.some(event => event.title === "कालभैरव जयंती"));
  assert.ok(sameDate.some(event => event.title === "मासिक कालाष्टमी / मासिक कृष्ण जन्माष्टमी"));
  assert.ok(sameDate.every(event => !/कालभैरव जयंती.*मासिक कृष्ण जन्माष्टमी|मासिक कृष्ण जन्माष्टमी.*कालभैरव जयंती/.test(event.title)));
});
