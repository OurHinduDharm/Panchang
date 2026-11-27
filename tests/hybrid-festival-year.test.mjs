import test from "node:test";
import assert from "node:assert/strict";
import {assembleHybridFestivalYear,getHybridFestivalMonth} from "../scripts/assemble-hybrid-festival-year.mjs";
const year=2031;
const plan={year,status:"approved",records:[{occurrenceId:"a",mode:"automatic"},{occurrenceId:"b",mode:"exception"}]};
const automatic={year,records:[{occurrenceId:"a",reviewStatus:"approved",publishable:true,ruleId:"rule",ruleVersion:"1",reviewEvidence:"checked",event:{date:"2031-02-03",title:"मासिक व्रत",description:"पुराना विवरण",articleUrl:"https://example.com/article",muhurtaRule:"existing-rule",diagnostics:"internal"}}]};
const exceptions={year,records:[{occurrenceId:"b",reviewStatus:"approved",publishable:true,reviewEvidence:"checked",decisionSource:"verified source",exceptionReason:"complex rule",event:{date:"2031-02-03",title:"विशेष पर्व"}}]};
const build=(overrides={})=>assembleHybridFestivalYear({year,plan,automatic,exceptions,...overrides});
test("one annual snapshot merges independently approved inputs without leaking review notes",()=>{
 const {annual,report}=build();
 assert.equal(report.status,"approved");
 assert.equal(annual.eventCount,2);
 assert.equal(annual.events[0].date,"2031-02-03");
 assert.ok(annual.events.every(e=>e.dateLabel==="3 फरवरी"&&e.reviewStatus==="approved"));
 const a=annual.events.find(e=>e.title==="मासिक व्रत");
 assert.equal(a.description,"पुराना विवरण");
 assert.equal(a.articleUrl,"https://example.com/article");
 assert.equal(a.muhurtaRule,"existing-rule");
 assert.ok(!("diagnostics" in a)&&!("reviewEvidence" in a));
});
test("missing or unapproved exceptions block the entire public snapshot",()=>{
 assert.equal(build({exceptions:{year,records:[]}}).annual,null);
 assert.equal(build({plan:{...plan,status:"needs-review"}}).annual,null);
 assert.equal(build({automatic:{year,records:[{...automatic.records[0],reviewStatus:"needs-review"}]}}).annual,null);
});
test("reject conflicting ownership, duplicate IDs, unexpected rows and dates from another year",()=>{
 assert.equal(build({exceptions:{year,records:[...exceptions.records,automatic.records[0]]}}).annual,null);
 assert.throws(()=>build({automatic:{year,records:[automatic.records[0],automatic.records[0]]}}));
 assert.equal(build({exceptions:{year,records:[...exceptions.records,{...exceptions.records[0],occurrenceId:"c"}]}}).annual,null);
 assert.equal(build({automatic:{year,records:[{...automatic.records[0],event:{...automatic.records[0].event,date:"2030-02-03"}}]}}).annual,null);
 assert.equal(build({automatic:{year,records:[{...automatic.records[0],event:{...automatic.records[0].event,date:"2031-02-30"}}]}}).annual,null);
 assert.throws(()=>build({exceptions:{...exceptions,year:2032}}));
});

test("monthly view uses the same approved in-memory annual result without another stored file",()=>{
 const result=build();
 const month=getHybridFestivalMonth(result,2031,2);
 assert.equal(month.monthName,"फरवरी");
 assert.equal(month.events.length,2);
 month.events[0].title="modified";
 assert.notEqual(result.annual.events[0].title,"modified");
 assert.deepEqual(getHybridFestivalMonth(result,2031,3).events,[]);
 assert.equal(getHybridFestivalMonth(build({exceptions:{year,records:[]}}),2031,2),null);
 assert.equal(getHybridFestivalMonth(result,2032,2),null);
 assert.equal(getHybridFestivalMonth({...result,annual:{...result.annual,eventCount:99}},2031,2),null);
 assert.throws(()=>getHybridFestivalMonth(result,2031,13));
});
