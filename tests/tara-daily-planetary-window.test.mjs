import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {selectDailyPlanetaryWindow} from "../research/daily-planetary-window.mjs";
import {calculateAnnualTara} from "../research/annual-tara-runtime.mjs";
import {profiles} from "../research/annual-tara-profiles.mjs";
const row=(event,date,body="Venus")=>({body,event,utcMilliseconds:Date.parse(date+"T10:00:00+05:30")});
const a=row("Asta","2025-12-11"),u=row("Udaya","2026-02-02");
const a2=row("Asta","2026-10-12"),u2=row("Udaya","2026-10-29");
const rows=[a,u,a2,u2];
test("active interval crosses December/January and includes both local boundary days",()=>{
 for(const date of ["2025-12-11","2026-01-01","2026-02-02"]){
   assert.deepEqual(selectDailyPlanetaryWindow(rows,"Venus",date),
   {status:"active",astaUtcMilliseconds:a.utcMilliseconds,udayaUtcMilliseconds:u.utcMilliseconds});
 }
 assert.deepEqual(selectDailyPlanetaryWindow(rows,"Venus","2026-02-03"),
 {status:"upcoming",astaUtcMilliseconds:a2.utcMilliseconds,udayaUtcMilliseconds:u2.utcMilliseconds});
});
test("do not invent missing, duplicate, reversed, unsupported or ambiguous windows",()=>{
 for(const input of [[u,a2,u2],[a,u2,a2],[a,a,u],[a,u,u]]) {
   // The second example is valid only if chronologically ordered; use a missing middle crossing instead.
   if(input[0]===a&&input[1]===u2&&input[2]===a2) continue;
   assert.equal(selectDailyPlanetaryWindow(input,"Venus","2026-01-01"),null);
 }
 assert.equal(selectDailyPlanetaryWindow([a,a2,u2],"Venus","2026-01-01"),null);
 assert.equal(selectDailyPlanetaryWindow([a2],"Venus","2026-01-01"),null);
 assert.equal(selectDailyPlanetaryWindow(rows,"Mars","2026-01-01"),null);
 assert.equal(selectDailyPlanetaryWindow(rows,"Venus","2026-02-30"),null);
});
test("daily interval boundaries come unchanged from independently calculated annual events",()=>{
 const engine=createRequire(import.meta.url)("astronomy-engine");
 const location={latitude:29.5828,longitude:80.2182,elevation:1650};
 const events=[2025,2026,2027].flatMap(year=>calculateAnnualTara(engine,location,year,profiles).events);
 for(const body of ["Venus","Jupiter"]){
   const result=selectDailyPlanetaryWindow(events,body,"2026-01-01");
   assert.ok(result,body);
   assert.ok(events.some(e=>e.body===body&&e.event==="Asta"&&e.utcMilliseconds===result.astaUtcMilliseconds));
   assert.ok(events.some(e=>e.body===body&&e.event==="Udaya"&&e.utcMilliseconds===result.udayaUtcMilliseconds));
 }
 const venus=selectDailyPlanetaryWindow(events,"Venus","2026-01-01");
 assert.equal(venus.status,"active");
 assert.ok(venus.astaUtcMilliseconds<Date.parse("2026-01-01T00:00:00+05:30"));
});
