/**
 * Offline annual hybrid assembly. It consumes explicit occurrence IDs from
 * a reviewed yearly plan, never infers a date or promotes review candidates.
 * The plan and automatic decisions are transient objects; the sole maintained\n * year-specific festival JSON is the exception package. The assembled annual\n * result is an in-memory view, not a second persisted annual file.
 */
const validYear=y=>Number.isInteger(y)&&y>=1900&&y<=2200;
const validDate=(date,year)=>{
  if(typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!date.startsWith(year+"-"))return false;
  const instant=new Date(date+"T00:00:00Z");
  return Number.isFinite(instant.getTime())&&instant.toISOString().slice(0,10)===date;
};
const text=v=>typeof v==="string"&&v.trim().length>0;
const PUBLIC_FIELDS=["date","title","description","category","hinduTithi","articleUrl","articleLabel","secondaryArticleUrl","secondaryArticleLabel","muhurtaRule","muhurtaRules","muhurtaDate","followingMorningActionDate","specialPunyaKaalProfile","conjunctionStart","conjunctionEnd"];
const monthNames=["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
function indexRecords(records,name){
  if(!Array.isArray(records))throw new TypeError(name+" must contain records");
  const map=new Map();
  for(const row of records){
    if(!text(row?.occurrenceId)||map.has(row.occurrenceId))throw new Error(name+": missing or duplicate occurrence ID");
    map.set(row.occurrenceId,row);
  }
  return map;
}
export function assembleHybridFestivalYear({year,plan,automatic,exceptions}){
  if(!validYear(year)||[plan,automatic,exceptions].some(x=>x?.year!==year))throw new Error("Annual input year mismatch");
  const expected=indexRecords(plan.records,"plan");
  const auto=indexRecords(automatic.records,"automatic");
  const manual=indexRecords(exceptions.records,"exceptions");
  const issues=[];
  const events=[];
  const usedDates=new Set();
  if(plan.status!=="approved"||!expected.size)issues.push({reason:"complete-year-plan-not-approved"});
  for(const [id,row] of expected){
    if(!["automatic","exception"].includes(row.mode))throw new Error("Unknown mode: "+id);
    const active=row.mode==="automatic"?auto:manual;
    const other=row.mode==="automatic"?manual:auto;
    if(other.has(id)){issues.push({occurrenceId:id,reason:"conflicting-source"});continue;}
    const record=active.get(id);
    if(!record){issues.push({occurrenceId:id,reason:"missing-occurrence"});continue;}
    const event=record.event;
    if(record.reviewStatus!=="approved"||record.publishable!==true||
      record.autoApproved===true||
      !text(record.reviewEvidence)||
      (row.mode==="automatic"&&(!text(record.ruleId)||!text(record.ruleVersion)))||
      (row.mode==="exception"&&(!text(record.decisionSource)||!text(record.exceptionReason)))){
      issues.push({occurrenceId:id,reason:"approval-or-provenance-missing"});continue;
    }
    if(!validDate(event?.date,year)||!text(event?.title)){
      issues.push({occurrenceId:id,reason:"invalid-event-date-or-title"});continue;
    }
    const dateTitle=event.date+"::"+event.title;
    if(usedDates.has(dateTitle)){issues.push({occurrenceId:id,reason:"duplicate-date-title"});continue;}
    usedDates.add(dateTitle);
    const publicEvent=Object.fromEntries(PUBLIC_FIELDS.filter(key=>Object.hasOwn(event,key)).map(key=>[key,structuredClone(event[key])]));
    // The public renderer expects event-level approval. Derive it only from
    // the separately approved input decision, never from a computed date.
    publicEvent.reviewStatus="approved";
    publicEvent.showReviewStatus=false;
    publicEvent.dateLabel=Number(event.date.slice(8))+" "+monthNames[Number(event.date.slice(5,7))-1];
    events.push(publicEvent);
  }
  for(const [id] of [...auto,...manual])if(!expected.has(id))issues.push({occurrenceId:id,reason:"unexpected-occurrence"});
  events.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,"hi"));
  const ready=issues.length===0&&events.length===expected.size;
  const report={year,status:ready?"approved":"needs-review",counts:{expected:expected.size,automatic:auto.size,exceptions:manual.size,accepted:events.length,issues:issues.length},issues};
  // No partial public year: a caller must not publish a missing month as an empty calendar.
  return {report,annual:ready?{schemaVersion:1,year,status:"approved",eventCount:events.length,events}:null};
}

/** Select one calendar month without persisting another JSON. */
export function getHybridFestivalMonth(result,year,month){
  if(!validYear(year)||!Number.isInteger(month)||month<1||month>12)throw new RangeError("Invalid year/month");
  const annual=result?.annual;
  if(result?.report?.status!=="approved"||annual?.status!=="approved"||annual.year!==year||
    !Array.isArray(annual.events)||!annual.events.length||annual.eventCount!==annual.events.length||
    annual.events.some(e=>!validDate(e?.date,year)||e.reviewStatus!=="approved"))return null;
  const prefix=year+"-"+String(month).padStart(2,"0")+"-";
  return {schemaVersion:1,year,month,monthName:monthNames[month-1],status:"approved",
    events:annual.events.filter(e=>e.date.startsWith(prefix)).map(e=>structuredClone(e))};
}
