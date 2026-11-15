import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSthitiVerse11,
  calculateSthitiVerse14Sumatiharsa,
  ghatiPalaToSeconds,
  intervalAroundMidpoint
} from "../karana-kutuhula-sthiti.mjs";

test("Verse 11 reproduces the second Karaṇa-kutūhala worked sthiti example", () => {
  const result = calculateSthitiVerse11({
    ashuddhaKhanda: { whole: 184, part: 19 }
  });
  assert.equal(result.method, "karana-kutuhula-verse-11-sumatiharsa");
  assert.equal(result.ghati, 11);
  assert.ok(Math.abs(result.pala - 57) < 0.2);
  assert.equal(result.status, "research-only");
});

test("worked example converts 12;49 midpoint and 11;57 sthiti to 0;52 and 24;46", () => {
  const sthiti = { ghati: 11, pala: 57 };
  const midpoint = ghatiPalaToSeconds({ ghati: 12, pala: 49 });
  const interval = intervalAroundMidpoint(midpoint, sthiti);
  const toGhatiPalaText = seconds => {
    const totalPala = Math.round(seconds / 24);
    return [Math.floor(totalPala / 60), totalPala % 60];
  };
  assert.deepEqual(toGhatiPalaText(interval.startSecondsAfterSunrise), [0, 52]);
  assert.deepEqual(toGhatiPalaText(interval.endSecondsAfterSunrise), [24, 46]);
});

test("Verse 14 remains a separate half-span formula", () => {
  const result = calculateSthitiVerse14Sumatiharsa({
    residualShara: 120,
    terminalKhanda: { whole: 30, part: 0 }
  });
  assert.equal(result.method, "karana-kutuhula-verse-14-sumatiharsa");
  assert.equal(result.fullSpanGhati, 108);
  assert.equal(result.ghati, 54);
  assert.equal(result.pala, 0);
  assert.equal(result.status, "research-only");
});

test("both source methods reject incomplete or impossible inputs", () => {
  assert.throws(() => calculateSthitiVerse11({ ashuddhaKhanda: { whole: 0, part: 0 } }), /positive/);
  assert.throws(() => calculateSthitiVerse11({ ashuddhaKhanda: 184.19 }), /must be/);
  assert.throws(() => calculateSthitiVerse14Sumatiharsa({
    residualShara: 481, terminalKhanda: { whole: 1, part: 0 }
  }), /0\.\.480/);
  assert.throws(() => calculateSthitiVerse14Sumatiharsa({
    residualShara: 100, terminalKhanda: { whole: 0, part: 0 }
  }), /positive/);
});
