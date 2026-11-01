import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDwadashiCalendar, buildChaturmasProposal, buildAnnualDwadashiPackage } from "../dwadashi-calendar.mjs";

const rules = {
  unifiedTithiIndex: {
    tithis: [
      { month:"चैत्र", paksha:"शुक्ल", displayNames:["मदन द्वादशी","भर्तृ द्वादशी","वामन द्वादशी"], observances:[{id:"madana",name:"मदन द्वादशी"},{id:"bhartr",name:"भर्तृ द्वादशी"}] }
    ]
  }
};

test("master catalogue contains named records for all 24 regular month-paksha Dwadashis", async () => {
  const catalogFile=JSON.parse(await readFile(new URL("../data/dwadashi-vrata-rules.json",import.meta.url),"utf8"));
  const entries=catalogFile.unifiedTithiIndex.tithis;
  const regular=entries.filter(item=>!item.adhika);
  const pairs=new Set(regular.map(item=>item.month+"|"+item.paksha));
  assert.equal(pairs.size,24);
  assert.ok(regular.every(item=>(Array.isArray(item.displayNames)&&item.displayNames.length>0)||(Array.isArray(item.crossReferences)&&item.crossReferences.length>0)));
  assert.ok(entries.some(item=>item.id==="jyeshtha-krishna-adhika"&&item.displayNames.includes("अधिक कृष्ण रामलक्ष्मण द्वादशी")));
  assert.ok(entries.some(item=>item.id==="jyeshtha-shukla-adhika"&&item.conditionalObservances?.some(x=>x.id==="unmilini")));
});

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
  const record=result.tithis.find(item=>item.id==="chaitra-shukla");
  assert.equal(record.selectedDate,"2026-04-01");
  assert.equal(record.dateSelection,"single-observation-candidate-review-required");
  assert.equal(record.status,"needs-review");
});

test("noon-only Dwadashi is retained as a candidate without pretending it prevailed at sunrise", () => {
  const day = sunriseDay("2026-04-01","चैत्र","शुक्ल","एकादशी");
  day.tithi = "द्वादशी";
  day.tithiStartTime = "2026-04-01T08:00:00.000Z";
  day.tithiEndTime = "2026-04-02T03:00:00.000Z";
  const result = buildDwadashiCalendar([day],rules);
  const record=result.tithis.find(item=>item.id==="chaitra-shukla");
  assert.deepEqual(record.sunriseDates,[]);
  assert.deepEqual(record.noonDates,["2026-04-01"]);
  assert.deepEqual(record.candidateDates,["2026-04-01"]);
  assert.equal(record.selectedDate,"2026-04-01");
});

test("permanent month-paksha names are carried into later annual calendars", () => {
  const result = buildDwadashiCalendar([
    sunriseDay("2027-04-01","चैत्र","शुक्ल","द्वादशी")
  ],rules);
  const record=result.tithis.find(item=>item.id==="chaitra-shukla");
  assert.deepEqual(record.displayNames,["मदन द्वादशी","भर्तृ द्वादशी","वामन द्वादशी"]);
  assert.deepEqual(record.drik2026Labels, []);
});

