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
import { chapter1CandidateMandoccaAtAhargana } from "./ss_chapter1_planetary_mandocca_epoch_candidates.js";

export const SS_PLANETARY_EPICYCLE_CONSTANTS = Object.freeze({
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
  if (!SS_PLANETARY_EPICYCLE_CONSTANTS[planet]) {
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
  return Object.freeze({
    ...result,
    ahargana,
    meanDailyMotionArcminPerDay: mean.meanDailyMotionArcminPerDay,
    sighroccaDailyMotionArcminPerDay: mean.sighroccaDailyMotionArcminPerDay,
    mandoccaProvenance: mandocca.candidateProvenance,
    inputStatus: "mean and sighrocca from source revolution ratios; mandocca from the documented research reconstruction"
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

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "These are source-table and wiring tests. The four-pass outputs are candidates; verify them against a fully documented worked example before Chapter IX event dates or production display."
  };
}
