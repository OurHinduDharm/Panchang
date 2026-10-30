const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { getPanchangam, Observer } = require("@ishubhamx/panchangam-js");

const LOCATION = new Observer(29.5828, 80.2182, 1650);
const TZ = 330;
const DATA = path.join(process.cwd(), "data", "festivals");
const localNoon = (iso) => { const [y,m,d] = iso.split("-").map(Number); return new Date(Date.UTC(y,m-1,d,6,30,0)); };
const asDate = value => { const d = value instanceof Date ? new Date(value.getTime()) : new Date(value); return Number.isFinite(d.getTime()) ? d : null; };
const label = value => value && typeof value === "object" ? value.name ?? value.label ?? value.index ?? value.number ?? value.value ?? "" : value;
const localTime = value => { const d=asDate(value); return d ? new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}).format(d) : null; };
function activeAt(intervals, instant) {
  const at=asDate(instant); if(!at) return null;
  const row=intervals.find(x=>{const s=asDate(x.startTime??x.start),e=asDate(x.endTime??x.end);return s&&e&&s<=at&&e>at;});
  return row ? {index:row.index,name:label(row),start:localTime(row.startTime??row.start),end:localTime(row.endTime??row.end)} : null;
}
function getMonthEvents(year,month){
  const file=path.join(DATA,year+"-"+String(month).padStart(2,"0")+".json");
  return JSON.parse(fs.readFileSync(file,"utf8")).events||[];
}

test("diagnose missing tithi metadata against local Pithoragarh tithi intervals for 2027-2028", () => {
  const rows=[];
  for(const year of [2027,2028]) for(let month=1;month<=12;month++) for(const event of getMonthEvents(year,month)){
    if(event.hinduTithi) continue;
    const date=localNoon(event.date);
    const prevDate=new Date(date.getTime()); prevDate.setUTCDate(prevDate.getUTCDate()-1);
    const nextDate=new Date(date.getTime()); nextDate.setUTCDate(nextDate.getUTCDate()+1);
    const p=getPanchangam(date,LOCATION,{timezoneOffset:TZ,calendarType:"purnimanta"});
    const prev=getPanchangam(prevDate,LOCATION,{timezoneOffset:TZ,calendarType:"purnimanta"});
    const next=getPanchangam(nextDate,LOCATION,{timezoneOffset:TZ,calendarType:"purnimanta"});
    const intervals=[...(prev.tithis||[]),...(p.tithis||[]),...(next.tithis||[])];
    const sunrise=asDate(p.sunrise),sunset=asDate(p.sunset),nextSunrise=asDate(next.sunrise),moonrise=asDate(p.moonrise);
    const madhyahna=sunrise&&sunset?new Date(sunrise.getTime()+(sunset.getTime()-sunrise.getTime())/2):null;
    const nishita=sunset&&nextSunrise?new Date(sunset.getTime()+(nextSunrise.getTime()-sunset.getTime())/2):null;
    rows.push({year,date:event.date,title:event.title,masa:label(p.masa),paksha:label(p.paksha),
      sunrise:localTime(sunrise),sunriseTithi:activeAt(intervals,sunrise),
      madhyahnaTithi:activeAt(intervals,madhyahna),nishitaTithi:activeAt(intervals,nishita),
      moonrise:localTime(moonrise),moonriseTithi:activeAt(intervals,moonrise)});
  }
  console.log("OHD_MISSING_TITHI_DIAGNOSTIC_2027_2028="+JSON.stringify(rows));
  assert.ok(rows.length>50,"expected to inspect the known missing tithi metadata records");
});
