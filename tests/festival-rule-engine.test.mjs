import test from "node:test";
import assert from "node:assert/strict";
import {
  FESTIVAL_RULE_ENGINE_VERSION,
  resolveFestivalObservance
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
