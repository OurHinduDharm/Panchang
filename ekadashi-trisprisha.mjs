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
// Diagnostic ritual windows, not a published Parana prescription.
// Dharmasindhu/Nirnayasindhu: first quarter of Dwadashi is Hari Vasara;
// some authorities prefer the first 3 daylight muhurtas, others Aparahna.
// Keep Aparahna (fourth fifth) separate from the broader post-Madhyahna window.
export function reviewTrisprishaParanaWindows(days,index){
  const fail=reason=>({status:"manual-review",reason,publishable:false,approvedWindow:null});
  const cycle=reviewTrisprishaSunriseCycle(days,index);
  if(cycle.status!=="source-review-required")return fail("complete-trisprisha-cycle-required");
  const [,early,late]=days;
  const [a,b]=[ms(early.sunrise),ms(early.sunset)];
  const [c,d]=[ms(late.sunrise),ms(late.sunset)];
  const ds=ms(cycle.dwadashi.start),de=ms(cycle.dwadashi.end);
  if(![a,b,c,d,ds,de].every(Number.isFinite)||!(a<b&&b<c&&c<d&&a<ds&&ds<de&&de<c))
    return fail("complete-local-daylight-and-dwadashi-interval-required");
  const hv=Math.floor(ds+(de-ds)/4);
  const boundary=(start,end,k)=>Math.floor(start+(end-start)*k/5);
  const interval=(start,end)=>end>start?{start:iso(start),end:iso(end)}:null;
  const overlap=(start,end)=>interval(Math.max(start,ds,hv),Math.min(end,de,b));
  const pratah=overlap(a,boundary(a,b,1));
  const aparahna=overlap(boundary(a,b,3),boundary(a,b,4));
  const postMadhyahna=overlap(boundary(a,b,3),b);
  const allAfterHariVasara=overlap(a,b);
  // No Dwadashi anywhere after the later fast's next sunrise. Verify the
  // actual Trayodashi interval rather than treating any sunrise as sufficient.
  const trayodashi=merged(late.tithis.filter(row=>row.index===index+2).map(row=>[ms(row.startTime??row.start),ms(row.endTime??row.end)]).filter(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&y>x));
  const atSunrise=trayodashi.filter(([x,y])=>x<=c&&c<y);
  if(atSunrise.length!==1)return fail("trayodashi-at-later-parana-sunrise-not-established");
  const [ts,te]=atSunrise[0];
  const latePratah=interval(Math.max(c,ts),Math.min(boundary(c,d,1),te,d));
  return {status:"source-review-required",publishable:false,approvedWindow:null,
    hariVasaraEnd:iso(hv),
    earlierFast:{fastDate:cycle.candidates.smartaHouseholderEarlier,paranaDate:early.date,
      dwadashi:cycle.dwadashi,pratah,aparahna,postMadhyahna,allAfterHariVasara,
      note:"Alternative computed windows; no consensus asserted on the upper limit or the nakta exception."},
    laterFast:{fastDate:cycle.candidates.mumukshuVaishnavaLater,paranaDate:late.date,
      dwadashiAbsentAfterSunrise:true,trayodashiAtSunrise:true,
      pratahDiagnostic:latePratah,
      note:"Trayodashi parana is a source-backed exception; exact window and eligibility require separate approval."}};
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

// Narada Purana 1.4.121.96 says Ekadashi ends before sunrise.
// Drik's explanatory reading additionally requires the Arunodaya transition,
// Dwadashi throughout daylight and Trayodashi late in the night. These are
// distinct evidence fields, not an assertion that the verse states all of them.
export function reviewNaradaTrisprishaCycle(days,index){
  const fail=reason=>({status:"manual-review",reason,candidateDate:null,publishable:false});
  if(![10,25].includes(index)||!Array.isArray(days)||days.length!==3)return fail("three-local-sunrise-contexts-required");
  const [prev,day,next]=days;
  if(days.some(d=>!validDate(d?.date))||Date.parse(day.date)-Date.parse(prev.date)!==86400000||Date.parse(next.date)-Date.parse(day.date)!==86400000)return fail("nonconsecutive-local-days");
  const [a,b,c]=days.map(d=>ms(d.sunrise)),sunset=ms(day.sunset);
  if(![a,b,c,sunset].every(Number.isFinite)||!(a<b&&b<sunset&&sunset<c))return fail("complete-local-daylight-required");
  if(days.some(d=>!Array.isArray(d.tithis)||!d.tithis.length))return fail("missing-tithi-partitions");
  const rows=days.flatMap(d=>d.tithis).map(r=>({i:r.index,a:ms(r.startTime??r.start),b:ms(r.endTime??r.end)}));
  if(rows.some(r=>!Number.isInteger(r.i)||r.i<0||r.i>29||!Number.isFinite(r.a)||!Number.isFinite(r.b)||r.b<=r.a))return fail("invalid-tithi-interval");
  const groups=new Map();
  for(const row of rows){if(!groups.has(row.i))groups.set(row.i,[]);groups.get(row.i).push([row.a,row.b]);}
  const intervals=[...groups].flatMap(([i,parts])=>merged(parts).map(([a,b])=>({i,a,b})));
  const aruna=b-96*60000;
  const active=t=>intervals.filter(r=>r.a<=t&&t<r.b);
  const atDawn=active(aruna),atSunrise=active(b),atNextSunrise=active(c);
  if([atDawn,atSunrise,atNextSunrise].some(items=>items.length!==1))return fail("ambiguous-or-missing-sunrise-tithi");
  const [ek]=atDawn,[dv]=atSunrise,[tr]=atNextSunrise;
  if(ek.i!==index||dv.i!==index+1||tr.i!==index+2)return {status:"not-this-pattern",candidateDate:null,publishable:false};
  if(!(aruna<ek.b&&ek.b<b&&ek.b===dv.a&&dv.b===tr.a&&sunset<=dv.b&&dv.b<c))return {status:"not-this-pattern",candidateDate:null,publishable:false};
  const selected=[ek,dv,tr];
  if(intervals.some(row=>!selected.includes(row)&&row.a<c&&row.b>aruna)||
    selected.some((row,i)=>selected.slice(i+1).some(other=>Math.max(row.a,other.a)<Math.min(row.b,other.b))))return fail("conflicting-tithi-evidence");
  // Two transparent diagnostics for "ratrishesha". A quarter-night is a
  // possible reading; fixed four ghatis is a narrower dawn interpretation.
  // No unqualified equivalence or publication decision is made.
  const lastYamaStart=Math.floor(sunset+(c-sunset)*3/4);
  const nextAruna=c-96*60000;
  const lastYama=tr.a>=lastYamaStart;
  const lastFourGhatis=tr.a>=nextAruna;
  return {status:lastYama?"source-review-required":"narada-broad-reading-only",
    pattern:"narada-before-sunrise-dwadashi",candidateDate:null,publishable:false,index,
    month:day.masa??null,observanceDate:day.date,followingSunriseDate:next.date,
    arunodaya:iso(aruna),ekadashiEnd:iso(ek.b),dwadashiStart:iso(dv.a),dwadashiEnd:iso(dv.b),
    sunrise:day.sunrise,sunset:day.sunset,followingSunrise:next.sunrise,
    naradaBeforeSunrise:true,wholeDaylightDwadashi:true,
    lastNightDiagnostics:{lastYamaStart:iso(lastYamaStart),lastFourGhatisStart:iso(nextAruna),lastYama,lastFourGhatis},
    source:"Narada Purana 1.4.121.96; Drik expanded reading; late-night boundary not approved"};
}

// Separate date selection from the special prohibition on the form of
// observance. Do not infer eligibility, children, or tradition from a date.
export function resolveTrisprishaSourcePrecedence(cycle,tradition){
  const fail=reason=>({status:"manual-review",selectedDate:null,publishable:false,reason});
  if(cycle?.status!=="source-review-required"||cycle.pattern!=="dasami-ekadashi-trayodashi-sunrise-sequence-with-dwadashi-ksaya")return fail("complete-dharmasindhu-cycle-required");
  const c=cycle.candidates;
  if(!c?.smartaHouseholderEarlier||!c?.mumukshuVaishnavaLater)return fail("missing-source-candidates");
  if(tradition==="smarta-householder")return {status:"date-selected-needs-source-approval",selectedDate:c.smartaHouseholderEarlier,
    selectionBasis:"dharmasindhu-ekadashi-only-vriddhi-smarta-householder-earlier",publishable:false,
    precedence:{source:"Dharmasindhu Smarta first pariccheda; Madhava",scope:"ordinary Smarta householder date only",
      exception:"Kurma Purana as cited by Nirnayasindhu and Viramitrodaya: for a son/grandson-bearing householder, the later three-tithi day has a specific full-fast prohibition and nakta rule. Do not treat combined fast as universally applicable."},
    paranaRequiresReview:true};
  if(tradition==="vaishnava"&&cycle.arunodaya?.tithiIndex===cycle.index)return {status:"date-selected-needs-source-approval",selectedDate:c.mumukshuVaishnavaLater,
    selectionBasis:"dharmasindhu-trisprisha-vaishnava-later-arunodaya-clean",publishable:false,
    precedence:{source:"Dharmasindhu first pariccheda Mahadwadashi; Hari Bhakti Vilasa 12",scope:"explicit Vaishnava selection with clean Arunodaya"},
    paranaRequiresReview:true};
  if(tradition==="smarta-mumukshu")return {status:"date-selected-needs-source-approval",selectedDate:c.mumukshuVaishnavaLater,
    selectionBasis:"dharmasindhu-trisprisha-mumukshu-later",publishable:false,
    precedence:{source:"Dharmasindhu Smarta first pariccheda",scope:"explicit desire for liberation; ritual eligibility and specific prohibitions require review"},
    paranaRequiresReview:true};
  return fail("explicit-applicable-tradition-required");
}
