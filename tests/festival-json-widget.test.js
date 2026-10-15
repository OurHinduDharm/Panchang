const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../data/festivals.json");
const widget = require("../festival-json-widget.js");
const fs = require("node:fs");

test("draft JSON renderer is configured for a rolling 14-day window", () => {
  const source = fs.readFileSync(require.resolve("../festival-json-widget.js"), "utf8");
  assert.match(source, /var DAYS_AHEAD = 14/);
  assert.match(source, /startDiff >= 0 && startDiff < DAYS_AHEAD/);
  assert.match(source, /ongoing \|\| \(startDiff >= 0 && startDiff < DAYS_AHEAD\)/);
});

test("14-day selection includes today and day 13, but excludes day 14", () => {
  const base = new Date(2026, 9, 15, 12);
  const sample = {
    festivals: [
      { id: "today", name: "आज", date: { start: "2026-10-15" } },
      { id: "day13", name: "तेरहवाँ दिन", date: { start: "2026-10-28" } },
      { id: "day14", name: "चौदह दिन बाद", date: { start: "2026-10-29" } }
    ]
  };
  assert.deepEqual(widget.selectUpcoming(sample, base).map((item) => item.id), ["today", "day13"]);
});

test("ongoing multi-day events remain visible, but expired daily observances do not", () => {
  const sample = {
    festivals: [
      { id: "ongoing", name: "चल रहा पर्व", date: { start: "2026-10-11", end: "2026-10-20" } },
      { id: "old-day", name: "बीता दैनिक पर्व", date: { start: "2026-10-14" } },
      { id: "today", name: "आज", date: { start: "2026-10-15" } }
    ]
  };
  assert.deepEqual(widget.selectUpcoming(sample, new Date(2026, 9, 15, 12)).map((item) => item.id), ["ongoing", "today"]);
});

test("invalid calendar dates and reversed ranges are excluded", () => {
  assert.equal(widget.validDate("2026-02-31"), null);
  assert.equal(widget.validDate("2026-10-15").getDate(), 15);
  const sample = {
    festivals: [
      { id: "invalid", date: { start: "2026-02-31" } },
      { id: "reversed", date: { start: "2026-10-18", end: "2026-10-17" } },
      { id: "invalid-end", date: { start: "2026-10-16", end: "2026-02-31" } },
      { id: "valid", name: "सही", date: { start: "2026-10-16" } }
    ]
  };
  assert.deepEqual(widget.selectUpcoming(sample, new Date(2026, 9, 15, 12)).map((item) => item.id), ["valid"]);
});

test("related links are restricted to HTTP(S) and missing URLs render as text", () => {
  assert.equal(widget.safeHttpUrl("javascript:alert(1)"), "");
  assert.equal(widget.safeHttpUrl("data:text/html,unsafe"), "");
  assert.match(widget.safeHttpUrl("https://example.com/path"), /^https:\/\//);
  const source = fs.readFileSync(require.resolve("../festival-json-widget.js"), "utf8");
  assert.match(source, /entry\.title/);
  assert.match(source, /Keep the existing legacy-rendered list visible if JSON loading fails/);
  assert.match(source, /new DOMParser\(\)\.parseFromString/);
  assert.match(source, /Preserve existing legacy descriptions and links without injecting raw HTML/);
  assert.match(source, /आज का पर्व/);
  assert.match(source, /दिन शेष/);
  assert.match(source, /festival-period/);
});

test("Govardhan and Bhai Dooj article titles have no fabricated URLs", () => {
  for (const id of ["festival-022", "festival-023"]) {
    const item = data.festivals.find((entry) => entry.id === id);
    assert.ok(item.relatedArticles.some((entry) => entry.title && !entry.url));
  }
});

test("Navaratri daily observances do not remain visible through the whole parent festival", () => {
  const visible = widget.selectUpcoming(data, new Date(2026, 9, 15, 12)).map((item) => item.id);
  assert.ok(visible.includes("festival-003"), "the parent Navaratri event should remain visible");
  assert.ok(visible.includes("festival-007"), "today's Navaratri observance should be visible");
  for (const id of ["festival-004", "festival-005", "festival-006"]) {
    assert.equal(visible.includes(id), false, id + " is an expired daily observance");
  }
});

function makeFakeDom() {
  class FakeNode {
    constructor(tagName, text) {
      this.tagName = tagName ? tagName.toUpperCase() : null;
      this.nodeType = tagName ? 1 : 3;
      this.children = [];
      this.attributes = {};
      this.className = "";
      this.href = "";
      this.target = "";
      this.rel = "";
      this.value = text == null ? "" : String(text);
    }
    get textContent() {
      return this.value + this.children.map((child) => child.textContent).join("");
    }
    set textContent(value) {
      this.value = String(value);
      this.children = [];
    }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(child) { this.children = child ? [child] : []; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name] ?? null; }
  }
  const document = {
    createElement: (tag) => new FakeNode(tag),
    createDocumentFragment: () => new FakeNode("fragment"),
    createTextNode: (text) => new FakeNode(null, text)
  };
  function findAll(node, predicate, output = []) {
    if (predicate(node)) output.push(node);
    for (const child of node.children || []) findAll(child, predicate, output);
    return output;
  }
  return { document, FakeNode, findAll, container: new FakeNode("div") };
}

