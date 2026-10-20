/**
 * Research-only Sūrya-siddhānta Chapter I mean-longitude / śīghrocca layer.
 *
 * This extends the existing Sun-only mean-longitude helper to the planet
 * revolution counts in I.29–34. It returns MEAN phases only: no mandocca
 * equation, śīghra equation, dṛkkarma, local horizon, or Asta/Udaya event.
 *
 * Source count convention:
 * - Sun, Mercury's mean place, Venus's mean place, and the outer-planet
 *   śīghrocca use 4,320,000 revolutions per yuga.
 * - Mercury śīghrocca: 17,937,060; Venus śīghrocca: 7,022,376.
 * - Mars mean: 2,296,832; Jupiter mean: 364,220; Saturn mean: 146,568.
 * - The Kali-epoch zero-phase convention is the Sūrya-siddhānta column
 *   summarized in S. Rao, Indian Astronomy: A Primer, Table A4.3. It is a
 *   mean-phase convention, NOT a claim that true longitudes were all zero.
 *
 * The epoch ahargana is imported from the existing research anchor rather
 * than duplicated. Outputs are in the classical sphere's mean-longitude
 * convention and are not directly comparable to modern tropical coordinates.
 *
 * References:
 * - Sūrya-siddhānta I.29–34: https://www.swaveda.com/texts/surya-siddhanta/1/
 * - Chapter I computed verse ledger: https://www.vidhyamitra.com/surya-siddhanta/1
 * - S. Rao, Indian Astronomy: A Primer, Table A4.3 (Kali-epoch mean positions).
 */

import { SS_CHAPTER1_AHARGANA_ANCHOR } from "./ss_chapter1_ahargana_anchor.js";
import { chapter1MeanSolarLongitudeFromAhargana } from "./ss_chapter1_mean_solar_longitude.js";

const YUGA_DAYS = SS_CHAPTER1_AHARGANA_ANCHOR.yugaSavanaDays;
const KALI_EPOCH_AHARGANA = SS_CHAPTER1_AHARGANA_ANCHOR.aharganaAtKaliEpochMidnight;

export const SS_MEAN_PLANETARY_REVOLUTIONS = Object.freeze({
  Sun: Object.freeze({ mean: 4320000, sighrocca: null }),
  Mercury: Object.freeze({ mean: 4320000, sighrocca: 17937060 }),
  Venus: Object.freeze({ mean: 4320000, sighrocca: 7022376 }),
  Mars: Object.freeze({ mean: 2296832, sighrocca: 4320000 }),
  Jupiter: Object.freeze({ mean: 364220, sighrocca: 4320000 }),
  Saturn: Object.freeze({ mean: 146568, sighrocca: 4320000 })
});

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function longitudeFromRevolutions(ahargana, revolutionsPerYuga) {
  if (!Number.isFinite(ahargana) || ahargana < 0) {
    throw new TypeError("ahargana must be a finite non-negative creation-era day count.");
  }
  if (!Number.isSafeInteger(Math.floor(ahargana))) {
    throw new RangeError("Whole-day ahargana must be a safe integer.");
  }
  if (!Number.isSafeInteger(revolutionsPerYuga) || revolutionsPerYuga <= 0) {
    throw new TypeError("revolutionsPerYuga must be a positive safe integer.");
  }

  const wholeDays = Math.floor(ahargana);
  const fractionalDay = ahargana - wholeDays;
  const numerator = (
    (BigInt(wholeDays) * BigInt(revolutionsPerYuga)) % BigInt(YUGA_DAYS)
  );
  const remainder = Number(numerator) + fractionalDay * revolutionsPerYuga;
  return normalizeDegrees((remainder / YUGA_DAYS) * 360);
}

function dailyMotionArcminPerDay(revolutionsPerYuga) {
  return revolutionsPerYuga * 360 * 60 / YUGA_DAYS;
}

