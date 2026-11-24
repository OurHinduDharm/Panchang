import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const calculator = fileURLToPath(new URL("../scripts/compare-mahapat-ephemeris.mjs", import.meta.url));
const fixtures = JSON.parse(readFileSync(new URL("../data/reviews/mahapata-fixtures-2026-2030.json", import.meta.url)));

test("2026-2030 seed discovery agrees with independent 60/30 minute full-range scans", () => {
  const outputs = [60, 30].map(step => JSON.parse(execFileSync(process.execPath,
    [calculator, "--audit", `--audit-step-minutes=${step}`],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 })));
  for (const output of outputs) {
    assert.equal(output.eventCount, 135);
    assert.equal(output.reviewItemCount, 8);
    assert.equal(output.discoveryAudit.rootCount, 135);
    assert.deepEqual(output.discoveryAudit.unrepresentedRoots, []);
    assert.deepEqual(output.discoveryAudit.duplicateIntervals, []);
    assert.deepEqual(output.discoveryAudit.longIntervals, []);
    assert.deepEqual(output.discoveryAudit.grazingCandidates, []);
    // Recalculate the archived windows: a static fixture alone cannot test the solver.
    for (const fixture of fixtures.events) {
      const actual = output.events.find(event => event.type === fixture.type &&
        Math.abs(Date.parse(event.startTimeIST) - Date.parse(fixture.startTimeIST)) < 1000);
      assert.ok(actual, `missing live window ${fixture.startTimeIST}`);
      assert.ok(Math.abs(Date.parse(actual.endTimeIST) - Date.parse(fixture.endTimeIST)) < 1000);
    }
  }
  const [coarse, fine] = outputs.map(output => output.discoveryAudit.roots);
  for (const root of coarse) {
    assert.ok(fine.some(other => other.type === root.type &&
      Math.abs(Date.parse(other.truePataIST) - Date.parse(root.truePataIST)) < 1000));
  }
});

test("signed contact solutions agree with a second ephemeris at the five disputed records", () => {
  // Independent Swiss Ephemeris/Moshier fixed-band roots, rounded down to the second.
  // The transcribed March release remains the only known printed endpoint.
  const independent = [
    ["2023-03-22T03:48:37", "2023-03-22T07:09:27"],
    ["2023-04-17T01:05:44", "2023-04-17T04:41:26"],
    ["2023-06-30T21:30:03", "2023-07-01T03:40:29"],
    ["2024-01-19T23:21:32", "2024-01-20T04:23:20"],
    ["2024-02-02T20:21:44", "2024-02-03T01:01:54"]
  ];
  const { events } = JSON.parse(execFileSync(process.execPath,
    [calculator, "--years=2023,2024", "--contact-model=taraprasad-30-arcmin"]));
  for (const [start, end] of independent) {
    const matches = events.filter(e => e.startTimeIST.startsWith(start.slice(0, 10)));
    assert.equal(matches.length, 1);
    for (const [value, expected] of [[matches[0].startTime, start], [matches[0].endTime, end]]) {
      assert.ok(Math.abs(Date.parse(value) - Date.parse(expected + "+05:30")) < 15000, expected);
    }
  }
});

test("March 2026 Vaidhriti near the equinox has a resolved middle and independent disk contacts", () => {
  const { events } = JSON.parse(execFileSync(process.execPath, [calculator, "--years=2026"]));
  const event = events.find(e => e.startTimeIST.startsWith("2026-03-19"));
  assert.equal(event?.type, "वैधृति महापात");
  assert.ok(event.sunDeclinationAtTruePata < 0 && event.moonDeclinationAtTruePata > 0);
  for (const [key, clock] of [["startTime", "03:47:11"], ["truePata", "05:36:19"], ["endTime", "07:25:25"]]) {
    const swiss = Date.parse("2026-03-19T" + clock + "+05:30");
    assert.ok(Math.abs(Date.parse(event[key]) - swiss) < 15000);
  }
  // The March 19 Patrika bulletin explicitly specifies the release to the minute.
  assert.ok(Math.abs(Date.parse(event.endTime) - Date.parse("2026-03-19T07:25:00+05:30")) < 60000);
});

test("two actual Vaidhriti middles in December 2019 share one connected disk interval", () => {
  const year = JSON.parse(execFileSync(process.execPath, [calculator, "--years=2019", "--audit"]));
  const december = year.events.filter(e => e.startTimeIST.startsWith("2019-12-13"));
  assert.equal(december.length, 1);
  const [event] = december;
  assert.equal(event.type, "वैधृति महापात");
  assert.ok(event.truePataIST.startsWith("2019-12-13T18:15"));
  assert.ok(event.otherTrueCrossings[0]?.startsWith("2019-12-14T08:26"));
  assert.equal(event.otherTrueCrossings.length, 1);
  assert.ok(event.startTimeIST.startsWith("2019-12-13T03:00"));
  assert.ok(event.endTimeIST.startsWith("2019-12-14T23:27"));
  assert.equal(year.discoveryAudit.longIntervals.length, 1);
  assert.deepEqual(year.discoveryAudit.unrepresentedRoots, []);
});
