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

import {reviewNaradaTrisprishaCycle,resolveTrisprishaSourcePrecedence} from "../ekadashi-trisprisha.mjs";
function naradaDays(index=10,end="2032-06-02T22:50:00Z"){
 const rows=[[index,"2032-06-01T00:00:00Z","2032-06-01T23:00:00Z"],[index+1,"2032-06-01T23:00:00Z",end],[index+2,end,"2032-06-04T00:00:00Z"]];
 return ["2032-06-01","2032-06-02","2032-06-03"].map(date=>({date,masa:"ज्येष्ठ",sunrise:date+"T00:00:00Z",sunset:date+"T12:00:00Z",tithis:rows.map(([index,startTime,endTime])=>({index,startTime,endTime}))}));
}
test("Narada variant is distinct from sunrise Ekadashi and checks both late-night interpretations",()=>{
 for(const index of [10,25]){
  const days=naradaDays(index);
  const r=reviewNaradaTrisprishaCycle(days,index);
  assert.equal(r.status,"source-review-required");
  assert.equal(r.wholeDaylightDwadashi,true);
  assert.equal(r.lastNightDiagnostics.lastFourGhatis,true);
  assert.equal(r.candidateDate,null);
  assert.equal(reviewTrisprishaSunriseCycle(days,index).status,"not-this-pattern");
 }
 const broad=reviewNaradaTrisprishaCycle(naradaDays(10,"2032-06-02T17:00:00Z"),10);
 assert.equal(broad.status,"narada-broad-reading-only");
 const quarter=reviewNaradaTrisprishaCycle(naradaDays(10,"2032-06-02T21:30:00Z"),10);
 assert.equal(quarter.lastNightDiagnostics.lastYama,true);
 assert.equal(quarter.lastNightDiagnostics.lastFourGhatis,false);
 const conflict=naradaDays();conflict[1].tithis.push({index:9,startTime:"2032-06-02T03:00:00Z",endTime:"2032-06-02T04:00:00Z"});
 assert.equal(reviewNaradaTrisprishaCycle(conflict,10).status,"manual-review");
});
test("Trisprisha source precedence is explicit and retains the specific householder prohibition",()=>{
 const cycle=reviewTrisprishaSunriseCycle(trisprishaDays(),10);
 const earlier=resolveTrisprishaSourcePrecedence(cycle,"smarta-householder");
 assert.equal(earlier.selectedDate,"2030-05-13");
 assert.match(earlier.precedence.exception,/Kurma Purana/);
 const later=resolveTrisprishaSourcePrecedence(cycle,"vaishnava");
 assert.equal(later.selectedDate,"2030-05-14");
 assert.equal(later.publishable,false);
 assert.equal(resolveTrisprishaSourcePrecedence({...cycle,arunodaya:{tithiIndex:9}},"vaishnava").selectedDate,null);
 assert.equal(resolveTrisprishaSourcePrecedence(cycle,"smarta-mumukshu").selectedDate,"2030-05-14");
 assert.equal(resolveTrisprishaSourcePrecedence(cycle,undefined).selectedDate,null);
});

