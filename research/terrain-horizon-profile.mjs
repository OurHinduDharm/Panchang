const EARTH_MEAN_RADIUS_METERS = 6_371_000;
const DEG_PER_RAD = 180 / Math.PI;

function finiteRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(label + " must be between " + min + " and " + max);
  }
}

function wrap360(value) {
  return ((value % 360) + 360) % 360;
}

function validateObserver(observer) {
  if (!observer || typeof observer !== "object") {
    throw new TypeError("observer is required");
  }
  finiteRange(observer.latitude, -90, 90, "observer.latitude");
  finiteRange(observer.longitude, -180, 180, "observer.longitude");
  finiteRange(observer.elevationMeters, -500, 100000, "observer.elevationMeters");
}

function terrainElevationAngle({
  terrainElevationMeters,
  distanceMeters,
  observerElevationMeters,
  observerHeightAboveGroundMeters,
  refractionCoefficient
}) {
  finiteRange(terrainElevationMeters, -12000, 100000, "terrainElevationMeters");
  finiteRange(distanceMeters, 1, 250000, "distanceMeters");
  const eyeElevation = observerElevationMeters + observerHeightAboveGroundMeters;
  const effectiveEarthRadius = EARTH_MEAN_RADIUS_METERS / (1 - refractionCoefficient);
  const curvatureDrop = distanceMeters ** 2 / (2 * effectiveEarthRadius);
  return Math.atan2(
    terrainElevationMeters - eyeElevation - curvatureDrop,
    distanceMeters
  ) * DEG_PER_RAD;
}

/**
 * Builds an azimuth-dependent terrain horizon from DEM ray samples.
 *
 * Each ray is one azimuth direction and contains terrain samples with
 * horizontal distance from the observer and absolute terrain elevation MSL.
 * The highest apparent terrain angle on each ray becomes that direction's
 * obstruction horizon. The raster-to-ray sampler is deliberately separate:
 * this function consumes numeric DEM samples and does not guess NoData cells.
 */
export function buildTerrainHorizonProfile({
  observer,
  rays,
  observerHeightAboveGroundMeters = 2,
  refractionCoefficient = 0,
  maxInterpolationGapDeg = 10,
  source = "dem-derived"
}) {
  validateObserver(observer);
  if (!Array.isArray(rays) || rays.length < 3) {
    throw new TypeError("rays must contain at least three azimuth directions");
  }
  finiteRange(observerHeightAboveGroundMeters, 0, 100, "observerHeightAboveGroundMeters");
  finiteRange(refractionCoefficient, 0, 0.3, "refractionCoefficient");
  finiteRange(maxInterpolationGapDeg, 0.1, 180, "maxInterpolationGapDeg");
  if (typeof source !== "string" || !source.trim()) {
    throw new TypeError("source must identify the DEM or horizon source");
  }

  const seen = new Set();
  const samples = rays.map((ray, index) => {
    if (!ray || typeof ray !== "object") {
      throw new TypeError("rays[" + index + "] must be an object");
    }
    finiteRange(ray.azimuthDeg, 0, 360, "rays[" + index + "].azimuthDeg");
    const azimuthDeg = wrap360(ray.azimuthDeg);
    const key = azimuthDeg.toFixed(8);
    if (seen.has(key)) throw new RangeError("Duplicate terrain ray azimuth: " + azimuthDeg);
    seen.add(key);
    if (!Array.isArray(ray.samples) || ray.samples.length === 0) {
      throw new TypeError("Every terrain ray must contain at least one valid DEM sample");
    }
    let horizonAltitudeDeg = -90;
    for (const [sampleIndex, sample] of ray.samples.entries()) {
      if (!sample || typeof sample !== "object") {
        throw new TypeError("Terrain sample must be an object");
      }
      const angle = terrainElevationAngle({
        terrainElevationMeters: sample.elevationMeters,
        distanceMeters: sample.distanceMeters,
        observerElevationMeters: observer.elevationMeters,
        observerHeightAboveGroundMeters,
        refractionCoefficient
      });
      horizonAltitudeDeg = Math.max(horizonAltitudeDeg, angle);
    }
    return Object.freeze({ azimuthDeg, horizonAltitudeDeg });
  }).sort((a, b) => a.azimuthDeg - b.azimuthDeg);

  let largestGapDeg = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const next = samples[(i + 1) % samples.length];
    const gap = i === samples.length - 1
      ? next.azimuthDeg + 360 - samples[i].azimuthDeg
      : next.azimuthDeg - samples[i].azimuthDeg;
    largestGapDeg = Math.max(largestGapDeg, gap);
  }
  if (largestGapDeg > maxInterpolationGapDeg) {
    throw new RangeError(
      "Terrain profile has an azimuth coverage gap of " +
      largestGapDeg.toFixed(3) + "°, above maxInterpolationGapDeg"
    );
  }

  return Object.freeze({
    schemaVersion: 1,
    source: source.trim(),
    observer: Object.freeze({ ...observer }),
    observerHeightAboveGroundMeters,
    refractionCoefficient,
    maxInterpolationGapDeg,
    largestGapDeg,
    samples: Object.freeze(samples)
  });
}

