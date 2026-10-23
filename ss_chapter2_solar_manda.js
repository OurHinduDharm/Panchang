/**
 * Research-only Sūrya-siddhānta Chapter II solar manda correction candidate.
 *
 * Implements the source-table arithmetic shape of II.34, II.38–39 and II.45:
 * variable epicycle between 14° and 13°40′, base-sine scaling, sine-table
 * inversion, and add/subtract by the half-orbit of the planet-to-apsis kendra.
 *
 * Inputs are explicit longitudes in one already-agreed frame. This helper does
 * NOT assert that the current mean-longitude and mandocca epoch/frame anchors
 * have been reconciled. It must not be used to publish civil-date events yet.
 */
import {
  SURYA_SIDDHANTA_RADIUS,
  chapter2SineFromArcMinutes,
  chapter2ArcMinutesFromSine
} from "./ss_chapter2_versed_sine_table.js";

export const SS_SOLAR_MANDA_CONSTANTS = Object.freeze({
  evenQuadrantEpicycleDeg: 14,
  oddQuadrantEpicycleDeg: 13 + 40 / 60,
  quadrantDifferenceArcMinutes: 20,
  source: "Sūrya-siddhānta II.34, II.38–39, II.45; Burgess translation",
  status: "research-only formula candidate; epoch and longitude frame remain unverified"
});

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

/** Return sine magnitude from the source table after quadrant reduction. */
function sineMagnitudeForDegrees(degrees) {
  const normalized = normalizeDegrees(degrees);
  const halfCyclePosition = normalized % 180;
  const reducedArcMinutes = Math.min(halfCyclePosition, 180 - halfCyclePosition) * 60;
  return chapter2SineFromArcMinutes(reducedArcMinutes).sine;
}

/**
 * Apply the solar manda correction to an explicit mean longitude and mean
 * mandocca longitude, assumed to use the same angular frame.
 */
export function chapter2SolarMandaCorrection({ meanLongitudeDeg, meanMandoccaLongitudeDeg }) {
  finite(meanLongitudeDeg, "meanLongitudeDeg");
  finite(meanMandoccaLongitudeDeg, "meanMandoccaLongitudeDeg");

  const mean = normalizeDegrees(meanLongitudeDeg);
  const mandocca = normalizeDegrees(meanMandoccaLongitudeDeg);
  // Chapter II.45 describes kendra forward from planet to apsis.
  const mandaKendraDeg = normalizeDegrees(mandocca - mean);
  const sineOfKendra = sineMagnitudeForDegrees(mandaKendraDeg);
  const c = SS_SOLAR_MANDA_CONSTANTS;

  // II.34/38: epicycle is 14° at even-quadrant ends and 13°40′ at odd ends.
  // The source's linear sine-table correction interpolates the 20′ difference.
  const epicycleDeg = c.evenQuadrantEpicycleDeg -
    (c.quadrantDifferenceArcMinutes / 60) *
    (sineOfKendra / SURYA_SIDDHANTA_RADIUS);

  // II.39: corrected epicycle × base-sine / 360 gives the sine quantity
  // whose arc is the manda equation. Invert through the Chapter II table.
  const equationSine = epicycleDeg * sineOfKendra / 360;
  const equationArc = chapter2ArcMinutesFromSine(equationSine);
  const mandaEquationDeg = equationArc.arcMinutes / 60;
  const correctionSign = mandaKendraDeg < 180 ? 1 : -1;
  const trueLongitudeCandidateDeg = normalizeDegrees(mean + correctionSign * mandaEquationDeg);

  return Object.freeze({
    meanLongitudeDeg: mean,
    meanMandoccaLongitudeDeg: mandocca,
    mandaKendraDeg,
    mandaKendraSine: sineOfKendra,
    correctedEpicycleDeg: epicycleDeg,
    equationSine,
    mandaEquationArcMinutes: equationArc.arcMinutes,
    mandaEquationDeg,
    correctionSign,
    trueLongitudeCandidateDeg,
    source: c.source,
    status: c.status,
    limitation: "Candidate only: input longitude frames/epochs must be reconciled and independently validated before interpreting this as a date-specific true solar longitude."
  });
}

export function runChapter2SolarMandaTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-7) => Number.isFinite(a) && Math.abs(a - b) <= tolerance;
  const at = (mean, apsis) => chapter2SolarMandaCorrection({
    meanLongitudeDeg: mean,
    meanMandoccaLongitudeDeg: apsis
  });

  const zero = at(77, 77);
  tests.push({
    name: "Zero manda-kendra gives zero equation",
    passed: close(zero.mandaKendraDeg, 0) && close(zero.mandaEquationDeg, 0) && close(zero.trueLongitudeCandidateDeg, 77)
  });

  const quarter = at(0, 90);
  tests.push({
    name: "Quarter-cycle kendra uses the odd-quadrant 13°40′ epicycle",
    passed: close(quarter.mandaKendraDeg, 90) && close(quarter.correctedEpicycleDeg, 13 + 40 / 60, 1e-8)
  });

  const half = at(0, 180);
  tests.push({
    name: "Half-cycle kendra uses the even-quadrant 14° epicycle",
    passed: close(half.mandaKendraDeg, 180) && close(half.correctedEpicycleDeg, 14, 1e-8)
  });

  const threeQuarter = at(0, 270);
  tests.push({
    name: "Three-quarter-cycle kendra returns to odd-quadrant epicycle",
    passed: close(threeQuarter.mandaKendraDeg, 270) && close(threeQuarter.correctedEpicycleDeg, 13 + 40 / 60, 1e-8)
  });

  tests.push({
    name: "Equation is added for kendra below 180° and subtracted above 180°",
    passed: at(0, 90).correctionSign === 1 && at(0, 270).correctionSign === -1
  });

  const wrap = at(359, 20);
  tests.push({
    name: "Planet-to-apsis kendra and output longitude normalize across 0°",
    passed: close(wrap.mandaKendraDeg, 21) && wrap.trueLongitudeCandidateDeg >= 0 && wrap.trueLongitudeCandidateDeg < 360
  });

  const maximum = at(0, 90);
  tests.push({
    name: "Solar manda equation remains within the source epicycle's plausible bound",
    passed: maximum.mandaEquationDeg > 0 && maximum.mandaEquationDeg < 3
  });

  let rejected = false;
  try {
    at(Number.NaN, 0);
  } catch (error) {
    rejected = error instanceof TypeError;
  }
  tests.push({
    name: "Non-finite longitude input is rejected",
    passed: rejected
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Arithmetic and quadrant tests only. No civil date, independent true-longitude reference, or Udaya/Asta event is certified."
  };
}
