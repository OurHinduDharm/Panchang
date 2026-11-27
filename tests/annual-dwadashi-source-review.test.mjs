import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import panchangPackage from "@ishubhamx/panchangam-js";
import { buildDwadashiCalendar } from "../dwadashi-calendar.mjs";
import { normalizeEngineTithi, normalizeEnginePaksha, normalizeEngineMasa, extractDwadashiDay, extractAnnualPanchangDay, buildSourceReviewMetadata, generateYear } from "../scripts/generate-annual-dwadashi-review.mjs";

test("normalizes engine tithi indices to Hindi tithi names", () => {
  assert.equal(normalizeEngineTithi(11), "द्वादशी");
  assert.equal(normalizeEngineTithi(26), "द्वादशी");
  assert.equal(normalizeEngineTithi(10), "एकादशी");
  assert.equal(normalizeEngineTithi(15), "प्रतिपदा");
  assert.equal(normalizeEngineTithi("Dwadashi"), "द्वादशी");
});

test("normalizes paksha and adhika masa without dropping the month", () => {
  assert.equal(normalizeEnginePaksha("Krishna", 11), "कृष्ण पक्ष");
  assert.equal(normalizeEnginePaksha("", 26), "कृष्ण पक्ष");
  assert.equal(normalizeEngineMasa({name:"Jyeshtha",isAdhika:true}), "अधिक ज्येष्ठ");
});

test("extracts local-day tithi interval and sunrise as ISO timestamps", () => {
  const result = extractDwadashiDay({
    tithi:11, paksha:"Shukla", masa:{name:"Ashadha",isAdhika:false},
    sunrise:"2026-07-11T00:01:00.000Z",
    tithiStartTime:"2026-07-10T23:52:00.000Z",
    tithiEndTime:"2026-07-11T23:00:00.000Z"
  }, "2026-07-11");
  assert.equal(result.tithi, "द्वादशी");
  assert.equal(result.paksha, "शुक्ल पक्ष");
  assert.equal(result.masa, "आषाढ़");
  assert.equal(result.sunrise, "2026-07-11T00:01:00.000Z");
});

test("extracts the tithi actually prevailing at noon from the engine transition array", () => {
  const result = extractDwadashiDay({
    tithi:10, paksha:"Shukla", masa:{name:"Margashirsha"},
    sunrise:"2028-11-13T00:50:00.000Z",
    tithis:[{index:11,name:"Dwadashi",startTime:new Date("2028-11-13T01:11:00.000Z"),endTime:new Date("2028-11-13T22:10:00.000Z")}]
  }, "2028-11-13", new Date("2028-11-13T06:30:00.000Z"));
  assert.equal(result.tithi, "एकादशी");
  assert.equal(result.noonTithi, "द्वादशी");
  assert.equal(result.noonTithiStartTime, "2028-11-13T01:11:00.000Z");
});

test("the Padmanabha source traditions remain one tithi with unique internal observance IDs", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const rules = JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), "../data/dwadashi-vrata-rules.json"), "utf8"));
  const item = rules.unifiedTithiIndex.tithis.find(x => x.month === "आश्विन" && x.paksha === "शुक्ल");
  assert.equal(item.observances.length, 2);
  assert.deepEqual(item.observances.map(x => x.id), ["padmanabha-narada","padmanabha-varaha"]);
  assert.equal(item.displayNames.length, 2);
});

test("annual daily extraction preserves local sunrise, exact nakshatra intervals and review-safe eclipse fields", () => {
  const result = extractAnnualPanchangDay({
    tithi:9, paksha:"Shukla", masa:{name:"Kartika",isAdhika:false},
    sunrise:"2026-11-01T00:52:00.000Z", sunset:"2026-11-01T11:53:00.000Z",
    moonrise:"2026-11-01T14:20:00.000Z",
    tithiStartTime:"2026-10-31T23:00:00.000Z", tithiEndTime:"2026-11-01T09:00:00.000Z",
    nakshatra:12, yoga:14, sunRashi:7, nakshatraEndTime:"2026-11-01T10:00:00.000Z",
    nakshatras:[{index:12,name:"Hasta",startTime:new Date("2026-10-31T22:00:00.000Z"),endTime:new Date("2026-11-01T10:00:00.000Z")}],
    karanas:[{name:"Bava",startTime:new Date("2026-10-31T23:00:00.000Z"),endTime:new Date("2026-11-01T04:00:00.000Z")}],
    tithis:[{index:10,name:"Ekadashi",startTime:new Date("2026-10-31T23:00:00.000Z"),endTime:new Date("2026-11-01T09:00:00.000Z")}]
  }, "2026-11-01", new Date("2026-11-01T06:30:00.000Z"));
  assert.equal(result.weekday,"रविवार");
  assert.equal(result.tithi,"दशमी");
  assert.equal(result.noonTithi,"एकादशी");
  assert.equal(result.nakshatra,"हस्त");
  assert.equal(result.yoga,"वज्र");
  assert.equal(result.sunRashi,"वृश्चिक");
  assert.equal(result.moonrise,"2026-11-01T14:20:00.000Z");
  assert.equal(result.karana,"बव");
  assert.equal(result.nakshatraIntervals.length,1);
  assert.deepEqual(result.grahanaTimes,[]);
  assert.equal(result.grahanaVisibilityChecked,false);
});

test("2029–2030 Drik special Dwadashi labels use the exact source dates and names", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const rules = JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), "../data/dwadashi-vrata-rules.json"), "utf8"));
  const specials = rules.drikSpecialObservances;
  const find = (year, date) => specials.find(x => x.year === year && (x.referenceDate === date || x.observanceDate === date));
  assert.deepEqual(find(2026,"2026-03-15")?.labels, ["विष्णुशृंखला योग द्वादशी"]);
  assert.equal(find(2026,"2026-06-26")?.sourcePage, "smarta-ekadashi");
  assert.equal(find(2026,"2026-07-11")?.sourcePage, "smarta-ekadashi");
  assert.deepEqual(find(2029,"2029-09-18")?.labels, ["विष्णुशृंखला योग द्वादशी"]);
  assert.equal(find(2029,"2029-09-05"), undefined);
  assert.deepEqual(find(2030,"2030-05-28")?.labels, ["वंजुली महाद्वादशी"]);
  assert.deepEqual(find(2030,"2030-08-25")?.labels, ["उन्मीलिनी महाद्वादशी"]);
  assert.deepEqual(find(2030,"2030-09-09")?.labels, ["श्रवण योग द्वादशी"]);
  assert.deepEqual(find(2030,"2030-03-29")?.labels, ["एकादशी श्रवण योग द्वादशी"]);
  assert.deepEqual(find(2030,"2030-12-21")?.labels, ["कृष्ण मत्स्य द्वादशी"]);
  assert.equal(find(2030,"2030-05-14")?.dateRole, "special-observance-date");
  assert.equal(find(2030,"2030-05-14")?.referenceDate, undefined);
});

test("source metadata distinguishes Pithoragarh primary from New Delhi secondary checks", () => {
  const sources = buildSourceReviewMetadata(2028);
  assert.equal(sources.status, "pending-manual-cross-check");
  assert.match(sources.primary.url, /year=2028/);
  assert.equal(sources.primary.location, "Pithoragarh, Uttarakhand, India");
  assert.equal(sources.independent[0].location, "New Delhi, India");
});


test("Smarta Ekadashi Parana source model documents Hari Vasara, local day divisions and exceptions", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const rules = JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), "../data/dwadashi-vrata-rules.json"), "utf8"));
  const model = rules.paranaAndConduct.calculationModel;
  assert.equal(model.tradition, "smarta-general");
  assert.equal(model.scope, "एकादशी-व्रत के पारण-काल की गणना; एकादशी-व्रत का दिन चुनने का नियम नहीं");
  assert.equal(model.sequence.length, 7);
  assert.match(model.sequence[1].rule, /प्रथम चतुर्थांश/);
  assert.match(model.sequence[4].rule, /मध्याह्न/);
  assert.match(model.sequence[5].rule, /सूर्योदय से पहले समाप्त/);
  assert.match(model.sequence[6].rule, /manual review/);
  assert.equal(model.timeDivisions.pratahkal, "स्थानीय सूर्योदय से दिनमान के 1/5 भाग तक");
  assert.ok(model.sourceReview.some(x => x.reference === "पृष्ठ 70–71"));
  assert.equal(model.approvalPolicy.includes("approve नहीं करता"), true);
});


