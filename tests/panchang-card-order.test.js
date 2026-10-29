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
    },
    insertBefore(card, reference) {
      const currentIndex = this.children.indexOf(card);
      if (currentIndex !== -1) this.children.splice(currentIndex, 1);
      const referenceIndex = reference ? this.children.indexOf(reference) : -1;
      if (referenceIndex === -1) this.children.push(card);
      else this.children.splice(referenceIndex, 0, card);
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


test("Hora and classical-yoga disclosure states survive card refreshes", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const start = source.indexOf("function capturePanchangDisclosureState() {");
  const end = source.indexOf("function updatePlanetRiseSet()", start);
  assert.notEqual(start, -1, "disclosure-state helpers must exist");
  assert.notEqual(end, -1, "disclosure-state helpers must end before the main update");

  const makeCard = states => ({
    details: states.map(open => ({ open: Boolean(open) })),
    querySelectorAll(selector) {
      assert.equal(selector, "details");
      return this.details;
    }
  });
  const cards = new Map([
    ["horaCard", makeCard([true, false])],
    ["classicalYogasCard", makeCard([true])]
  ]);
  const sandbox = {
    document: {
      getElementById(id) {
        return cards.get(id) || null;
      }
    }
  };

  vm.runInNewContext(source.slice(start, end), sandbox);
  const state = sandbox.capturePanchangDisclosureState();

  // Simulate the refresh replacing both cards with all details closed.
  cards.set("horaCard", makeCard([false, false]));
  cards.set("classicalYogasCard", makeCard([false]));
  sandbox.restorePanchangDisclosureState(state);

  assert.deepEqual(cards.get("horaCard").details.map(item => item.open), [true, false]);
  assert.deepEqual(cards.get("classicalYogasCard").details.map(item => item.open), [true]);
});


test("Planetary boundary-bracket cache reuses only dates strictly inside a valid pair", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const start = source.indexOf("const PLANET_ASTA_THRESHOLDS = {");
  const end = source.indexOf("function createPlanetCard(", start);
  assert.notEqual(start, -1);
  assert.ok(end > start);

  const selectedDate = "2026-01-15";
  const anchor = new Date(selectedDate + "T12:00:00+05:30").getTime();
  let elongationCalls = 0;
  const sandbox = {
    Date, Map, Number, String, Math, console,
    PLANETS: [{ body: "Venus", name: "शुक्र" }],
    getLocalNoon(date) {
      return new Date(date + "T12:00:00+05:30");
    },
    addDays(date, days) {
      const value = new Date(date + "T12:00:00+05:30");
      value.setUTCDate(value.getUTCDate() + days);
      return value.toISOString().slice(0, 10);
    },
    Elongation(body, instant) {
      elongationCalls++;
      const offset = (instant.getTime() - anchor) / 86400000;
      return {
        ecliptic_separation: 10 + 12 * Math.sin((2 * Math.PI * offset / 70) + 0.5)
      };
    },
    formatEventDateTime(instant) {
      return instant.toISOString();
    }
  };

  vm.runInNewContext(source.slice(start, end), sandbox);
  const first = sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, selectedDate);
  assert.ok(first.asta && first.udaya, "both boundary estimates should be found");
  const callsAfterFirst = elongationCalls;

  const adjacentDate = sandbox.addDays(selectedDate, 1);
  const adjacent = sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, adjacentDate);
  assert.deepEqual(adjacent, first, "an interior date should reuse the same enclosing boundary pair");
  assert.equal(elongationCalls, callsAfterFirst,
    "a date strictly inside the cached boundary interval must not recalculate elongation");

  const outsideDate = sandbox.addDays(selectedDate, 45);
  sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, outsideDate);
  assert.ok(elongationCalls > callsAfterFirst,
    "a date outside the cached interval must run the normal calculation path");
});


test("Shared Asta/Udaya scan preserves both boundary estimates and interval-cache reuse", () => {
  const source = readFileSync(new URL("../extra-panchang.js", import.meta.url), "utf8");
  const start = source.indexOf("const PLANET_ASTA_THRESHOLDS = {");
  const end = source.indexOf("function createPlanetCard(", start);
  assert.notEqual(start, -1);
  assert.ok(end > start);

  const eventBuilderStart = source.indexOf("function getPlanetEvent(", start);
  const eventBuilderEnd = source.indexOf("/* =========================================", eventBuilderStart);
  const eventBuilder = source.slice(eventBuilderStart, eventBuilderEnd);
  assert.equal((eventBuilder.match(/findNearestAngularBoundaries\\(/g) || []).length, 1,
    "event builder must request both boundaries from one shared scan");
  assert.ok(!eventBuilder.includes("findNearestAngularBoundary("),
    "the old two-search event builder must not remain");

  const selectedDate = "2026-01-15";
  const anchor = new Date(selectedDate + "T12:00:00+05:30").getTime();
  let elongationCalls = 0;
  const sandbox = {
    Date, Map, Number, String, Math, console,
    PLANETS: [{ body: "Venus", name: "शुक्र" }],
    getLocalNoon(date) {
      return new Date(date + "T12:00:00+05:30");
    },
    addDays(date, days) {
      const value = new Date(date + "T12:00:00+05:30");
      value.setUTCDate(value.getUTCDate() + days);
      return value.toISOString().slice(0, 10);
    },
    Elongation(body, instant) {
      elongationCalls++;
      const offset = (instant.getTime() - anchor) / 86400000;
      return {
        ecliptic_separation: offset <= 0
          ? 10.5 + offset
          : 12 - offset
      };
    },
    formatEventDateTime(instant) {
      return instant.toISOString();
    }
  };

  vm.runInNewContext(source.slice(start, end), sandbox);
  const first = sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, selectedDate);
  assert.ok(first.asta, "Asta threshold crossing should be found");
  assert.ok(first.udaya, "Udaya threshold crossing should be found");
  assert.ok(Math.abs(new Date(first.asta).getTime() - (anchor + 2 * 86400000)) < 120000,
    "Asta refinement should remain at the future downward crossing");
  assert.ok(Math.abs(new Date(first.udaya).getTime() - (anchor - 0.5 * 86400000)) < 120000,
    "Udaya refinement should remain at the nearby upward crossing");

  const callsAfterFirst = elongationCalls;
  const adjacentDate = sandbox.addDays(selectedDate, 1);
  const adjacent = sandbox.getPlanetEvent({ body: "Venus", name: "शुक्र" }, adjacentDate);
  assert.deepEqual(adjacent, first, "the strict interior date should reuse the cached pair");
  assert.equal(elongationCalls, callsAfterFirst,
    "the shared scan must preserve the existing interval-cache behavior");
});
