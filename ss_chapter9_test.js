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

/**
 * Chapter IX.2–3 event classification candidate.
 *
 * dailyMotionDegPerDay must be a signed longitude rate in the same
 * ecliptic frame as the supplied longitudes. Positive = direct/eastward;
 * negative = retrograde. This classifies the treatise's four heliacal
 * geometries, not whether a body is actually visible to the naked eye.
 */
export function classifyChapter9HorizonEvent({
  planet,
  planetLongitudeDeg,
  sunLongitudeDeg,
  dailyMotionDegPerDay
}) {
  if (!Number.isFinite(planetLongitudeDeg) || !Number.isFinite(sunLongitudeDeg)) {
    return null;
  }

  const planetLongitude = ((planetLongitudeDeg % 360) + 360) % 360;
  const sunLongitude = ((sunLongitudeDeg % 360) + 360) % 360;
  const longitudeDifference = planetLongitude - sunLongitude;
  if (Math.abs(longitudeDifference) < 1e-7) return null;

  /*
   * IX.2–3 says abhyadhika / ūna relative to the Sun: greater or less
   * zodiacal longitude. Do not replace that ordering with the shortest
   * signed circular separation; it reverses the branch across 0° Aries.
   */
  const planetLongitudeGreater = longitudeDifference > 0;

  if (planet === "Jupiter" || planet === "Mars" || planet === "Saturn") {
    return planetLongitudeGreater ? "west-setting" : "east-rising";
  }

  if (planet !== "Venus" && planet !== "Mercury") return null;
  if (!Number.isFinite(dailyMotionDegPerDay) || Math.abs(dailyMotionDegPerDay) < 1e-6) {
    return null;
  }

  if (dailyMotionDegPerDay < 0) {
    return planetLongitudeGreater ? "west-setting" : "east-rising";
  }

  return planetLongitudeGreater ? "west-rising" : "east-setting";
}

/**
 * Chapter IX.11 conversion. Daily longitude motion is supplied in
 * arcminutes/day; the rising equivalent of that planet's sign is supplied
 * in prāṇas/asus. The result is time-motion in prāṇas per day.
 */
export function chapter9TimeMotionFromArcMotion({
  dailyMotionArcminPerDay,
  signRisingAsus
}) {
  if (!Number.isFinite(dailyMotionArcminPerDay) ||
      !Number.isFinite(signRisingAsus) ||
      signRisingAsus <= 0) {
    throw new TypeError("Daily motion must be finite and sign rising-asus must be positive.");
  }
  return dailyMotionArcminPerDay * signRisingAsus / 1800;
}

/**
 * Signed IX.10–11 time estimate. current/target K are time-degrees;
 * multiplying their difference by 60 gives prāṇas. The signed derivative
 * of |planet OA - Sun OA| determines past (- days) vs future (+ days).
 */
