import * as api from '@ishubhamx/panchangam-js';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const sandbox={window:{},console,Date,setTimeout,clearTimeout};
vm.runInNewContext(await readFile(new URL('../eclipse-panchang.js',import.meta.url),'utf8'),sandbox);
const tools=sandbox.window.__OHDEclipsePanchangTools;
const cities=[['Pithoragarh',29.5828,80.2182,1650],['Delhi',28.6139,77.209,216],['Mumbai',19.076,72.8777,14],['Kolkata',22.5726,88.3639,9],['Chennai',13.0827,80.2707,6],['Guwahati',26.1445,91.7362,55]];
const rows=[];
for(const [name,lat,lon,elevation] of cities){
 const observer=new api.Observer(lat,lon,elevation);
 for(const year of [2026,2027,2030]){
  const events=await tools.discoverEclipses(year,{name,city:name,lat,lon,elevation},api);
  for(const item of events){
   const g=item.grahan;
   const days=tools.getEclipseDayPanchangs(item.date,observer,api);
   const visibility=tools.getLocalVisibility(g,days);
   rows.push({name,year,date:item.date,grahan:g,visibility,days:days.map(d=>({moonrise:d?.moonrise,moonset:d?.moonset,sunrise:d?.sunrise,sunset:d?.sunset}))});
  }
 }
}
console.log(JSON.stringify(rows,null,2));
await (await import('node:fs/promises')).writeFile('eclipse-audit-results.json',JSON.stringify(rows,null,2));
if(!rows.length)throw Error('No eclipses returned');
