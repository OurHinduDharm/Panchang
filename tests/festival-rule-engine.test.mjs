import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.equal(result.sourceReview, "pending-primary-source-review");
  assert.equal(result.selectionPolicy, "unique-karmakala-match-only");
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
  const contexts = buildFestivalRuleContexts([{
    date: "2031-09-10", masa: "भाद्रपद", paksha: "कृष्ण पक्ष",
    sunrise: "2031-09-10T00:00:00Z", sunset: "2031-09-10T12:00:00Z",
    tithiIntervals: [{
      tithi: "चतुर्थी", paksha: "कृष्ण पक्ष",
      startTime: "2031-09-10T04:00:00Z", endTime: "2031-09-10T18:00:00Z"
    }]
  }]);
  assert.equal(contexts[0].tithis[0].index, 18);
  assert.equal(contexts[0].tithis[0].paksha, "कृष्ण पक्ष");
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


test("annual adapter scopes repeated Ekadashi profile to the explicit target tithi", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "shattila-ekadashi-2031",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    targetTithiIndex: 10
  }, 2031, [
    {
      date: "2031-01-01", masa: "माघ",
      sunrise: "2031-01-01T06:00:00Z", sunset: "2031-01-01T18:00:00Z",
      tithiIntervals: [{ index: 10, startTime: "2031-01-01T05:00:00Z", endTime: "2031-01-01T07:00:00Z" }]
    },
    {
      date: "2031-01-02", masa: "माघ",
      sunrise: "2031-01-02T06:00:00Z", sunset: "2031-01-02T18:00:00Z",
      tithiIntervals: [{ index: 25, startTime: "2031-01-02T05:00:00Z", endTime: "2031-01-02T07:00:00Z" }]
    }
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-01-01");
  assert.equal(result.evaluations.length, 1);
});

test("annual adapter rejects a target tithi outside the selected rule profile", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "invalid-ekadashi",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    targetTithiIndex: 11
  }, 2031, [{
    date: "2031-01-01", masa: "माघ",
    sunrise: "2031-01-01T06:00:00Z", sunset: "2031-01-01T18:00:00Z",
    tithiIntervals: [{ index: 11, startTime: "2031-01-01T05:00:00Z", endTime: "2031-01-01T07:00:00Z" }]
  }]);
  assert.equal(result.status, "manual-review");
  assert.ok(result.warnings.includes("target-tithi-selector-outside-rule-profile"));
});

test("indexed tithi intervals derive paksha when the source omits it", () => {
  const contexts = buildFestivalRuleContexts([{
    date: "2031-01-01", masa: "माघ",
    sunrise: "2031-01-01T06:00:00Z", sunset: "2031-01-01T18:00:00Z",
    tithiIntervals: [{ index: 25, startTime: "2031-01-01T05:00:00Z", endTime: "2031-01-01T07:00:00Z" }]
  }]);
  assert.equal(contexts[0].tithis[0].paksha, "कृष्ण पक्ष");
});


test("annual adapter rejects null, out-of-range, and contradictory indexed tithis", () => {
  const contexts = buildFestivalRuleContexts([{
    date: "2031-01-01", masa: "माघ",
    tithiIntervals: [
      { index: null, startTime: "2031-01-01T00:00:00Z", endTime: "2031-01-01T01:00:00Z" },
      { index: 30, startTime: "2031-01-01T01:00:00Z", endTime: "2031-01-01T02:00:00Z" },
      { index: 25, paksha: "शुक्ल पक्ष", startTime: "2031-01-01T02:00:00Z", endTime: "2031-01-01T03:00:00Z" },
      { index: 25, startTime: "2031-01-01T03:00:00Z", endTime: "2031-01-01T04:00:00Z" }
    ]
  }]);
  assert.deepEqual(contexts[0].tithis.map(row => row.index), [25]);
  assert.equal(contexts[0].tithis[0].paksha, "कृष्ण पक्ष");
});


