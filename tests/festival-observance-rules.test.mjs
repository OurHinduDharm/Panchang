import test from "node:test";
import assert from "node:assert/strict";
import { evaluateObservanceRule, getObservanceRuleProfile, resolveObservanceCandidates } from "../festival-observance-rules.mjs";

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
  assert.equal(profile.sourceReview, "primary-text-consulted-two-night-tie-break-pending");
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
  assert.equal(result.evidence[0].transitionTime, "2026-10-19T10:00:00.000Z");
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

test("Navratri Mahashtami profile checks Shukla Ashtami at sunrise", () => {
  const result = evaluateObservanceRule("navratri-maha-ashtami", {
    date: "2026-10-18", masa: "आश्विन", sunrise: "2026-10-18T00:30:00Z",
    tithis: [interval(7, "2026-10-18T00:00:00Z", "2026-10-18T10:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
});

test("Navratri Navami sunrise profile provides the next-day fallback candidate", () => {
  const result = evaluateObservanceRule("navratri-navami-udaya", {
    date: "2026-10-20", masa: "आश्विन", sunrise: "2026-10-20T00:30:00Z",
    tithis: [interval(8, "2026-10-19T05:22:00Z", "2026-10-20T08:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
});

test("Navratri Ashtami-viddha Navami requires six ghatis after sunset", () => {
  const result = evaluateObservanceRule("navratri-navami-ashtami-viddha", {
    date: "2026-10-19", masa: "आश्विन",
    sunrise: "2026-10-19T00:30:00Z", sunset: "2026-10-19T12:00:00Z",
    tithis: [
      interval(7, "2026-10-19T00:00:00Z", "2026-10-19T06:00:00Z", "शुक्ल पक्ष"),
      interval(8, "2026-10-19T06:00:00Z", "2026-10-19T14:24:00Z", "शुक्ल पक्ष")
    ]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence.length, 2);
});

test("Navratri Ashtami-viddha Navami rejects less than six ghatis after sunset", () => {
  const result = evaluateObservanceRule("navratri-navami-ashtami-viddha", {
    date: "2026-10-19", masa: "आश्विन",
    sunrise: "2026-10-19T00:30:00Z", sunset: "2026-10-19T12:00:00Z",
    tithis: [
      interval(7, "2026-10-19T00:00:00Z", "2026-10-19T06:00:00Z", "शुक्ल पक्ष"),
      interval(8, "2026-10-19T06:00:00Z", "2026-10-19T14:23:59Z", "शुक्ल पक्ष")
    ]
  });
  assert.equal(result.status, "candidate-not-supported");
  assert.ok(result.warnings.includes("navami-less-than-six-ghatis-after-sunset"));
});

test("Navratri Sandhi normalizes up to 90 seconds of rounded adjacent tithi boundary", () => {
  const result = evaluateObservanceRule("navratri-sandhi-puja", {
    date: "2026-10-19", masa: "आश्विन",
    tithis: [
      interval(7, "2026-10-19T08:00:00Z", "2026-10-19T10:00:00Z", "शुक्ल पक्ष"),
      interval(8, "2026-10-19T10:01:00Z", "2026-10-19T16:00:00Z", "शुक्ल पक्ष")
    ]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].transitionTime, "2026-10-19T10:00:30.000Z");
});

test("Rama Navami candidate requires Chaitra Shukla Navami at Madhyahna", () => {
  const result = evaluateObservanceRule("ram-navami-madhyahna", {
    date: "2026-04-06", masa: "चैत्र",
    sunrise: "2026-04-06T00:00:00Z", sunset: "2026-04-06T12:00:00Z",
    tithis: [interval(8, "2026-04-06T05:00:00Z", "2026-04-06T06:30:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.evidence[0].decisionMoment, "madhyahna");
});

test("Vijayadashami candidate uses Ashwin Shukla Dashami at Aparahna and reports Shravana", () => {
  const result = evaluateObservanceRule("vijayadashami-aparahna", {
    date: "2026-10-20", masa: "आश्विन",
    sunrise: "2026-10-20T00:00:00Z", sunset: "2026-10-20T12:00:00Z",
    tithis: [interval(9, "2026-10-20T07:30:00Z", "2026-10-20T09:00:00Z", "शुक्ल पक्ष")],
    nakshatraIntervals: [interval(21, "2026-10-20T08:00:00Z", "2026-10-20T08:30:00Z")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.equal(result.nakshatraLabel, "श्रवण");
  assert.equal(result.nakshatraEvidence[0].index, 21);
});

test("Vijayadashami remains a candidate even without Shravana; two-day tie-break stays manual", () => {
  const result = evaluateObservanceRule("vijayadashami-aparahna", {
    date: "2026-10-20", masa: "आश्विन",
    sunrise: "2026-10-20T00:00:00Z", sunset: "2026-10-20T12:00:00Z",
    tithis: [interval(9, "2026-10-20T07:30:00Z", "2026-10-20T09:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.warnings.includes("shravana-at-aparahna-not-confirmed"));
  assert.equal(result.autoApproved, false);
});

test("Rama Navami profile rejects non-Chaitra lunar months", () => {
  const result = evaluateObservanceRule("ram-navami-madhyahna", {
    date: "2026-04-06", masa: "वैशाख",
    sunrise: "2026-04-06T00:00:00Z", sunset: "2026-04-06T12:00:00Z",
    tithis: [interval(8, "2026-04-06T05:00:00Z", "2026-04-06T06:30:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
  assert.ok(result.warnings.includes("lunar-month-outside-profile"));
});

test("Janmashtami reports when Rohini is absent at Nishita without rejecting the Ashtami candidate", () => {
  const result = evaluateObservanceRule("janmashtami-smarta-nishita", {
    date: "2026-08-20", masa: "भाद्रपद",
    sunset: "2026-08-20T13:00:00Z", nextSunrise: "2026-08-21T00:00:00Z",
    tithis: [interval(22, "2026-08-20T17:00:00Z", "2026-08-20T20:00:00Z", "कृष्ण पक्ष")],
    nakshatraIntervals: [interval(4, "2026-08-20T18:00:00Z", "2026-08-20T19:00:00Z")]
  });
  assert.equal(result.status, "candidate-supported");
  assert.ok(result.warnings.includes("rohini-at-nishita-not-confirmed"));
  assert.equal(result.autoApproved, false);
});

test("Nag Panchami stays manual until its three-muhurta and short-tithi exceptions are implemented", () => {
  const result = evaluateObservanceRule("nag-panchami", {
    date: "2026-08-17", masa: "श्रावण",
    sunrise: "2026-08-17T00:30:00Z", sunset: "2026-08-17T12:40:00Z",
    tithis: [interval(4, "2026-08-16T11:23:00Z", "2026-08-17T11:30:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "manual-review");
  assert.match(result.reviewNote, /तीन मुहूर्त/);
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
});

test("Kartika Skanda rule is not assigned to generic monthly Skanda Shashthi", () => {
  assert.equal(getObservanceRuleProfile("skanda-shashthi"), null);
  assert.equal(getObservanceRuleProfile("soorasamharam").reviewOnly, true);
});

test("Skanda Shashthi and Ratha Saptami stay manual until their special day-selection rules are reconciled", () => {
  for (const [ruleId, masa] of [["skanda-shashthi-kartika-review", "कार्तिक"], ["ratha-saptami-review", "माघ"]]) {
    const result = evaluateObservanceRule(ruleId, {
      date: "2026-11-15", masa,
      sunrise: "2026-11-15T00:30:00Z", sunset: "2026-11-15T12:40:00Z",
      tithis: [interval(ruleId === "ratha-saptami-review" ? 6 : 5, "2026-11-14T17:30:00Z", "2026-11-16T20:00:00Z", "शुक्ल पक्ष")]
    });
    assert.equal(result.status, "manual-review");
    assert.equal(result.finalDate, null);
    assert.equal(result.autoApproved, false);
    assert.ok(result.warnings.includes("special-rule-not-fully-implemented"));
  }
});

test("Chhath remains manual because its regional observance rule is not established as a universal Smriti rule", () => {
  const profile = getObservanceRuleProfile("chhath-puja");
  assert.equal(profile.id, "chhath-kartika-review");
  assert.equal(profile.reviewOnly, true);
  const result = evaluateObservanceRule("chhath", {
    date: "2026-11-15", masa: "कार्तिक", sunrise: "2026-11-15T00:30:00Z",
    sunset: "2026-11-15T12:30:00Z", nextSunrise: "2026-11-16T00:30:00Z",
    tithis: [interval(5, "2026-11-15T00:00:00Z", "2026-11-15T18:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "manual-review");
  assert.match(result.reviewNote, /लोक-परंपरा/);
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
});

test("Hanuman Jayanti profile preserves the North Indian Chaitra Purnima convention without erasing regional dates", () => {
  const profile = getObservanceRuleProfile("hanuman-janmotsav");
  assert.equal(profile.id, "hanuman-jayanti-chaitra-review");
  assert.equal(profile.reviewOnly, true);
  const result = evaluateObservanceRule("hanuman-jayanti", {
    date: "2026-04-02", masa: "चैत्र",
    sunrise: "2026-04-02T00:30:00Z", sunset: "2026-04-02T12:30:00Z",
    tithis: [interval(14, "2026-04-01T18:00:00Z", "2026-04-02T18:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "manual-review");
  assert.match(result.reviewNote, /क्षेत्रों/);
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
});

test("review-only profiles still reject an incompatible lunar month", () => {
  const result = evaluateObservanceRule("chhath", {
    date: "2026-04-10", masa: "चैत्र",
    tithis: [interval(5, "2026-04-10T00:00:00Z", "2026-04-10T12:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
  assert.ok(result.warnings.includes("lunar-month-outside-profile"));
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
});

test("review-only profiles require lunar-month metadata before showing a manual decision", () => {
  const result = evaluateObservanceRule("hanuman-jayanti", {
    date: "2026-04-02", sunrise: "2026-04-02T00:30:00Z",
    tithis: [interval(14, "2026-04-01T18:00:00Z", "2026-04-02T18:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "insufficient-data");
  assert.ok(result.warnings.includes("lunar-month-missing"));
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
});

test("additional Jayanti profiles remain manual and enforce their own lunar months", () => {
  const cases = [
    ["narasimha-jayanti", "वैशाख", 13, "शुक्ल पक्ष"],
    ["parashurama-jayanti", "वैशाख", 2, "शुक्ल पक्ष"],
    ["radhashtami", "भाद्रपद", 7, "शुक्ल पक्ष"],
    ["vamana-jayanti", "भाद्रपद", 11, "शुक्ल पक्ष"],
    ["shani-jayanti", "ज्येष्ठ", 29, "कृष्ण पक्ष"]
  ];
  for (const [ruleId, masa, index, paksha] of cases) {
    const profile = getObservanceRuleProfile(ruleId);
    assert.equal(profile.reviewOnly, true, ruleId);
    const result = evaluateObservanceRule(ruleId, {
      date: "2026-04-30", masa,
      sunrise: "2026-04-30T00:30:00Z", sunset: "2026-04-30T12:30:00Z",
      tithis: [interval(index, "2026-04-30T00:00:00Z", "2026-04-30T12:00:00Z", paksha)]
    });
    assert.equal(result.status, "manual-review", ruleId);
    assert.equal(result.finalDate, null, ruleId);
    assert.equal(result.autoApproved, false, ruleId);
  }
});

test("Jayanti review profiles reject a mismatched month instead of silently applying another festival rule", () => {
  const result = evaluateObservanceRule("vamana-jayanti", {
    date: "2026-04-30", masa: "वैशाख",
    tithis: [interval(11, "2026-04-30T00:00:00Z", "2026-04-30T12:00:00Z", "शुक्ल पक्ष")]
  });
  assert.equal(result.status, "candidate-not-supported");
  assert.ok(result.warnings.includes("lunar-month-outside-profile"));
  assert.equal(result.autoApproved, false);
});


test("candidate resolver selects only a unique local karmakala match and keeps source approval separate", () => {
  const result = resolveObservanceCandidates("sankashti-moonrise", [
    { date: "2026-11-26", masa: "कार्तिक", moonrise: "2026-11-26T12:00:00Z",
      tithis: [interval(17, "2026-11-26T00:00:00Z", "2026-11-26T11:00:00Z", "कृष्ण पक्ष")] },
    { date: "2026-11-27", masa: "कार्तिक", moonrise: "2026-11-27T12:00:00Z",
      tithis: [interval(18, "2026-11-27T11:00:00Z", "2026-11-28T02:00:00Z", "कृष्ण पक्ष")] }
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.finalDate, "2026-11-27");
  assert.equal(result.autoApproved, false);
  assert.ok(result.warnings.includes("primary-source-and-publication-approval-still-required"));
});

test("candidate resolver refuses to invent a tie-break when two days satisfy the same karmakala", () => {
  const result = resolveObservanceCandidates("pradosh-trayodashi", [
    { date: "2026-11-26", masa: "कार्तिक", sunset: "2026-11-26T12:00:00Z", nextSunrise: "2026-11-27T00:00:00Z",
      tithis: [interval(12, "2026-11-26T12:00:00Z", "2026-11-27T18:00:00Z", "कृष्ण पक्ष")] },
    { date: "2026-11-27", masa: "कार्तिक", sunset: "2026-11-27T12:00:00Z", nextSunrise: "2026-11-28T00:00:00Z",
      tithis: [interval(12, "2026-11-26T12:00:00Z", "2026-11-28T00:00:00Z", "कृष्ण पक्ष")] }
  ]);
  assert.equal(result.status, "manual-review");
  assert.equal(result.finalDate, null);
  assert.ok(result.warnings.includes("multiple-days-cover-karmakala-explicit-shastriya-tie-break-required"));
});

test("candidate resolver blocks selection when any candidate day lacks calculation inputs", () => {
  const result = resolveObservanceCandidates("sankashti-moonrise", [
    { date: "2026-11-26", masa: "कार्तिक", moonrise: "2026-11-26T12:00:00Z", tithis: [] },
    { date: "2026-11-27", masa: "कार्तिक", moonrise: "2026-11-27T12:00:00Z",
      tithis: [interval(18, "2026-11-27T11:00:00Z", "2026-11-28T02:00:00Z", "कृष्ण पक्ष")] }
  ]);
  assert.equal(result.status, "insufficient-data");
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
});


test("Shravana Dwadashi yoga detector segments evidence by sunrise-to-sunrise vrata day", async () => {
  const { evaluateShravanaDwadashiYoga } = await import("../festival-observance-rules.mjs");
  const result = evaluateShravanaDwadashiYoga([
    {
      date: "2030-09-08", dayStart: "2030-09-08T00:20:24.921Z", dayEnd: "2030-09-09T00:20:56.105Z",
      tithis: [interval(11, "2030-09-08T02:51:59.472Z", "2030-09-09T01:02:49.720Z", "शुक्ल पक्ष")],
      nakshatraIntervals: [interval(21, "2030-09-08T14:29:00.797Z", "2030-09-09T13:30:51.947Z")]
    },
    {
      date: "2030-09-09", dayStart: "2030-09-09T00:20:56.105Z", dayEnd: "2030-09-10T00:21:27.237Z",
      tithis: [interval(11, "2030-09-08T02:51:59.472Z", "2030-09-09T01:02:49.720Z", "शुक्ल पक्ष")],
      nakshatraIntervals: [interval(21, "2030-09-08T14:29:00.797Z", "2030-09-09T13:30:51.947Z")]
    }
  ]);
  assert.equal(result.status, "candidate-evidence-only");
  assert.deepEqual(result.qualifyingDates, ["2030-09-08"]);
  assert.equal(result.finalDate, null);
  assert.equal(result.autoApproved, false);
  assert.equal(result.matches[0].durationMs, 35515308);
  assert.equal(result.matches[1].durationMs, 2513615);
});

test("Dharmasindhu Vishnushrinkhala selects the earlier 2030 vrata day only with all two-day conditions", () => {
  const candidateDays = [
    {
      date: "2030-09-08", masa: "भाद्रपद", paksha: "शुक्ल पक्ष",
      dayStart: "2030-09-08T00:20:24.921Z", dayEnd: "2030-09-09T00:20:56.105Z",
      sunset: "2030-09-08T12:52:52.114Z",
      tithis: [
        interval(10, "2030-09-07T04:48:24.531Z", "2030-09-08T02:50:59.472Z", "शुक्ल पक्ष"),
        interval(11, "2030-09-08T02:51:59.472Z", "2030-09-09T01:02:49.720Z", "शुक्ल पक्ष")
      ],
      nakshatraIntervals: [interval(21, "2030-09-08T14:29:00.797Z", "2030-09-09T13:30:51.947Z")]
    },
    {
      date: "2030-09-09", masa: "भाद्रपद", paksha: "शुक्ल पक्ष",
      dayStart: "2030-09-09T00:20:56.105Z", dayEnd: "2030-09-10T00:21:27.237Z",
      sunset: "2030-09-09T12:51:39.237Z",
      tithis: [interval(11, "2030-09-08T02:51:59.472Z", "2030-09-09T01:02:49.720Z", "शुक्ल पक्ष")],
      nakshatraIntervals: [interval(21, "2030-09-08T14:29:00.797Z", "2030-09-09T13:30:51.947Z")]
    }
  ];
  const result = resolveObservanceCandidates("shravana-yoga-dwadashi-review", candidateDays);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2030-09-08");
  assert.equal(result.finalDate, "2030-09-08");
  assert.equal(result.selectionBasis, "dharmasindhu-vishnushrinkhala-ekadashi-viddha-dwadashi-shravana-both-vrata-days-previous-day-only");
  assert.equal(result.evaluations[0].shravanaDwadashiOverlapMs, 35515308);
  assert.equal(result.evaluations[1].dwadashiRemainingAfterSunriseMs, 2513615);
  assert.equal(result.autoApproved, false);
});

test("Shravana Dwadashi special resolver refuses the earlier day when first-prahara overlap is absent", () => {
  const candidateDays = [
    {
      date: "2030-09-08", masa: "भाद्रपद", paksha: "शुक्ल पक्ष",
      dayStart: "2030-09-08T00:20:24.921Z", dayEnd: "2030-09-09T00:20:56.105Z",
      sunset: "2030-09-08T12:52:52.114Z",
      tithis: [
        interval(10, "2030-09-07T04:48:24.531Z", "2030-09-08T02:50:59.472Z", "शुक्ल पक्ष"),
        interval(11, "2030-09-08T02:51:59.472Z", "2030-09-09T01:02:49.720Z", "शुक्ल पक्ष")
      ],
      nakshatraIntervals: [interval(21, "2030-09-08T16:00:00.000Z", "2030-09-09T13:30:51.947Z")]
    },
    {
      date: "2030-09-09", masa: "भाद्रपद", paksha: "शुक्ल पक्ष",
      dayStart: "2030-09-09T00:20:56.105Z", dayEnd: "2030-09-10T00:21:27.237Z",
      sunset: "2030-09-09T12:51:39.237Z",
      tithis: [interval(11, "2030-09-08T02:51:59.472Z", "2030-09-09T01:02:49.720Z", "शुक्ल पक्ष")],
      nakshatraIntervals: [interval(21, "2030-09-08T16:00:00.000Z", "2030-09-09T13:30:51.947Z")]
    }
  ];
  const result = resolveObservanceCandidates("shravana-yoga-dwadashi-review", candidateDays);
  assert.equal(result.status, "manual-review");
  assert.equal(result.selectedDate, null);
  assert.equal(result.autoApproved, false);
});

test("Shravana Dwadashi yoga detector does not treat a short overlap as a complete muhurta", async () => {
  const { evaluateShravanaDwadashiYoga } = await import("../festival-observance-rules.mjs");
  const result = evaluateShravanaDwadashiYoga([{
    date: "2030-09-09", dayStart: "2030-09-08T18:30:00Z", dayEnd: "2030-09-09T18:30:00Z",
    tithis: [interval(11, "2030-09-09T00:00:00Z", "2030-09-09T03:00:00Z", "शुक्ल पक्ष")],
    nakshatraIntervals: [interval(21, "2030-09-09T02:30:00Z", "2030-09-09T05:00:00Z")]
  }]);
  assert.equal(result.status, "brief-overlap-needs-review");
  assert.equal(result.finalDate, null);
  assert.ok(result.warnings.includes("overlap-shorter-than-one-muhurta"));
});

test("Ekadashi parana opens after sunrise and Hari Vasara, inside Pratahkal and Dwadashi", async () => {
  const { calculateEkadashiParanaWindow } = await import("../festival-observance-rules.mjs");
  const result = calculateEkadashiParanaWindow({
    sunrise: "2030-01-02T00:30:00Z", sunset: "2030-01-02T12:30:00Z",
    dwadashiStart: "2030-01-01T12:00:00Z", dwadashiEnd: "2030-01-02T04:30:00Z"
  });
  assert.equal(result.status, "morning-window");
  assert.equal(result.windowStart, "2030-01-02T00:30:00.000Z");
  assert.equal(result.windowEnd, "2030-01-02T02:54:00.000Z");
  assert.equal(result.autoApproved, false);
});

test("Ekadashi parana waits until Hari Vasara ends when it crosses sunrise", async () => {
  const { calculateEkadashiParanaWindow } = await import("../festival-observance-rules.mjs");
  const result = calculateEkadashiParanaWindow({
    sunrise: "2030-01-02T00:30:00Z", sunset: "2030-01-02T12:30:00Z",
    dwadashiStart: "2030-01-02T00:00:00Z", dwadashiEnd: "2030-01-02T10:00:00Z"
  });
  assert.equal(result.status, "morning-window");
  assert.equal(result.windowStart, "2030-01-02T02:30:00.000Z");
});

test("Ekadashi parana moves after Madhyahna when Hari Vasara exceeds Pratahkal", async () => {
  const { calculateEkadashiParanaWindow } = await import("../festival-observance-rules.mjs");
  const result = calculateEkadashiParanaWindow({
    sunrise: "2030-01-02T00:30:00Z", sunset: "2030-01-02T12:30:00Z",
    dwadashiStart: "2030-01-01T23:30:00Z", dwadashiEnd: "2030-01-02T18:30:00Z"
  });
  assert.equal(result.status, "afternoon-window");
  assert.equal(result.windowStart, "2030-01-02T07:42:00.000Z");
  assert.equal(result.windowEnd, "2030-01-02T18:30:00.000Z");
  assert.ok(result.warnings.includes("madhyahna-avoided"));
});

test("Ekadashi parana uses the after-sunrise exception when Dwadashi ended before sunrise", async () => {
  const { calculateEkadashiParanaWindow } = await import("../festival-observance-rules.mjs");
  const result = calculateEkadashiParanaWindow({
    sunrise: "2030-01-02T00:30:00Z", sunset: "2030-01-02T12:30:00Z",
    dwadashiStart: "2030-01-01T06:00:00Z", dwadashiEnd: "2030-01-01T23:00:00Z"
  });
  assert.equal(result.status, "parana-after-dwadashi-ended-before-sunrise");
  assert.equal(result.windowStart, "2030-01-02T00:30:00.000Z");
  assert.equal(result.windowEnd, "2030-01-02T02:54:00.000Z");
});

test("Ekadashi parana refuses to invent a window when Dwadashi ends during Hari Vasara", async () => {
  const { calculateEkadashiParanaWindow } = await import("../festival-observance-rules.mjs");
  const result = calculateEkadashiParanaWindow({
    sunrise: "2030-01-02T00:30:00Z", sunset: "2030-01-02T12:30:00Z",
    dwadashiStart: "2030-01-02T02:00:00Z", dwadashiEnd: "2030-01-02T07:00:00Z"
  });
  assert.equal(result.status, "manual-review");
  assert.equal(result.windowStart, null);
  assert.equal(result.autoApproved, false);
});

test("Ekadashi parana requires local sunrise, sunset and a valid Dwadashi interval", async () => {
  const { calculateEkadashiParanaWindow } = await import("../festival-observance-rules.mjs");
  const result = calculateEkadashiParanaWindow({ sunrise: "2030-01-02T00:30:00Z" });
  assert.equal(result.status, "insufficient-data");
  assert.equal(result.windowStart, null);
});


test("Nag Panchami selects the later day when Panchami lasts three muhurtas after its sunrise", async () => {
  const { resolveObservanceCandidates } = await import("../festival-observance-rules.mjs");
  const result = resolveObservanceCandidates("nag-panchami", [
    { date: "2026-08-16", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-16T00:30:00Z", sunset: "2026-08-16T12:30:00Z",
      tithis: [interval(3, "2026-08-15T20:00:00Z", "2026-08-16T06:00:00Z", "शुक्ल पक्ष"),
        interval(4, "2026-08-16T06:00:00Z", "2026-08-17T08:30:00Z", "शुक्ल पक्ष")] },
    { date: "2026-08-17", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-17T00:30:00Z", sunset: "2026-08-17T12:30:00Z",
      tithis: [interval(4, "2026-08-16T06:00:00Z", "2026-08-17T03:00:00Z", "शुक्ल पक्ष")] }
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2026-08-17");
  assert.equal(result.selectionBasis, "later-day-panchami-prevails-three-muhurtas-after-sunrise");
  assert.equal(result.autoApproved, false);
});

test("Nag Panchami uses the later day with two muhurtas when earlier Chaturthi exceeded three", async () => {
  const { resolveObservanceCandidates } = await import("../festival-observance-rules.mjs");
  const result = resolveObservanceCandidates("nag-panchami", [
    { date: "2026-08-16", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-16T00:30:00Z", sunset: "2026-08-16T12:30:00Z",
      tithis: [interval(3, "2026-08-15T20:00:00Z", "2026-08-16T03:00:00Z", "शुक्ल पक्ष"),
        interval(4, "2026-08-16T03:00:00Z", "2026-08-17T01:30:00Z", "शुक्ल पक्ष")] },
    { date: "2026-08-17", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-17T00:30:00Z", sunset: "2026-08-17T12:30:00Z",
      tithis: [interval(4, "2026-08-16T03:00:00Z", "2026-08-17T02:06:00Z", "शुक्ल पक्ष")] }
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2026-08-17");
  assert.equal(result.selectionBasis, "later-day-two-muhurta-panchami-with-earlier-chaturthi-over-three-muhurtas");
});

test("Nag Panchami keeps the earlier day when earlier Chaturthi is under three and later Panchami has two", async () => {
  const { resolveObservanceCandidates } = await import("../festival-observance-rules.mjs");
  const result = resolveObservanceCandidates("nag-panchami", [
    { date: "2026-08-16", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-16T00:30:00Z", sunset: "2026-08-16T12:30:00Z",
      tithis: [interval(3, "2026-08-15T20:00:00Z", "2026-08-16T01:30:00Z", "शुक्ल पक्ष"),
        interval(4, "2026-08-16T01:30:00Z", "2026-08-17T01:30:00Z", "शुक्ल पक्ष")] },
    { date: "2026-08-17", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-17T00:30:00Z", sunset: "2026-08-17T12:30:00Z",
      tithis: [interval(4, "2026-08-16T01:30:00Z", "2026-08-17T02:06:00Z", "शुक्ल पक्ष")] }
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2026-08-16");
  assert.equal(result.selectionBasis, "earlier-day-panchami-when-earlier-chaturthi-is-under-three-muhurtas");
});

test("Nag Panchami refuses to guess when later Panchami is shorter than two muhurtas", async () => {
  const { resolveObservanceCandidates } = await import("../festival-observance-rules.mjs");
  const result = resolveObservanceCandidates("nag-panchami", [
    { date: "2026-08-16", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-16T00:30:00Z", sunset: "2026-08-16T12:30:00Z",
      tithis: [interval(3, "2026-08-15T20:00:00Z", "2026-08-16T01:30:00Z", "शुक्ल पक्ष"),
        interval(4, "2026-08-16T01:30:00Z", "2026-08-17T01:00:00Z", "शुक्ल पक्ष")] },
    { date: "2026-08-17", masa: "श्रावण", paksha: "शुक्ल पक्ष",
      sunrise: "2026-08-17T00:30:00Z", sunset: "2026-08-17T12:30:00Z",
      tithis: [interval(4, "2026-08-16T01:30:00Z", "2026-08-17T01:00:00Z", "शुक्ल पक्ष")] }
  ]);
  assert.equal(result.status, "manual-review");
  assert.equal(result.selectedDate, null);
  assert.equal(result.autoApproved, false);
});


const rathaDay = (date, sunrise, tithis) => ({
  date, masa: "माघ", paksha: "शुक्ल पक्ष", sunrise, tithis
});

test("Ratha Saptami selects the first day when Saptami covers both Arunodayas", () => {
  const result = resolveObservanceCandidates("ratha-saptami-review", [
    rathaDay("2030-02-14", "2030-02-14T00:30:00.000Z", [
      interval(6, "2030-02-13T22:00:00.000Z", "2030-02-14T03:00:00.000Z", "शुक्ल पक्ष")
    ]),
    rathaDay("2030-02-15", "2030-02-15T00:31:00.000Z", [
      interval(6, "2030-02-13T22:00:00.000Z", "2030-02-15T03:00:00.000Z", "शुक्ल पक्ष")
    ])
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2030-02-14");
  assert.equal(result.selectionBasis, "dharmasindhu-arunodaya-vyapti-on-two-days-first-day");
  assert.equal(result.autoApproved, false);
});

test("Ratha Saptami selects the unique local Arunodaya day", () => {
  const result = resolveObservanceCandidates("ratha-saptami-review", [
    rathaDay("2030-02-14", "2030-02-14T00:30:00.000Z", [
      interval(5, "2030-02-13T21:00:00.000Z", "2030-02-14T01:00:00.000Z", "शुक्ल पक्ष"),
      interval(6, "2030-02-14T01:00:00.000Z", "2030-02-15T00:00:00.000Z", "शुक्ल पक्ष")
    ]),
    rathaDay("2030-02-15", "2030-02-15T00:31:00.000Z", [
      interval(6, "2030-02-14T01:00:00.000Z", "2030-02-15T00:00:00.000Z", "शुक्ल पक्ष"),
      interval(7, "2030-02-15T00:00:00.000Z", "2030-02-16T02:00:00.000Z", "शुक्ल पक्ष")
    ])
  ]);
  assert.equal(result.selectedDate, "2030-02-15");
  assert.equal(result.selectionBasis, "magha-shukla-saptami-at-local-arunodaya");
  assert.equal(result.autoApproved, false);
});

test("Ratha Saptami applies the Dharmasindhu Shashthi-yukta Kshaya exception", () => {
  const result = resolveObservanceCandidates("ratha-saptami-review", [
    rathaDay("2030-02-14", "2030-02-14T00:30:00.000Z", [
      interval(5, "2030-02-13T21:00:00.000Z", "2030-02-14T00:50:00.000Z", "शुक्ल पक्ष"),
      interval(6, "2030-02-14T00:50:00.000Z", "2030-02-14T22:00:00.000Z", "शुक्ल पक्ष")
    ]),
    rathaDay("2030-02-15", "2030-02-15T00:31:00.000Z", [
      interval(7, "2030-02-14T22:00:00.000Z", "2030-02-15T03:00:00.000Z", "शुक्ल पक्ष")
    ])
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2030-02-14");
  assert.equal(result.selectionBasis, "dharmasindhu-shashthi-yukta-saptami-kshaya-before-next-arunodaya");
  assert.equal(result.autoApproved, false);
});

test("Ratha Saptami refuses the Kshaya exception when Shashthi exceeds one ghati", () => {
  const result = resolveObservanceCandidates("ratha-saptami-review", [
    rathaDay("2030-02-14", "2030-02-14T00:30:00.000Z", [
      interval(5, "2030-02-13T21:00:00.000Z", "2030-02-14T01:00:00.000Z", "शुक्ल पक्ष"),
      interval(6, "2030-02-14T01:00:00.000Z", "2030-02-14T22:00:00.000Z", "शुक्ल पक्ष")
    ]),
    rathaDay("2030-02-15", "2030-02-15T00:31:00.000Z", [
      interval(7, "2030-02-14T22:00:00.000Z", "2030-02-16T02:00:00.000Z", "शुक्ल पक्ष")
    ])
  ]);
  assert.equal(result.status, "manual-review");
  assert.equal(result.selectedDate, null);
  assert.equal(result.autoApproved, false);
});

