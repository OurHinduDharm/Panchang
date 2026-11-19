// Reuses the existing ?date=YYYY-MM-DD Panchang URL.
// Optional location parameters are consumed by app.js; no separate Panchang engine.
export function readPanchangLinkLocation(params) {
  const latText=params.get("lat"),lonText=params.get("lon"),elevationText=params.get("elevation");
  if ([latText,lonText,elevationText].some(v=>v===null||v.trim()==="")) return null;
  const lat=Number(latText),lon=Number(lonText),elevation=Number(elevationText);
  if (![lat,lon,elevation].every(Number.isFinite)||Math.abs(lat)>90||Math.abs(lon)>180||elevation< -500||elevation>9000) return null;
  const name=(params.get("place")||"").trim();
  if (!name || name.length>160) return null;
  return {name,lat,lon,elevation,city:name};
}
export function validPanchangDate(date) {
  if (typeof date !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) return false;
  const year=Number(date.slice(0,4)), month=Number(date.slice(5,7)), day=Number(date.slice(8,10));
  const parsed=new Date(Date.UTC(year,month-1,day));
  return year>=100 && parsed.getUTCFullYear()===year &&
    parsed.getUTCMonth()+1===month && parsed.getUTCDate()===day;
}
export function buildPanchangEventUrl(baseUrl,date,location) {
  if (!validPanchangDate(date)) throw new Error("Invalid event date");
  if (!readPanchangLinkLocation(new URLSearchParams({
    lat:String(location.latitude),lon:String(location.longitude),
    elevation:String(location.elevation),place:String(location.name??"")
  }))) throw new Error("Invalid event observer");
  const url=new URL(baseUrl);
  url.searchParams.set("date",date);
  url.searchParams.set("lat",String(location.latitude));
  url.searchParams.set("lon",String(location.longitude));
  url.searchParams.set("elevation",String(location.elevation));
  url.searchParams.set("place",location.name);
  return url.href;
}
