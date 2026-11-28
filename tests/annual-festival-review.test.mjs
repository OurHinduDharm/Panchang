import test from "node:test";
import assert from "node:assert/strict";
import {buildAnnualFestivalReview,validateAnnualInput,buildRuleCoverageReview,buildRecurringFestivalReview} from "../scripts/generate-annual-festival-review.mjs";
const year=2031;
const dailyPanchang=Array.from({length:365},(_,i)=>{
  const date=new Date(Date.UTC(year,0,i+1)).toISOString().slice(0,10);
  const selected=date==="2031-09-10";
  return {date,masa:selected?"भाद्रपद":"पौष",sunrise:date+"T00:00:00Z",sunset:date+"T12:00:00Z",tithiIntervals:[{index:selected?3:0,startTime:date+"T04:00:00Z",endTime:date+"T08:00:00Z"}]};
});
const annual={year,dailyPanchang};
const sourceMonths=Array.from({length:12},(_,i)=>({year:2030,month:i+1,events:i===8?[{date:"2030-09-01",title:"विनायक चतुर्थी",description:"पूजन करें।",articleUrl:"https://example.com/article",reviewStatus:"approved",muhurtaRule:"old-rule"},{date:"2030-09-02",title:"अमैप्ड पर्व"}]:[]}));
const manifest={year:2030,mappings:[{recordKey:"2030-09-01::विनायक चतुर्थी",observanceId:"x",ruleId:"vinayaka-chaturthi-madhyahna",lunarMonth:"भाद्रपद",paksha:"शुक्ल पक्ष",targetTithiIndex:3,classification:"manual-review"}]};
test("review batch resolves target year independently and preserves source copy without public approval",()=>{
 const output=buildAnnualFestivalReview({annual,manifest,sourceMonths,year});
 assert.equal(output.counts.selected,1);
 assert.equal(output.counts.unmapped,1);
 assert.equal(output.monthlyReview["2031-09"][0].selectedDate,"2031-09-10");
 assert.equal(output.monthlyReview["2031-09"][0].sourceContent.description,"पूजन करें।");
 assert.equal(output.monthlyReview["2031-09"][0].sourceContent.articleUrl,"https://example.com/article");
 assert.equal(output.monthlyReview["2031-09"][0].publishable,false);
 assert.equal(output.publishable,false);
 assert.equal(sourceMonths[8].events[0].date,"2030-09-01");
 assert.equal(Object.keys(output.monthlyReview).length,12);
});
test("missing daily data, duplicate mappings and missing source months fail closed",()=>{
 assert.throws(()=>validateAnnualInput({...annual,dailyPanchang:dailyPanchang.slice(1)},year));
 assert.throws(()=>buildAnnualFestivalReview({annual,manifest:{...manifest,mappings:[...manifest.mappings,...manifest.mappings]},sourceMonths,year}));
 assert.throws(()=>buildAnnualFestivalReview({annual,manifest,sourceMonths:sourceMonths.slice(1),year}));
});

test("historical selector coverage adds missing rule slots without treating titles as identities",()=>{
 const original=manifest.mappings[0];
 const history={year:2029,mappings:[{...original,recordKey:"2029-09-02::अलग नाम",title:"अलग नाम"},{...original,recordKey:"2029-09-03::पुनरावृत्ति",title:"पुनरावृत्ति"},{...original,lunarMonth:"अधिक",recordKey:"2029-01-01::अधिकमास"}]};
 const coverage=buildRuleCoverageReview({annual,manifests:[history,manifest],year,sourceYear:2030});
 assert.equal(coverage.sourceOccurrences,4);
 assert.equal(coverage.distinctRuleSelectors,2);
 assert.equal(coverage.additionalSelectors,1);
 const shared=coverage.slots.find(s=>s.inSourceYear);
 assert.equal(shared.sources.length,3);
 assert.deepEqual(shared.repeatedSourceYears,[2029]);
 assert.ok(shared.calculatedCandidateDate==="2031-09-10");
 const adhika=coverage.slots.find(s=>!s.inSourceYear);
 assert.equal(adhika.status,"manual-review");
 assert.equal(adhika.calculatedCandidateDate,null);
 assert.ok(coverage.slots.every(s=>s.publishable===false));
});

