/**
 * Research-only adjacent-sample solar motion diagnostic.
 *
 * Applies the existing Chapter II solar-manda candidate independently at two
 * explicit samples, then measures the signed change in candidate true longitude.
 * This is a finite-difference control, NOT asserted to be the text's prescribed
 * bhukti and NOT usable for civil-date predictions until epoch/frame anchors
 * and the Chapter II formula are independently validated.
 */
import { chapter2SolarMandaCorrection } from "./ss_chapter2_solar_manda.js";

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

function signedCircularDifferenceDegrees(fromDeg, toDeg) {
  finite(fromDeg, "fromDeg");
  finite(toDeg, "toDeg");
  return ((toDeg - fromDeg + 540) % 360) - 180;
}

/**
 * Samples must be in the same angular frame and have increasing elapsed time.
 * Each sample provides mean solar longitude and mean solar mandocca longitude.
 */
export function chapter2SolarMotionFiniteDifference({ earlier, later }) {
  if (!earlier || !later) throw new TypeError("Both earlier and later samples are required.");
  finite(earlier.elapsedDays, "earlier.elapsedDays");
  finite(later.elapsedDays, "later.elapsedDays");
  if (!(later.elapsedDays > earlier.elapsedDays)) {
    throw new RangeError("later.elapsedDays must be greater than earlier.elapsedDays.");
  }

  const a = chapter2SolarMandaCorrection({
    meanLongitudeDeg: earlier.meanLongitudeDeg,
    meanMandoccaLongitudeDeg: earlier.meanMandoccaLongitudeDeg
  });
  const b = chapter2SolarMandaCorrection({
    meanLongitudeDeg: later.meanLongitudeDeg,
    meanMandoccaLongitudeDeg: later.meanMandoccaLongitudeDeg
  });
  const elapsedDays = later.elapsedDays - earlier.elapsedDays;
  const meanMotionDegPerDay = signedCircularDifferenceDegrees(
    a.meanLongitudeDeg, b.meanLongitudeDeg
  ) / elapsedDays;
  const candidateTrueMotionDegPerDay = signedCircularDifferenceDegrees(
    a.trueLongitudeCandidateDeg, b.trueLongitudeCandidateDeg
  ) / elapsedDays;

  return Object.freeze({
    elapsedDays,
    meanMotionDegPerDay,
    candidateTrueMotionDegPerDay,
    mandaContributionToMotionDegPerDay: candidateTrueMotionDegPerDay - meanMotionDegPerDay,
    earlier: {
      elapsedDays: earlier.elapsedDays,
      meanLongitudeDeg: a.meanLongitudeDeg,
      mandaEquationDeg: a.mandaEquationDeg,
      candidateTrueLongitudeDeg: a.trueLongitudeCandidateDeg
    },
    later: {
      elapsedDays: later.elapsedDays,
      meanLongitudeDeg: b.meanLongitudeDeg,
      mandaEquationDeg: b.mandaEquationDeg,
      candidateTrueLongitudeDeg: b.trueLongitudeCandidateDeg
    },
    provenance: "finite-difference of Chapter II solar-manda candidate",
    status: "research-only; not the text's proven bhukti and not a date-specific event prediction",
    limitations: [
      "mean longitude and mandocca epoch/frame anchors must be reconciled",
      "the underlying solar manda candidate must be validated against the source procedure",
      "finite-difference motion is a numerical control, not automatically the Chapter IX prescribed daily motion"
    ]
  });
}

export function runChapter2SolarMotionFiniteDifferenceTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-7) =>
    Number.isFinite(a) && Math.abs(a - b) <= tolerance;

  const wrapped = chapter2SolarMotionFiniteDifference({
    earlier: { elapsedDays: 0, meanLongitudeDeg: 359, meanMandoccaLongitudeDeg: 80 },
    later: { elapsedDays: 1, meanLongitudeDeg: 0, meanMandoccaLongitudeDeg: 80.1 }
  });
  tests.push({
    name: "Finite-difference motion crosses 0° without a false −359° jump",
    passed: wrapped.meanMotionDegPerDay > 0 &&
      wrapped.meanMotionDegPerDay < 2 &&
      Number.isFinite(wrapped.candidateTrueMotionDegPerDay)
  });

  const same = chapter2SolarMotionFiniteDifference({
    earlier: { elapsedDays: 4, meanLongitudeDeg: 120, meanMandoccaLongitudeDeg: 120 },
    later: { elapsedDays: 6, meanLongitudeDeg: 122, meanMandoccaLongitudeDeg: 122 }
  });
  tests.push({
    name: "Finite difference divides angular change by actual elapsed days",
    passed: close(same.meanMotionDegPerDay, 1)
  });

  let rejectsOrder = false;
  try {
    chapter2SolarMotionFiniteDifference({
      earlier: { elapsedDays: 2, meanLongitudeDeg: 10, meanMandoccaLongitudeDeg: 50 },
      later: { elapsedDays: 2, meanLongitudeDeg: 11, meanMandoccaLongitudeDeg: 51 }
    });
  } catch (error) {
    rejectsOrder = error instanceof RangeError;
  }
  tests.push({
    name: "Non-increasing sample times are rejected",
    passed: rejectsOrder
  });

  let rejectsMissing = false;
  try { chapter2SolarMotionFiniteDifference({ earlier: null, later: {} }); }
  catch (error) { rejectsMissing = error instanceof TypeError; }
  tests.push({
    name: "Missing samples are rejected",
    passed: rejectsMissing
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Synthetic arithmetic checks only; no epoch, frame, true longitude, or Udaya/Asta event is certified."
  };
}
