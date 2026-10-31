import test from "node:test";
import assert from "node:assert/strict";
import { buildDwadashiCalendar, buildChaturmasProposal, buildAnnualDwadashiPackage } from "../dwadashi-calendar.mjs";

const rules = {
  unifiedTithiIndex: {
    tithis: [
      { month:"चैत्र", paksha:"शुक्ल", displayNames:["मदन द्वादशी","भर्तृ द्वादशी","वामन द्वादशी"], observances:[{id:"madana",name:"मदन द्वादशी"},{id:"bhartr",name:"भर्तृ द्वादशी"}] }
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
  const record = result.tithis.find(item => item.id === "chaitra-shukla");
  assert.equal(result.tithis.filter(item => item.candidateDates.length).length,1);
  assert.equal(record.selectedDate,null);
  assert.equal(record.dateSelection,"requires-vrata-specific-rule");
  assert.deepEqual(record.sunriseDates,["2026-04-01","2026-04-02"]);
  assert.deepEqual(record.candidateDates,["2026-04-01","2026-04-02"]);
  assert.deepEqual(record.displayNames,["मदन द्वादशी","भर्तृ द्वादशी","वामन द्वादशी"]);
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
    {
      date:"2026-11-20", masa:"कार्तिक", paksha:"शुक्ल पक्ष", tithi:"एकादशी",
      sunrise:"2026-11-20T01:07:00.000Z",
      tithiStartTime:"2026-11-20T01:15:00.000Z",
      tithiEndTime:"2026-11-21T01:01:00.000Z",
      sunriseTithi:{masa:"कार्तिक",paksha:"शुक्ल पक्ष",tithi:"दशमी"}
    },
    {
      date:"2026-11-21", masa:"कार्तिक", paksha:"शुक्ल पक्ष", tithi:"द्वादशी",
      sunrise:"2026-11-21T01:08:00.000Z",
      sunriseTithi:{masa:"कार्तिक",paksha:"शुक्ल पक्ष",tithi:"द्वादशी"}
    }
  ];
  const result = buildChaturmasProposal(days,{name:"Pithoragarh",latitude:29.58,longitude:80.22,elevation:1650});
  assert.equal(result.status,"needs-review");
  assert.equal(result.selectionMethod,"udayavyapini-smarta-first-sunrise-with-kartik-ekadashi-vrata-rule");
  assert.equal(result.boundaries[1].selectedDate,"2026-08-24");
  assert.deepEqual(result.phases.map(x=>x.startDate),["2026-07-25","2026-08-24","2026-09-23","2026-10-23"]);
  assert.equal(result.endDate,"2026-11-20");
  assert.equal(result.boundaries[4].selectionBasis,"smarta-ekadashi-between-sunrises");
  assert.equal(result.boundaries[4].observations[0].basis,"smarta-ekadashi-between-sunrises");
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


test("Pausha Krishna and Shukla records remain visible when outside the scan window", () => {
  const paushaRules = {
    unifiedTithiIndex: {tithis:[
      {month:"पौष",paksha:"कृष्ण",observances:[{name:"रूप-व्रत"}]},
      {month:"पौष",paksha:"शुक्ल",observances:[{name:"सुजन्न-द्वादशी"},{name:"कूर्म-द्वादशी"}]}
    ]}
  };
  const result = buildDwadashiCalendar([
    sunriseDay("2026-01-01","माघ","कृष्ण","प्रतिपदा")
  ], paushaRules);
  const krishna = result.tithis.find(x => x.id === "pausha-krishna");
  const shukla = result.tithis.find(x => x.id === "pausha-shukla");
  assert.ok(krishna);
  assert.ok(shukla);
  assert.deepEqual(krishna.candidateDates, []);
  assert.deepEqual(shukla.candidateDates, []);
  assert.equal(krishna.status, "needs-observation");
  assert.equal(shukla.status, "needs-observation");
  assert.ok(krishna.displayNames.includes("रूप-व्रत"));
  assert.ok(shukla.displayNames.includes("कूर्म-द्वादशी"));
});

test("permanent month-paksha names remain the same in every year, including Adhika Jyeshtha and Ashadha Krishna", () => {
  const master = [
    {id:"vaishakha-krishna",month:"वैशाख",paksha:"कृष्ण",observances:[],displayNames:["कृष्ण-वामन द्वादशी"]},
    {id:"jyeshtha-krishna",month:"ज्येष्ठ",paksha:"कृष्ण",observances:[],displayNames:["कृष्ण परशुराम द्वादशी"]},
    {id:"jyeshtha-shukla",month:"ज्येष्ठ",paksha:"शुक्ल",observances:[],displayNames:["त्रिविक्रम द्वादशी","रामलक्ष्मण द्वादशी","पक्षवर्द्धिनी महाद्वादशी","चम्पक द्वादशी"]},
    {id:"jyeshtha-shukla-adhika",month:"ज्येष्ठ",paksha:"शुक्ल",adhika:true,observances:[],displayNames:["उन्मीलिनी महाद्वादशी","अधिक रामलक्ष्मण द्वादशी"]},
    {id:"jyeshtha-krishna-adhika",month:"ज्येष्ठ",paksha:"कृष्ण",adhika:true,observances:[],displayNames:["अधिक कृष्ण रामलक्ष्मण द्वादशी"]},
    {id:"ashadha-krishna",month:"आषाढ़",paksha:"कृष्ण",observances:[],displayNames:["त्रिस्पर्शा महाद्वादशी","कृष्ण रामलक्ष्मण द्वादशी"]}
  ];
  const refs = [
    {month:"ज्येष्ठ",paksha:"कृष्ण",adhika:false,referenceDate:"2026-05-13"},
    {month:"ज्येष्ठ",paksha:"शुक्ल",adhika:true,referenceDate:"2026-05-27"},
    {month:"ज्येष्ठ",paksha:"कृष्ण",adhika:true,referenceDate:"2026-06-12"},
    {month:"ज्येष्ठ",paksha:"शुक्ल",adhika:false,referenceDate:"2026-06-26"},
    {month:"आषाढ़",paksha:"कृष्ण",adhika:false,referenceDate:"2026-07-11"}
  ];
  const make = year => buildDwadashiCalendar([
    sunriseDay(year+"-01-01","माघ","कृष्ण","प्रतिपदा")
  ], {unifiedTithiIndex:{tithis:master},drik2026Calendar:refs});
  const y2026=make(2026), y2027=make(2027);
  for (const id of ["vaishakha-krishna","jyeshtha-krishna","jyeshtha-shukla","jyeshtha-shukla-adhika","jyeshtha-krishna-adhika","ashadha-krishna"]) {
    assert.deepEqual(y2026.tithis.find(x=>x.id===id).displayNames,y2027.tithis.find(x=>x.id===id).displayNames);
  }
  assert.equal(y2026.tithis.find(x=>x.id==="ashadha-krishna").referenceDate,"2026-07-11");
  assert.equal(y2027.tithis.find(x=>x.id==="ashadha-krishna").referenceDate,null);
  assert.equal(y2026.tithis.find(x=>x.id==="jyeshtha-shukla-adhika").adhika,true);
});

test("annual reference dates do not provide or override permanent Dwadashi names", () => {
  const master=[{id:"pausha-krishna",month:"पौष",paksha:"कृष्ण",displayNames:["रूप-व्रत"],observances:[]}];
  const result=buildDwadashiCalendar([
    sunriseDay("2027-01-01","पौष","कृष्ण","द्वादशी")
  ],{unifiedTithiIndex:{tithis:master},drik2026Calendar:[
    {month:"पौष",paksha:"कृष्ण",adhika:false,referenceDate:"2026-12-01"}
  ]});
  const pausha=result.tithis.find(x=>x.id==="pausha-krishna");
  assert.deepEqual(pausha.displayNames,["रूप-व्रत"]);
  assert.equal(pausha.referenceDate,null);
});
