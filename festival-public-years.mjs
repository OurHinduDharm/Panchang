// Shared navigation for the public monthly readers. No calendar/date computation here.
import {publishedYears} from "./data/festivals/published-years.mjs";
export function createPublishedYearNavigation(years){
  const list=[...new Set(years)].sort((a,b)=>a-b);
  if(!list.length||list.some(y=>!Number.isInteger(y)||y<1900||y>2200))throw new Error("Invalid published year index");
  const has=y=>Number.isInteger(y)&&list.includes(y);
  const validMonth=m=>Number.isInteger(m)&&m>=1&&m<=12;
  function shift(year,month,delta){
    if(!has(year)||!validMonth(month)||![-1,1].includes(delta))return null;
    let y=year,m=month+delta;
    if(m<1){y--;m=12;}else if(m>12){y++;m=1;}
    return has(y)?{year:y,month:m}:null;
  }
  function initial(year,month){
    if(has(year))return {year,month:validMonth(month)?month:1};
    if(year<list[0])return {year:list[0],month:1};
    const previous=list.filter(y=>y<year).at(-1);
    return previous?{year:previous,month:12}:{year:list[0],month:1};
  }
  return Object.freeze({years:Object.freeze(list),has,shift,initial});
}
export const publishedYearNavigation=createPublishedYearNavigation(publishedYears);
export function syncPublishedYearOptions(select,navigation=publishedYearNavigation){
  const old=select.value;
  const options=navigation.years.map(year=>{
    const option=select.ownerDocument.createElement("option");
    option.value=String(year);option.textContent=String(year);return option;
  });
  select.replaceChildren(...options);
  if(navigation.has(Number(old)))select.value=old;
}
