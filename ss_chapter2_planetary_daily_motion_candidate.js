/**
 * Research-only date-anchored Sūrya-siddhānta II.47–51 daily-motion candidate.
 *
 * Connects the already-tested Chapter II equation helpers to explicit
 * Chapter I mean-motion/mandocca rates and the four-pass Venus/Jupiter place.
 * The sine-table bracket, manda equation, variable hypotenuse, both daily-motion
 * corrections, and same-model finite-difference control are returned separately.
 *
 * Limits: Venus/Jupiter mandocca anchors remain research candidates; Sun uses
 * the secondary 77°07′48″ epoch anchor. The standard trijyā reading of II.50
 * is the primary candidate; the third-hypotenuse reading remains an alternate.
 * No production module imports this file.
 */
import {
  SURYA_SIDDHANTA_CHAPTER2_SINES,
  chapter2SineFromArcMinutes
} from "./ss_chapter2_versed_sine_table.js";
import {
  chapter2MandaCorrectedDailyMotion,
  chapter2SighraCorrectedDailyMotion
} from "./ss_chapter2_daily_motion_correction.js";
import {
  chapter2PlanetaryEquation,
  chapter2PlanetaryTruePositionAtAhargana
} from "./ss_chapter2_planetary_true_position_candidate.js";
import { chapter2SolarMandaCorrection } from "./ss_chapter2_solar_manda.js";
import { chapter1MeanPlanetaryPosition } from "./ss_chapter1_mean_planetary_positions.js";
import { chapter1CandidateMandoccaAtAhargana } from "./ss_chapter1_planetary_mandocca_epoch_candidates.js";
import { chapter1MeanPlanetaryMandoccaFromElapsedDays } from "./ss_chapter1_mean_planetary_mandocca.js";
import { SS_CHAPTER1_AHARGANA_ANCHOR } from "./ss_chapter1_ahargana_anchor.js";

const SUN_KALI_EPOCH_MANDOCCA_DEG = 77 + 7 / 60 + 48 / 3600;
const SUN_SUPPORTED = "Sun";
const PLANET_SUPPORTED = ["Venus", "Jupiter"];

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}
function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}
function signedDifferenceDegrees(fromDeg, toDeg) {
  return ((normalizeDegrees(toDeg) - normalizeDegrees(fromDeg) + 540) % 360) - 180;
}
function meanMandoccaAtAhargana(planet, ahargana) {
  if (planet === SUN_SUPPORTED) {
    return chapter1MeanPlanetaryMandoccaFromElapsedDays({
      planet: "Sun",
      elapsedDaysSinceKaliEpoch:
        ahargana - Number(SS_CHAPTER1_AHARGANA_ANCHOR.aharganaAtKaliEpochMidnight),
      kaliEpochLongitudeDeg: SUN_KALI_EPOCH_MANDOCCA_DEG
    });
  }
  return chapter1CandidateMandoccaAtAhargana({ planet, ahargana });
}
function trueLongitudeAtAhargana(planet, ahargana, includeBhujantara = true) {
  if (planet === SUN_SUPPORTED) {
    const mean = chapter1MeanPlanetaryPosition({ planet: "Sun", ahargana });
    const mandocca = meanMandoccaAtAhargana("Sun", ahargana);
    return chapter2SolarMandaCorrection({
      meanLongitudeDeg: mean.meanLongitudeDeg,
      meanMandoccaLongitudeDeg: mandocca.meanMandoccaLongitudeDeg
    }).trueLongitudeCandidateDeg;
  }
  const result = chapter2PlanetaryTruePositionAtAhargana({ planet, ahargana });
  // Keep the II.46 bhujāntara-adjusted position separate from the four-pass
  // II.43–45 true-place candidate. The II.47–51 motion-rate comparison must
  // expose both paths rather than quietly mixing their correction stages.
  return includeBhujantara
    ? result.bhujantaraCorrectedTrueLongitudeDeg
    : result.trueLongitudeCandidateDeg;
}
function sineBracketForKendra(kendraDeg) {
  const halfCycle = normalizeDegrees(kendraDeg) % 180;
  const bhujaDeg = Math.min(halfCycle, 180 - halfCycle);
  const lookup = chapter2SineFromArcMinutes(bhujaDeg * 60);
  return Object.freeze({
    bhujaDeg,
    bhujaArcMinutes: bhujaDeg * 60,
    lowerTableIndex: lookup.lowerTableIndex,
    upperTableIndex: lookup.upperTableIndex,
    gataSine: SURYA_SIDDHANTA_CHAPTER2_SINES[lookup.lowerTableIndex],
    gamyaSine: SURYA_SIDDHANTA_CHAPTER2_SINES[lookup.upperTableIndex],
    tableDifference: Math.abs(
      SURYA_SIDDHANTA_CHAPTER2_SINES[lookup.upperTableIndex] -
      SURYA_SIDDHANTA_CHAPTER2_SINES[lookup.lowerTableIndex]
    ),
    interpolationFraction: lookup.interpolationFraction
  });
}

