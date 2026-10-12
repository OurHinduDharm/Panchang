/**
 * Research-only 3-D coordinate transform for Chapter III/VII diagnostics.
 *
 * Transform order:
 *   modern true equatorial-of-date (EQD)
 *   -> modern true ecliptic-of-date (ECT)
 *   -> rotate ecliptic origin by -ayanamsha (tropical -> classical sidereal)
 *   -> classical equatorial frame using the explicitly selected obliquity.
 *
 * This is a vector-coordinate transform only. It does NOT solve how local
 * sidereal time / the local meridian must be constructed in the classical
 * time-and-equator model. Do not wire it into Chapter IX event times until
 * that separate meridian derivation is independently established.
 */

const DEG = Math.PI / 180;

/**
 * Chapter II.28's sine-table convention: greatest-declination sine 1397
 * on radius 3438. This returns asin(1397/3438), not an exact modern
 * obliquity and not the rounded 24° used in some textual constructions.
 */
export function chapter2SineTableObliquityDeg({ radius = 3438, maxDeclinationSine = 1397 } = {}) {
  if (!Number.isFinite(radius) || radius <= 0 ||
      !Number.isFinite(maxDeclinationSine) ||
      maxDeclinationSine < 0 || maxDeclinationSine > radius) {
    throw new RangeError("Sine-table radius must be positive and the maximum-declination sine must be in [0, radius].");
  }
  return Math.asin(maxDeclinationSine / radius) / DEG;
}

function validateVector(vector) {
  if (!Array.isArray(vector) || vector.length !== 3 ||
      !vector.every(Number.isFinite)) {
    throw new TypeError("vector must be a finite three-element array.");
  }
}

function validateAngles({ sourceObliquityDeg, ayanamshaDeg, classicalObliquityDeg }) {
  if (![sourceObliquityDeg, ayanamshaDeg, classicalObliquityDeg].every(Number.isFinite)) {
    throw new TypeError("All frame angles must be finite.");
  }
  if (Math.abs(sourceObliquityDeg) >= 90 || Math.abs(classicalObliquityDeg) >= 90) {
    throw new RangeError("Obliquities must be between -90° and +90°.");
  }
}

function rotateX(vector, angleDeg) {
  const angle = angleDeg * DEG;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const [x, y, z] = vector;
  return [x, y * c - z * s, y * s + z * c];
}

function rotateZ(vector, angleDeg) {
  const angle = angleDeg * DEG;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const [x, y, z] = vector;
  return [x * c - y * s, x * s + y * c, z];
}

