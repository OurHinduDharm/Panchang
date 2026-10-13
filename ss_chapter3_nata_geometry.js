/**
 * Research-only geometry control for Sūrya-siddhānta III.37–39 study.
 *
 * IMPORTANT: These functions implement the modern spherical altitude identity
 * as an independent geometry check. They do NOT claim to reproduce the text's
 * historical sine/versed-sine tables, shadow construction, prāṇa/nāḍī rules,
 * or a source-derived classical nata. East/west sign is never inferred from
 * altitude alone.
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const GEOMETRY_TOLERANCE = 1e-12;

function finiteNumber(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be a finite number");
}

function validateLatitude(latitudeDeg) {
  finiteNumber(latitudeDeg, "latitudeDeg");
  if (latitudeDeg < -90 || latitudeDeg > 90) {
    throw new RangeError("latitudeDeg must be in [-90, 90]");
  }
}

function validateDeclination(declinationDeg) {
  finiteNumber(declinationDeg, "declinationDeg");
  if (declinationDeg < -90 || declinationDeg > 90) {
    throw new RangeError("declinationDeg must be in [-90, 90]");
  }
}

function validateAltitude(altitudeDeg) {
  finiteNumber(altitudeDeg, "altitudeDeg");
  if (altitudeDeg < -90 || altitudeDeg > 90) {
    throw new RangeError("altitudeDeg must be in [-90, 90]");
  }
}

/**
 * Modern spherical control: solar geometric altitude from latitude,
 * declination, and signed hour angle. Positive H means west/afternoon;
 * negative H means east/morning. No refraction or topocentric correction.
 */
export function solarAltitudeFromHourAngle({ latitudeDeg, declinationDeg, hourAngleDeg }) {
  validateLatitude(latitudeDeg);
  validateDeclination(declinationDeg);
  finiteNumber(hourAngleDeg, "hourAngleDeg");
  const phi = latitudeDeg * DEG;
  const delta = declinationDeg * DEG;
  const hourAngle = hourAngleDeg * DEG;
  const sinAltitude =
    Math.sin(phi) * Math.sin(delta) +
    Math.cos(phi) * Math.cos(delta) * Math.cos(hourAngle);
  // The clamp here only removes floating-point overshoot of the sine range.
  const altitudeDeg = Math.asin(Math.max(-1, Math.min(1, sinAltitude))) * RAD;
  return {
    altitudeDeg,
    provenance: "geometry-only",
    method: "modern spherical altitude identity",
    signConvention: "hourAngleDeg > 0 west/afternoon; hourAngleDeg < 0 east/morning"
  };
}

/**
 * Invert geometric altitude to the magnitude of hour angle.
 * Returns |H| only: altitude cannot distinguish morning from afternoon.
 * Impossible geometry is rejected except for tiny floating-point overshoot.
 */
export function hourAngleMagnitudeFromAltitude({ latitudeDeg, declinationDeg, altitudeDeg }) {
  validateLatitude(latitudeDeg);
  validateDeclination(declinationDeg);
  validateAltitude(altitudeDeg);

  const phi = latitudeDeg * DEG;
  const delta = declinationDeg * DEG;
  const altitude = altitudeDeg * DEG;
  const denominator = Math.cos(phi) * Math.cos(delta);

  if (Math.abs(denominator) < GEOMETRY_TOLERANCE) {
    throw new RangeError("hour angle is indeterminate for this polar/declination geometry");
  }

  const cosHourAngle =
    (Math.sin(altitude) - Math.sin(phi) * Math.sin(delta)) / denominator;

  if (cosHourAngle < -1 - GEOMETRY_TOLERANCE ||
      cosHourAngle > 1 + GEOMETRY_TOLERANCE) {
    throw new RangeError("altitude is incompatible with the supplied latitude and declination");
  }

  const boundedCosHourAngle = Math.max(-1, Math.min(1, cosHourAngle));
  return {
    hourAngleMagnitudeDeg: Math.acos(boundedCosHourAngle) * RAD,
    cosHourAngle,
    provenance: "geometry-only",
    method: "inverse modern spherical altitude identity",
    signStatus: "unsigned; supply east/west provenance separately"
  };
}

/**
 * Convert an already signed angular hour angle to clock-time equivalents.
 * Positive means west/afternoon; negative means east/morning.
 * These are modern angular/time equivalents, not a claim that a historical
 * source's nata has already been derived.
 */
export function nataTimeEquivalentFromHourAngle({ signedHourAngleDeg }) {
  finiteNumber(signedHourAngleDeg, "signedHourAngleDeg");
  const hours = signedHourAngleDeg / 15;
  return {
    signedHourAngleDeg,
    signedHours: hours,
    signedGhatis: hours * 2.5,
    provenance: "geometry-only",
    method: "angular hour-angle conversion; not source-derived classical nata",
    signConvention: "positive west/afternoon; negative east/morning"
  };
}

/** Apply a separately established east/west sign to the inverse magnitude. */
export function signedHourAngleFromMagnitude({ hourAngleMagnitudeDeg, direction }) {
  finiteNumber(hourAngleMagnitudeDeg, "hourAngleMagnitudeDeg");
  if (hourAngleMagnitudeDeg < 0 || hourAngleMagnitudeDeg > 180) {
    throw new RangeError("hourAngleMagnitudeDeg must be in [0, 180]");
  }
  if (direction !== "east" && direction !== "west") {
    throw new TypeError('direction must be explicitly "east" or "west"');
  }
  return {
    signedHourAngleDeg: direction === "east" ? -hourAngleMagnitudeDeg : hourAngleMagnitudeDeg,
    provenance: "geometry-only",
    signSource: "explicit caller-supplied east/west direction"
  };
}

