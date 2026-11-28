import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {approvedCalendarEvents} from "../festival-calendar-export.mjs";

const widget=readFileSync(new URL("../monthly-vrat-parv-widget.js",import.meta.url),"utf8");
const standalone=readFileSync(new URL("../monthly-vrat-parv.html",import.meta.url),"utf8");
const approved={date:"2026-11-01",title:"स्वीकृत पर्व",reviewStatus:"approved"};
const emptyNavratri=()=>Promise.resolve({events:[],recognized:false});
const emptyEclipse=()=>Promise.resolve({events:[],failed:false});
const result=data=>({ok:true,json:async()=>data});

function harness(source,overrides={}){
  const start=source.indexOf("  async function loadMonth(");
  const end=source.indexOf("  function ensureYearOption(",start);
  assert.ok(start>=0&&end>start);
  const draws=[],requests=[],focuses=[],exports=[];
  const yearSelect={value:"2026"},monthSelect={value:"11"},countEl={textContent:""};
  const config={
    fetch:async()=>result({events:[approved]}),
    buildDynamicNavratriEvents:emptyNavratri,
    buildLocationEclipseEvents:emptyEclipse,
    buildSaraswatiNakshatraEvents:async()=>[],
    fetchDwadashiYear:async()=>null,
    mergeAnnualDwadashiEvents:data=>data,
    ...overrides
  };
  const load=new Function("config","yearSelect","monthSelect","countEl","draws","requests","focuses","exports","approvedCalendarEvents",
    `let requestToken=0,activeMonthRequest=null,locationEclipseCalculationFailed=false,renderedCards;
    const searchInput={},listTitle={},months=Array(12).fill("माह"),eventsEl={replaceChildren(){},appendChild(){}};
    const reviewMode=false;
    function updateCalendarExport(data,year,month){exports.push({year,month,events:approvedCalendarEvents(data,year,month)})}
    const document={createElement(){return {}}},console={warn(){}};
    const setTimeout=()=>1,clearTimeout=()=>{};
    const fetch=(url,opts)=>{requests.push({url,signal:opts?.signal});return config.fetch(url,opts)};
    const {buildDynamicNavratriEvents,buildLocationEclipseEvents,buildSaraswatiNakshatraEvents,fetchDwadashiYear,mergeAnnualDwadashiEvents}=config;
    function scheduleSpecialPunyaKaal(){} function syncMonthNavigationButtons(){} function isLegacyNavratriDailyEvent(){return false}
    function focusFestivalCard(){focuses.push(true)}
    function render(data,year,month){draws.push({year,month,events:data.events.slice()});countEl.textContent=data.events.length+" प्रविष्टियाँ"}
    `+source.slice(start,end)+"\nreturn loadMonth;"
  )(config,yearSelect,monthSelect,countEl,draws,requests,focuses,exports,approvedCalendarEvents);
  return {load,draws,requests,focuses,exports,monthSelect,countEl};
}

test("optional Navratri failure preserves reviewed month and other successful enrichments",async()=>{
  const eclipse={date:"2026-11-09",title:"ग्रहण",isLocationEclipse:true};
  const h=harness(widget,{
    buildDynamicNavratriEvents:async()=>{throw Error("temporary calculation failure")},
    buildLocationEclipseEvents:async()=>({events:[eclipse],failed:false})
  });
  await h.load();
  assert.deepEqual(h.draws.at(-1).events,[approved,eclipse]);
});

test("optional Saraswati failure does not erase an already displayed catalog",async()=>{
  const h=harness(widget,{buildSaraswatiNakshatraEvents:async()=>{throw Error("temporary failure")}});
  await h.load();
  assert.deepEqual(h.draws.at(-1).events,[approved]);
});

test("unexpected late enrichment failure never replaces reviewed list with empty fallback",async()=>{
  let fallbackCalls=0;
  const h=harness(widget,{
    buildDynamicNavratriEvents:()=>{fallbackCalls++;return emptyNavratri()},
    mergeAnnualDwadashiEvents:()=>{throw Error("temporary error")}
  });
  await h.load();
  assert.deepEqual(h.draws.map(d=>d.events),[[approved]]);
  assert.equal(fallbackCalls,1);
  assert.equal(h.focuses.length,1);
});

