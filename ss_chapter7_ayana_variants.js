/**
 * Research-only comparison of two readings of Sūrya-siddhānta VII.10.
 *
 * This file deliberately does not replace ss_chapter7_drikkarma.js.
 * It computes the Ayana correction twice from the same input:
 *   A: shifted longitude (+90°) with latitude set to 0° (baseline);
 *   B: shifted longitude (+90°) retaining the planet's signed latitude.
 *
 * Ranganatha's gloss distinguishes the declination of the "satribha-graha"
 * from the planet's own latitude. Retaining latitude is the stronger working
 * hypothesis, but this comparison alone does not prove the historical
 * spherical construction or the complete VII.8–10 event algorithm.
 */

function normalize360(value) {
  const x = value % 360;
  return x < 0 ? x + 360 : x;
}

function eclipticEquatorial(longitudeDeg, obliquityDeg, latitudeDeg) {
  const lambda = normalize360(longitudeDeg) * Math.PI / 180;
  const beta = latitudeDeg * Math.PI / 180;
  const epsilon = obliquityDeg * Math.PI / 180;
  const x = Math.cos(beta) * Math.cos(lambda);
  const y = Math.cos(beta) * Math.sin(lambda) * Math.cos(epsilon) -
    Math.sin(beta) * Math.sin(epsilon);
  const z = Math.cos(beta) * Math.sin(lambda) * Math.sin(epsilon) +
    Math.sin(beta) * Math.cos(epsilon);
  return {
    rightAscensionDeg: normalize360(Math.atan2(y, x) * 180 / Math.PI),
    declinationDeg: Math.asin(Math.max(-1, Math.min(1, z))) * 180 / Math.PI
  };
}

/**
 * VII.10 candidate formula:
 * Ayana arcseconds = |planet latitude in arcminutes| ×
 *                    |shifted-point declination in degrees|.
 * Same-name latitude/declination signs subtract; unlike signs add.
 */
function ayanaCorrectionDeg(planetLatitudeDeg, shiftedDeclinationDeg) {
  const sameName =
    (planetLatitudeDeg >= 0 && shiftedDeclinationDeg >= 0) ||
    (planetLatitudeDeg < 0 && shiftedDeclinationDeg < 0);
  const sign = sameName ? -1 : 1;
  const arcSeconds =
    Math.abs(planetLatitudeDeg * 60) * Math.abs(shiftedDeclinationDeg);
  return sign * arcSeconds / 3600;
}

export function compareChapter7AyanaVariants({
  siderealLongitudeDeg,
  planetLatitudeDeg,
  ayanamshaDeg = 24.217,
  obliquityDeg = 24
}) {
  const values = [
    siderealLongitudeDeg, planetLatitudeDeg, ayanamshaDeg, obliquityDeg
  ];
  if (!values.every(Number.isFinite) || Math.abs(planetLatitudeDeg) > 90 ||
      Math.abs(obliquityDeg) >= 90) {
    throw new TypeError("Finite longitude, latitude, ayanamsha and valid obliquity are required.");
  }

  const tropicalLongitudeDeg = normalize360(siderealLongitudeDeg + ayanamshaDeg);
  const shiftedLongitudeDeg = normalize360(tropicalLongitudeDeg + 90);
  const baseline = eclipticEquatorial(shiftedLongitudeDeg, obliquityDeg, 0);
  const retainedLatitude = eclipticEquatorial(
    shiftedLongitudeDeg, obliquityDeg, planetLatitudeDeg
  );

  const baselineCorrectionDeg = ayanaCorrectionDeg(
    planetLatitudeDeg, baseline.declinationDeg
  );
  const retainedLatitudeCorrectionDeg = ayanaCorrectionDeg(
    planetLatitudeDeg, retainedLatitude.declinationDeg
  );

  return {
    input: {
      siderealLongitudeDeg,
      tropicalLongitudeDeg,
      shiftedLongitudeDeg,
      planetLatitudeDeg,
      ayanamshaDeg,
      obliquityDeg
    },
    zeroLatitudeBaseline: {
      shiftedDeclinationDeg: baseline.declinationDeg,
      ayanaCorrectionDeg: baselineCorrectionDeg,
      correctedSiderealLongitudeDeg: normalize360(
        siderealLongitudeDeg + baselineCorrectionDeg
      )
    },
    retainedLatitudeCandidate: {
      shiftedDeclinationDeg: retainedLatitude.declinationDeg,
      ayanaCorrectionDeg: retainedLatitudeCorrectionDeg,
      correctedSiderealLongitudeDeg: normalize360(
        siderealLongitudeDeg + retainedLatitudeCorrectionDeg
      )
    },
    difference: {
      declinationDeg: retainedLatitude.declinationDeg - baseline.declinationDeg,
      correctionDeg: retainedLatitudeCorrectionDeg - baselineCorrectionDeg
    },
    status: "diagnostic comparison only; neither variant is approved for production"
  };
}

export function runChapter7AyanaVariantTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-10) => Math.abs(a - b) <= tolerance;

  const zeroLatitude = compareChapter7AyanaVariants({
    siderealLongitudeDeg: 140,
    planetLatitudeDeg: 0
  });
  tests.push({
    name: "Zero latitude makes both candidate declinations and corrections identical",
    passed: close(
      zeroLatitude.zeroLatitudeBaseline.shiftedDeclinationDeg,
      zeroLatitude.retainedLatitudeCandidate.shiftedDeclinationDeg
    ) && close(
      zeroLatitude.zeroLatitudeBaseline.ayanaCorrectionDeg,
      zeroLatitude.retainedLatitudeCandidate.ayanaCorrectionDeg
    )
  });

  const northSame = compareChapter7AyanaVariants({
    siderealLongitudeDeg: 10,
    planetLatitudeDeg: 2
  });
  tests.push({
    name: "Both candidate corrections are finite for a northern latitude",
    passed: Number.isFinite(northSame.zeroLatitudeBaseline.ayanaCorrectionDeg) &&
      Number.isFinite(northSame.retainedLatitudeCandidate.ayanaCorrectionDeg)
  });

  const south = compareChapter7AyanaVariants({
    siderealLongitudeDeg: 190,
    planetLatitudeDeg: -2
  });
  tests.push({
    name: "Both candidate corrections are finite for a southern latitude",
    passed: Number.isFinite(south.zeroLatitudeBaseline.ayanaCorrectionDeg) &&
      Number.isFinite(south.retainedLatitudeCandidate.ayanaCorrectionDeg)
  });

  const wrapA = compareChapter7AyanaVariants({
    siderealLongitudeDeg: 359.9,
    planetLatitudeDeg: 1.2
  });
  const wrapB = compareChapter7AyanaVariants({
    siderealLongitudeDeg: -0.1,
    planetLatitudeDeg: 1.2
  });
  tests.push({
    name: "Longitude normalization handles equivalent values across 0°/360°",
    passed: close(
      wrapA.zeroLatitudeBaseline.correctedSiderealLongitudeDeg,
      wrapB.zeroLatitudeBaseline.correctedSiderealLongitudeDeg
    ) && close(
      wrapA.retainedLatitudeCandidate.correctedSiderealLongitudeDeg,
      wrapB.retainedLatitudeCandidate.correctedSiderealLongitudeDeg
    )
  });

  const output = {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "These tests check candidate arithmetic and normalization only, not historical correctness or actual Asta/Udaya dates."
  };
  return output;
}
