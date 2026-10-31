import test from "node:test";
import assert from "node:assert/strict";
import { buildDwadashiCalendar, buildChaturmasProposal, buildAnnualDwadashiPackage } from "../dwadashi-calendar.mjs";

const rules = {
  unifiedTithiIndex: {
    tithis: [
      { month:"चैत्र", paksha:"शुक्ल", displayNames:["मदन द्वादशी","भर्तृ द्वादशी","मदन द्वादशी"], drik2026Labels:["मदन द्वादशी","वामन द्वादशी"], observances:[{id:"madana",name:"मदन द्वादशी"},{id:"bhartr",name:"भर्तृ द्वादशी"}] }
    ]
  }
};

const sunriseDay = (date, month, paksha, tithi, adhika=false) => ({
  date,
  masa: (adhika ? "अधिक " : "") + month,
  paksha: paksha + " पक्ष",
  tithi,
  sunriseTithi: { masa:(adhika ? "अधिक " : "") + month, paksha:paksha + " पक्ष", tithi }
});

test("one month-paksha Dwadashi record retains names without guessing when sunrise repeats", () => {
  const days = [
    sunriseDay("2026-04-01","चैत्र","शुक्ल","द्वादशी"),
    sunriseDay("2026-04-02","चैत्र","शुक्ल","द्वादशी")
  ];
  const result = buildDwadashiCalendar(days,rules);
  assert.equal(result.tithis.length,1);
  assert.equal(result.tithis[0].selectedDate,null);
  assert.equal(result.tithis[0].dateSelection,"requires-vrata-specific-rule");
  assert.deepEqual(result.tithis[0].sunriseDates,["2026-04-01","2026-04-02"]);
  assert.deepEqual(result.tithis[0].candidateDates,["2026-04-01","2026-04-02"]);
  assert.deepEqual(result.tithis[0].displayNames,["मदन द्वादशी","भर्तृ द्वादशी","वामन द्वादशी"]);
  assert.deepEqual(result.tithiDates.map(item=>item.date),["2026-04-01","2026-04-02"]);
  assert.equal(result.tithiDates[0].observedAtSunrise,true);
});



test("annual tithi date index keeps Shukla and Krishna Dwadashi observations separately", () => {
  const result = buildDwadashiCalendar([
    sunriseDay("2026-04-01","चैत्र","शुक्ल","द्वादशी"),
    sunriseDay("2026-04-15","चैत्र","कृष्ण","द्वादशी")
  ],rules);
  assert.equal(result.tithiDates.length,2);
  assert.deepEqual(result.tithiDates.map(item=>item.paksha),["शुक्ल","कृष्ण"]);
  assert.ok(result.tithiDates.every(item=>item.tithi==="द्वादशी"&&item.observedAtSunrise));
});

test("a single sunrise date remains a candidate until a vrata rule is reviewed", () => {
  const result = buildDwadashiCalendar([
    sunriseDay("2026-04-01","चैत्र","शुक्ल","द्वादशी")
  ],rules);
  assert.equal(result.tithis[0].selectedDate,"2026-04-01");
  assert.equal(result.tithis[0].dateSelection,"single-observation-candidate-review-required");
  assert.equal(result.tithis[0].status,"needs-review");
});

test("noon-only Dwadashi is retained as a candidate without pretending it prevailed at sunrise", () => {
  const day = sunriseDay("2026-04-01","चैत्र","शुक्ल","एकादशी");
  day.tithi = "द्वादशी";
  day.tithiStartTime = "2026-04-01T08:00:00.000Z";
  day.tithiEndTime = "2026-04-02T03:00:00.000Z";
  const result = buildDwadashiCalendar([day],rules);
  assert.deepEqual(result.tithis[0].sunriseDates,[]);
  assert.deepEqual(result.tithis[0].noonDates,["2026-04-01"]);
  assert.deepEqual(result.tithis[0].candidateDates,["2026-04-01"]);
  assert.equal(result.tithis[0].selectedDate,"2026-04-01");
});

test("Drik 2026 labels are not carried into later annual calendars", () => {
  const result = buildDwadashiCalendar([
    sunriseDay("2027-04-01","चैत्र","शुक्ल","द्वादशी")
  ],rules);
  assert.deepEqual(result.tithis[0].displayNames,["मदन द्वादशी","भर्तृ द्वादशी"]);
  assert.deepEqual(result.tithis[0].drik2026Labels,[]);
});

test("Adhika month stays separate and does not inherit nija-month vrata aliases", () => {
  const result = buildDwadashiCalendar([
    sunriseDay("2026-08-01","श्रावण","शुक्ल","द्वादशी",true)
  ],rules);
  assert.equal(result.tithis[0].adhika,true);
  assert.deepEqual(result.tithis[0].displayNames,[]);
});

