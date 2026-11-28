// Review-only astronomical evidence for the Dvadashi-ksaya / Trisprisha
// exception. Not a general Ekadashi resolver or public parana calculator.
const ms=value=>typeof value==="string"?Date.parse(value):NaN;
const validDate=value=>typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const iso=value=>new Date(value).toISOString();
function merged(parts){
  const result=[];
  for(const [a,b] of parts.slice().sort((x,y)=>x[0]-y[0])){
    const last=result.at(-1);
    if(last&&a<=last[1])last[1]=Math.max(last[1],b);
    else result.push([a,b]);
  }
  return result;
}
// The pinned Panchang scanner deliberately resumes at previous end + 60 s.
// Only bridge the documented exact gap between consecutive tithi indices
// inside one sunrise partition, and only for the annual adapter.
export function normalizeAnnualTrisprishaPartitions(days){
  return days.map(day=>{
    const rows=(day.tithis??[]).map(row=>({...row}));
    for(let i=1;i<rows.length;i++){
      const previous=rows[i-1],current=rows[i];
      const end=ms(previous.endTime??previous.end),start=ms(current.startTime??current.start);
      if(Number.isInteger(previous.index)&&current.index===(previous.index+1)%30&&start-end===60000){
        if("startTime" in current||!("start" in current))current.startTime=iso(end);
        else current.start=iso(end);
      }
    }
    return {...day,tithis:rows};
  });
}
export function reviewTrisprishaSunriseCycle(days,index){
  const fail=reason=>({status:"manual-review",reason,candidateDate:null,publishable:false});
  if(![10,25].includes(index)||!Array.isArray(days)||days.length!==3)return fail("three-local-sunrise-contexts-required");
  const [prev,day,next]=days;
  if(days.some(d=>!validDate(d?.date))||Date.parse(day.date)-Date.parse(prev.date)!==86400000||Date.parse(next.date)-Date.parse(day.date)!==86400000)return fail("nonconsecutive-local-days");
  const [a,b,c]=days.map(d=>ms(d.sunrise));
  if(![a,b,c].every(Number.isFinite)||!(a<b&&b<c))return fail("missing-local-sunrise");
  if(days.some(d=>!Array.isArray(d.tithis)||!d.tithis.length))return fail("missing-tithi-partitions");
  const rows=days.flatMap(d=>d.tithis).map(r=>({i:r.index,a:ms(r.startTime??r.start),b:ms(r.endTime??r.end)}));
  if(rows.some(r=>!Number.isInteger(r.i)||r.i<0||r.i>29||!Number.isFinite(r.a)||!Number.isFinite(r.b)||r.b<=r.a))return fail("invalid-tithi-interval");
  const groups=new Map();
  for(const row of rows){
    if(!groups.has(row.i))groups.set(row.i,[]);
    groups.get(row.i).push([row.a,row.b]);
  }
  const intervals=[...groups].flatMap(([i,parts])=>merged(parts).map(([a,b])=>({i,a,b})));
  const active=t=>intervals.filter(r=>r.a<=t&&t<r.b);
  const sunriseSequence=[a,b,c].map(t=>{const items=active(t);return items.length===1?items[0].i:null});
  if(sunriseSequence.includes(null))return fail("ambiguous-or-missing-sunrise-tithi");
  if(sunriseSequence[0]!==index-1||sunriseSequence[1]!==index||sunriseSequence[2]!==index+2)
    return {status:"not-this-pattern",candidateDate:null,sunriseSequence,publishable:false};
  const e=active(b)[0],d=intervals.filter(r=>r.i===index+1&&r.a>=b&&r.b<=c);
  const da=active(a)[0],tr=active(c)[0];
  if(d.length!==1||!(a<e.a&&e.a<=b&&b<e.b&&e.b===d[0].a&&d[0].b===tr.a&&tr.a<=c&&da.b===e.a))
    return {...fail("incomplete-or-discontinuous-dasami-ekadashi-dwadashi-trayodashi"),sunriseSequence};
  const relevant=[da,e,d[0],tr];
  if(intervals.some(r=>!relevant.includes(r)&&r.a<c&&r.b>a)||
    relevant.some((r,i)=>relevant.slice(i+1).some(s=>Math.max(r.a,s.a)<Math.min(r.b,s.b))))
    return {...fail("conflicting-tithi-evidence"),sunriseSequence};
  const arunodaya=b-96*60000;
  const aruna=active(arunodaya);
  return {status:"source-review-required",pattern:"dasami-ekadashi-trayodashi-sunrise-sequence-with-dwadashi-ksaya",
    candidateDate:null,publishable:false,index,month:day.masa??null,
    sunriseSequence,sunriseDates:days.map(d=>d.date),sunrises:days.map(d=>d.sunrise),
    ekadashi:{start:iso(e.a),end:iso(e.b)},dwadashi:{start:iso(d[0].a),end:iso(d[0].b)},
    arunodaya:{time:iso(arunodaya),tithiIndex:aruna.length===1?aruna[0].i:null},
    candidates:{smartaHouseholderEarlier:prev.date,mumukshuVaishnavaLater:day.date,combinedFastLater:day.date},
    paranaEvidence:{earlierFastNextSunrise:day.sunrise,earlierFastDwadashiStart:iso(d[0].a),laterFastNextSunrise:next.sunrise,dwadashiAtLaterFastNextSunrise:false},
    note:"Source-specific candidate distinctions only. No final ritual prescription, fast or parana window approved."};
}
