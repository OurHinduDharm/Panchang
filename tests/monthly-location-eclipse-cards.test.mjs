import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "monthly-vrat-parv-widget.js"), "utf8");

test("monthly Vrat-Parv list suppresses global/static eclipse entries", () => {
  assert.match(source, /return item\.isLocationEclipse===true\|\|!\/ग्रहण\|grahan\|eclipse\/i\.test\(eclipseText\)/);
});

test("monthly eclipse cards are generated only after local visibility is true", () => {
  assert.match(source, /visibility\.localVisible!==true\)return;/);
  assert.match(source, /isLocationEclipse:true/);
});

test("monthly eclipse card links to both detailed Blogger resources", () => {
  assert.match(source, /https:\/\/ourhindudharm\.blogspot\.com\/p\/grahan-panchang\.html\?m=1/);
  assert.match(source, /https:\/\/ourhindudharm\.blogspot\.com\/2022\/10\/About-Grahan-mantra-purashcharan\.html\?m=1/);
});

test("Sutak is shown only when both complete boundaries are available", () => {
  assert.match(source, /if\(sutak&&sutak\.start&&sutak\.end\)/);
  assert.match(source, /formatGrahanDateTime\(sutak\.start,location\.timeZone\).*formatGrahanDateTime\(sutak\.end,location\.timeZone\)/);
});


// Exercise the actual widget scan function without loading CDN modules or DOM.
function makeScanHarness(discoverEclipses) {
  const start=source.indexOf("  async function buildLocationEclipseEvents(");
  const end=source.indexOf("  function getSankrantiRashiIndex(",start);
  assert.ok(start>=0 && end>start);
  const cache=new Map();
  const location={lat:29.5828,lon:80.2182,elevation:1650,timeZone:"Asia/Kolkata"};
  const tools={discoverEclipses,getLocalVisibility(){},getEclipseDayPanchangs(){}};
  const scan=new Function("getLocalLocation","locationEclipseCache","eclipseToolsPromise","getDayPanchang","console",
    source.slice(start,end)+"\nreturn buildLocationEclipseEvents;")(
    ()=>location,cache,Promise.resolve(tools),async()=>({location,panchangLib:{}}),{warn(){}});
  return {scan,cache};
}

test("temporary eclipse scan failure is retried and only successful empty results are cached", async()=>{
  let calls=0;
  const {scan,cache}=makeScanHarness(async()=>{
    if(++calls===1)throw new Error("temporary failure");
    return [];
  });
  const failure=await scan(2026,11,1);
  assert.equal(failure.failed,true);
  assert.deepEqual(failure.events,[]);
  assert.equal(cache.size,0);
  const success=await scan(2026,11,2);
  assert.equal(success.failed,false);
  assert.deepEqual(success.events,[]);
  assert.equal(cache.size,1);
  assert.equal((await scan(2026,11,3)).failed,false);
  assert.equal(calls,2);
});

test("a failed older request cannot evict a replacement cache entry",async()=>{
  let rejectOld;
  let calls=0;
  const {scan,cache}=makeScanHarness(()=>{
    if(++calls===1)return new Promise((_,reject)=>{rejectOld=reject;});
    return [];
  });
  const old=scan(2026,11,1);
  while(!rejectOld)await Promise.resolve();
  cache.clear();
  const replacement=await scan(2026,11,2);
  rejectOld(new Error("old request failed"));
  assert.equal((await old).failed,true);
  assert.equal(replacement.failed,false);
  assert.equal(cache.size,1);
  assert.equal((await scan(2026,11,3)).failed,false);
  assert.equal(calls,2);
});

test("only current month request updates eclipse failure status",()=>{
  assert.match(source,/var token=\+\+requestToken;\s*locationEclipseCalculationFailed=false;/);
  assert.match(source,/if\(token!==requestToken\)return;\s*var dynamicNavratri=parallelResults\[0\];\s*var eclipseResult=parallelResults\[1\];\s*locationEclipseCalculationFailed=eclipseResult\.failed;/);
});
