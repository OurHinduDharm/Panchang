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
  const end = widget.indexOf("\\n\\n  async function loadMonth", start);
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
