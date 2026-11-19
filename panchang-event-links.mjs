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
export function buildPanchangEventUrl(baseUrl,date,location) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date) || Number.isNaN(Date.parse(date+"T12:00:00Z"))) throw new Error("Invalid event date");
  const url=new URL(baseUrl);
  url.searchParams.set("date",date);
  url.searchParams.set("lat",String(location.latitude));
  url.searchParams.set("lon",String(location.longitude));
  url.searchParams.set("elevation",String(location.elevation));
  url.searchParams.set("place",location.name);
  return url.href;
}
