import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {mahapataPublicRecords} from "../data/special-punya-kaal/mahapata-2026-2030.mjs";
import {nextApprovedMahapata,publicSpecialPunyaKaalMonth} from "../special-punya-kaal-public-approval.mjs";

const result=JSON.parse(execFileSync(process.execPath,["scripts/compare-mahapat-ephemeris.mjs","--years=2026,2027,2028,2029,2030","--contact-model=apparent-disks","--audit","--audit-step-minutes=15"],{encoding:"utf8",maxBuffer:16*1024*1024}));
assert.equal(result.contactModel.id,"apparent-disks");
assert.equal(result.discoveryAudit.unrepresentedRoots.length,0);
assert.equal(result.discoveryAudit.duplicateIntervals.length,0);
assert.equal(result.discoveryAudit.rootCount,135);
assert.equal(result.events.length,135);
assert.equal(mahapataPublicRecords.length,135);
let maxSeconds=0;
for(let i=0;i<mahapataPublicRecords.length;i++){
 const r=mahapataPublicRecords[i],e=result.events[i];
 assert.equal(r.type,e.type==="व्यतीपात महापात"?"vyatipata-mahapat":"vaidhriti-mahapat");
 assert.ok(Date.parse(r.start)<Date.parse(r.middle)&&Date.parse(r.middle)<Date.parse(r.end));
 for(const [key,other] of [["start","startTime"],["middle","truePata"],["end","endTime"]]){
  const diff=Math.abs(Date.parse(r[key])-Date.parse(e[other]))/1000;
  assert.ok(diff<=60,`row ${i+1} ${key}: ${diff} seconds`);
  maxSeconds=Math.max(maxSeconds,diff);
 }
 assert.ok(!e.otherTrueCrossings.length,"multiple middles require a new publication schema");
}
const counts={};
for(const r of mahapataPublicRecords){
 const year=new Date(Date.parse(r.start)+330*60000).getUTCFullYear();
 counts[year]=(counts[year]||0)+1;
}
assert.deepEqual(counts,{2026:27,2027:29,2028:28,2029:27,2030:24});
const next=nextApprovedMahapata(Date.parse("2026-11-27T00:00:00+05:30"));
assert.equal(next.date,"2026-11-28");
assert.equal(next.labels[0],"वैधृति महापात");
assert.ok(publicSpecialPunyaKaalMonth(null,2026,11).some(r=>r.startTime===next.startTime));
assert.equal(nextApprovedMahapata(Date.parse("2031-01-01T00:00:00+05:30")),null);
console.log(JSON.stringify({count:result.events.length,counts,maxCrossEngineSeconds:maxSeconds,upcoming:next},null,2));