test("malformed monthly catalog uses the existing fallback without crashing",async()=>{
  const dynamic={date:"2026-11-02",title:"गतिशील पर्व"};
  const h=harness(widget,{fetch:async()=>result(null),buildDynamicNavratriEvents:async()=>({events:[dynamic],recognized:true})});
  await h.load();
  assert.deepEqual(h.draws.at(-1).events,[dynamic]);
});

for(const [name,source] of [["Blogger",widget],["standalone",standalone]]){
  test(name+" cancels a superseded month request and renders only the latest month",async()=>{
    let calls=0;
    const h=harness(source,{fetch:(_url,opts)=>{
      if(++calls===1)return new Promise((_resolve,reject)=>opts.signal.addEventListener("abort",()=>reject(new DOMException("Aborted","AbortError")),{once:true}));
      return Promise.resolve(result({events:[approved]}));
    }});
    const first=h.load();
    h.monthSelect.value="12";
    const second=h.load();
    await Promise.all([first,second]);
    assert.equal(h.requests[0].signal.aborted,true);
    assert.equal(h.requests[1].signal.aborted,false);
    assert.ok(h.draws.length>0);
    assert.ok(h.draws.every(d=>d.month===12));
    assert.equal(h.exports.filter(e=>e.month!==undefined).length,1);
    assert.equal(h.exports.at(-1).month,12);
    assert.deepEqual(h.exports[0].events,[]);
  });
}

test("late default elevation cannot trigger a reload for a selected city",()=>{
  assert.match(standalone,/if\(elevationChanged&&!selectedLocationInSession\)\{/);
});

test("festival devotional guidance is identical in Blogger and standalone and restricted to its own event types",()=>{
  for(const source of [widget,standalone]){
    const start=source.indexOf("  function festivalPunyaGuidance(item){");
    const end=source.indexOf("  function render(data,year,month,token){",start);
    assert.ok(start>=0&&end>start);
    const guidance=new Function(source.slice(start,end)+"\nreturn festivalPunyaGuidance;")();
    assert.match(guidance({category:"मन्वादि तिथि"}),/श्राद्ध/);
    assert.match(guidance({category:"युगादि तिथि"}),/अक्षय/);
    // Real catalogue variants, not just synthetic canonical categories.
    const jan2026=JSON.parse(readFileSync(new URL("../data/festivals/2026-01.json",import.meta.url),"utf8"));
    const jan2027=JSON.parse(readFileSync(new URL("../data/festivals/2027-01.json",import.meta.url),"utf8"));
    const makar=jan2026.events.find(item=>item.title==="मकर संक्रांति / सूर्य उत्तरायण प्रारम्भ");
    const dharma=jan2027.events.find(item=>item.title==="धर्म सावर्णि मन्वादि");
    assert.ok(makar&&dharma);
    assert.match(guidance(makar),/पुण्यकाल/);
    assert.match(guidance(dharma),/श्राद्ध/);
    assert.match(guidance({category:"युग-मन्वादि",title:"रैवत मन्वादि"}),/श्राद्ध/);
    assert.match(guidance({category:"व्रत-पर्व",title:"कुम्भ संक्रान्ति"}),/स्तोत्रात्मक उपासना/);
    assert.equal(guidance({category:"व्रत",title:"मकर संक्रांति से पहले का व्रत"}),"");

    for(const category of ["संक्रांति","संक्रान्ति"]){
      const note=guidance({category});
      assert.match(note,/पुण्यकाल/);
      assert.match(note,/स्तोत्रात्मक उपासना/);
    }
    assert.equal(guidance({category:"व्रत",title:"संक्रांति से पहले का व्रत"}),"");
    assert.equal(guidance({category:"त्योहार",title:"गुड़ी पड़वा / युगादि"}),"");
    assert.equal(guidance({category:"ग्रहण"}),"");
    assert.match(source,/punyaNote\.textContent=punyaGuidance/);
  }
});
