/**
 * Research-only Chapter I / III ahargana bridge.
 *
 * This uses a published Sūrya-siddhānta reference result as an epoch anchor,
 * then advances by elapsed local-mean days at the Avanti/Ujjayinī prime
 * meridian. It does NOT yet independently reconstruct every Chapter I.45–51
 * correction. The offset and time convention must be verified before use in
 * any production Panchāṅga or planetary event prediction.
 *
 * Input: Julian Day (JD) expressed in local-mean time at the text's prime
 * meridian, not raw UTC JD and not a user's local civil clock.
 */

export const SS_CHAPTER1_AHARGANA_ANCHOR = Object.freeze({
  kaliEpochJulianDayAtPrimeMeridianMidnight: 588465.5,
  aharganaAtKaliEpochMidnight: 714402296627,
  referenceJulianDayAtPrimeMeridianMeanNoon: 2461322,
  referenceAhargana: 714404169483.5,
  referenceDate: "2026-10-08",
  referenceSource: "Vidhyamitra Sūrya Siddhānta ledger, 2026-10-08, apparent noon at Ujjayinī",
  yugaSavanaDays: 1577917828,
  revolutionsPerYuga: 600,
  status: "research anchor; not yet an independent reconstruction of Chapter I.45–51"
});

export function chapter1AharganaFromPrimeMeridianJD(localMeanJD) {
  if (!Number.isFinite(localMeanJD)) {
    throw new TypeError("localMeanJD must be a finite Julian Day in prime-meridian local-mean time.");
  }
  return SS_CHAPTER1_AHARGANA_ANCHOR.aharganaAtKaliEpochMidnight +
    (localMeanJD - SS_CHAPTER1_AHARGANA_ANCHOR.kaliEpochJulianDayAtPrimeMeridianMidnight);
}

export function chapter3AyanaFromPrimeMeridianJD(localMeanJD) {
  const ahargana = chapter1AharganaFromPrimeMeridianJD(localMeanJD);
  const yugaDays = SS_CHAPTER1_AHARGANA_ANCHOR.yugaSavanaDays;
  const revolutions = SS_CHAPTER1_AHARGANA_ANCHOR.revolutionsPerYuga;

  // Work on whole and fractional days separately so the large creation-era
  // count does not erase the sub-day fraction.
  const wholeDays = Math.floor(ahargana);
  const fractionalDay = ahargana - wholeDays;
  const scaledWholeDays = wholeDays * revolutions;
  if (!Number.isSafeInteger(scaledWholeDays)) {
    throw new RangeError("Scaled whole-day ahargana exceeds JavaScript's safe-integer range.");
  }

  let completedRevolutions = Math.floor(scaledWholeDays / yugaDays);
  let remainderDays = (scaledWholeDays % yugaDays) + fractionalDay * revolutions;
  if (remainderDays >= yugaDays) {
    completedRevolutions += 1;
    remainderDays -= yugaDays;
  }

  const cycleFraction = remainderDays / yugaDays;
  const phaseDeg = cycleFraction * 360;
  const angle = ((phaseDeg % 360) + 360) % 360;
  let bhujaDeg;
  if (angle <= 90) bhujaDeg = angle;
  else if (angle <= 180) bhujaDeg = 180 - angle;
  else if (angle <= 270) bhujaDeg = angle - 180;
  else bhujaDeg = 360 - angle;

  return {
    localMeanJD,
    ahargana,
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
    status: "research-only, source-anchored candidate; epoch offset and time convention still require independent Chapter I verification"
  };
}

export function runChapter1AharganaAnchorTests() {
  const tests = [];
  const close = (actual, expected, tolerance = 1e-8) =>
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
  const a = SS_CHAPTER1_AHARGANA_ANCHOR;

  const epoch = chapter1AharganaFromPrimeMeridianJD(a.kaliEpochJulianDayAtPrimeMeridianMidnight);
  tests.push({
    name: "Kali epoch prime-meridian midnight returns the declared source-anchored baseline",
    passed: close(epoch, a.aharganaAtKaliEpochMidnight)
  });

  const reference = chapter1AharganaFromPrimeMeridianJD(a.referenceJulianDayAtPrimeMeridianMeanNoon);
  tests.push({
    name: "2026-10-08 reference noon reproduces published creation-era ahargana",
    passed: close(reference, a.referenceAhargana)
  });

  const ayana = chapter3AyanaFromPrimeMeridianJD(a.referenceJulianDayAtPrimeMeridianMeanNoon);
  tests.push({
    name: "2026-10-08 reference noon reproduces published Chapter III ayana to 4 decimals",
    passed: close(ayana.ayanaMagnitudeDeg, 22.9122, 0.00005) &&
      ayana.circleMotion === "eastward" && ayana.magnitudeTrend === "increasing"
  });

  const nextDay = chapter1AharganaFromPrimeMeridianJD(a.referenceJulianDayAtPrimeMeridianMeanNoon + 1);
  tests.push({
    name: "One local-mean day advances ahargana by exactly one",
    passed: close(nextDay - reference, 1)
  });

  const nextNoon = chapter3AyanaFromPrimeMeridianJD(a.referenceJulianDayAtPrimeMeridianMeanNoon + 1);
  tests.push({
    name: "One-day phase increment equals 600 / yuga-day count of a full circle",
    passed: close(
      nextNoon.phaseDeg - ayana.phaseDeg,
      360 * a.revolutionsPerYuga / a.yugaSavanaDays,
      1e-8
    )
  });

  let rejectedNaN = false;
  try {
    chapter1AharganaFromPrimeMeridianJD(Number.NaN);
  } catch (error) {
    rejectedNaN = error instanceof TypeError;
  }
  tests.push({
    name: "Invalid Julian Day is rejected",
    passed: rejectedNaN
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Tests verify the reference-anchored continuation and arithmetic only; they do not prove the epoch offset or local-mean-time convention is fully derived from Chapter I.45–51."
  };
}
