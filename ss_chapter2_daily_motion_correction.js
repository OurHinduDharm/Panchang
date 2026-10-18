/**
 * Research-only Sūrya-siddhānta II.47–51 daily-motion correction steps.
 *
 * This is a stepwise arithmetic adapter for independently supplied source
 * intermediates, not a full planetary ephemeris. It deliberately does not
 * derive the planet's mean/manda/śīghra places, sine differences, epicycles,
 * or variable hypotenuse. The radius convention in II.50–51 is disputed in
 * Burgess's note; callers must state which convention supplied the values.
 *
 * No production file imports this module.
 */

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

/**
 * II.48–49: apply the first (manda) correction to a planet's daily motion.
 *
 * gataSine and gamyaSine are source-table Rsine magnitudes for the two
 * adjacent anomaly positions used by the source's motion-correction method.
 * All motion inputs are arcminutes/day; epicycle and kendra are degrees.
 */
export function chapter2MandaCorrectedDailyMotion({
  meanDailyMotionArcminPerDay,
  meanMotionFromMandoccaArcminPerDay,
  gataSine,
  gamyaSine,
  correctedMandaEpicycleDeg,
  mandaKendraDeg
}) {
  for (const [name, value] of Object.entries({
    meanDailyMotionArcminPerDay,
    meanMotionFromMandoccaArcminPerDay,
    gataSine,
    gamyaSine,
    correctedMandaEpicycleDeg,
    mandaKendraDeg
  })) finite(value, name);

  if (gataSine < 0 || gamyaSine < 0) {
    throw new RangeError("Source-table Rsine magnitudes must be non-negative.");
  }
  if (correctedMandaEpicycleDeg < 0) {
    throw new RangeError("Corrected manda epicycle must be non-negative.");
  }

  const kendra = normalizeDegrees(mandaKendraDeg);
  const sineDifference = Math.abs(gataSine - gamyaSine);
  const rawEquationArcminPerDay =
    sineDifference * meanMotionFromMandoccaArcminPerDay / 225 *
    correctedMandaEpicycleDeg / 360;

  // II.49: add in the second/fourth? source states Kendra from 3 to 9 signs;
  // outside that interval subtract. Keep this explicit and report the branch.
  const addEquation = kendra > 90 && kendra < 270;
  const signedEquationArcminPerDay =
    (addEquation ? 1 : -1) * rawEquationArcminPerDay;

  return Object.freeze({
    sineDifference,
    rawEquationArcminPerDay,
    signedEquationArcminPerDay,
    mandaCorrectedDailyMotionArcminPerDay:
      meanDailyMotionArcminPerDay + signedEquationArcminPerDay,
    mandaKendraDeg: kendra,
    quadrantRule: addEquation ? "add: 3 signs < kendra < 9 signs" : "subtract: outside the open 3–9 sign interval",
    source: "Sūrya-siddhānta II.48–49; Burgess translation",
    status: "research-only intermediate; supplied sine values and epoch/frame are not independently validated"
  });
}

/**
 * II.50–51: apply the śīghra correction to the supplied manda-corrected motion.
 *
 * Signed remainder = śīghrocca daily motion − manda-corrected planetary motion.
 * The source's (cala-karṇa − radius)/cala-karṇa factor is retained explicitly.
 * A negative result denotes retrograde motion. The chosen radius convention
 * (trijyā or the alternative noted by Burgess) remains the caller's choice.
 */
