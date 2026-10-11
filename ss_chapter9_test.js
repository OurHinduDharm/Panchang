/**
 * OurHinduDharm — Sūrya-siddhānta Chapter 9 research helper
 *
 * Scope: isolated tests for (1) the IX.10 relative-motion arithmetic and
 * (2) the IX.6–8 prescribed angular-limit table. This does not calculate
 * dṛkkarma, lagnāntara, event geometry, local sunrise/sunset, or a final event.
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


/**
 * Select the Chapter 9 visibility limit from the event geometry stated by
 * verses IX.6–8. This is only a threshold selector: callers must independently
 * determine which horizon event applies. Do not infer the Venus branch from
 * the generic labels "Asta" or "Udaya" alone.
 *
 * horizonEvent: west-setting | east-rising | east-setting | west-rising
 * motionClass for Mercury: retrograde | direct-fast
 */
export function chapter9Kalansha({ planet, horizonEvent, motionClass }) {
  if (planet === "Jupiter") return 11;
  if (planet === "Saturn") return 15;
  if (planet === "Mars") return 17;

  if (planet === "Venus") {
    if (horizonEvent === "west-setting" || horizonEvent === "east-rising") return 8;
    if (horizonEvent === "east-setting" || horizonEvent === "west-rising") return 10;
    return NaN;
  }

  if (planet === "Mercury") {
    if (motionClass === "retrograde") return 12;
    if (motionClass === "direct-fast") return 14;
    return NaN;
  }

  return NaN;
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

  // Source-faithful IX.6–8 threshold selection. The horizon-event
  // classification is supplied independently; this helper does not infer it.
  const limits = [
    { name: "Jupiter limit is 11°", args: { planet: "Jupiter" }, expected: 11 },
    { name: "Saturn limit is 15°", args: { planet: "Saturn" }, expected: 15 },
    { name: "Mars limit is 17°", args: { planet: "Mars" }, expected: 17 },
    { name: "Venus west-setting limit is 8°", args: { planet: "Venus", horizonEvent: "west-setting" }, expected: 8 },
    { name: "Venus east-rising limit is 8°", args: { planet: "Venus", horizonEvent: "east-rising" }, expected: 8 },
    { name: "Venus east-setting limit is 10°", args: { planet: "Venus", horizonEvent: "east-setting" }, expected: 10 },
    { name: "Venus west-rising limit is 10°", args: { planet: "Venus", horizonEvent: "west-rising" }, expected: 10 },
    { name: "Mercury retrograde limit is 12°", args: { planet: "Mercury", motionClass: "retrograde" }, expected: 12 },
    { name: "Mercury direct-fast limit is 14°", args: { planet: "Mercury", motionClass: "direct-fast" }, expected: 14 },
    { name: "Unknown Venus event is not silently assigned a limit", args: { planet: "Venus", horizonEvent: "unknown" }, expected: NaN }
  ];
  for (const item of limits) {
    const actual = chapter9Kalansha(item.args);
    tests.push({
      name: item.name,
      passed: Number.isNaN(item.expected) ? Number.isNaN(actual) : actual === item.expected
    });
  }

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Passing tests validate arithmetic and threshold selection only; they do not validate event classification or the full Sūrya-siddhānta procedure."
  };
}
