import test from "node:test";
import assert from "node:assert/strict";
import {
  signedAzimuthDifference,
  fitLinearThreshold,
  auditAzimuthConditionedThresholds
} from "../research/azimuth-conditioned-threshold-audit.mjs";

test("normalizes azimuth difference across zero degrees", () => {
  assert.equal(signedAzimuthDifference(2, 358), 4);
  assert.equal(signedAzimuthDifference(358, 2), -4);
});

test("fits a linear threshold only with adequate finite samples", () => {
  const fit = fitLinearThreshold([
    { azimuthSeparationDeg: 1, sunDepressionDeg: 6 },
    { azimuthSeparationDeg: 2, sunDepressionDeg: 5.8 },
    { azimuthSeparationDeg: 3, sunDepressionDeg: 5.6 }
  ]);
  assert.equal(fit.status, "fitted");
  assert.ok(Math.abs(fit.slopeDegPerAzimuthDeg + 0.2) < 1e-12);
  assert.equal(fit.sampleCount, 3);
  assert.equal(fitLinearThreshold([]).status, "insufficient-samples");
});

test("leave-one-year-out removes the entire target year and keeps holdout diagnostic-only", () => {
  const report = auditAzimuthConditionedThresholds({
    model: "test",
    observer: { latitude: 1, longitude: 2, height: 3 },
    results: [
      { sourceYear: 2021, sourceWindowId: "a", planet: "Venus", boundary: "astaEnd",
        nearestHorizonEvent: { type: "set" },
        sourceGeometry: { planetAzimuthDeg: 101, sunAzimuthDeg: 100, sunDepressionDeg: 6 } },
      { sourceYear: 2022, sourceWindowId: "b", planet: "Venus", boundary: "astaEnd",
        nearestHorizonEvent: { type: "set" },
        sourceGeometry: { planetAzimuthDeg: 102, sunAzimuthDeg: 100, sunDepressionDeg: 5.8 } },
      { sourceYear: 2023, sourceWindowId: "c", planet: "Venus", boundary: "astaEnd",
        nearestHorizonEvent: { type: "set" },
        sourceGeometry: { planetAzimuthDeg: 103, sunAzimuthDeg: 100, sunDepressionDeg: 5.6 } },
      { sourceYear: 2024, sourceWindowId: "d", planet: "Venus", boundary: "astaEnd",
        nearestHorizonEvent: { type: "set" },
        sourceGeometry: { planetAzimuthDeg: 104, sunAzimuthDeg: 100, sunDepressionDeg: 5.4 } },
      { sourceYear: 2026, sourceWindowId: "h", planet: "Venus", boundary: "astaEnd",
        nearestHorizonEvent: { type: "set" },
        sourceGeometry: { planetAzimuthDeg: 105, sunAzimuthDeg: 100, sunDepressionDeg: 5.2 } }
    ]
  });
  const group = report.groups.find(item => item.group === "Pithoragarh:Venus:astaEnd:set");
  assert.equal(group.trainingSampleCount, 4);
  assert.equal(group.leaveOneYearOut.evaluatedSamples, 4);
  assert.equal(group.holdout[0].status, "diagnostic-only-no-event-time-prediction");
  assert.equal(report.publicationEligible, false);
});

test("multi-city observations keep city calibration separate and exclude branch mismatches", () => {
  const cityRow = (city, year, branchMatchesConjunction = true) => ({
    sourceWindowId: city + year, city, sourceYear: year,
    planet: "Venus", boundary: "astaEnd",
    branchMatchesConjunction, horizonEventType: "set",
    sunDepressionDeg: 6 - (year - 2021) * 0.1,
    planetAzimuthDeg: 100 + year - 2021,
    sunAzimuthDeg: 99
  });
  const report = auditAzimuthConditionedThresholds({
    cities: [
      { city: "Pithoragarh", sourceObservations: [
        cityRow("Pithoragarh", 2021), cityRow("Pithoragarh", 2022),
        cityRow("Pithoragarh", 2023), cityRow("Pithoragarh", 2024),
        cityRow("Pithoragarh", 2026)
      ] },
      { city: "Mumbai", sourceObservations: [
        cityRow("Mumbai", 2021), cityRow("Mumbai", 2022),
        cityRow("Mumbai", 2023), cityRow("Mumbai", 2024),
        cityRow("Mumbai", 2026), cityRow("Mumbai", 2025, false)
      ] }
    ]
  });
  assert.ok(report.groups.some(item => item.group.startsWith("Pithoragarh:")));
  assert.ok(report.groups.some(item => item.group.startsWith("Mumbai:")));
  assert.ok(report.groups.every(item => item.trainingSampleCount === 4));
  assert.ok(report.groups.every(item => item.group !== "Pithoragarh:Venus:astaEnd:set" ||
    item.holdout.length === 1));
  assert.equal(report.inputShape, "multi-city-source-observations");
});
