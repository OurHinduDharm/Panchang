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
  assert.match(monthly, /data\.calculationStatus!=="complete"\|\|!sameObserver/);
  assert.match(monthly, /if\(!approved\.length\)return/);
  assert.match(monthly, /specialPunyaKaalApprovalPromise=import\("\.\/special-punya-kaal-public-approval\.mjs"\)/);
  assert.match(monthly, /engine\.approval\.isApprovedSpecialPunyaKaalCandidate/);
  assert.doesNotMatch(monthly, /data\/special-punya-kaal\//);
});

test("monthly section uses the selected year/month from its navigation URL", () => {
  assert.match(monthly, /pageParams\.get\("year"\)/);
  assert.match(monthly, /pageParams\.get\("month"\)/);
  assert.match(monthly, /window\.location\.hash==="#special-punya-kaal"/);
  assert.match(monthly, /section\.scrollIntoView\(\{block:"start",behavior:"smooth"\}\)/);
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
  assert.match(daily, /resultData\.calculationStatus!=="complete"/);
  assert.match(daily, /specialPunyaKaalApprovalPromise=import\("\.\/special-punya-kaal-public-approval\.mjs"\)/);
  assert.match(daily, /approval\.isApprovedSpecialPunyaKaalCandidate/);
  assert.match(daily, /approval\.isApprovedSpecialPunyaKaalCandidate/);
  assert.match(daily, /monthly-vrat-parv\.html\?year=/);
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
