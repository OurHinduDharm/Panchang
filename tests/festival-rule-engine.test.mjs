import test from "node:test";
import assert from "node:assert/strict";
import {
  FESTIVAL_RULE_ENGINE_VERSION,
  buildFestivalRuleContexts,
  resolveFestivalObservance,
  resolveFestivalObservanceFromAnnualPanchang
} from "../festival-rule-engine.mjs";

const interval = (index, startTime, endTime, paksha) => ({ index, startTime, endTime, paksha });

test("engine exposes a stable version and resolves an explicit tithi rule year-independently", () => {
  const result = resolveFestivalObservance({
    id: "test-vinayaka",
    dateType: "tithi",
    ruleId: "vinayaka-chaturthi-madhyahna"
  }, 2031, [{
    date: "2031-09-10",
    masa: "भाद्रपद",
    sunrise: "2031-09-10T00:00:00Z",
    sunset: "2031-09-10T12:00:00Z",
    tithis: [interval(3, "2031-09-10T04:00:00Z", "2031-09-10T06:00:00Z", "शुक्ल पक्ष")]
  }]);
  assert.equal(FESTIVAL_RULE_ENGINE_VERSION, "1.0.0");
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-09-10");
  assert.equal(result.ruleId, "vinayaka-chaturthi-madhyahna");
  assert.equal(result.autoApproved, false);
  assert.equal(result.publishable, false);
});

test("unknown or omitted rule IDs never fall back to title matching", () => {
  const noRule = resolveFestivalObservance({
    id: "ram-navami",
    title: "रामनवमी",
    dateType: "tithi"
  }, 2031, []);
  const unknown = resolveFestivalObservance({
    id: "ram-navami",
    title: "रामनवमी",
    dateType: "tithi",
    ruleId: "guess-from-title"
  }, 2031, []);
  assert.equal(noRule.status, "manual-review");
  assert.ok(noRule.warnings.includes("explicit-observance-rule-id-required"));
  assert.equal(unknown.status, "manual-review");
  assert.ok(unknown.warnings.includes("unknown-or-unregistered-rule-id"));
});

test("explicit Gregorian fixed-date exception resolves the requested year only", () => {
  const result = resolveFestivalObservance({
    id: "fixed-remembrance-example",
    dateType: "fixed-gregorian",
    fixedDate: { month: 7, day: 28, source: "user-approved fixed-date reference" }
  }, 2031);
  assert.equal(result.selectedDate, "2031-07-28");
  assert.equal(result.ruleType, "fixed-gregorian");
  assert.equal(result.autoApproved, false);
  assert.equal(result.publishable, false);
});

test("fixed Gregorian exceptions reject missing provenance and impossible leap dates", () => {
  const missingSource = resolveFestivalObservance({
    id: "fixed-without-source",
    dateType: "fixed-gregorian",
    fixedDate: { month: 7, day: 28 }
  }, 2031);
  const leapDay = resolveFestivalObservance({
    id: "leap-day-memory",
    dateType: "fixed-gregorian",
    fixedDate: { month: 2, day: 29, source: "documented source" }
  }, 2031);
  assert.equal(missingSource.status, "manual-review");
  assert.equal(leapDay.status, "manual-review");
  assert.equal(leapDay.selectedDate, null);
});

test("unrecognized date types and invalid years fail closed", () => {
  assert.equal(resolveFestivalObservance({id:"x",dateType:"unknown"},2031).status, "manual-review");
  assert.equal(resolveFestivalObservance({id:"x",dateType:"tithi",ruleId:"ekadashi"},0).status, "insufficient-data");
});


test("annual Panchanga Hindi tithi intervals are adapted to rule-engine indices", () => {
  const contexts = buildFestivalRuleContexts([
    {
      date: "2031-09-10", masa: "भाद्रपद", paksha: "शुक्ल पक्ष",
      sunrise: "2031-09-10T00:00:00Z", sunset: "2031-09-10T12:00:00Z",
      tithiIntervals: [{
        tithi: "चतुर्थी", paksha: "शुक्ल पक्ष",
        startTime: "2031-09-10T04:00:00Z", endTime: "2031-09-10T06:00:00Z"
      }]
    },
    {
      date: "2031-09-11", masa: "भाद्रपद", paksha: "शुक्ल पक्ष",
      sunrise: "2031-09-11T00:01:00Z", sunset: "2031-09-11T12:01:00Z",
      tithiIntervals: [{
        tithi: "पञ्चमी", paksha: "शुक्ल पक्ष",
        startTime: "2031-09-10T22:00:00Z", endTime: "2031-09-11T20:00:00Z"
      }]
    }
  ]);
  assert.equal(contexts[0].tithis[0].index, 3);
  assert.equal(contexts[1].tithis[0].index, 4);
  assert.equal(contexts[1].previousSunrise, "2031-09-10T00:00:00Z");
  assert.equal(contexts[1].previousTithis[0].index, 3);
});

test("annual Panchanga adapter resolves a tithi observance without copying yearly dates", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "ganesh-chaturthi",
    dateType: "tithi",
    ruleId: "vinayaka-chaturthi-madhyahna"
  }, 2031, [{
    date: "2031-09-10", masa: "भाद्रपद", paksha: "शुक्ल पक्ष",
    sunrise: "2031-09-10T00:00:00Z", sunset: "2031-09-10T12:00:00Z",
    tithiIntervals: [{
      tithi: "चतुर्थी", paksha: "शुक्ल पक्ष",
      startTime: "2031-09-10T04:00:00Z", endTime: "2031-09-10T06:00:00Z"
    }]
  }]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-09-10");
  assert.equal(result.autoApproved, false);
  assert.equal(result.publishable, false);
});

test("annual adapter leaves missing moonrise unresolved instead of substituting sunrise", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "sankashti",
    dateType: "tithi",
    ruleId: "sankashti-moonrise"
  }, 2031, [{
    date: "2031-09-10", masa: "भाद्रपद", paksha: "कृष्ण पक्ष",
    sunrise: "2031-09-10T00:00:00Z", sunset: "2031-09-10T12:00:00Z",
    tithiIntervals: [{
      tithi: "चतुर्थी", paksha: "कृष्ण पक्ष",
      startTime: "2031-09-10T04:00:00Z", endTime: "2031-09-10T18:00:00Z"
    }]
  }]);
  assert.equal(result.status, "insufficient-data");
  assert.equal(result.selectedDate, null);
});