test("render preserves today/tomorrow/ongoing status and multi-day period labels", () => {
  const fake = makeFakeDom();
  const previousDocument = global.document;
  global.document = fake.document;
  try {
    widget.render({
      festivals: [
        { id: "ongoing", name: "नवरात्र", date: { start: "2026-10-11", end: "2026-10-20" }, sourceText: { statusText: "नवरात्रि चल रही है" } },
        { id: "today", name: "आज", date: { start: "2026-10-15" } },
        { id: "tomorrow", name: "कल", date: { start: "2026-10-16" } },
        { id: "period", name: "अवधि", date: { start: "2026-10-17", end: "2026-10-18" } }
      ]
    }, new Date(2026, 9, 15, 12), fake.container);
    const statuses = fake.findAll(fake.container, (node) => node.className === "festival-status").map((node) => node.textContent);
    const periods = fake.findAll(fake.container, (node) => node.className === "festival-period").map((node) => node.textContent);
    assert.ok(statuses.includes("नवरात्रि चल रही है"));
    assert.ok(statuses.includes("आज का पर्व"));
    assert.ok(statuses.includes("कल"));
    assert.ok(periods.some((value) => value.startsWith("अवधि:")));
    assert.equal(fake.container.attributes["data-source"], "festivals-json");
    assert.equal(fake.container.attributes["data-window-days"], "14");
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});

test("article-topic placeholders render as plain text, never as empty or fake links", () => {
  const fake = makeFakeDom();
  const previousDocument = global.document;
  global.document = fake.document;
  try {
    widget.render({
      festivals: [
        { id: "govardhan", name: "गोवर्धन पूजा", date: { start: "2026-10-15" }, relatedArticles: [{ title: "अन्नकूट / गोवर्धन पूजा — परिचय एवं पूजा-विधि" }] },
        { id: "bhai-dooj", name: "भाई दूज", date: { start: "2026-10-15" }, relatedArticles: [{ title: "भ्रातृ द्वितीया / भाई दूज — व्रत एवं पूजा-विधि" }] }
      ]
    }, new Date(2026, 9, 15, 12), fake.container);
    const links = fake.findAll(fake.container, (node) => node.tagName === "A");
    const textNodes = fake.findAll(fake.container, (node) => node.nodeType === 3).map((node) => node.textContent);
    assert.equal(links.length, 0);
    assert.ok(textNodes.some((value) => value.includes("अन्नकूट / गोवर्धन पूजा")));
    assert.ok(textNodes.some((value) => value.includes("भ्रातृ द्वितीया / भाई दूज")));
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});
