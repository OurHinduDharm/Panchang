import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
const widget = await readFile(new URL("../monthly-vrat-parv-widget.js", import.meta.url), "utf8");

test("monthly festival page exposes 2030 and keeps navigation within 2026–2030", () => {
  assert.match(html, /<option value="2030">2030<\/option>/);
  assert.match(html, /numeric<2026\|\|numeric>2030/);
  assert.match(html, /y<2026\|\|y>2030/);
  assert.match(html, /atEnd=year===2030&&month===12/);
});

test("monthly widget year option and month navigation include 2030", () => {
  assert.match(widget, /numeric<2026\|\|numeric>2030/);
  assert.match(widget, /atEnd=year===2030&&month===12/);
  assert.match(widget, /y<2026\|\|y>2030/);
});

test("monthly festival page deduplicates links across description and metadata", () => {
  assert.match(html, /function linkKey\(value\)/);
  assert.match(html, /url\.searchParams\.delete\("m"\)/);
  assert.match(html, /function makeLink\(url,label,seenUrls\)/);
  assert.match(html, /function appendSafeDescriptionNode\(parent,node,seenUrls\)/);
  assert.match(html, /var cardLinkUrls=new Set\(\)/);
  assert.match(html, /renderDescription\(desc,description,cardLinkUrls\)/);
  assert.match(html, /makeLink\(item\.articleUrl,item\.articleLabel,cardLinkUrls\)/);
  assert.match(html, /makeLink\(eclipsePageUrl,"सूतक, मंत्र-जप एवं पुरश्चरण की जानकारी",cardLinkUrls\)/);
});

test("monthly widget canonicalizes mobile query variants before link deduplication", () => {
  assert.match(widget, /parsed\.searchParams\.delete\("m"\)/);
});
