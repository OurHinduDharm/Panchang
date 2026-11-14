import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const monthly = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
const daily = await readFile(new URL("../app.js", import.meta.url), "utf8");

test("monthly special punya-kaal section stays hidden unless approved monthly data exists", () => {
  assert.match(monthly, /id="special-punya-kaal"[^>]*hidden/);
  assert.match(monthly, /data\/special-punya-kaal\//);
  assert.match(monthly, /data\.status!=="approved"/);
  assert.match(monthly, /item\.status!=="approved"/);
  assert.match(monthly, /sameObserver\(data\.observer,location\)/);
  assert.match(monthly, /if\(!approved\.length\)return/);
});

test("monthly section uses the selected year/month from its navigation URL", () => {
  assert.match(monthly, /pageParams\.get\("year"\)/);
  assert.match(monthly, /pageParams\.get\("month"\)/);
  assert.match(monthly, /window\.location\.hash==="#special-punya-kaal"/);
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
});

test("daily Panchang shows actual event times only on the event date", () => {
  assert.match(daily, /const todays=events\.filter\(item=>item\.date===dateString\)/);
  assert.match(daily, /specialPunyaKaalTime\(item\.start\)/);
  assert.match(daily, /specialPunyaKaalTime\(item\.end\)/);
});
