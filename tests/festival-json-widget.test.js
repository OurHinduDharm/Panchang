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

test("PR preview helper offers the isolated festival widget page when present", () => {
  const helper = fs.readFileSync(require.resolve("../test-pr.html"), "utf8");
  assert.match(helper, /festival-preview\.html/);
  assert.match(helper, /त्योहार Widget Preview खोलें/);
});

test("all nine Navratri sadhana links and Dashami remain visible throughout an active main/Gupt Navratri", () => {
  const fake = makeFakeDom();
  const previousDocument = global.document;
  global.document = fake.document;
  try {
    const data = {
      navratriSadhana: {
        title: "नवरात्रि साधना — प्रतिपदा से नवमी तक",
        description: "छूटी हुई साधना का लेख भी खोलें।",
        activePeriodIds: ["ashwin", "chaitra", "magha-gupt", "ashadha-gupt"],
        days: Array.from({ length: 9 }, (_, i) => ({
          day: i + 1, tithi: ["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी"][i],
          name: "साधना " + (i + 1), url: "https://example.org/day-" + (i + 1)
        })).concat([{ day: 10, tithi: "दशमी", name: "कलश आदि का विसर्जन", url: "https://example.org/dashami" }]),
      },
      festivals: [
        { id: "ashwin", name: "शारदीय नवरात्र", date: { start: "2026-10-11", end: "2026-10-20" } },
        { id: "chaitra", date: { start: "2026-03-19", end: "2026-03-27" } },
        { id: "magha-gupt", date: { start: "2026-01-19", end: "2026-01-27" } },
        { id: "ashadha-gupt", date: { start: "2026-07-15", end: "2026-07-23" } }
      ]
    };
    widget.render(data, new Date(2026, 9, 18, 12), fake.container);
    const section = fake.findAll(fake.container, node => node.className === "navratri-sadhana");
    assert.equal(section.length, 1);
    const links = fake.findAll(section[0], node => node.tagName === "A");
    assert.equal(links.length, 10);
    assert.ok(links.some(a => a.textContent.includes("प्रतिपदा")));
    assert.ok(links.some(a => a.textContent.includes("नवमी")));
    assert.ok(links.some(a => a.textContent.includes("दशमी")));
    assert.equal(links[0].rel, "noopener noreferrer");
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});

test("Navratri sadhana list is hidden outside all four configured Navratri periods", () => {
  const fake = makeFakeDom();
  const previousDocument = global.document;
  global.document = fake.document;
  try {
    widget.render({
      navratriSadhana: { title: "नवरात्रि साधना", activePeriodIds: ["ashwin"], days: [{ day: 1, tithi: "प्रतिपदा", name: "शैलपुत्री", url: "https://example.org" }] },
      festivals: [{ id: "ashwin", date: { start: "2026-10-11", end: "2026-10-20" } }]
    }, new Date(2026, 9, 21, 12), fake.container);
    assert.equal(fake.findAll(fake.container, node => node.className === "navratri-sadhana").length, 0);
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});


test("Pitri Paksha links stay together from Pratipada through Pitri Visarjani Amavasya", () => {
  const fake = makeFakeDom();
  const previousDocument = global.document;
  global.document = fake.document;
  try {
    const sample = {
      pitriPakshaArticles: {
        title: "पितृपक्ष के लिए उपयोगी लेख",
        description: "प्रतिपदा से अमावस्या तक।",
        activePeriodIds: ["pitri-start", "pitri-end"],
        articles: [
          { title: "महालय श्राद्धों का महत्व", url: "https://example.org/mahalaya" },
          { title: "तर्पण विधि", url: "https://example.org/tarpan" }
        ]
      },
      festivals: [
        { id: "pitri-start", name: "पितृपक्ष प्रारंभ", date: { start: "2026-09-27", end: "2026-10-10" } },
        { id: "pitri-end", name: "पितृ विसर्जनी अमावस्या", date: { start: "2026-10-10" } }
      ]
    };
    for (const day of [27, 30]) {
      const container = new fake.FakeNode("div");
      widget.render(sample, new Date(2026, 8, day, 12), container);
      const section = fake.findAll(container, node => node.className === "pitri-paksha-articles");
      assert.equal(section.length, 1, "Pitri Paksha section should show on September " + day);
      const links = fake.findAll(section[0], node => node.tagName === "A");
      assert.equal(links.length, 2);
      assert.ok(links.some(a => a.textContent === "महालय श्राद्धों का महत्व"));
      assert.ok(links.some(a => a.textContent === "तर्पण विधि"));
      assert.ok(links.every(a => a.rel === "noopener noreferrer"));
    }
    const amavasyaContainer = new fake.FakeNode("div");
    widget.render(sample, new Date(2026, 9, 10, 12), amavasyaContainer);
    assert.equal(fake.findAll(amavasyaContainer, node => node.className === "pitri-paksha-articles").length, 1,
      "the section must include Pitri Visarjani Amavasya itself");
    const afterContainer = new fake.FakeNode("div");
    widget.render(sample, new Date(2026, 9, 11, 12), afterContainer);
    assert.equal(fake.findAll(afterContainer, node => node.className === "pitri-paksha-articles").length, 0,
      "the section must hide after the configured end date");
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});

test("Pitri Paksha article configuration uses the existing verified OurHinduDharm article URLs", () => {
  assert.deepEqual(data.pitriPakshaArticles.articles.map(item => item.title), [
    "महालय श्राद्धों का महत्व", "तर्पण विधि"
  ]);
  assert.equal(data.pitriPakshaArticles.articles[0].url,
    "http://ourhindudharm.blogspot.com/2013/09/About-Shraaddhs-and-Pitripaksha-on-Mahalaya.html");
  assert.equal(data.pitriPakshaArticles.articles[1].url,
    "https://ourhindudharm.blogspot.com/p/pitri-tarpan-vidhi.html");
});
