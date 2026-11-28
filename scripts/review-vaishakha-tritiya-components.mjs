// Offline, review-only. Keep the components of the Vaishakha Tritiya card independent.
import {buildFestivalRuleContexts,resolveFestivalObservanceFromAnnualPanchang} from "../festival-rule-engine.mjs";

import {dateMs,union,coverage,reviewAkshayaTritiya} from "../akshaya-tritiya.mjs";
export {reviewAkshayaTritiya};

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