test("recurring observances resolve per lunar cycle, including intercalary months, instead of copying source-year count",()=>{
 const custom=structuredClone(annual);
 for(const date of ["2031-03-08","2031-04-07","2031-04-08"]){
   const day=custom.dailyPanchang.find(d=>d.date===date);
   day.masa=date.startsWith("2031-04")?"अधिक चैत्र":"चैत्र";
   // April two adjacent contexts share one physical tithi interval.
   const first=date.startsWith("2031-04")?"2031-04-07":"2031-03-08";
   const end=date.startsWith("2031-04")?"2031-04-08T02:00:00Z":date+"T08:00:00Z";
   day.tithiIntervals=[{index:3,startTime:first+"T04:00:00Z",endTime:end}];
 }
 const report=buildRecurringFestivalReview({annual:custom,year});
 const vinayaka=report.series.find(r=>r.ruleId==="vinayaka-chaturthi-madhyahna");
 assert.equal(vinayaka.counts.cycles,3);
 assert.equal(vinayaka.counts.selected,3);
 assert.deepEqual(vinayaka.occurrences.map(o=>o.selectedDate),["2031-03-08","2031-04-07","2031-09-10"]);
 assert.equal(vinayaka.occurrences[1].calendarMonthEvidence,"अधिक चैत्र");
 assert.ok(vinayaka.occurrences.every(o=>o.publishable===false));
});
test("recurring audit retains year-edge candidates for manual review",()=>{
 const custom=structuredClone(annual);
 custom.dailyPanchang[0].tithiIntervals=[{index:3,startTime:"2031-01-01T04:00:00Z",endTime:"2031-01-01T08:00:00Z"}];
 const report=buildRecurringFestivalReview({annual:custom,year});
 const first=report.series.find(r=>r.ruleId==="vinayaka-chaturthi-madhyahna").occurrences[0];
 assert.equal(first.selectedDate,null);
 assert.equal(first.status,"manual-review");
 assert.ok(first.warnings.includes("adjacent-year-context-required"));
});

test("same-year comparison distinguishes matches, date differences, and unresolved cards", () => {
  const source = structuredClone(sourceMonths);
  source[8].events.push(
    { date: "2030-09-10", title: "समान तिथि" },
    { date: "2030-09-11", title: "निर्णय शेष" }
  );
  const selector = manifest.mappings[0];
  const comparison = buildAnnualFestivalReview({
    annual: {
      year: 2030,
      dailyPanchang: dailyPanchang.map(day => ({
        ...day,
        date: day.date.replace("2031", "2030"),
        sunrise: day.sunrise.replace("2031", "2030"),
        sunset: day.sunset.replace("2031", "2030"),
        tithiIntervals: day.tithiIntervals.map(row => ({
          ...row,
          startTime: row.startTime.replace("2031", "2030"),
          endTime: row.endTime.replace("2031", "2030")
        }))
      }))
    },
    manifest: { ...manifest, mappings: [
      selector,
      { ...selector, recordKey: "2030-09-10::समान तिथि" },
      { ...selector, recordKey: "2030-09-11::निर्णय शेष", lunarMonth: "कार्तिक" }
    ] },
    sourceMonths: source,
    year: 2030
  }).comparison;
  assert.deepEqual(comparison.counts, { matched: 1, different: 1, unresolved: 1, unmapped: 1 });
  assert.deepEqual(comparison.differences.map(({ sourceDate, calculatedDate }) => [
    sourceDate, calculatedDate
  ]), [["2030-09-01", "2030-09-10"], ["2030-09-11", null]]);
});

