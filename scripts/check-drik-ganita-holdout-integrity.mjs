// Research-report integrity checks: never confuse a partial match with a release-ready model.
import assert from "node:assert/strict";
import fs from "node:fs";

const strict = process.argv.includes("--require-complete");
const reportPath = process.argv.find(arg => arg.endsWith(".json")) ?? "/tmp/drik-ganita/report.json";
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
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
  const missedStars = h.unmatchedObserved.filter(id => {
    const row = report.observations.find(item => item.id === id);
    return row?.body === "Star1";
  });
  assert.ok(Array.isArray(h.unmatchedAgastyaDiagnostics),
    `${key}: missing Agastya diagnostics`);
  assert.deepEqual(
    h.unmatchedAgastyaDiagnostics.map(item => item.sourceId).sort(),
    missedStars.sort(),
    `${key}: every unmatched Agastya observation must have diagnostics`
  );
  for (const diagnostic of h.unmatchedAgastyaDiagnostics) {
    assert.ok(Array.isArray(diagnostic.nearbyDailySamples), `${key}: daily samples`);
    assert.ok(Array.isArray(diagnostic.nearestPredictions), `${key}: candidate predictions`);
  }
}
const fixed = report.heldOutValidation2027FixedThrough2025;
const rolling = report.heldOutValidation2027RollingThrough2026;
assert.equal(fixed.holdoutYear, 2027);
assert.equal(rolling.holdoutYear, 2027);
assert.equal(fixed.trainingThroughYear, 2025);
assert.equal(rolling.trainingThroughYear, 2026);
const incomplete = [report.heldOutValidation2026, fixed, rolling].some(h =>
  h.unmatchedPredictions.length || h.unmatchedObserved.length ||
  h.ambiguousMatches.length || h.dateAccuracy.exactDate !== h.observedHoldoutEvents);
console.log(JSON.stringify({
  researchOnly: incomplete,
  fixed2027: {exact: fixed.dateAccuracy.exactDate, observed: fixed.observedHoldoutEvents},
  rolling2027: {exact: rolling.dateAccuracy.exactDate, observed: rolling.observedHoldoutEvents,
    unmatchedPredictions: rolling.unmatchedPredictions, unmatchedObserved: rolling.unmatchedObserved}
}, null, 2));

if (strict && incomplete) {
  console.error("Release blocked: one or more held-out events are unmatched, ambiguous, or on the wrong date.");
  process.exitCode = 1;
}
