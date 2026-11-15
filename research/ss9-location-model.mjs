/**
 * Research-only location-aware Surya Siddhanta Ch.9 visibility kernel.
 * Caller supplies apparent geocentric ecliptic-of-date coordinates at the
 * same instant. No ephemeris positions are fabricated in this module.
 */
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export const SS9_LIMITS_DEG = Object.freeze({ Jupiter: 11, Agastya: 13 });

export function normalizeDegrees(value) {
  if (!Number.isFinite(value)) throw new TypeError("angle must be finite");
  return ((value % 360) + 360) % 360;
}

export function signedAngleDifference(toDeg, fromDeg) {
  const d = normalizeDegrees(toDeg - fromDeg);
  return d > 180 ? d - 360 : d;
}

export function eclipticToEquatorial({ longitudeDeg, latitudeDeg = 0 }, obliquityDeg) {
  for (const [name, value] of Object.entries({ longitudeDeg, latitudeDeg, obliquityDeg })) {
    if (!Number.isFinite(value)) throw new TypeError(name + " must be finite");
  }
  const lambda = normalizeDegrees(longitudeDeg) * DEG;
  const beta = latitudeDeg * DEG;
  const epsilon = obliquityDeg * DEG;
  const y = Math.sin(lambda) * Math.cos(epsilon) - Math.tan(beta) * Math.sin(epsilon);
  const x = Math.cos(lambda);
  const ra = Math.atan2(y, x);
  const sinDec = Math.sin(beta) * Math.cos(epsilon) +
    Math.cos(beta) * Math.sin(epsilon) * Math.sin(lambda);
  return {
    rightAscensionDeg: normalizeDegrees(ra * RAD),
    declinationDeg: Math.asin(Math.max(-1, Math.min(1, sinDec))) * RAD
  };
}

export function obliqueAscensionDegrees({ rightAscensionDeg, declinationDeg }, latitudeDeg, branch = "rising") {
  if (!Number.isFinite(rightAscensionDeg) || !Number.isFinite(declinationDeg) ||
      !Number.isFinite(latitudeDeg) || Math.abs(latitudeDeg) > 90) {
    throw new TypeError("valid RA, declination and geographic latitude are required");
  }
  const product = Math.tan(latitudeDeg * DEG) * Math.tan(declinationDeg * DEG);
  if (Math.abs(product) > 1) return null;
  if (branch !== "rising" && branch !== "setting") {
    throw new RangeError("branch must be rising or setting");
  }
  const ad = Math.asin(Math.max(-1, Math.min(1, product))) * RAD;
  return normalizeDegrees(rightAscensionDeg + (branch === "setting" ? ad : -ad));
}

function resolveLimit(body, limitDeg) {
  if (body === "Venus" && ![8, 10].includes(limitDeg)) {
    throw new RangeError("Venus requires the explicit SS Ch.9 8° or 10° branch");
  }
  if (Number.isFinite(limitDeg) && limitDeg > 0 && limitDeg < 90) return limitDeg;
  if (Object.hasOwn(SS9_LIMITS_DEG, body)) return SS9_LIMITS_DEG[body];
  throw new RangeError("explicit SS Ch.9 limitDeg is required for " + body);
}

/**
 * K = lagnantara-asu / 60. One degree of equatorial rotation is 60 pranas,
 * so K is numerically the absolute difference of the two oblique ascensions.
 * Visibility follows the strict Ch.9 condition K > C.
 */
export function evaluateSs9VisibilityFromEquatorial({
  body, sunEquatorial, objectEquatorial, latitudeDeg, limitDeg, elongationDeg = null,
  branch = "rising"
}) {
  if (!sunEquatorial || !objectEquatorial) {
    throw new TypeError("sun and object apparent equatorial coordinates are required");
  }
  const C = resolveLimit(body, limitDeg);
  const sunOA = obliqueAscensionDegrees(sunEquatorial, latitudeDeg, branch);
  const objectOA = obliqueAscensionDegrees(objectEquatorial, latitudeDeg, branch);
  if (sunOA === null || objectOA === null) {
    return { available: false, reason: "circumpolar-coordinate", body, limitDeg: C, K: null, visible: null };
  }
  const signedK = signedAngleDifference(objectOA, sunOA);
  return {
    available: true, body, latitudeDeg, branch, limitDeg: C,
    sunObliqueAscensionDeg: sunOA,
    objectObliqueAscensionDeg: objectOA,
    lagnantaraPrana: Math.abs(signedK) * 60,
    K: Math.abs(signedK), signedK, elongationDeg,
    appearance: Number.isFinite(elongationDeg)
      ? (elongationDeg > 0 ? "evening" : "morning")
      : null,
    visible: Math.abs(signedK) > C
  };
}

export function evaluateSs9Visibility({
  body, sun, object, latitudeDeg, obliquityDeg, limitDeg, branch = "rising"
}) {
  if (!sun || !object) throw new TypeError("sun and object apparent coordinates are required");
  return evaluateSs9VisibilityFromEquatorial({
    body,
    sunEquatorial: eclipticToEquatorial(sun, obliquityDeg),
    objectEquatorial: eclipticToEquatorial(object, obliquityDeg),
    latitudeDeg,
    limitDeg,
    elongationDeg: signedAngleDifference(object.longitudeDeg, sun.longitudeDeg),
    branch
  });
}