import {readFile} from "node:fs/promises";
import {reviewAkshayaTritiya,reviewParashuramaNightEvidence,buildVaishakhaTritiyaComponentReview} from "../scripts/review-vaishakha-tritiya-components.mjs";
function tritiyaDays(start,end){
  const first="2030-05-04",second="2030-05-05",finish="2030-05-06";
  const day=(date,next)=>{
    const a=Date.parse(date+"T00:00:00Z"),b=Date.parse(next+"T00:00:00Z");
    const parts=[[1,a,Math.min(b,start)],[2,Math.max(a,start),Math.min(b,end)],[3,Math.max(a,end),b]];
    return {date,masa:"वैशाख",sunrise:new Date(a).toISOString(),sunset:date+"T12:00:00Z",nextSunrise:new Date(b).toISOString(),
      tithis:parts.filter(([,x,y])=>x<y).map(([index,x,y])=>({index,startTime:new Date(x).toISOString(),endTime:new Date(y).toISOString()}))};
  };
  return [day(first,second),day(second,finish)];
}
test("Akshaya Tritiya independently compares both shastric date variants and refuses a disagreement",()=>{
  const start=Date.parse("2030-05-04T05:00:00Z");
  const result=reviewAkshayaTritiya(tritiyaDays(start,Date.parse("2030-05-05T03:00:00Z")));
  assert.equal(result.candidateDate,"2030-05-05");
  assert.equal(result.publishable,false);
  const conflict=reviewAkshayaTritiya(tritiyaDays(start,Date.parse("2030-05-05T01:00:00Z")));
  assert.equal(conflict.candidateDate,null);
  assert.equal(conflict.variants.nirnayasindhu,"2030-05-05");
  assert.equal(conflict.variants.dharmasindhuSixFixedGhatis,"2030-05-04");
  const equality=reviewAkshayaTritiya(tritiyaDays(start,Date.parse("2030-05-05T02:24:00Z")));
  assert.equal(equality.candidateDate,null);
  assert.equal(equality.variants.dharmasindhuSixFixedGhatis,null);
});
test("Akshaya review fails closed for a missing interval, a broken cycle, and a gap in day dates",()=>{
  const days=tritiyaDays(Date.parse("2030-05-04T18:00:00Z"),Date.parse("2030-05-05T09:00:00Z"));
  assert.equal(reviewAkshayaTritiya(days).candidateDate,"2030-05-05");
  const incomplete=structuredClone(days);incomplete[1].tithis.pop();
  assert.equal(reviewAkshayaTritiya(incomplete).candidateDate,null);
  const gapped=structuredClone(days);gapped[1].date="2030-05-06";
  assert.equal(reviewAkshayaTritiya(gapped).candidateDate,null);
  const broken=structuredClone(days);broken[0].tithis[1].endTime="2030-05-04T23:00:00Z";
  assert.equal(reviewAkshayaTritiya(broken).candidateDate,null);
});
test("real 2030 composite does not assign Parashurama's date to Akshaya, Yugadi and Matangi",async()=>{
 const annual=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2030.json",import.meta.url),"utf8"));
 const result=buildVaishakhaTritiyaComponentReview(annual);
 assert.equal(result.components[0].candidateDate,"2030-05-05");
 assert.equal(result.components[1].candidateDate,null);
 assert.equal(result.components[1].legacyCandidateDate,"2030-05-04");
 assert.equal(result.components[1].sharedRuleCandidateDate,null);
 assert.equal(result.components[1].sharedRuleStatus,"manual-review");
 assert.equal(result.components[1].firstYamaCandidateDate,"2030-05-05");
 assert.equal(result.components[1].evidence[0].firstYamaCoverageMs,0);
 assert.ok(result.components[1].evidence[1].firstYamaCoverageMs>0);
 assert.ok(result.components.slice(2).every(r=>r.candidateDate===null));
 assert.ok(result.components.every(r=>r.publishable===false));
 console.log("VAISHAKHA_TRITIYA_COMPONENTS="+JSON.stringify(result));
});