test("annual adapter resolves Sankashti when local moonrise is supplied", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "sankashti-2031",
    dateType: "tithi",
    ruleId: "sankashti-moonrise",
    targetTithiIndex: 18
  }, 2031, [{
    date: "2031-09-10", masa: "भाद्रपद", paksha: "कृष्ण पक्ष",
    sunrise: "2031-09-10T00:00:00Z",
    sunset: "2031-09-10T12:00:00Z",
    moonrise: "2031-09-10T14:00:00Z",
    tithiIntervals: [{
      index: 18,
      startTime: "2031-09-10T13:00:00Z",
      endTime: "2031-09-10T15:00:00Z"
    }]
  }]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-09-10");
  assert.equal(result.evaluations[0].evidence[0].decisionMoment, "moonrise");
});

test("annual adapter scopes recurring tithis to an explicit lunar month and paksha", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "phalguna-ekadashi-2031",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    lunarMonth: "फाल्गुन",
    paksha: "शुक्ल पक्ष",
    targetTithiIndex: 10
  }, 2031, [
    {
      date: "2031-01-01", masa: "माघ", paksha: "शुक्ल पक्ष",
      sunrise: "2031-01-01T06:00:00Z", sunset: "2031-01-01T18:00:00Z",
      tithiIntervals: [{ index: 10, startTime: "2031-01-01T05:00:00Z", endTime: "2031-01-01T07:00:00Z" }]
    },
    {
      date: "2031-01-31", masa: "फाल्गुन", paksha: "शुक्ल पक्ष",
      sunrise: "2031-01-31T06:00:00Z", sunset: "2031-01-31T18:00:00Z",
      tithiIntervals: [{ index: 9, startTime: "2031-01-31T05:00:00Z", endTime: "2031-01-31T07:00:00Z" }]
    },
    {
      date: "2031-02-01", masa: "फाल्गुन", paksha: "शुक्ल पक्ष",
      sunrise: "2031-02-01T06:00:00Z", sunset: "2031-02-01T18:00:00Z",
      tithiIntervals: [{ index: 10, startTime: "2031-02-01T05:00:00Z", endTime: "2031-02-01T07:00:00Z" }]
    }
  ]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-02-01");
  assert.equal(result.evaluations.length, 1);
});

test("annual adapter accepts an explicit Adhika lunar month but normalizes allowed-month checks", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "adhika-chaturthi-2031",
    dateType: "tithi",
    ruleId: "vinayaka-chaturthi-madhyahna",
    lunarMonth: "अधिक चैत्र",
    paksha: "शुक्ल पक्ष",
    targetTithiIndex: 3
  }, 2031, [{
    date: "2031-05-01", masa: "अधिक चैत्र", paksha: "शुक्ल पक्ष",
    sunrise: "2031-05-01T00:00:00Z", sunset: "2031-05-01T12:00:00Z",
    tithiIntervals: [{ index: 3, startTime: "2031-05-01T04:00:00Z", endTime: "2031-05-01T06:00:00Z" }]
  }]);
  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-05-01");
});




const annual2031MonthFixture = JSON.parse(await readFile(
  new URL("./fixtures/annual-2031-month-kind-days.json", import.meta.url),
  "utf8"
));
const annual2031MonthDays = annual2031MonthFixture.days;

test("real 2031 annual Panchanga defaults named Bhadrapada to the regular month", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "bhadrapada-krishna-ekadashi-2031",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    lunarMonth: "भाद्रपद",
    targetTithiIndex: 25
  }, 2031, annual2031MonthDays);

  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-08-13");
  assert.deepEqual(result.evaluations.map(item => item.date), ["2031-08-12", "2031-08-13"]);
});

test("real 2031 annual Panchanga selects only Adhika Bhadrapada when requested", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "adhika-bhadrapada-krishna-ekadashi-2031",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    lunarMonth: "भाद्रपद",
    monthKind: "adhika",
    targetTithiIndex: 25
  }, 2031, annual2031MonthDays);

  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-09-12");
  assert.deepEqual(result.evaluations.map(item => item.date), ["2031-09-11", "2031-09-12"]);
});

