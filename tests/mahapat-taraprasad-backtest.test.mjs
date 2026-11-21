import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const calculator = fileURLToPath(new URL("../scripts/compare-mahapat-ephemeris.mjs", import.meta.url));
const reference = JSON.parse(await readFile(
  new URL("../data/reviews/mahapat-2023-2024-reference.json", import.meta.url),
  "utf8"
));

function ms(value) { return Date.parse(value); }
function median(values) {
  const ordered = values.slice().sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
}

test("Drik-style candidate windows backtest against all timed Tara Prasad 2023-24 rows", () => {
  const output = execFileSync(process.execPath, [calculator, "--years=2023,2024"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  const calculated = JSON.parse(output);
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