test("real Pithoragarh 2030 Vaishakha Shukla Trisparsha is recognized across consecutive sunrises", async () => {
  const { getPanchangam, Observer } = panchangPackage;
  const location = new Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset:330, calendarType:"purnimanta" };
  const makeDay = isoDate => {
    const instant = new Date(isoDate + "T06:30:00.000Z");
    const raw = getPanchangam(instant, location, options);
    const day = extractDwadashiDay(raw, isoDate, instant);
    assert.ok(day.sunrise, isoDate + " must have a local sunrise");
    const sunriseInstant = new Date(day.sunrise);
    const sunriseRaw = getPanchangam(sunriseInstant, location, options);
    const sunriseDay = extractDwadashiDay(sunriseRaw, isoDate, sunriseInstant);
    day.sunriseTithi = {
      tithi:sunriseDay.tithi,
      paksha:sunriseDay.paksha,
      masa:sunriseDay.masa,
      tithiStartTime:sunriseDay.tithiStartTime,
      tithiEndTime:sunriseDay.tithiEndTime
    };
    return day;
  };
  const first = makeDay("2030-05-14");
  const following = makeDay("2030-05-15");
  const rules = JSON.parse(await (await import("node:fs/promises")).readFile(
    new URL("../data/dwadashi-vrata-rules.json", import.meta.url), "utf8"
  ));
  const result = buildDwadashiCalendar([first, following], rules);
  const record = result.tithis.find(item => item.id === "vaishakha-shukla");
  const evidence = JSON.stringify({first, following, record}, null, 2);
  assert.ok(record, "Vaishakha Shukla record must exist");
  assert.equal(first.sunriseTithi.tithi, "एकादशी", "14 May sunrise must carry Ekadashi: " + evidence);
  assert.equal(first.noonTithi, "द्वादशी", "14 May noon must carry Dwadashi: " + evidence);
  assert.equal(following.sunriseTithi.tithi, "त्रयोदशी", "15 May sunrise must carry Trayodashi: " + evidence);
  assert.equal(record.dateSelection, "trisparsha-mahadwadashi-candidate-review-required", "the local three-tithi sequence must be recognized: " + evidence);
  assert.equal(record.specialTithiYogas.length, 1, "one Smarta Trisparsha candidate must be attached: " + evidence);
  assert.equal(record.specialTithiYogas[0].tradition, "smarta");
  assert.equal(record.specialTithiYogas[0].status, "candidate-needs-manual-review");
  assert.equal(record.status, "needs-review", "recognition must never auto-approve");
});

test("real Pithoragarh 2030 Krishna Narasimha Dwadashi follows the local sunrise-day boundary", async () => {
  const { getPanchangam, Observer } = panchangPackage;
  const location = new Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset:330, calendarType:"purnimanta" };
  const makeDay = isoDate => {
    const instant = new Date(isoDate + "T06:30:00.000Z");
    const raw = getPanchangam(instant, location, options);
    const day = extractDwadashiDay(raw, isoDate, instant);
    assert.ok(day.sunrise, isoDate + " must have a local sunrise");
    const sunriseInstant = new Date(day.sunrise);
    const sunriseRaw = getPanchangam(sunriseInstant, location, options);
    const sunriseDay = extractDwadashiDay(sunriseRaw, isoDate, sunriseInstant);
    day.sunriseTithi = {
      tithi:sunriseDay.tithi,
      paksha:sunriseDay.paksha,
      masa:sunriseDay.masa,
      tithiStartTime:sunriseDay.tithiStartTime,
      tithiEndTime:sunriseDay.tithiEndTime
    };
    return day;
  };
  const first = makeDay("2030-03-29");
  const following = makeDay("2030-03-30");
  const rules = JSON.parse(await (await import("node:fs/promises")).readFile(
    new URL("../data/dwadashi-vrata-rules.json", import.meta.url), "utf8"
  ));
  const result = buildDwadashiCalendar([first,following],rules);
  const record = result.tithis.find(item => item.id === "chaitra-krishna");
  const evidence = JSON.stringify({first,following,record},null,2);
  assert.ok(record, "Chaitra Krishna record must exist");
  assert.equal(first.sunriseTithi.tithi, "एकादशी", "29 March sunrise must carry Ekadashi: " + evidence);
  assert.equal(following.sunriseTithi.tithi, "द्वादशी", "30 March sunrise must carry Dwadashi: " + evidence);
  assert.deepEqual(record.candidateDates, ["2030-03-30"]);
  assert.equal(record.referenceDate, "2030-03-29");
  assert.equal(record.selectedDate, "2030-03-29");
  assert.equal(record.dateSelection, "source-reference-date-tithi-overlap-review-required");
  assert.equal(record.sourceReferenceObservation.date, "2030-03-29");
  assert.equal(record.sourceReferenceObservation.sunriseDayStart, first.sunrise);
  assert.equal(record.sourceReferenceObservation.sunriseDayEnd, following.sunrise);
  assert.equal(record.status, "needs-review", "source date is a candidate, not approval");
});

test("real Pithoragarh 2030 Padmanabha Dwadashi overlaps the 7 October sunrise day", async () => {
  const { getPanchangam, Observer } = panchangPackage;
  const location = new Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset:330, calendarType:"purnimanta" };
  const makeDay = isoDate => {
    const instant = new Date(isoDate + "T06:30:00.000Z");
    const raw = getPanchangam(instant, location, options);
    const day = extractDwadashiDay(raw, isoDate, instant);
    assert.ok(day.sunrise, isoDate + " must have a local sunrise");
    const sunriseInstant = new Date(day.sunrise);
    const sunriseRaw = getPanchangam(sunriseInstant, location, options);
    const sunriseDay = extractDwadashiDay(sunriseRaw, isoDate, sunriseInstant);
    day.sunriseTithi = {
      tithi:sunriseDay.tithi,
      paksha:sunriseDay.paksha,
      masa:sunriseDay.masa,
      tithiStartTime:sunriseDay.tithiStartTime,
      tithiEndTime:sunriseDay.tithiEndTime
    };
    return day;
  };
  const first = makeDay("2030-10-07");
  const following = makeDay("2030-10-08");
  const rules = JSON.parse(await (await import("node:fs/promises")).readFile(
    new URL("../data/dwadashi-vrata-rules.json", import.meta.url), "utf8"
  ));
  const result = buildDwadashiCalendar([first,following],rules);
  const record = result.tithis.find(item => item.id === "ashwin-shukla");
  const evidence = JSON.stringify({first,following,record},null,2);
  assert.ok(record, "Ashwin Shukla record must exist");
  assert.equal(first.sunriseTithi.tithi, "एकादशी", "7 October sunrise must carry Ekadashi: " + evidence);
  assert.equal(following.sunriseTithi.tithi, "द्वादशी", "8 October sunrise must carry Dwadashi: " + evidence);
  assert.deepEqual(record.candidateDates, ["2030-10-08"]);
  assert.equal(record.referenceDate, "2030-10-07");
  assert.equal(record.selectedDate, "2030-10-07");
  assert.equal(record.dateSelection, "source-reference-date-tithi-overlap-review-required");
  assert.equal(record.sourceReferenceObservation.sunriseDayStart, first.sunrise);
  assert.equal(record.sourceReferenceObservation.sunriseDayEnd, following.sunrise);
  assert.equal(record.status, "needs-review", "source date is a candidate, not approval");
});

test("real Pithoragarh 2030 Krishna Matsya Dwadashi uses the 21 December sunrise day", async () => {
  const { getPanchangam, Observer } = panchangPackage;
  const location = new Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset:330, calendarType:"purnimanta" };
  const makeDay = isoDate => {
    const instant = new Date(isoDate + "T06:30:00.000Z");
    const raw = getPanchangam(instant, location, options);
    const day = extractDwadashiDay(raw, isoDate, instant);
    assert.ok(day.sunrise, isoDate + " must have a local sunrise");
    const sunriseInstant = new Date(day.sunrise);
    const sunriseRaw = getPanchangam(sunriseInstant, location, options);
    const sunriseDay = extractDwadashiDay(sunriseRaw, isoDate, sunriseInstant);
    day.sunriseTithi = {
      tithi:sunriseDay.tithi,
      paksha:sunriseDay.paksha,
      masa:sunriseDay.masa,
      tithiStartTime:sunriseDay.tithiStartTime,
      tithiEndTime:sunriseDay.tithiEndTime
    };
    return day;
  };
  const first = makeDay("2030-12-21");
  const following = makeDay("2030-12-22");
  const rules = JSON.parse(await (await import("node:fs/promises")).readFile(
    new URL("../data/dwadashi-vrata-rules.json", import.meta.url), "utf8"
  ));
  const result = buildDwadashiCalendar([first,following],rules);
  const record = result.tithis.find(item => item.id === "pausha-krishna");
  const evidence = JSON.stringify({first,following,record},null,2);
  assert.ok(record, "Pausha Krishna record must exist");
  assert.equal(first.sunriseTithi.tithi, "एकादशी", "21 December sunrise must carry Ekadashi: " + evidence);
  assert.equal(first.noonTithi, "एकादशी", "21 December noon must still carry Ekadashi: " + evidence);
  assert.equal(following.sunriseTithi.tithi, "द्वादशी", "22 December sunrise must carry Dwadashi: " + evidence);
  assert.deepEqual(record.candidateDates, ["2030-12-22"]);
  assert.equal(record.referenceDate, null);
  assert.equal(record.selectedDate, "2030-12-22");
  assert.equal(record.dateSelection, "single-observation-candidate-review-required");
  assert.equal(record.sourceReferenceObservation, null);
  const matsya = record.drikSpecialObservances.find(item => item.labels?.includes("कृष्ण मत्स्य द्वादशी"));
  assert.ok(matsya, "Krishna Matsya must remain as its own dated source reference: " + evidence);
  assert.equal(matsya.observanceDate, "2030-12-21");
  assert.equal(matsya.localPanchangObservation.sunriseDayStart, first.sunrise);
  assert.equal(matsya.localPanchangObservation.sunriseDayEnd, following.sunrise);
  assert.equal(record.displayNames.includes("रूप-व्रत"), true);
  assert.deepEqual(record.crossReferences.map(item => item.name), ["कृष्ण मत्स्य द्वादशी"]);
  assert.equal(record.status, "needs-review", "the record remains pending because its separate Drik cross-reference is not yet resolved");
});

