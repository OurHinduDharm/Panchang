import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../extra-panchang.js", import.meta.url), "utf8");
const start = source.indexOf("function createPlanetCard(data, dailyEvents = {})");
const end = source.indexOf("function createHoraCard(", start);
assert.ok(start >= 0 && end > start, "planet rise/set card function must exist");
const card = source.slice(start, end);

test("planet card retains Guru and Shukra dates and links to annual Agastya", () => {
  assert.match(card, /अस्त प्रारम्भ/);
  assert.match(card, /पुनः उदय/);
  assert.match(card, /गुरु, शुक्र एवं अगस्त्य तारा उदय-अस्त/);
  assert.doesNotMatch(card, /सूर्य|चंद्रमा|मंगल|बुध|शनि/);
});

test("planet card does not add the long source-coordinate disclaimer", () => {
  assert.doesNotMatch(card, /sourceNote|आंतरिक अक्षांश|ऊँचाई प्रकाशित नहीं करता/);
  assert.doesNotMatch(card, /स्रोत: Drik Panchang का/);
  assert.doesNotMatch(card, /Drik मूल स्रोत|planet\.sourceUrl|href=.*sourceUrl/);
});

test("public card does not show additional planetary rows", () => {
  assert.doesNotMatch(card, /name: "मंगल|planet\\.name === "मंगल"/);
  assert.doesNotMatch(card, /name: "सूर्य|name: "चंद्रमा"/);
});


test("Agastya row displays deferred next rise and set and links to annual year without a daily worker",()=>{
  assert.match(card,/अगस्त्य तारा<\/strong><span data-agastya-next="Asta" hidden><\/span><span data-agastya-next="Udaya" hidden><\/span><a href="\$\{annualTaraPageUrl\(\)\}" data-agastya-link>गुरु, शुक्र एवं अगस्त्य की वर्षवार सूची देखें/);
  assert.equal([...card.matchAll(/href="\$\{annualTaraPageUrl\(\)\}"/g)].length,1);
  const start=source.indexOf("function annualTaraPageUrl()");
  const end=source.indexOf("function createPlanetCard",start);
  const make=new Function("getLocation","getSelectedDate",source.slice(start,end)+"\nreturn annualTaraPageUrl;")(()=>({cityProfileKey:"delhi"}),()=>"2031-06-10");
  const url=new URL(make());
  assert.equal(url.searchParams.get("year"),"2031");
  assert.equal(url.searchParams.get("city"),"delhi");
  assert.doesNotMatch(card,/new Worker|annual-tara-runtime|agastya-arghya-pithoragarh/);
});

 test("daily events are deferred, locally calculated and stale renders are rejected",()=>{
  assert.match(source,/runtime\.calculateAnnualAgastyaEvents\(engine,location,y,profiles\)/);
  assert.match(source,/runtime\.nextAgastyaEvents\(current,following,selectedStart\)/);
  assert.match(source,/if \(!stillCurrent\(\)\) return/);
  assert.match(source,/\["Asta","आगामी अस्त"\],\["Udaya","आगामी उदय"\]/);
  assert.match(source,/url\.searchParams\.set\("year",String\(y\)\)/);
 });
