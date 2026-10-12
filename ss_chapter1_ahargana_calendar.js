/**
 * Source-derived Sūrya-siddhānta Chapter I.45–51 ahargana diagnostic.
 *
 * Inputs are traditional elapsed calendar quantities, not a Gregorian date:
 *   - elapsedSolarYearsSinceKritaEnd: whole solar years after the end of Kṛta
 *   - elapsedMonthsFromCaitraShukla: elapsed months in the current year
 *   - elapsedTithisInCurrentMonth: fractional tithi count elapsed in the current month
 *   - intercalaryMonthAdjustment: explicit commentary-led correction (-1, 0, +1)
 *
 * The caller must derive those inputs from a separately validated traditional
 * date. This helper does not convert civil dates to Hindu lunar calendar fields.
 */

export const SS_CHAPTER1_AHARGANA_CONSTANTS = Object.freeze({
  elapsedSolarYearsAtKritaEndFromCreation: 1953720000n,
  solarMonthsPerYear: 12n,
  tithisPerLunarMonth: 30n,
  intercalaryMonthsPerYuga: 1593336n,
  solarMonthsPerYuga: 51840000n,
  lunarTithisPerYuga: 1603000080n,
  omittedTithisPerYuga: 25082252n,
  savanaDaysPerYuga: 1577917828n
});

export function chapter1AharganaFromTraditionalDate({
  elapsedSolarYearsSinceKritaEnd,
  elapsedMonthsFromCaitraShukla,
  elapsedTithisInCurrentMonth,
  intercalaryMonthAdjustment = 0
}) {
  if (!Number.isSafeInteger(elapsedSolarYearsSinceKritaEnd) || elapsedSolarYearsSinceKritaEnd < 0) {
    throw new TypeError("elapsedSolarYearsSinceKritaEnd must be a non-negative safe integer.");
  }
  if (!Number.isSafeInteger(elapsedMonthsFromCaitraShukla) ||
      elapsedMonthsFromCaitraShukla < 0 || elapsedMonthsFromCaitraShukla > 13) {
    throw new TypeError("elapsedMonthsFromCaitraShukla must be an integer from 0 to 13.");
  }
  if (!Number.isFinite(elapsedTithisInCurrentMonth) ||
      elapsedTithisInCurrentMonth < 0 || elapsedTithisInCurrentMonth >= 30) {
    throw new TypeError("elapsedTithisInCurrentMonth must be in [0, 30).");
  }
  if (!Number.isInteger(intercalaryMonthAdjustment) ||
      ![-1, 0, 1].includes(intercalaryMonthAdjustment)) {
    throw new TypeError("intercalaryMonthAdjustment must be -1, 0, or 1.");
  }

  const c = SS_CHAPTER1_AHARGANA_CONSTANTS;
  const totalElapsedSolarYears =
    c.elapsedSolarYearsAtKritaEndFromCreation + BigInt(elapsedSolarYearsSinceKritaEnd);
  const elapsedSolarMonths =
    totalElapsedSolarYears * c.solarMonthsPerYear + BigInt(elapsedMonthsFromCaitraShukla);

  // I.49: integer quotient gives elapsed intercalary months. The commentary
  // permits an explicit ±1 correction when the actual adhika month is not
  // captured by the simple quotient or the quotient predicts a spurious one.
  const rawIntercalaryMonths =
    (elapsedSolarMonths * c.intercalaryMonthsPerYuga) / c.solarMonthsPerYuga;
  const intercalaryMonths = rawIntercalaryMonths + BigInt(intercalaryMonthAdjustment);
  if (intercalaryMonths < 0n) {
    throw new RangeError("Intercalary-month correction produced a negative count.");
  }

  const elapsedLunarMonths = elapsedSolarMonths + intercalaryMonths;
  const wholeElapsedTithis = Math.floor(elapsedTithisInCurrentMonth);
  const fractionalTithi = elapsedTithisInCurrentMonth - wholeElapsedTithis;
  const wholeLunarTithis =
    elapsedLunarMonths * c.tithisPerLunarMonth + BigInt(wholeElapsedTithis);

  // I.50: subtract complete omitted tithis. Use BigInt for the large integer
  // product; separately account for a fractional current tithi before flooring.
  const omittedNumerator = wholeLunarTithis * c.omittedTithisPerYuga;
  let omittedTithis = omittedNumerator / c.lunarTithisPerYuga;
  const omittedRemainder = omittedNumerator % c.lunarTithisPerYuga;
  const fractionalOmittedRemainder =
    Number(omittedRemainder) + fractionalTithi * Number(c.omittedTithisPerYuga);
  if (fractionalOmittedRemainder >= Number(c.lunarTithisPerYuga)) {
    omittedTithis += 1n;
  }

  const lunarTithisAsNumber = Number(wholeLunarTithis) + fractionalTithi;
  const ahargana = lunarTithisAsNumber - Number(omittedTithis);

  return {
    totalElapsedSolarYears: Number(totalElapsedSolarYears),
    elapsedSolarMonths: Number(elapsedSolarMonths),
    rawIntercalaryMonths: Number(rawIntercalaryMonths),
    intercalaryMonthAdjustment,
    intercalaryMonths: Number(intercalaryMonths),
    elapsedLunarMonths: Number(elapsedLunarMonths),
    elapsedLunarTithis: lunarTithisAsNumber,
    omittedTithis: Number(omittedTithis),
    ahargana,
    status: "Chapter I.45–51 calculation from supplied traditional date fields; civil-date conversion and input-calendar validation are outside this helper"
  };
}

