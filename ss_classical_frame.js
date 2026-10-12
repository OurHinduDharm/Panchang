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