test("real 2031 data with monthKind any exposes both occurrences for manual review", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "bhadrapada-krishna-ekadashi-any-month-kind-2031",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    lunarMonth: "भाद्रपद",
    monthKind: "any",
    targetTithiIndex: 25
  }, 2031, annual2031MonthDays);

  assert.equal(result.status, "manual-review");
  assert.ok(result.warnings.includes("multiple-days-cover-karmakala-explicit-shastriya-tie-break-required"));
  assert.deepEqual(result.evaluations.map(item => item.date), ["2031-08-12", "2031-08-13", "2031-09-11", "2031-09-12"]);
  assert.equal(result.autoApproved, false);
  assert.equal(result.publishable, false);
});

test("an explicitly prefixed Adhika month keeps its exact intercalary meaning by default", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "adhika-bhadrapada-explicit-month-2031",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    lunarMonth: "अधिक भाद्रपद",
    targetTithiIndex: 25
  }, 2031, annual2031MonthDays);

  assert.equal(result.status, "date-selected-needs-source-approval");
  assert.equal(result.selectedDate, "2031-09-12");
  assert.deepEqual(result.evaluations.map(item => item.date), ["2031-09-11", "2031-09-12"]);
});

test("annual adapter fails closed for an unknown monthKind selector", () => {
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id: "invalid-month-kind",
    dateType: "tithi",
    ruleId: "ekadashi-smarta-udaya",
    lunarMonth: "भाद्रपद",
    monthKind: "intercalary",
    targetTithiIndex: 25
  }, 2031, annual2031MonthDays);

  assert.equal(result.status, "manual-review");
  assert.ok(result.warnings.includes("invalid-month-kind-selector"));
  assert.equal(result.selectedDate, null);
  assert.equal(result.publishable, false);
});


test("explicit regular or adhika monthKind requires a named lunar month", () => {
  for (const monthKind of ["regular", "adhika"]) {
    const result = resolveFestivalObservanceFromAnnualPanchang({
      id: "missing-lunar-month-" + monthKind,
      dateType: "tithi",
      ruleId: "ekadashi-smarta-udaya",
      monthKind,
      targetTithiIndex: 25
    }, 2031, annual2031MonthDays);
    assert.equal(result.status, "manual-review");
    assert.ok(result.warnings.includes("lunar-month-required-for-month-kind-selector"));
    assert.equal(result.selectedDate, null);
    assert.equal(result.publishable, false);
  }
});

test("an explicit regular or any selector cannot contradict an Adhika-prefixed month name", () => {
  for (const monthKind of ["regular", "any"]) {
    const result = resolveFestivalObservanceFromAnnualPanchang({
      id: "conflicting-month-selector-" + monthKind,
      dateType: "tithi",
      ruleId: "ekadashi-smarta-udaya",
      lunarMonth: "अधिक भाद्रपद",
      monthKind,
      targetTithiIndex: 25
    }, 2031, annual2031MonthDays);
    assert.equal(result.status, "manual-review");
    assert.ok(result.warnings.includes("conflicting-month-kind-and-prefixed-lunar-month"));
    assert.equal(result.selectedDate, null);
    assert.equal(result.publishable, false);
  }
});

test("Ratha Saptami sees Arunodaya in the previous sunrise partition in the 2030 annual export", async () => {
  const observance = {
    id: "ratha-saptami",
    dateType: "tithi",
    ruleId: "ratha-saptami-review",
    lunarMonth: "माघ",
    paksha: "शुक्ल पक्ष",
    targetTithiIndex: 6
  };
  const annual = JSON.parse(await readFile(
    new URL("../data/ohd-annual-panchang-review-2030.json", import.meta.url), "utf8"
  ));
  const result = resolveFestivalObservanceFromAnnualPanchang(observance, 2030, annual.dailyPanchang);
  assert.equal(result.selectedDate, "2030-02-09");
  assert.equal(result.selectionBasis, "magha-shukla-saptami-at-local-arunodaya");
  assert.equal(result.publishable, false);
});