export function estimateChapter9TimeCorrectionFromArcMotions({
  currentKalanshaDeg,
  targetKalanshaDeg,
  signedLagnantaraDeg,
  sunDailyMotionArcminPerDay,
  planetDailyMotionArcminPerDay,
  sunSignRisingAsus,
  planetSignRisingAsus
}) {
  const values = [
    currentKalanshaDeg, targetKalanshaDeg, signedLagnantaraDeg,
    sunDailyMotionArcminPerDay, planetDailyMotionArcminPerDay
  ];
  if (!values.every(Number.isFinite) || Math.abs(signedLagnantaraDeg) < 1e-10) {
    throw new TypeError("Finite K/motion values and a non-zero signed lagnāntara are required.");
  }

  const sunTimeMotionPranasPerDay = chapter9TimeMotionFromArcMotion({
    dailyMotionArcminPerDay: sunDailyMotionArcminPerDay,
    signRisingAsus: sunSignRisingAsus
  });
  const planetTimeMotionPranasPerDay = chapter9TimeMotionFromArcMotion({
    dailyMotionArcminPerDay: planetDailyMotionArcminPerDay,
    signRisingAsus: planetSignRisingAsus
  });
  const signedKalanshaRatePranasPerDay =
    Math.sign(signedLagnantaraDeg) *
    (planetTimeMotionPranasPerDay - sunTimeMotionPranasPerDay);

  if (Math.abs(signedKalanshaRatePranasPerDay) < 1e-10) {
    throw new RangeError("Relative time-motion is effectively zero; date estimate is undefined.");
  }

  const differencePranas =
    (targetKalanshaDeg - currentKalanshaDeg) * 60;
  return {
    differencePranas,
    sunTimeMotionPranasPerDay,
    planetTimeMotionPranasPerDay,
    signedKalanshaRatePranasPerDay,
    estimatedDays: differencePranas / signedKalanshaRatePranasPerDay,
    scope: "IX.10–11 estimate after sign rising-asus are independently supplied"
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

  // Cross-check the event classifier and threshold selector together. For
  // Venus, retrograde motion must reach one of the IX.7 8° event branches;
  // direct motion reaches one of the 10° branches. Do not choose C from the
  // generic "Asta/Combust" label or from a 3-D viewer's angular threshold.
  const venusBranchFixtures = [
    {
      name: "Retrograde Venus east of Sun resolves to west-setting and C=8°",
      args: { planet: "Venus", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: -0.5 },
      expectedEvent: "west-setting",
      expectedLimit: 8
    },
    {
      name: "Retrograde Venus west of Sun resolves to east-rising and C=8°",
      args: { planet: "Venus", planetLongitudeDeg: 99, sunLongitudeDeg: 100, dailyMotionDegPerDay: -0.5 },
      expectedEvent: "east-rising",
      expectedLimit: 8
    },
    {
      name: "Direct Venus west of Sun resolves to east-setting and C=10°",
      args: { planet: "Venus", planetLongitudeDeg: 99, sunLongitudeDeg: 100, dailyMotionDegPerDay: 1 },
      expectedEvent: "east-setting",
      expectedLimit: 10
    },
    {
      name: "Direct Venus east of Sun resolves to west-rising and C=10°",
      args: { planet: "Venus", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: 1 },
      expectedEvent: "west-rising",
      expectedLimit: 10
    }
  ];
  for (const fixture of venusBranchFixtures) {
    const event = classifyChapter9HorizonEvent(fixture.args);
    const limit = chapter9Kalansha({ planet: "Venus", horizonEvent: event });
    tests.push({
      name: fixture.name,
      passed: event === fixture.expectedEvent && limit === fixture.expectedLimit
    });
  }

  const eventCases = [
    { name: "Jupiter eastward of Sun maps to west-setting", args: { planet: "Jupiter", planetLongitudeDeg: 101, sunLongitudeDeg: 100 }, expected: "west-setting" },
    { name: "Jupiter westward of Sun maps to east-rising", args: { planet: "Jupiter", planetLongitudeDeg: 99, sunLongitudeDeg: 100 }, expected: "east-rising" },
    { name: "Mars uses the superior-planet west-setting branch", args: { planet: "Mars", planetLongitudeDeg: 101, sunLongitudeDeg: 100 }, expected: "west-setting" },
    { name: "Mars uses the superior-planet east-rising branch", args: { planet: "Mars", planetLongitudeDeg: 99, sunLongitudeDeg: 100 }, expected: "east-rising" },
    { name: "Saturn uses the superior-planet west-setting branch", args: { planet: "Saturn", planetLongitudeDeg: 101, sunLongitudeDeg: 100 }, expected: "west-setting" },
    { name: "Saturn uses the superior-planet east-rising branch", args: { planet: "Saturn", planetLongitudeDeg: 99, sunLongitudeDeg: 100 }, expected: "east-rising" },
    { name: "Superior planet at 359.5° is greater than Sun at 0.5° across zodiac wrap", args: { planet: "Jupiter", planetLongitudeDeg: 359.5, sunLongitudeDeg: 0.5 }, expected: "west-setting" },
    { name: "Superior planet at 0.5° is less than Sun at 359.5° across zodiac wrap", args: { planet: "Jupiter", planetLongitudeDeg: 0.5, sunLongitudeDeg: 359.5 }, expected: "east-rising" },
    { name: "Direct Venus uses zodiac ordering across 0° Aries", args: { planet: "Venus", planetLongitudeDeg: 359.5, sunLongitudeDeg: 0.5, dailyMotionDegPerDay: 1 }, expected: "west-rising" },
    { name: "Retrograde Venus uses zodiac ordering across 0° Aries", args: { planet: "Venus", planetLongitudeDeg: 359.5, sunLongitudeDeg: 0.5, dailyMotionDegPerDay: -0.5 }, expected: "west-setting" },
    { name: "Retrograde Venus follows IX.2 west-setting branch", args: { planet: "Venus", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: -0.5 }, expected: "west-setting" },
    { name: "Retrograde Venus follows IX.2 east-rising branch", args: { planet: "Venus", planetLongitudeDeg: 99, sunLongitudeDeg: 100, dailyMotionDegPerDay: -0.5 }, expected: "east-rising" },
    { name: "Direct Venus follows IX.3 east-setting branch", args: { planet: "Venus", planetLongitudeDeg: 99, sunLongitudeDeg: 100, dailyMotionDegPerDay: 1 }, expected: "east-setting" },
    { name: "Direct Venus follows IX.3 west-rising branch", args: { planet: "Venus", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: 1 }, expected: "west-rising" },
    { name: "Retrograde Mercury follows IX.2 west-setting branch", args: { planet: "Mercury", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: -0.5 }, expected: "west-setting" },
    { name: "Retrograde Mercury follows IX.2 east-rising branch", args: { planet: "Mercury", planetLongitudeDeg: 99, sunLongitudeDeg: 100, dailyMotionDegPerDay: -0.5 }, expected: "east-rising" },
    { name: "Direct Mercury follows IX.3 east-setting branch", args: { planet: "Mercury", planetLongitudeDeg: 99, sunLongitudeDeg: 100, dailyMotionDegPerDay: 1 }, expected: "east-setting" },
    { name: "Direct Mercury follows IX.3 west-rising branch", args: { planet: "Mercury", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: 1 }, expected: "west-rising" },
    { name: "Exact conjunction is not assigned an arbitrary horizon branch", args: { planet: "Venus", planetLongitudeDeg: 100, sunLongitudeDeg: 100, dailyMotionDegPerDay: -0.5 }, expected: null },
    { name: "Mercury/Venus stationary motion is not guessed", args: { planet: "Venus", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: 0 }, expected: null },
    { name: "Unsupported planet is not assigned a branch", args: { planet: "Moon", planetLongitudeDeg: 101, sunLongitudeDeg: 100, dailyMotionDegPerDay: 13 }, expected: null }
  ];
  for (const item of eventCases) {
    const actual = classifyChapter9HorizonEvent(item.args);
    tests.push({
      name: item.name,
      passed: actual === item.expected
    });
  }

  const motionEquator = chapter9TimeMotionFromArcMotion({
    dailyMotionArcminPerDay: 59,
    signRisingAsus: 1800
  });
  tests.push({
    name: "IX.11 at the equator preserves arcminutes/day numerically as prāṇas/day",
    passed: close(motionEquator, 59)
  });

  const motionUnequalSign = chapter9TimeMotionFromArcMotion({
    dailyMotionArcminPerDay: 60,
    signRisingAsus: 1500
  });
  tests.push({
    name: "IX.11 applies the sign-specific rising-asus ratio",
    passed: close(motionUnequalSign, 50)
  });

  const future = estimateChapter9TimeCorrectionFromArcMotions({
    currentKalanshaDeg: 9,
    targetKalanshaDeg: 8,
    signedLagnantaraDeg: -1,
    sunDailyMotionArcminPerDay: 59,
    planetDailyMotionArcminPerDay: 60,
    sunSignRisingAsus: 1800,
    planetSignRisingAsus: 1800
  });
  tests.push({
    name: "IX.10–11 signed estimate returns future when K is decreasing toward target",
    passed: close(future.signedKalanshaRatePranasPerDay, -1) &&
      close(future.estimatedDays, 60)
  });

  const past = estimateChapter9TimeCorrectionFromArcMotions({
    currentKalanshaDeg: 9,
    targetKalanshaDeg: 8,
    signedLagnantaraDeg: 1,
    sunDailyMotionArcminPerDay: 59,
    planetDailyMotionArcminPerDay: 60,
    sunSignRisingAsus: 1800,
    planetSignRisingAsus: 1800
  });
  tests.push({
    name: "IX.10–11 signed estimate returns past when K is increasing away from target",
    passed: close(past.signedKalanshaRatePranasPerDay, 1) &&
      close(past.estimatedDays, -60)
  });

  const retrogradeRate = estimateChapter9TimeCorrectionFromArcMotions({
    currentKalanshaDeg: 7,
    targetKalanshaDeg: 8,
    signedLagnantaraDeg: 1,
    sunDailyMotionArcminPerDay: 59,
    planetDailyMotionArcminPerDay: -30,
    sunSignRisingAsus: 1800,
    planetSignRisingAsus: 1800
  });
  tests.push({
    name: "IX.11 signed retrograde motion combines into the relative rate",
    passed: close(retrogradeRate.signedKalanshaRatePranasPerDay, -89) &&
      close(retrogradeRate.estimatedDays, -60 / 89)
  });

  let invalidAsusRejected = false;
  try {
    chapter9TimeMotionFromArcMotion({
      dailyMotionArcminPerDay: 60,
      signRisingAsus: 0
    });
  } catch (error) {
    invalidAsusRejected = error instanceof TypeError;
  }
  tests.push({
    name: "IX.11 rejects missing/zero sign rising-asus instead of fabricating a time rate",
    passed: invalidAsusRejected
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Passing tests validate arithmetic and threshold selection only; they do not validate event classification or the full Sūrya-siddhānta procedure."
  };
}
