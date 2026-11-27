import test from "node:test";
import assert from "node:assert/strict";
import {extractFestivalCatalogue,restoreFestivalMonths} from "../scripts/festival-content-catalogue.mjs";
const base={title:"पर्व",description:"महत्त्व",category:"व्रत",articleUrl:"https://example.org/article"};
const months=[{year:2029,month:1,status:"approved",events:[{...base,date:"2029-01-01",muhurtaRule:"a",unknownField:{x:1}}]},{year:2030,month:1,events:[{...base,date:"2030-01-05",hinduTithi:"नवमी"},{...base,description:"अलग विवरण",date:"2030-01-05"}]}];
test("deduplicates only identical content and preserves every annual field",()=>{
 const result=extractFestivalCatalogue(months);
 assert.equal(Object.keys(result.cards).length,2);
 assert.deepEqual(restoreFestivalMonths(result),months);
 for(const card of Object.values(result.cards)) assert.equal(Object.hasOwn(card,"date"),false);
});
test("different article links remain distinct",()=>{
 const result=extractFestivalCatalogue([{year:2030,month:2,events:[base,{...base,articleUrl:"https://example.org/other"}]}]);
 assert.equal(Object.keys(result.cards).length,2);
});
test("duplicate months and missing cards fail closed",()=>{
 assert.throws(()=>extractFestivalCatalogue([months[0],months[0]]),/duplicate/);
 const result=extractFestivalCatalogue(months);
 delete result.cards[result.snapshots[0].occurrences[0].cardId];
 assert.throws(()=>restoreFestivalMonths(result),/missing card/);
});
