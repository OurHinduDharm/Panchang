/**
 * Research-only Sūrya-siddhānta Chapter II planetary true-longitude candidate.
 *
 * Uses source epicycle constants from II.34–40, the source sine table, the
 * reconstructed Venus/Jupiter mandocca anchors, and the source-ratio mean
 * longitude / śīghrocca layer. Implements Burgess's commentary-based four-pass
 * sequence for II.43–45:
 *   1. half śīghra equation from the mean position;
 *   2. half manda equation from the once-corrected position;
 *   3. full manda equation recalculated from that result and applied to mean;
 *   4. full śīghra equation recalculated from the manda-corrected position.
 *
 * This is a candidate reconstruction, not production code. The Venus/Jupiter
 * apsis frame depends on the documented secondary solar anchor; the historical
 * model control verifies inputs more directly than it verifies true longitude.
 */

import {
  SURYA_SIDDHANTA_RADIUS,
  chapter2SineFromArcMinutes,
  chapter2ArcMinutesFromSine
} from "./ss_chapter2_versed_sine_table.js";
import { chapter1MeanPlanetaryPosition } from "./ss_chapter1_mean_planetary_positions.js";
import { chapter1CandidateMandoccaAtAhargana, chapter1PlanetaryMandoccaEpochCandidates } from "./ss_chapter1_planetary_mandocca_epoch_candidates.js";
import { chapter1MeanPlanetaryMandoccaFromElapsedDays } from "./ss_chapter1_mean_planetary_mandocca.js";
import { SS_CHAPTER1_AHARGANA_ANCHOR } from "./ss_chapter1_ahargana_anchor.js";
import { chapter1UtcJulianDay, chapter1EpochBridgeFromUtcJD } from "./ss_chapter1_epoch_bridge.js";

export const SS_PLANETARY_EPICYCLE_CONSTANTS = Object.freeze({
  Sun: Object.freeze({ mandaEven: 840, mandaOdd: 820, sighraEven: null, sighraOdd: null }),
  Mars: Object.freeze({ mandaEven: 75, mandaOdd: 72, sighraEven: 235, sighraOdd: 232 }),
  Mercury: Object.freeze({ mandaEven: 30, mandaOdd: 28, sighraEven: 133, sighraOdd: 132 }),
  Jupiter: Object.freeze({ mandaEven: 33, mandaOdd: 32, sighraEven: 70, sighraOdd: 72 }),
  Venus: Object.freeze({ mandaEven: 12, mandaOdd: 11, sighraEven: 262, sighraOdd: 260 }),
  Saturn: Object.freeze({ mandaEven: 49, mandaOdd: 48, sighraEven: 39, sighraOdd: 40 })
});

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function sineMagnitudeForDegrees(degrees) {
  const normalized = normalizeDegrees(degrees);
  const halfCyclePosition = normalized % 180;
  const reducedArcMinutes = Math.min(halfCyclePosition, 180 - halfCyclePosition) * 60;
  return chapter2SineFromArcMinutes(reducedArcMinutes).sine;
}

function arcDegreesFromSine(sine) {
  const result = chapter2ArcMinutesFromSine(sine);
  return result.arcMinutes / 60;
}

function correctedEpicycle(even, odd, kendraBhujaSine) {
  return even + (odd - even) * kendraBhujaSine / SURYA_SIDDHANTA_RADIUS;
}

/**
 * Compute one source-table manda or sighra equation at an explicit position.
 * Kendra is reckoned forward from the planet to the apsis/conjunction.
 */