test("Dwadashi extraction preserves all tithi and nakshatra intervals for local yoga checks", () => {
  const result = extractDwadashiDay({
    tithi:11, paksha:"Shukla", masa:{name:"Bhadrapada"},
    sunrise:"2030-08-25T00:12:57.366Z", sunset:"2030-08-25T12:57:00.000Z",
    tithis:[{index:11,name:"Dwadashi",startTime:new Date("2030-08-24T15:54:33.403Z"),endTime:new Date("2030-08-25T17:17:31.584Z")}],
    nakshatras:[{index:6,name:"Punarvasu",startTime:new Date("2030-08-25T00:00:00.000Z"),endTime:new Date("2030-08-25T23:54:00.000Z")}]
  },"2030-08-25",new Date("2030-08-25T06:30:00.000Z"));
  assert.equal(result.tithiIntervals[0].tithi,"द्वादशी");
  assert.equal(result.tithiIntervals[0].paksha,"शुक्ल पक्ष");
  assert.equal(result.nakshatraIntervals[0].name,"पुनर्वसु");
  assert.equal(result.sunset,"2030-08-25T12:57:00.000Z");
});

test("real Pithoragarh 2030 Shukla Dwadashi nakshatra yogas are measured by source profile", async () => {
  const { getPanchangam, Observer } = panchangPackage;
  const location = new Observer(29.5828,80.2182,1650);
  const options = {timezoneOffset:330,calendarType:"purnimanta"};
  const makeDay = isoDate => {
    const instant = new Date(isoDate + "T06:30:00.000Z");
    const raw = getPanchangam(instant,location,options);
    const day = extractDwadashiDay(raw,isoDate,instant);
    assert.ok(day.sunrise,isoDate + " local sunrise");
    const sunriseInstant = new Date(day.sunrise);
    const sunriseRaw = getPanchangam(sunriseInstant,location,options);
    const sunriseDay = extractDwadashiDay(sunriseRaw,isoDate,sunriseInstant);
    day.sunriseTithi = {
      tithi:sunriseDay.tithi, paksha:sunriseDay.paksha, masa:sunriseDay.masa,
      tithiStartTime:sunriseDay.tithiStartTime, tithiEndTime:sunriseDay.tithiEndTime
    };
    return day;
  };
  const days = [makeDay("2030-08-25"),makeDay("2030-09-08")];
  const rules = JSON.parse(await (await import("node:fs/promises")).readFile(
    new URL("../data/dwadashi-vrata-rules.json",import.meta.url),"utf8"
  ));
  const result = buildDwadashiCalendar(days,rules);
  const jayantiRecord = result.tithis.find(item=>item.id==="bhadrapada-krishna");
  const jayanti = jayantiRecord.specialTithiYogas.find(item=>
    item.sourceProfile==="drikPanchang" && item.id.endsWith("-jayanti")
  );
  assert.ok(jayanti,"25 August Krishna Dwadashi must be checked against Drik's both-paksha Punarvasu-Jayanti rule");
  assert.equal(jayanti.nakshatra,"पुनर्वसु");
  assert.ok(jayanti.overlapMinutes>=48);
  assert.equal(jayanti.meetsOneMuhurta,true);
  assert.equal(jayanti.coversFullDaylight,true);
  assert.equal(jayantiRecord.status,"needs-review");

  const vijayaRecord = result.tithis.find(item=>item.id==="bhadrapada-shukla");
  const vijaya = vijayaRecord.specialTithiYogas.find(item=>
    item.sourceProfile==="naradaPurana" && item.id.endsWith("-vijaya")
  );
  assert.ok(vijaya,"8 September must be checked against the Narada Purana Shravana-Vijaya variant");
  assert.equal(vijaya.nakshatra,"श्रवण");
  assert.ok(vijaya.overlapMinutes>=48);
  assert.equal(vijaya.meetsOneMuhurta,true);
  assert.equal(vijaya.coversFullDaylight,false);
  assert.equal(vijayaRecord.specialTithiYogas.some(item=>
    item.sourceProfile==="drikPanchang" && item.id.endsWith("-vijaya")
  ),false,"Shravana begins after sunset on 8 September, so it is not a Drik sunrise-to-sunset Vijayā candidate");
  assert.equal(vijayaRecord.status,"needs-review");
});

test("real Pithoragarh 2030 August and May cases do not inherit false Unmilini or Vanjuli labels", async () => {
  const { getPanchangam, Observer } = panchangPackage;
  const location=new Observer(29.5828,80.2182,1650);
  const options={timezoneOffset:330,calendarType:"purnimanta"};
  const makeDay=isoDate=>{
    const instant=new Date(isoDate+"T06:30:00.000Z");
    const raw=getPanchangam(instant,location,options);
    const day=extractDwadashiDay(raw,isoDate,instant);
    assert.ok(day.sunrise,isoDate+" local sunrise");
    const sunriseInstant=new Date(day.sunrise);
    const sunriseRaw=getPanchangam(sunriseInstant,location,options);
    const sunriseDay=extractDwadashiDay(sunriseRaw,isoDate,sunriseInstant);
    day.sunriseTithi={
      tithi:sunriseDay.tithi,paksha:sunriseDay.paksha,masa:sunriseDay.masa,
      tithiStartTime:sunriseDay.tithiStartTime,tithiEndTime:sunriseDay.tithiEndTime
    };
    return day;
  };
  const days=["2030-05-28","2030-05-29","2030-08-24","2030-08-25"].map(makeDay);
  const rules=JSON.parse(await (await import("node:fs/promises")).readFile(
    new URL("../data/dwadashi-vrata-rules.json",import.meta.url),"utf8"
  ));
  const result=buildDwadashiCalendar(days,rules);
  const jyeshtha=result.tithis.find(item=>item.id==="jyeshtha-krishna");
  const bhadrapada=result.tithis.find(item=>item.id==="bhadrapada-krishna");
  assert.ok(jyeshtha);
  assert.ok(bhadrapada);
  assert.equal(jyeshtha.specialTithiYogas.some(item=>item.id==="mahadwadashi-smarta-vanjuli"),false,
    "28 May Dwadashi ends before the following local sunrise");
  assert.equal(bhadrapada.specialTithiYogas.some(item=>item.id==="mahadwadashi-smarta-unmilini"),false,
    "24/25 August do not have Ekadashi at both consecutive local sunrises");
});



test("2030 general Shravana Yoga Dwadashi annual evidence stays review-only and within the year", async () => {
  const review = JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const audit = review.generalDwadashiYogaReview;
  assert.ok(audit);
  assert.equal(audit.calculation.observedVrataDays,48);
  assert.equal(audit.calculation.minimumOverlapMs,48*60*1000);
  assert.ok(audit.observations.every(item=>item.observanceDate.startsWith("2030-")));
  assert.deepEqual(audit.qualifyingCandidates,["2030-03-01","2030-09-08"]);
  assert.equal(audit.status,"candidate-evidence-only");
  assert.equal(audit.autoApproved,false);
  assert.equal(review.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
  assert.ok(review.tithis.every(item=>item.status==="needs-review"));

  const record = date => audit.observations.find(item=>item.observanceDate===date);
  assert.equal(record("2030-03-01").overlapMs,3027927);
  assert.equal(record("2030-03-01").meetsOneMuhurta,true);
  assert.equal(record("2030-03-29").overlapMs,0);
  assert.equal(record("2030-03-29").meetsOneMuhurta,false);
  assert.equal(record("2030-09-08").overlapMs,35514971);
  assert.equal(record("2030-09-08").meetsOneMuhurta,true);
  assert.equal(record("2030-09-09").overlapMs,2513945);
  assert.equal(record("2030-09-09").meetsOneMuhurta,false);
  assert.equal(record("2030-10-07").overlapMs,0);
  assert.equal(record("2030-10-07").meetsOneMuhurta,false);
});


test("2030 Krishna Punarvasu Jayanti source conflict follows the Smarta-first policy", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const record=review.tithis.find(item=>item.id==="bhadrapada-krishna");
  const decision=record.jayantiMahadwadashiSourceDecision;
  assert.ok(decision);
  assert.equal(decision.localObservation.date,"2030-08-25");
  assert.equal(decision.localObservation.paksha,"कृष्ण");
  assert.equal(decision.localObservation.nakshatra,"पुनर्वसु");
  assert.equal(decision.localObservation.coversFullDaylight,true);
  assert.deepEqual(decision.sourceProfiles.map(x=>x.id),["naradaPurana","nirnayaSindhu","drikPanchang"]);
  assert.equal(decision.sourceProfiles[0].localMatch,false);
  assert.equal(decision.sourceProfiles[1].localMatch,false);
  assert.equal(decision.sourceProfiles[2].localMatch,true);
  assert.equal(decision.publicCardDecision,"no-additional-jayanti-card");
  assert.equal(decision.autoApproved,false);
  assert.equal(record.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});


test("2030 Bhadrapada Shukla Dwadashi rites retain distinct source-based dates", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const record=review.tithis.find(item=>item.id==="bhadrapada-shukla");
  const dates=record.observanceDateReviews;
  assert.deepEqual(dates.map(x=>x.observanceId),["vamana","damodara","niranjana","kalki"]);
  assert.ok(dates.every(x=>x.selectedDate==="2030-09-08" && x.autoApproved===false));
  assert.equal(dates[1].source,"नारद पुराण, पूर्वार्ध, अध्याय 121, श्लोक 35b–38");
  assert.equal(dates[2].ritualTime,"8 सितंबर रात्रि-संध्या");
  assert.equal(dates[3].followingMorningActionDate,"2030-09-09");
  assert.equal(dates[0].jayantiRuleConflict.result.includes("मध्याह्न के बाद"),true);
  assert.equal(record.status,"needs-review");
  assert.equal(record.selectedDate,null);
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});


