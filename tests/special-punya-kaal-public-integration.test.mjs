import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const monthly = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
const daily = await readFile(new URL("../app.js", import.meta.url), "utf8");
const schema = JSON.parse(await readFile(new URL("../data/special-punya-kaal/schema.json", import.meta.url), "utf8"));

test("monthly special punya-kaal section calculates lazily and stays hidden without approved candidates", () => {
  assert.match(monthly, /id="special-punya-kaal"[^>]*hidden/);
  assert.match(monthly, /import\("\.\/special-punya-kaal-runtime\.mjs"\)/);
  assert.match(monthly, /import\("https:\/\/esm\.sh\/@ishubhamx\/panchangam-js\@3\.0\.0"\)/);
  assert.match(monthly, /IntersectionObserver/);
  assert.match(monthly, /data\.calculationStatus!=="complete"\)return/);
  assert.match(monthly, /if\(!approved\.length\)return/);
  assert.match(monthly, /approvedSpecialPunyaKaalProfiles/);
  assert.doesNotMatch(monthly, /data\/special-punya-kaal\//);
});

test("monthly section uses the selected year/month from its navigation URL", () => {
  assert.match(monthly, /pageParams\.get\("year"\)/);
  assert.match(monthly, /pageParams\.get\("month"\)/);
  assert.match(monthly, /window\.location\.hash==="#special-punya-kaal"/);
});

test("monthly special section uses the approved practice-focused title", () => {
  assert.match(monthly, /विशेष साधना काल एवं पुण्यकाल/);
  assert.doesNotMatch(monthly, /विशेष पुण्यकाल एवं धार्मिक साधना/);
});

test("only Mahapat cards show the classical bath, japa, homa and donation guidance", () => {
  assert.match(monthly, /इस पातकाल में स्नान, जप, होम एवं दान करने का शास्त्रीय निर्देश मिलता है।/);
  assert.match(monthly, /className="special-kaal-description"/);
});

test("only Mahapat records receive the samskara caution", () => {
  assert.match(monthly, /item\.type==="vyatipata-mahapat"\|\|item\.type==="vaidhriti-mahapat"/);
  assert.match(daily, /item\.type==="vyatipata-mahapat"\|\|item\.type==="vaidhriti-mahapat"/);
});

test("daily Panchang shows a month link only after an approved event matches its observer", () => {
  assert.match(daily, /data\.status!=="approved"/);
  assert.match(daily, /sameSpecialPunyaKaalObserver\(data\.observer,selectedLocation\)/);
  assert.match(daily, /filter\(validApprovedSpecialPunyaKaal\)/);
  assert.match(daily, /monthly-vrat-parv\.html\?year=/);
  assert.match(daily, /विशेष पुण्यकाल देखें →/);
  assert.match(daily, /विशेष साधना काल एवं पुण्यकाल/);
  assert.doesNotMatch(daily, /विशेष पुण्यकाल एवं धार्मिक साधना/);
  assert.match(daily, /import\("\.\/special-punya-kaal-runtime\.mjs"\)/);
  assert.match(daily, /IntersectionObserver/);
  assert.match(daily, /approvedSpecialPunyaKaalProfiles/);
  assert.doesNotMatch(daily, /data\/special-punya-kaal\//);
});

test("daily Panchang shows actual event times only on the event date", () => {
  assert.match(daily, /const todays=events\.filter\(item=>item\.date===dateString\)/);
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
