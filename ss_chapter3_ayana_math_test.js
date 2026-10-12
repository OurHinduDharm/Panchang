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


/**
 * Apply the commentary's 600-revolutions-per-yuga quotient to an already
 * source-derived ahargana. The caller must supply the correct epoch/day count.
 * The returned direction is the circle's motion, not yet the signed longitude
 * correction to add to a planet.
 */
export function chapter3AyanaCycleStateFromAhargana({ ahargana, yugaDays }) {
  if (!Number.isSafeInteger(ahargana) || ahargana < 0 ||
      !Number.isSafeInteger(yugaDays) || yugaDays <= 0) {
    throw new TypeError("ahargana and yugaDays must be non-negative/positive safe integers.");
  }

  // Multiplication remains within the safe-integer range for normal Siddhānta
  // day counts; integer modulo avoids losing the small fractional-cycle part.
  const scaledDays = ahargana * 600;
  if (!Number.isSafeInteger(scaledDays)) {
    throw new RangeError("600 × ahargana exceeds the safe-integer range.");
  }
  const completedRevolutions = Math.floor(scaledDays / yugaDays);
  const remainderDays = scaledDays % yugaDays;
  const cycleFraction = remainderDays / yugaDays;
  const phaseDeg = cycleFraction * 360;
  const bhujaDeg = chapter3BhujaMagnitudeFromCycleAngle(phaseDeg);

  return {
    completedRevolutions,
    remainderDays,
    cycleFraction,
    phaseDeg,
    bhujaDeg,
    ayanaMagnitudeDeg: 0.3 * bhujaDeg,
    circleMotion: phaseDeg < 180 ? "westward" : "eastward",
    magnitudeTrend: phaseDeg < 90 || (phaseDeg >= 180 && phaseDeg < 270)
      ? "increasing"
      : "decreasing",
    scope: "Gūḍhārtha-prakāśaka III.9–10 cycle-phase diagnostic; not a complete signed longitude correction"
  };
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

  // Synthetic denominator 2400 makes quarter-cycle phases exact:
  // 600 × 1 / 2400 = 1/4 cycle = 90°.
  const quarter = chapter3AyanaCycleStateFromAhargana({ ahargana: 1, yugaDays: 2400 });
  const half = chapter3AyanaCycleStateFromAhargana({ ahargana: 2, yugaDays: 2400 });
  const threeQuarter = chapter3AyanaCycleStateFromAhargana({ ahargana: 3, yugaDays: 2400 });
  const full = chapter3AyanaCycleStateFromAhargana({ ahargana: 4, yugaDays: 2400 });
  const samePhaseNextCycle = chapter3AyanaCycleStateFromAhargana({ ahargana: 5, yugaDays: 2400 });
  tests.push({
    name: "III.9 synthetic cycle fixture: quarter/half/three-quarter/full phases map to 90°/180°/270°/0°",
    passed: close(quarter.phaseDeg, 90) && close(half.phaseDeg, 180) &&
      close(threeQuarter.phaseDeg, 270) && close(full.phaseDeg, 0)
  });
  tests.push({
    name: "Gūḍhārtha-prakāśaka phase segments alternate westward/eastward and increasing/decreasing",
    passed: quarter.circleMotion === "westward" && quarter.magnitudeTrend === "decreasing" &&
      half.circleMotion === "eastward" && half.magnitudeTrend === "increasing" &&
      threeQuarter.circleMotion === "eastward" && threeQuarter.magnitudeTrend === "decreasing"
  });
  tests.push({
    name: "Cycle state repeats after one full revolution and keeps magnitude non-negative",
    passed: close(quarter.phaseDeg, samePhaseNextCycle.phaseDeg) &&
      close(quarter.ayanaMagnitudeDeg, samePhaseNextCycle.ayanaMagnitudeDeg) &&
      quarter.ayanaMagnitudeDeg >= 0 && quarter.ayanaMagnitudeDeg <= 27
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
