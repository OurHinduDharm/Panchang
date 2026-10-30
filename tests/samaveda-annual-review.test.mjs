import test from "node:test";
import assert from "node:assert/strict";
import { resolveSamavedaAnnualDecision } from "../samaveda-annual-review.js";

const d = value => new Date(value).toISOString();
function day(date, sunrise, sunset, intervals, extra = {}) {
  return {
    date, sunrise:d(sunrise), sunset:d(sunset),
    masa:"भाद्रपद", paksha:"शुक्ल पक्ष", tithi:"द्वितीया",
    nakshatra:"हस्त", nakshatraIntervals:intervals,
    ...extra
  };
}

test("annual resolver selects the second day when Hasta covers Aparahna on both days", () => {
  const records = [
    day("2026-09-12","2026-09-12T00:30:00Z","2026-09-12T12:30:00Z",[
      {index:12,startTime:d("2026-09-12T07:00:00Z"),endTime:d("2026-09-12T12:00:00Z")}
    ]),
    day("2026-09-13","2026-09-13T00:30:00Z","2026-09-13T12:30:00Z",[
      {index:12,startTime:d("2026-09-13T00:00:00Z"),endTime:d("2026-09-13T08:00:00Z")}
    ])
  ];
  const result = resolveSamavedaAnnualDecision(records);
  assert.equal(result.status,"selected");
  assert.equal(result.date,"2026-09-13");
  assert.equal(result.calculationStatus,"calculated-needs-review");
  assert.equal(result.reviewStatus,"needs-review");
});

test("annual resolver refuses scalar Hasta labels when exact nakshatra intervals are absent", () => {
  const records = [day("2026-09-12","2026-09-12T00:30:00Z","2026-09-12T12:30:00Z",[])];
  const result = resolveSamavedaAnnualDecision(records);
  assert.equal(result.status,"unavailable");
  assert.equal(result.date,null);
  assert.equal(result.coverage.daysWithExactHastaIntervals,0);
});

test("annual resolver carries location-specific Sankranti timestamps into the decision", () => {
  const records = [
    day("2026-09-12","2026-09-12T00:30:00Z","2026-09-12T12:30:00Z",[
      {index:12,startTime:d("2026-09-12T07:00:00Z"),endTime:d("2026-09-12T12:00:00Z")}
    ],{sankrantiTimes:[d("2026-09-12T08:00:00Z")]})
  ];
  const result = resolveSamavedaAnnualDecision(records);
  assert.equal(result.coverage.daysWithSankrantiTimes,1);
  assert.equal(result.reviewStatus,"needs-review");
});

test("Tamil Sampradaya is retained as a distinct selectable calculation option", () => {
  const result = resolveSamavedaAnnualDecision([], {sampradaya:"tamil"});
  assert.equal(result.sampradaya,"tamil");
  assert.equal(result.status,"unavailable");
});
