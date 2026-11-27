import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../monthly-vrat-parv-widget.js",import.meta.url),"utf8");
function harness(rows) {
  const start=source.indexOf("  async function buildDynamicNavratriEvents(");
  const end=source.indexOf("  function isLegacyNavratriDailyEvent(",start);
  assert.ok(start>=0&&end>start);
  const family={id:"vasanta",label:"नवरात्र",kind:"वासन्तिक"};
  const compute=new Function("getDatePanchang","requestToken","normalizedMasaName","navratriFamily","shuklaTithiIndex","makeDynamicNavratriEvent","navratriDeities",
    source.slice(start,end)+"\nreturn buildDynamicNavratriEvents;")(
    async iso=>{
      const day=Number(iso.slice(-2));
      const row=rows[day];
      if(row instanceof Error)throw row;
      return {p:{sunrise:iso+"T01:00:00Z",masa:"चैत्र",tithi:20,...row},location:{name:"पिथौरागढ़"}};
    },1,x=>x,x=>x==="चैत्र"?family:null,p=>p.tithi>=0&&p.tithi<=9?p.tithi:null,
    (date,family,index)=>({date,index,title:family.label,hinduTithi:"शुक्ल",description:""}),Array(10).fill("देवी"));
  return compute;
}

test("missing daily calculation does not invent kshaya or authorize replacing reviewed cards",async()=>{
  const compute=harness({1:{tithi:0},2:new Error("temporary failure"),3:{tithi:2}});
  assert.deepEqual(await compute(2031,3,1),{events:[],recognized:false});
});

test("null sunrise and missing month/tithi fail closed",async()=>{
  for(const bad of [{sunrise:null},{masa:null},{tithi:null}]){
    const compute=harness({1:{tithi:0},2:bad,3:{tithi:2}});
    assert.deepEqual(await compute(2031,3,1),{events:[],recognized:false});
  }
});

test("consecutive sunrise observations still recognize a genuine skipped tithi",async()=>{
  const result=await harness({1:{tithi:2},2:{tithi:4}})(2031,3,1);
  assert.equal(result.recognized,true);
  assert.deepEqual(result.events.map(e=>[e.date,e.index]),[["2031-03-01",2],["2031-03-01",3],["2031-03-02",4]]);
});

test("a nonconsecutive observed pair does not invent a skipped tithi",async()=>{
  const result=await harness({1:{tithi:2},3:{tithi:4}})(2031,3,1);
  assert.deepEqual(result.events.map(e=>[e.date,e.index]),[["2031-03-01",2],["2031-03-03",4]]);
});

test("repeated sunrise followed by adjacent skipped tithi still produces expected sequence",async()=>{
  const result=await harness({1:{tithi:2},2:{tithi:2},3:{tithi:4}})(2031,3,1);
  assert.deepEqual(result.events.map(e=>[e.date,e.index]),[["2031-03-01",2],["2031-03-01",3],["2031-03-03",4]]);
});

test("stale fallback and deferred scroll cannot affect a newer month",()=>{
  assert.match(source,/catch\(fallbackError\)\{\s*if\(token!==requestToken\)return;/);
  assert.match(source,/requestAnimationFrame\(function\(\)\{\s*if\(token!==requestToken\|\|!preserveViewportAnchor.isConnected\)return;/);
});
