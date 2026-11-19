import test from "node:test";
import assert from "node:assert/strict";
import {
  getApprovedSpecialPunyaKaalForMonth,
  getApprovedSpecialPunyaKaalForDate,
  hasApprovedSpecialPunyaKaalInMonth,
  buildMonthlyReligiousCalendarUrl
} from "../monthly-religious-calendar.js";

const approved = (id, date, start, end, status = "approved") => ({
  id, date, start, end, status, label: id, type: "varuni"
});

const records = [
  approved("later", "2027-04-04", "2027-04-04T09:00:00+05:30", "2027-04-04T10:00:00+05:30"),
  approved("earlier", "2027-04-04", "2027-04-04T04:00:00+05:30", "2027-04-04T05:00:00+05:30"),
  approved("candidate", "2027-04-10", "2027-04-10T04:00:00+05:30", "2027-04-10T05:00:00+05:30", "research-candidate"),
  approved("other-month", "2027-05-01", "2027-05-01T04:00:00+05:30", "2027-05-01T05:00:00+05:30")
];

test("monthly lookup returns only approved records for selected month in chronological order", () => {
  assert.deepEqual(
    getApprovedSpecialPunyaKaalForMonth(records, 2027, 4).map((item) => item.id),
    ["earlier", "later"]
  );
});

test("daily lookup returns only approved records for the actual event date", () => {
  assert.deepEqual(
    getApprovedSpecialPunyaKaalForDate(records, "2027-04-04").map((item) => item.id),
    ["earlier", "later"]
  );
  assert.deepEqual(getApprovedSpecialPunyaKaalForDate(records, "2027-04-05"), []);
});

test("month availability is false for empty or candidate-only months", () => {
  assert.equal(hasApprovedSpecialPunyaKaalInMonth(records, 2027, 4), true);
  assert.equal(hasApprovedSpecialPunyaKaalInMonth(records, 2027, 6), false);
});

test("malformed, missing-time, and zero-length records never become public", () => {
  const invalid = [
    approved("bad-date", "2027-02-30", "2027-02-01T04:00:00+05:30", "2027-02-01T05:00:00+05:30"),
    approved("missing-zone", "2027-04-04", "2027-04-04T04:00:00", "2027-04-04T05:00:00"),
    approved("zero", "2027-04-04", "2027-04-04T04:00:00+05:30", "2027-04-04T04:00:00+05:30")
  ];
  assert.deepEqual(getApprovedSpecialPunyaKaalForMonth(invalid, 2027, 4), []);
});

test("monthly link targets selected month and special punya-kaal anchor", () => {
  assert.equal(
    buildMonthlyReligiousCalendarUrl("https://example.test/p/masik-vrat-parv.html", 2027, 4),
    "https://example.test/p/masik-vrat-parv.html?year=2027&month=04#special-punya-kaal"
  );
});

test("Sankranti and unknown event types are excluded from special punya-kaal", () => {
  const nonSpecial = [
    { ...approved("sankranti", "2027-04-04", "2027-04-04T04:00:00+05:30", "2027-04-04T05:00:00+05:30"), type: "sankranti" },
    { ...approved("unknown", "2027-04-04", "2027-04-04T04:00:00+05:30", "2027-04-04T05:00:00+05:30"), type: "other" }
  ];
  assert.deepEqual(getApprovedSpecialPunyaKaalForMonth(nonSpecial, 2027, 4), []);
});
