/**
 * Research-only mean solar mandocca (manda-apsis) candidate.
 *
 * Sūrya-siddhānta I.41 gives 387 eastward revolutions of the Sun's
 * mandocca per kalpa; I.20 defines a kalpa as 1000 yugas. The starting
 * longitude 77°07′48″ at Kali year 1 current is reported in Burgess-era
 * secondary literature (Sewell, Indian Chronography), not reconstructed
 * here from a manuscript table image. Treat the epoch/frame as a validation
 * gate, not a certified canonical anchor.
 *
 * Input is elapsed savana days from the Kali epoch, not a civil date and not
 * the creation-era ahargana. This keeps the epoch bridge separate and avoids
 * silently assuming that its time convention has been proven.
 */
export const SS_MEAN_SOLAR_MANDOCCA_CONSTANTS = Object.freeze({
  mandoccaRevolutionsPerKalpa: 387,
  yugasPerKalpa: 1000,
  savanaDaysPerYuga: 1577917828,
  kaliEpochLongitudeDeg: 77 + 7 / 60 + 48 / 3600,
  kaliEpochLongitudeDms: Object.freeze({ degrees: 77, minutes: 7, seconds: 48 }),
  source: "Sūrya-siddhānta I.20, I.41; 77°07′48″ epoch value reported in Burgess-era secondary literature (Sewell, Indian Chronography)",
  status: "research-only candidate; epoch anchor and coordinate frame require independent source-image verification"
});

export function chapter1MeanSolarMandoccaFromElapsedDays(elapsedDaysSinceKaliEpoch) {
  if (!Number.isFinite(elapsedDaysSinceKaliEpoch)) {
    throw new TypeError("elapsedDaysSinceKaliEpoch must be a finite day count.");
  }
  const wholeDays = Math.trunc(elapsedDaysSinceKaliEpoch);
  if (!Number.isSafeInteger(wholeDays)) {
    throw new RangeError("Whole elapsed days must be a safe integer.");
  }
  const fractionalDay = elapsedDaysSinceKaliEpoch - wholeDays;
  const c = SS_MEAN_SOLAR_MANDOCCA_CONSTANTS;
  const kalpaDays = BigInt(c.savanaDaysPerYuga) * BigInt(c.yugasPerKalpa);
  const denominator = kalpaDays;
  let wholeDayNumerator = BigInt(wholeDays) * BigInt(c.mandoccaRevolutionsPerKalpa);
  wholeDayNumerator %= denominator;
  if (wholeDayNumerator < 0n) wholeDayNumerator += denominator;

  let motionNumeratorDeg = Number(wholeDayNumerator) / Number(denominator) * 360;
  motionNumeratorDeg += fractionalDay * c.mandoccaRevolutionsPerKalpa * 360 / Number(denominator);
  motionNumeratorDeg = ((motionNumeratorDeg % 360) + 360) % 360;

  const meanMandoccaLongitudeDeg =
    ((c.kaliEpochLongitudeDeg + motionNumeratorDeg) % 360 + 360) % 360;

  return Object.freeze({
    elapsedDaysSinceKaliEpoch,
    wholeDays,
    fractionalDay,
    meanMotionSinceEpochDeg: motionNumeratorDeg,
    meanMandoccaLongitudeDeg,
    source: c.source,
    status: c.status
  });
}

export function runChapter1MeanSolarMandoccaTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-9) =>
    Number.isFinite(a) && Math.abs(a - b) <= tolerance;
  const c = SS_MEAN_SOLAR_MANDOCCA_CONSTANTS;
  const kalpaDays = c.savanaDaysPerYuga * c.yugasPerKalpa;

  const epoch = chapter1MeanSolarMandoccaFromElapsedDays(0);
  tests.push({
    name: "Kali epoch returns the explicitly declared 77°07′48″ candidate anchor",
    passed: close(epoch.meanMandoccaLongitudeDeg, 77.13)
  });

  const oneYuga = chapter1MeanSolarMandoccaFromElapsedDays(c.savanaDaysPerYuga);
  tests.push({
    name: "One yuga advances mandocca by 0.387 revolution",
    passed: close(oneYuga.meanMotionSinceEpochDeg, 139.32, 1e-8)
  });

  const kalpa = chapter1MeanSolarMandoccaFromElapsedDays(kalpaDays);
  tests.push({
    name: "One complete kalpa returns to the epoch longitude",
    passed: close(kalpa.meanMandoccaLongitudeDeg, c.kaliEpochLongitudeDeg, 1e-8)
  });

  const halfDay = chapter1MeanSolarMandoccaFromElapsedDays(1000000.5);
  const wholeDay = chapter1MeanSolarMandoccaFromElapsedDays(1000000);
  const dailyMotion = 387 * 360 / (c.yugasPerKalpa * c.savanaDaysPerYuga);
  const actualHalfDayAdvance =
    (halfDay.meanMandoccaLongitudeDeg - wholeDay.meanMandoccaLongitudeDeg + 360) % 360;
  tests.push({
    name: "Fractional half-day advances by half the source-ratio daily motion",
    passed: close(actualHalfDayAdvance, dailyMotion / 2, 1e-8)
  });

  tests.push({
    name: "Negative elapsed days normalize correctly around the epoch",
    passed: chapter1MeanSolarMandoccaFromElapsedDays(-1).meanMandoccaLongitudeDeg >= 0 &&
      chapter1MeanSolarMandoccaFromElapsedDays(-1).meanMandoccaLongitudeDeg < 360
  });

  tests.push({
    name: "Mandocca longitude remains normalized for large and fractional inputs",
    passed: [0, 1, 1000000.25, kalpaDays + 23.5, -12345.75].every(day => {
      const longitude = chapter1MeanSolarMandoccaFromElapsedDays(day).meanMandoccaLongitudeDeg;
      return longitude >= 0 && longitude < 360;
    })
  });

  let rejectedNaN = false;
  try {
    chapter1MeanSolarMandoccaFromElapsedDays(Number.NaN);
  } catch (error) {
    rejectedNaN = error instanceof TypeError;
  }
  tests.push({
    name: "Non-finite elapsed day count is rejected",
    passed: rejectedNaN
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Arithmetic tests only. The 77°07′48″ epoch value and its frame still require direct source-table verification; no true longitude or event date is calculated."
  };
}
