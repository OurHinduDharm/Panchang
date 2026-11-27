// Build year-independent review cards, never write or approve public catalogues.
const labels = new Set(["वारुणी योग","महावारुणी योग","महामहावारुणी योग"]);
const profile = "chaitra-krishna-trayodashi-shatabhisha";
export function parseVaruniReviewYears(args = []){
  if(!args.length)return [2026,2027,2028,2029,2030];
  if(args.length!==2||args[0]!=="--year"||!/^\d{4}$/.test(args[1])||Number(args[1])<1900||Number(args[1])>2200)
    throw new RangeError("Usage: generate-special-punya-kaal-review.mjs --year YYYY (1900–2200)");
  return [Number(args[1])];
}
export function buildVaruniReviewCards(candidates,years,diagnostics=[]){
  const output=Object.fromEntries(years.flatMap(year=>[3,4].map(month=>[year+"-"+String(month).padStart(2,"0"),[]])));
  const seen=new Set();
  // Incomplete annual evidence must never produce a seemingly complete draft.
  const blocked=new Set(diagnostics.map(item=>item.year));
  const fmt=new Intl.DateTimeFormat("hi-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"long",hour:"numeric",minute:"2-digit",hour12:true,numberingSystem:"latn"});
  for(const row of candidates){
    const label=row.labels?.[0],key=String(row.date).slice(0,7),year=Number(key.slice(0,4));
    const start=Date.parse(row.startTime),end=Date.parse(row.endTime);
    if(!labels.has(label)||row.ruleProfile!==profile||!Object.hasOwn(output,key)||blocked.has(year))continue;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||!Number.isFinite(Date.parse(row.date+"T00:00:00Z"))||new Date(row.date+"T00:00:00Z").toISOString().slice(0,10)!==row.date||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)continue;
    const id=[row.date,label,row.startTime,row.endTime].join("|");
    if(seen.has(id))continue;
    seen.add(id);
    output[key].push({date:row.date,title:label,category:"योग",hinduTithi:"चैत्र कृष्ण त्रयोदशी",
      description:"संयोग का गणितीय समय (पिथौरागढ़, IST): "+fmt.format(new Date(start))+" से "+fmt.format(new Date(end))+" तक।",
      reviewStatus:"needs-review",specialPunyaKaalProfile:profile,conjunctionStart:row.startTime,conjunctionEnd:row.endTime});
  }
  for(const list of Object.values(output))list.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,"hi"));
  return output;
}