test("2030 Chaitra Krishna and Ashwin Shukla reject unsupported Drik Ekadashi-Shravana labels", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const chaitra=review.tithis.find(item=>item.id==="chaitra-krishna");
  const ashwin=review.tithis.find(item=>item.id==="ashwin-shukla");
  for (const [record,date] of [[chaitra,"2030-03-29"],[ashwin,"2030-10-07"]]) {
    const source=record.drikSpecialObservances.find(item=>item.referenceDate===date);
    assert.ok(source);
    assert.equal(source.status,"not-supported-by-local-dwadashi-shravana-overlap");
    assert.equal(source.localDwadashiShravanaOverlapMs,0);
    assert.equal(source.localAssessment.result,"not-qualified");
    assert.equal(source.localAssessment.overlapMs,0);
    assert.equal(source.localAssessment.thresholdMs,48*60*1000);
    assert.equal(
      source.localAssessment.sourceLabelDisposition,
      "retain-as-source-cross-reference-only;do-not-use-for-local-date-selection"
    );
    assert.equal(record.shravanaLabelDecision.status,"rejected-as-local-yoga");
    assert.equal(record.shravanaLabelDecision.preserveNamedDwadashi,true);
    assert.equal(record.shravanaLabelDecision.publicDateChanged,false);
    assert.equal(record.status,"needs-review");
  }
  assert.equal(chaitra.selectedDate,"2030-03-29");
  assert.deepEqual(chaitra.candidateDates,["2030-03-30"]);
  assert.equal(ashwin.selectedDate,"2030-10-07");
  assert.deepEqual(ashwin.candidateDates,["2030-10-08"]);
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});


test("2030 Krishna Bhishma Dwadashi locally meets the Shravana overlap threshold and stays separate from Shukra Pradosh", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const record=review.tithis.find(item=>item.id==="phalguna-krishna");
  const source=record.drikSpecialObservances.find(item=>item.referenceDate==="2030-03-01");
  assert.ok(source);
  assert.equal(source.status,"local-48-minute-overlap-confirmed-source-review-pending");
  assert.equal(source.localDwadashiShravanaOverlapMs,3027927);
  assert.equal(source.localAssessment.result,"qualifying-candidate");
  assert.equal(source.localAssessment.thresholdMs,48*60*1000);
  assert.equal(record.shravanaYogaDecision.selectedDate,"2030-03-01");
  assert.equal(record.shravanaYogaDecision.autoApproved,false);
  const bhishma=record.observanceDateReviews.find(item=>item.observanceId==="krishna-bhishma");
  assert.equal(bhishma.selectedDate,"2030-03-01");
  assert.equal(bhishma.overlapMs,3027927);
  assert.equal(bhishma.autoApproved,false);
  assert.equal(record.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});


test("2030 May 28 Vanjuli and August 25 Unmilini labels fail their local Smarta tithi rules", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const vanjuli=review.tithis.find(item=>item.id==="jyeshtha-krishna");
  const unmilini=review.tithis.find(item=>item.id==="bhadrapada-krishna");
  const v=vanjuli.drikSpecialObservances.find(item=>item.labels.includes("वंजुली महाद्वादशी"));
  const u=unmilini.drikSpecialObservances.find(item=>item.labels.includes("उन्मीलिनी महाद्वादशी"));
  assert.equal(v.status,"not-supported-by-two-consecutive-sunrise-dwadashi-rule");
  assert.equal(v.localAssessment.result,"not-qualified");
  assert.equal(v.localAssessment.firstSunrise.tithi,"द्वादशी");
  assert.equal(v.localAssessment.secondSunrise.tithi,"त्रयोदशी");
  assert.equal(v.localAssessment.dwadashiIntervalIST.end,"2030-05-29T04:15:19.812+05:30");
  assert.equal(vanjuliRecordSelectedDate(vanjuli),"2030-05-28");
  assert.equal(vanjuli.mahadwadashiSourceDecision.autoApproved,false);

  assert.equal(u.status,"not-supported-by-arunodaya-dashami-overlap-or-two-sunrise-ekadashi-rule");
  assert.equal(u.localAssessment.result,"not-qualified");
  assert.deepEqual(u.localAssessment.sunriseSequence.map(item=>item.tithi),["एकादशी","द्वादशी"]);
  assert.equal(u.localAssessment.precedingDashamiEndReference,"2030-08-24T00:56:00+05:30");
  assert.equal(u.localAssessment.ekadashiEndIST,"2030-08-25T02:54:00+05:30");
  assert.equal(unmilini.mahadwadashiSourceDecision.autoApproved,false);
  assert.equal(unmilini.jayantiMahadwadashiSourceDecision.publicCardDecision,"no-additional-jayanti-card");
  assert.equal(vanjuli.status,"needs-review");
  assert.equal(unmilini.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});

function vanjuliRecordSelectedDate(record) {
  return record.selectedDate;
}


test("2030 Krishna Vasudeva Dwadashi retains 26 July vrata date with 27 July parana day", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const record=review.tithis.find(item=>item.id==="shravana-krishna");
  const source=record.drikSpecialObservances.find(item=>
    item.referenceDate==="2030-07-26" && item.labels.includes("कृष्ण वासुदेव द्वादशी")
  );
  assert.ok(source);
  assert.equal(source.status,"local-tithi-interval-confirmed-source-date-review-pending");
  assert.equal(source.localAssessment.vrataDate,"2030-07-26");
  assert.equal(source.localAssessment.paranaDate,"2030-07-27");
  assert.equal(source.localAssessment.tithiAtNoonOnVrataDate,true);
  assert.equal(source.localAssessment.tithiAtNextSunrise,true);
  assert.equal(record.selectedDate,"2030-07-26");
  assert.deepEqual(record.candidateDates,["2030-07-26","2030-07-27"]);
  const decision=record.observanceDateReviews.find(item=>item.observanceId==="krishna-vasudeva");
  assert.equal(decision.selectedDate,"2030-07-26");
  assert.equal(decision.paranaDate,"2030-07-27");
  assert.equal(decision.autoApproved,false);
  assert.equal(record.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});


test("2030 Padmanabha Dwadashi uses the evening tithi-entry and overnight vrata sequence", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const record=review.tithis.find(item=>item.id==="ashwin-shukla");
  const decision=record.observanceDateReviews.find(item=>item.observanceId==="padmanabha-narada");
  assert.ok(decision);
  assert.equal(decision.selectedDate,"2030-10-07");
  assert.equal(decision.localTithiIntervalIST.start,"2030-10-07T16:31:39.907+05:30");
  assert.equal(decision.localTithiIntervalIST.end,"2030-10-08T15:50:29.356+05:30");
  assert.equal(decision.vrataSequence.startDate,"2030-10-07");
  assert.equal(decision.vrataSequence.continuationDate,"2030-10-08");
  assert.equal(decision.vrataSequence.night,"रात्रि-जागरण");
  assert.equal(decision.shravanaYogaStatus,"not-qualified-local-overlap-zero");
  assert.equal(decision.autoApproved,false);
  assert.equal(record.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});


test("2030 Krishna Narasimha Dwadashi is dated on the local sunrise Dwadashi day", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const record=review.tithis.find(item=>item.id==="chaitra-krishna");
  const decision=record.observanceDateReviews.find(item=>item.observanceId==="krishna-narasimha");
  assert.ok(decision);
  assert.equal(decision.sourceReferenceDate,"2030-03-29");
  assert.equal(decision.selectedDate,"2030-03-30");
  assert.equal(decision.localDayEvidence.sunriseTithi,"द्वादशी");
  assert.equal(decision.localDayEvidence.noonTithi,"द्वादशी");
  assert.equal(decision.localDayEvidence.followingSunriseTithi,"त्रयोदशी");
  assert.equal(decision.localTithiIntervalIST.start,"2030-03-30T00:34:51.604+05:30");
  assert.equal(decision.localTithiIntervalIST.end,"2030-03-31T00:42:52.860+05:30");
  assert.equal(decision.vrataDate,"2030-03-29");
  assert.equal(decision.observanceAndParanaDate,"2030-03-30");
  assert.equal(decision.autoApproved,false);
  assert.equal(record.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});


