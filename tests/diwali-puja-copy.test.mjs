import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("All existing Diwali cards link the festival article and Mahalakshmi-Kamala upasana", async () => {
  const records = [
    ["2026-11","2026-11-08"],
    ["2027-10","2027-10-29"],
    ["2028-10","2028-10-17"],
    ["2029-11","2029-11-05"]
  ];
  for (const [monthFile, date] of records) {
    const month = JSON.parse(await readFile(new URL("../data/festivals/" + monthFile + ".json", import.meta.url), "utf8"));
    const diwali = month.events.find(event => event.date === date && /दीपावली/.test(event.title));
    assert.ok(diwali, "Diwali card should exist for " + date);
    assert.equal(diwali.articleUrl, "https://ourhindudharm.blogspot.com/2013/11/About-Deepawali.html");
    assert.equal(diwali.secondaryArticleUrl, "https://ourhindudharm.blogspot.com/2022/10/About-Mahalakshmi-Kamla-mahavidya-stotratmak-upasana.html");
    assert.equal(diwali.articleLabel, "दीपावली का महत्व");
    assert.equal(diwali.secondaryArticleLabel, "महालक्ष्मी-कमला की स्तोत्रात्मक उपासना");
    assert.match(diwali.description, /दीपावली का महत्व/);
    assert.match(diwali.description, /महालक्ष्मी-कमला की स्तोत्रात्मक उपासना/);
  }
  const current = JSON.parse(await readFile(new URL("../data/festivals/2026-11.json", import.meta.url), "utf8"));
  const diwali = current.events.find(event => event.date === "2026-11-08" && /दीपावली/.test(event.title));
  assert.match(diwali.description, /प्रदोष में वृषभ स्थिर लग्न और अमावस्या/);
  assert.doesNotMatch(diwali.description, /राहुकाल/);
});