test("Adhika month stays separate and does not inherit nija-month vrata aliases", () => {
  const result = buildDwadashiCalendar([
    sunriseDay("2026-08-01","श्रावण","शुक्ल","द्वादशी",true)
  ],rules);
  const record=result.tithis.find(item=>item.id==="shravana-shukla-adhika");
  assert.equal(record.adhika,true);
  assert.deepEqual(record.displayNames,[]);
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
  assert.equal(result.phases[3].endDate,"2026-11-21");
  assert.equal(result.completionDate,"2026-11-22");
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

test("annual Dwadashi candidates exclude dates outside the selected Gregorian year", () => {\n  const paushaRules = { unifiedTithiIndex: { tithis:[{month:"पौष",paksha:"शुक्ल",observances:[{name:"सुजन्न-द्वादशी"}]},{month:"पौष",paksha:"कृष्ण",observances:[{name:"रूप-द्वादशी"}]}] } };\n  const result = buildDwadashiCalendar([\n    sunriseDay("2026-01-01","माघ","कृष्ण","प्रतिपदा"),\n    sunriseDay("2025-12-25","पौष","शुक्ल","द्वादशी"),\n    sunriseDay("2027-01-04","पौष","कृष्ण","द्वादशी")\n  ], paushaRules);\n  assert.equal(result.year, 2026);\n  const shukla = result.tithis.find(item => item.id === "pausha-shukla");\n  const krishna = result.tithis.find(item => item.id === "pausha-krishna");\n  assert.deepEqual(shukla.candidateDates, []);\n  assert.deepEqual(krishna.candidateDates, []);\n  assert.equal(shukla.status, "needs-observation");\n});\n\ntest("permanent month-paksha names remain the same in every year, including Adhika Jyeshtha and Ashadha Krishna", () => {
  const master = [
    {id:"vaishakha-krishna",month:"वैशाख",paksha:"कृष्ण",observances:[],displayNames:["कृष्ण-वामन द्वादशी"]},
    {id:"jyeshtha-krishna",month:"ज्येष्ठ",paksha:"कृष्ण",observances:[],displayNames:["कृष्ण परशुराम द्वादशी"]},
    {id:"jyeshtha-shukla",month:"ज्येष्ठ",paksha:"शुक्ल",observances:[],displayNames:["त्रिविक्रम द्वादशी","रामलक्ष्मण द्वादशी","चम्पक द्वादशी"],conditionalObservances:[{id:"pakshavardhini",name:"पक्षवर्द्धिनी महाद्वादशी"}]},
    {id:"jyeshtha-shukla-adhika",month:"ज्येष्ठ",paksha:"शुक्ल",adhika:true,observances:[],displayNames:["अधिक रामलक्ष्मण द्वादशी"],conditionalObservances:[{id:"unmilini",name:"उन्मीलिनी महाद्वादशी"}]},
    {id:"jyeshtha-krishna-adhika",month:"ज्येष्ठ",paksha:"कृष्ण",adhika:true,observances:[],displayNames:["अधिक कृष्ण रामलक्ष्मण द्वादशी"]},
    {id:"ashadha-krishna",month:"आषाढ़",paksha:"कृष्ण",observances:[],displayNames:["कृष्ण रामलक्ष्मण द्वादशी"],conditionalObservances:[{id:"trishprisha",name:"त्रिस्पर्शा महाद्वादशी"}]}
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

test("Mahadwadashi labels are conditional, not permanent month-paksha display names", async () => {
  const catalogFile=JSON.parse(await readFile(new URL("../data/dwadashi-vrata-rules.json",import.meta.url),"utf8"));
  const byId=Object.fromEntries(catalogFile.unifiedTithiIndex.tithis.map(item=>[item.id,item]));
  for (const [id,label] of [
    ["jyeshtha-shukla","पक्षवर्द्धिनी महाद्वादशी"],
    ["shravana-shukla","वंजुली महाद्वादशी"],
    ["jyeshtha-shukla-adhika","उन्मीलिनी महाद्वादशी"],
    ["ashadha-krishna","त्रिस्पर्शा महाद्वादशी"]
  ]) {
    assert.ok(!byId[id].displayNames.includes(label));
    assert.ok(byId[id].conditionalObservances?.some(item=>item.name===label));
  }
  assert.ok(!byId["bhadrapada-shukla"].displayNames.includes("विष्णुशृंखला योग द्वादशी"));
  assert.ok(byId["bhadrapada-shukla"].crossReferences?.some(item=>item.name==="विष्णुशृंखला योग द्वादशी"));
  assert.equal(catalogFile.mahaDwadashi.sourceVariants.find(item=>item.id==="naradaPurana").criteria.jaya,"शुक्ल द्वादशी + मघा");
  assert.equal(catalogFile.mahaDwadashi.sourceVariants.find(item=>item.id==="nirnayaSindhu").criteria.jaya,"शुक्ल द्वादशी + पुष्य");
});

test("annual Dwadashi output keeps conditional names separate from display names", () => {
  const fixture={unifiedTithiIndex:{tithis:[
    {id:"test",month:"ज्येष्ठ",paksha:"शुक्ल",displayNames:["त्रिविक्रम द्वादशी"],observances:[],conditionalObservances:[{id:"jaya",name:"जया महाद्वादशी"}]}
  ]}};
  const result=buildDwadashiCalendar([sunriseDay("2026-06-01","ज्येष्ठ","शुक्ल","द्वादशी")],fixture);
  const record=result.tithis.find(item=>item.id==="jyeshtha-shukla");
  assert.deepEqual(record.displayNames,["त्रिविक्रम द्वादशी"]);
  assert.deepEqual(record.conditionalObservances,[{id:"jaya",name:"जया महाद्वादशी"}]);
});

test("Drik 2026 cross-reference labels remain metadata and are year-gated", () => {
  const rulesWithDrik = {
    unifiedTithiIndex: {
      tithis: [{
        month: "ज्येष्ठ",
        paksha: "कृष्ण",
        adhika: false,
        displayNames: ["कृष्ण-वामन द्वादशी"],
        observances: []
      }]
    },
    drik2026Calendar: [{
      month: "ज्येष्ठ",
      paksha: "कृष्ण",
      adhika: false,
      referenceDate: "2026-05-13",
      labels: ["कृष्ण परशुराम द्वादशी"]
    }]
  };
  const y2026 = buildDwadashiCalendar([
    sunriseDay("2026-05-13","ज्येष्ठ","कृष्ण","द्वादशी")
  ], rulesWithDrik);
  const record2026 = y2026.tithis.find(item => item.id === "jyeshtha-krishna");
  assert.equal(record2026.referenceDate, "2026-05-13");
  assert.deepEqual(record2026.drik2026Labels, ["कृष्ण परशुराम द्वादशी"]);
  assert.deepEqual(record2026.displayNames, ["कृष्ण-वामन द्वादशी"]);
  assert.ok(!record2026.displayNames.includes("कृष्ण परशुराम द्वादशी"));

  const y2027 = buildDwadashiCalendar([
    sunriseDay("2027-05-02","ज्येष्ठ","कृष्ण","द्वादशी")
  ], rulesWithDrik);
  const record2027 = y2027.tithis.find(item => item.id === "jyeshtha-krishna");
  assert.equal(record2027.referenceDate, null);
  assert.deepEqual(record2027.drik2026Labels, []);
  assert.deepEqual(record2027.displayNames, ["कृष्ण-वामन द्वादशी"]);

  const emptyScan = buildDwadashiCalendar([], rulesWithDrik);
  const emptyRecord = emptyScan.tithis.find(item => item.id === "jyeshtha-krishna");
  assert.ok(emptyRecord, "The review catalog row may remain visible without a local observation");
  assert.deepEqual(emptyRecord.candidateDates, []);
  assert.equal(emptyRecord.referenceDate, null);
  assert.deepEqual(emptyRecord.drik2026Labels, [], "A Drik reference alone must not invent a local Dwadashi date");
});