export function chapter2SighraCorrectedDailyMotion({
  mandaCorrectedDailyMotionArcminPerDay,
  sighroccaDailyMotionArcminPerDay,
  radius,
  variableHypotenuse
}) {
  for (const [name, value] of Object.entries({
    mandaCorrectedDailyMotionArcminPerDay,
    sighroccaDailyMotionArcminPerDay,
    radius,
    variableHypotenuse
  })) finite(value, name);

  if (radius <= 0 || variableHypotenuse <= 0) {
    throw new RangeError("Radius and variable hypotenuse must be positive.");
  }

  const sighraMinusMandaArcminPerDay =
    sighroccaDailyMotionArcminPerDay - mandaCorrectedDailyMotionArcminPerDay;
  const hypotenuseFactor =
    (variableHypotenuse - radius) / variableHypotenuse;
  const sighraCorrectionArcminPerDay =
    sighraMinusMandaArcminPerDay * hypotenuseFactor;
  const trueDailyMotionArcminPerDay =
    mandaCorrectedDailyMotionArcminPerDay + sighraCorrectionArcminPerDay;

  return Object.freeze({
    sighraMinusMandaArcminPerDay,
    hypotenuseFactor,
    sighraCorrectionArcminPerDay,
    trueDailyMotionArcminPerDay,
    direction: trueDailyMotionArcminPerDay < 0 ? "retrograde" :
      trueDailyMotionArcminPerDay > 0 ? "direct" : "stationary",
    radiusConvention: "caller-supplied; not selected by this helper",
    source: "Sūrya-siddhānta II.50–51; Burgess translation",
    status: "research-only intermediate; input geometry and radius convention are not independently validated"
  });
}

export function runChapter2DailyMotionCorrectionTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-9) =>
    Number.isFinite(a) && Math.abs(a - b) <= tolerance;

  const base = {
    meanDailyMotionArcminPerDay: 60,
    meanMotionFromMandoccaArcminPerDay: 10,
    gataSine: 1200,
    gamyaSine: 900,
    correctedMandaEpicycleDeg: 14
  };
  const add = chapter2MandaCorrectedDailyMotion({ ...base, mandaKendraDeg: 180 });
  const subtract = chapter2MandaCorrectedDailyMotion({ ...base, mandaKendraDeg: 45 });
  tests.push({
    name: "II.48–49 adds the manda-motion equation for kendra between 90° and 270°",
    passed: add.signedEquationArcminPerDay > 0 &&
      close(add.mandaCorrectedDailyMotionArcminPerDay, 60 + 300 * 10 / 225 * 14 / 360)
  });
  tests.push({
    name: "II.48–49 subtracts the manda-motion equation outside the 90°–270° interval",
    passed: subtract.signedEquationArcminPerDay < 0 &&
      close(subtract.mandaCorrectedDailyMotionArcminPerDay, 60 - 300 * 10 / 225 * 14 / 360)
  });

  const above = chapter2SighraCorrectedDailyMotion({
    mandaCorrectedDailyMotionArcminPerDay: 20,
    sighroccaDailyMotionArcminPerDay: 80,
    radius: 3438,
    variableHypotenuse: 4000
  });
  const below = chapter2SighraCorrectedDailyMotion({
    mandaCorrectedDailyMotionArcminPerDay: 20,
    sighroccaDailyMotionArcminPerDay: 80,
    radius: 3438,
    variableHypotenuse: 3000
  });
  tests.push({
    name: "II.50–51 adds the śīghra correction when variable hypotenuse exceeds radius",
    passed: above.sighraCorrectionArcminPerDay > 0 &&
      close(above.trueDailyMotionArcminPerDay, 20 + 60 * (4000 - 3438) / 4000)
  });
  tests.push({
    name: "II.50–51 subtracts the śīghra correction when variable hypotenuse is below radius",
    passed: below.sighraCorrectionArcminPerDay < 0 &&
      close(below.trueDailyMotionArcminPerDay, 20 + 60 * (3000 - 3438) / 3000)
  });

  const retrograde = chapter2SighraCorrectedDailyMotion({
    mandaCorrectedDailyMotionArcminPerDay: 5,
    sighroccaDailyMotionArcminPerDay: 100,
    radius: 3438,
    variableHypotenuse: 100
  });
  tests.push({
    name: "II.50–51 preserves a negative final rate as retrograde rather than taking its absolute value",
    passed: retrograde.trueDailyMotionArcminPerDay < 0 &&
      retrograde.direction === "retrograde"
  });

  let rejectsBadRadius = false;
  try {
    chapter2SighraCorrectedDailyMotion({
      mandaCorrectedDailyMotionArcminPerDay: 20,
      sighroccaDailyMotionArcminPerDay: 80,
      radius: 0,
      variableHypotenuse: 100
    });
  } catch (error) { rejectsBadRadius = error instanceof RangeError; }
  tests.push({
    name: "Non-positive radius is rejected",
    passed: rejectsBadRadius
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Synthetic equation/sign checks only; no planetary motion or Udaya/Asta event is certified."
  };
}