test("2030 Pithoragarh Vikata Sankashti uses the documented no-moonrise-coverage fallback", async () => {
  const annual = JSON.parse(await readFile(
    new URL("../data/ohd-annual-panchang-review-2030.json", import.meta.url), "utf8"
  ));
  const result = resolveFestivalObservanceFromAnnualPanchang({
    id:"vikata-sankashti", dateType:"tithi", ruleId:"sankashti-moonrise",
    lunarMonth:"वैशाख", paksha:"कृष्ण पक्ष", targetTithiIndex:18
  }, 2030, annual.dailyPanchang);
  assert.equal(result.selectedDate,"2030-04-21");
  assert.equal(result.selectionBasis,"dharmasindhu-neither-moonrise-later-day");
  assert.equal(result.publishable,false);
});

test("annual Ekadashi adapter recognizes real Mohini Trisprisha and selects only an explicit householder policy",async()=>{
 const annual=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2030.json",import.meta.url),"utf8"));
 const descriptor={id:"mohini",dateType:"tithi",ruleId:"ekadashi-smarta-udaya",lunarMonth:"वैशाख",paksha:"शुक्ल पक्ष",targetTithiIndex:10};
 const unresolved=resolveFestivalObservanceFromAnnualPanchang(descriptor,2030,annual.dailyPanchang);
 assert.equal(unresolved.status,"manual-review");
 assert.equal(unresolved.selectedDate,null);
 assert.equal(unresolved.evaluations[0].candidates.smartaHouseholderEarlier,"2030-05-13");
 const result=resolveFestivalObservanceFromAnnualPanchang({...descriptor,ekadashiTradition:"smarta-householder"},2030,annual.dailyPanchang);
 assert.equal(result.selectedDate,"2030-05-13");
 assert.equal(result.selectionBasis,"dharmasindhu-ekadashi-only-vriddhi-smarta-householder-earlier");
 assert.equal(result.publishable,false);
 assert.equal(result.autoApproved,false);
 assert.ok(result.warnings.includes("trisprisha-householder-date-only-special-parana-review-required"));
});

test("2030 annual Mohini resolver respects explicitly scoped later Vaishnava and Mumukshu selection",async()=>{
 const annual=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2030.json",import.meta.url),"utf8"));
 const descriptor={id:"mohini",dateType:"tithi",ruleId:"ekadashi-smarta-udaya",lunarMonth:"वैशाख",paksha:"शुक्ल पक्ष",targetTithiIndex:10};
 for(const ekadashiTradition of ["vaishnava","smarta-mumukshu"]){
   const result=resolveFestivalObservanceFromAnnualPanchang({...descriptor,ekadashiTradition},2030,annual.dailyPanchang);
   assert.equal(result.selectedDate,"2030-05-14");
   assert.equal(result.publishable,false);
   assert.equal(result.autoApproved,false);
   assert.ok(result.warnings.includes("trisprisha-special-parana-review-required"));
 }
});

test("Shukla Manvadi separates intercalary shraddha and blocks an incomplete cycle", async () => {
  const {resolveAnnualShuklaManvadi} = await import("../festival-rule-engine.mjs");
  const {readFile} = await import("node:fs/promises");
  const annual = JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2031.json",import.meta.url)));
  const result = resolveAnnualShuklaManvadi(annual.dailyPanchang);
  const rudra = result.filter(r => r.name === "रुद्रसावर्णि");
  assert.deepEqual(rudra.map(r => [r.monthKind,r.selectedDate]), [
    ["adhika","2031-08-21"],["regular","2031-09-19"]
  ]);
  const daksha = result.find(r => r.name === "दक्षसावर्णि");
  assert.equal(daksha.selectedDate,"2031-10-24");
  assert.equal(daksha.publishable,false);
  const broken = annual.dailyPanchang.filter(d => d.date !== "2031-10-23");
  assert.equal(resolveAnnualShuklaManvadi(broken).find(r=>r.name==="दक्षसावर्णि").selectedDate,null);
});

test("catalogue scope distinguishes ISKCON from general Vaishnava observances", async () => {
  const {inPublicFestivalScope} = await import("../festival-public-scope.mjs");
  for (const item of ["इस्कॉन एकादशी",{name:"ISKCON Janmashtami"},
    {title:"एकादशी",tradition:"iskcon"},{title:"एकादशी",articleLabel:"इस्कोन"}])
    assert.equal(inPublicFestivalScope(item),false);
  assert.equal(inPublicFestivalScope({title:"वैष्णव एकादशी"}),true);
});
