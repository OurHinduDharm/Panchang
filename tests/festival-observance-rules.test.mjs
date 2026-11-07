import test from "node:test";
import assert from "node:assert/strict";
import { evaluateObservanceRule, getObservanceRuleProfile } from "../festival-observance-rules.mjs";

const interval = (index, startTime, endTime, paksha) => ({ index, startTime, endTime, paksha });

test("Pradosh requires Trayodashi overlap with the first fifth of the local night", () => {
  const sunset = "2026-11-07T12:30:00.000Z";
  const nextSunrise = "2026-11-08T00:30:00.000Z";
  const result = evaluateObservanceRule("pradosh", {
    date: "2026-11-07", sunset, nextSunrise,
    tithis: [interval(27, "2026-11-07T13:00:00Z", "2026-11-07T15:00:00Z")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "pradosh");
  assert.equal(result.finalDate, null);
});

test("Sankashti requires Krishna Chaturthi to be active at local moonrise", () => {
  const result = evaluateObservanceRule("sankashti-moonrise", {
    date: "2026-11-27", moonrise: "2026-11-27T12:00:00.000Z",
    tithis: [interval(18, "2026-11-27T11:00:00Z", "2026-11-27T13:00:00Z", "कृष्ण पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "moonrise");
});

test("Sankashti rejects a Chaturthi that starts after moonrise", () => {
  const result = evaluateObservanceRule("sankashti-moonrise", {
    date: "2026-11-27", moonrise: "2026-11-27T12:00:00.000Z",
    tithis: [interval(18, "2026-11-27T12:00:01Z", "2026-11-27T13:00:00Z", "कृष्ण पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
});

test("Masik Shivaratri requires Krishna Chaturdashi during Nishita", () => {
  const result = evaluateObservanceRule("masik-shivaratri-nishita", {
    date: "2026-11-07", sunset: "2026-11-07T12:30:00Z",
    nextSunrise: "2026-11-08T00:30:00Z",
    tithis: [interval(28, "2026-11-07T17:00:00Z", "2026-11-07T19:00:00Z", "कृष्ण पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "nishita");
});

test("Vinayaka Chaturthi requires Shukla Chaturthi during Madhyahna", () => {
  const result = evaluateObservanceRule("vinayaka-chaturthi-madhyahna", {
    date: "2026-09-14", sunrise: "2026-09-14T00:00:00Z",
    sunset: "2026-09-14T12:00:00Z",
    tithis: [interval(3, "2026-09-14T04:00:00Z", "2026-09-14T06:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "madhyahna");
});

test("wrong paksha does not satisfy a profile that specifies paksha", () => {
  const result = evaluateObservanceRule("vinayaka-chaturthi-madhyahna", {
    date: "2026-09-14", sunrise: "2026-09-14T00:00:00Z",
    sunset: "2026-09-14T12:00:00Z",
    tithis: [interval(3, "2026-09-14T04:00:00Z", "2026-09-14T06:00:00Z", "कृष्ण पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
});

test("unknown or missing data never guesses a rule or approves a date", () => {
  const unknown = evaluateObservanceRule("unknown-observance-rule", { date: "2026-08-20" });
  assert.equal(unknown.status, "manual-review");
  assert.equal(unknown.autoApproved, false);
  const missing = evaluateObservanceRule("pradosh", { date: "2026-11-07", tithis: [] });
  assert.equal(missing.status, "insufficient-data");
});

test("profile metadata makes the pending source-review boundary explicit", () => {
  const profile = getObservanceRuleProfile("mahashivaratri-nishita");
  assert.equal(profile.id, "mahashivaratri-nishita");
  assert.equal(profile.label, "महाशिवरात्रि");
  assert.equal(profile.sourceReview, "pending-primary-source-review");
  assert.equal(profile.tradition, "smarta-review-default");
  assert.equal(getObservanceRuleProfile("masik-shivaratri-nishita").label, "मासिक शिवरात्रि");
  assert.equal(getObservanceRuleProfile("ekadashi").id, "ekadashi-smarta-udaya");
});

test("explicit conflicting paksha is rejected while index-coded tithi can stand alone", () => {
  const result = evaluateObservanceRule("sankashti-moonrise", {
    date: "2026-11-27", moonrise: "2026-11-27T12:00:00.000Z",
    tithis: [interval(18, "2026-11-27T11:00:00Z", "2026-11-27T13:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
});

test("missing tithi intervals are insufficient data, not a negative date decision", () => {
  const result = evaluateObservanceRule("pradosh", {
    date: "2026-11-07", sunset: "2026-11-07T12:30:00Z",
    nextSunrise: "2026-11-08T00:30:00Z", tithis: []
  });
  assert.equal(result.status, "insufficient-data");
  assert.ok(result.warnings.includes("tithi-intervals-missing"));
});

test("Pradosh uses three night-length-aware muhurtas after sunset", () => {
  const result = evaluateObservanceRule("pradosh-trayodashi", {
    date: "2026-06-01", sunset: "2026-06-01T18:00:00Z",
    nextSunrise: "2026-06-02T00:00:00Z",
    tithis: [interval(12, "2026-06-01T18:30:00Z", "2026-06-01T19:00:00Z")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].windowEnd, "2026-06-01T19:12:00.000Z");
});

test("Smarta Ekadashi requires Ekadashi at sunrise", () => {
  const result = evaluateObservanceRule("ekadashi-smarta-udaya", {
    date: "2026-11-20", sunrise: "2026-11-20T00:30:00Z",
    tithis: [interval(10, "2026-11-19T22:00:00Z", "2026-11-20T20:00:00Z")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "sunrise");
});

test("Smarta Ekadashi does not select the second sunrise of a vriddhi tithi", () => {
  const result = evaluateObservanceRule("ekadashi-smarta-udaya", {
    date: "2026-11-21", sunrise: "2026-11-21T00:30:00Z",
    previousSunrise: "2026-11-20T00:30:00Z",
    previousTithis: [interval(10, "2026-11-19T22:00:00Z", "2026-11-21T20:00:00Z")],
    tithis: [interval(10, "2026-11-19T22:00:00Z", "2026-11-21T20:00:00Z")]
  });
  assert.equal(result.status, "candidate-not-supported");
  assert.ok(result.warnings.includes("vriddhi-tithi-first-sunrise-only"));
});

test("Smarta Janmashtami checks Krishna Ashtami at Nishita and records Rohini separately", () => {
  const result = evaluateObservanceRule("janmashtami-smarta-nishita", {
    date: "2026-08-20", masa: "भाद्रपद", sunset: "2026-08-20T13:00:00Z",
    nextSunrise: "2026-08-21T00:00:00Z",
    tithis: [interval(22, "2026-08-20T17:00:00Z", "2026-08-20T20:00:00Z", "कृष्ण पक्ष")],
    nakshatraIntervals: [interval(3, "2026-08-20T18:00:00Z", "2026-08-20T19:00:00Z")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.nakshatraEvidence[0].index, 3);
});

test("Navratri day count uses Shukla tithi at sunrise", () => {
  const result = evaluateObservanceRule("navratri-udaya", {
    date: "2026-10-11", masa: "आश्विन", sunrise: "2026-10-11T00:30:00Z",
    tithis: [interval(0, "2026-10-10T20:00:00Z", "2026-10-11T16:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].tithiIndex, 0);
});

test("Navratri Sandhi Puja needs both Ashtami and Navami around their exact transition", () => {
  const result = evaluateObservanceRule("navratri-sandhi-puja", {
    date: "2026-10-19", masa: "आश्विन",
    tithis: [
      interval(7, "2026-10-19T08:00:00Z", "2026-10-19T10:00:00Z", "शुक्ल पक्ष"),
      interval(8, "2026-10-19T10:00:00Z", "2026-10-19T16:00:00Z", "शुक्ल पक्ष")
    ]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence.length, 2);
  assert.equal(result.evidence[0].windowStart, "2026-10-19T09:36:00.000Z");
  assert.equal(result.evidence[0].windowEnd, "2026-10-19T10:24:00.000Z");
});

test("Navratri Sandhi Puja rejects incomplete transition evidence", () => {
  const result = evaluateObservanceRule("navratri-sandhi-puja", {
    date: "2026-10-19",
    tithis: [interval(7, "2026-10-19T08:00:00Z", "2026-10-19T10:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "insufficient-data");
});

test("Navratri Navami is supported only when Ashtami holds sunrise and Navami follows by day", () => {
  const result = evaluateObservanceRule("navratri-navami-ashtami-viddha", {
    date: "2026-10-19", masa: "आश्विन",
    sunrise: "2026-10-19T00:30:00Z", sunset: "2026-10-19T12:00:00Z",
    tithis: [
      interval(7, "2026-10-19T00:00:00Z", "2026-10-19T05:22:00Z", "शुक्ल पक्ष"),
      interval(8, "2026-10-19T05:22:00Z", "2026-10-20T00:00:00Z", "शुक्ल पक्ष")
    ]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence.length, 2);
});

test("Navratri Navami profile rejects a day without Ashtami at sunrise", () => {
  const result = evaluateObservanceRule("navratri-navami-ashtami-viddha", {
    date: "2026-10-20", masa: "आश्विन",
    sunrise: "2026-10-20T00:30:00Z", sunset: "2026-10-20T12:00:00Z",
    tithis: [interval(8, "2026-10-19T05:22:00Z", "2026-10-20T08:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
  assert.ok(result.warnings.includes("ashtami-not-active-at-sunrise"));
});

test("annual profiles reject the wrong lunar month instead of matching a same-numbered tithi", () => {
  const result = evaluateObservanceRule("navratri-udaya", {
    date: "2026-11-01", masa: "कार्तिक", sunrise: "2026-11-01T00:30:00Z",
    tithis: [interval(0, "2026-10-31T22:00:00Z", "2026-11-01T10:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
  assert.ok(result.warnings.includes("lunar-month-outside-profile"));
});