test("annual review carries explicit Trisprisha traditions without assigning Mohini's date to Siddhilakshmi",async()=>{
 const real=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-2030.json",import.meta.url),"utf8"));
 const title="मोहिनी एकादशी / सिद्धिलक्ष्मी जयंती";
 const key="2030-05-13::"+title;
 const source=Array.from({length:12},(_,i)=>({year:2030,month:i+1,events:i===4?[{date:"2030-05-13",title}]:[]}));
 const mapping={recordKey:key,observanceId:"mohini",ruleId:"ekadashi-smarta-udaya",lunarMonth:"वैशाख",paksha:"शुक्ल पक्ष",targetTithiIndex:10,ekadashiTradition:"smarta-householder",classification:"manual-review"};
 const input={annual:real,manifest:{year:2030,mappings:[mapping]},sourceMonths:source,year:2030};
 const result=buildAnnualFestivalReview(input).decisions[0];
 assert.equal(result.calculatedCandidateDate,"2030-05-13");
 assert.equal(result.selectedDate,null);
 assert.equal(result.status,"manual-review");
 assert.ok(result.warnings.includes("composite-card-requires-independent-component-decisions"));
 assert.equal(result.trisprishaAlternatives[0].alternatives.find(x=>x.tradition==="vaishnava").selectedDate,"2030-05-14");
 assert.ok(result.trisprishaAlternatives[0].alternatives.every(x=>x.publishable===false));
 const single="मोहिनी एकादशी";
 source[4].events[0].title=single;
 mapping.recordKey="2030-05-13::"+single;
 const singleDecision=buildAnnualFestivalReview(input).decisions[0];
 assert.equal(singleDecision.selectedDate,"2030-05-13");
 assert.equal(singleDecision.publishable,false);
 const other={...mapping,recordKey:"2030-05-14::गौण मोहिनी",ekadashiTradition:"smarta-mumukshu"};
 const coverage=buildRuleCoverageReview({annual:real,manifests:[{year:2030,mappings:[mapping,other]}],year:2030,sourceYear:2030});
 assert.equal(coverage.distinctRuleSelectors,2);
 assert.deepEqual(coverage.slots.map(x=>x.calculatedCandidateDate),["2030-05-13","2030-05-14"]);
 const recurring=buildRecurringFestivalReview({annual:real,year:2030});
 const cycle=recurring.series.find(x=>x.ruleId==="ekadashi-smarta-udaya"&&x.targetTithiIndex===10).occurrences.find(x=>x.trisprishaAlternatives?.some(y=>y.sunriseDates[1]==="2030-05-14"));
 assert.ok(cycle);
 assert.equal(cycle.selectedDate,null);
 assert.equal(cycle.trisprishaAlternatives[0].alternatives.length,3);
});


test("2030 avatar components resolve independently without promoting combined source cards",async()=>{
  const {buildAvatarComponentReview}=await import("../scripts/review-avatar-components.mjs");
  const read=async path=>JSON.parse(await readFile(new URL("../data/"+path,import.meta.url),"utf8"));
  const sourceMonths=await Promise.all(Array.from({length:12},(_,i)=>read("festivals/2030-"+String(i+1).padStart(2,"0")+".json")));
  for(const year of [2030,2031]){
    const annual=await read("ohd-annual-panchang-review-"+year+".json");
    const review=buildAvatarComponentReview({annual,sourceMonths,year});
    assert.equal(review.cards.length,4);
    assert.equal(review.counts.components,11);
    for(const card of review.cards){
      assert.equal(card.selectedDate,null);
      assert.equal(card.publishable,false);
      assert.deepEqual(card.sourceContent,sourceMonths.flatMap(m=>m.events).find(e=>e.date+"::"+e.title===card.recordKey));
      assert.ok(card.components.every(c=>!c.publishable));
    }
    const naga=review.cards.find(c=>c.sourceContent.title==="नाग पंचमी / कल्कि जयंती");
    assert.equal(naga.components.find(c=>c.title==="नाग पंचमी").selectedDate,null);
    assert.ok(naga.components.find(c=>c.title==="कल्कि जयंती").selectedDate?.startsWith(String(year)));
    const kurma=review.cards.find(c=>c.sourceContent.title.includes("कूर्म अवतार जयंती"));
    assert.equal(kurma.components.find(c=>c.title==="बुद्ध पूर्णिमा").selectedDate,null);
    assert.equal(kurma.components.find(c=>c.title==="कूर्म अवतार जयंती").selectedDate,year===2030?"2030-05-17":"2031-05-06");
    console.log("Avatar components:",JSON.stringify({year,counts:review.counts,cards:review.cards.map(c=>({title:c.sourceContent.title,components:c.components.map(x=>({title:x.title,date:x.selectedDate,status:x.status}))}))}));
  }
});


