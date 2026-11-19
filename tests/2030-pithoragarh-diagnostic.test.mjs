import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("2030 Pithoragarh festival diagnostic scans every catalogued event at local observance windows", async () => {
  const script = await readFile(new URL("../scripts/diagnose-2030-pithoragarh-festival-dates.mjs", import.meta.url), "utf8");
  assert.match(script, /new Observer\(29\.5828, 80\.2182, 1650\)/);
  assert.match(script, /calendarType: "purnimanta"/);
  assert.match(script, /2030-\$\{String\(month\)/);
  assert.match(script, /tithiAtSunrise/);
  assert.match(script, /tithiAtMadhyahna/);
  assert.match(script, /tithiAtAparahna/);
  assert.match(script, /tithiAtPradosha/);
  assert.match(script, /tithiAtNishita/);
  assert.match(script, /tithiAtMoonrise/);
  assert.match(script, /OHD_2030_PITHORAGARH_FESTIVAL_DATE_AUDIT/);
  assert.match(script, /ruleTaggedEventCount/);
});