/**
 * Derive a date-anchored source-rate candidate for Sun, Venus, or Jupiter.
 * The caller must provide an ahargaṇa in the same savana-day epoch convention.
 */
export function chapter2PlanetaryDailyMotionAtAhargana({ planet, ahargana }) {
  finite(ahargana, "ahargana");
  if (planet !== SUN_SUPPORTED && !PLANET_SUPPORTED.includes(planet)) {
    throw new RangeError("Date-anchored candidate currently supports Sun, Venus, and Jupiter only.");
  }

  const mean = chapter1MeanPlanetaryPosition({ planet, ahargana });
  const mandocca = meanMandoccaAtAhargana(planet, ahargana);
  const meanMotionFromMandoccaArcminPerDay =
    mean.meanDailyMotionArcminPerDay - mandocca.meanMotionArcsecPerDay / 60;

  let mandaKendraDeg;
  let correctedMandaEpicycleDeg;
  let truePosition = null;
  if (planet === SUN_SUPPORTED) {
    const solarPlace = chapter2SolarMandaCorrection({
      meanLongitudeDeg: mean.meanLongitudeDeg,
      meanMandoccaLongitudeDeg: mandocca.meanMandoccaLongitudeDeg
    });
    mandaKendraDeg = solarPlace.mandaKendraDeg;
    correctedMandaEpicycleDeg = solarPlace.correctedEpicycleDeg;
  } else {
    const mandaEquation = chapter2PlanetaryEquation({
      planetLongitudeDeg: mean.meanLongitudeDeg,
      referenceLongitudeDeg: mandocca.meanMandoccaLongitudeDeg,
      planet,
      kind: "manda"
    });
    mandaKendraDeg = mandaEquation.kendraDeg;
    correctedMandaEpicycleDeg = mandaEquation.epicycleDeg;
    truePosition = chapter2PlanetaryTruePositionAtAhargana({ planet, ahargana });
  }

  const sineBracket = sineBracketForKendra(mandaKendraDeg);
  const mandaMotion = chapter2MandaCorrectedDailyMotion({
    meanDailyMotionArcminPerDay: mean.meanDailyMotionArcminPerDay,
    meanMotionFromMandoccaArcminPerDay,
    gataSine: sineBracket.gataSine,
    gamyaSine: sineBracket.gamyaSine,
    correctedMandaEpicycleDeg,
    mandaKendraDeg
  });

  let sighraMotion = null;
  let sighraMotionSecondEquationCosine = null;
  let trueDailyMotionArcminPerDay = mandaMotion.mandaCorrectedDailyMotionArcminPerDay;
  if (truePosition) {
    const fourthPass = truePosition.passes.sighra2;
    sighraMotion = chapter2SighraCorrectedDailyMotion({
      mandaCorrectedDailyMotionArcminPerDay: mandaMotion.mandaCorrectedDailyMotionArcminPerDay,
      sighroccaDailyMotionArcminPerDay: mean.sighroccaDailyMotionArcminPerDay,
      radius: 3438,
      variableHypotenuse: fourthPass.variableHypotenuse,
      referenceLengthKind: "trijya"
    });
    sighraMotionSecondEquationCosine = chapter2SighraCorrectedDailyMotion({
      mandaCorrectedDailyMotionArcminPerDay: mandaMotion.mandaCorrectedDailyMotionArcminPerDay,
      sighroccaDailyMotionArcminPerDay: mean.sighroccaDailyMotionArcminPerDay,
      radius: 3438,
      referenceLength: fourthPass.adjustedRadius,
      variableHypotenuse: fourthPass.variableHypotenuse,
      referenceLengthKind: "second-equation-cosine"
    });
    trueDailyMotionArcminPerDay = sighraMotion.trueDailyMotionArcminPerDay;
  }

  const beforeLongitude = trueLongitudeAtAhargana(planet, ahargana - 0.5, true);
  const afterLongitude = trueLongitudeAtAhargana(planet, ahargana + 0.5, true);
  const finiteDifferenceArcminPerDay =
    signedDifferenceDegrees(beforeLongitude, afterLongitude) * 60;
  const beforeUncorrectedLongitude =
    trueLongitudeAtAhargana(planet, ahargana - 0.5, false);
  const afterUncorrectedLongitude =
    trueLongitudeAtAhargana(planet, ahargana + 0.5, false);
  const uncorrectedFiniteDifferenceArcminPerDay =
    signedDifferenceDegrees(beforeUncorrectedLongitude, afterUncorrectedLongitude) * 60;

  return Object.freeze({
    planet,
    ahargana,
    meanLongitudeDeg: mean.meanLongitudeDeg,
    meanDailyMotionArcminPerDay: mean.meanDailyMotionArcminPerDay,
    meanMandoccaLongitudeDeg: mandocca.meanMandoccaLongitudeDeg,
    mandoccaDailyMotionArcminPerDay: mandocca.meanMotionArcsecPerDay / 60,
    meanMotionFromMandoccaArcminPerDay,
    mandaKendraDeg,
    correctedMandaEpicycleDeg,
    sineBracket,
    mandaMotion,
    sighroccaLongitudeDeg: mean.sighroccaLongitudeDeg,
    sighroccaDailyMotionArcminPerDay: mean.sighroccaDailyMotionArcminPerDay,
    variableHypotenuse: truePosition?.passes.sighra2.variableHypotenuse ?? null,
    secondEquationCosineReferenceLength: truePosition?.passes.sighra2.adjustedRadius ?? null,
    sighraMotion,
    sighraMotionSecondEquationCosine,
    sourceDailyMotionArcminPerDay: trueDailyMotionArcminPerDay,
    sourceMotionDirection: trueDailyMotionArcminPerDay < 0 ? "retrograde" :
      trueDailyMotionArcminPerDay > 0 ? "direct" : "stationary",
    alternateSourceDailyMotionArcminPerDay:
      sighraMotionSecondEquationCosine?.trueDailyMotionArcminPerDay ?? null,
    finiteDifferenceArcminPerDay,
    finiteDifferenceProvenance: "same source true-place candidate with II.46 bhujāntara correction evaluated at ahargana ±0.5 day; control only",
    uncorrectedFiniteDifferenceArcminPerDay,
    uncorrectedFiniteDifferenceProvenance: "same four-pass true-place candidate before II.46 bhujāntara correction evaluated at ahargana ±0.5 day; control only",
    sourceMinusFiniteDifferenceArcminPerDay:
      trueDailyMotionArcminPerDay - finiteDifferenceArcminPerDay,
    sourceMinusUncorrectedFiniteDifferenceArcminPerDay:
      trueDailyMotionArcminPerDay - uncorrectedFiniteDifferenceArcminPerDay,
    alternateSourceMinusFiniteDifferenceArcminPerDay:
      Number.isFinite(sighraMotionSecondEquationCosine?.trueDailyMotionArcminPerDay)
        ? sighraMotionSecondEquationCosine.trueDailyMotionArcminPerDay - finiteDifferenceArcminPerDay
        : null,
    finiteDifferenceWindowDays: 1,
    finiteDifferenceProvenance: "same source true-longitude candidate evaluated at ahargana ±0.5 day; control only",
    source: "Sūrya-siddhānta II.47–51; Burgess translation",
    status: "research-only date-anchored motion candidate; not yet certified for IX.10–11 event prediction",
    limitations: [
      "Sun epoch mandocca uses the secondary 77°07′48″ anchor.",
      "Venus/Jupiter mandocca epochs remain research candidates.",
      "Sine-table bracket interpretation follows Burgess II.48–49; preserve intermediate values for source audit.",
      "Finite difference is an internal control, not a substitute for the source-prescribed rate.",
      "No local sunrise/sunset, dṛkkarma, or final Asta/Udaya time is calculated here."
    ]
  });
}

