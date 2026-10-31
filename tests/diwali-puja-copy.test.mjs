import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Diwali card links both the festival article and Mahalakshmi-Kamala upasana", async () => {
  const month = JSON.parse(await readFile(new URL("../data/festivals/2026-11.json", import.meta.url), "utf8"));
  const diwali = month.events.find(event => event.date === "2026-11-08" && /दीपावली/.test(event.title));
  assert.ok(diwali, "Diwali card should exist");
  assert.equal(diwali.articleUrl, "https://ourhindudharm.blogspot.com/2013/11/About-Deepawali.html");
  assert.equal(diwali.secondaryArticleUrl, "https://ourhindudharm.blogspot.com/2022/10/About-Mahalakshmi-Kamla-mahavidya-stotratmak-upasana.html");
  assert.equal(diwali.secondaryArticleLabel, "महालक्ष्मी-कमला की स्तोत्रात्मक उपासना");
  assert.match(diwali.description, /प्रदोष में वृषभ स्थिर लग्न और अमावस्या/);
  assert.doesNotMatch(diwali.description, /राहुकाल/);
});
