/**
 * Research-only comparison of two Chapter III.49 meridian constructions.
 *
 * Candidate A transforms the modern local-meridian plane into the selected
 * classical frame. Candidate B transforms the Sun state, then applies the
 * modern Sun's signed hour angle as the classical nata. Candidate B mirrors
 * the source's "Sun longitude +/− nata in Lanka right-ascension equivalents"
 * structure, but its supplied nata may still be modern-derived; it is NOT a
 * fully classical time reconstruction or a production algorithm.
 */
import {
  modernLocalSiderealAngleToClassicalFrame,
  inspectModernStateInClassicalFrame
} from "./ss_classical_frame.js";

const DEG = Math.PI / 180;
const norm360 = x => ((x % 360) + 360) % 360;
const signedDelta = (a, b) => ((a - b + 540) % 360) - 180;

export function rightAscensionFromEclipticLongitude(longitudeDeg, obliquityDeg) {
  if (![longitudeDeg, obliquityDeg].every(Number.isFinite) ||
      Math.abs(obliquityDeg) >= 90) {
    throw new TypeError("Finite longitude and valid obliquity are required.");
  }
  const lambda = longitudeDeg * DEG;
  const eps = obliquityDeg * DEG;
  return norm360(Math.atan2(Math.sin(lambda) * Math.cos(eps), Math.cos(lambda)) / DEG);
}

/** Invert the monotonic ecliptic-longitude -> right-ascension relation. */
export function eclipticLongitudeFromRightAscension(rightAscensionDeg, obliquityDeg) {
  if (![rightAscensionDeg, obliquityDeg].every(Number.isFinite) ||
      Math.abs(obliquityDeg) >= 90) {
    throw new TypeError("Finite right ascension and valid obliquity are required.");
  }
  const target = norm360(rightAscensionDeg);
  let low = 0;
  let high = 360;
  for (let i = 0; i < 64; i++) {
    const mid = (low + high) / 2;
    if (rightAscensionFromEclipticLongitude(mid, obliquityDeg) < target) low = mid;
    else high = mid;
  }
  return norm360((low + high) / 2);
}

/**
 * Source-shaped Chapter III.49 candidate:
 * nataGhati is signed, east/west time from noon. One ghati = 6° of
 * right ascension (60 prāṇas × 6° / 60 prāṇas per ghati). The supplied Sun
 * longitude and nata must already refer to the same selected frame.
 */
export function chapter3MeridianLongitudeFromSunAndNata({
  sunLongitudeDeg,
  nataGhati,
  obliquityDeg = 24
}) {
  if (![sunLongitudeDeg, nataGhati, obliquityDeg].every(Number.isFinite)) {
    throw new TypeError("Sun longitude, signed nata, and obliquity must be finite.");
  }
  const sunRA = rightAscensionFromEclipticLongitude(sunLongitudeDeg, obliquityDeg);
  const meridianRA = norm360(sunRA + nataGhati * 6);
  return {
    sunRA,
    nataGhati,
    meridianRA,
    meridianLongitudeDeg: eclipticLongitudeFromRightAscension(meridianRA, obliquityDeg),
    status: "source-shaped Chapter III.49 candidate; nata source/frame must be independently established"
  };
}

/**
 * Compare the transformed modern meridian-plane candidate against a
 * Chapter III.49-shaped construction that carries the modern Sun hour angle
 * over unchanged after transforming the Sun vector. A non-zero residual is
 * diagnostic evidence about that carry-over assumption, not a test failure.
 */