export function chapter2PlanetaryEquation({ planetLongitudeDeg, referenceLongitudeDeg, planet, kind }) {
  finite(planetLongitudeDeg, "planetLongitudeDeg");
  finite(referenceLongitudeDeg, "referenceLongitudeDeg");
  if (kind !== "manda" && kind !== "sighra") {
    throw new TypeError('kind must be "manda" or "sighra".');
  }
  const constants = SS_PLANETARY_EPICYCLE_CONSTANTS[planet];
  if (!constants) throw new RangeError("Unsupported planet for the Chapter II planetary equation.");
  if (planet === "Sun" && kind !== "manda") {
    throw new RangeError("The Sun has a single manda equation; no planetary sighra equation is defined here.");
  }

  const kendraDeg = normalizeDegrees(referenceLongitudeDeg - planetLongitudeDeg);
  const bhujaSine = sineMagnitudeForDegrees(kendraDeg);
  const kotiSine = sineMagnitudeForDegrees(kendraDeg + 90);
  const even = kind === "manda" ? constants.mandaEven : constants.sighraEven;
  const odd = kind === "manda" ? constants.mandaOdd : constants.sighraOdd;
  const epicycleDeg = correctedEpicycle(even, odd, bhujaSine);
  const bhujaPhala = epicycleDeg * bhujaSine / 360;
  const kotiPhala = epicycleDeg * kotiSine / 360;
  const positionCorrectionSign = kendraDeg < 180 ? 1 : -1;

  if (kind === "manda") {
    const equationDeg = arcDegreesFromSine(bhujaPhala);
    return Object.freeze({
      planet, kind, kendraDeg, bhujaSine, kotiSine, epicycleDeg,
      bhujaPhala, kotiPhala, equationDeg, positionCorrectionSign,
      source: "Sūrya-siddhānta II.34–39, II.45; Burgess translation",
      status: "research-only planetary manda equation"
    });
  }

  // II.40: add koti-phala to radius from Capricorn through Pisces and Aries;
  // subtract it from radius from Cancer through Virgo.
  const addKotiToRadius = kendraDeg >= 270 || kendraDeg < 90;
  const adjustedRadius = SURYA_SIDDHANTA_RADIUS +
    (addKotiToRadius ? kotiPhala : -kotiPhala);
  const variableHypotenuse = Math.sqrt(adjustedRadius ** 2 + bhujaPhala ** 2);
  const sighraBhujaPhala = SURYA_SIDDHANTA_RADIUS * bhujaPhala / variableHypotenuse;
  const equationDeg = arcDegreesFromSine(sighraBhujaPhala);

  return Object.freeze({
    planet, kind, kendraDeg, bhujaSine, kotiSine, epicycleDeg,
    bhujaPhala, kotiPhala, addKotiToRadius, adjustedRadius,
    variableHypotenuse, sighraBhujaPhala, equationDeg, positionCorrectionSign,
    source: "Sūrya-siddhānta II.36–42, II.45; Burgess translation",
    status: "research-only planetary sighra equation; radius/cosine commentary variant remains a separate audit item"
  });
}

