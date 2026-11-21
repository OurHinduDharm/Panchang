import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("annual review scans the Panchang engine at each local sunrise", async () => {
  const html = await read("festival-year-review.html");
  assert.match(html, /calendarType:"purnimanta"/);
  assert.equal((html.match(/calendarType:"purnimanta"/g)||[]).length, 2);
  assert.match(html, /buildAnnualDwadashiPackage/);
  assert.match(html, /getPanchangam\(new Date\(dayRecord\.sunrise\),observer/);
  assert.match(html, /const dwadashiScanDays=yearDays\+31/);
  assert.match(html, /dwadashiDays\.push\(dayRecord\)/);
  assert.match(html, /buildAnnualDwadashiPackage\(dwadashiDays,dwadashiRules/);
  assert.match(html, /inScannedJanuary=chosen&&chosen\.startsWith\(String\(meta\.year\+1\)\+"-01-"\)/);
  assert.match(html, /पंचांग संदर्भ तारीख़/);
  assert.match(html, /sunriseTithi=\{/);
  assert.match(html, /noonObservations/);
  assert.match(html, /approveChLabel/);
  assert.match(html, /downloadDwadashi/);
  assert.match(html, /renderDwadashiReview/);
  assert.match(html, /syncDwadashiPackageStatus/);
  assert.match(html, /approveChLabel/);
  assert.match(html, /dwadashiReview/);
});

test("monthly Vrat-Parv widget only imports approved annual Dwadashi records", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  assert.match(widget, /data\/dwadashi\/"\+year\+"\.json/);
  assert.match(widget, /data\.status!=="approved"/);
  assert.match(widget, /sameLatitude/);
  assert.match(widget, /sameLongitude/);
  assert.match(widget, /record\.status!=="approved"/);
  assert.match(widget, /mergeAnnualDwadashiEvents/);
  assert.match(widget, /annual\.tithiDates/);
  assert.match(widget, /category:"द्वादशी तिथि"/);
  assert.match(widget, /व्रत-विशेष के शास्त्रीय नियम/);
  assert.match(widget, /एकादशी\|पारण\|parana/);
});


test("monthly widget enriches separate Dwadashi cards without merging distinct observances", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  const start = widget.indexOf("function mergeAnnualDwadashiEvents(data,annual,year,month){");
  const end = widget.indexOf("\n\n  async function loadMonth", start);
  assert.ok(start >= 0 && end > start, "merge function should be extractable for regression testing");
  const source = widget.slice(start, end).trim();
  const mergeAnnualDwadashiEvents = new Function("return (" + source + ")")();
  const data = {events:[
    {
      date:"2030-10-23",title:"गोवत्स द्वादशी",category:"व्रत",
      hinduTithi:"कार्तिक कृष्ण द्वादशी",description:"पहले से मौजूद गोवत्स-विधान।"
    },
    {
      date:"2030-10-23",title:"कृष्ण पद्मनाभ द्वादशी",category:"द्वादशी व्रत",
      hinduTithi:"कार्तिक कृष्ण द्वादशी",description:"स्वतंत्र पद्मनाभ observance।"
    }
  ]};
  const annual = {status:"approved",year:2030,tithis:[{
    status:"approved",selectedDate:"2030-10-23",month:"कार्तिक",paksha:"कृष्ण",
    displayNames:["गोवत्स द्वादशी","कृष्ण-पद्मनाभ द्वादशी"],
    observances:[{
      id:"govatsa",name:"गोवत्स द्वादशी",deity:"गाय एवं बछड़ा",
      shortDetail:"गाय-बछड़े का स्वतंत्र पूजन-विधान।"
    }]
  }]};
  const result = mergeAnnualDwadashiEvents(data,annual,2030,10);
  assert.equal(result.events.length,2,"separate existing cards must not be collapsed or duplicated");
  const govatsa = result.events.find(item=>item.title==="गोवत्स द्वादशी");
  const padmanabha = result.events.find(item=>item.title==="कृष्ण पद्मनाभ द्वादशी");
  assert.ok(govatsa);
  assert.ok(padmanabha);
  assert.match(govatsa.description,/गाय-बछड़े का स्वतंत्र पूजन-विधान/);
  assert.equal(padmanabha.description,"स्वतंत्र पद्मनाभ observance।");
  assert.deepEqual(govatsa.dwadashiAliases,["गोवत्स द्वादशी"]);
  assert.deepEqual(padmanabha.dwadashiAliases,["कृष्ण-पद्मनाभ द्वादशी"]);
});

test("2030 public Dwadashi package contains only individually approved observances plus approved Chaturmas", async () => {
  const annual = JSON.parse(await read("data/dwadashi/2030.json"));
  assert.equal(annual.year,2030);
  assert.equal(annual.status,"approved");
  assert.equal(annual.location.name,"पिथौरागढ़");
  assert.equal(annual.location.latitude,29.58);
  assert.equal(annual.location.longitude,80.22);
  assert.equal(annual.tithiDates.length,28);
  assert.ok(annual.tithiDates.every(item=>/^2030-\d{2}-\d{2}$/.test(item.date)));
  assert.equal(annual.chaturmas.status,"approved");
  assert.equal(annual.chaturmas.phases.length,4);
  assert.equal(annual.tithis.length,14);
  const reviews=annual.tithis.flatMap(record=>record.observanceDateReviews||[]);
  assert.equal(reviews.length,27);
  assert.ok(annual.tithis.every(record=>record.status==="needs-review"),"partial package must not approve parent tithi records");
  for(const record of annual.tithis){
    const ids=new Set([...(record.observances||[]),...(record.conditionalObservances||[])].map(item=>item.id));
    for(const review of record.observanceDateReviews||[]){
      assert.equal(review.reviewStatus,"approved");
      assert.ok(ids.has(review.observanceId),"every approval must match an actual observance");
      assert.match(review.selectedDate,/^2030-\d{2}-\d{2}$/);
    }
    const approvedIds=new Set((record.observanceDateReviews||[]).map(item=>item.observanceId));
    for(const item of [...(record.observances||[]),...(record.conditionalObservances||[])]){
      assert.ok(approvedIds.has(item.id),"pending observance must not leak into public package: "+item.id);
    }
  }
  const findReview=(recordId,id)=>(annual.tithis.find(record=>record.id===recordId)?.observanceDateReviews||[]).find(item=>item.observanceId===id);
  assert.equal(findReview("chaitra-shukla","madana").selectedDate,"2030-04-15");
  assert.equal(findReview("chaitra-shukla","bhartr").selectedDate,"2030-04-15");
  assert.equal(findReview("chaitra-shukla","vamana").selectedDate,"2030-04-15");
  assert.equal(findReview("vaishakha-shukla","madhava").selectedDate,"2030-05-14");
  assert.equal(findReview("vaishakha-shukla","parashurama").selectedDate,"2030-05-14");
  assert.equal(findReview("jyeshtha-shukla","rama").selectedDate,"2030-06-12");
  assert.equal(findReview("jyeshtha-shukla","trivikrama").selectedDate,"2030-06-13");
  assert.equal(findReview("ashadha-shukla","vasudeva").selectedDate,"2030-07-12");
  assert.equal(findReview("shravana-shukla","sridhara").selectedDate,"2030-08-10");
  assert.equal(findReview("shravana-shukla","damodara").selectedDate,"2030-08-10");
  assert.equal(findReview("bhadrapada-shukla","vamana").selectedDate,"2030-09-08");
  assert.equal(findReview("bhadrapada-shukla","damodara").selectedDate,"2030-09-08");
  assert.equal(findReview("bhadrapada-shukla","niranjana").selectedDate,"2030-09-08");
  assert.equal(findReview("bhadrapada-shukla","kalki").selectedDate,"2030-09-08");
  assert.equal(findReview("ashwin-shukla","padmanabha-narada").selectedDate,"2030-10-07");
  assert.equal(findReview("ashwin-shukla","padmanabha-varaha").selectedDate,"2030-10-07");
  assert.equal(findReview("kartika-krishna","govatsa").selectedDate,"2030-10-23");
  assert.equal(findReview("pausha-krishna","rupa").selectedDate,"2030-01-01");
  assert.equal(findReview("pausha-krishna-occurrence-2","rupa").selectedDate,"2030-12-22");
  assert.equal(findReview("magha-shukla","varaha").selectedDate,"2030-02-14");
  assert.equal(findReview("pausha-shukla","sujanna").selectedDate,"2030-01-16");
  assert.equal(findReview("pausha-shukla","kurma").selectedDate,"2030-01-16");
  assert.equal(findReview("kartika-shukla","sahasrashirsha").selectedDate,"2030-11-06");
  assert.equal(findReview("kartika-shukla","damodara").selectedDate,"2030-11-06");
  assert.equal(findReview("margashirsha-shukla","sadhya").selectedDate,"2030-12-06");
  assert.equal(findReview("margashirsha-shukla","dwadashaditya").selectedDate,"2030-12-06");
  assert.equal(findReview("margashirsha-shukla","standard-margashirsha").selectedDate,"2030-12-06");
  assert.equal(findReview("phalguna-shukla","narasimha"),undefined,"boundary-sensitive Phalguna Dwadashi stays pending");
  assert.equal(findReview("phalguna-shukla","phalguna-hari"),undefined,"boundary-sensitive Phalguna Dwadashi stays pending");
  assert.equal(findReview("kartika-krishna","krishna-padmanabha"),undefined,"unapproved Kartika observance must not enter the public package");
  assert.equal(Object.hasOwn(annual,"sourceReview"),false,"research-only source review metadata must stay private");
  assert.ok(reviews.every(item=>!Object.hasOwn(item,"sourceUrl")&&!Object.hasOwn(item,"sourceCrossCheckUrl")),"review links must not leak into the public package");
});

test("annual review package opens only when at least one real publishable record is approved", async () => {
  const html = await read("festival-year-review.html");
  const start = html.indexOf("function syncDwadashiPackageStatus(){");
  const end = html.indexOf("\nfunction renderDwadashiReview", start);
  assert.ok(start >= 0 && end > start);
  const source = html.slice(start, end);
  const sync = new Function("dwadashiPackage", source + "; syncDwadashiPackageStatus(); return dwadashiPackage.status;");
  const individual = {
    tithis:[{
      status:"needs-review",selectedDate:null,
      observances:[{id:"vamana"}],
      observanceDateReviews:[{observanceId:"vamana",selectedDate:"2030-09-08",reviewStatus:"approved"}]
    }],
    chaturmas:{status:"needs-review",phases:[]}
  };
  assert.equal(sync(individual),"approved");
  assert.equal(individual.tithis[0].status,"needs-review","package approval must not approve the parent tithi");
  const pending = {
    tithis:[{
      status:"needs-review",observances:[{id:"vamana"}],
      observanceDateReviews:[
        {observanceId:"vamana",selectedDate:"2030-09-08",reviewStatus:"needs-review"},
        {observanceId:"unknown",selectedDate:"2030-09-08",reviewStatus:"approved"},
        {observanceId:"vamana",selectedDate:"2030-02-31",reviewStatus:"approved"}
      ]
    }],
    chaturmas:{status:"needs-review",phases:[]}
  };
  assert.equal(sync(pending),"needs-review","pending, unmatched and invalid-date reviews must not open publication");
});

test("monthly widget publishes only individually approved observances from a needs-review parent", async () => {
  const widget = await read("monthly-vrat-parv-widget.js");
  const start = widget.indexOf("function mergeAnnualDwadashiEvents(data,annual,year,month){");
  const end = widget.indexOf("\n\n  async function loadMonth", start);
  assert.ok(start >= 0 && end > start);
  const source = widget.slice(start, end).trim();
  const mergeAnnualDwadashiEvents = new Function("return (" + source + ")")();
  const annual = {status:"approved",year:2030,tithis:[{
    id:"bhadrapada-shukla",status:"needs-review",selectedDate:null,
    month:"भाद्रपद",paksha:"शुक्ल",
    observances:[
      {id:"vamana",name:"वामन-द्वादशी व्रत",deity:"वामन",shortDetail:"वामन-पूजन"},
      {id:"damodara",name:"दामोदर-द्वादशी व्रत",deity:"दामोदर",shortDetail:"दामोदर-पूजन"}
    ],
    observanceDateReviews:[
      {observanceId:"vamana",selectedDate:"2030-09-08",reviewStatus:"approved"},
      {observanceId:"damodara",selectedDate:"2030-09-08",reviewStatus:"needs-review"},
      {observanceId:"niranjana",selectedDate:"2030-09-08",reviewStatus:"approved"}
    ]
  }]};
  const september = mergeAnnualDwadashiEvents({events:[]},annual,2030,9);
  assert.equal(september.events.length,1,"unmatched and unapproved observances must not leak into the public list");
  assert.equal(september.events[0].title,"वामन-द्वादशी व्रत");
  assert.equal(september.events[0].date,"2030-09-08");
  assert.equal(september.events[0].reviewStatus,"approved");
  assert.equal(september.events[0].calculationStatus,"individually-reviewed-observance");
  assert.equal(mergeAnnualDwadashiEvents({events:[]},annual,2030,10).events.length,0);
});

test("upcoming festival widget prefers approved annual Chaturmas phases and retains legacy fallback", async () => {
  const widget = await read("festival-widget.js");
  assert.match(widget, /\.\.\/dwadashi\/.*year.*json/);
  assert.match(widget, /annual\.status === "approved"/);
  assert.match(widget, /candidate\.status === "approved"/);
  assert.match(widget, /completePhases/);
  assert.match(widget, /todayKey < phase\.endDate/);
  assert.match(widget, /phaseIndex === phases\.length - 1 && todayKey === phase\.endDate/);
  assert.match(widget, /todayKey >= dateKey\(completionDate\)/);
  assert.match(widget, /देवोत्थानी एकादशी \(स्मार्त\)/);
  assert.match(widget, /!\/वैष्णव\|गौण\/i\.test\(item\.title \|\| ""\)/);
  assert.match(widget, /पिछला चरण पूर्ण और अगला चरण वर्तमान होगा/);
  assert.match(widget, /\.\.\/chaturmas\//);
});

test("publication instructions keep unreviewed dates out of the live widgets", async () => {
  const readme = await read("data/dwadashi/README.md");
  assert.match(readme, /needs-review/);
  assert.match(readme, /udayavyapini-smarta-first-sunrise/);
  assert.match(readme, /अधिक मास/);
  assert.match(readme, /स्वीकृति बॉक्स/);
});

test("2026 Chaturmas keeps the final food restriction through Ekadashi and completes on Dwadashi", async () => {
  const config = JSON.parse(await read("data/chaturmas/2026.json"));
  assert.equal(config.endDate, "2026-11-20");
  assert.equal(config.phases[3].endDate, "2026-11-20");
  assert.equal(config.completionDate, "2026-11-21");
  assert.equal(config.cardVisibleThroughDate, "2026-11-22");
  assert.equal(config.endObservance, "smarta-ekadashi");
  assert.equal(config.completionTithi, "कार्तिक शुक्ल द्वादशी");
  assert.ok(!/कार्तिक शुक्ल द्वादशी/.test(config.completionDetail));
});
