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

test("Margashirsha Kalashtami is represented by annual Kalabhairavashtami, not a duplicate monthly Kalashtami", () => {
  const data = JSON.parse(readFileSync(new URL("../data/festivals/2026-12.json", import.meta.url), "utf8"));
  const sameDate = data.events.filter(event => event.date === "2026-12-01");
  assert.ok(sameDate.some(event => event.title === "कालभैरवाष्टमी (कालभैरव जयंती)"));
  assert.ok(sameDate.some(event => event.title === "मासिक कृष्ण जन्माष्टमी"));
  assert.ok(!sameDate.some(event => /मासिक कालाष्टमी/.test(event.title)));
  assert.equal(sameDate.filter(event => /कालभैरवाष्टमी|कालभैरव जयंती/.test(event.title)).length, 1);
});

test("annual Janmashtami is not duplicated as monthly Krishna Janmashtami", () => {
  for (const [file, date] of [
    ["2027-08.json", "2027-08-25"],
    ["2028-08.json", "2028-08-13"]
  ]) {
    const data = JSON.parse(readFileSync(new URL("../data/festivals/" + file, import.meta.url), "utf8"));
    const sameTithi = data.events.filter(event => event.date === date);
    assert.ok(sameTithi.some(event => event.title === "मासिक कालाष्टमी"));
    assert.ok(!sameTithi.some(event => /मासिक कृष्ण जन्माष्टमी/.test(event.title)));
  }
});