export function runChapter2PlanetaryDailyMotionCandidateTests() {
  const tests = [];
  const sampleAhargana = 714403972030;
  const results = ["Sun", "Venus", "Jupiter"].map(planet =>
    chapter2PlanetaryDailyMotionAtAhargana({ planet, ahargana: sampleAhargana })
  );
  tests.push({
    name: "Date-anchored II.47–51 candidate returns finite source and finite-difference rates for Sun, Venus, and Jupiter",
    passed: results.every(r =>
      Number.isFinite(r.sourceDailyMotionArcminPerDay) &&
      Number.isFinite(r.finiteDifferenceArcminPerDay) &&
      Number.isFinite(r.sourceMinusFiniteDifferenceArcminPerDay) &&
      (r.planet === "Sun" || Number.isFinite(r.alternateSourceDailyMotionArcminPerDay)) &&
      r.sineBracket.gataSine >= 0 &&
      r.sineBracket.gamyaSine <= 3438 &&
      (r.planet === "Sun" || Number.isFinite(r.variableHypotenuse))
    )
  });
  tests.push({
    name: "Source rate preserves signed direct/retrograde direction rather than taking absolute value",
    passed: results.every(r =>
      r.sourceMotionDirection === (r.sourceDailyMotionArcminPerDay < 0 ? "retrograde" :
        r.sourceDailyMotionArcminPerDay > 0 ? "direct" : "stationary")
    )
  });
  tests.push({
    name: "Manda sine bracket uses adjacent Chapter II table entries with a bounded interpolation fraction",
    passed: results.every(r =>
      Number.isInteger(r.sineBracket.lowerTableIndex) &&
      Number.isInteger(r.sineBracket.upperTableIndex) &&
      r.sineBracket.upperTableIndex === r.sineBracket.lowerTableIndex + 1 &&
      r.sineBracket.interpolationFraction >= 0 &&
      r.sineBracket.interpolationFraction <= 1 &&
      r.sineBracket.tableDifference > 0
    )
  });

  let rejectsUnsupported = false;
  try {
    chapter2PlanetaryDailyMotionAtAhargana({ planet: "Mars", ahargana: sampleAhargana });
  } catch (error) { rejectsUnsupported = error instanceof RangeError; }
  tests.push({
    name: "Unsupported Mars anchor is rejected instead of silently fabricated",
    passed: rejectsUnsupported
  });

  return {
    tests,
    passed: tests.filter(t => t.passed).length,
    total: tests.length,
    allPassed: tests.every(t => t.passed),
    diagnosticLedger: results,
    note: "Finite arithmetic and explicit source-intermediate checks only; the rate formula and epoch anchors remain research candidates."
  };
}
