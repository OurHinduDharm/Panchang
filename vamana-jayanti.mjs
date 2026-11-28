import {completeDay} from "./festival-tithi-partitions.mjs";

// Dharmasindhu II, Bhadrapada, Vamana Jayanti:
// https://www.transliteral.org/pages/z80430223852/view
// Madhyahna Dwadashi, Shravana yoga outside Madhyahna, and Ekadashi
// fallback are distinct from the general Shravana Dwadashi vrata.
// This is candidate evidence only; parana and ambiguous branches are not approved.
const ms=Date.parse;
const overlap=(a,b,c,d)=>Math.max(0,Math.min(b,d)-Math.max(a,c));
const pending=(reason,evaluations=[])=>({status:"manual-review",selectedDate:null,finalDate:null,
  warnings:[reason],evaluations,autoApproved:false,publishable:false});
export function reviewVamanaJayanti(days) {
  const idx=days.flatMap((d,i)=>d.masa==="भाद्रपद"&&d.tithis.some(t=>[10,11].includes(t.index))?[i]:[]);
  if(!idx.length||idx.length>4||idx[0]===0||idx.at(-1)+1>=days.length||
    idx.at(-1)-idx[0]+1!==idx.length) return pending("complete-regular-bhadrapada-cycle-required");
  const cycle=days.slice(idx[0],idx.at(-1)+1);
  if(![days[idx[0]-1],...cycle].every((d,i)=>completeDay(d,days[idx[0]+i])))
    return pending("complete-contiguous-tithi-partitions-required");
  const evaluations=[];
  for(const d of cycle){
    const a=ms(d.sunrise),b=ms(d.sunset),c=ms(d.nextSunrise);
    if(!(a<b&&b<c))return pending("local-daylight-required",evaluations);
    const t=d.tithis.filter(x=>[10,11].includes(x.index));
    const n=(d.nakshatraIntervals??[]).map(x=>({index:Number(x.index??x.number??x.value),
      start:ms(x.startTime??x.start),end:ms(x.endTime??x.end)}))
      .filter(x=>Number.isInteger(x.index)&&x.index>=0&&x.index<27&&x.end>x.start)
      .sort((x,y)=>x.start-y.start);
    // Absence of Shravana must be established by complete nakshatra coverage
    // over the relevant tithis, not inferred from an empty or truncated array.
    const covered=t.every(x=>{
      let cursor=ms(x.startTime);const end=ms(x.endTime);
      for(const y of n){if(y.end<=cursor)continue;if(y.start>cursor)break;
        cursor=Math.min(end,y.end);if(cursor===end)return true;}
      return false;
    });
    const consistent=n.every((x,i)=>!i||x.start>=n[i-1].end);
    const sum=(i,shravana)=>t.filter(x=>x.index===i).reduce((s,x)=>s+
      (shravana?n.filter(y=>y.index===21).reduce((z,y)=>z+overlap(ms(x.startTime),ms(x.endTime),y.start,y.end),0):
        overlap(ms(x.startTime),ms(x.endTime),a+(b-a)*2/5,a+(b-a)*3/5)),0);
    evaluations.push({date:d.date,nakshatraComplete:covered&&consistent,
      dwadashiMadhyahnaMs:sum(11,false),dwadashiShravanaMs:sum(11,true),ekadashiShravanaMs:sum(10,true),
      ekadashiAtSunrise:d.tithis[0]?.index===10,
      ekadashiYuktaDwadashi:t.some(x=>x.index===10)&&t.some(x=>x.index===11)});
  }
  if(!evaluations.every(x=>x.nakshatraComplete))return pending("nakshatra-coverage-incomplete-or-overlapping",evaluations);
  const middle=evaluations.filter(x=>x.dwadashiMadhyahnaMs>0);
  const dy=evaluations.filter(x=>x.dwadashiShravanaMs>0);
  const ey=evaluations.filter(x=>x.ekadashiShravanaMs>0);
  const choose=(x,basis)=>({status:"date-selected-needs-source-approval",selectedDate:x.date,finalDate:x.date,
    selectionBasis:basis,evaluations,autoApproved:false,publishable:false,
    warnings:["source-and-publication-approval-required","vamana-parana-separate-review-required"]});
  if(dy.length){
    if(middle.length===1&&dy.some(x=>x.date===middle[0].date))
      return choose(middle[0],"dharmasindhu-madhyahna-dwadashi-with-shravana");
    if(dy.length===2&&middle.some(x=>x.date===dy[0].date))
      return choose(dy[0],"dharmasindhu-two-shravana-days-earlier");
    // Earlier midday and later Shravana outside midday.
    if(middle.length===1&&dy.length===1&&middle[0].date<dy[0].date)
      return choose(middle[0],"dharmasindhu-earlier-madhyahna-later-non-madhyahna-shravana");
    return pending("dwadashi-shravana-madhyahna-conflict-review",evaluations);
  }
  if(ey.length){
    const clean=ey.filter(x=>x.ekadashiAtSunrise);
    if(clean.length===1)return choose(clean[0],"dharmasindhu-ekadashi-shravana-without-dwadashi-shravana");
    if(!clean.length&&ey.length===1)return choose(ey[0],"dharmasindhu-viddha-ekadashi-shravana-exception-review");
    return pending("ekadashi-shravana-multiple-days-review",evaluations);
  }
  if(middle.length===1)return choose(middle[0],"dharmasindhu-no-shravana-unique-madhyahna");
  const mixed=evaluations.filter(x=>x.ekadashiYuktaDwadashi);
  if(mixed.length===1&&(middle.length===0||middle.some(x=>x.date===mixed[0].date)))
    return choose(mixed[0],"dharmasindhu-both-or-neither-madhyahna-ekadashi-yukta-review");
  return pending("vamana-special-branch-unresolved",evaluations);
}
