// Diagnostic only: measure existing data and review computation; do not publish dates.
import {readFile} from "node:fs/promises";
import {gzipSync} from "node:zlib";
import {performance} from "node:perf_hooks";
import assert from "node:assert/strict";
import {getPanchangam,Observer} from "@ishubhamx/panchangam-js";
import {buildRecurringFestivalReview,buildAnnualFestivalReview,buildRuleCoverageReview} from "./generate-annual-festival-review.mjs";
import {assembleHybridFestivalYear,getHybridFestivalMonth,expandCompactFestivalExceptions} from "./assemble-hybrid-festival-year.mjs";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const size=value=>({rawBytes:Buffer.byteLength(value),gzipBytes:gzipSync(value).length});
const measure=(fn,n=5)=>{
  let result;const times=[];
  for(let i=0;i<n;i++){const t=performance.now();result=fn();times.push(performance.now()-t);}
  const sorted=[...times].sort((a,b)=>a-b);
  return {result,ms:{first:Number(times[0].toFixed(2)),median:Number(sorted[Math.floor(n/2)].toFixed(2)),max:Number(sorted.at(-1).toFixed(2))}};
};
const year=2031,sourceYear=2030;
const raw=await read("data/ohd-annual-panchang-review-2031.json");
const parsed=measure(()=>JSON.parse(raw));
const annual=parsed.result;
const months=await Promise.all(Array.from({length:12},(_,i)=>read("data/festivals/2030-"+String(i+1).padStart(2,"0")+".json")));
const sourceMonths=months.map(JSON.parse);
const manifests=await Promise.all([2026,2027,2028,2029,2030].map(async y=>JSON.parse(await read("data/reviews/observance-rule-mapping-"+y+".json"))));
const recurring=measure(()=>buildRecurringFestivalReview({annual,year}));
const mapped=measure(()=>buildAnnualFestivalReview({annual,manifest:manifests.at(-1),sourceMonths,year}));
const coverage=measure(()=>buildRuleCoverageReview({annual,manifests,year,sourceYear}));
assert.equal(recurring.result.publishable,false);
assert.equal(mapped.result.publishable,false);
// Benchmark only. Historical 2030 data stands in for a full calendar workload.
// This synthetic approval fixture is never written or used to approve 2031.
const fixtureEvents=[...new Map(sourceMonths.flatMap(m=>m.events).map(e=>[e.date+"::"+e.title,e])).values()];
const plan={year:sourceYear,status:"approved",records:fixtureEvents.map((_,i)=>({occurrenceId:"benchmark-"+i,mode:i%10===0?"exception":"automatic"}))};
const records=fixtureEvents.map((event,i)=>({occurrenceId:"benchmark-"+i,event,reviewStatus:"approved",publishable:true,reviewEvidence:"benchmark-only",ruleId:"benchmark",ruleVersion:"1",decisionSource:"benchmark-only",exceptionReason:"benchmark-only"}));
const assembly=measure(()=>assembleHybridFestivalYear({year:sourceYear,plan,automatic:{year:sourceYear,records:records.filter((_,i)=>i%10!==0)},exceptions:{year:sourceYear,records:records.filter((_,i)=>i%10===0)}}));
assert.equal(assembly.result.annual?.eventCount,fixtureEvents.length);
const navigation=measure(()=>Array.from({length:12},(_,i)=>getHybridFestivalMonth(assembly.result,sourceYear,i+1)),20);
assert.equal(navigation.result.reduce((n,m)=>n+m.events.length,0),fixtureEvents.length);
// Actual astronomical sample: same pinned engine and noon/sunrise inputs as
// annual generator. Excludes remaining full-year special-event work and network.
const observer=new Observer(29.5828,80.2182,1650);
const options={timezoneOffset:330,calendarType:"purnimanta"};
let calls=0;
const t=performance.now();
for(let day=1;day<=31;day++){
 const p=getPanchangam(new Date(Date.UTC(year,0,day,6,30)),observer,options);calls++;
 if(p.sunrise){getPanchangam(new Date(p.sunrise),observer,options);calls++;}
}
const astronomyMs=Number((performance.now()-t).toFixed(2));
const catalogueRaw=await read("data/festival-content-master.json");
const catalogue=JSON.parse(catalogueRaw);
// Hypothetical 25/50/100-row payloads with real shared keys and representative
// short approval metadata; not actual 2031 exceptions or approved dates.
const compactPayloads=[25,50,100].map(count=>{
 const exceptions={schemaVersion:1,year,records:catalogue.templates.slice(0,count).map((template,i)=>({
 occurrenceId:"sample-"+i,contentKey:template.key,date:new Date(Date.UTC(year,0,i+1)).toISOString().slice(0,10),
 hinduTithi:"माघ शुक्ल एकादशी",reviewStatus:"needs-review",publishable:false,
 reviewEvidence:"benchmark-only",decisionSource:"benchmark-only",exceptionReason:"benchmark-only"
 }))};
 const expanded=measure(()=>expandCompactFestivalExceptions({year,exceptions,catalogue}));
 assert.equal(expanded.result.records.length,count);
 return {count,...size(JSON.stringify(exceptions)),expandMs:expanded.ms};
});
const payloads=months.map(size);
console.log(JSON.stringify({
 benchmark:"hybrid-festival-performance-diagnostic",environment:process.version,
 actual2030MonthPayloads:{minGzipBytes:Math.min(...payloads.map(x=>x.gzipBytes)),maxGzipBytes:Math.max(...payloads.map(x=>x.gzipBytes)),averageGzipBytes:Math.round(payloads.reduce((n,x)=>n+x.gzipBytes,0)/12)},
 sharedContentMaster:size(catalogueRaw),compactExceptionPayloadEstimates:compactPayloads,actual2031ResearchInput:size(raw),researchInputParseMs:parsed.ms,
 recurringReviewMs:recurring.ms,mappedReviewMs:mapped.ms,coverageReviewMs:coverage.ms,
 syntheticHistoricalAssembly:{events:fixtureEvents.length,ms:assembly.ms},cachedTwelveMonthViewsMs:navigation.ms,
 astronomy31DaySample:{calls,ms:astronomyMs},
 limitations:"Node CI CPU and gzip estimates only; excludes browser/network/DOM and complete 2031 approval. Research input is not a proposed public payload."
}));