/**
 * Evaluate a sample from either apparent ecliptic coordinates or apparent
 * equatorial-of-date coordinates. All inputs must use one consistent frame.
 */
function evaluateSample({ body, latitudeDeg, limitDeg, branch = "rising" }, sample) {
  if (sample.sunEquatorial && sample.objectEquatorial) {
    return evaluateSs9VisibilityFromEquatorial({
      body,
      sunEquatorial: sample.sunEquatorial,
      objectEquatorial: sample.objectEquatorial,
      latitudeDeg,
      limitDeg,
      elongationDeg: sample.elongationDeg ?? null,
      branch
    });
  }
  return evaluateSs9Visibility({
    body, sun: sample.sun, object: sample.object, latitudeDeg,
    obliquityDeg: sample.obliquityDeg, limitDeg, branch
  });
}

/**
 * Scan a UTC interval, bracket every sampled state change, and refine each
 * transition. A 6-hour default step is intended for slow Guru/Shukra/Agastya
 * cycles; callers should reduce it for faster-changing targets.
 */
export function scanSs9Transitions({
  body, latitudeDeg, limitDeg, startUtcMs, endUtcMs, sampleAt,
  branch = "rising", stepHours = 6, toleranceMs = 60_000, maxIterations = 64
}) {
  if (typeof sampleAt !== "function") throw new TypeError("sampleAt must be a function");
  if (!Number.isFinite(startUtcMs) || !Number.isFinite(endUtcMs) || endUtcMs <= startUtcMs) {
    throw new RangeError("a positive UTC interval is required");
  }
  if (!Number.isFinite(stepHours) || stepHours <= 0 || stepHours > 24) {
    throw new RangeError("stepHours must be greater than 0 and at most 24");
  }
  const options = { body, latitudeDeg, limitDeg, sampleAt, branch, toleranceMs, maxIterations };
  const stepMs = stepHours * 3_600_000;
  const transitions = [];
  let leftMs = startUtcMs;
  let left = evaluateSample(options, sampleAt(leftMs));

  while (leftMs < endUtcMs) {
    const rightMs = Math.min(endUtcMs, leftMs + stepMs);
    const right = evaluateSample(options, sampleAt(rightMs));
    if (left.available && right.available && left.visible !== right.visible) {
      const transition = refineSs9Transition({
        ...options,
        startUtcMs: leftMs,
        endUtcMs: rightMs
      });
      if (transition) transitions.push(transition);
    }
    leftMs = rightMs;
    left = right;
  }
  return transitions;
}

/**
 * Refine one already-bracketed state transition. sampleAt(utcMilliseconds)
 * returns {sun, object, obliquityDeg}; all positions must share one frame.
 */
export function refineSs9Transition({
  body, latitudeDeg, limitDeg, startUtcMs, endUtcMs, sampleAt,
  branch = "rising", toleranceMs = 60_000, maxIterations = 64
}) {
  if (typeof sampleAt !== "function") throw new TypeError("sampleAt must be a function");
  if (!Number.isFinite(startUtcMs) || !Number.isFinite(endUtcMs) || endUtcMs <= startUtcMs) {
    throw new RangeError("a positive UTC bracket is required");
  }
  if (!Number.isFinite(toleranceMs) || toleranceMs <= 0) throw new RangeError("toleranceMs must be positive");
  const evaluate = instant => evaluateSample(
    { body, latitudeDeg, limitDeg, branch },
    sampleAt(instant)
  );
  let leftMs = startUtcMs;
  let rightMs = endUtcMs;
  let left = evaluate(leftMs);
  let right = evaluate(rightMs);
  if (!left.available || !right.available || left.visible === right.visible) return null;
  const beforeVisible = left.visible;
  for (let i = 0; i < maxIterations && rightMs - leftMs > toleranceMs; i++) {
    const midMs = (leftMs + rightMs) / 2;
    const mid = evaluate(midMs);
    if (!mid.available) return null;
    if (mid.visible === beforeVisible) {
      leftMs = midMs;
      left = mid;
    } else {
      rightMs = midMs;
      right = mid;
    }
  }
  const transitionMs = (leftMs + rightMs) / 2;
  const at = evaluate(transitionMs);
  const event = beforeVisible ? "Asta" : "Udaya";
  const appearance = at.appearance;
  const direction = appearance === null
    ? null
    : (appearance === "evening" ? "west" : "east");
  return {
    body, event, direction, branch,
    utcMilliseconds: transitionMs,
    accuracyMilliseconds: rightMs - leftMs,
    latitudeDeg, limitDeg: at.limitDeg, K: at.K,
    elongationDeg: at.elongationDeg, appearance,
    beforeVisible, afterVisible: !beforeVisible
  };
}

/** Elevation-dependent horizon dip; deliberately excluded from classical K/C. */
export function geometricHorizonDipDegrees(elevationMeters, earthRadiusMeters = 6_371_000) {
  if (!Number.isFinite(elevationMeters) || elevationMeters < 0 ||
      !Number.isFinite(earthRadiusMeters) || earthRadiusMeters <= 0) {
    throw new RangeError("non-negative elevation and positive Earth radius are required");
  }
  return Math.acos(earthRadiusMeters / (earthRadiusMeters + elevationMeters)) * RAD;
}
