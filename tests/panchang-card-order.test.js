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