test("a rule for one slash-joined component cannot select the entire card, even in ordinary tithi cases",()=>{
 const source=structuredClone(sourceMonths);
 source[8].events[0].title="विनायक चतुर्थी / स्वतंत्र देवी जयंती";
 const mapping={...manifest.mappings[0],recordKey:"2030-09-01::"+source[8].events[0].title};
 const output=buildAnnualFestivalReview({annual,manifest:{...manifest,mappings:[mapping]},sourceMonths:source,year});
 const d=output.decisions[0];
 assert.equal(d.calculatedCandidateDate,"2031-09-10");
 assert.equal(d.selectedDate,null);
 assert.equal(d.status,"manual-review");
 assert.ok(d.warnings.includes("composite-card-requires-independent-component-decisions"));
 assert.equal(output.inventory.compositeMappedCards,1);
 assert.equal(output.monthlyReview["2031-09"].length,0);
 assert.equal(d.publishable,false);
});
test("stale or ambiguous mapping does not inflate source-card coverage",()=>{
 const source=structuredClone(sourceMonths);
 source[8].events.push({...source[8].events[0]});
 const stale={...manifest.mappings[0],recordKey:"2030-09-03::removed"};
 const result=buildAnnualFestivalReview({annual,manifest:{...manifest,mappings:[...manifest.mappings,stale]},sourceMonths:source,year});
 assert.deepEqual(result.counts,{sourceCards:3,mapped:0,selected:0,unresolved:0,unmapped:3});
 assert.equal(result.inventory.manifestMappings,2);
 assert.equal(result.inventory.staleOrAmbiguousMappings,2);
 assert.equal(result.inventory.sourceCardsAccountedFor,3);
 assert.deepEqual(result.mappingDiagnostics.map(x=>x.sourceMatches),[2,0]);
 assert.ok(result.mappingDiagnostics.every(x=>x.selectedDate===null&&!x.publishable));
 assert.throws(()=>buildAnnualFestivalReview({annual,manifest:{...manifest,mappings:[stale,stale]},sourceMonths:source,year}));
});


test("Akshaya shared rule independently computes 2030 and 2031 without approving source dates",async()=>{
  const {resolveFestivalObservanceFromAnnualPanchang}=await import("../festival-rule-engine.mjs");
  for(const year of [2030,2031]){
    const annual=JSON.parse(await readFile(new URL("../data/ohd-annual-panchang-review-"+year+".json",import.meta.url),"utf8"));
    const rule={id:"akshaya-tritiya",dateType:"tithi",ruleId:"akshaya-tritiya-purvahna-review",lunarMonth:"वैशाख",paksha:"शुक्ल पक्ष",targetTithiIndex:2,monthKind:"regular"};
    const evidence=buildVaishakhaTritiyaComponentReview(annual).components[0];
    const decision=resolveFestivalObservanceFromAnnualPanchang(rule,year,annual.dailyPanchang);
    assert.equal(decision.selectedDate,evidence.candidateDate);
    assert.equal(decision.publishable,false);
    assert.equal(decision.autoApproved,false);
    if(year===2030)assert.equal(decision.selectedDate,"2030-05-05");
    const wrongMonth=resolveFestivalObservanceFromAnnualPanchang({...rule,lunarMonth:"अधिक वैशाख",monthKind:"adhika"},year,annual.dailyPanchang);
    assert.equal(wrongMonth.selectedDate,null);
    console.log("AKSHAYA_SHARED_REVIEW="+JSON.stringify({year,date:decision.selectedDate,status:decision.status}));
  }
});
test("Akshaya evidence rejects contradictory simultaneous tithis",()=>{
 const days=tritiyaDays(Date.parse("2030-05-04T18:00:00Z"),Date.parse("2030-05-05T09:00:00Z"));
 days[1].tithis.push({index:3,startTime:"2030-05-05T02:00:00Z",endTime:"2030-05-05T03:00:00Z"});
 assert.equal(reviewAkshayaTritiya(days).candidateDate,null);
});
