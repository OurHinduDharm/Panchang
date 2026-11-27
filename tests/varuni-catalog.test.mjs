import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isApprovedSpecialPunyaKaalCandidate,SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL} from "../special-punya-kaal-public-approval.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
test("approved Varuni conjunction dates are ordinary monthly cards without runtime muhurta rules",()=>{
  const candidates=read("data/reviews/special-punya-kaal-2026-2030-candidates.json").candidates;
  const found=[];
  for(let year=2026;year<=2030;year++)for(let month=1;month<=12;month++){
    const data=read("data/festivals/"+year+"-"+String(month).padStart(2,"0")+".json");
    for(const event of data.events.filter(e=>e.specialPunyaKaalProfile)){
      const row=candidates.find(c=>c.date===event.date&&c.labels[0]===event.title);
      assert.ok(row&&isApprovedSpecialPunyaKaalCandidate(row));
      assert.equal(event.reviewStatus,"approved");
      assert.equal(event.conjunctionStart,row.startTime);
      assert.equal(event.conjunctionEnd,row.endTime);
      assert.match(event.description,/पिथौरागढ़, IST/);
      assert.ok(!event.muhurtaRule&&!event.muhurtaRules&&!event.muhurtaStart);
      found.push(event.date);
    }
  }
  assert.deepEqual(found,SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL.dates);
});
