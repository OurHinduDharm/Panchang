/**
 * Research-only civil-instant / Lanka-midnight epoch bridge.
 *
 * This is deliberately separate from the traditional I.45–51 calendar
 * arithmetic. It maps an instant expressed as standard UTC Julian Day into
 * local-mean-time coordinates at a configurable reference meridian, then
 * reports the elapsed day and fractional day from the midnight epoch.
 *
 * The default longitude (75.768° E) is a modern Ujjayinī/Avanti reference
 * choice for diagnostics, not a longitude prescribed by the Sanskrit text.
 * No production Panchāṅga code imports this module.
 */

export const SS_CHAPTER1_EPOCH_BRIDGE = Object.freeze({
  epochLocalMeanJD: 588465.5,
  epochAharganaAnchor: 714402296627,
  epochWeekdaySundayZero: 5, // Friday, independently checked from Julian day number
  defaultPrimeMeridianLongitudeDegEast: 75.768,
  weekdayNames: Object.freeze([
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ]),
  status: "research-only civil-time boundary adapter; not a reconstruction of I.45–51"
});

/** Convert a valid JavaScript Date or ISO timestamp into standard UTC JD. */
export function chapter1UtcJulianDay(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const milliseconds = date.getTime();
  if (!Number.isFinite(milliseconds)) {
    throw new TypeError("dateLike must be a valid Date or ISO timestamp.");
  }
  return milliseconds / 86400000 + 2440587.5;
}

/** Express standard UTC JD in local mean solar time at an east-positive meridian. */
export function chapter1LocalMeanJDFromUtcJD(
  utcJD,
  longitudeDegEast = SS_CHAPTER1_EPOCH_BRIDGE.defaultPrimeMeridianLongitudeDegEast
) {
  if (!Number.isFinite(utcJD)) {
    throw new TypeError("utcJD must be a finite standard Julian Day in UT.");
  }
  if (!Number.isFinite(longitudeDegEast) || longitudeDegEast < -180 || longitudeDegEast > 180) {
    throw new TypeError("longitudeDegEast must be in [-180, 180].");
  }
  return utcJD + longitudeDegEast / 360;
}

/**
 * Map an instant to the midnight-based day index and fractional day.
 * dayIndex 0 is the epoch day; fractionalDay is in [0, 1).
 */
export function chapter1EpochBridgeFromUtcJD(
  utcJD,
  longitudeDegEast = SS_CHAPTER1_EPOCH_BRIDGE.defaultPrimeMeridianLongitudeDegEast
) {
  const localMeanJD = chapter1LocalMeanJDFromUtcJD(utcJD, longitudeDegEast);
  const elapsedMeanDays = localMeanJD - SS_CHAPTER1_EPOCH_BRIDGE.epochLocalMeanJD;
  const dayIndex = Math.floor(elapsedMeanDays);
  const fractionalDay = elapsedMeanDays - dayIndex;
  const weekdayIndex = (
    SS_CHAPTER1_EPOCH_BRIDGE.epochWeekdaySundayZero + dayIndex % 7 + 7
  ) % 7;

  return {
    utcJD,
    longitudeDegEast,
    localMeanJD,
    elapsedMeanDays,
    dayIndex,
    fractionalDay,
    aharganaFromEpochAnchor: SS_CHAPTER1_EPOCH_BRIDGE.epochAharganaAnchor + elapsedMeanDays,
    weekdayIndex,
    weekday: SS_CHAPTER1_EPOCH_BRIDGE.weekdayNames[weekdayIndex],
    utcJDAtCurrentMeanMidnight:
      SS_CHAPTER1_EPOCH_BRIDGE.epochLocalMeanJD - longitudeDegEast / 360 + dayIndex,
    status: SS_CHAPTER1_EPOCH_BRIDGE.status
  };
}

export function runChapter1EpochBridgeTests() {
  const tests = [];
  const close = (actual, expected, tolerance = 1e-8) =>
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
  const epoch = SS_CHAPTER1_EPOCH_BRIDGE;
  const longitude = epoch.defaultPrimeMeridianLongitudeDegEast;
  const epochUtcJD = epoch.epochLocalMeanJD - longitude / 360;

  const atEpoch = chapter1EpochBridgeFromUtcJD(epochUtcJD, longitude);
  tests.push({
    name: "Epoch instant maps to local-mean JD 588465.5, day index 0, fraction 0",
    passed: close(atEpoch.localMeanJD, 588465.5) &&
      atEpoch.dayIndex === 0 && close(atEpoch.fractionalDay, 0)
  });
  tests.push({
    name: "Epoch weekday independently follows the Julian-day-number convention: Friday",
    passed: ((Math.floor(epochUtcJD + longitude / 360 + 0.5) + 1) % 7) === 5 &&
      atEpoch.weekday === "Friday"
  });
  tests.push({
    name: "One full local-mean day advances the day index and weekday by one",
    passed: (() => {
      const next = chapter1EpochBridgeFromUtcJD(epochUtcJD + 1, longitude);
      return next.dayIndex === 1 && close(next.fractionalDay, 0) &&
        next.weekday === "Saturday" &&
        close(next.aharganaFromEpochAnchor, epoch.epochAharganaAnchor + 1);
    })()
  });
  tests.push({
    name: "Half a local-mean day returns fraction 0.5 without changing the day label",
    passed: (() => {
      const noon = chapter1EpochBridgeFromUtcJD(epochUtcJD + 0.5, longitude);
      return noon.dayIndex === 0 && close(noon.fractionalDay, 0.5) &&
        close(noon.aharganaFromEpochAnchor, epoch.epochAharganaAnchor + 0.5);
    })()
  });

  // 2026-10-08 mean noon in local-mean coordinates is JD 2461322. This fixture
  // checks the bridge against the existing anchor arithmetic, not an independent
  // validation of the published tithi fraction or the apparent-noon wording.
  const referenceLocalMeanJD = 2461322;
  const referenceUtcJD = referenceLocalMeanJD - longitude / 360;
  const reference = chapter1EpochBridgeFromUtcJD(referenceUtcJD, longitude);
  tests.push({
    name: "2026-10-08 reference-coordinate fixture yields day index 1872856 and fraction 0.5",
    passed: reference.dayIndex === 1872856 && close(reference.fractionalDay, 0.5) &&
      close(reference.aharganaFromEpochAnchor, 714404169483.5)
  });

  let rejectedInvalidDate = false;
  try {
    chapter1UtcJulianDay("not-a-date");
  } catch (error) {
    rejectedInvalidDate = error instanceof TypeError;
  }
  tests.push({
    name: "Invalid civil timestamp is rejected",
    passed: rejectedInvalidDate
  });

  let rejectedInvalidLongitude = false;
  try {
    chapter1EpochBridgeFromUtcJD(2461322, 181);
  } catch (error) {
    rejectedInvalidLongitude = error instanceof TypeError;
  }
  tests.push({
    name: "Invalid reference-meridian longitude is rejected",
    passed: rejectedInvalidLongitude
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "These tests verify UTC-JD conversion, local-mean boundary arithmetic, epoch weekday, and continuity only. The modern reference fixture is anchored to an existing ledger value; it does not independently validate the I.45–51 tithi input or apparent-noon convention."
  };
}