test("2030 Vamana Dwadashi is not mislabeled Vamana Jayanti when Madhyahna Shravana is absent", async () => {
  const review=JSON.parse(await readFile(
    new URL("../data/references/ohd-dwadashi-2030-review.json",import.meta.url),"utf8"
  ));
  const record=review.tithis.find(item=>item.id==="bhadrapada-shukla");
  const vamana=record.observanceDateReviews.find(item=>item.observanceId==="vamana");
  assert.equal(vamana.selectedDate,"2030-09-08");
  assert.equal(vamana.name,"वामन-द्वादशी व्रत");
  assert.equal(vamana.jayantiRuleConflict.publicDecision,"no-vamana-jayanti-label");
  assert.match(vamana.jayantiRuleConflict.result,/मध्याह्न के बाद/);
  assert.equal(vamana.autoApproved,false);
  assert.equal(record.status,"needs-review");
  assert.equal(review.sourceReview.status,"pending-manual-cross-check");
});

test("only the two Rupa observances are manually source-approved while their parent records remain review-only", async () => {
  const review = JSON.parse(await readFile(new URL("../data/references/ohd-dwadashi-2030-review.json", import.meta.url)));
  const records = review.tithis.filter(record => record.month === "पौष" && record.paksha === "कृष्ण");
  assert.deepEqual(records.map(record => [record.id, record.selectedDate]), [
    ["pausha-krishna", "2030-01-01"],
    ["pausha-krishna-occurrence-2", "2030-12-22"]
  ]);
  assert.ok(records.every(record => record.status === "needs-review"));
  assert.ok(records.every(record => record.dateSelection === "single-observation-candidate-review-required"));
  assert.equal(review.sourceReview.status, "pending-manual-cross-check");
  for (const record of records) {
    assert.equal(record.status, "needs-review", "the parent record remains pending for its separate cross-reference");
    const rite = record.observanceDateReviews.find(item => item.observanceId === "rupa");
    assert.equal(rite.reviewStatus, "approved");
    assert.equal(rite.autoApproved, false);
    assert.match(rite.reviewBasis, /नारद पुराण/);
    assert.equal(rite.reviewStatus, "approved");
    assert.equal(rite.autoApproved, false);
    assert.match(rite.source, /नारद पुराण/);
    assert.equal(record.sunriseObservations[0].date, rite.selectedDate);
    assert.ok(Date.parse(record.sunriseObservations[0].tithiStartTime) < Date.parse(record.sunriseObservations[0].sunrise));
    assert.ok(Date.parse(record.sunriseObservations[0].sunrise) < Date.parse(record.sunriseObservations[0].tithiEndTime));
  }
});

test("both 2030 Rupa morning rites follow a distinct Pausha Krishna Ekadashi fast", async () => {
  const review = JSON.parse(await readFile(new URL("../data/references/ohd-dwadashi-2030-review.json", import.meta.url)));
  const records = review.tithis.filter(record => record.month === "पौष" && record.paksha === "कृष्ण");
  assert.equal(records.length, 2);
  const observer = new panchangPackage.Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset: 330, calendarType: "purnimanta" };
  for (const record of records) {
    const rite = record.observanceDateReviews.find(item => item.observanceId === "rupa");
    const at = Date.parse(rite.selectedDate + "T06:30:00Z");
    const puja = panchangPackage.getPanchangam(new Date(at), observer, options);
    const fast = panchangPackage.getPanchangam(new Date(at - 86400000), observer, options);
    assert.equal(fast.tithi, 25);
    assert.equal(puja.tithi, 26);
    assert.equal(puja.masa.name, "Pausha");
    assert.ok(puja.tithiStartTime < puja.sunrise && puja.sunrise < puja.tithiEndTime);
    assert.equal(rite.vrataDate, new Date(at - 86400000).toISOString().slice(0, 10));
    const file = "../data/festivals/" + rite.selectedDate.slice(0, 7) + ".json";
    const month = JSON.parse(await readFile(new URL(file, import.meta.url)));
    const cards = month.events.filter(event => event.title.startsWith("रूप-व्रत"));
    assert.deepEqual(cards.map(card => card.date), [rite.selectedDate]);
    assert.equal(cards[0].sourceUrl, rite.sourceUrl);
  }
});

test("2030 Govatsa and Krishna Padmanabha have separate local evidence", async () => {
  const review = JSON.parse(await readFile(new URL("../data/references/ohd-dwadashi-2030-review.json", import.meta.url)));
  const record = review.tithis.find(item => item.id === "kartika-krishna");
  const [govatsa, padmanabha] = record.observanceDateReviews;
  assert.equal(govatsa.dateRole, "pradosha-worship");
  assert.equal(padmanabha.followingMorningDate, "2030-10-24");
  const observer = new panchangPackage.Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset: 330, calendarType: "purnimanta" };
  const evening = panchangPackage.getPanchangam(new Date("2030-10-23T06:30:00Z"), observer, options);
  const morning = panchangPackage.getPanchangam(new Date("2030-10-24T06:30:00Z"), observer, options);
  assert.equal(morning.tithi, 26);
  assert.ok(morning.tithiStartTime < evening.sunset && morning.sunrise < morning.tithiEndTime);
  const month = JSON.parse(await readFile(new URL("../data/festivals/2030-10.json", import.meta.url)));
  for (const rite of [govatsa, padmanabha]) {
    assert.ok(month.events.some(event => event.title === rite.name && event.date === rite.selectedDate));
  }
});

test("the canonical Pithoragarh scan reproduces all 25 archived 2030 date sets and keeps the September rites independent", async () => {
  const archive = JSON.parse(await readFile(new URL("../data/references/ohd-dwadashi-2030-review.json", import.meta.url), "utf8"));
  const audit = archive.sourceReview.canonicalObserverAudit;
  const current = await generateYear(2030);
  assert.deepEqual(audit.location, {latitude:29.5828, longitude:80.2182, elevation:1650, timezone:"Asia/Kolkata"});
  for (const [key, value] of Object.entries(audit.location)) assert.equal(current.location[key], value);
  assert.equal(current.annualReview.dailyPanchang.length, 365);
  assert.equal(audit.days, 365);
  assert.equal(current.tithis.length, 25);
  assert.equal(audit.matchedRecords, 25);
  assert.deepEqual(audit.matchedFields, ["sunriseDates", "noonDates", "candidateDates"]);
  const archived = new Map(archive.tithis.map(item => [item.id, item]));
  assert.deepEqual(current.tithis.map(item => item.id).sort(), [...archived.keys()].sort());
  for (const item of current.tithis) {
    for (const field of audit.matchedFields) assert.deepEqual(item[field], archived.get(item.id)[field], item.id + " " + field);
  }
  const september = current.tithis.find(item => item.id === "bhadrapada-shukla");
  for (const item of [september, archived.get(september.id)]) {
    assert.deepEqual(item.candidateDates, ["2030-09-08", "2030-09-09"]);
    assert.equal(item.selectedDate, null);
    assert.equal(item.referenceDate, null);
    assert.equal(item.drikSpecialObservances[0].observanceDate, "2030-09-09");
  }
});

test("Varaha and Rama-Lakshmana worship precede the next morning's gift during one local Dwadashi", async () => {
  const review = JSON.parse(await readFile(new URL("../data/references/ohd-dwadashi-2030-review.json", import.meta.url)));
  const cases = [
    ["magha-shukla", "varaha", "2030-02-14", "2030-02-15"],
    ["jyeshtha-shukla", "rama", "2030-06-12", "2030-06-13"]
  ];
  const observer = new panchangPackage.Observer(29.5828, 80.2182, 1650);
  const localDay = date => panchangPackage.getPanchangam(new Date(date + "T06:30:00Z"), observer,
    {timezoneOffset:330, calendarType:"purnimanta"});
  for (const [id, observance, start, next] of cases) {
    const rite = review.tithis.find(item => item.id === id).observanceDateReviews.find(item => item.observanceId === observance);
    assert.equal(rite.selectedDate, start);
    assert.equal(rite.followingMorningDate, next);
    const first = localDay(start), second = localDay(next);
    assert.equal(first.tithi, 10);
    assert.equal(second.tithi, 11);
    assert.ok(second.tithiStartTime < first.sunset && first.sunset < second.sunrise);
    assert.ok(second.sunrise < second.tithiEndTime && second.tithiEndTime < second.sunset);
    const month = JSON.parse(await readFile(new URL("../data/festivals/" + start.slice(0, 7) + ".json", import.meta.url)));
    const cards = month.events.filter(event => event.title === rite.name);
    assert.deepEqual(cards.map(event => event.date), [start]);
    assert.equal(cards[0].muhurtaRule, undefined);
    assert.equal(cards[0].sourceUrl, rite.sourceUrl);
  }
});

test("annual Dwadashi workflow keeps PR validation read-only and scopes writes to trusted main runs", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/annual-dwadashi-source-review.yml", import.meta.url),
    "utf8"
  );
  const generatorJob = workflow.split("  publish-review-drafts:")[0];
  assert.match(generatorJob, /permissions:\s+contents:\s+read/);
  assert.doesNotMatch(generatorJob, /contents:\s+write|pull-requests:\s+write/);
  assert.match(generatorJob, /persist-credentials:\s+false/);

  const publisherJob = workflow.slice(workflow.indexOf("  publish-review-drafts:"));
  assert.match(publisherJob, /if:.*github\.ref == 'refs\/heads\/main'/);
  assert.match(publisherJob, /permissions:\s+contents:\s+write/);
  assert.doesNotMatch(publisherJob, /pull-requests:\s+write/);
});


