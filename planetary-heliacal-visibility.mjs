/**
 * Schaefer (1985) twilight visibility criterion.
 *
 * This module evaluates one supplied sky sample. Astronomy Engine (or another
 * ephemeris) must supply apparent altitude/azimuth and apparent V magnitude.
 * It deliberately does not calculate ephemerides or claim weather-aware
 * visibility. Defaults are research parameters, not universal city truth.
 *
 * Model equations documented in the cited Schaefer 1985 reconstruction.
 */
const DEG = Math.PI / 180;

function finite(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(name + " must be finite");
  return number;
}

function positive(value, name) {
  const number = finite(value, name);
  if (number <= 0) throw new RangeError(name + " must be greater than zero");
  return number;
}

function normalizeAzimuth(value) {
  return ((finite(value, "azimuth") % 360) + 360) % 360;
}

function azimuthSeparationRadians(a, b) {
  const difference = Math.abs(normalizeAzimuth(a) - normalizeAzimuth(b));
  return Math.min(difference, 360 - difference) * DEG;
}

function rozenbergAirMass(altitudeDeg) {
  const zenithDistance = (90 - altitudeDeg) * DEG;
  const cosZ = Math.cos(zenithDistance);
  const denominator = cosZ + 0.025 * Math.exp(-11 * cosZ);
  return 1 / denominator;
}

export function evaluateSchaefer1985Visibility(sample, options = {}) {
  if (!sample || typeof sample !== "object") throw new TypeError("A sky sample is required");
  const objectAltitudeDeg = finite(sample.objectAltitudeDeg, "objectAltitudeDeg");
  const sunAltitudeDeg = finite(sample.sunAltitudeDeg, "sunAltitudeDeg");
  const objectAzimuthDeg = normalizeAzimuth(sample.objectAzimuthDeg);
  const sunAzimuthDeg = normalizeAzimuth(sample.sunAzimuthDeg);
  const apparentMagnitude = finite(sample.apparentMagnitude, "apparentMagnitude");
  const extinctionCoefficient = positive(options.extinctionCoefficient ?? 0.25, "extinctionCoefficient");
  const zenithLimitingMagnitude = finite(options.zenithLimitingMagnitude ?? 6.0, "zenithLimitingMagnitude");
  const twilightLimitDeg = finite(options.twilightLimitDeg ?? -18, "twilightLimitDeg");

  if (twilightLimitDeg >= 0 || twilightLimitDeg < -30) {
    throw new RangeError("twilightLimitDeg must be between -30 and 0 degrees");
  }

  const base = {
    modelId: "schaefer-1985-twilight-visibility",
    visible: false,
    objectAltitudeDeg,
    sunAltitudeDeg,
    apparentMagnitude,
    extinctionCoefficient,
    zenithLimitingMagnitude
  };

  // This criterion is evaluated only while the target is above the true
  // geometric horizon and the Sun is between astronomical twilight and sunrise.
  if (objectAltitudeDeg <= 0 || sunAltitudeDeg > 0 || sunAltitudeDeg < twilightLimitDeg) {
    return { ...base, reason: "outside-observation-window" };
  }

  const zenithDistance = (90 - objectAltitudeDeg) * DEG;
  const airMass = rozenbergAirMass(objectAltitudeDeg);
  const deltaAz = azimuthSeparationRadians(objectAzimuthDeg, sunAzimuthDeg);
  const sunAltitudeRad = sunAltitudeDeg * DEG;

  const x = -0.2 * (zenithLimitingMagnitude - 7.93 + extinctionCoefficient);
  const b0 = 79.4 * (10 ** x - 1) ** 2 - 589 * extinctionCoefficient;
  const l5 = 4.75
    - (deltaAz * zenithDistance / 3)
    + sunAltitudeRad * (8.2 * zenithDistance + 12)
    + 2.86 * zenithDistance;

  const skyBrightness = l5 >= -2.07
    ? b0 + (extinctionCoefficient / 0.20) * (10 ** l5)
    : b0 + 589 * extinctionCoefficient;

  if (!Number.isFinite(skyBrightness) || skyBrightness < 0) {
    return { ...base, reason: "invalid-sky-brightness", airMass, skyBrightness, l5 };
  }

  const [c5, k5] = skyBrightness < 1649
    ? [1.58e-10, 0.0126]
    : [4.4668e-9, 1.258e-6];
  const thresholdIlluminance = c5 * (1 + Math.sqrt(k5 * skyBrightness)) ** 2;
  const limitingMagnitude = -16.57
    - extinctionCoefficient * airMass
    - 2.5 * Math.log10(thresholdIlluminance);
  const visibilityMargin = limitingMagnitude - apparentMagnitude;

  return {
    ...base,
    visible: apparentMagnitude <= limitingMagnitude,
    reason: apparentMagnitude <= limitingMagnitude ? "visibility-threshold-met" : "object-too-faint",
    airMass,
    deltaAzimuthDeg: deltaAz / DEG,
    skyBrightness,
    limitingMagnitude,
    visibilityMargin,
    l5
  };
}
