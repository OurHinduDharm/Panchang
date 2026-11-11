const DEG_TO_RAD = Math.PI / 180;

/**
 * Kasten & Young (1989) optical air-mass approximation.
 * Validity is intentionally restricted to apparent altitude > -5 degrees.
 * Returns null outside that domain instead of extrapolating below the horizon.
 */
export function kastenYoungAirmass(apparentAltitudeDegrees) {
  if (!Number.isFinite(apparentAltitudeDegrees)) {
    throw new TypeError("apparentAltitudeDegrees must be finite");
  }
  if (apparentAltitudeDegrees <= -5 || apparentAltitudeDegrees > 90) return null;
  const h = apparentAltitudeDegrees;
  const denominator = Math.sin(h * DEG_TO_RAD) +
    0.50572 * Math.pow(h + 6.07995, -1.6364);
  return denominator > 0 ? 1 / denominator : null;
}

/** Great-circle separation for two horizontal (altitude, azimuth) positions. */
export function angularSeparationAltAz(a, b) {
  for (const [name, point] of [["a", a], ["b", b]]) {
    if (!point || !Number.isFinite(point.altitude) || !Number.isFinite(point.azimuth)) {
      throw new TypeError(name + " must contain finite altitude and azimuth");
    }
  }
  const altA = a.altitude * DEG_TO_RAD;
  const altB = b.altitude * DEG_TO_RAD;
  const deltaAz = (a.azimuth - b.azimuth) * DEG_TO_RAD;
  const cosine = Math.sin(altA) * Math.sin(altB) +
    Math.cos(altA) * Math.cos(altB) * Math.cos(deltaAz);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) / DEG_TO_RAD;
}

export function classifyTwilight(solarAltitudeDegrees) {
  if (!Number.isFinite(solarAltitudeDegrees)) {
    throw new TypeError("solarAltitudeDegrees must be finite");
  }
  if (solarAltitudeDegrees >= 0) return "daylight";
  if (solarAltitudeDegrees >= -6) return "civil";
  if (solarAltitudeDegrees >= -12) return "nautical";
  if (solarAltitudeDegrees >= -18) return "astronomical";
  return "night";
}

/**
 * Computes auditable physical visibility inputs at a local planetary horizon
 * event. This is a feature/diagnostic layer, NOT a naked-eye visibility
 * probability and NOT a calibrated Panchang Asta/Udaya decision.
 *
 * extinctionCoefficientMagPerAirmass must be supplied from an explicit
 * atmosphere assumption or measurement. No hidden "standard sky" is assumed.
 */
export function computeVisibilityPhysics({
  planet,
  sun,
  moon,
  atmosphere
}) {
  if (!planet || !sun || !moon) {
    throw new TypeError("planet, sun and moon observations are required");
  }
  if (!Number.isFinite(planet.altitude) || !Number.isFinite(planet.azimuth) ||
      !Number.isFinite(planet.apparentMagnitude)) {
    throw new TypeError("planet requires finite altitude, azimuth and apparentMagnitude");
  }
  if (!Number.isFinite(planet.illuminatedFraction) ||
      planet.illuminatedFraction < 0 || planet.illuminatedFraction > 1) {
    throw new RangeError("planet.illuminatedFraction must be between 0 and 1");
  }
  if (!Number.isFinite(sun.altitude) || !Number.isFinite(sun.azimuth) ||
      !Number.isFinite(moon.altitude) || !Number.isFinite(moon.azimuth) ||
      !Number.isFinite(moon.illuminatedFraction) ||
      moon.illuminatedFraction < 0 || moon.illuminatedFraction > 1) {
    throw new TypeError("sun and moon require finite horizontal coordinates and moon illumination");
  }
  const extinction = atmosphere?.extinctionCoefficientMagPerAirmass;
  if (!Number.isFinite(extinction) || extinction < 0 || extinction > 2) {
    throw new RangeError("atmosphere.extinctionCoefficientMagPerAirmass must be supplied from 0 to 2");
  }

  const airmass = kastenYoungAirmass(planet.altitude);
  return {
    apparentMagnitude: planet.apparentMagnitude,
    illuminatedFraction: planet.illuminatedFraction,
    planetAltitudeDegrees: planet.altitude,
    sunAltitudeDegrees: sun.altitude,
    moonAltitudeDegrees: moon.altitude,
    sunPlanetSeparationDegrees: angularSeparationAltAz(planet, sun),
    moonPlanetSeparationDegrees: angularSeparationAltAz(planet, moon),
    moonIlluminatedFraction: moon.illuminatedFraction,
    twilightClass: classifyTwilight(sun.altitude),
    airmass,
    extinctionCoefficientMagPerAirmass: extinction,
    extinctionMagnitude: airmass === null ? null : extinction * airmass,
    extinctionCorrectedMagnitude: airmass === null
      ? null
      : planet.apparentMagnitude + extinction * airmass,
    status: airmass === null ? "airmass-out-of-domain" : "diagnostic-only"
  };
}
