import test from "node:test";
import assert from "node:assert/strict";
import panchangPackage from "@ishubhamx/panchangam-js";
import { buildDwadashiCalendar } from "../dwadashi-calendar.mjs";
import { normalizeEngineTithi, normalizeEnginePaksha, normalizeEngineMasa, extractDwadashiDay, extractAnnualPanchangDay, buildSourceReviewMetadata } from "../scripts/generate-annual-dwadashi-review.mjs";

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
  assert.equal(record.status, "needs-review", "neither observance is automatically approved");
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
    item.sourceProfile==="nirnayaSindhu" && item.id.endsWith("-jayanti")
  );
  assert.ok(jayanti,"25 August must be checked against the Nirnaya Sindhu Punarvasu-Jayanti variant");
  assert.equal(jayanti.nakshatra,"पुनर्वसु");
  assert.ok(jayanti.overlapMinutes>=48);
  assert.equal(jayanti.meetsOneMuhurta,true);
  assert.equal(jayantiRecord.status,"needs-review");

  const vijayaRecord = result.tithis.find(item=>item.id==="bhadrapada-shukla");
  const vijaya = vijayaRecord.specialTithiYogas.find(item=>
    item.sourceProfile==="naradaPurana" && item.id.endsWith("-vijaya")
  );
  assert.ok(vijaya,"8 September must be checked against the Narada Purana Shravana-Vijaya variant");
  assert.equal(vijaya.nakshatra,"श्रवण");
  assert.ok(vijaya.overlapMinutes>=48);
  assert.equal(vijaya.meetsOneMuhurta,true);
  assert.equal(vijayaRecord.status,"needs-review");
});