/** Four-pass planetary true-longitude candidate using explicit mean inputs. */
export function chapter2PlanetaryTrueLongitudeCandidate({
  planet, meanLongitudeDeg, mandoccaLongitudeDeg, sighroccaLongitudeDeg
}) {
  if (!["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(planet)) {
    throw new RangeError("Supported bodies: Mars, Mercury, Jupiter, Venus, Saturn.");
  }
  for (const [name, value] of Object.entries({
    meanLongitudeDeg, mandoccaLongitudeDeg, sighroccaLongitudeDeg
  })) finite(value, name);

  const mean = normalizeDegrees(meanLongitudeDeg);
  const mandocca = normalizeDegrees(mandoccaLongitudeDeg);
  const sighrocca = normalizeDegrees(sighroccaLongitudeDeg);

  const sighra1 = chapter2PlanetaryEquation({
    planetLongitudeDeg: mean, referenceLongitudeDeg: sighrocca, planet, kind: "sighra"
  });
  const afterHalfSighra = normalizeDegrees(mean + sighra1.positionCorrectionSign * sighra1.equationDeg / 2);

  const manda1 = chapter2PlanetaryEquation({
    planetLongitudeDeg: afterHalfSighra, referenceLongitudeDeg: mandocca, planet, kind: "manda"
  });
  const afterHalfManda = normalizeDegrees(
    afterHalfSighra + manda1.positionCorrectionSign * manda1.equationDeg / 2
  );

  const manda2 = chapter2PlanetaryEquation({
    planetLongitudeDeg: afterHalfManda, referenceLongitudeDeg: mandocca, planet, kind: "manda"
  });
  const afterFullManda = normalizeDegrees(
    mean + manda2.positionCorrectionSign * manda2.equationDeg
  );

  const sighra2 = chapter2PlanetaryEquation({
    planetLongitudeDeg: afterFullManda, referenceLongitudeDeg: sighrocca, planet, kind: "sighra"
  });
  const trueLongitudeCandidateDeg = normalizeDegrees(
    afterFullManda + sighra2.positionCorrectionSign * sighra2.equationDeg
  );

  return Object.freeze({
    planet,
    meanLongitudeDeg: mean,
    mandoccaLongitudeDeg: mandocca,
    sighroccaLongitudeDeg: sighrocca,
    passes: Object.freeze({
      sighra1,
      afterHalfSighra,
      manda1,
      afterHalfManda,
      manda2,
      afterFullManda,
      sighra2
    }),
    trueLongitudeCandidateDeg,
    source: "Sūrya-siddhānta II.34–45; four-pass order from Burgess commentary",
    status: "research-only true-longitude candidate; not yet certified for Chapter IX event prediction"
  });
}

/** Resolve all source-derived inputs for Venus/Jupiter at an explicit ahargana. */
export function chapter2PlanetaryTruePositionAtAhargana({ planet, ahargana }) {
  if (planet !== "Venus" && planet !== "Jupiter") {
    throw new RangeError("Epoch-anchor reconstruction currently supports Venus and Jupiter only.");
  }
  finite(ahargana, "ahargana");
  const mean = chapter1MeanPlanetaryPosition({ planet, ahargana });
  const mandocca = chapter1CandidateMandoccaAtAhargana({ planet, ahargana });
  const result = chapter2PlanetaryTrueLongitudeCandidate({
    planet,
    meanLongitudeDeg: mean.meanLongitudeDeg,
    mandoccaLongitudeDeg: mandocca.meanMandoccaLongitudeDeg,
    sighroccaLongitudeDeg: mean.sighroccaLongitudeDeg
  });

  // II.46: the planet's true place at true midnight at Lanka receives the
  // Sun's first-equation (bhujaphala) time correction. This is distinct from
  // the later local Udayantara/Desantara/Chara corrections.
  const kaliEpochAhargana = Number(SS_CHAPTER1_AHARGANA_ANCHOR.aharganaAtKaliEpochMidnight);
  const sunMandocca = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet: "Sun",
    elapsedDaysSinceKaliEpoch: ahargana - kaliEpochAhargana,
    kaliEpochLongitudeDeg: 77 + 7 / 60 + 48 / 3600
  });
  const sunEquation = chapter2PlanetaryEquation({
    planetLongitudeDeg: mean.meanLongitudeDeg,
    referenceLongitudeDeg: sunMandocca.meanMandoccaLongitudeDeg,
    planet: "Sun",
    kind: "manda"
  });
  const bhujantaraCorrectionArcmin =
    mean.meanDailyMotionArcminPerDay * sunEquation.bhujaPhala / 21600;
  const bhujantaraCorrectionDeg =
    sunEquation.positionCorrectionSign * bhujantaraCorrectionArcmin / 60;
  const bhujantaraCorrectedTrueLongitudeDeg =
    normalizeDegrees(result.trueLongitudeCandidateDeg + bhujantaraCorrectionDeg);

  return Object.freeze({
    ...result,
    ahargana,
    meanDailyMotionArcminPerDay: mean.meanDailyMotionArcminPerDay,
    sighroccaDailyMotionArcminPerDay: mean.sighroccaDailyMotionArcminPerDay,
    sunMandoccaLongitudeDeg: sunMandocca.meanMandoccaLongitudeDeg,
    sunMandaEquation: sunEquation,
    bhujantaraCorrectionArcmin,
    bhujantaraCorrectionDeg,
    bhujantaraCorrectedTrueLongitudeDeg,
    mandoccaProvenance: mandocca.candidateProvenance,
    inputStatus: "mean and sighrocca from source revolution ratios; Venus/Jupiter mandocca from the documented research reconstruction; Sun mandocca uses the explicit secondary 77°07′48″ anchor",
    bhujantaraStatus: "research implementation of Sūrya-siddhānta II.46; not a local horizon correction"
  });
}

