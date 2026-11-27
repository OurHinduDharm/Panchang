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
      assert.match(event.description,/संयोग/);
      assert.doesNotMatch(event.description,/\d{1,2}:\d{2}/);
      assert.ok(!event.muhurtaRule&&!event.muhurtaRules&&!event.muhurtaStart);
      found.push(event.date);
    }
  }
  assert.deepEqual(found,SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL.dates);
});

import {parseVaruniReviewYears,buildVaruniReviewCards} from "../scripts/varuni-annual-review-cards.mjs";
test("future years are independently selectable and all three yoga variants remain review-only",()=>{
  assert.deepEqual(parseVaruniReviewYears(["--year","2031"]),[2031]);
  assert.deepEqual(parseVaruniReviewYears(["--year","2050"]),[2050]);
  assert.throws(()=>parseVaruniReviewYears(["--year","2201"]));
  const row={date:"2031-03-22",ruleProfile:"chaitra-krishna-trayodashi-shatabhisha",startTime:"2031-03-22T01:00:00Z",endTime:"2031-03-22T02:00:00Z"};
  const rows=["वारुणी योग","महावारुणी योग","महामहावारुणी योग"].map(label=>({...row,labels:[label]}));
  const cards=buildVaruniReviewCards([...rows,rows[0]],[2031]);
  assert.equal(cards["2031-03"].length,3);
  assert.ok(cards["2031-03"].every(card=>card.reviewStatus==="needs-review"&&!card.muhurtaRule));
  assert.deepEqual(cards["2031-04"],[]);
  assert.deepEqual(buildVaruniReviewCards(rows,[2031],[{year:2031}])["2031-03"],[]);
});

test("both hosts show Hindi time and both dates across midnight",()=>{
  for(const path of ["monthly-vrat-parv-widget.js","monthly-vrat-parv.html"]){
    const source=readFileSync(new URL("../"+path,import.meta.url),"utf8");
    const start=source.indexOf("  function isVaruniFestival(item){"),end=source.indexOf("  function appendVaruniConjunction(item,content){",start);
    assert.ok(start>=0&&end>start);
    const months=["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
    const format=new Function("months",source.slice(start,end)+"\nreturn varuniConjunctionText;")(months);
    const event=read("data/festivals/2028-03.json").events.find(e=>e.specialPunyaKaalProfile);
    assert.deepEqual(format(event),{start:"23 मार्च, प्रातः 11:22 बजे",end:"24 मार्च, प्रातः 5:33 बजे"});
    assert.equal(format({...event,conjunctionEnd:"invalid"}),null);
    assert.equal(format({...event,title:"असंबंधित पर्व"}),null);
    assert.match(source,/if\(!isVaruniFestival\(item\)\)appendTithiVyapti/);
    assert.match(source,/if\(isVaruniFestival\(item\)\)appendVaruniConjunction/);
  }
});
