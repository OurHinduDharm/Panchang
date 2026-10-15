const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../festival-muhurta-widget.js"), "utf8");
const bloggerSource = fs.readFileSync(require.resolve("../data/festivalData-source.txt"), "utf8");

test("Blogger source snapshot limits upcoming festivals to a rolling 14-day horizon", () => {
  assert.match(bloggerSource, /var DAYS_AHEAD = 14;/);
  assert.match(bloggerSource, /var isWithinDisplayPeriod =\s*today\.getTime\(\) >= startDate\.getTime\(\) &&\s*today\.getTime\(\) <= lastVisibleDate\.getTime\(\);/);
});

test("Blogger source snapshot loads the festival muhurta widget after rendering cards", () => {
  assert.match(bloggerSource, /id="dynamicFestivalList"/);
  assert.match(bloggerSource, /raw\.githubusercontent\.com\/OurHinduDharm\/Panchang\/data\/festival-json-foundation\/festival-muhurta-widget\.js/);
});

function runWidget(savedLocation) {
  const panelChildren = [];
  const title = { textContent: "शारदीय नवरात्र प्रारम्भ" };
  const description = {
    querySelector(selector) {
      return selector === ".ohd-festival-muhurta"
        ? panelChildren[0] || null
        : null;
    },
    appendChild(node) { panelChildren.push(node); }
  };
  const card = {
    dataset: {},
    querySelector(selector) {
      if (selector === ".festival-title") return title;
      if (selector === ".festival-description") return description;
      return null;
    }
  };
  const list = { querySelectorAll: () => [card] };
  const context = {
    document: {
      getElementById: (id) => id === "dynamicFestivalList" ? list : null,
      createElement: () => ({
        className: "",
        style: { cssText: "" },
        setAttribute() {},
        textContent: ""
      })
    },
    localStorage: {
      getItem: () => savedLocation == null ? null : JSON.stringify(savedLocation)
    },
    Array,
    String,
    Number,
    JSON
  };
  vm.runInNewContext(source, context);
  return { panelChildren, card };
}

test("festival widget asks visitors to select a city when no saved location exists", async () => {
  const { panelChildren } = runWidget(null);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(panelChildren.length, 1);
  assert.match(panelChildren[0].textContent, /पहले पंचांग पृष्ठ पर अपना शहर चुनें/);
  assert.match(panelChildren[0].textContent, /समय नहीं दिखाया जाएगा/);
});

test("festival widget uses the saved Panchang location and does not publish an unverified time", async () => {
  const { panelChildren, card } = runWidget({
    name: "पिथौरागढ़, उत्तराखंड, भारत",
    lat: 29.5828,
    lon: 80.2182,
    elevation: 1650
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(panelChildren.length, 1);
  assert.match(panelChildren[0].textContent, /पिथौरागढ़/);
  assert.match(panelChildren[0].textContent, /स्वतंत्र सत्यापन पूरा होने तक/);
  assert.equal(card.dataset.ohdMuhurtaEngineVersion, "1.0.0");
});