export function compareChapter3MeridianCandidates({
  localSiderealAngleDeg,
  sunRightAscensionDeg,
  sunDeclinationDeg,
  sourceObliquityDeg,
  ayanamshaDeg,
  classicalObliquityDeg
}) {
  const frame = { sourceObliquityDeg, ayanamshaDeg, classicalObliquityDeg };
  const transformedMeridianRA = modernLocalSiderealAngleToClassicalFrame({
    localSiderealAngleDeg, ...frame
  });
  const transformedSun = inspectModernStateInClassicalFrame({
    rightAscensionDeg: sunRightAscensionDeg,
    declinationDeg: sunDeclinationDeg,
    ...frame
  });
  const modernSignedNataDeg = signedDelta(localSiderealAngleDeg, sunRightAscensionDeg);
  const nataGhati = modernSignedNataDeg / 6;
  const sourceShapedMeridianRA = norm360(transformedSun.targetRightAscensionDeg + modernSignedNataDeg);
  const sourceShapedLongitude = eclipticLongitudeFromRightAscension(
    sourceShapedMeridianRA, classicalObliquityDeg
  );
  return {
    transformedMeridianRA,
    transformedSunRA: transformedSun.targetRightAscensionDeg,
    modernSignedNataDeg,
    nataGhati,
    sourceShapedMeridianRA,
    sourceShapedLongitudeDeg: sourceShapedLongitude,
    signedResidualDeg: signedDelta(sourceShapedMeridianRA, transformedMeridianRA),
    absoluteResidualDeg: Math.abs(signedDelta(sourceShapedMeridianRA, transformedMeridianRA)),
    status: "comparison only; modern-derived nata and frame assumptions are not source-validated"
  };
}

export function runChapter3MeridianFrameTests() {
  const tests = [];
  const close = (a, b, tol = 1e-9) => Number.isFinite(a) && Math.abs(a - b) <= tol;
  const angles = [0, 1, 45, 90, 123.4, 200, 359.9];
  const obliquities = [0, 23.4367, 23.9751819, 24];
  tests.push({
    name: "Ecliptic longitude/right ascension inverse round-trips across angle and obliquity grid",
    passed: obliquities.every(eps => angles.every(lambda => close(
      eclipticLongitudeFromRightAscension(
        rightAscensionFromEclipticLongitude(lambda, eps), eps
      ), lambda, 1e-8
    )))
  });
  tests.push({
    name: "Chapter III.49 nata conversion uses 6° right ascension per ghati",
    passed: close(chapter3MeridianLongitudeFromSunAndNata({
      sunLongitudeDeg: 0, nataGhati: 1, obliquityDeg: 0
    }).meridianRA, 6) &&
    close(chapter3MeridianLongitudeFromSunAndNata({
      sunLongitudeDeg: 0, nataGhati: -1, obliquityDeg: 0
    }).meridianRA, 354)
  });
  const identity = compareChapter3MeridianCandidates({
    localSiderealAngleDeg: 200,
    sunRightAscensionDeg: 123.4,
    sunDeclinationDeg: -12.7,
    sourceObliquityDeg: 23.4367,
    ayanamshaDeg: 0,
    classicalObliquityDeg: 23.4367
  });
  tests.push({
    name: "Chapter III.49-shaped and transformed-meridian constructions agree when source and target frames are identical",
    passed: identity.absoluteResidualDeg < 1e-8
  });
  const differingFrame = compareChapter3MeridianCandidates({
    localSiderealAngleDeg: 200,
    sunRightAscensionDeg: 123.4,
    sunDeclinationDeg: -12.7,
    sourceObliquityDeg: 23.4367,
    ayanamshaDeg: 24.217,
    classicalObliquityDeg: 24
  });
  tests.push({
    name: "Changed-frame comparison reports a finite residual without pretending to certify either construction",
    passed: Number.isFinite(differingFrame.signedResidualDeg) &&
      Number.isFinite(differingFrame.sourceShapedLongitudeDeg) &&
      differingFrame.status.includes("comparison only")
  });
  return {
    tests,
    passed: tests.filter(t => t.passed).length,
    total: tests.length,
    allPassed: tests.every(t => t.passed),
    note: "The tests validate the comparison arithmetic. They do not establish that modern hour angle is the classical nata, nor certify the historical frame."
  };
}
