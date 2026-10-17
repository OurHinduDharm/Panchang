import test from "node:test";
import assert from "node:assert/strict";
import { evaluateFestivalDateRule, getFestivalDateRuleIds } from "../festival-date-engine.mjs";

function day(date, tithi, start, end, anchorName, anchorStart, anchorEnd) {
  return {
    date,
    tithiIntervals: [{ tithi, start, end }],
    anchors: { [anchorName]: { start: anchorStart, end: anchorEnd } }
  };
}

test("pilot rules are limited to the three agreed festivals", () => {
  assert.deepEqual(getFestivalDateRuleIds().sort(), [
    "krishna_janmashtami", "maha_shivaratri", "rama_navami"
  ]);
});

test("Krishna Janmashtami selects the local date with Ashtami at Nishita", () => {
  const days = [
    day("2026-08-25", 22, "2026-08-25T10:00:00+05:30", "2026-08-26T08:00:00+05:30", "nishita", "2026-08-25T23:30:00+05:30", "2026-08-26T00:30:00+05:30"),
    day("2026-08-26", 23, "2026-08-26T08:00:00+05:30", "2026-08-27T06:00:00+05:30", "nishita", "2026-08-26T23:30:00+05:30", "2026-08-27T00:30:00+05:30")
  ];
  const result = evaluateFestivalDateRule("krishna_janmashtami", days, { fallbackDate: "2026-08-25" });
  assert.equal(result.status, "candidate");
  assert.equal(result.date, "2026-08-26");
});

test("Rama Navami requires Navami at local Madhyahna, not merely at noon UTC", () => {
  const days = [
    day("2027-04-15", 8, "2027-04-15T07:00:00+05:30", "2027-04-16T09:00:00+05:30", "madhyahna", "2027-04-15T11:30:00+05:30", "2027-04-15T12:30:00+05:30"),
    day("2027-04-16", 9, "2027-04-16T09:00:00+05:30", "2027-04-17T07:00:00+05:30", "madhyahna", "2027-04-16T11:30:00+05:30", "2027-04-16T12:30:00+05:30")
  ];
  const result = evaluateFestivalDateRule("rama_navami", days);
  assert.equal(result.status, "candidate");
  assert.equal(result.date, "2027-04-16");
});

test("Maha Shivaratri checks Chaturdashi at Nishita", () => {
  const sample = day("2028-02-26", 29, "2028-02-26T14:00:00+05:30", "2028-02-27T16:00:00+05:30", "nishita", "2028-02-26T23:30:00+05:30", "2028-02-27T00:30:00+05:30");
  const result = evaluateFestivalDateRule("maha_shivaratri", [sample]);
  assert.equal(result.status, "candidate");
  assert.equal(result.date, "2028-02-26");
});

test("multiple matching days remain ambiguous and preserve static fallback", () => {
  const days = [
    day("2026-08-25", 23, "2026-08-25T20:00:00+05:30", "2026-08-26T04:00:00+05:30", "nishita", "2026-08-25T23:30:00+05:30", "2026-08-26T00:30:00+05:30"),
    day("2026-08-26", 23, "2026-08-26T20:00:00+05:30", "2026-08-27T04:00:00+05:30", "nishita", "2026-08-26T23:30:00+05:30", "2026-08-27T00:30:00+05:30")
  ];
  const result = evaluateFestivalDateRule("krishna_janmashtami", days, { fallbackDate: "2026-08-25" });
  assert.equal(result.status, "ambiguous");
  assert.equal(result.date, "2026-08-25");
  assert.equal(result.candidates.length, 2);
});

test("missing anchors, invalid input and unknown rules never invent a date", () => {
  const result = evaluateFestivalDateRule("krishna_janmashtami", [{
    date: "2026-08-26",
    tithiIntervals: [{ tithi: 23, start: "2026-08-26T08:00:00+05:30", end: "2026-08-27T06:00:00+05:30" }],
    anchors: {}
  }], { fallbackDate: "2026-08-25" });
  assert.equal(result.status, "no-match");
  assert.equal(result.date, "2026-08-25");
  assert.equal(evaluateFestivalDateRule("future_festival", [], { fallbackDate: "2026-10-10" }).status, "rule-pending");
  assert.equal(evaluateFestivalDateRule("krishna_janmashtami", null).status, "calculation-unavailable");
});
