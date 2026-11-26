// Research only. Tara Prasad VS 2084 p.10, user-reviewed transcription.
// Run from repo root: node scripts/audit-mahapat-taraprasad-2084.mjs
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const raw = "V 2027-04-16 17:28 2027-04-16 21:27\nW 2027-04-29 22:46 2027-04-29 27:38\nV 2027-05-12 11:22 2027-05-12 16:14\nW 2027-05-25 15:49 2027-05-25 22:17\nV 2027-06-07 15:45 2027-06-07 22:14\nW 2027-06-20 26:35 2027-06-21 11:00\nV 2027-06-30 19:03 2027-06-30 26:06\nW 2027-07-12 25:43 2027-07-13 08:20\nV 2027-07-26 28:40 2027-07-27 10:04\nW 2027-08-07 25:49 2027-08-08 06:33\nV 2027-08-21 23:11 2027-08-21 27:39\nW 2027-09-02 24:06 2027-09-02 27:56\nW 2027-09-28 22:27 2027-09-28 26:08\nW 2027-09-29 14:44 2027-09-29 18:53\nV 2027-10-11 24:22 2027-10-11 28:44\nW 2027-10-24 16:50 2027-10-24 21:00\nV 2027-11-06 11:37 2027-11-06 16:54\nW 2027-11-19 09:30 2027-11-19 14:56\nV 2027-12-01 28:03 2027-11-02 11:26\nW 2027-12-15 15:34 2027-12-15 23:14\nV 2027-12-24 13:35 2027-12-24 22:16\nW 2028-01-07 21:06 2028-01-07 28:20\nV 2028-01-19 22:06 2028-01-19 28:11\nW 2028-02-02 20:36 2028-02-02 25:54\nV 2028-02-14 18:27 2028-02-14 22:47\nW 2028-03-24 17:39 2028-03-24 21:59\nW 2028-03-25 10:42 2028-03-25 15:44";
const ms = 60000;
const toUTC = (day, time) => {
  const [h,m] = time.split(":").map(Number);
  return Date.parse(day+"T00:00:00+05:30")+(h*60+m)*ms;
};
const rows = raw.split("\n").map((line,index) => {
  const [type,sd,st,ed,et] = line.split(" ");
  const row = index+1;
  // Preserve printed row 19; independently supported date correction only.
  // Row 13 remains W; rows 14/27 are not silently relabeled.
  const start = toUTC(sd,st), end = toUTC(row===19?"2027-12-02":ed,et);
  assert.ok(end>start, "invalid normalized interval "+row);
  return {row,raw:line,type,start,end};
});
assert.equal(rows.length,27);
assert.equal(toUTC("2027-12-01","28:03"),Date.parse("2027-12-02T04:03:00+05:30"));
const median = xs => {
  const ys=xs.slice().sort((a,b)=>a-b);
  return ys.length ? (ys[Math.floor((ys.length-1)/2)]+ys[Math.floor(ys.length/2)])/2 : null;
};
const reports = [];
for(const model of ["taraprasad-30-arcmin","apparent-disks"]){
  const out=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL("./compare-mahapat-ephemeris.mjs",import.meta.url)),"--years=2027,2028","--contact-model="+model],{encoding:"utf8",maxBuffer:16*1024*1024}));
  const events=out.events.filter(e=>Date.parse(e.startTime)>=toUTC("2027-04-01","00:00")&&Date.parse(e.startTime)<toUTC("2028-04-01","00:00"));
  const used=new Set(), matches=[], unmatched=[];
  for(const r of rows){
    const candidates=events.filter(e=>!used.has(e)&&e.type===(r.type==="V"?"व्यतीपात महापात":"वैधृति महापात")&&Math.abs(Date.parse(e.startTime)-r.start)<=360*ms);
    if(candidates.length!==1){unmatched.push({...r,candidateCount:candidates.length});continue;}
    const e=candidates[0];used.add(e);
    matches.push({row:r.row,raw:r.raw,computedStart:e.startTimeIST,computedEnd:e.endTimeIST,startError:(Date.parse(e.startTime)-r.start)/ms,endError:(Date.parse(e.endTime)-r.end)/ms});
  }
  reports.push({model,matched:matches.length,medianAbsoluteStartMinutes:median(matches.map(x=>Math.abs(x.startError))),medianAbsoluteEndMinutes:median(matches.map(x=>Math.abs(x.endError))),bothWithinOne:matches.filter(x=>Math.max(Math.abs(x.startError),Math.abs(x.endError))<=1).length,bothWithinThree:matches.filter(x=>Math.max(Math.abs(x.startError),Math.abs(x.endError))<=3).length,matches,unmatched,extra:events.filter(e=>!used.has(e)).map(e=>({type:e.type,start:e.startTimeIST,end:e.endTimeIST}))});
}
console.log(JSON.stringify({status:"research-only",source:"Tara Prasad VS 2084 page 10, user-reviewed; row 7 corrected transcription; row 19 candidate date correction; row 13 retained as printed",observer:{latitude:29.5,longitude:79.133333,elevation:442,elevationSource:"SRTM30m user supplied",timezone:"Asia/Kolkata"},matchWindowMinutes:360,reports},null,2));
