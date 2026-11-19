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
const venus = report.pithoragarhCrossLocationTransfer;
const jupiter = report.pithoragarhJupiterCrossLocationTransfer;
for (const [body, transfer] of [["Venus", venus], ["Jupiter", jupiter]]) {
  assert.ok(transfer, "Missing Pithoragarh cross-location report");
  assert.equal(transfer.trainingSourceId, "drikpanchang-almora");
  assert.equal(transfer.targetSourceId, "drikpanchang-pithoragarh");
  assert.equal(transfer.trainingThroughYear, 2025);
  assert.ok(transfer.trainingSamples > 0, "empty Almora training group");
  assert.ok(Array.isArray(transfer.results) && Array.isArray(transfer.missingThresholds));
  assert.equal(transfer.targetObservations,
    transfer.results.length + transfer.missingThresholds.length + transfer.rejectedReferences.length,
    "every Pithoragarh reference must be accounted for");
  assert.equal(transfer.matchedEvents,
    transfer.results.filter(row => row.predictedDate !== null).length);
  assert.equal(transfer.projectObserverMatchedEvents,
    transfer.results.filter(row => row.projectObserverPredictedDate !== null).length);
  assert.equal(transfer.exactDate,
    transfer.results.filter(row => row.dateOffsetDays === 0).length);
  assert.equal(transfer.withinOneDay,
    transfer.results.filter(row => Number.isInteger(row.dateOffsetDays) &&
      Math.abs(row.dateOffsetDays) <= 1).length);
  assert.equal(transfer.projectObserverExactDate,
    transfer.results.filter(row => row.projectObserverDateOffsetDays === 0).length);
  assert.equal(transfer.projectObserverWithinOneDay,
    transfer.results.filter(row => Number.isInteger(row.projectObserverDateOffsetDays) &&
      Math.abs(row.projectObserverDateOffsetDays) <= 1).length);
  const transferIds = transfer.results.map(row => row.sourceId)
    .concat(transfer.missingThresholds.map(row => row.sourceId),
      transfer.rejectedReferences.map(row => row.sourceId));
  assert.equal(new Set(transferIds).size, transferIds.length,
    "duplicate Pithoragarh reference ID");
  for (const row of transfer.results) {
    assert.ok(row.thresholdKey.startsWith(
      [row.body, row.branch, row.event, row.motionState].join("|")));
    assert.equal(row.body, body);
    if (row.predictedDate !== null) {
      assert.ok(Number.isFinite(row.clockOfDayResidualMinutes),
        "matching time residual must be finite");
    }
  }

  if (body === "Jupiter") {
    assert.equal(transfer.referenceLevel, "city-label-only");
    assert.equal(transfer.referenceIds.length, 8);
    assert.deepEqual(transferIds.sort(), [...transfer.referenceIds].sort());
  }
}

const incomplete = [report.heldOutValidation2026, fixed, rolling].some(h =>
  h.unmatchedPredictions.length || h.unmatchedObserved.length ||
  h.ambiguousMatches.length || h.dateAccuracy.exactDate !== h.observedHoldoutEvents) ||
  [venus, jupiter].some(transfer =>
    transfer.missingThresholds.length > 0 || transfer.rejectedReferences.length > 0 ||
    transfer.exactDate !== transfer.targetObservations ||
    transfer.projectObserverExactDate !== transfer.targetObservations);
console.log(JSON.stringify({
  researchOnly: incomplete,
  fixed2027: {exact: fixed.dateAccuracy.exactDate, observed: fixed.observedHoldoutEvents},
  rolling2027: {exact: rolling.dateAccuracy.exactDate, observed: rolling.observedHoldoutEvents,
    unmatchedPredictions: rolling.unmatchedPredictions, unmatchedObserved: rolling.unmatchedObserved},
  pithoragarhTransfers: [venus, jupiter].map((transfer, index) => ({
    body: index === 0 ? "Venus" : "Jupiter",
    exact: transfer.exactDate,
    observed: transfer.targetObservations,
    projectObserverExact: transfer.projectObserverExactDate,
    missingThresholds: transfer.missingThresholds,
    rejectedReferences: transfer.rejectedReferences
  }))
}, null, 2));

if (strict && incomplete) {
  console.error("Release blocked: one or more held-out events are unmatched, ambiguous, or on the wrong date.");
  process.exitCode = 1;
}