test("2030 Bhadrapada Shukla Shravana-Dwadashi date analysis preserves the 8 September vrata day without auto-approval", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const review = JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), "../data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "bhadrapada-shukla");
  const analysis = record.dateComparisonAnalysis;
  assert.ok(analysis, "date-selection analysis must be documented");
  assert.equal(analysis.referencePanchang.observanceDate, "2030-09-08");
  assert.match(analysis.publishedRule.shravanaYoga, /कम-से-कम एक मुहूर्त/);
  assert.match(analysis.publishedRule.combinedFast, /अगले दिन पारण/);
  assert.equal(analysis.pithoragarh.dwadashiStart, "2030-09-08T08:21:59.472+05:30");
  assert.equal(analysis.pithoragarh.shravanaStart, "2030-09-08T19:59:00.797+05:30");
  assert.equal(analysis.pithoragarh.dwadashiEnd, "2030-09-09T06:32:49.720+05:30");
  assert.equal(analysis.pithoragarh.dwadashiAtFollowingSunriseRemainingSeconds, 2513.958);
  assert.equal(analysis.disposition.mainVrataDate, "2030-09-08");
  assert.equal(analysis.disposition.followingMorningActionDate, "2030-09-09");
  assert.equal(analysis.autoApproved, false);
  assert.equal(record.selectedDate, null, "tithi-level selection must remain pending while observance-specific reviews are unresolved");
  assert.equal(record.status, "needs-review");
  assert.equal(review.status, "needs-review");
});


test("Varaha Purana monthly Dwadashi source references use the actual chapter sequence and keep chapter 39's ambiguity internal", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const rules = JSON.parse(await readFile(resolve(root, "data/dwadashi-vrata-rules.json"), "utf8"));
  const expected = [
    ["मार्गशीर्ष", "standard-margashirsha", 39],
    ["पौष", "kurma", 40],
    ["माघ", "varaha", 41],
    ["फाल्गुन", "narasimha", 42],
    ["चैत्र", "vamana", 43],
    ["वैशाख", "parashurama", 44],
    ["ज्येष्ठ", "rama", 45],
    ["आषाढ़", "vasudeva", 46],
    ["श्रावण", "damodara", 47],
    ["भाद्रपद", "kalki", 48],
    ["आश्विन", "padmanabha-varaha", 49],
    ["कार्तिक", "sahasrashirsha", 50]
  ];
  for (const [month, id, chapter] of expected) {
    const tithi = rules.unifiedTithiIndex.tithis.find(x => x.month === month && x.paksha === "शुक्ल");
    const observance = tithi.observances.find(x => x.id === id);
    assert.ok(observance, `missing ${id} for ${month}`);
    assert.ok(observance.source.includes("अध्याय " + chapter), `wrong chapter for ${id}`);
    assert.doesNotMatch(JSON.stringify(observance), /https?:\/\//i);
  }
  const margashirsha = rules.unifiedTithiIndex.tithis.find(x => x.id === "margashirsha-shukla");
  const dharani = margashirsha.observances.find(x => x.id === "standard-margashirsha");
  assert.match(dharani.sourceTextNote, /अध्याय-शीर्षक और पाठ-शरीर/);
  assert.match(dharani.source, /अध्याय 39 — धरणी-व्रत/);
  assert.equal(margashirsha.observances.some(x => x.id === "matsya"), false);
  assert.deepEqual(margashirsha.displayNames, ["साध्य-व्रत", "धरणी-व्रत"]);
  const damodara = rules.unifiedTithiIndex.tithis.find(x => x.id === "shravana-shukla").observances.find(x => x.id === "damodara");
  assert.match(damodara.sourceTextNote, /47\.1/);
  const bhadrapadaDamodara = rules.unifiedTithiIndex.tithis.find(x => x.id === "bhadrapada-shukla").observances.find(x => x.id === "damodara");
  assert.equal(bhadrapadaDamodara.sourceProfile, "naradaPurana");
  assert.equal(bhadrapadaDamodara.source, "नारद पुराण, पूर्वार्ध, अध्याय 121");
  assert.equal(bhadrapadaDamodara.sourceTextNote, undefined);
  const kalki = rules.unifiedTithiIndex.tithis.find(x => x.id === "bhadrapada-shukla").observances.find(x => x.id === "kalki");
  assert.match(kalki.sourceTextNote, /48\.1/);
  const may2030 = JSON.parse(await readFile(resolve(root, "data/festivals/2030-05.json"), "utf8"));
  for (const title of ["माधव-द्वादशी व्रत", "परशुराम-द्वादशी"]) {
    const card = may2030.events.find(x => x.title === title);
    assert.ok(card, `missing public card ${title}`);
    assert.equal(JSON.stringify(card).includes("http"), false);
  }

  for (const year of [2026, 2027, 2028, 2029, 2030]) {
    const annual = JSON.parse(await readFile(resolve(root, `data/references/ohd-dwadashi-${year}-review.json`), "utf8"));
    const t = annual.tithis.find(x => x.id === "margashirsha-shukla");
    assert.ok(t.observances.find(x => x.id === "standard-margashirsha").sourceTextNote, `chapter 39 note missing in ${year}`);
    assert.equal(t.observances.some(x => x.id === "matsya"), false);
    const bhadrapada = annual.tithis.find(x => x.id === "bhadrapada-shukla");
    const naradaDamodara = bhadrapada.observances.find(x => x.id === "damodara");
    assert.equal(naradaDamodara.sourceProfile, "naradaPurana");
    assert.equal(naradaDamodara.source, "नारद पुराण, पूर्वार्ध, अध्याय 121");
    for (const record of annual.tithis) {
      for (const observance of record.observances || []) {
        if (observance.sourceProfile === "varahaPurana") assert.equal(JSON.stringify(observance).includes("http"), false);
      }
    }
  }
});

test("2030 Shravana Damodara Dwadashi matches the local sunrise observation and Sanskrit text", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const review = JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), "../data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "shravana-shukla");
  const analysis = record.dateComparisonAnalysis;
  assert.equal(analysis.referencePanchang.observanceDate, "2030-08-10");
  assert.equal(analysis.referencePanchang.dwadashiStart, "2030-08-10T01:59:00+05:30");
  assert.equal(analysis.referencePanchang.dwadashiEnd, "2030-08-10T23:23:00+05:30");
  assert.equal(analysis.pithoragarh.sunriseTithi, "द्वादशी");
  assert.equal(analysis.pithoragarh.dateMatch, true);
  assert.match(analysis.sourceReading.primary, /द्वादशी/);
  assert.match(analysis.sourceReading.translationCaution, /मेल नहीं खाता/);
  assert.equal(analysis.autoApproved, false);
  assert.equal(record.selectedDate, "2030-08-10");
  assert.equal(record.status, "needs-review");
});

test("2030 Pausha Krishna keeps the named Matsya observance distinct from Narada Purana Rupa vrata", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const review = JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), "../data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "pausha-krishna-occurrence-2");
  const analysis = record.dateComparisonAnalysis;
  assert.equal(analysis.referencePanchang.observanceDate, "2030-12-21");
  assert.equal(analysis.referencePanchang.paranaDate, "2030-12-22");
  assert.match(analysis.referencePanchang.sourceTextConflict, /परस्पर विरोधी/);
  assert.equal(analysis.pithoragarh.followingSunrise, "2030-12-22T07:00:33.432+05:30");
  assert.equal(analysis.pithoragarh.dwadashiEnd, "2030-12-22T09:41:50.353+05:30");
  assert.equal(analysis.distinctObservance.referenceVrataDate, "2030-12-21");
  assert.equal(analysis.distinctObservance.naradaMorningWorshipDate, "2030-12-22");
  assert.equal(analysis.autoApproved, false);
  const rupa = record.observanceDateReviews.find(x => x.observanceId === "rupa");
  assert.equal(rupa.reviewStatus, "approved");
  assert.equal(rupa.selectedDate, "2030-12-22");
  assert.equal(record.status, "needs-review");
});


test("2030 Varaha Dwadashi follows the Varaha Purana Ekadashi-to-dawn sequence without moving the parent tithi", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "magha-shukla");
  const vrata = record.observanceDateReviews.find(x => x.observanceId === "varaha");
  assert.equal(record.selectedDate, "2030-02-15");
  assert.equal(record.status, "needs-review");
  assert.equal(vrata.selectedDate, "2030-02-14");
  assert.equal(vrata.followingMorningDate, "2030-02-15");
  assert.equal(vrata.dateRole, "ekadashi-day-preparation-and-following-dawn-donation");
  assert.equal(vrata.reviewStatus, "approved");
  assert.equal(vrata.autoApproved, false);
  assert.match(vrata.reviewBasis, /41\.2/);
  assert.match(vrata.reviewBasis, /41\.11/);
  assert.match(vrata.reviewBasis, /41\.12–13/);
  assert.match(vrata.localDayDecision, /14 फरवरी के स्थानीय सूर्योदय-दिन पर एकादशी/);
  assert.match(vrata.localDayDecision, /15 फरवरी सूर्योदय 06:49:06 IST/);

  const february = JSON.parse(await readFile(resolve(root, "data/festivals/2030-02.json"), "utf8"));
  const card = february.events.find(x => x.title === "वराह-द्वादशी व्रत");
  assert.equal(card.date, "2030-02-14");
  assert.match(card.description, /एकादशी-दिन संकल्प/);
  assert.match(card.description, /15 फरवरी सूर्योदय/);
  assert.equal(card.sourceName, "वराह पुराण, अध्याय 41, श्लोक 1–13");
  assert.equal(card.sourceUrl, undefined);
});


