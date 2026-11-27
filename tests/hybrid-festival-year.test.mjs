import test from "node:test";
import assert from "node:assert/strict";
import {assembleHybridFestivalYear,getHybridFestivalMonth,expandCompactFestivalExceptions,expandCompactAutomaticFestivalRecords} from "../scripts/assemble-hybrid-festival-year.mjs";
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

test("multi-day event end dates survive annual assembly and invalid ranges are rejected",()=>{
 const record=exceptions.records[0];
 const withEnd=endDate=>({year,records:[{...record,event:{...record.event,endDate}}]});
 const result=build({exceptions:withEnd("2031-02-06")});
 assert.equal(result.annual.events.find(e=>e.title==="विशेष पर्व").endDate,"2031-02-06");
 assert.equal(getHybridFestivalMonth(result,2031,2).events.find(e=>e.title==="विशेष पर्व").endDate,"2031-02-06");
 for(const invalid of ["2031-02-01","2031-02-30","2033-01-01"])assert.equal(build({exceptions:withEnd(invalid)}).annual,null);
});

test("compact exceptions use exact shared content keys and contain no repeated descriptions",()=>{
 const catalogue={templates:[{key:"special",title:"विशेष पर्व",category:"पर्व",description:"साझा धार्मिक विवरण",articleUrl:"https://example.com/article",muhurtaRule:"shared-rule"}]};
 const compact={schemaVersion:1,year,records:[{occurrenceId:"b",contentKey:"special",date:"2031-02-03",endDate:"2031-02-04",hinduTithi:"माघ शुक्ल नवमी",reviewStatus:"approved",publishable:true,reviewEvidence:"checked",decisionSource:"verified",exceptionReason:"complex"}]};
 const expanded=expandCompactFestivalExceptions({year,exceptions:compact,catalogue});
 const result=build({exceptions:expanded});
 const event=result.annual.events.find(e=>e.title==="विशेष पर्व");
 assert.equal(event.description,"साझा धार्मिक विवरण");
 assert.equal(event.articleUrl,"https://example.com/article");
 assert.equal(event.muhurtaRule,"shared-rule");
 assert.equal(event.hinduTithi,"माघ शुक्ल नवमी");
 assert.equal(event.endDate,"2031-02-04");
 assert.ok(!Object.hasOwn(compact.records[0],"description"));
 const withRow=change=>({...compact,records:[{...compact.records[0],...change}]});
 assert.throws(()=>expandCompactFestivalExceptions({year,exceptions:withRow({contentKey:"unknown"}),catalogue}));
 assert.throws(()=>expandCompactFestivalExceptions({year,exceptions:withRow({description:"override"}),catalogue}));
 assert.throws(()=>expandCompactFestivalExceptions({year,exceptions:withRow({date:"2031-02-30"}),catalogue}));
 assert.throws(()=>expandCompactFestivalExceptions({year,exceptions:compact,catalogue:{templates:[catalogue.templates[0],catalogue.templates[0]]}}));
 const pending=expandCompactFestivalExceptions({year,exceptions:withRow({reviewStatus:"needs-review",publishable:false}),catalogue});
 assert.equal(build({exceptions:pending}).annual,null);
});

test("both automatic and exception cards inherit edited text without changing approved dates or rules",()=>{
 const catalogue={templates:[
   {key:"stable-a",title:"मासिक व्रत",description:"पुराना विवरण",muhurtaRule:"shared-rule"},
   {key:"stable-b",title:"विशेष पर्व",description:"पुराना विशेष विवरण"}
 ]};
 const auto={schemaVersion:1,year,records:[{occurrenceId:"a",contentKey:"stable-a",date:"2031-02-03",reviewStatus:"approved",publishable:true,reviewEvidence:"checked",ruleId:"rule",ruleVersion:"1"}]};
 const manual={schemaVersion:1,year,records:[{occurrenceId:"b",contentKey:"stable-b",date:"2031-02-03",reviewStatus:"approved",publishable:true,reviewEvidence:"checked",decisionSource:"verified",exceptionReason:"complex"}]};
 const render=()=>build({automatic:expandCompactAutomaticFestivalRecords({year,automatic:auto,catalogue}),exceptions:expandCompactFestivalExceptions({year,exceptions:manual,catalogue})});
 const before=render();
 catalogue.templates[0].title="संशोधित मासिक व्रत";
 catalogue.templates[0].description="नया विवरण";
 catalogue.templates[0].articleUrl="https://example.com/new-article";
 catalogue.templates[1].description="नया विशेष विवरण";
 const after=render();
 assert.equal(after.report.status,"approved");
 const edited=after.annual.events.find(e=>e.title==="संशोधित मासिक व्रत");
 assert.equal(edited.description,"नया विवरण");
 assert.equal(edited.articleUrl,"https://example.com/new-article");
 assert.equal(edited.date,"2031-02-03");
 assert.equal(edited.muhurtaRule,"shared-rule");
 assert.equal(after.annual.events.find(e=>e.title==="विशेष पर्व").description,"नया विशेष विवरण");
 assert.deepEqual(after.annual.events.map(e=>e.date),before.annual.events.map(e=>e.date));
 assert.equal(auto.records[0].ruleId,"rule");
 assert.equal(before.annual.events.find(e=>e.title==="मासिक व्रत").description,"पुराना विवरण");
 const unapproved={...auto,records:[{...auto.records[0],autoApproved:true}]};
 assert.equal(build({automatic:expandCompactAutomaticFestivalRecords({year,automatic:unapproved,catalogue}),exceptions:expandCompactFestivalExceptions({year,exceptions:manual,catalogue})}).annual,null);
 assert.throws(()=>expandCompactAutomaticFestivalRecords({year,automatic:{...auto,records:[{...auto.records[0],title:"duplicate copy"}]},catalogue}));
});
