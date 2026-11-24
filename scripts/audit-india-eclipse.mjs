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
 for(const year of Array.from({length:25},(_,i)=>2026+i)){
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

const imd={Delhi:18*60+22,Kolkata:17*60+39,Chennai:18*60+17,Guwahati:17*60+24};
const istMinutes=x=>{const d=new Date(+new Date(x)+19800000);return d.getUTCHours()*60+d.getUTCMinutes()+d.getUTCSeconds()/60;};
for(const [name,expected] of Object.entries(imd)){
 const row=rows.find(r=>r.name===name&&r.year===2026&&new Date(+new Date(r.date)+19800000).toISOString().startsWith('2026-03-03'));
 if(!row||!row.visibility.localVisible||!row.visibility.grastodaya)throw Error('Missing IMD visible eclipse '+name);
 if(Math.abs(istMinutes(row.visibility.visibleStart)-expected)>2)throw Error('IMD moonrise discrepancy '+name);
 if(Math.abs(istMinutes(row.grahan.contact.lastContact)-1128)>1)throw Error('IMD lunar end discrepancy '+name);
}
