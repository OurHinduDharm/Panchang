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
  const unknown = evaluateObservanceRule("janmashtami", { date: "2026-08-20" });
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
  assert.equal(getObservanceRuleProfile("ekadashi"), null);
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
