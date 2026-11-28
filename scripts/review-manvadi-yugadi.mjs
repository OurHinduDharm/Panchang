/**
 * Research-only evidence generator for #545.
 * Compare explicitly labelled source-month and ritual-window hypotheses.
 * No final date selection, publication, or modification of approved calendars.
 */
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { buildFestivalRuleContexts } from "../festival-rule-engine.mjs";

const months = ["चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद","आश्विन","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन"];
const normalizeMonth = month => month === "भाद्र" ? "भाद्रपद" : month;

export function deriveSelectors(record) {
  const month = normalizeMonth(record.month);
  const idx = months.indexOf(month);
  if (idx < 0 || !["शुक्ल","कृष्ण"].includes(record.paksha) ||
      !Number.isInteger(record.tithi) || record.tithi < 1 || record.tithi > 15)
    throw new Error("invalid reference tithi");
  const krishna = record.paksha === "कृष्ण";
  const tithiIndex = record.tithi - 1 + (krishna ? 15 : 0);
  return {
    tithiIndex,
    monthHypotheses: krishna ? [
      {id:"amanta-to-purnimanta",month:months[(idx+1)%12]},
      {id:"source-already-purnimanta",month}
    ] : [{id:"shukla-month-unchanged",month}],
    windows: krishna ? [
      {id:"nirnayasindhu-half-day-aparahna",from:0.5,to:1},
      {id:"dharmasindhu-fourth-fifth-aparahna",from:0.6,to:0.8}
    ] : [{id:"purvahna-first-half-daylight",from:0,to:0.5}]
  };
}

const parseTime = value => typeof value === "string" || value instanceof Date ? new Date(value).getTime() : NaN;
function intersect(day, tithiIndex, window) {
  const sunrise = parseTime(day.sunrise), sunset = parseTime(day.sunset);
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset) || sunset <= sunrise) return null;
  const from = sunrise + (sunset-sunrise)*window.from, to = sunrise + (sunset-sunrise)*window.to;
  const parts = day.tithis.filter(row=>row.index===tithiIndex)
    .map(row=>({start:Math.max(from,parseTime(row.startTime??row.start)),end:Math.min(to,parseTime(row.endTime??row.end))}))
    .filter(row=>Number.isFinite(row.start)&&Number.isFinite(row.end)&&row.end>row.start)
    .sort((a,b)=>a.start-b.start);
  const merged=[];
  for(const part of parts){
    const last=merged.at(-1);
    if(last&&part.start<=last.end)last.end=Math.max(last.end,part.end);
    else merged.push({...part});
  }
  return merged.map(({start,end})=>({start:new Date(start).toISOString(),end:new Date(end).toISOString(),seconds:(end-start)/1000}));
}

export function buildManvadiYugadiEvidence(reference, annual) {
  if (reference?.status !== "reference-only" || !Array.isArray(reference.records) ||
      !Array.isArray(annual?.dailyPanchang)) throw new Error("reference-only data and annual calculation required");
  const days=buildFestivalRuleContexts(annual.dailyPanchang);
  if(!days.length)throw new Error("annual calculation empty");
  if(new Set(days.map(d=>d.date)).size!==days.length)throw new Error("duplicate annual dates");
  const records=reference.records.map(record=>{
    const selectors=deriveSelectors(record);
    const alternatives=selectors.monthHypotheses.flatMap(month=>selectors.windows.map(window=>{
      const candidates=[], incompleteDates=[];
      for(const day of days){
        const raw=String(day.masa??"").trim(), adhika=/^अधिक\s+/.test(raw);
        if(normalizeMonth(raw.replace(/^अधिक\s+/,"").trim())!==month.month)continue;
        const overlaps=intersect(day,selectors.tithiIndex,window);
        if(overlaps===null||!day.tithis.length){incompleteDates.push(day.date);continue;}
        if(overlaps.length)candidates.push({date:day.date,monthKind:adhika?"adhika":"regular",overlaps});
      }
      return {monthHypothesis:month.id,purnimantaMonth:month.month,window:window.id,
        candidates,incompleteDates,status:"manual-review"};
    }));
    return {kind:record.kind,sourceName:record.name,sourceMonth:record.month,paksha:record.paksha,
      tithi:record.tithi,tithiIndex:selectors.tithiIndex,alternatives,publishable:false};
  });
  return {year:annual.year??null,location:annual.location??null,status:"review-only-not-approved",
    publishable:false,records};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const year=Number(process.argv[2]);
  if(!Number.isInteger(year)||year<2026||year>2031)throw new Error("supply an existing annual review year, 2026–2031");
  const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),"utf8"));
  const reference=await read("../data/references/taraprasad-2084-manvadi-yugadi.json");
  const annual=await read("../data/ohd-annual-panchang-review-"+year+".json");
  if(annual.year!==year)throw new Error("annual year mismatch");
  console.log(JSON.stringify(buildManvadiYugadiEvidence(reference,annual),null,2));
}
