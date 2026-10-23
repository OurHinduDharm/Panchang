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

/**
 * Convert a standard UTC Julian Day to the Julian-day coordinate expressed
 * in local mean solar time at the Sūrya-siddhānta prime meridian.
 *
 * East longitude is positive. Local mean time = UT + longitude / 360 days.
 * This is only the time-coordinate conversion; it does not validate the
 * ahargana epoch anchor or turn apparent solar noon into mean solar noon.
 */
export function chapter1PrimeMeridianMeanJDFromUtcJD(
  utcJD,
  primeMeridianLongitudeDegEast
) {
  if (!Number.isFinite(utcJD)) {
    throw new TypeError("utcJD must be a finite standard Julian Day in UT.");
  }
  if (!Number.isFinite(primeMeridianLongitudeDegEast) ||
      primeMeridianLongitudeDegEast < -180 ||
      primeMeridianLongitudeDegEast > 180) {
    throw new TypeError("primeMeridianLongitudeDegEast must be in [-180, 180].");
  }
  return utcJD + primeMeridianLongitudeDegEast / 360;
}

export function chapter1AharganaFromPrimeMeridianJD(localMeanJD) {
  if (!Number.isFinite(localMeanJD)) {
    throw new TypeError("localMeanJD must be a finite Julian Day in prime-meridian local-mean time.");
  }
  return SS_CHAPTER1_AHARGANA_ANCHOR.aharganaAtKaliEpochMidnight +
    (localMeanJD - SS_CHAPTER1_AHARGANA_ANCHOR.kaliEpochJulianDayAtPrimeMeridianMidnight);
}

export function chapter3AyanaFromPrimeMeridianJD(localMeanJD) {
  if (!Number.isFinite(localMeanJD)) {
    throw new TypeError("localMeanJD must be a finite Julian Day in prime-meridian local-mean time.");
  }

  const anchor = SS_CHAPTER1_AHARGANA_ANCHOR;
  const elapsedMeanDays = localMeanJD - anchor.kaliEpochJulianDayAtPrimeMeridianMidnight;
  const wholeElapsedDays = Math.floor(elapsedMeanDays);
  const fractionalDay = elapsedMeanDays - wholeElapsedDays;
  const wholeAhargana = BigInt(anchor.aharganaAtKaliEpochMidnight) + BigInt(wholeElapsedDays);
  const yugaDays = BigInt(anchor.yugaSavanaDays);
  const revolutions = BigInt(anchor.revolutionsPerYuga);

  // Keep the creation-era integer day count exact with BigInt. Crucially, do
  // not add the sub-day fraction to the ~714-billion ahargana Number first:
  // IEEE-754 spacing at that magnitude is about 0.000122 day (~10.5 s), which
  // would quantize the phase before the ayana calculation even starts.
  const scaledWholeDays = wholeAhargana * revolutions;
  let remainderInteger = scaledWholeDays % yugaDays;
  if (remainderInteger < 0n) remainderInteger += yugaDays;
  let completedRevolutions = (scaledWholeDays - remainderInteger) / yugaDays;
  let remainderDays = Number(remainderInteger) + fractionalDay * anchor.revolutionsPerYuga;
  if (remainderDays >= anchor.yugaSavanaDays) {
    completedRevolutions += 1n;
    remainderDays -= anchor.yugaSavanaDays;
  }

  const cycleFraction = remainderDays / anchor.yugaSavanaDays;
  const phaseDeg = cycleFraction * 360;
  const angle = ((phaseDeg % 360) + 360) % 360;
  let bhujaDeg;
  if (angle <= 90) bhujaDeg = angle;
  else if (angle <= 180) bhujaDeg = 180 - angle;
  else if (angle <= 270) bhujaDeg = angle - 180;
  else bhujaDeg = 360 - angle;

  return {
    localMeanJD,
    elapsedMeanDays,
    ahargana: Number(wholeAhargana) + fractionalDay,
    wholeAhargana: wholeAhargana.toString(),
    fractionalDay,
    completedRevolutions: completedRevolutions.toString(),
    remainderDays,
    cycleFraction,
    phaseDeg,
    bhujaDeg,
    ayanaMagnitudeDeg: 0.3 * bhujaDeg,
    circleMotion: phaseDeg < 180 ? "westward" : "eastward",
    magnitudeTrend: phaseDeg < 90 || (phaseDeg >= 180 && phaseDeg < 270)
      ? "increasing"
      : "decreasing",
    status: "research-only, source-anchored candidate; phase preserves sub-day precision with exact integer-day modulo, but epoch offset and time convention still require independent Chapter I verification"
  };
}

export function runChapter1AharganaAnchorTests() {
  const tests = [];
  const close = (actual, expected, tolerance = 1e-8) =>
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
  const a = SS_CHAPTER1_AHARGANA_ANCHOR;

  const utcAtUjjainMeanNoon = 2461322 - 75.768 / 360;
  const convertedUjjainNoon = chapter1PrimeMeridianMeanJDFromUtcJD(
    utcAtUjjainMeanNoon,
    75.768
  );
  tests.push({
    name: "UTC JD converts to prime-meridian local-mean JD using east longitude / 360 days",
    passed: close(convertedUjjainNoon, 2461322, 1e-10) &&
      close(chapter1PrimeMeridianMeanJDFromUtcJD(2461322, 0), 2461322, 1e-10) &&
      close(chapter1PrimeMeridianMeanJDFromUtcJD(2461322, 15), 2461322.0416666667, 1e-9) &&
      close(chapter1PrimeMeridianMeanJDFromUtcJD(2461322, -15), 2461321.9583333333, 1e-9)
  });

  let rejectedInvalidLongitude = false;
  try {
    chapter1PrimeMeridianMeanJDFromUtcJD(2461322, 181);
  } catch (error) {
    rejectedInvalidLongitude = error instanceof TypeError;
  }
  tests.push({
    name: "Invalid prime-meridian longitude is rejected",
    passed: rejectedInvalidLongitude
  });

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
  const fractionalProbeJD = a.referenceJulianDayAtPrimeMeridianMeanNoon + 0.1234567;
  const fractionalProbe = chapter3AyanaFromPrimeMeridianJD(fractionalProbeJD);
  const elapsedProbe = fractionalProbeJD - a.kaliEpochJulianDayAtPrimeMeridianMidnight;
  const probeWholeDays = Math.floor(elapsedProbe);
  const probeFraction = elapsedProbe - probeWholeDays;
  const probeWholeAhargana = BigInt(a.aharganaAtKaliEpochMidnight) + BigInt(probeWholeDays);
  let probeRemainder = Number(((probeWholeAhargana * BigInt(a.revolutionsPerYuga)) % BigInt(a.yugaSavanaDays) + BigInt(a.yugaSavanaDays)) % BigInt(a.yugaSavanaDays));
  probeRemainder += probeFraction * a.revolutionsPerYuga;
  if (probeRemainder >= a.yugaSavanaDays) probeRemainder -= a.yugaSavanaDays;
  tests.push({
    name: "Sub-day ayana phase preserves the fractional JD independently of the huge creation-era ahargana Number",
    passed: close(fractionalProbe.fractionalDay, probeFraction, 1e-10) &&
      close(fractionalProbe.remainderDays, probeRemainder, 1e-8) &&
      fractionalProbe.wholeAhargana === probeWholeAhargana.toString()
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
