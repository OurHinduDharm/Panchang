import test from "node:test";
import assert from "node:assert/strict";
import {
  chapter3RisingAsusAtSiderealLongitude,
  chapter9LagnantaraAsus,
  runChapter3LagnantaraTests
} from "../ss_chapter3_lagnantara.js";
import {
  calculateChapter7SequentialDrikkarma,
  runChapter7DrikkarmaTests
} from "../ss_chapter7_drikkarma.js";

test("reused PR #22 Chapter III rising-asus and Chapter VII dṛkkarma candidates retain their source-derived regression suite", () => {
  const ch3 = runChapter3LagnantaraTests();
  const ch7 = runChapter7DrikkarmaTests();
  assert.equal(ch3.allPassed, true, "all Chapter III source interpolation tests must pass");
  assert.equal(ch7.allPassed, true, "all Chapter VII sequential dṛkkarma tests must pass");
  assert.ok(ch3.total >= 5);
  assert.ok(ch7.total >= 10);

  const rising = chapter3RisingAsusAtSiderealLongitude({
    siderealLongitudeDeg: 120,
    observerLatitudeDeg: 29.583,
    ayanamshaDeg: 24.217,
    obliquityDeg: 24
  });
  assert.ok(Number.isFinite(rising.risingAsus));

  const correction = calculateChapter7SequentialDrikkarma({
    siderealLongitudeDeg: 120,
    planetLatitudeDeg: 1.2,
    observerLatitudeDeg: 29.583,
    localSiderealAngleDeg: 200,
    ayanamshaDeg: 24.217,
    obliquityDeg: 24,
    localSiderealObliquityDeg: 23.4367
  });
  assert.ok(correction && Number.isFinite(correction.correctedLongitude));

  const combined = chapter9LagnantaraAsus({
    sunSiderealLongitudeDeg: 115,
    planetSiderealLongitudeDeg: correction.correctedLongitude,
    direction: "east",
    observerLatitudeDeg: 29.583,
    ayanamshaDeg: 24.217,
    obliquityDeg: 24
  });
  assert.ok(Number.isFinite(combined.K));
  console.log(`Chapter III: ${ch3.passed}/${ch3.total}; Chapter VII: ${ch7.passed}/${ch7.total}`);
  console.log(ch3.note);
  console.log(ch7.note);
});
