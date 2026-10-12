/**
 * Isolated Chapter III.10 geometry diagnostic.
 *
 * This tests only the II.30 quadrant reduction of a supplied residual-cycle
 * angle to bhuja and the III.10 3/10 scale. It does NOT derive elapsed days,
 * the epoch, the yuga-day quotient, a phase angle, or III.11–12 direction.
 * Do not use this as a complete ayana/ayanamsha implementation.
 */

export function chapter3BhujaMagnitudeFromCycleAngle(angleDeg) {
  if (!Number.isFinite(angleDeg)) {
    throw new TypeError("Cycle angle must be a finite number.");
  }

  const angle = ((angleDeg % 360) + 360) % 360;
  if (angle <= 90) return angle;
  if (angle <= 180) return 180 - angle;
  if (angle <= 270) return angle - 180;
  return 360 - angle;
}

export function chapter3AyanaMagnitudeFromCycleAngle(angleDeg) {
  return 0.3 * chapter3BhujaMagnitudeFromCycleAngle(angleDeg);
}

export function runChapter3AyanaGeometryTests() {
  const tests = [];
  const close = (actual, expected, tolerance = 1e-10) =>
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;

  const cases = [
    [0, 0, 0],
    [45, 45, 13.5],
    [90, 90, 27],
    [135, 45, 13.5],
    [180, 0, 0],
    [225, 45, 13.5],
    [270, 90, 27],
    [315, 45, 13.5],
    [360, 0, 0],
    [-45, 45, 13.5],
    [405, 45, 13.5]
  ];

  for (const [angle, expectedBhuja, expectedAyana] of cases) {
    const bhuja = chapter3BhujaMagnitudeFromCycleAngle(angle);
    const ayana = chapter3AyanaMagnitudeFromCycleAngle(angle);
    tests.push({
      name: `II.30/III.10 geometry: angle ${angle}° -> bhuja ${expectedBhuja}°, ayana magnitude ${expectedAyana}°`,
      passed: close(bhuja, expectedBhuja) && close(ayana, expectedAyana)
    });
  }

  tests.push({
    name: "Bhuja magnitude remains in [0°, 90°] and ayana magnitude in [0°, 27°]",
    passed: Array.from({ length: 1440 }, (_, i) => i / 2).every(angle => {
      const bhuja = chapter3BhujaMagnitudeFromCycleAngle(angle);
      const ayana = chapter3AyanaMagnitudeFromCycleAngle(angle);
      return bhuja >= 0 && bhuja <= 90 && ayana >= 0 && ayana <= 27;
    })
  });

  tests.push({
    name: "III.10 magnitude is linear in the reduced bhuja (not in sine(bhuja))",
    passed: close(chapter3AyanaMagnitudeFromCycleAngle(30), 9) &&
      close(chapter3AyanaMagnitudeFromCycleAngle(60), 18) &&
      !close(chapter3AyanaMagnitudeFromCycleAngle(30), 0.3 * Math.sin(Math.PI / 6))
  });

  let rejectedNaN = false;
  try {
    chapter3BhujaMagnitudeFromCycleAngle(Number.NaN);
  } catch (error) {
    rejectedNaN = error instanceof TypeError;
  }
  tests.push({
    name: "Invalid cycle angle is rejected",
    passed: rejectedNaN
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Geometry-only tests. No elapsed-day epoch, residual-cycle derivation, signed direction, or full Chapter III ayana model is implemented."
  };
}
