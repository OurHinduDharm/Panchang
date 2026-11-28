import {buildFestivalRuleContexts} from "../festival-rule-engine.mjs";
import {normalizeAnnualTrisprishaPartitions,reviewTrisprishaSunriseCycle,reviewTrisprishaParanaWindows} from "../ekadashi-trisprisha.mjs";
export {reviewTrisprishaSunriseCycle} from "../ekadashi-trisprisha.mjs";
const ms=value=>typeof value==="string"?Date.parse(value):NaN;
export function buildEkadashiTrisprishaReview(annual){
  const contexts=normalizeAnnualTrisprishaPartitions(buildFestivalRuleContexts(annual?.dailyPanchang));
  const occurrences=[],incomplete=[];
  for(let i=1;i<contexts.length-1;i++){
    const day=contexts[i];
    for(const index of [10,25]){
      // Only evaluate a possible central Ekadashi sunrise; do not scan all days as errors.
      if(!day.tithis.some(r=>r.index===index&&ms(r.startTime??r.start)<=ms(day.sunrise)&&ms(day.sunrise)<ms(r.endTime??r.end)))continue;
      const result=reviewTrisprishaSunriseCycle(contexts.slice(i-1,i+2),index);
      if(result.status==="source-review-required")occurrences.push({...result,paranaReview:reviewTrisprishaParanaWindows(contexts.slice(i-1,i+2),index)});
      else if(result.status==="manual-review")incomplete.push({date:day.date,index,reason:result.reason});
    }
  }
  return {year:annual?.year,status:"review-only-not-approved",publishable:false,occurrences,incomplete,
    boundaryPolicy:"Adjacent-year evidence required for first/last sunrise; not inferred.",
    note:"Named Ekadashi, Siddhilakshmi and distinct Dwadashi observances have separate rules. This scan detects only the specified Dwadashi-ksaya geometry, not every Mahadvadashi."};
}
