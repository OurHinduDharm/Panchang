// Offline, review-only. Keep the components of the Vaishakha Tritiya card independent.
import {buildFestivalRuleContexts,resolveFestivalObservanceFromAnnualPanchang} from "../festival-rule-engine.mjs";

const dateMs = value => typeof value === "string" || value instanceof Date ? new Date(value).getTime() : NaN;
const GHATI_MS = 24*60*1000;
function union(parts) {
  const merged=[];
  for(const part of parts.slice().sort((a,b)=>a[0]-b[0])){
    const last=merged.at(-1);
    if(last&&part[0]<=last[1])last[1]=Math.max(last[1],part[1]);
    else merged.push([...part]);
  }
  return merged;
}
const coverage=(parts,start,end)=>union(parts.map(([a,b])=>[Math.max(a,start),Math.min(b,end)]).filter(([a,b])=>a<b)).reduce((s,[a,b])=>s+b-a,0);

export function reviewAkshayaTritiya(days) {
  const fail=reason=>({status:"manual-review",candidateDate:null,reason,variants:null,evidence:[],publishable:false});
  if(!Array.isArray(days)||!days.length||days.length>2)return fail("one-or-two-local-tithi-days-required");
  const ordered=days.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(ordered.length===2&&Date.parse(ordered[1].date)-Date.parse(ordered[0].date)!==86400000)return fail("nonconsecutive-days");
  const info=ordered.map(day=>{
    const a=dateMs(day.sunrise),b=dateMs(day.sunset),c=dateMs(day.nextSunrise);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day.date??"")||day.masa!=="वैशाख"||
      ![a,b,c].every(Number.isFinite)||!(a<b&&b<c)||!Array.isArray(day.tithis))return null;
    const rows=day.tithis.map(r=>({index:r.index,a:dateMs(r.startTime??r.start),b:dateMs(r.endTime??r.end)}));
    if(rows.some(r=>!Number.isInteger(r.index)||!Number.isFinite(r.a)||!Number.isFinite(r.b)||r.b<=r.a))return null;
    // Refuse to interpret missing daytime evidence as zero Tritiya coverage.
    const all=rows.map(r=>[r.a,r.b]);
    if(coverage(all,a,b)!==b-a)return null;
    const parts=rows.filter(r=>r.index===2).map(r=>[Math.max(r.a,a),Math.min(r.b,c)]).filter(([x,y])=>x<y);
    if(!parts.length)return null;
    const mid=a+(b-a)/2;
    return {date:day.date,parts,purvahnaStart:new Date(a).toISOString(),purvahnaEnd:new Date(mid).toISOString(),
      purvahnaCoverageMs:coverage(parts,a,mid),daylightMs:b-a};
  });
  if(info.some(x=>!x))return fail("missing-or-incomplete-local-day-evidence");
  if(union(info.flatMap(d=>d.parts)).length!==1)return fail("discontinuous-tritiya-cycle");
  const evidence=info.map(({parts,...d})=>d);
  const matches=info.filter(d=>d.purvahnaCoverageMs>0);
  let ns=null,ds=null,dsSeasonal=null;
  if(matches.length===1)ns=ds=dsSeasonal=matches[0].date;
  if(matches.length===2){
    const [first,later]=matches;
    ns=later.date;
    const choose=threshold=>later.purvahnaCoverageMs>threshold?later.date:later.purvahnaCoverageMs<threshold?first.date:null;
    // Explicit diagnostic interpretations, not a resolution of ghati vs seasonal muhurta
    // or equality at the boundary.
    ds=choose(6*GHATI_MS);
    dsSeasonal=choose(later.daylightMs/5);
  }
  const candidateDate=ns&&ns===ds&&ns===dsSeasonal?ns:null;
  return {status:candidateDate?"source-consistent-candidate":"manual-review",candidateDate,
    variants:{nirnayasindhu:ns,dharmasindhuSixFixedGhatis:ds,dharmasindhuThreeDaytimeMuhurtasDiagnostic:dsSeasonal},
    reason:candidateDate?"source-variants-agree":"no-purvahna-or-source-variants-disagree",
    evidence,publishable:false};
}
// Compare the literal first-yama (quarter of the local night) with the
// pre-existing three-night-muhurta Pradosha convention. This is evidence,
// not a new approved vrata rule: the two Sanskrit passages differ in wording.
export function reviewParashuramaNightEvidence(days,legacyCandidateDate=null) {
  const fail=reason=>({status:"manual-review",candidateDate:null,legacyCandidateDate,reason,evidence:[],publishable:false});
  if(!Array.isArray(days)||!days.length||days.length>2)return fail("one-or-two-local-tithi-days-required");
  const ordered=days.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(ordered.length===2&&Date.parse(ordered[1].date)-Date.parse(ordered[0].date)!==86400000)return fail("nonconsecutive-days");
  const evidence=ordered.map(day=>{
    const sunrise=dateMs(day.sunrise),sunset=dateMs(day.sunset),next=dateMs(day.nextSunrise);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day.date??"")||day.masa!=="वैशाख"||
      ![sunrise,sunset,next].every(Number.isFinite)||!(sunrise<sunset&&sunset<next)||!Array.isArray(day.tithis))return null;
    const rows=day.tithis.map(r=>({index:r.index,a:dateMs(r.startTime??r.start),b:dateMs(r.endTime??r.end)}));
    if(rows.some(r=>!Number.isInteger(r.index)||!Number.isFinite(r.a)||!Number.isFinite(r.b)||r.b<=r.a))return null;
    const yamaEnd=Math.floor(sunset+(next-sunset)/4);
    const pradoshaEnd=Math.floor(sunset+(next-sunset)*3/15);
    const all=rows.map(r=>[r.a,r.b]), tritiya=rows.filter(r=>r.index===2).map(r=>[r.a,r.b]);
    if(!tritiya.length||coverage(all,sunset,yamaEnd)!==yamaEnd-sunset)return null;
    return {date:day.date,sunset:new Date(sunset).toISOString(),
      firstYamaEnd:new Date(yamaEnd).toISOString(),pradoshaEnd:new Date(pradoshaEnd).toISOString(),
      firstYamaCoverageMs:coverage(tritiya,sunset,yamaEnd),
      threeNightMuhurtasCoverageMs:coverage(tritiya,sunset,pradoshaEnd),
      tritiyaParts:tritiya.map(([a,b])=>[Math.max(a,sunrise),Math.min(b,next)]).filter(([a,b])=>a<b)};
  });
  if(evidence.some(e=>!e))return fail("missing-or-incomplete-night-evidence");
  if(union(evidence.flatMap(e=>e.tritiyaParts)).length!==1)return fail("discontinuous-tritiya-cycle");
  const covered=evidence.filter(e=>e.firstYamaCoverageMs>0);
  // Diagnostic reading of Dharmasindhu: choose the only covered day,
  // or the later if both have first-yama coverage. No no-coverage fallback.
  const firstYamaCandidateDate=covered.at(-1)?.date??null;
  const candidateDate=firstYamaCandidateDate&&firstYamaCandidateDate===legacyCandidateDate?firstYamaCandidateDate:null;
  return {status:candidateDate?"source-consistent-candidate":"manual-review",candidateDate,legacyCandidateDate,
    firstYamaCandidateDate,reason:candidateDate?"legacy-and-first-yama-evidence-agree":firstYamaCandidateDate?"legacy-and-first-yama-disagree":"neither-first-yama-covered",
    evidence:evidence.map(({tritiyaParts,...e})=>e),publishable:false};
}

