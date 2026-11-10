import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getPanchangam, Observer } from "@ishubhamx/panchangam-js";
import { getFestivalMuhurta } from "../festival-muhurta.js";
const LOCATION = new Observer(29.5828, 80.2182, 1650);
const OPTIONS = { timezoneOffset: 330, calendarType: "purnimanta" };
const folder = join(process.cwd(), "data", "festivals");
const months = Array.from({ length: 12 }, (_, i) => JSON.parse(readFileSync(join(folder, "2030-" + String(i + 1).padStart(2, "0") + ".json"), "utf8")));
const events = months.flatMap(month => month.events || []);
const asDate = value => { const d = value instanceof Date ? new Date(value.getTime()) : new Date(value); return Number.isFinite(d.getTime()) ? d : null; };
const localNoon = iso => new Date(iso + "T06:30:00.000Z");
const ruleIds = event => Array.isArray(event.muhurtaRules) ? event.muhurtaRules : (event.muhurtaRule ? [event.muhurtaRule] : []);
test("all 2030 Pithoragarh Sankashti cards have Krishna Chaturthi at local moonrise", () => {
 const list=events.filter(event=>/संकष्टी/.test(event.title||""));
 assert.equal(list.length,12);
 const failures=[];
 for(const event of list){
  const p=getPanchangam(localNoon(event.date),LOCATION,OPTIONS), moonrise=asDate(p&&p.moonrise);
  const overlaps=(p&&p.tithis||[]).some(row=>{
   if(Number(row.index)!==18)return false;
   const start=asDate(row.startTime),finish=asDate(row.endTime);
   return start&&finish&&moonrise&&start<=moonrise&&finish>moonrise;
  });
  if(!moonrise)failures.push({date:event.date,reason:"missing moonrise"});
  else if(!overlaps&&event.date==="2030-04-21"){
   const sunrise=asDate(p.sunrise);
   const chaturthi=(p.tithis||[]).find(row=>Number(row.index)===18);
   const start=asDate(chaturthi&&chaturthi.startTime), end=asDate(chaturthi&&chaturthi.endTime);
   if(!sunrise||!chaturthi||!start||start>sunrise||!end||end>=moonrise){
    failures.push({date:event.date,reason:"expected sunrise Chaturthi ending before moonrise"});
   }else{
    const result=getFestivalMuhurta({muhurtaRule:"sankashti-chaturthi-moonrise"},{moonrise,tithis:p.tithis});
    if(result.status!=="unavailable"||!/व्रत-तिथि स्वतः नहीं बदली गई/.test(result.message||"")){
     failures.push({date:event.date,reason:"no-overlap exception must not invent a moonrise muhurta"});
    }
   }
  }else if(!overlaps)failures.push({date:event.date,reason:"Krishna Chaturthi absent at moonrise"});
  if(!ruleIds(event).some(rule=>["sankashti-chaturthi-moonrise","karwa-chauth-puja"].includes(rule)))failures.push({date:event.date,reason:"moonrise/puja rule missing"});
 }
 assert.deepEqual(failures,[]);
});
