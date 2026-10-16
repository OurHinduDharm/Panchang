import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

test("Panchang cards are normalized into the intended stable order", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const start = source.indexOf("function getPanchangResultsGrid() {");
  const end = source.indexOf("/* =========================================\n   Main update", start);

  assert.notEqual(start, -1, "results-grid helper must exist");
  assert.notEqual(end, -1, "ordering helpers must end before the main update section");

  const cards = [
    { id: "horaCard", textContent: "🕐 होरा" },
    { id: "samvat", textContent: "विक्रम संवत्" },
    { id: "location", textContent: "📍 स्थान: Pithoragarh" },
    { id: "bhadra", textContent: "🔴 भद्रा (विष्टि करण)" },
    { id: "moonset", textContent: "🌙 चंद्रास्त" },
    { id: "classicalYogasCard", textContent: "🌟 विशेष शुभ योग" },
    { id: "brahma", textContent: "🌅 ब्रह्म मुहूर्त" },
    { id: "planetRiseSetCard", textContent: "🌌 ग्रह उदय-अस्त" },
    { id: "tithi", textContent: "तिथि" },
    { id: "yatra", textContent: "🧭 यात्रा शूल विचार" },
    { id: "sankalp", textContent: "🕉️ संकल्प" },
    { id: "sunrise", textContent: "🌅 सूर्योदय" },
    { id: "choghadiya", textContent: "🕐 दिन के चौघड़िया" },
    { id: "prahar", textContent: "⏳ चयनित तिथि के प्रहर" },
    { id: "shubhAshubh", textContent: "🕉️ शुभ-अशुभ समय" }
  ];

  const grid = {
    children: [...cards],
    appendChild(card) {
      const currentIndex = this.children.indexOf(card);
      if (currentIndex !== -1) this.children.splice(currentIndex, 1);
      this.children.push(card);
      return card;
    }
  };

  const sandbox = {
    document: {
      querySelector(selector) {
        assert.equal(selector, "#result > .grid");
        return grid;
      }
    }
  };

  vm.runInNewContext(source.slice(start, end), sandbox);
  sandbox.normalizePanchangCardOrder();

  assert.deepEqual(
    grid.children.map(card => card.id),
    [
      "location",
      "moonset",
      "sunrise",
      "samvat",
      "tithi",
      "classicalYogasCard",
      "shubhAshubh",
      "brahma",
      "yatra",
      "choghadiya",
      "horaCard",
      "prahar",
      "bhadra",
      "sankalp",
      "planetRiseSetCard"
    ]
  );
});

test("Extra Panchang placement helpers target the shared results grid", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const start = source.indexOf("function getPanchangResultsGrid() {");
  const end = source.indexOf("/* =========================================\n   Main update", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const grid = {
    children: [],
    appendChild(card) {
      this.children.push(card);
      return card;
    }
  };
  const sandbox = {
    document: {
      querySelector(selector) {
        assert.equal(selector, "#result > .grid");
        return grid;
      }
    }
  };

  vm.runInNewContext(source.slice(start, end), sandbox);
  const planet = { id: "planetRiseSetCard", textContent: "🌌 ग्रह उदय-अस्त" };
  const hora = { id: "horaCard", textContent: "🕐 होरा" };
  const yoga = { id: "classicalYogasCard", textContent: "🌟 विशेष शुभ योग" };

  sandbox.placePlanetCard(planet);
  sandbox.placeHoraCard(hora);
  sandbox.placeClassicalYogaCard(yoga);

  assert.deepEqual(grid.children.map(card => card.id), [
    "planetRiseSetCard",
    "horaCard",
    "classicalYogasCard"
  ]);
});


test("Planetary Asta/Udaya card labels angular estimates and keeps classical status separate", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const start = source.indexOf("function createPlanetCard(");
  const end = source.indexOf("\nfunction createHoraCard(", start);
  assert.notEqual(start, -1, "planet card renderer must exist");
  assert.notEqual(end, -1, "planet card renderer must end before Hora card");

  const cardSource = source.slice(start, end);
  assert.ok(cardSource.includes("आधुनिक सूर्य–ग्रह कोणीय दूरी की प्रारंभिक, दिन-स्तरीय गणना"));
  assert.ok(cardSource.includes("सूर्यसिद्धान्त अध्याय ९ की लम्बान्तर-आसु (K/C) गणना"));
  assert.ok(cardSource.includes("कोणीय अनुमानित अस्त"));
  assert.ok(cardSource.includes("कोणीय अनुमानित उदय"));
  assert.ok(cardSource.includes("शास्त्रीय K/C गणना — सत्यापनाधीन"));
  assert.ok(!cardSource.includes("!planet.verificationPending && planet.asta"));
  assert.ok(!cardSource.includes("!planet.verificationPending && planet.udaya"));
});
