import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("Sandhi Puja is restricted to Sharadiya Mahashtami events", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  const muhurta = await read("festival-muhurta.js");
  const sharad2027 = JSON.parse(await read("data/festivals/2027-10.json"));
  const event2027 = sharad2027.events.find(item => item.date === "2027-10-07" && /महाष्टमी/.test(item.title));

  assert.match(muhurta, /export function isSharadiyaMahashtamiEvent/);
  assert.ok(muhurta.includes(String.raw`/शारदीय\s*नवरात्र/`));
  assert.ok(muhurta.includes(String.raw`/आश्विन\s*शुक्ल\s*अष्टमी/`));
  assert.match(widget, /isSharadiyaMahashtamiEvent\(item\)/);
  assert.match(widget, /ruleIds=ruleIds\.filter/);
  assert.match(event2027.description, /शारदीय नवरात्रि/);
  assert.match(muhurta, /tithiIndex === 7 \|\| tithiIndex === 8/);
  assert.doesNotMatch(muhurta, /tithiIndex === 7 \|\| tithiIndex === 22/);
});

test("annual Dwadashi date rows accept standard ISO dates", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  assert.match(widget, /!\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/);
  assert.doesNotMatch(widget, /!\/\^\\\\d\{4\}/);
});
