/**
 * OurHinduDharm — Sūrya-siddhānta Chapter 9 research helper
 *
 * Scope: isolated arithmetic check for the relative-motion step described
 * in IX.10 ONLY. This does not calculate drik-karma, lagnāntara, the
 * prescribed kalāṃśa, local sunrise/sunset, or a final Asta/Udaya event.
 *
 * Inputs must already be independently derived and expressed consistently:
 * - currentKalanshaDeg: current corrected angular/time measure
 * - targetKalanshaDeg: required measure for the selected event branch
 * - sunDailyMotionDegPerDay: signed daily motion in deg/day
 * - planetDailyMotionDegPerDay: signed daily motion in the same frame
 *
 * Signed motion is intentional: when a planet is retrograde, its signed
 * motion naturally makes the relative rate behave like a sum of magnitudes.
 * Do not pass raw Sun–planet elongation here as a substitute for lagnāntara.
 */
export function estimateChapter9TimeCorrection({
  currentKalanshaDeg,
  targetKalanshaDeg,
  sunDailyMotionDegPerDay,
  planetDailyMotionDegPerDay
}) {
  const values = [
    currentKalanshaDeg,
    targetKalanshaDeg,
    sunDailyMotionDegPerDay,
    planetDailyMotionDegPerDay
  ];
  if (!values.every(Number.isFinite)) {
    throw new TypeError("All four inputs must be finite numbers.");
  }

  const angularDifferenceDeg = Math.abs(
    targetKalanshaDeg - currentKalanshaDeg
  );
  const relativeMotionDegPerDay = Math.abs(
    planetDailyMotionDegPerDay - sunDailyMotionDegPerDay
  );

  if (relativeMotionDegPerDay < 1e-12) {
    throw new RangeError(
      "Relative daily motion is effectively zero; time correction is undefined."
    );
  }

  return {
    angularDifferenceDeg,
    relativeMotionDegPerDay,
    estimatedDays: angularDifferenceDeg / relativeMotionDegPerDay,
    scope: "IX.10 relative-motion arithmetic only"
  };
}

export function runChapter9ArithmeticTests() {
  const tests = [];
  const close = (actual, expected, tolerance = 1e-9) =>
    Math.abs(actual - expected) <= tolerance;

  // Direct motion: |1.200 - 0.983| = 0.217 deg/day.
  const direct = estimateChapter9TimeCorrection({
    currentKalanshaDeg: 9,
    targetKalanshaDeg: 8,
    sunDailyMotionDegPerDay: 0.983,
    planetDailyMotionDegPerDay: 1.2
  });
  tests.push({
    name: "Direct relative motion uses the signed-motion difference",
    passed: close(direct.relativeMotionDegPerDay, 0.217) &&
      close(direct.estimatedDays, 1 / 0.217)
  });

  // Retrograde motion: planet speed is negative, so relative speed is
  // |(-0.500) - 0.983| = 1.483 deg/day (sum of magnitudes).
  const retrograde = estimateChapter9TimeCorrection({
    currentKalanshaDeg: 7,
    targetKalanshaDeg: 8,
    sunDailyMotionDegPerDay: 0.983,
    planetDailyMotionDegPerDay: -0.5
  });
  tests.push({
    name: "Retrograde relative motion naturally becomes the sum of magnitudes",
    passed: close(retrograde.relativeMotionDegPerDay, 1.483) &&
      close(retrograde.estimatedDays, 1 / 1.483)
  });

  const exact = estimateChapter9TimeCorrection({
    currentKalanshaDeg: 8,
    targetKalanshaDeg: 8,
    sunDailyMotionDegPerDay: 0.983,
    planetDailyMotionDegPerDay: 1.2
  });
  tests.push({
    name: "Already at target gives zero estimated days",
    passed: close(exact.estimatedDays, 0)
  });

  let zeroRelativeMotionRejected = false;
  try {
    estimateChapter9TimeCorrection({
      currentKalanshaDeg: 7,
      targetKalanshaDeg: 8,
      sunDailyMotionDegPerDay: 1,
      planetDailyMotionDegPerDay: 1
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