test("Chaturmas uses the first sunrise-observed date for each boundary", () => {
  const days = [
    sunriseDay("2026-07-25","आषाढ़","शुक्ल","एकादशी"),
    sunriseDay("2026-08-24","श्रावण","शुक्ल","द्वादशी"),
    sunriseDay("2026-08-25","श्रावण","शुक्ल","द्वादशी"),
    sunriseDay("2026-09-23","भाद्रपद","शुक्ल","द्वादशी"),
    sunriseDay("2026-10-23","आश्विन","शुक्ल","द्वादशी"),
    sunriseDay("2026-11-20","कार्तिक","शुक्ल","एकादशी")
  ];
  const result = buildChaturmasProposal(days,{name:"Pithoragarh",latitude:29.58,longitude:80.22,elevation:1650});
  assert.equal(result.status,"needs-review");
  assert.equal(result.selectionMethod,"udayavyapini-smarta-first-sunrise");
  assert.equal(result.boundaries[1].selectedDate,"2026-08-24");
  assert.deepEqual(result.phases.map(x=>x.startDate),["2026-07-25","2026-08-24","2026-09-23","2026-10-23"]);
  assert.equal(result.endDate,"2026-11-20");
  assert.equal(result.cardVisibleThroughDate,"2026-11-22");
  assert.match(result.rulesArticleUrl,/About-Chaaturmaas/);
});

test("missing Chaturmas boundary is marked incomplete, never guessed", () => {
  const result = buildChaturmasProposal([
    sunriseDay("2026-07-25","आषाढ़","शुक्ल","एकादशी")
  ]);
  assert.equal(result.status,"incomplete");
  assert.equal(result.phases.length,0);
  assert.equal(result.startDate,null);
  assert.equal(result.missingBoundaries.length,4);
});

test("annual package is explicitly review-only", () => {
  const result = buildAnnualDwadashiPackage([],rules,{name:"Pithoragarh",latitude:29.58,longitude:80.22,elevation:1650});
  assert.equal(result.status,"needs-review");
  assert.equal(result.calculationStatus,"panchang-engine-calculated");
  assert.equal(result.chaturmas.status,"incomplete");
});


test("2026 Drik aliases attach to the exact nija and adhika Jyeshtha records", () => {
  const rulesWith2026 = {
    unifiedTithiIndex: { tithis: [] },
    drik2026Calendar: [
      {month:"ज्येष्ठ",paksha:"कृष्ण",adhika:false,labels:["कृष्ण परशुराम द्वादशी"]},
      {month:"ज्येष्ठ",paksha:"शुक्ल",adhika:true,labels:["उन्मीलिनी महाद्वादशी","अधिक रामलक्ष्मण द्वादशी"]},
      {month:"ज्येष्ठ",paksha:"कृष्ण",adhika:true,labels:["अधिक कृष्ण रामलक्ष्मण द्वादशी"]},
      {month:"ज्येष्ठ",paksha:"शुक्ल",adhika:false,labels:["पक्षवर्द्धिनी महाद्वादशी","रामलक्ष्मण द्वादशी","चम्पक द्वादशी"]}
    ]
  };
  const result = buildDwadashiCalendar([
    sunriseDay("2026-05-14","ज्येष्ठ","कृष्ण","द्वादशी"),
    sunriseDay("2026-05-28","ज्येष्ठ","शुक्ल","द्वादशी",true),
    sunriseDay("2026-06-12","ज्येष्ठ","कृष्ण","द्वादशी",true),
    sunriseDay("2026-06-26","ज्येष्ठ","शुक्ल","द्वादशी")
  ], rulesWith2026);
  const byId = Object.fromEntries(result.tithis.map(item => [item.id,item]));
  assert.deepEqual(byId["jyeshtha-krishna"].displayNames,["कृष्ण परशुराम द्वादशी"]);
  assert.deepEqual(byId["jyeshtha-shukla-adhika"].displayNames,["उन्मीलिनी महाद्वादशी","अधिक रामलक्ष्मण द्वादशी"]);
  assert.deepEqual(byId["jyeshtha-krishna-adhika"].displayNames,["अधिक कृष्ण रामलक्ष्मण द्वादशी"]);
  assert.deepEqual(byId["jyeshtha-shukla"].displayNames,["पक्षवर्द्धिनी महाद्वादशी","रामलक्ष्मण द्वादशी","चम्पक द्वादशी"]);
});

test("Drik aliases do not leak between adhika and nija months", () => {
  const result = buildDwadashiCalendar([
    sunriseDay("2026-05-14","ज्येष्ठ","कृष्ण","द्वादशी"),
    sunriseDay("2026-06-12","ज्येष्ठ","कृष्ण","द्वादशी",true)
  ], {
    unifiedTithiIndex:{tithis:[]},
    drik2026Calendar:[
      {month:"ज्येष्ठ",paksha:"कृष्ण",adhika:false,labels:["कृष्ण परशुराम द्वादशी"]},
      {month:"ज्येष्ठ",paksha:"कृष्ण",adhika:true,labels:["अधिक कृष्ण रामलक्ष्मण द्वादशी"]}
    ]
  });
  assert.deepEqual(result.tithis.find(x=>!x.adhika).displayNames,["कृष्ण परशुराम द्वादशी"]);
  assert.deepEqual(result.tithis.find(x=>x.adhika).displayNames,["अधिक कृष्ण रामलक्ष्मण द्वादशी"]);
});
