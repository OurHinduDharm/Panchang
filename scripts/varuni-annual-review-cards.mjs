// Build year-independent review cards, never write or approve public catalogues.
const labels = new Set(["वारुणी योग","महावारुणी योग","महामहावारुणी योग"]);
const descriptions = {"वारुणी योग":"चैत्र कृष्ण त्रयोदशी और शतभिषा नक्षत्र के संयोग को वारुणी योग कहते हैं।","महावारुणी योग":"वारुणी योग के साथ शनिवार का संयोग होने पर महावारुणी योग होता है।","महामहावारुणी योग":"महावारुणी के साथ शुभ योग का संयोग महामहावारुणी योग कहलाता है।"};
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
  for(const row of candidates){
    const label=row.labels?.[0],key=String(row.date).slice(0,7),year=Number(key.slice(0,4));
    const start=Date.parse(row.startTime),end=Date.parse(row.endTime);
    if(!labels.has(label)||row.ruleProfile!==profile||!Object.hasOwn(output,key)||blocked.has(year))continue;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||!Number.isFinite(Date.parse(row.date+"T00:00:00Z"))||new Date(row.date+"T00:00:00Z").toISOString().slice(0,10)!==row.date||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)continue;
    const id=[row.date,label,row.startTime,row.endTime].join("|");
    if(seen.has(id))continue;
    seen.add(id);
    output[key].push({date:row.date,title:label,category:"योग",hinduTithi:"चैत्र कृष्ण त्रयोदशी",
      description:descriptions[label],
      reviewStatus:"needs-review",specialPunyaKaalProfile:profile,conjunctionStart:row.startTime,conjunctionEnd:row.endTime});
  }
  for(const list of Object.values(output))list.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,"hi"));
  return output;
}