/**
 * Return one planet's source-ratio mean longitude and śīghrocca.
 * ahargana is the fractional creation-era civil-day count used by the
 * existing research bridge; do not pass a Julian Day or elapsed-Kali-day
 * value directly.
 */
export function chapter1MeanPlanetaryPosition({ planet, ahargana }) {
  const constants = SS_MEAN_PLANETARY_REVOLUTIONS[planet];
  if (!constants) {
    throw new RangeError("Unsupported planet; choose Sun, Mercury, Venus, Mars, Jupiter, or Saturn.");
  }
  if (!Number.isFinite(ahargana) || ahargana < 0) {
    throw new TypeError("ahargana must be a finite non-negative creation-era day count.");
  }

  const meanLongitudeDeg = longitudeFromRevolutions(ahargana, constants.mean);
  const sighroccaLongitudeDeg = constants.sighrocca === null
    ? null
    : longitudeFromRevolutions(ahargana, constants.sighrocca);

  return Object.freeze({
    planet,
    ahargana,
    kaliEpochAhargana: KALI_EPOCH_AHARGANA,
    meanRevolutionsPerYuga: constants.mean,
    meanLongitudeDeg,
    meanDailyMotionArcminPerDay: dailyMotionArcminPerDay(constants.mean),
    sighroccaRevolutionsPerYuga: constants.sighrocca,
    sighroccaLongitudeDeg,
    sighroccaDailyMotionArcminPerDay: constants.sighrocca === null
      ? null
      : dailyMotionArcminPerDay(constants.sighrocca),
    source: "Sūrya-siddhānta I.29–34 revolution ratios; Kali-epoch mean-phase convention",
    status: "research-only mean positions; not true longitudes and not an Asta/Udaya prediction"
  });
}

export function chapter1MeanPlanetaryPositions({ ahargana }) {
  if (!Number.isFinite(ahargana) || ahargana < 0) {
    throw new TypeError("ahargana must be a finite non-negative creation-era day count.");
  }
  return Object.freeze(Object.keys(SS_MEAN_PLANETARY_REVOLUTIONS).map(planet =>
    chapter1MeanPlanetaryPosition({ planet, ahargana })
  ));
}

export function runChapter1MeanPlanetaryPositionTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-9) =>
    Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
  const epoch = Number(KALI_EPOCH_AHARGANA);
  const atEpoch = chapter1MeanPlanetaryPositions({ ahargana: epoch });

  tests.push({
    name: "All declared mean longitudes and śīghrocca phases are zero at the declared Kali-epoch ahargana",
    passed: atEpoch.every(item =>
      close(item.meanLongitudeDeg, 0) &&
      (item.sighroccaLongitudeDeg === null || close(item.sighroccaLongitudeDeg, 0))
    )
  });

  const referenceAhargana = 714404169486.5;
  const sun = chapter1MeanPlanetaryPosition({ planet: "Sun", ahargana: referenceAhargana });
  const solarHelper = chapter1MeanSolarLongitudeFromAhargana(referenceAhargana);
  tests.push({
    name: "Generic Sun phase exactly agrees with the existing Chapter I solar-only helper",
    passed: close(sun.meanLongitudeDeg, solarHelper.meanLongitudeDeg, 1e-10)
  });

  const mercury = chapter1MeanPlanetaryPosition({ planet: "Mercury", ahargana: referenceAhargana });
  const venus = chapter1MeanPlanetaryPosition({ planet: "Venus", ahargana: referenceAhargana });
  tests.push({
    name: "Mercury and Venus mean-place phases follow the source's solar revolution count",
    passed: close(mercury.meanLongitudeDeg, sun.meanLongitudeDeg, 1e-10) &&
      close(venus.meanLongitudeDeg, sun.meanLongitudeDeg, 1e-10)
  });

  const jupiter = chapter1MeanPlanetaryPosition({ planet: "Jupiter", ahargana: referenceAhargana });
  const mars = chapter1MeanPlanetaryPosition({ planet: "Mars", ahargana: referenceAhargana });
  const saturn = chapter1MeanPlanetaryPosition({ planet: "Saturn", ahargana: referenceAhargana });
  tests.push({
    name: "Outer-planet mean daily motions follow the Chapter I revolution counts",
    passed: close(mars.meanDailyMotionArcminPerDay, 2296832 * 21600 / YUGA_DAYS) &&
      close(jupiter.meanDailyMotionArcminPerDay, 364220 * 21600 / YUGA_DAYS) &&
      close(saturn.meanDailyMotionArcminPerDay, 146568 * 21600 / YUGA_DAYS)
  });

  tests.push({
    name: "Inner-planet śīghrocca rates use their own Chapter I counts; outer śīghrocca follows the Sun",
    passed: close(mercury.sighroccaDailyMotionArcminPerDay, 17937060 * 21600 / YUGA_DAYS) &&
      close(venus.sighroccaDailyMotionArcminPerDay, 7022376 * 21600 / YUGA_DAYS) &&
      close(jupiter.sighroccaLongitudeDeg, sun.meanLongitudeDeg, 1e-10) &&
      close(saturn.sighroccaLongitudeDeg, sun.meanLongitudeDeg, 1e-10)
  });

  const halfDay = chapter1MeanPlanetaryPosition({ planet: "Jupiter", ahargana: referenceAhargana + 0.5 });
  const expectedHalfDayAdvance = 0.5 * 364220 * 360 / YUGA_DAYS;
  const actualHalfDayAdvance =
    (halfDay.meanLongitudeDeg - jupiter.meanLongitudeDeg + 360) % 360;
  tests.push({
    name: "Fractional-day phase is preserved without converting the huge Ahargana to a floating-point product",
    passed: close(actualHalfDayAdvance, expectedHalfDayAdvance, 1e-8)
  });

  tests.push({
    name: "Mean and śīghrocca longitudes remain normalized across large, fractional, and pre-epoch inputs",
    passed: [epoch - 0.25, epoch, referenceAhargana, referenceAhargana + 0.75].every(ahargana =>
      chapter1MeanPlanetaryPositions({ ahargana }).every(item =>
        item.meanLongitudeDeg >= 0 && item.meanLongitudeDeg < 360 &&
        (item.sighroccaLongitudeDeg === null ||
          (item.sighroccaLongitudeDeg >= 0 && item.sighroccaLongitudeDeg < 360))
      )
    )
  });

  let rejectedPlanet = false;
  try {
    chapter1MeanPlanetaryPosition({ planet: "Pluto", ahargana: referenceAhargana });
  } catch (error) {
    rejectedPlanet = error instanceof RangeError;
  }
  let rejectedTime = false;
  try {
    chapter1MeanPlanetaryPosition({ planet: "Venus", ahargana: Number.NaN });
  } catch (error) {
    rejectedTime = error instanceof TypeError;
  }
  tests.push({
    name: "Unknown planet and invalid ahargana are rejected",
    passed: rejectedPlanet && rejectedTime
  });

  // Published rounded source-model control: Vidhyamitra reports the mean Sun
  // at Kanyā 25°17′ for the 2026-10-11 apparent-noon ledger. This is a model
  // cross-check only; the source time/meridian convention is not an exact
  // same-instant match and this does not certify the epoch bridge.
  const expectedMeanSun = 150 + 25 + 17 / 60;
  const differenceArcmin = Math.abs(
    ((sun.meanLongitudeDeg - expectedMeanSun + 540) % 360) - 180
  ) * 60;
  tests.push({
    name: "2026-10-11 mean Sun remains within 1 arcminute of the rounded external source-model control",
    passed: differenceArcmin <= 1
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Arithmetic/source-ratio tests only. Mean planetary positions and śīghrocca are not true places; apsis anchors, Chapter II corrections, and civil-date/event validation remain separate gates."
  };
}
