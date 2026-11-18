// Research-report integrity checks: never confuse a partial match with a release-ready model.
import assert from "node:assert/strict";
import fs from "node:fs";

const report = JSON.parse(fs.readFileSync(process.argv[2] ?? "/tmp/drik-ganita/report.json", "utf8"));
for (const key of [
  "heldOutValidation2026",
  "heldOutValidation2027FixedThrough2025",
  "heldOutValidation2027RollingThrough2026"
]) {
  const h = report[key];
  assert.ok(h, `Missing holdout: ${key}`);
  assert.ok(Number.isInteger(h.predictedEvents) && h.predictedEvents >= 0, key);
  assert.ok(Number.isInteger(h.observedHoldoutEvents) && h.observedHoldoutEvents >= 0, key);
  assert.equal(h.matchedEvents, h.matches.length, `${key}: matched count`);
  assert.equal(h.predictedEvents,
    h.matchedEvents + h.unmatchedPredictions.length + h.ambiguousMatches.length,
    `${key}: predicted events must be accounted for`);
  assert.equal(h.observedHoldoutEvents,
    h.matchedEvents + h.unmatchedObserved.length,
    `${key}: observed events must be accounted for`);
  assert.equal(h.dateAccuracy.withinOneDay + h.dateAccuracy.moreThanOneDay,
    h.matchedEvents, `${key}: date accuracy accounting`);
  assert.equal(h.duplicatePredictionKeys.length, 0, `${key}: duplicate predictions`);
}
const fixed = report.heldOutValidation2027FixedThrough2025;
const rolling = report.heldOutValidation2027RollingThrough2026;
assert.equal(fixed.holdoutYear, 2027);
assert.equal(rolling.holdoutYear, 2027);
assert.equal(fixed.trainingThroughYear, 2025);
assert.equal(rolling.trainingThroughYear, 2026);
const incomplete = [fixed, rolling].some(h =>
  h.unmatchedPredictions.length || h.unmatchedObserved.length ||
  h.ambiguousMatches.length || h.dateAccuracy.exactDate !== h.observedHoldoutEvents);
console.log(JSON.stringify({
  researchOnly: incomplete,
  fixed2027: {exact: fixed.dateAccuracy.exactDate, observed: fixed.observedHoldoutEvents},
  rolling2027: {exact: rolling.dateAccuracy.exactDate, observed: rolling.observedHoldoutEvents,
    unmatchedPredictions: rolling.unmatchedPredictions, unmatchedObserved: rolling.unmatchedObserved}
}, null, 2));