test("first-yama evidence distinguishes a quarter-night from three night muhurtas",()=>{
  const days=tritiyaDays(Date.parse("2030-05-04T14:30:00Z"),Date.parse("2030-05-05T13:00:00Z"));
  const r=reviewParashuramaNightEvidence(days,"2030-05-04");
  assert.equal(r.evidence[0].threeNightMuhurtasCoverageMs,0);
  assert.equal(r.evidence[0].firstYamaCoverageMs,30*60*1000);
  assert.equal(r.firstYamaCandidateDate,"2030-05-05");
  assert.equal(r.candidateDate,null);
  assert.equal(reviewParashuramaNightEvidence(days,"2030-05-05").candidateDate,"2030-05-05");
  const incomplete=structuredClone(days);incomplete[1].tithis.pop();
  assert.equal(reviewParashuramaNightEvidence(incomplete,"2030-05-05").candidateDate,null);
  const broken=structuredClone(days);broken[0].tithis[1].endTime="2030-05-04T23:00:00Z";
  assert.equal(reviewParashuramaNightEvidence(broken,"2030-05-05").candidateDate,null);
});

import {reviewTrisprishaSunriseCycle,buildEkadashiTrisprishaReview} from "../scripts/review-ekadashi-trisprisha.mjs";
function trisprishaDays(index=10){
  const rows=[[index-1,"2030-05-12T18:00:00Z","2030-05-13T03:00:00Z"],[index,"2030-05-13T03:00:00Z","2030-05-14T01:00:00Z"],[index+1,"2030-05-14T01:00:00Z","2030-05-14T22:00:00Z"],[index+2,"2030-05-14T22:00:00Z","2030-05-15T22:00:00Z"]];
  return ["2030-05-13","2030-05-14","2030-05-15"].map(date=>({date,masa:"वैशाख",sunrise:date+"T00:00:00Z",tithis:rows.map(([index,startTime,endTime])=>({index,startTime,endTime}))}));
}
test("Trisprisha geometry keeps householder and later observance candidates separate in both pakshas",()=>{
  for(const index of [10,25]){
    const result=reviewTrisprishaSunriseCycle(trisprishaDays(index),index);
    assert.equal(result.status,"source-review-required");
    assert.deepEqual(result.sunriseSequence,[index-1,index,index+2]);
    assert.equal(result.candidates.smartaHouseholderEarlier,"2030-05-13");
    assert.equal(result.candidates.mumukshuVaishnavaLater,"2030-05-14");
    assert.equal(result.paranaEvidence.dwadashiAtLaterFastNextSunrise,false);
    assert.equal(result.candidateDate,null);
    assert.equal(result.publishable,false);
  }
});
test("Trisprisha does not infer missing or conflicting evidence",()=>{
  const missing=trisprishaDays();for(const day of missing)day.tithis=day.tithis.filter(r=>r.index!==11);
  assert.equal(reviewTrisprishaSunriseCycle(missing,10).status,"manual-review");
  const conflicting=trisprishaDays();conflicting[1].tithis.push({index:9,startTime:"2030-05-14T00:30:00Z",endTime:"2030-05-14T02:00:00Z"});
  assert.equal(reviewTrisprishaSunriseCycle(conflicting,10).status,"manual-review");
  const normal=trisprishaDays();for(const day of normal){day.tithis[2].endTime="2030-05-15T01:00:00Z";day.tithis[3].startTime="2030-05-15T01:00:00Z";}
  assert.equal(reviewTrisprishaSunriseCycle(normal,10).status,"not-this-pattern");
  const gap=trisprishaDays();gap[0].date="2030-05-12";
  assert.equal(reviewTrisprishaSunriseCycle(gap,10).status,"manual-review");
});
test("real Pithoragarh 2030 Mohini has Dwadashi ksaya and separate candidate dates",async()=>{
  const annual=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2030.json",import.meta.url),"utf8"));
  const report=buildEkadashiTrisprishaReview(annual);
  const result=report.occurrences.find(x=>x.sunriseDates[1]==="2030-05-14"&&x.index===10);
  assert.ok(result,"Mohini Trisprisha evidence must be derived from local data: "+JSON.stringify(report.incomplete));
  assert.deepEqual(result.sunriseSequence,[9,10,12]);
  assert.equal(result.candidates.smartaHouseholderEarlier,"2030-05-13");
  assert.equal(result.candidates.mumukshuVaishnavaLater,"2030-05-14");
  assert.equal(result.candidateDate,null);
  console.log("MOHINI_TRISPRISHA="+JSON.stringify(result));
});

