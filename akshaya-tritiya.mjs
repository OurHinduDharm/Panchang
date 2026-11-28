// Shared review-only Akshaya Tritiya evidence. See research/vaishakha-tritiya-component-review.md.
export const dateMs = value => typeof value === "string" || value instanceof Date ? new Date(value).getTime() : NaN;
const GHATI_MS = 24*60*1000;
export function union(parts) {
  const merged=[];
  for(const part of parts.slice().sort((a,b)=>a[0]-b[0])){
    const last=merged.at(-1);
    if(last&&part[0]<=last[1])last[1]=Math.max(last[1],part[1]);
    else merged.push([...part]);
  }
  return merged;
}
export const coverage=(parts,start,end)=>union(parts.map(([a,b])=>[Math.max(a,start),Math.min(b,end)]).filter(([a,b])=>a<b)).reduce((s,[a,b])=>s+b-a,0);

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
    const other=rows.filter(r=>r.index!==2).map(r=>[r.a,r.b]);
    if(parts.some(([x,y])=>coverage(other,Math.max(x,a),Math.min(y,b))>0))return null;
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