export function buildVaishakhaTritiyaComponentReview(annual) {
  const days=buildFestivalRuleContexts(annual?.dailyPanchang).filter(d=>d.masa==="वैशाख"&&d.tithis.some(r=>r.index===2));
  const akshaya=reviewAkshayaTritiya(days);
  const parashurama=resolveFestivalObservanceFromAnnualPanchang({id:"parashurama-jayanti",dateType:"tithi",
    ruleId:"parashurama-jayanti-pradosha-review",lunarMonth:"वैशाख",paksha:"शुक्ल पक्ष",targetTithiIndex:2},annual.year,annual.dailyPanchang);
  const diagnostic=reviewParashuramaNightEvidence(days);
  const legacyCandidateDate=diagnostic.evidence.length===2?(diagnostic.evidence.every(e=>e.threeNightMuhurtasCoverageMs>0)?diagnostic.evidence[1].date:diagnostic.evidence[0].date):null;
  const comparison=reviewParashuramaNightEvidence(days,legacyCandidateDate);
  return {year:annual.year,status:"review-only-not-approved",publishable:false,
    sourceCardScope:"Vaishakha Shukla Tritiya composite; review each component separately",
    components:[
      {id:"akshaya-tritiya",...akshaya},
      {id:"parashurama-jayanti",...comparison,
        sharedRuleCandidateDate:parashurama.selectedDate??null,sharedRuleStatus:parashurama.status,
        candidateDate:comparison.candidateDate&&comparison.candidateDate===parashurama.selectedDate?comparison.candidateDate:null,
        status:comparison.candidateDate&&comparison.candidateDate===parashurama.selectedDate?comparison.status:"manual-review",
        sharedRuleEvidence:parashurama.evaluations},
      {id:"yugadi-shraddha",candidateDate:null,status:"manual-review",reason:"separate ritual decision and competing yuga names; see #545",publishable:false},
      {id:"matangi-jayanti",candidateDate:null,status:"manual-review",reason:"independent ritual-window source required",publishable:false}
    ]};
}