function nearlyEqual(a, b, tolerance = 1e-9) {
  return Math.abs(a - b) <= tolerance;
}

export function runChapter3NataGeometryTests() {
  const tests = [];
  const test = (name, fn) => {
    try {
      const result = fn();
      tests.push({ name, passed: result !== false });
    } catch (error) {
      tests.push({ name, passed: false, error: error.message });
    }
  };

  test("meridian altitude equals 90° − |latitude − declination|", () => {
    const latitudeDeg = 29;
    const declinationDeg = 12;
    const actual = solarAltitudeFromHourAngle({ latitudeDeg, declinationDeg, hourAngleDeg: 0 });
    return nearlyEqual(actual.altitudeDeg, 90 - Math.abs(latitudeDeg - declinationDeg));
  });

  test("forward then inverse reproduces |H| across a synthetic geometry grid", () => {
    const latitudes = [-65, -30, 0, 29, 55, 75];
    const declinations = [-23.4, -10, 0, 15, 23.4];
    const hourAngles = [0, 7, 30, 60, 100, 150];
    for (const latitudeDeg of latitudes) {
      for (const declinationDeg of declinations) {
        for (const hourAngleDeg of hourAngles) {
          if (Math.abs(Math.cos(latitudeDeg * DEG) * Math.cos(declinationDeg * DEG)) < 1e-8) continue;
          const forward = solarAltitudeFromHourAngle({ latitudeDeg, declinationDeg, hourAngleDeg });
          const inverse = hourAngleMagnitudeFromAltitude({
            latitudeDeg, declinationDeg, altitudeDeg: forward.altitudeDeg
          });
          if (!nearlyEqual(inverse.hourAngleMagnitudeDeg, hourAngleDeg, 2e-7)) return false;
        }
      }
    }
    return true;
  });

  test("morning and evening share altitude but require opposite explicit signs", () => {
    const base = { latitudeDeg: 29.583, declinationDeg: 7.25 };
    const morning = solarAltitudeFromHourAngle({ ...base, hourAngleDeg: -42 });
    const evening = solarAltitudeFromHourAngle({ ...base, hourAngleDeg: 42 });
    const inverse = hourAngleMagnitudeFromAltitude({ ...base, altitudeDeg: morning.altitudeDeg });
    const east = signedHourAngleFromMagnitude({
      hourAngleMagnitudeDeg: inverse.hourAngleMagnitudeDeg, direction: "east"
    });
    const west = signedHourAngleFromMagnitude({
      hourAngleMagnitudeDeg: inverse.hourAngleMagnitudeDeg, direction: "west"
    });
    return nearlyEqual(morning.altitudeDeg, evening.altitudeDeg) &&
      nearlyEqual(east.signedHourAngleDeg, -42, 2e-7) &&
      nearlyEqual(west.signedHourAngleDeg, 42, 2e-7);
  });

  test("zenith/horizon boundary geometry at equator and equinox", () => {
    const noon = solarAltitudeFromHourAngle({ latitudeDeg: 0, declinationDeg: 0, hourAngleDeg: 0 });
    const horizon = solarAltitudeFromHourAngle({ latitudeDeg: 0, declinationDeg: 0, hourAngleDeg: 90 });
    return nearlyEqual(noon.altitudeDeg, 90) && nearlyEqual(horizon.altitudeDeg, 0);
  });

  test("impossible altitude is rejected, not silently clamped", () => {
    try {
      hourAngleMagnitudeFromAltitude({ latitudeDeg: 45, declinationDeg: 0, altitudeDeg: 80 });
      return false;
    } catch (error) {
      return error instanceof RangeError;
    }
  });

  test("polar-degenerate inverse geometry is rejected as indeterminate", () => {
    try {
      hourAngleMagnitudeFromAltitude({ latitudeDeg: 90, declinationDeg: 0, altitudeDeg: 0 });
      return false;
    } catch (error) {
      return error instanceof RangeError;
    }
  });

  test("15° signed hour angle converts to 1 hour and 2.5 ghatis", () => {
    const result = nataTimeEquivalentFromHourAngle({ signedHourAngleDeg: 15 });
    return nearlyEqual(result.signedHours, 1) && nearlyEqual(result.signedGhatis, 2.5);
  });

  test("−6° signed hour angle converts to −0.4 hour and −1 ghati", () => {
    const result = nataTimeEquivalentFromHourAngle({ signedHourAngleDeg: -6 });
    return nearlyEqual(result.signedHours, -0.4) && nearlyEqual(result.signedGhatis, -1);
  });

  test("inverse altitude never invents an east/west sign", () => {
    const result = hourAngleMagnitudeFromAltitude({
      latitudeDeg: 29, declinationDeg: 10, altitudeDeg:
        solarAltitudeFromHourAngle({ latitudeDeg: 29, declinationDeg: 10, hourAngleDeg: 35 }).altitudeDeg
    });
    return result.signStatus.includes("unsigned");
  });

  test("missing/invalid direction is rejected", () => {
    try {
      signedHourAngleFromMagnitude({ hourAngleMagnitudeDeg: 35, direction: "unknown" });
      return false;
    } catch (error) {
      return error instanceof TypeError;
    }
  });

  return {
    tests,
    total: tests.length,
    passed: tests.filter(item => item.passed).length,
    allPassed: tests.every(item => item.passed),
    note: "All tests validate modern spherical geometry and unit conversion only; none certifies a source-derived classical nata."
  };
}
