import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { compareReferences, median } from "../scripts/audit-mahapat-references.mjs";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const calculator = fileURLToPath(new URL("../scripts/compare-mahapat-ephemeris.mjs", import.meta.url));
const reference = JSON.parse(await readFile(
  new URL("../data/reviews/mahapat-2023-2024-reference.json", import.meta.url),
  "utf8"
));

function ms(value) { return Date.parse(value); }


test("Drik-style candidate windows backtest against all timed Tara Prasad 2023-24 rows", () => {
  const output = execFileSync(process.execPath, [calculator, "--years=2023,2024"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  const calculated = JSON.parse(output);
  const report = compareReferences(reference, calculated);
  assert.equal(report.summary.sourceRows, 31);
  assert.equal(report.summary.completePairs, 30);
  assert.equal(report.summary.partialPairs, 1);
  assert.equal(report.summary.unresolvedRows, 0);
  assert.deepEqual(report.unpairedCalculatedWithinSourceSpan, []);
  // Explicitly retain known discrepancies; association must not imply accuracy.
  assert.equal(report.summary.bothEndpointsWithin10Minutes, 21);
  assert.equal(report.summary.bothEndpointsWithin30Minutes, 27);
  assert.deepEqual(report.summary.over30MinuteRows, [1, 3, 9, 26]);
  assert.equal(report.rows[0].startDeltaMinutes, null);
  assert.ok(report.rows[0].endDeltaMinutes < -200);

  const complete = reference.events.filter(row => row.touchTimeIST && row.releaseTimeIST);
  const unused = calculated.events.slice();
  const pairs = [];

  for (const source of complete) {
    const candidates = unused.filter(event =>
      (source.type === "vaidhrti" ? event.type === "वैधृति महापात" : event.type === "व्यतीपात महापात") &&
      Math.abs(ms(event.startTimeIST) - ms(source.touchTimeIST)) < 24 * 60 * 60_000
    ).sort((a, b) =>
      Math.abs(ms(a.startTimeIST) - ms(source.touchTimeIST)) -
      Math.abs(ms(b.startTimeIST) - ms(source.touchTimeIST))
    );
    assert.ok(candidates.length, `no same-class event near ${source.touchTimeIST}`);
    const matched = candidates[0];
    unused.splice(unused.indexOf(matched), 1);
    pairs.push({
      source,
      matched,
      startDeltaMinutes: (ms(matched.startTimeIST) - ms(source.touchTimeIST)) / 60_000,
      endDeltaMinutes: (ms(matched.endTimeIST) - ms(source.releaseTimeIST)) / 60_000
    });
  }

  assert.equal(complete.length, 30);
  assert.equal(pairs.length, 30);
  assert.ok(median(pairs.map(pair => Math.abs(pair.startDeltaMinutes))) < 10);
  assert.ok(median(pairs.map(pair => Math.abs(pair.endDeltaMinutes))) < 10);

  const June21 = pairs.find(pair => pair.source.touchTimeIST.startsWith("2023-06-21"));
  assert.ok(June21);
  assert.ok(Math.abs(June21.startDeltaMinutes) < 10);
  assert.ok(June21.matched.rejectedEqualDeclinationCrossings.some(root =>
    root.timeIST.startsWith("2023-06-16") && root.eventClass === null
  ));
});


test("reference association rejects ambiguous matches and preserves partial endpoints", () => {
  const source = { type: "vyatipata", touchTimeIST: null, releaseTimeIST: "2023-04-04T16:58:00+05:30" };
  const event = { type: "व्यतीपात महापात", startTimeIST: "2023-04-04T13:01:00+05:30", endTimeIST: source.releaseTimeIST };
  const partial = compareReferences({ events: [source] }, { events: [event] });
  assert.equal(partial.rows[0].status, "partial");
  assert.equal(partial.rows[0].startDeltaMinutes, null);
  assert.equal(partial.rows[0].endDeltaMinutes, 0);
  const ambiguous = compareReferences({ events: [source] }, { events: [event, { ...event }] });
  assert.equal(ambiguous.rows[0].status, "ambiguous");
  const duplicate = compareReferences({ events: [source, source] }, { events: [event] });
  assert.equal(duplicate.rows[1].status, "duplicate-association");
  assert.equal(median([1, 2, 8, 10]), 5);
});

test("independent 2025 annual table retains unmatched model events and measured errors", () => {
  const source = JSON.parse(readFileSync(new URL("../data/reviews/mahapat-2025-independent.json", import.meta.url)));
  const run = model => JSON.parse(execFileSync(process.execPath,
    [calculator, "--years=2025", "--contact-model=" + model], { encoding: "utf8" }));
  for (const [model, count] of [["apparent-disks", 8], ["taraprasad-30-arcmin", 0]]) {
    const annual = run(model);
    const result = compareReferences(source, annual);
    assert.equal(result.summary.completePairs, 26);
    assert.equal(result.summary.unresolvedRows, 0);
    assert.equal(result.summary.bothEndpointsWithin3Minutes, count);
    const paired = new Set(result.rows.map(row => row.computedStartIST));
    assert.deepEqual(annual.events.filter(e => !paired.has(e.startTimeIST))
      .map(e => e.startTimeIST.slice(0, 10)), ["2025-09-21", "2025-12-31"]);
  }
});
