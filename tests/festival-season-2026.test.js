const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../data/festivals.json");

const byId = Object.fromEntries(data.festivals.map((item) => [item.id, item]));

test("festival data retains all migrated legacy entries", () => {
  assert.equal(data.festivals.length, 122);
  assert.equal(new Set(data.festivals.map((item) => item.id)).size, 122);
});

test("Navaratri 2026 draft dates are explicit and internally consistent", () => {
  assert.equal(byId["festival-003"].date.start, "2026-10-11");
  assert.equal(byId["festival-009"].date.start, "2026-10-17");
  assert.equal(byId["festival-009"].name, "शारदीय नवरात्र सप्तमी - कालरात्रि");
  assert.equal(byId["festival-010"].date.start, "2026-10-19");
  assert.equal(byId["festival-011"].date.start, "2026-10-20");
  assert.equal(byId["festival-012"].date.start, "2026-10-20");
});

test("Navaratri source description is not mistaken for current muhurta", () => {
  assert.match(byId["festival-010"].description, /स्थानीय तिथि-सन्धि/);
  assert.match(byId["festival-010"].sourceText.description, /सन्धि पूजा प्रारम्भ १०:२७/);
});

test("Sharad Purnima and Karwa Chauth retain provisional 2026 observance dates", () => {
  assert.equal(byId["festival-013"].date.start, "2026-10-25");
  assert.equal(byId["festival-015"].date.start, "2026-10-29");
});

test("Diwali sequence uses 2026 dates and allows Naraka Chaturdashi/Diwali overlap", () => {
  assert.equal(byId["festival-018"].date.start, "2026-11-06");
  assert.equal(byId["festival-020"].date.start, "2026-11-08");
  assert.equal(byId["festival-021"].date.start, "2026-11-08");
  assert.equal(byId["festival-022"].date.start, "2026-11-10");
  assert.equal(byId["festival-023"].date.start, "2026-11-11");
});

test("major festival records keep structured OurHinduDharm related-article links", () => {
  const required = {
    "festival-003": ["शारदीय नवरात्र की जानकारी", "घटस्थापना की संपूर्ण विधि"],
    "festival-013": ["कोजागरी / शरद पूर्णिमा व्रत"],
    "festival-016": ["रमा एकादशी व्रत"],
    "festival-018": ["धनतेरस और धन्वन्तरि जयंती"],
    "festival-020": ["नरक चतुर्दशी"],
    "festival-021": ["दीपावली", "श्री महालक्ष्मी पूजन विधि"]
  };
  for (const [id, titles] of Object.entries(required)) {
    const links = byId[id].relatedArticles || [];
    for (const title of titles) {
      assert.ok(links.some((link) => link.title === title && (link.url.startsWith("https://") || link.url.startsWith("http://"))), id + ": " + title);
    }
    assert.ok(links.every((link) => link.url.includes("ourhindudharm.blogspot.com")), id + ": expected owned blog links");
  }
  assert.deepEqual(byId["festival-022"].relatedArticles || [], []);
  assert.deepEqual(byId["festival-023"].relatedArticles || [], []);
});

test("legacy Dhanteras and Diwali clock times are not presented as 2026 muhurta", () => {
  assert.match(byId["festival-018"].description, /स्थानीय पंचांग की गणना से सत्यापित/);
  assert.match(byId["festival-021"].description, /2026 की स्थानीय गणना से निर्धारित/);
  assert.match(byId["festival-018"].sourceText.description, /शाम 5.58 - 7.43PM/);
});

test("date candidates remain unverified until local rule validation is complete", () => {
  for (const id of [
    "festival-009", "festival-010", "festival-011", "festival-012",
    "festival-013", "festival-018", "festival-020", "festival-021",
    "festival-022", "festival-023"
  ]) {
    assert.equal(byId[id].verificationStatus, "needs-review", id);
  }
});

test("Govardhan Puja date conflict stays explicitly unresolved", () => {
  const govardhan = byId["festival-022"];
  assert.equal(govardhan.verificationStatus, "needs-review");
  assert.match(govardhan.date.calculationNotes, /स्थानीय प्रतिपदा-व्याप्ति की पुष्टि शेष/);
  assert.match(govardhan.date.rule, /स्थानीय परंपरा से निर्णय करें/);
});

test("festival muhurta plans are dynamic and old Ghatasthapana clock times are not displayed", () => {
  assert.equal(byId["festival-003"].muhurtaPlan.type, "ghatasthapana");
  assert.match(byId["festival-003"].description, /स्थानीय सूर्योदय/);
  assert.doesNotMatch(byId["festival-003"].description, /06:19 ए एम से 10:12 ए एम/);
  assert.equal(byId["festival-013"].muhurtaPlan.type, "sharad-purnima-kheer-moonlight");
  assert.equal(byId["festival-016"].muhurtaPlan.type, "ekadashi-parana");
  assert.equal(byId["festival-018"].muhurtaPlan.type, "dhanteras-puja");
  assert.equal(byId["festival-021"].muhurtaPlan.type, "diwali-lakshmi-puja");
  for (const id of ["festival-003", "festival-013", "festival-016", "festival-018", "festival-021"]) {
    assert.equal(byId[id].muhurtaPlan.status, "needs-calculation", id);
  }
});