/** Circular linear interpolation; refuses to bridge unmeasured azimuth gaps. */
export function getTerrainHorizonAltitude(profile, azimuthDeg) {
  if (!profile || profile.schemaVersion !== 1 || !Array.isArray(profile.samples) ||
      profile.samples.length < 3) {
    throw new TypeError("A valid terrain horizon profile is required");
  }
  finiteRange(azimuthDeg, -3600, 3600, "azimuthDeg");
  const azimuth = wrap360(azimuthDeg);
  const samples = profile.samples;
  let rightIndex = samples.findIndex(sample => sample.azimuthDeg >= azimuth);
  if (rightIndex < 0) rightIndex = 0;
  const leftIndex = (rightIndex - 1 + samples.length) % samples.length;
  const left = samples[leftIndex];
  const right = samples[rightIndex];

  const leftAz = left.azimuthDeg;
  const rightAz = right.azimuthDeg <= leftAz
    ? right.azimuthDeg + 360
    : right.azimuthDeg;
  const queryAz = azimuth < leftAz ? azimuth + 360 : azimuth;
  const gap = rightAz - leftAz;
  if (gap > profile.maxInterpolationGapDeg + 1e-9) {
    throw new RangeError("Requested azimuth falls inside an unmeasured terrain gap");
  }
  if (gap === 0) return left.horizonAltitudeDeg;
  const fraction = (queryAz - leftAz) / gap;
  return left.horizonAltitudeDeg +
    fraction * (right.horizonAltitudeDeg - left.horizonAltitudeDeg);
}

/** Tests whether an apparent object position clears the DEM terrain skyline. */
export function evaluateTerrainVisibility({
  profile,
  azimuthDeg,
  apparentAltitudeDeg,
  clearanceMarginDeg = 0.25
}) {
  finiteRange(apparentAltitudeDeg, -90, 90, "apparentAltitudeDeg");
  finiteRange(clearanceMarginDeg, 0, 10, "clearanceMarginDeg");
  const horizonAltitudeDeg = getTerrainHorizonAltitude(profile, azimuthDeg);
  const requiredAltitudeDeg = horizonAltitudeDeg + clearanceMarginDeg;
  return Object.freeze({
    azimuthDeg: wrap360(azimuthDeg),
    apparentAltitudeDeg,
    terrainHorizonAltitudeDeg: horizonAltitudeDeg,
    clearanceMarginDeg,
    requiredAltitudeDeg,
    visibleAboveTerrain: apparentAltitudeDeg >= requiredAltitudeDeg,
    status: apparentAltitudeDeg >= requiredAltitudeDeg
      ? "above-terrain-horizon"
      : "terrain-obstructed",
    method: "dem-ray-max-elevation-with-circular-azimuth-interpolation"
  });
}