test("2030 Krishna Narasimha distinguishes the prior sunrise-day label from local puja and parana date", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "chaitra-krishna");
  const vrata = record.observanceDateReviews.find(x => x.observanceId === "krishna-narasimha");
  assert.equal(record.status, "needs-review");
  assert.equal(vrata.sourceCrossCheck.referenceCalendarDate, "2030-03-29");
  assert.equal(vrata.sourceCrossCheck.referenceTithiStart, "2030-03-30T00:34:00+05:30");
  assert.equal(vrata.vrataDate, "2030-03-29");
  assert.equal(vrata.observanceAndParanaDate, "2030-03-30");
  assert.equal(vrata.localDayEvidence.sunriseTithi, "द्वादशी");
  assert.equal(vrata.localDayEvidence.followingSunriseTithi, "त्रयोदशी");
  assert.match(vrata.localDayDecision, /29 मार्च के सूर्योदय से 30 मार्च के सूर्योदय/);
  assert.equal(vrata.autoApproved, false);

  const march = JSON.parse(await readFile(resolve(root, "data/festivals/2030-03.json"), "utf8"));
  const card = march.events.find(x => x.title === "कृष्ण नृसिंह द्वादशी");
  assert.equal(card.date, "2030-03-30");
  assert.equal(card.associatedEkadashiDate, "2030-03-29");
  assert.equal(card.paranaDate, "2030-03-30");
  assert.equal(card.sourceName, undefined);
  assert.equal(card.sourceUrl, undefined);
});


test("2030 Rama Lakshmana Dwadashi worship date and following-morning donation match Varaha Purana chapter 45", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "jyeshtha-shukla");
  const vrata = record.observanceDateReviews.find(x => x.observanceId === "rama");
  assert.equal(record.selectedDate, "2030-06-13");
  assert.equal(record.status, "needs-review");
  assert.equal(vrata.selectedDate, "2030-06-12");
  assert.equal(vrata.followingMorningDate, "2030-06-13");
  assert.equal(vrata.reviewStatus, "approved");
  assert.equal(vrata.autoApproved, false);
  assert.match(vrata.reviewBasis, /45\.1/);
  assert.match(vrata.reviewBasis, /45\.5/);
  assert.match(vrata.localDayDecision, /12 जून को पिथौरागढ़ में द्वादशी 14:06:03 IST/);
  assert.match(vrata.localDayDecision, /13 जून के सूर्योदय 05:08:59 IST/);

  const june = JSON.parse(await readFile(resolve(root, "data/festivals/2030-06.json"), "utf8"));
  const card = june.events.find(x => x.title === "रामलक्ष्मण द्वादशी");
  assert.equal(card.date, "2030-06-12");
  assert.equal(card.sourceName, "वराह पुराण, अध्याय 45, श्लोक 1–5");
  assert.equal(card.sourceUrl, undefined);
});


test("2030 Bhadrapada Shukla Dwadashi approves four observance dates without approving the parent tithi or mislabeling Vamana Jayanti", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "bhadrapada-shukla");
  assert.equal(record.selectedDate, null);
  assert.equal(record.status, "needs-review");
  for (const id of ["vamana", "damodara", "niranjana", "kalki"]) {
    const item = record.observanceDateReviews.find(x => x.observanceId === id);
    assert.equal(item.selectedDate, "2030-09-08");
    assert.equal(item.reviewStatus, "approved");
    assert.equal(item.autoApproved, false);
    assert.ok(item.reviewBasis.length > 80);
    assert.match(item.localDayDecision, /8 सितंबर/);
  }
  const vamana = record.observanceDateReviews.find(x => x.observanceId === "vamana");
  assert.match(vamana.reviewBasis, /जयंती नहीं/);
  assert.match(vamana.jayantiRuleConflict.result, /मध्याह्न के बाद/);
  const september = JSON.parse(await readFile(resolve(root, "data/festivals/2030-09.json"), "utf8"));
  for (const title of ["वामन-द्वादशी व्रत", "कल्कि द्वादशी", "दामोदर-द्वादशी व्रत", "नीराजन-व्रत"]) {
    const card = september.events.find(x => x.date === "2030-09-08" && x.title === title);
    assert.ok(card, "missing card: " + title);
    assert.equal(card.sourceUrl, undefined);
  }
  const vamanaCard = september.events.find(x => x.date === "2030-09-08" && x.title === "वामन-द्वादशी व्रत");
  assert.equal(vamanaCard.category, "व्रत");
});


test("2030 Vaishakha Shukla Madhava and Parashurama Dwadashi dates follow their Purana observance sequences without approving the parent tithi", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "vaishakha-shukla");
  assert.equal(record.selectedDate, "2030-05-14");
  assert.equal(record.status, "needs-review");
  assert.equal(record.dateSelection, "trisparsha-mahadwadashi-candidate-review-required");
  for (const id of ["madhava", "parashurama"]) {
    const item = record.observanceDateReviews.find(x => x.observanceId === id);
    assert.equal(item.selectedDate, "2030-05-14");
    assert.equal(item.reviewStatus, "approved");
    assert.equal(item.autoApproved, false);
    assert.ok(item.reviewBasis.length > 100);
    assert.match(item.localDayDecision, /14 मई/);
  }
  const parashurama = record.observanceDateReviews.find(x => x.observanceId === "parashurama");
  assert.equal(parashurama.followingMorningActionDate, "2030-05-15");
  assert.match(parashurama.reviewBasis, /44\.1–7/);
  const may = JSON.parse(await readFile(resolve(root, "data/festivals/2030-05.json"), "utf8"));
  assert.equal(may.events.find(x => x.title === "माधव-द्वादशी व्रत").date, "2030-05-14");
  assert.equal(may.events.find(x => x.title === "परशुराम-द्वादशी").date, "2030-05-14");
  assert.equal(may.events.some(x => /गौण|वैष्णव/.test(x.title || "")), false);
});


test("2030 Ashwin Padmanabha Dwadashi source observances use the evening tithi-entry date and following-morning rites", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "ashwin-shukla");
  assert.equal(record.status, "needs-review");
  assert.equal(record.selectedDate, "2030-10-07");
  for (const id of ["padmanabha-narada", "padmanabha-varaha"]) {
    const item = record.observanceDateReviews.find(x => x.observanceId === id);
    assert.equal(item.selectedDate, "2030-10-07");
    assert.equal(item.reviewStatus, "approved");
    assert.equal(item.autoApproved, false);
    assert.ok(item.reviewBasis.length > 100);
    assert.match(item.reviewBasis, /8 अक्टूबर/);
  }
  const varaha = record.observanceDateReviews.find(x => x.observanceId === "padmanabha-varaha");
  assert.match(varaha.reviewBasis, /49\.1–4/);
  assert.match(varaha.localDayDecision, /वराह पुराण अध्याय 49/);
  assert.doesNotMatch(varaha.localDayDecision, /नारद पुराण/);
  const narada = record.observanceDateReviews.find(x => x.observanceId === "padmanabha-narada");
  assert.match(narada.reviewBasis, /17\.74–78/);
  assert.equal(record.shravanaLabelDecision.status, "rejected-as-local-yoga");
  assert.equal(record.shravanaLabelDecision.localDwadashiShravanaOverlapMs, 0);
  const october = JSON.parse(await readFile(resolve(root, "data/festivals/2030-10.json"), "utf8"));
  const card = october.events.find(x => x.date === "2030-10-07" && x.title === "पद्मनाभ द्वादशी");
  assert.ok(card);
  assert.equal(card.followingMorningActionDate, "2030-10-08");
});

test("2030 Kartika Krishna Govatsa Dwadashi selects the first Pradosha-vyapini day without approving the parent tithi", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"));
  const record = review.tithis.find(x => x.id === "kartika-krishna");
  assert.equal(record.status, "needs-review");
  assert.equal(record.selectedDate, "2030-10-23");
  const item = record.observanceDateReviews.find(x => x.observanceId === "govatsa");
  assert.equal(item.selectedDate, "2030-10-23");
  assert.equal(item.dateRole, "pradosha-worship");
  assert.equal(item.reviewStatus, "approved");
  assert.equal(item.autoApproved, false);
  assert.match(item.reviewBasis, /1\.4\.121\.27b–35a/);
  assert.match(item.reviewBasis, /भविष्योत्तर पुराण/);
  assert.match(item.localDayDecision, /23 अक्टूबर/);
  const october = JSON.parse(await readFile(resolve(root, "data/festivals/2030-10.json"), "utf8"));
  const card = october.events.find(x => x.date === "2030-10-23" && x.title === "गोवत्स द्वादशी");
  assert.ok(card);
  assert.equal(card.muhurtaRule, "govatsa-dwadashi-pradosh-kala");
  assert.equal(card.sourceUrl, "https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=2030");
});



