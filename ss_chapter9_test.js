/**
 * OurHinduDharm — Sūrya-siddhānta Chapter 9 research helper
 *
 * Scope: isolated arithmetic check for the relative-motion step described
 * in IX.10 ONLY. This does not calculate drik-karma, lagnāntara, the
 * prescribed kalāṃśa, local sunrise/sunset, or a final Asta/Udaya event.
 *
 * Inputs must already be independently derived and expressed consistently:
 * - currentKalanshaTimeUnits: current corrected kalāṃśa/time measure
 * - targetKalanshaTimeUnits: required measure for the selected event branch
 * - sunDailyMotionTimeUnitsPerDay: signed daily motion already converted to
 *   the same time measure per day using the IX.11 rising-time conversion
 * - planetDailyMotionTimeUnitsPerDay: signed daily motion converted the same way
 *
 * Signed motion is intentional: when a planet is retrograde, its signed
 * motion naturally makes the relative rate behave like a sum of magnitudes.
 * IX.11's conversion must be done upstream; this helper does not implement it.
 * Do not pass raw Sun–planet elongation here as a substitute for lagnāntara.
 */
export function estimateChapter9TimeCorrection({
  currentKalanshaTimeUnits,
  targetKalanshaTimeUnits,
  sunDailyMotionTimeUnitsPerDay,
  planetDailyMotionTimeUnitsPerDay
}) {
  const values = [
    currentKalanshaTimeUnits,
    targetKalanshaTimeUnits,
    sunDailyMotionTimeUnitsPerDay,
    planetDailyMotionTimeUnitsPerDay
  ];
  if (!values.every(Number.isFinite)) {
    throw new TypeError("All four inputs must be finite numbers.");
  }

  const kalanshaDifferenceTimeUnits = Math.abs(
    targetKalanshaTimeUnits - currentKalanshaTimeUnits
  );
  const relativeMotionTimeUnitsPerDay = Math.abs(
    planetDailyMotionTimeUnitsPerDay - sunDailyMotionTimeUnitsPerDay
  );

  if (relativeMotionTimeUnitsPerDay < 1e-12) {
    throw new RangeError(
      "Relative daily motion is effectively zero; time correction is undefined."
    );
  }

  return {
    kalanshaDifferenceTimeUnits,
    relativeMotionTimeUnitsPerDay,
    estimatedDays: kalanshaDifferenceTimeUnits / relativeMotionTimeUnitsPerDay,
    scope: "IX.10 relative-motion arithmetic after IX.11 conversion"
  };
}

export function runChapter9ArithmeticTests() {
  const tests = [];
  const close = (actual, expected, tolerance = 1e-9) =>
    Math.abs(actual - expected) <= tolerance;

  // Direct motion example: |1.200 - 0.983| = 0.217 time-units/day.
  const direct = estimateChapter9TimeCorrection({
    currentKalanshaTimeUnits: 9,
    targetKalanshaTimeUnits: 8,
    sunDailyMotionTimeUnitsPerDay: 0.983,
    planetDailyMotionTimeUnitsPerDay: 1.2
  });
  tests.push({
    name: "Direct relative motion uses the signed-motion difference after IX.11 conversion",
    passed: close(direct.relativeMotionTimeUnitsPerDay, 0.217) &&
      close(direct.estimatedDays, 1 / 0.217)
  });

  // Retrograde motion: planet speed is negative, so relative speed is
  // |(-0.500) - 0.983| = 1.483 time-units/day (sum of magnitudes).
  const retrograde = estimateChapter9TimeCorrection({
    currentKalanshaTimeUnits: 7,
    targetKalanshaTimeUnits: 8,
    sunDailyMotionTimeUnitsPerDay: 0.983,
    planetDailyMotionTimeUnitsPerDay: -0.5
  });
  tests.push({
    name: "Retrograde relative motion naturally becomes the sum of magnitudes after IX.11 conversion",
    passed: close(retrograde.relativeMotionTimeUnitsPerDay, 1.483) &&
      close(retrograde.estimatedDays, 1 / 1.483)
  });

  const exact = estimateChapter9TimeCorrection({
    currentKalanshaTimeUnits: 8,
    targetKalanshaTimeUnits: 8,
    sunDailyMotionTimeUnitsPerDay: 0.983,
    planetDailyMotionTimeUnitsPerDay: 1.2
  });
  tests.push({
    name: "Already at target gives zero estimated days",
    passed: close(exact.estimatedDays, 0)
  });

  let zeroRelativeMotionRejected = false;
  try {
    estimateChapter9TimeCorrection({
      currentKalanshaTimeUnits: 7,
      targetKalanshaTimeUnits: 8,
      sunDailyMotionTimeUnitsPerDay: 1,
      planetDailyMotionTimeUnitsPerDay: 1
    });
  } catch (error) {
    zeroRelativeMotionRejected = error instanceof RangeError;
  }
  tests.push({
    name: "Zero relative motion is rejected instead of fabricated",
    passed: zeroRelativeMotionRejected
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Passing tests validate arithmetic only, not the full Sūrya-siddhānta procedure."
  };
}