export function runChapter1TraditionalAharganaTests() {
  const tests = [];
  const close = (actual, expected, tolerance = 1e-7) =>
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;

  // Synthetic arithmetic fixture using the source-ledger's scale. The 26.5
  // elapsed-tithi fraction is deliberately a test input, NOT yet an independently
  // verified reconstruction of the source page's exact fractional tithi/time.
  // The external ledger labels the date Bhādrapada Kṛṣṇa Trayodaśī and reports
  // 714404169483.5 at "apparent noon"; the exact input tithi fraction and the
  // midnight/noon convention still need a separate audit.
  const reference = chapter1AharganaFromTraditionalDate({
    elapsedSolarYearsSinceKritaEnd: 2165127,
    elapsedMonthsFromCaitraShukla: 5,
    elapsedTithisInCurrentMonth: 26.5,
    intercalaryMonthAdjustment: 0
  });

  tests.push({
    name: "Synthetic Chapter I.45–51 fixture verifies large-number quotient arithmetic to the expected reference-scale value",
    passed: close(reference.ahargana, 714404169483.5) &&
      reference.elapsedSolarMonths === 23470621529 &&
      reference.rawIntercalaryMonths === 721384765 &&
      reference.elapsedLunarMonths === 24192006294 &&
      reference.omittedTithis === 11356019363
  });

  // Independent historical benchmark reported by Sri Jagannāth Center:
  // 2 May 1827, Vaiśākha Śukla Ṣaṣṭhī, sṛṣṭyādi ahargana 714,404,096,641.
  // The exact match uses tithi-day label 6 as input, not a zero-based
  // elapsed-tithi fraction of 5. This validates integer arithmetic and
  // exposes an unresolved input/time convention; it does not validate the
  // fractional tithi for the modern apparent-noon reference.
  const historical1827 = chapter1AharganaFromTraditionalDate({
    elapsedSolarYearsSinceKritaEnd: 2164928,
    elapsedMonthsFromCaitraShukla: 1,
    elapsedTithisInCurrentMonth: 6,
    intercalaryMonthAdjustment: 0
  });
  tests.push({
    name: "Independent 1827 Vaiśākha Śukla Ṣaṣṭhī Ahargana benchmark reproduces 714404096641",
    passed: close(historical1827.ahargana, 714404096641)
  });

  tests.push({
    name: "Reference uses the source's 1,577,917,828 savana days and 1,603,000,080 lunar tithis per yuga",
    passed: SS_CHAPTER1_AHARGANA_CONSTANTS.savanaDaysPerYuga === 1577917828n &&
      SS_CHAPTER1_AHARGANA_CONSTANTS.lunarTithisPerYuga === 1603000080n &&
      SS_CHAPTER1_AHARGANA_CONSTANTS.omittedTithisPerYuga === 25082252n
  });

  const adjusted = chapter1AharganaFromTraditionalDate({
    elapsedSolarYearsSinceKritaEnd: 2165127,
    elapsedMonthsFromCaitraShukla: 5,
    elapsedTithisInCurrentMonth: 26.5,
    intercalaryMonthAdjustment: 1
  });
  tests.push({
    name: "Explicit adhika-month adjustment changes the lunar-month count by exactly one",
    passed: adjusted.intercalaryMonths === reference.intercalaryMonths + 1 &&
      adjusted.elapsedLunarMonths === reference.elapsedLunarMonths + 1 &&
      adjusted.ahargana > reference.ahargana
  });

  // The source ledger for 2026-10-08 labels the tithi Kṛṣṇa Trayodaśī.
  // A conventional ordinal reading suggests about 27.x elapsed tithis from
  // Caitra-śukla's month start, not 26.5. This diagnostic intentionally records
  // the one-day mismatch rather than treating the synthetic matching fixture
  // as proof that the source's exact tithi fraction has been reconstructed.
  const ordinalAlternative = chapter1AharganaFromTraditionalDate({
    elapsedSolarYearsSinceKritaEnd: 2165127,
    elapsedMonthsFromCaitraShukla: 5,
    elapsedTithisInCurrentMonth: 27.5,
    intercalaryMonthAdjustment: 0
  });
  tests.push({
    name: "27.5 elapsed-tithi alternative exposes a one-day offset from the published reference; input convention remains unresolved",
    passed: close(ordinalAlternative.ahargana, 714404169484.5) &&
      close(ordinalAlternative.ahargana - reference.ahargana, 1)
  });

  // Rounded true longitudes published for the same apparent-noon reference:
  // Sun Kanyā 20°10′, Moon Siṃha 21°14′. This derives a rough elongation and
  // tithi fraction at apparent noon, but is NOT silently used as the I.50
  // midnight input because the source's time boundary still needs resolution.
  const sunLongitudeDeg = 150 + 20 + 10 / 60;
  const moonLongitudeDeg = 120 + 21 + 14 / 60;
  const apparentNoonElongationDeg =
    ((moonLongitudeDeg - sunLongitudeDeg) % 360 + 360) % 360;
  const apparentNoonElapsedTithis = apparentNoonElongationDeg / 12;
  const apparentNoonAlternative = chapter1AharganaFromTraditionalDate({
    elapsedSolarYearsSinceKritaEnd: 2165127,
    elapsedMonthsFromCaitraShukla: 5,
    elapsedTithisInCurrentMonth: apparentNoonElapsedTithis,
    intercalaryMonthAdjustment: 0
  });
  tests.push({
    name: "Rounded source longitudes imply about 27.59 elapsed tithis at apparent noon; treating that as the I.50 input does not reproduce the displayed Ahargana",
    passed: close(apparentNoonElapsedTithis, 27.5888888889, 1e-8) &&
      close(apparentNoonAlternative.ahargana - reference.ahargana, 1.0888888889, 0.001)
  });

  let rejectedFraction = false;
  try {
    chapter1AharganaFromTraditionalDate({
      elapsedSolarYearsSinceKritaEnd: 2165127,
      elapsedMonthsFromCaitraShukla: 5,
      elapsedTithisInCurrentMonth: 30
    });
  } catch (error) {
    rejectedFraction = error instanceof TypeError;
  }
  tests.push({
    name: "Out-of-range tithi input is rejected",
    passed: rejectedFraction
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    reference,
    ordinalAlternative,
    apparentNoonAlternative: {
      sunLongitudeDeg,
      moonLongitudeDeg,
      elongationDeg: apparentNoonElongationDeg,
      elapsedTithis: apparentNoonElapsedTithis,
      ahargana: apparentNoonAlternative.ahargana
    },
    note: "The algorithm follows Chapter I.45–51 arithmetic, but the 26.5-tithi fixture is synthetic. Rounded source longitudes imply about 27.59 elapsed tithis at apparent noon; treating that as the I.50 input gives an Ahargana about 1.089 days above the displayed reference. Since I.50 specifies Lanka midnight, this is a time-boundary/input mismatch to resolve, not proof that either value is correct. Civil-date conversion and the ±1 adhika-month decision also remain open."
  };
}