function transformArguments(args) {
  validateAngles(args);
  return args;
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function normalize360(angleDeg) {
  return ((angleDeg % 360) + 360) % 360;
}

/**
 * Candidate: map the modern local-meridian plane into the classical frame.
 *
 * The modern meridian plane is defined by the modern equatorial pole and the
 * point on the modern equator whose RA is localSiderealAngleDeg. Transform
 * that plane into the target coordinates, then intersect it with the target
 * equator to obtain the classical-frame meridian RA.
 *
 * This explicitly assumes that the same geometric meridian plane is carried
 * through the frame transformation. Whether that assumption is the correct
 * Chapter VII/IX time construction is still a source/model question; this
 * function is not yet used by the event-date engine.
 */
export function modernLocalSiderealAngleToClassicalFrame({
  localSiderealAngleDeg,
  sourceObliquityDeg,
  ayanamshaDeg,
  classicalObliquityDeg
}) {
  const args = { sourceObliquityDeg, ayanamshaDeg, classicalObliquityDeg };
  transformArguments(args);
  if (!Number.isFinite(localSiderealAngleDeg)) {
    throw new TypeError("localSiderealAngleDeg must be finite.");
  }

  const theta = localSiderealAngleDeg * DEG;
  const modernPole = [0, 0, 1];
  const modernMeridianPoint = [Math.cos(theta), Math.sin(theta), 0];
  const modernMeridianNormal = cross(modernPole, modernMeridianPoint);
  const classicalMeridianNormal =
    modernEquatorialToClassicalEquatorial(modernMeridianNormal, args);
  const classicalPole = [0, 0, 1];
  const intersection = cross(classicalMeridianNormal, classicalPole);
  const intersectionNorm = Math.hypot(intersection[0], intersection[1]);

  if (!(intersectionNorm > 1e-12)) {
    throw new RangeError("The transformed meridian does not define a stable target-equator intersection.");
  }
  return normalize360(Math.atan2(intersection[1], intersection[0]) / DEG);
}

/** Modern EQD vector -> classical equatorial vector, with all angles explicit. */
export function modernEquatorialToClassicalEquatorial(vector, args) {
  validateVector(vector);
  const { sourceObliquityDeg, ayanamshaDeg, classicalObliquityDeg } =
    transformArguments(args);
  const modernEcliptic = rotateX(vector, -sourceObliquityDeg);
  const classicalEcliptic = rotateZ(modernEcliptic, -ayanamshaDeg);
  return rotateX(classicalEcliptic, classicalObliquityDeg);
}

/** Inverse of modernEquatorialToClassicalEquatorial(). */
export function classicalEquatorialToModernEquatorial(vector, args) {
  validateVector(vector);
  const { sourceObliquityDeg, ayanamshaDeg, classicalObliquityDeg } =
    transformArguments(args);
  const classicalEcliptic = rotateX(vector, -classicalObliquityDeg);
  const modernEcliptic = rotateZ(classicalEcliptic, ayanamshaDeg);
  return rotateX(modernEcliptic, sourceObliquityDeg);
}

export function equatorialVectorFromEcliptic({
  longitudeDeg, latitudeDeg = 0, obliquityDeg
}) {
  if (![longitudeDeg, latitudeDeg, obliquityDeg].every(Number.isFinite)) {
    throw new TypeError("Longitude, latitude, and obliquity must be finite.");
  }
  const longitude = longitudeDeg * DEG;
  const latitude = latitudeDeg * DEG;
  const ecliptic = [
    Math.cos(latitude) * Math.cos(longitude),
    Math.cos(latitude) * Math.sin(longitude),
    Math.sin(latitude)
  ];
  return rotateX(ecliptic, obliquityDeg);
}

export function eclipticCoordinatesFromEquatorialVector(vector, obliquityDeg) {
  validateVector(vector);
  if (!Number.isFinite(obliquityDeg)) {
    throw new TypeError("obliquityDeg must be finite.");
  }
  const [x, y, z] = rotateX(vector, -obliquityDeg);
  const norm = Math.hypot(x, y, z);
  if (!(norm > 0)) throw new RangeError("A zero vector has no ecliptic coordinates.");
  return {
    longitudeDeg: ((Math.atan2(y, x) / DEG) % 360 + 360) % 360,
    latitudeDeg: Math.asin(Math.max(-1, Math.min(1, z / norm))) / DEG,
    norm
  };
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function norm(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

function angleDelta(a, b) {
  return ((a - b + 540) % 360) - 180;
}

export function runClassicalFrameTransformTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-10) =>
    Number.isFinite(a) && Math.abs(a - b) <= tolerance;
  const vectorClose = (a, b, tolerance = 1e-10) =>
    a.length === 3 && b.length === 3 &&
    a.every((value, i) => close(value, b[i], tolerance));

  const args = {
    sourceObliquityDeg: 23.4367,
    ayanamshaDeg: 22.9122,
    classicalObliquityDeg: 24
  };
  const vectors = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [0.2, -0.7, 0.5],
    [-0.91, 0.11, 0.39]
  ];

  tests.push({
    name: "Inverse transform round-trips basis and general vectors",
    passed: vectors.every(v => vectorClose(
      classicalEquatorialToModernEquatorial(
        modernEquatorialToClassicalEquatorial(v, args), args
      ),
      v
    ))
  });

  tests.push({
    name: "Transform preserves vector norm",
    passed: vectors.every(v => close(
      norm(modernEquatorialToClassicalEquatorial(v, args)),
      norm(v)
    ))
  });

  const transformedBasis = [
    modernEquatorialToClassicalEquatorial([1, 0, 0], args),
    modernEquatorialToClassicalEquatorial([0, 1, 0], args),
    modernEquatorialToClassicalEquatorial([0, 0, 1], args)
  ];
  tests.push({
    name: "Rotation is orthonormal on the three basis vectors",
    passed: close(dot(transformedBasis[0], transformedBasis[1]), 0) &&
      close(dot(transformedBasis[0], transformedBasis[2]), 0) &&
      close(dot(transformedBasis[1], transformedBasis[2]), 0) &&
      transformedBasis.every(v => close(norm(v), 1))
  });

  const sourceEcliptic = equatorialVectorFromEcliptic({
    longitudeDeg: 123.4,
    latitudeDeg: -2.7,
    obliquityDeg: args.sourceObliquityDeg
  });
  const targetEquatorial = modernEquatorialToClassicalEquatorial(sourceEcliptic, args);
  const targetEcliptic = eclipticCoordinatesFromEquatorialVector(
    targetEquatorial, args.classicalObliquityDeg
  );
  tests.push({
    name: "Tropical ecliptic coordinates map to longitude minus ayanamsha while preserving latitude",
    passed: Math.abs(angleDelta(
      targetEcliptic.longitudeDeg, 123.4 - args.ayanamshaDeg
    )) < 1e-9 &&
      close(targetEcliptic.latitudeDeg, -2.7, 1e-9)
  });

  const tableObliquityDeg = chapter2SineTableObliquityDeg();
  tests.push({
    name: "Chapter II.28 sine-table obliquity is derived from 1397/3438 and is not silently rounded to 24°",
    passed: close(tableObliquityDeg, 23.9751819, 1e-6) &&
      Math.abs(tableObliquityDeg - 24) > 0.02
  });

  let rejectedInvalidSineTable = false;
  try {
    chapter2SineTableObliquityDeg({ radius: 3438, maxDeclinationSine: 3439 });
  } catch (error) {
    rejectedInvalidSineTable = error instanceof RangeError;
  }
  tests.push({
    name: "Invalid Chapter II.28 sine-table values are rejected",
    passed: rejectedInvalidSineTable
  });

  const identityArgs = {
    sourceObliquityDeg: 23.4,
    ayanamshaDeg: 0,
    classicalObliquityDeg: 23.4
  };
  tests.push({
    name: "Equal obliquity and zero ayanamsha produce identity",
    passed: vectors.every(v => vectorClose(
      modernEquatorialToClassicalEquatorial(v, identityArgs), v
    ))
  });

  const meridianAngles = [0, 45, 90, 123.4, 200, 359.9];
  tests.push({
    name: "Local-meridian candidate is identity when source and target frames are identical",
    passed: meridianAngles.every(theta => close(
      modernLocalSiderealAngleToClassicalFrame({
        localSiderealAngleDeg: theta,
        ...identityArgs
      }),
      theta,
      1e-9
    ))
  });

  // Independent geometric construction: transform the source pole and a
  // point on the source meridian separately, form their plane, then intersect
  // that plane with the target equator. This avoids reusing the candidate's
  // transformed-normal calculation.
  const independentMeridianAngle = (thetaDeg, frameArgs) => {
    const theta = thetaDeg * DEG;
    const sourcePole = modernEquatorialToClassicalEquatorial([0, 0, 1], frameArgs);
    const sourcePoint = modernEquatorialToClassicalEquatorial(
      [Math.cos(theta), Math.sin(theta), 0], frameArgs
    );
    const planeNormal = cross(sourcePole, sourcePoint);
    const intersection = cross(planeNormal, [0, 0, 1]);
    return normalize360(Math.atan2(intersection[1], intersection[0]) / DEG);
  };
  tests.push({
    name: "Local-meridian candidate matches independent transformed-pole/plane intersection at six angles",
    passed: meridianAngles.every(theta => close(
      modernLocalSiderealAngleToClassicalFrame({
        localSiderealAngleDeg: theta,
        ...args
      }),
      independentMeridianAngle(theta, args),
      1e-9
    ))
  });

  const withAyanamsha = modernLocalSiderealAngleToClassicalFrame({
    localSiderealAngleDeg: 45,
    ...args
  });
  const withoutAyanamsha = modernLocalSiderealAngleToClassicalFrame({
    localSiderealAngleDeg: 45,
    ...args,
    ayanamshaDeg: 0
  });
  tests.push({
    name: "Full meridian candidate includes the ecliptic-origin rotation, not only obliquity change",
    passed: Math.abs(angleDelta(withAyanamsha, withoutAyanamsha)) > 1e-4
  });

  let rejectedBadVector = false;
  try {
    modernEquatorialToClassicalEquatorial([1, 2], args);
  } catch (error) {
    rejectedBadVector = error instanceof TypeError;
  }
  tests.push({
    name: "Malformed vectors are rejected",
    passed: rejectedBadVector
  });

  let rejectedBadAngle = false;
  try {
    modernEquatorialToClassicalEquatorial([1, 0, 0], {
      ...args, ayanamshaDeg: Number.NaN
    });
  } catch (error) {
    rejectedBadAngle = error instanceof TypeError;
  }
  tests.push({
    name: "Non-finite frame angles are rejected",
    passed: rejectedBadAngle
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "These tests validate the explicit planetary-vector rotation and inverse only. They do not validate the classical local-meridian/hour-angle construction or any Chapter IX event date."
  };
}
