// Source-clause guardrails for Ekadashi research.
// Test-only: does not calculate dates, sunrise, vrata selection, or parana clock times.
// Primary basis: owner-supplied Dharmasindhu p. 17 transcription and repository collation.
// Run: node --test tests/ekadashi-source-clause-guardrails.test.js

const test = require("node:test");
const assert = require("node:assert/strict");

const SOURCE_IDS = Object.freeze([
  "PAR-HV-01",
  "PAR-TR-01",
  "PAR-MID-BAHU-01",
  "PAR-MID-KECHIT-01",
  "SHR-01",
  "VSHR-01",
  "VSHR-02",
  "MDV-01",
  "MDV-NAK-01",
  "PAR-CONJ-01"
]);

// These four pairings are explicitly present in the supplied Dharmasindhu passage.
// This map only records the textual association; it does not decide observance date.
const MAHADVADASHI_NAKSHATRA = Object.freeze({
  Jaya: "Pushya",
  Vijaya: "Shravana",
  Jayanti: "Punarvasu",
  Papanashini: "Rohini"
});

function selectMiddayParanaView(view) {
  if (view === undefined || view === null || view === "") {
    return { status: "unresolved", reason: "textual-view-must-be-selected-explicitly" };
  }
  if (view === "bahavah") {
    return {
      status: "selected-source-view",
      sourceId: "PAR-MID-BAHU-01",
      view: "bahavah",
      windowDefinition: "morning-three-muhurta-clause-needs-anchor-confirmation",
      exactClockTime: null
    };
  }
  if (view === "kechit") {
    return {
      status: "selected-source-view",
      sourceId: "PAR-MID-KECHIT-01",
      view: "kechit",
      windowDefinition: "aparahna-view-attributed-to-kechit",
      exactClockTime: null
    };
  }
  return { status: "unresolved", reason: "unknown-textual-view" };
}

test("SRC-01: canonical source clause IDs are unique", () => {
  assert.equal(new Set(SOURCE_IDS).size, SOURCE_IDS.length);
});

test("SRC-02: source registry includes both competing midday views separately", () => {
  assert.ok(SOURCE_IDS.includes("PAR-MID-BAHU-01"));
  assert.ok(SOURCE_IDS.includes("PAR-MID-KECHIT-01"));
  assert.notEqual("PAR-MID-BAHU-01", "PAR-MID-KECHIT-01");
});

test("SRC-03: no midday view is silently selected as universal default", () => {
  assert.deepEqual(selectMiddayParanaView(undefined), {
    status: "unresolved",
    reason: "textual-view-must-be-selected-explicitly"
  });
});

test("SRC-04: Bahavah selection retains its own unresolved morning-window anchor", () => {
  assert.deepEqual(selectMiddayParanaView("bahavah"), {
    status: "selected-source-view",
    sourceId: "PAR-MID-BAHU-01",
    view: "bahavah",
    windowDefinition: "morning-three-muhurta-clause-needs-anchor-confirmation",
    exactClockTime: null
  });
});

test("SRC-05: Kechit selection stays a separate Aparahna view", () => {
  assert.deepEqual(selectMiddayParanaView("kechit"), {
    status: "selected-source-view",
    sourceId: "PAR-MID-KECHIT-01",
    view: "kechit",
    windowDefinition: "aparahna-view-attributed-to-kechit",
    exactClockTime: null
  });
});

test("SRC-06: unknown midday view remains unresolved", () => {
  assert.deepEqual(selectMiddayParanaView("majority"), {
    status: "unresolved",
    reason: "unknown-textual-view"
  });
});

test("SRC-07: the four Mahadvadashi nakshatra pairings match the supplied passage", () => {
  assert.deepEqual(MAHADVADASHI_NAKSHATRA, {
    Jaya: "Pushya",
    Vijaya: "Shravana",
    Jayanti: "Punarvasu",
    Papanashini: "Rohini"
  });
});

test("SRC-08: no source pairing is inferred for the first four Mahadvadashi names", () => {
  for (const name of ["Unmilani", "Vanjuli", "Trisprisha", "Pakshavardhini"]) {
    assert.equal(Object.hasOwn(MAHADVADASHI_NAKSHATRA, name), false);
  }
});

test("SRC-09: unresolved conjunction-ending syntax is registered, not treated as executable", () => {
  assert.ok(SOURCE_IDS.includes("PAR-CONJ-01"));
  // Deliberately no function maps this clause to a parana timestamp.
});
