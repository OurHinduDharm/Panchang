import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../festival-widget.js", import.meta.url), "utf8");

test("10-day festival widget deduplicates inline and metadata article links", () => {
  assert.match(source, /function linkKey\(value\)/);
  assert.match(source, /url\.hash = ""/);
  assert.match(source, /function appendSafeDescription\(container, html, seenUrls\)/);
  assert.match(source, /if \(seenUrls && key && seenUrls\.has\(key\)\) return/);
  assert.match(source, /const cardLinkUrls = new Set\(\)/);
  assert.match(source, /appendSafeDescription\(description, item\.description, cardLinkUrls\)/);
  assert.match(source, /articleUrl && articleLabel && \(!articleKey \|\| !cardLinkUrls\.has\(articleKey\)\)/);
});

test("10-day widget still renders a metadata article link when it is not in the description", () => {
  assert.match(source, /if \(articleKey\) cardLinkUrls\.add\(articleKey\)/);
  assert.match(source, /link\.href = articleUrl/);
  assert.match(source, /link\.textContent|element\("a", "ohd-fw-link", articleLabel\)/);
});


test("2026 Chaturmas follows Smarta Devutthana Ekadashi and Dwadashi dates", async () => {
  const config = JSON.parse(await readFile(new URL("../data/chaturmas/2026.json", import.meta.url), "utf8"));
  assert.equal(config.endDate, "2026-11-20");
  assert.equal(config.phases[3].endDate, "2026-11-20");
  assert.equal(config.phases[3].endTithi, "कार्तिक शुक्ल एकादशी");
  assert.equal(config.completionDate, "2026-11-21");
  assert.equal(config.cardVisibleThroughDate, "2026-11-22");
  assert.match(config.completionDetail, /कार्तिक शुक्ल द्वादशी \(21 नवंबर\)/);
});

test("Chaturmas card uses Smarta Devutthana Ekadashi, not Gauna/Vaishnava date", () => {
  assert.match(source, /!\/वैष्णव\|गौण\/i\.test\(item\.title \|\| ""\)/);
  assert.match(source, /देवोत्थानी एकादशी \(स्मार्त\)/);
  assert.match(source, /cardVisibleThroughDate/);
});
