/**
 * Research-only mean solar longitude from a supplied ahargana.
 * Chapter I's 51,840,000 solar months / 12 imply 4,320,000 solar revolutions
 * per yuga. This does not derive ahargana from a civil date or apply the
 * Chapter II solar manda correction; it is not true/apparent longitude.
 */
export const SS_MEAN_SOLAR_LONGITUDE_CONSTANTS = Object.freeze({
  solarRevolutionsPerYuga: 4320000,
  solarMonthsPerYuga: 51840000,
  monthsPerSolarRevolution: 12,
  savanaDaysPerYuga: 1577917828,
  source: "Sūrya-siddhānta I.37 and I.45–51; solar revolutions inferred from solar-month count / 12"
});

export function chapter1MeanSolarLongitudeFromAhargana(ahargana) {
  if (!Number.isFinite(ahargana) || ahargana < 0) {
    throw new TypeError("ahargana must be a finite non-negative day count.");
  }
  const wholeDays = Math.floor(ahargana);
  if (!Number.isSafeInteger(wholeDays)) {
    throw new RangeError("Whole-day ahargana must be a safe integer.");
  }
  const fractionalDay = ahargana - wholeDays;
  const c = SS_MEAN_SOLAR_LONGITUDE_CONSTANTS;
  const yugaDays = BigInt(c.savanaDaysPerYuga);
  const revolutions = BigInt(c.solarRevolutionsPerYuga);
  const wholeCycleNumerator = (BigInt(wholeDays) * revolutions) % yugaDays;
  const numerator = Number(wholeCycleNumerator) + fractionalDay * c.solarRevolutionsPerYuga;
  const normalizedNumerator = ((numerator % c.savanaDaysPerYuga) + c.savanaDaysPerYuga) % c.savanaDaysPerYuga;
  const cycleFraction = normalizedNumerator / c.savanaDaysPerYuga;
  return Object.freeze({
    ahargana, wholeDays, fractionalDay, cycleNumerator: normalizedNumerator,
    cycleFraction, meanLongitudeDeg: cycleFraction * 360,
    source: c.source,
    status: "research-only mean solar longitude; not true longitude and not independently date-anchored"
  });
}

export function runChapter1MeanSolarLongitudeTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-10) => Number.isFinite(a) && Math.abs(a - b) <= tolerance;
  const c = SS_MEAN_SOLAR_LONGITUDE_CONSTANTS;
  tests.push({ name: "Zero ahargana maps to zero mean solar longitude", passed: close(chapter1MeanSolarLongitudeFromAhargana(0).meanLongitudeDeg, 0) });
  tests.push({ name: "One complete yuga returns to the same mean solar longitude", passed: close(chapter1MeanSolarLongitudeFromAhargana(c.savanaDaysPerYuga).meanLongitudeDeg, 0) });
  tests.push({ name: "Half a source-defined solar revolution gives half-cycle mean longitude", passed: close(chapter1MeanSolarLongitudeFromAhargana(c.savanaDaysPerYuga / (2 * c.solarRevolutionsPerYuga)).meanLongitudeDeg, 180, 1e-8) });
  const fractional = chapter1MeanSolarLongitudeFromAhargana(714404169483.5);
  const whole = chapter1MeanSolarLongitudeFromAhargana(714404169483);
  const expectedAdvance = 0.5 * c.solarRevolutionsPerYuga / c.savanaDaysPerYuga * 360;
  const actualAdvance = (fractional.meanLongitudeDeg - whole.meanLongitudeDeg + 360) % 360;
  tests.push({ name: "Half-day fraction advances longitude by half the source mean daily motion", passed: close(actualAdvance, expectedAdvance, 1e-8) });
  tests.push({ name: "Longitude remains normalized to [0°, 360°)", passed: [0, 1, 714404169483.5, c.savanaDaysPerYuga * 2 + 123.25].every(day => { const x = chapter1MeanSolarLongitudeFromAhargana(day).meanLongitudeDeg; return x >= 0 && x < 360; }) });
  let rejected = false;
  try { chapter1MeanSolarLongitudeFromAhargana(-1); } catch (error) { rejected = error instanceof TypeError; }
  tests.push({ name: "Negative ahargana is rejected", passed: rejected });
  return { tests, passed: tests.filter(t => t.passed).length, total: tests.length, allPassed: tests.every(t => t.passed), note: "Arithmetic tests only: epoch anchoring and the true solar manda correction remain separate gates." };
}
