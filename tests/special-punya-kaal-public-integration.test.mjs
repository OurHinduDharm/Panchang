import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const monthly = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
const component = await readFile(new URL("../monthly-special-punya-kaal.mjs", import.meta.url), "utf8");
const blogger = await readFile(new URL("../monthly-vrat-parv-widget.js", import.meta.url), "utf8");
const daily = await readFile(new URL("../app.js", import.meta.url), "utf8");
const schema = JSON.parse(await readFile(new URL("../data/special-punya-kaal/schema.json", import.meta.url), "utf8"));

test("monthly special punya-kaal section calculates lazily and stays hidden without approved candidates", () => {
  assert.match(monthly, /id="special-punya-kaal"[^>]*hidden/);
  assert.match(component, /import\("\.\/special-punya-kaal-runtime\.mjs"\)/);
  assert.match(component, /import\("https:\/\/esm\.sh\/@ishubhamx\/panchangam-js\@3\.0\.0"\)/);
  assert.match(component, /IntersectionObserver/);
  assert.match(component, /Number\(a\.elevation\)-Number\(b\.elevation\)/);
  assert.match(component, /!sameObserver/);
  assert.match(component, /if\(!approved\.length\)return/);
  assert.match(component, /specialPunyaKaalApprovalPromise=import\("\.\/special-punya-kaal-public-approval\.mjs"\)/);
  assert.match(component, /approval\.publicSpecialPunyaKaalMonth\(data,year,month\)/);
  assert.match(component, /var data=await calculation\.catch/);
  assert.match(component, /var approval=await specialPunyaKaalApprovalPromise/);
  assert.doesNotMatch(monthly, /data\/special-punya-kaal\//);
});

test("monthly section uses the selected year/month from its navigation URL", () => {
  assert.match(monthly, /pageParams\.get\("year"\)/);
  assert.match(monthly, /pageParams\.get\("month"\)/);
  assert.match(component, /window\.location\.hash==="#special-punya-kaal"/);
  assert.match(component, /section\.scrollIntoView\(\{block:"start",behavior:"smooth"\}\)/);
});

test("monthly special section uses the approved practice-focused title", () => {
  assert.match(monthly, /विशेष साधना काल एवं पुण्यकाल/);
  assert.doesNotMatch(monthly, /विशेष पुण्यकाल एवं धार्मिक साधना/);
});

test("Varuni-only public cards do not display Mahapat-specific instructions", () => {
  assert.doesNotMatch(monthly, /इस पातकाल में स्नान, जप, होम एवं दान करने का शास्त्रीय निर्देश मिलता है।/);
  assert.doesNotMatch(monthly, /महापात को विवाह, गृह प्रवेश/);
  assert.doesNotMatch(daily, /महापात को विवाह, गृह प्रवेश/);
});

test("daily Panchang calculates its month lazily and links only for the approved Smarta profile", () => {
  assert.match(daily, /specialPunyaKaalApprovalPromise=import\("\.\/special-punya-kaal-public-approval\.mjs"\)/);
  assert.match(daily, /approval\.publicSpecialPunyaKaalMonth\(resultData,year,month\)/);
  assert.match(daily, /masik-vrat-parv\.html/);
  assert.match(daily, /विशेष पुण्यकाल देखें →/);
  assert.match(daily, /विशेष साधना काल एवं पुण्यकाल/);
  assert.doesNotMatch(daily, /data\/special-punya-kaal\//);
  assert.match(daily, /import\("\.\/special-punya-kaal-runtime\.mjs"\)/);
  assert.match(daily, /IntersectionObserver/);
});

test("daily Panchang shows actual event times only on the event date", () => {
  assert.match(daily, /selectedDayStart=Date\.parse\(dateString\+"T00:00:00\+05:30"\)/);
  assert.match(daily, /Date\.parse\(item\.endTime\)>selectedDayStart&&Date\.parse\(item\.startTime\)<selectedDayEnd/);
  assert.match(daily, /specialPunyaKaalDateTime\(item\.startTime\)/);
  assert.match(daily, /specialPunyaKaalDateTime\(item\.endTime\)/);
});

test("public data schema permits only reviewed special punya-kaal types, never Sankranti", () => {
  assert.equal(schema.properties.status.const, "approved");
  assert.deepEqual(schema.properties.events.items.properties.type.enum, [
    "vyatipata-mahapat", "vaidhriti-mahapat", "varuni", "mahavaruni", "mahamahavaruni", "mahodaya"
  ]);
  assert.equal(schema.properties.events.items.properties.status.const, "approved");
  assert.match(schema.properties.events.items.properties.start.pattern, /Z\|\[\+\-\]/);
});

test("Blogger and GitHub Pages schedule the same monthly component", () => {
  for (const host of [monthly, blogger]) {
    assert.match(host, /import\("\.\/monthly-special-punya-kaal\.mjs"\)/);
    assert.match(host, /scheduleSpecialPunyaKaal\(year,month\);/);
  }
});


test("daily approved geocentric Mahapata is not restricted to the local Varuni observer", () => {
  const section = daily.slice(daily.indexOf("async function appendSpecialPunyaKaalMonthLink("), daily.indexOf("function scheduleSpecialPunyaKaalMonthLink("));
  assert.doesNotMatch(section, /if\(!isPithoragarh\|\|/);
  assert.match(section, /selectedLocation\.timeZone!=="Asia\/Kolkata"/);
  assert.match(section, /isPithoragarh\?specialPunyaKaalMonthCache\.get\(key\):Promise\.resolve\(null\)/);
  assert.match(section, /calculation\.catch\(\(\)=>null\)/);
  assert.match(section, /if\(item\.isMahapata\)\{[\s\S]*?इस काल में मांगलिक कार्य वर्जित/);
});


test("upcoming daily card is current-date only and links to the event month", () => {
  const section=daily.slice(daily.indexOf("function scheduleUpcomingMahapata("),daily.indexOf("function scheduleSpecialPunyaKaalMonthLink("));
  assert.match(section,/dateString===todayString\(\)/);
  assert.match(section,/approval\.nextApprovedMahapata\(now\)/);
  assert.match(section,/event\.phase==="active"\?"अभी महापात पुण्यकाल":event\.phase==="today"\?"आज महापात पुण्यकाल":"आगामी महापात पुण्यकाल"/);
  assert.match(section,/event\.nextTransition,midnight/);
  assert.match(section,/linkDate\.slice\(0,4\)/);
  assert.match(daily,/scheduleUpcomingMahapata\(dateString,request,resultGrid\)/);
});


test("monthly geocentric Mahapata renders before lazy local work and common guidance is outside event cards",()=>{
  assert.match(component,/renderApproved\(approval\.publicSpecialPunyaKaalMonth\(null,year,month\),true\)/);
  assert.match(component,/var initial=loadSpecialPunyaKaal\(year,month,token\)/);
  assert.match(component,/initial\.then\(function\(\)\{if\(currentRequest\(token,year,month\)\)loadLocalSpecialPunyaKaal/);
  const cards=component.slice(component.indexOf("approved.forEach(function(item)"),component.indexOf("var guide=document.createElement"));
  assert.doesNotMatch(cards,/स्नानदानजपश्राद्ध|special-kaal-verse|special-kaal-guidance/);
  assert.equal((component.match(/स्नानदानजपश्राद्धव्रतहोमादिकर्मभिः/g)||[]).length,1);
  assert.match(component,/content\.appendChild\(guide\)/);
  assert.match(blogger,/import\("https:\/\/ourhindudharm\.github\.io\/Panchang\/monthly-special-punya-kaal\.mjs"\)/);
});


test("daily special calendar links are canonical Blogger URLs and no empty month-only card is rendered",()=>{
  assert.match(daily,/return "https:\/\/ourhindudharm\.blogspot\.com\/p\/masik-vrat-parv\.html\?year="/);
  assert.match(daily,/link\.href=specialPunyaKaalMonthUrl\(year,month\)/);
  assert.match(daily,/link\.href=specialPunyaKaalMonthUrl\(linkDate\.slice\(0,4\),linkDate\.slice\(5,7\)\)/);
  assert.match(daily,/const visible=todays\.filter/);
  assert.match(daily,/if\(!visible\.length\)return/);
  assert.match(daily,/link\.hidden=Boolean\(upcoming&&upcoming\.href===link\.href\)/);
});


test("pre-sunrise travel directions use one effective weekday, including safe list",()=>{
  const start=daily.indexOf("function getYatraShoolaDetails(");
  const end=daily.indexOf("const gowriHindi",start);
  assert.ok(start>=0&&end>start);
  const source=daily.slice(start,end);
  const directionHindi={East:"पूर्व",West:"पश्चिम",North:"उत्तर",South:"दक्षिण"};
  const dateInput={value:"2026-11-27"};
  const fn=new Function("dateInput","todayString","getVara","directionHindi","getYatraNakshatra","nakshatraHindi","nakshatraShoolaByDirection","getKalaShoolaDetails","varShoolaRemedy",source+"\nreturn getYatraShoolaDetails;")(
    dateInput,()=>dateInput.value,p=>p.varaName,directionHindi,()=>"आर्द्रा",["आर्द्रा"],{},()=>({}),{4:"दही",5:"जौ"});
  const prior={varaName:"गुरुवार",dishaShoola:{inauspiciousDirection:"South",safeDirections:["East","West","North","South"]}};
  const selected={varaName:"शुक्रवार",sunrise:"2026-11-27T01:13:00Z",dishaShoola:{inauspiciousDirection:"West",safeDirections:["East","North","South"]}};
  const before=fn(selected,null,new Date("2026-11-26T20:00:00Z"),prior);
  assert.equal(before.direction,"South");
  assert.deepEqual(before.safeDirections,["East","West","North"]);
  assert.equal(before.remedy,"दही");
  const after=fn(selected,null,new Date("2026-11-27T02:00:00Z"),prior);
  assert.equal(after.direction,"West");
  assert.deepEqual(after.safeDirections,["East","North","South"]);
  assert.equal(after.remedy,"जौ");
  const unknown=fn({sunrise:selected.sunrise},null,null,null);
  assert.equal(unknown.nakshatraShoolaActive,false);
  assert.deepEqual(unknown.safeDirections,[]);
  assert.match(daily,/yatraShoola\.safeDirections\.map/);
  assert.match(daily,/वर्तमान वार \(सूर्योदय तक\)/);
  assert.match(daily,/पिछले दिन की रात्रि/);
});

test("special calendar skips heavy local imports when no approved local result is possible",()=>{
  assert.match(daily,/if\(isPithoragarh&&!calculation&&publicApproval\.mayHaveApprovedLocalPunyaKaal\(year,month\)\)/);
  assert.match(component,/!publicApproval\.mayHaveApprovedLocalPunyaKaal\(year,month\)\)return;/);
  assert.match(component,/if\(renderKey===lastRenderKey\)return;/);
  assert.match(component,/if\(specialPunyaKaalMonthCache\.get\(cacheKey\)===calculation\)specialPunyaKaalMonthCache\.delete\(cacheKey\)/);
});

test("daily recalculation disconnects stale visibility observers and cancels obsolete timers",()=>{
  const start=daily.indexOf("function cancelSpecialPunyaKaalWork(){");
  const end=daily.indexOf("function scheduleUpcomingMahapata(",start);
  assert.ok(start>=0&&end>start);
  const setup=new Function("assert","let specialPunyaKaalMonthRequest=4;let disconnected=0;let cleared=0;let specialPunyaKaalObserver={disconnect(){disconnected++}};let upcomingMahapataTimer=7;function clearTimeout(id){assert.equal(id,7);cleared++}"+daily.slice(start,end)+"return {cancel:cancelSpecialPunyaKaalWork,state:()=>[specialPunyaKaalMonthRequest,disconnected,cleared,specialPunyaKaalObserver,upcomingMahapataTimer]};");
  const harness=setup(assert);
  harness.cancel();harness.cancel();
  assert.deepEqual(harness.state(),[6,1,1,null,null]);
  assert.match(daily,/function calculatePanchang\(\)\{\s*cancelSpecialPunyaKaalWork\(\);/);
});