test("2030 Phalguna Shukla Narasimha and Shrihari observances use the locally sunrise-present Dwadashi", async () => {
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const { getPanchangam, Observer } = panchangPackage;
  const location = new Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset:330, calendarType:"purnimanta" };
  const date = "2030-03-16";
  const noon = new Date(date + "T06:30:00.000Z");
  const day = extractDwadashiDay(getPanchangam(noon, location, options), date, noon);
  assert.ok(day.sunrise, "Pithoragarh sunrise must be available");
  const sunriseInstant = new Date(day.sunrise);
  const sunriseDay = extractDwadashiDay(
    getPanchangam(sunriseInstant, location, options), date, sunriseInstant
  );
  const withinTwoSeconds = (actual, expected) =>
    Math.abs(Date.parse(actual) - Date.parse(expected)) <= 2000;
  assert.ok(withinTwoSeconds(day.sunrise, "2030-03-16T00:48:29.779Z"),
    "local sunrise should reproduce within two seconds");
  assert.equal(sunriseDay.tithi, "द्वादशी");
  assert.ok(withinTwoSeconds(sunriseDay.tithiStartTime, "2030-03-16T00:47:12.929Z"),
    "local Dwadashi start should reproduce within two seconds");
  assert.ok(withinTwoSeconds(sunriseDay.tithiEndTime, "2030-03-17T00:06:35.830Z"),
    "local Dwadashi end should reproduce within two seconds");
  const sunriseMargin = Date.parse(day.sunrise) - Date.parse(sunriseDay.tithiStartTime);
  assert.ok(sunriseMargin >= 60000 && sunriseMargin <= 90000,
    "Dwadashi should begin shortly before the local sunrise, not after it");
  assert.ok(Date.parse(day.sunrise) < Date.parse(sunriseDay.tithiEndTime));

  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(
    resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"
  ));
  const record = review.tithis.find(item => item.id === "phalguna-shukla");
  assert.ok(record);
  assert.equal(record.status, "needs-review", "parent Dwadashi must remain pending");
  assert.equal(record.selectedDate, date);
  for (const id of ["phalguna-hari", "narasimha"]) {
    const decision = record.observanceDateReviews.find(item => item.observanceId === id);
    assert.ok(decision);
    assert.equal(decision.selectedDate, date);
    assert.equal(decision.reviewStatus, "approved");
    assert.equal(decision.autoApproved, false);
    assert.ok(decision.reviewBasis.length > 100);
  }
  const narasimha = record.observanceDateReviews.find(item => item.observanceId === "narasimha");
  assert.match(narasimha.reviewBasis, /42\.1–5/);
  const hari = record.observanceDateReviews.find(item => item.observanceId === "phalguna-hari");
  assert.match(hari.reviewBasis, /121\.89b–91a/);
  const march = JSON.parse(await readFile(
    resolve(root, "data/festivals/2030-03.json"), "utf8"
  ));
  assert.ok(march.events.some(item => item.date === date && item.title === "नृसिंह द्वादशी"));
});
  

test("2030 Ashadha Shukla Dwadashi includes the separate Narada Purana twelve-Brahmin vrata", async () => {
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const { getPanchangam, Observer } = panchangPackage;
  const location = new Observer(29.5828, 80.2182, 1650);
  const options = { timezoneOffset:330, calendarType:"purnimanta" };
  const date = "2030-07-12";
  const instant = new Date(date + "T00:00:00.000Z");
  const day = extractDwadashiDay(getPanchangam(instant, location, options), date, instant);
  const withinTwoSeconds = (actual, expected) =>
    Math.abs(Date.parse(actual) - Date.parse(expected)) <= 2000;
  assert.equal(day.tithi, "द्वादशी");
  assert.ok(withinTwoSeconds(day.sunrise, "2030-07-11T23:47:58.620Z"));
  assert.ok(withinTwoSeconds(day.tithiStartTime, "2030-07-11T14:47:45.380Z"));
  assert.ok(withinTwoSeconds(day.tithiEndTime, "2030-07-12T11:43:43.352Z"));

  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const review = JSON.parse(await readFile(
    resolve(root, "data/references/ohd-dwadashi-2030-review.json"), "utf8"
  ));
  const record = review.tithis.find(item => item.id === "ashadha-shukla");
  assert.ok(record);
  assert.equal(record.status, "needs-review");
  const decision = record.observanceDateReviews.find(item => item.observanceId === "ashadha-vishnu");
  assert.ok(decision);
  assert.equal(decision.selectedDate, date);
  assert.equal(decision.reviewStatus, "approved");
  assert.equal(decision.autoApproved, false);
  assert.match(decision.reviewBasis, /121\.19b–21a/);
  assert.match(decision.reviewBasis, /बारह ब्राह्मणों/);
  const annual = JSON.parse(await readFile(resolve(root, "data/dwadashi/2030.json"), "utf8"));
  const publicRecord = annual.tithis.find(item => item.id === "ashadha-shukla");
  assert.equal(publicRecord.status, "needs-review");
  assert.ok(publicRecord.observances.some(item => item.id === "ashadha-vishnu"));
  assert.ok(publicRecord.observances.some(item => item.id === "vasudeva"));
});
  
test("generates a 2031 local Panchang and Chaturmas review draft without hard-coded annual references", async () => {
  const result = await generateYear(2031);
  assert.equal(result.annualReview.year, 2031);
  assert.equal(result.annualReview.calculationStatus, "research-only-not-approved");
  assert.equal(result.annualReview.dailyPanchang.length, 365);
  assert.ok(result.annualReview.dailyPanchang.filter(day => day.moonrise).length > 300, "2031 annual Panchang must include local moonrise on most days");
  assert.equal(result.sourceReview.chaturmasStartCrossCheck.status, "no-configured-reference-manual-cross-check-required");
  assert.equal(result.sourceReview.chaturmasEndCrossCheck.status, "no-configured-reference-manual-cross-check-required");
  assert.deepEqual(result.sourceReview.chaturmasStartCrossCheck.sources, []);
  assert.deepEqual(result.sourceReview.chaturmasEndCrossCheck.sources, []);
  assert.equal(result.annualReview.catalog.length, 0);
  assert.equal(result.annualReview.sourceReview.catalogMonthsMissing.length, 12);
  assert.ok(result.chaturmas.boundaries.length >= 4, "future-year Chaturmas boundary candidates should be calculated");
  assert.ok(result.chaturmas.reviewWarnings.some(w=>w.code==="adhika-month-within-chaturmas"&&w.months.includes("भाद्रपद")));
  assert.ok(result.chaturmas.reviewWarnings.some(w=>w.code==="extended-phase-review-required"&&w.phaseId==="dahi"&&w.days===59));
  assert.ok(result.chaturmas.boundaries.every(item => item.status !== "approved"), "generated boundaries must never be auto-approved");
});


test("2031 committed annual review draft includes local moonrise and remains unapproved", async () => {
  const annual = JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2031.json", import.meta.url), "utf8"));
  assert.equal(annual.year, 2031);
  assert.equal(annual.calculationStatus, "research-only-not-approved");
  assert.equal(annual.dailyPanchang.length, 365);
  assert.equal(annual.dailyPanchang.filter(day => day.moonrise).length, 353);
  assert.equal(annual.catalog.length, 0);
  assert.equal(annual.sourceReview.catalogMonthsMissing.length, 12);
  assert.equal(annual.dailyPanchang[0].date, "2031-01-01");
  assert.ok(annual.dailyPanchang[0].moonrise);
});

test("2031 Dwadashi and Chaturmas review remains pending source verification", async () => {
  const review = JSON.parse(await readFile(new URL("../data/references/ohd-dwadashi-2031-review.json", import.meta.url), "utf8"));
  assert.equal(review.year, 2031);
  assert.equal(review.status, "needs-review");
  assert.equal(review.calculationStatus, "panchang-engine-calculated-needs-source-review");
  assert.equal(review.tithis.length, 26);
  assert.equal(review.tithiDates.length, 30);
  assert.equal(review.chaturmas.status, "needs-review");
  assert.equal(review.chaturmas.boundaries.length, 5);
  assert.equal(review.chaturmas.missingBoundaries.length, 0);
  assert.equal(review.sourceReview.status, "pending-manual-cross-check");
  assert.equal(review.sourceReview.chaturmasStartCrossCheck.status, "no-configured-reference-manual-cross-check-required");
  assert.equal(review.sourceReview.chaturmasEndCrossCheck.status, "no-configured-reference-manual-cross-check-required");
});


test("annual review draft publishing never overwrites existing hand-reviewed Dwadashi files", async () => {
  const workflow = await readFile(new URL("../.github/workflows/annual-dwadashi-source-review.yml", import.meta.url), "utf8");
  assert.match(workflow, /for file in artifacts\/dwadashi-review\/\*\.json/);
  assert.match(workflow, /if \[ ! -f "\$target" \]; then[\s\S]*cp "\$file" "\$target"/);
  assert.doesNotMatch(workflow, /cp artifacts\/dwadashi-review\/\*\.json data\/references\//);
});
