// Research-only traditional Arghya decision; NOT physical visibility.
// Nirnayasindhu II, Agastyarghya (Padma, Bhavishya/Hemadri, Vishnurahasya).
// Use explicit independently established traditional rise and solar ingress.
// Do not turn a geometric daily rise or fitted annual visibility into that input.
const DAY=86400000;
const iso=x=>new Date(x).toISOString();
const istDate=x=>iso(x+19800000).slice(0,10);
const pending=reason=>({status:"manual-review",reason,publishable:false,firstArghya:null,padmaDawns:[],bhavishyaDawns:[]});
export function grahalaghavaTargets(latitude){
  if(!Number.isFinite(latitude)||latitude<0||latitude>=37)return null;
  const correction=96*Math.tan(latitude*Math.PI/180);
  return {riseLongitude:98+correction,setLongitude:78-correction,model:"grahalaghava-21-comparator-only"};
}
export function reviewTraditionalArghya({riseUtcMilliseconds,riseDefinition,simhaIngressUtcMilliseconds,kanyaIngressUtcMilliseconds,dawns}={}){
  if(riseDefinition!=="traditional-agastya-udaya")return pending("traditional-rise-definition-required");
  const r=riseUtcMilliseconds,s=simhaIngressUtcMilliseconds,k=kanyaIngressUtcMilliseconds;
  if(![r,s,k].every(Number.isFinite)||!(s<=r&&r<k&&k-s<40*DAY))return pending("valid-simha-season-and-traditional-rise-required");
  if(!Array.isArray(dawns)||!dawns.length)return pending("complete-local-dawn-windows-required");
  const rows=dawns.map(d=>({date:d.date,start:d.startUtcMilliseconds,end:d.sunriseUtcMilliseconds}));
  if(rows.some(d=>!Number.isFinite(d.start)||!Number.isFinite(d.end)||!(d.start<d.end&&d.end-d.start<3*3600000)||istDate(d.end)!==d.date||istDate(d.start)!==d.date))
    return pending("invalid-local-dawn-window");
  if(rows.some((d,i)=>i>0&&(Date.parse(d.date)-Date.parse(rows[i-1].date)!==DAY||d.start<=rows[i-1].end)))
    return pending("nonconsecutive-local-dawns");
  // Need a dawn already ended before rise and another dawn after Kanya.
  // Otherwise an apparent first/last day could result from truncated input.
  if(rows[0].end>r||rows.at(-1).start<k)return pending("dawn-range-does-not-bracket-rise-and-kanya");
  const clip=(d,start,end)=>{
    const a=Math.max(d.start,start),b=Math.min(d.end,end);
    return b>a?{date:d.date,start:iso(a),end:iso(b)}:null;
  };
  // Operational interpretation: first seven eligible morning opportunities
  // after rise, with Kanya ingress as hard upper bound. This is an allowance,
  // not a prescription to offer on seven consecutive days.
  const padmaDawns=rows.map(d=>clip(d,r,k)).filter(Boolean).slice(0,7);
  // Distinct Bhavishya/Hemadri interpretation: last seven local morning
  // opportunities before Kanya. Do not conflate it with Padma's rise rule.
  const bhavishyaDawns=rows.map(d=>clip(d,s,k)).filter(Boolean).slice(-7);
  const commonDawns=padmaDawns.filter(x=>bhavishyaDawns.some(y=>y.date===x.date));
  return {status:padmaDawns.length?"source-review-required":"manual-review",publishable:false,
    firstArghya:padmaDawns[0]??null,padmaDawns,bhavishyaDawns,commonDawns,
    rise:iso(r),kanyaIngress:iso(k),dayCountConvention:"eligible-local-morning-opportunities-review",
    dawnWindowDefinition:"caller-supplied-traditional-dawn-window",
    warnings:["traditional-rise-not-derived-here","seven-night-count-and-dawn-boundary-review","do-not-assume-seven-mandatory-offerings"]};
}