export function runChapter2PlanetaryTruePositionTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-8) =>
    Number.isFinite(a) && Math.abs(a - b) <= tolerance;

  tests.push({
    name: "II.35–37 source epicycle constants are explicit for all five planets",
    passed: SS_PLANETARY_EPICYCLE_CONSTANTS.Mars.mandaEven === 75 &&
      SS_PLANETARY_EPICYCLE_CONSTANTS.Venus.mandaOdd === 11 &&
      SS_PLANETARY_EPICYCLE_CONSTANTS.Jupiter.sighraEven === 70 &&
      SS_PLANETARY_EPICYCLE_CONSTANTS.Jupiter.sighraOdd === 72 &&
      SS_PLANETARY_EPICYCLE_CONSTANTS.Mercury.sighraEven === 133 &&
      SS_PLANETARY_EPICYCLE_CONSTANTS.Saturn.sighraOdd === 40
  });

  const zeroManda = chapter2PlanetaryEquation({
    planetLongitudeDeg: 80, referenceLongitudeDeg: 80, planet: "Venus", kind: "manda"
  });
  const zeroSighra = chapter2PlanetaryEquation({
    planetLongitudeDeg: 80, referenceLongitudeDeg: 80, planet: "Venus", kind: "sighra"
  });
  tests.push({
    name: "Zero kendra produces zero equation for manda and sighra",
    passed: close(zeroManda.equationDeg, 0) && close(zeroSighra.equationDeg, 0)
  });

  let rejectedSolarSighra = false;
  try {
    chapter2PlanetaryEquation({
      planetLongitudeDeg: 10, referenceLongitudeDeg: 80, planet: "Sun", kind: "sighra"
    });
  } catch (error) {
    rejectedSolarSighra = error instanceof RangeError;
  }
  tests.push({
    name: "Sun's single-inequality path rejects a sighra equation",
    passed: rejectedSolarSighra
  });

  const mandaQuadrant = chapter2PlanetaryEquation({
    planetLongitudeDeg: 0, referenceLongitudeDeg: 90, planet: "Jupiter", kind: "manda"
  });
  const sighraQuadrant = chapter2PlanetaryEquation({
    planetLongitudeDeg: 0, referenceLongitudeDeg: 90, planet: "Jupiter", kind: "sighra"
  });
  tests.push({
    name: "At a quarter-cycle the corrected epicycle equals the odd-quadrant source value",
    passed: close(mandaQuadrant.epicycleDeg, 32) &&
      close(sighraQuadrant.epicycleDeg, 72)
  });

  const zeroSighraRadiusRule = chapter2PlanetaryEquation({
    planetLongitudeDeg: 0, referenceLongitudeDeg: 0, planet: "Jupiter", kind: "sighra"
  });
  const quarterSighraRadiusRule = chapter2PlanetaryEquation({
    planetLongitudeDeg: 0, referenceLongitudeDeg: 90, planet: "Jupiter", kind: "sighra"
  });
  tests.push({
    name: "II.40 selects the radius add/subtract branch by the stated kendra quadrant",
    passed: zeroSighraRadiusRule.addKotiToRadius === true &&
      quarterSighraRadiusRule.addKotiToRadius === false
  });

  const venus = chapter2PlanetaryTrueLongitudeCandidate({
    planet: "Venus",
    meanLongitudeDeg: 321.64431,
    mandoccaLongitudeDeg: 79.85450,
    sighroccaLongitudeDeg: 80.87690
  });
  const jupiter = chapter2PlanetaryTrueLongitudeCandidate({
    planet: "Jupiter",
    meanLongitudeDeg: 259.86122,
    mandoccaLongitudeDeg: 171.34402,
    sighroccaLongitudeDeg: 321.64431
  });
  tests.push({
    name: "Four-pass sequence exposes every correction and returns finite normalized Venus/Jupiter candidates",
    passed: [venus, jupiter].every(result =>
      Number.isFinite(result.trueLongitudeCandidateDeg) &&
      result.trueLongitudeCandidateDeg >= 0 &&
      result.trueLongitudeCandidateDeg < 360 &&
      Number.isFinite(result.passes.sighra1.equationDeg) &&
      Number.isFinite(result.passes.manda1.equationDeg) &&
      Number.isFinite(result.passes.manda2.equationDeg) &&
      Number.isFinite(result.passes.sighra2.equationDeg)
    )
  });

  // External worked numerical example at the same ahargana and mean inputs
  // published by R. Kane Tech. It follows the Chapter II four-pass method;
  // tolerate 0.05° for differences in sine-table interpolation precision.
  const workedExampleCheck = Object.freeze({
    source: "https://rkanetech.com/true-position",
    ahargana: 714403972030,
    venus: {
      calculatedDeg: venus.trueLongitudeCandidateDeg,
      publishedDeg: 7.29285,
      signedDifferenceDeg: ((venus.trueLongitudeCandidateDeg - 7.29285 + 540) % 360) - 180
    },
    jupiter: {
      calculatedDeg: jupiter.trueLongitudeCandidateDeg,
      publishedDeg: 264.43632,
      signedDifferenceDeg: ((jupiter.trueLongitudeCandidateDeg - 264.43632 + 540) % 360) - 180
    },
    status: "independent published worked-example comparison; inputs are held fixed and are not fitted to event dates"
  });
  tests.push({
    name: "Four-pass Venus result agrees within 0.05° with published Chapter II worked example",
    passed: Math.abs(workedExampleCheck.venus.signedDifferenceDeg) <= 0.05
  });
  tests.push({
    name: "Four-pass Jupiter result agrees within 0.05° with published Chapter II worked example",
    passed: Math.abs(workedExampleCheck.jupiter.signedDifferenceDeg) <= 0.05
  });

  let rejectedUnsupported = false;
  try {
    chapter2PlanetaryTrueLongitudeCandidate({
      planet: "Sun", meanLongitudeDeg: 10, mandoccaLongitudeDeg: 20, sighroccaLongitudeDeg: 0
    });
  } catch (error) {
    rejectedUnsupported = error instanceof RangeError;
  }
  tests.push({
    name: "The double-correction planetary path rejects the Sun rather than applying planetary epicycles to it",
    passed: rejectedUnsupported
  });

  // Burgess's comparison table is for 1 Jan 1860 midnight at Washington.
  // The text gives Washington mean time as 5h 8m 11s west of Greenwich.
  // Convert that instant to Ujjain local-mean coordinates using the research
  // bridge; this exposes, rather than hides, any residual frame/time mismatch.
  const washingtonMidnightUtc = new Date(Date.UTC(1860, 0, 1, 5, 8, 11));
  const washingtonUtcJD = chapter1UtcJulianDay(washingtonMidnightUtc);
  const ujjainBridge = chapter1EpochBridgeFromUtcJD(washingtonUtcJD, 75.768);
  const historicalAhargana = ujjainBridge.aharganaFromEpochAnchor;
  const historicalVenus = chapter2PlanetaryTruePositionAtAhargana({
    planet: "Venus", ahargana: historicalAhargana
  });
  const historicalJupiter = chapter2PlanetaryTruePositionAtAhargana({
    planet: "Jupiter", ahargana: historicalAhargana
  });
  const historicalMeanSun = chapter1MeanPlanetaryPosition({
    planet: "Sun", ahargana: historicalAhargana
  });
  const sourceSunTrueLongitudeDeg = 278 + 40 / 60;
  const reconstructedFrame = chapter1PlanetaryMandoccaEpochCandidates();
  const frameOffsetDeg = reconstructedFrame.inferredCommonFrameOffsetDeg;
  const burgessReportedSphereOffsetDeg = 18 + 5 / 60 + 8 / 3600;
  const toBurgessEquinoxFrame = value => ((value + frameOffsetDeg) % 360 + 360) % 360;
  const toLiteralBurgessReportedFrame = value =>
    ((value + burgessReportedSphereOffsetDeg) % 360 + 360) % 360;
  const signedDifference = (value, target) => ((value - target + 540) % 360) - 180;
  const historicalTableCheck = Object.freeze({
    instant: "1860-01-01 00:00:00 Washington local mean time",
    utcJD: washingtonUtcJD,
    ahargana: historicalAhargana,
    candidateFrameOffsetDeg: frameOffsetDeg,
    burgessReportedSphereOffsetDeg,
    differenceBetweenFrameCandidatesDeg: burgessReportedSphereOffsetDeg - frameOffsetDeg,
    meanSun: {
      calculatedKaliFixedFrameDeg: historicalMeanSun.meanLongitudeDeg,
      calculatedAfterCandidateFrameTransformDeg: toBurgessEquinoxFrame(historicalMeanSun.meanLongitudeDeg),
      calculatedAfterLiteralBurgessOffsetDeg: toLiteralBurgessReportedFrame(historicalMeanSun.meanLongitudeDeg),
      burgessSunTrueLongitudeDeg: sourceSunTrueLongitudeDeg,
      rawDifferenceDeg: signedDifference(historicalMeanSun.meanLongitudeDeg, sourceSunTrueLongitudeDeg),
      transformedDifferenceDeg: signedDifference(toBurgessEquinoxFrame(historicalMeanSun.meanLongitudeDeg), sourceSunTrueLongitudeDeg),
      literalBurgessOffsetDifferenceDeg: signedDifference(toLiteralBurgessReportedFrame(historicalMeanSun.meanLongitudeDeg), sourceSunTrueLongitudeDeg),
      note: "Both transformed values are diagnostics only: the candidate offset is inferred from the secondary solar mandocca anchor, while the 18°05′08″ prose value must be confirmed to describe the same frame; this row compares mean Sun to true Sun."
    },
    venus: {
      calculatedKaliFixedFrameDeg: historicalVenus.bhujantaraCorrectedTrueLongitudeDeg,
      uncorrectedFourPassDeg: historicalVenus.trueLongitudeCandidateDeg,
      bhujantaraCorrectionDeg: historicalVenus.bhujantaraCorrectionDeg,
      calculatedAfterCandidateFrameTransformDeg: toBurgessEquinoxFrame(historicalVenus.bhujantaraCorrectedTrueLongitudeDeg),
      calculatedAfterLiteralBurgessOffsetDeg: toLiteralBurgessReportedFrame(historicalVenus.bhujantaraCorrectedTrueLongitudeDeg),
      burgessHinduFrameDeg: 305,
      rawDifferenceDeg: signedDifference(historicalVenus.bhujantaraCorrectedTrueLongitudeDeg, 305),
      transformedDifferenceDeg: signedDifference(toBurgessEquinoxFrame(historicalVenus.bhujantaraCorrectedTrueLongitudeDeg), 305),
      literalBurgessOffsetDifferenceDeg: signedDifference(toLiteralBurgessReportedFrame(historicalVenus.bhujantaraCorrectedTrueLongitudeDeg), 305)
    },
    jupiter: {
      calculatedKaliFixedFrameDeg: historicalJupiter.bhujantaraCorrectedTrueLongitudeDeg,
      uncorrectedFourPassDeg: historicalJupiter.trueLongitudeCandidateDeg,
      bhujantaraCorrectionDeg: historicalJupiter.bhujantaraCorrectionDeg,
      calculatedAfterCandidateFrameTransformDeg: toBurgessEquinoxFrame(historicalJupiter.bhujantaraCorrectedTrueLongitudeDeg),
      calculatedAfterLiteralBurgessOffsetDeg: toLiteralBurgessReportedFrame(historicalJupiter.bhujantaraCorrectedTrueLongitudeDeg),
      burgessHinduFrameDeg: 114 + 36 / 60,
      rawDifferenceDeg: signedDifference(historicalJupiter.bhujantaraCorrectedTrueLongitudeDeg, 114 + 36 / 60),
      transformedDifferenceDeg: signedDifference(toBurgessEquinoxFrame(historicalJupiter.bhujantaraCorrectedTrueLongitudeDeg), 114 + 36 / 60),
      literalBurgessOffsetDifferenceDeg: signedDifference(toLiteralBurgessReportedFrame(historicalJupiter.bhujantaraCorrectedTrueLongitudeDeg), 114 + 36 / 60)
    },
    status: "EXTERNAL ACCURACY CHECK ONLY: Burgess's 1860 table uses Le Verrier planetary revolution data, Peirce's lunar tables, and Hansen's apsis/node tables; it is not a worked output of the Sūrya-siddhānta algorithm. The ~2.34° residual with the printed 18°05′08″ frame offset is therefore a model-vs-modern-ephemeris residual, not by itself proof of a coding error. Verify frame conversion and compare intermediate equations against an actual classical worked example before event prediction."
  });
  tests.push({
    name: "Chapter II.46 computes a finite, signed bhujantara correction and preserves the pre-correction true place",
    passed: Number.isFinite(historicalVenus.bhujantaraCorrectionDeg) &&
      Number.isFinite(historicalJupiter.bhujantaraCorrectionDeg) &&
      Number.isFinite(historicalVenus.bhujantaraCorrectedTrueLongitudeDeg) &&
      Number.isFinite(historicalJupiter.bhujantaraCorrectedTrueLongitudeDeg) &&
      Math.abs(historicalVenus.bhujantaraCorrectionDeg) < 0.1 &&
      Math.abs(historicalJupiter.bhujantaraCorrectionDeg) < 0.1 &&
      Math.abs(historicalVenus.bhujantaraCorrectedTrueLongitudeDeg - historicalVenus.trueLongitudeCandidateDeg) < 0.1
  });

  tests.push({
    name: "Burgess 1860 external-ephemeris comparison reports raw and transformed residuals without claiming formula validation",
    passed: Number.isFinite(historicalTableCheck.meanSun.calculatedKaliFixedFrameDeg) &&
      Number.isFinite(historicalTableCheck.meanSun.transformedDifferenceDeg) &&
      Number.isFinite(historicalTableCheck.venus.transformedDifferenceDeg) &&
      Number.isFinite(historicalTableCheck.jupiter.transformedDifferenceDeg) &&
      Number.isFinite(historicalTableCheck.ahargana) &&
      Math.abs(historicalTableCheck.venus.transformedDifferenceDeg) > 1 &&
      Math.abs(historicalTableCheck.jupiter.transformedDifferenceDeg) > 1 &&
      historicalTableCheck.status.startsWith("UNRESOLVED")
  });

  return {
    tests,
    workedExampleCheck,
    historicalTableCheck,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "These are source-table and wiring tests. The four-pass outputs are candidates; verify them against a fully documented worked example before Chapter IX event dates or production display."
  };
}
