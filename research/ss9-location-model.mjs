/**
 * Research-only baseline geometry for Surya Siddhanta Ch.9.
 * This calculates K from apparent geocentric RA/Dec and direct horizon-crossing
 * sidereal angles. That is intended as a spherical-geometry equivalent of the
 * ayana/akṣaja dṛkkarma in vv. 1-9, but has not yet been numerically validated
 * against the traditional two-part method (including the high-latitude-star
 * procedure). Numerical root refinement stands in for vv. 10-11 and also needs
 * source-by-source validation. Research-only; not production SS9.
 * Caller supplies apparent geocentric coordinates at the same instant.
 */
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export const SS9_LIMITS_DEG = Object.freeze({ Jupiter: 11, Agastya: 13 });

/**
 * Resolve the Ch.9 horizon branch and kalāṃśa for a named heliacal event.
 * Venus 9.7: west-setting/east-rising = 8°; east-setting/west-rising = 10°.
 * The superior planets and Agastya use west-setting Asta / east-rising Udaya.
 */
export function resolveSs9EventProfile(body, event, direction) {
  if (event !== "Asta" && event !== "Udaya") {
    throw new RangeError("event must be Asta or Udaya");
  }
  if (direction !== "east" && direction !== "west") {
    throw new RangeError("direction must be east or west");
  }
  if (body === "Venus") {
    const profiles = {
      "Asta:west": { branch: "setting", limitDeg: 8 },
      "Udaya:east": { branch: "rising", limitDeg: 8 },
      "Asta:east": { branch: "rising", limitDeg: 10 },
      "Udaya:west": { branch: "setting", limitDeg: 10 }
    };
    return { ...profiles[event + ":" + direction], body, event, direction };
  }
  const limitDeg = resolveLimit(body, undefined);
  if (event === "Asta" && direction === "west") {
    return { body, event, direction, branch: "setting", limitDeg };
  }
  if (event === "Udaya" && direction === "east") {
    return { body, event, direction, branch: "rising", limitDeg };
  }
  throw new RangeError(body + " Ch.9 profile does not define " + event + " in the " + direction);
}

/**
 * Find only the physically/classically valid event-direction combinations.
 * This prevents the opposite-horizon branch from being mislabelled as the
 * same heliacal event.
 */
export function scanSs9Events({
  body, latitudeDeg, startUtcMs, endUtcMs, sampleAt,
  stepHours = 6, toleranceMs = 60_000, maxIterations = 64
}) {
  const profiles = body === "Venus"
    ? [
        resolveSs9EventProfile("Venus", "Asta", "west"),
        resolveSs9EventProfile("Venus", "Udaya", "east"),
        resolveSs9EventProfile("Venus", "Asta", "east"),
        resolveSs9EventProfile("Venus", "Udaya", "west")
      ]
    : [
        resolveSs9EventProfile(body, "Asta", "west"),
        resolveSs9EventProfile(body, "Udaya", "east")
      ];
  const events = [];
  for (const profile of profiles) {
    const found = scanSs9Transitions({
      body,
      latitudeDeg,
      limitDeg: profile.limitDeg,
      branch: profile.branch,
      startUtcMs,
      endUtcMs,
      sampleAt,
      stepHours,
      toleranceMs,
      maxIterations
    });
    for (const event of found) {
      if (event.event === profile.event && event.direction === profile.direction) {
        events.push({ ...event, eventProfile: profile });
      }
    }
  }
  return events.sort((a, b) => a.utcMilliseconds - b.utcMilliseconds);
}

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

/**
 * Local sidereal angle at which an apparent equatorial body crosses the
 * geometric horizon. This direct spherical solution includes its actual
 * declination (and therefore its ecliptic latitude) rather than applying
 * a separate tabular drikkarma correction to longitude.
 */
export function horizonCrossingSiderealAngleDegrees(
  { rightAscensionDeg, declinationDeg }, latitudeDeg, branch = "rising"
) {
  const oa = obliqueAscensionDegrees(
    { rightAscensionDeg, declinationDeg }, latitudeDeg, branch
  );
  if (oa === null) return null;
  return normalizeDegrees(oa + (branch === "setting" ? 90 : -90));
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
  const sunHorizonAngle = horizonCrossingSiderealAngleDegrees(sunEquatorial, latitudeDeg, branch);
  const objectHorizonAngle = horizonCrossingSiderealAngleDegrees(objectEquatorial, latitudeDeg, branch);
  if (sunOA === null || objectOA === null || sunHorizonAngle === null || objectHorizonAngle === null) {
    return { available: false, reason: "circumpolar-coordinate", body, branch, limitDeg: C, K: null, visible: null };
  }
  const signedK = signedAngleDifference(objectHorizonAngle, sunHorizonAngle);
  return {
    available: true, body, latitudeDeg, branch, limitDeg: C,
    sunObliqueAscensionDeg: sunOA,
    objectObliqueAscensionDeg: objectOA,
    sunHorizonSiderealAngleDeg: sunHorizonAngle,
    objectHorizonSiderealAngleDeg: objectHorizonAngle,
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