import {normalizeAnnualTrisprishaPartitions} from "../ekadashi-trisprisha.mjs";
test("annual scanner normalization closes only the documented minute gap without mutating raw evidence",()=>{
 const day={date:"2032-06-01",tithis:[
  {index:9,startTime:"2032-06-01T00:00:00Z",endTime:"2032-06-01T03:00:00Z"},
  {index:10,startTime:"2032-06-01T03:01:00Z",endTime:"2032-06-01T12:00:00Z"},
  {index:11,startTime:"2032-06-01T12:02:00Z",endTime:"2032-06-01T18:00:00Z"},
  {index:13,startTime:"2032-06-01T18:01:00Z",endTime:"2032-06-02T00:00:00Z"}
 ]};
 const original=structuredClone(day);
 const [normalized]=normalizeAnnualTrisprishaPartitions([day]);
 assert.equal(normalized.tithis[1].startTime,"2032-06-01T03:00:00.000Z");
 assert.equal(normalized.tithis[2].startTime,original.tithis[2].startTime);
 assert.equal(normalized.tithis[3].startTime,original.tithis[3].startTime);
 assert.deepEqual(day,original);
 assert.deepEqual(normalizeAnnualTrisprishaPartitions([normalized]),[normalized]);
});

import {reviewTrisprishaParanaWindows} from "../ekadashi-trisprisha.mjs";
test("Trisprisha parana separates Hari Vasara, Aparahna and later Trayodashi evidence",()=>{
  const days=trisprishaDays().map(day=>({...day,sunset:day.date+"T12:00:00Z"}));
  const r=reviewTrisprishaParanaWindows(days,10);
  assert.equal(r.status,"source-review-required");
  assert.equal(r.hariVasaraEnd,"2030-05-14T06:15:00.000Z");
  assert.equal(r.earlierFast.pratah,null);
  assert.deepEqual(r.earlierFast.aparahna,{start:"2030-05-14T07:12:00.000Z",end:"2030-05-14T09:36:00.000Z"});
  assert.equal(r.earlierFast.postMadhyahna.end,"2030-05-14T12:00:00.000Z");
  assert.equal(r.laterFast.paranaDate,"2030-05-15");
  assert.equal(r.laterFast.trayodashiAtSunrise,true);
  assert.equal(r.laterFast.pratahDiagnostic.end,"2030-05-15T02:24:00.000Z");
  assert.equal(r.approvedWindow,null);
  assert.equal(r.publishable,false);
  const incomplete=structuredClone(days);delete incomplete[1].sunset;
  assert.equal(reviewTrisprishaParanaWindows(incomplete,10).status,"manual-review");
});
test("actual 2030 Mohini parana evidence is bounded by Hari Vasara, Dwadashi and local daylight",async()=>{
  const annual=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2030.json",import.meta.url),"utf8"));
  const result=buildEkadashiTrisprishaReview(annual).occurrences.find(x=>x.sunriseDates[1]==="2030-05-14"&&x.index===10);
  const r=result.paranaReview;
  assert.equal(r.status,"source-review-required");
  assert.equal(r.earlierFast.paranaDate,"2030-05-14");
  assert.equal(r.earlierFast.pratah,null);
  assert.ok(r.earlierFast.aparahna);
  assert.ok(Date.parse(r.earlierFast.aparahna.start)>=Date.parse(r.hariVasaraEnd));
  assert.ok(Date.parse(r.earlierFast.postMadhyahna.end)<=Date.parse(result.dwadashi.end));
  assert.equal(r.laterFast.paranaDate,"2030-05-15");
  assert.equal(r.approvedWindow,null);
  console.log("MOHINI_PARANA_REVIEW="+JSON.stringify(r));
});
