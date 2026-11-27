#!/usr/bin/env node
// Review only: never write into data/festivals or approve a calculated date.
import {readFile, mkdir, writeFile} from "node:fs/promises";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {resolveFestivalObservanceFromAnnualPanchang} from "../festival-rule-engine.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const validYear=y=>Number.isInteger(y)&&y>=1900&&y<=2200;
const isoDay=(year,offset)=>new Date(Date.UTC(year,0,1+offset)).toISOString().slice(0,10);
export function validateAnnualInput(annual,year){
  if(!validYear(year)||annual?.year!==year||!Array.isArray(annual.dailyPanchang))throw new Error("Annual year or daily Panchang missing");
  const count=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
  if(annual.dailyPanchang.length!==count||annual.dailyPanchang.some((day,i)=>day.date!==isoDay(year,i)||!Array.isArray(day.tithiIntervals)||!day.tithiIntervals.length||!Number.isFinite(Date.parse(day.sunrise))||!Number.isFinite(Date.parse(day.sunset))))throw new Error("Incomplete or nonconsecutive annual daily Panchang");
}
const recordKey=e=>e.date+"::"+e.title;
export function buildAnnualFestivalReview({annual,manifest,sourceMonths,year}){
  validateAnnualInput(annual,year);
  if(!validYear(manifest?.year)||!Array.isArray(manifest.mappings)||!Array.isArray(sourceMonths)||sourceMonths.length!==12)throw new Error("Missing explicit source mapping or complete source catalogue");
  const sourceYear=manifest.year;
  if(sourceMonths.some((m,i)=>m.year!==sourceYear||m.month!==i+1||!Array.isArray(m.events)))throw new Error("Source catalogue month mismatch");
  const source=sourceMonths.flatMap(m=>m.events);
  const byKey=new Map();
  for(const event of source){const key=recordKey(event);byKey.set(key,[...(byKey.get(key)||[]),event]);}
  const mapped=new Set();
  const decisions=[];
  for(const mapping of manifest.mappings){
    if(mapped.has(mapping.recordKey))throw new Error("Duplicate mapping: "+mapping.recordKey);
    mapped.add(mapping.recordKey);
    const rows=byKey.get(mapping.recordKey)||[];
    if(rows.length!==1){
      decisions.push({recordKey:mapping.recordKey,ruleId:mapping.ruleId,status:"manual-review",selectedDate:null,reason:"source-card-missing-or-ambiguous",publishable:false});
      continue;
    }
    const event=rows[0];
    const descriptor={id:mapping.observanceId,dateType:"tithi",ruleId:mapping.ruleId,lunarMonth:mapping.lunarMonth,paksha:mapping.paksha,targetTithiIndex:mapping.targetTithiIndex,targetTithiIndices:mapping.targetTithiIndices,monthKind:mapping.monthKind};
    // No year-specific Gregorian date is supplied to the resolver.
    const result=resolveFestivalObservanceFromAnnualPanchang(descriptor,year,annual.dailyPanchang);
    const date=result.selectedDate;
    const inYear=typeof date==="string"&&date.startsWith(year+"-");
    // Boundary days need adjacent-year context, not an assumed previous/next sunrise.
    const boundary=inYear&&(date===isoDay(year,0)||date===isoDay(year,annual.dailyPanchang.length-1));
    decisions.push({recordKey:mapping.recordKey,sourceTitle:event.title,sourceHinduTithi:event.hinduTithi??null,sourceClassification:mapping.classification,sourceReason:mapping.reason,
      ruleId:mapping.ruleId,selector:descriptor,calculatedCandidateDate:inYear?date:null,
      selectedDate:inYear&&!boundary?date:null,status:boundary?"manual-review":result.status,
      warnings:[...(result.warnings||[]),...(boundary?["adjacent-year-context-required"]:[])],
      selectionBasis:result.selectionBasis??null,reviewStatus:"needs-review",publishable:false,
      // Stable content only; old dates, weekday titles and muhurta times are not public cards.
      sourceContent:{title:event.title,description:event.description??"",category:event.category??"",articleUrl:event.articleUrl??"",articleLabel:event.articleLabel??"",secondaryArticleUrl:event.secondaryArticleUrl??"",secondaryArticleLabel:event.secondaryArticleLabel??""}});
  }
  const unmapped=source.filter(e=>!mapped.has(recordKey(e))).map(e=>({recordKey:recordKey(e),title:e.title,hinduTithi:e.hinduTithi??null,status:"manual-review",reason:"explicit-observance-rule-mapping-required",publishable:false}));
  const monthlyReview=Object.fromEntries(Array.from({length:12},(_,i)=>[year+"-"+String(i+1).padStart(2,"0"),[]]));
  for(const decision of decisions)if(decision.selectedDate&&monthlyReview[decision.selectedDate.slice(0,7)])monthlyReview[decision.selectedDate.slice(0,7)].push(decision);
  for(const rows of Object.values(monthlyReview))rows.sort((a,b)=>a.selectedDate.localeCompare(b.selectedDate)||a.recordKey.localeCompare(b.recordKey));
  return {schemaVersion:1,year,sourceYear,status:"review-only-not-approved",publishable:false,location:annual.location??null,counts:{sourceCards:source.length,mapped:decisions.length,selected:decisions.filter(d=>d.selectedDate).length,unresolved:decisions.filter(d=>!d.selectedDate).length,unmapped:unmapped.length},monthlyReview,decisions,unmapped,
    note:"Candidate dates only. Repeated or missing lunar observances, combined titles, weekday-dependent names, adhika months and special cases require independent review. Source-year coverage is not complete target-year coverage."};
}
// A rule-selector is not a festival identity. Retain every source title
// and occurrence; never choose one title or publish a card from this audit.
export function buildRuleCoverageReview({annual,manifests,year,sourceYear}){
  validateAnnualInput(annual,year);
  if(!Array.isArray(manifests)||!manifests.length)throw new Error("Historical mappings required");
  const groups=new Map();
  const seenYears=new Set();
  for(const manifest of manifests){
    if(!validYear(manifest.year)||seenYears.has(manifest.year)||!Array.isArray(manifest.mappings))throw new Error("Invalid historical mapping");
    seenYears.add(manifest.year);
    for(const row of manifest.mappings){
      const indices=Array.isArray(row.targetTithiIndices)?[...new Set(row.targetTithiIndices)].sort((a,b)=>a-b):[row.targetTithiIndex];
      const selector={ruleId:row.ruleId,lunarMonth:row.lunarMonth??"",paksha:row.paksha??"",targetTithiIndices:indices,monthKind:row.monthKind??null};
      const key=JSON.stringify(selector);
      if(!groups.has(key))groups.set(key,{selector,sources:[]});
      groups.get(key).sources.push({year:manifest.year,recordKey:row.recordKey,title:row.title,classification:row.classification});
    }
  }
  if(!seenYears.has(sourceYear))throw new Error("Source-year mapping missing");
  const slots=[...groups.values()].map(({selector,sources},index)=>{
    const inSourceYear=sources.some(row=>row.year===sourceYear);
    const repeatedSourceYears=[...seenYears].filter(y=>sources.filter(row=>row.year===y).length>1);
    // Bare "अधिक" is not a lunar-month name; do not normalize it to a regular month.
    const invalidMonth=!selector.lunarMonth||selector.lunarMonth==="अधिक";
    const result=invalidMonth?null:resolveFestivalObservanceFromAnnualPanchang({id:"coverage-"+index,dateType:"tithi",...selector},year,annual.dailyPanchang);
    const candidate=result?.selectedDate??null;
    const boundary=candidate===isoDay(year,0)||candidate===isoDay(year,annual.dailyPanchang.length-1);
    return {selector,sources,inSourceYear,repeatedSourceYears,calculatedCandidateDate:candidate,
      status:invalidMonth||boundary?"manual-review":result?.status??"manual-review",
      warnings:[...(result?.warnings??[]),...(invalidMonth?["explicit-lunar-month-required"]:[]),...(boundary?["adjacent-year-context-required"]:[]),...(repeatedSourceYears.length?["recurring-or-distinct-source-occurrences-require-separate-review"]:[])],
      publishable:false};
  });
  return {status:"review-only-not-approved",year,sourceYear,sourceYears:[...seenYears].sort((a,b)=>a-b),sourceOccurrences:slots.reduce((n,s)=>n+s.sources.length,0),distinctRuleSelectors:slots.length,additionalSelectors:slots.filter(s=>!s.inSourceYear).length,additionalWithCandidate:slots.filter(s=>!s.inSourceYear&&s.calculatedCandidateDate&&s.status!=="manual-review").length,slots,
    note:"Selector coverage is not a count of festivals; source title variants, repeated lunar occurrences and adhika-month rules still require independent review."};
}
async function main(){
  const args=process.argv.slice(2);
  const year=Number(args.find(x=>x.startsWith("--year="))?.slice(7)||2031);
  const sourceYear=Number(args.find(x=>x.startsWith("--source-year="))?.slice(14)||2030);
  if(!validYear(year)||!validYear(sourceYear))throw new Error("Invalid year");
  const read=async p=>JSON.parse(await readFile(resolve(root,p),"utf8"));
  const annual=await read("data/ohd-annual-panchang-review-"+year+".json");
  const manifest=await read("data/reviews/observance-rule-mapping-"+sourceYear+".json");
  const sourceMonths=await Promise.all(Array.from({length:12},(_,i)=>read("data/festivals/"+sourceYear+"-"+String(i+1).padStart(2,"0")+".json")));
  const output=buildAnnualFestivalReview({annual,manifest,sourceMonths,year});
  // Historical manifests are evidence only. The annual target calculation is unchanged.
  const historicalYears=[...new Set([2026,2027,2028,2029,2030,sourceYear])];
  const manifests=await Promise.all(historicalYears.map(y=>read("data/reviews/observance-rule-mapping-"+y+".json")));
  output.ruleCoverage=buildRuleCoverageReview({annual,manifests,year,sourceYear});
  const dir=resolve(root,"artifacts/festival-annual-review");
  await mkdir(dir,{recursive:true});
  await writeFile(resolve(dir,year+"-from-"+sourceYear+".json"),JSON.stringify(output,null,2)+"\n");
  console.log(JSON.stringify({year,sourceYear,...output.counts,status:output.status,ruleCoverage:{sourceOccurrences:output.ruleCoverage.sourceOccurrences,distinctRuleSelectors:output.ruleCoverage.distinctRuleSelectors,additionalSelectors:output.ruleCoverage.additionalSelectors,additionalWithCandidate:output.ruleCoverage.additionalWithCandidate}}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error);process.exitCode=1;});
