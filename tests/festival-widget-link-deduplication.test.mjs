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
  assert.match(source, /appendSafeDescription\(description, descriptionHtml, cardLinkUrls\)/);
  assert.match(source, /descriptionHtml \+= .*pitri-tarpan-vidhi/);
  assert.match(source, /descriptionHtml \+= .*shivratri-prahar-pooja-vidhi/);
  assert.match(source, /articleUrl && articleLabel && \(!articleKey \|\| !cardLinkUrls\.has\(articleKey\)\)/);
});

test("10-day widget still renders a metadata article link when it is not in the description", () => {
  assert.match(source, /if \(articleKey\) cardLinkUrls\.add\(articleKey\)/);
  assert.match(source, /link\.href = articleUrl/);
  assert.match(source, /link\.textContent|element\("a", "ohd-fw-link", articleLabel\)/);
});

test("10-day widget treats desktop and mobile variants of the same article as one link", () => {
  assert.ok(source.includes('url.searchParams.delete("m")'));
});
