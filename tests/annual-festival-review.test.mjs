import test from "node:test";
import assert from "node:assert/strict";
import {buildAnnualFestivalReview,validateAnnualInput} from "../scripts/generate-annual-festival-review.mjs";
const year=2031;
const dailyPanchang=Array.from({length:365},(_,i)=>{
  const date=new Date(Date.UTC(year,0,i+1)).toISOString().slice(0,10);
  const selected=date==="2031-09-10";
  return {date,masa:selected?"भाद्रपद":"पौष",sunrise:date+"T00:00:00Z",sunset:date+"T12:00:00Z",tithiIntervals:[{index:selected?3:0,startTime:date+"T04:00:00Z",endTime:date+"T08:00:00Z"}]};
});
const annual={year,dailyPanchang};
const sourceMonths=Array.from({length:12},(_,i)=>({year:2030,month:i+1,events:i===8?[{date:"2030-09-01",title:"विनायक चतुर्थी",description:"पूजन करें।",articleUrl:"https://example.com/article",reviewStatus:"approved",muhurtaRule:"old-rule"},{date:"2030-09-02",title:"अमैप्ड पर्व"}]:[]}));
const manifest={year:2030,mappings:[{recordKey:"2030-09-01::विनायक चतुर्थी",observanceId:"x",ruleId:"vinayaka-chaturthi-madhyahna",lunarMonth:"भाद्रपद",paksha:"शुक्ल पक्ष",targetTithiIndex:3,classification:"manual-review"}]};
test("review batch resolves target year independently and preserves source copy without public approval",()=>{
 const output=buildAnnualFestivalReview({annual,manifest,sourceMonths,year});
 assert.equal(output.counts.selected,1);
 assert.equal(output.counts.unmapped,1);
 assert.equal(output.monthlyReview["2031-09"][0].selectedDate,"2031-09-10");
 assert.equal(output.monthlyReview["2031-09"][0].sourceContent.description,"पूजन करें।");
 assert.equal(output.monthlyReview["2031-09"][0].sourceContent.articleUrl,"https://example.com/article");
 assert.equal(output.monthlyReview["2031-09"][0].publishable,false);
 assert.equal(output.publishable,false);
 assert.equal(sourceMonths[8].events[0].date,"2030-09-01");
 assert.equal(Object.keys(output.monthlyReview).length,12);
});
test("missing daily data, duplicate mappings and missing source months fail closed",()=>{
 assert.throws(()=>validateAnnualInput({...annual,dailyPanchang:dailyPanchang.slice(1)},year));
 assert.throws(()=>buildAnnualFestivalReview({annual,manifest:{...manifest,mappings:[...manifest.mappings,...manifest.mappings]},sourceMonths,year}));
 assert.throws(()=>buildAnnualFestivalReview({annual,manifest,sourceMonths:sourceMonths.slice(1),year}));
});
