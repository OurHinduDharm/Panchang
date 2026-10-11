/**
 * Isolated Sūrya-siddhānta VII.8–10 dṛkkarma candidate.
 *
 * Uses geocentric sidereal ecliptic longitude and signed ecliptic latitude,
 * converts to the stated tropical/equinox frame for declination/RA, applies
 * Ayana first, then derives Aksha from the intermediate corrected ecliptic
 * point. This is a testable candidate, not a claim that the whole Chapter VII
 * or Chapter IX event algorithm has been independently validated.
 */

function normalize360(value) {
  const x = value % 360;
  return x < 0 ? x + 360 : x;
}

function signedAngleDelta(a, b) {
  return ((a - b + 540) % 360) - 180;
}

function eclipticEquatorial(longitudeDeg, obliquityDeg, latitudeDeg = 0) {
  const lambda = normalize360(longitudeDeg) * Math.PI / 180;
  const beta = latitudeDeg * Math.PI / 180;
  const epsilon = obliquityDeg * Math.PI / 180;

  const x = Math.cos(beta) * Math.cos(lambda);
  const y = Math.cos(beta) * Math.sin(lambda) * Math.cos(epsilon) -
    Math.sin(beta) * Math.sin(epsilon);
  const z = Math.cos(beta) * Math.sin(lambda) * Math.sin(epsilon) +
    Math.sin(beta) * Math.cos(epsilon);

  const rightAscensionDeg = normalize360(
    Math.atan2(y, x) * 180 / Math.PI
  );
  const declinationDeg = Math.asin(
    Math.max(-1, Math.min(1, z))
  ) * 180 / Math.PI;
  return { rightAscensionDeg, declinationDeg };
}

/**
 * Compute the sequential correction candidate from already-calculated
 * geocentric planetary state and local sidereal angle.
 *
 * Ayana: latitude (arcminutes) × absolute declination (degrees) yields
 * arcseconds; same-name latitude/declination is subtractive, unlike-name
 * is additive (VII.10).
 *
 * Aksha: signed planetary latitude × tan(observer latitude) ×
 * (planetary time from meridian / planetary half-day) (VII.8–9).
 * Crucially, VII.8 says the time from meridian and half-day are those of
 * the planet's own place. They are derived from the uncorrected planetary
 * longitude/latitude; the Ayana-corrected ecliptic point is the intermediate
 * longitude to which the Aksha correction is then applied, not a replacement
 * RA/declination for calculating the time ratio.
 */
export function calculateChapter7SequentialDrikkarma({
  siderealLongitudeDeg,
  planetLatitudeDeg,
  observerLatitudeDeg,
  localSiderealAngleDeg,
  ayanamshaDeg = 24.217,
  obliquityDeg = 24,
  planetDeclinationDeg = NaN,
  planetRightAscensionDeg = NaN
}) {
  const inputs = [
    siderealLongitudeDeg, planetLatitudeDeg, observerLatitudeDeg,
    localSiderealAngleDeg, ayanamshaDeg, obliquityDeg
  ];
  if (!inputs.every(Number.isFinite) || Math.abs(observerLatitudeDeg) >= 90) {
    throw new TypeError("Finite coordinates are required; observer latitude must be between -90° and +90°.");
  }

  const tropicalLongitudeDeg = normalize360(siderealLongitudeDeg + ayanamshaDeg);
  const ayanaPoint = eclipticEquatorial(tropicalLongitudeDeg + 90, obliquityDeg);
  const ayanaDeclinationDeg = ayanaPoint.declinationDeg;

  const sameName =
    (planetLatitudeDeg >= 0 && ayanaDeclinationDeg >= 0) ||
    (planetLatitudeDeg < 0 && ayanaDeclinationDeg < 0);
  const ayanaSign = sameName ? -1 : 1;
  const ayanaArcSeconds =
    Math.abs(planetLatitudeDeg * 60) * Math.abs(ayanaDeclinationDeg);
  const ayanaDeg = ayanaSign * ayanaArcSeconds / 3600;

  // VII.10 first gives the intermediate ecliptic longitude on the planet's
  // hour circle. VII.8's time-from-meridian and half-day still belong to the
  // planet's original place, so derive its RA/declination with the same
  // classical obliquity and its signed ecliptic latitude.
  const ayanaAppliedLongitudeDeg = normalize360(siderealLongitudeDeg + ayanaDeg);
  const planetEquatorial = eclipticEquatorial(
    tropicalLongitudeDeg, obliquityDeg, planetLatitudeDeg
  );
  const hourAngleDeg = signedAngleDelta(
    localSiderealAngleDeg, planetEquatorial.rightAscensionDeg
  );
  const phi = observerLatitudeDeg * Math.PI / 180;
  const dec = planetEquatorial.declinationDeg * Math.PI / 180;
  const halfDayCos = -Math.tan(phi) * Math.tan(dec);
  if (halfDayCos < -1 || halfDayCos > 1) {
    return null;
  }

  const halfDayAngleDeg = Math.acos(
    Math.max(-1, Math.min(1, halfDayCos))
  ) * 180 / Math.PI;
  if (!(halfDayAngleDeg > 0) || !Number.isFinite(halfDayAngleDeg)) {
    return null;
  }

  const akshaTimeRatio = hourAngleDeg / halfDayAngleDeg;
  const akshaDeg =
    planetLatitudeDeg * Math.tan(phi) * akshaTimeRatio;
  const totalCorrection = ayanaDeg + akshaDeg;

  return {
    tropicalLongitudeDeg,
    ayanaDeclinationDeg,
    ayanaDeg,
    ayanaAppliedLongitude: ayanaAppliedLongitudeDeg,
    planetRAForAksha: planetEquatorial.rightAscensionDeg,
    planetDeclinationForHalfDay: planetEquatorial.declinationDeg,
    hourAngleDeg,
    halfDayAngleDeg,
    akshaTimeRatio,
    akshaDeg,
    totalCorrection,
    latitude: planetLatitudeDeg,
    rightAscension: planetEquatorial.rightAscensionDeg,
    declination: planetEquatorial.declinationDeg,
    ephemerisRightAscension: planetRightAscensionDeg,
    ephemerisDeclination: planetDeclinationDeg,
    correctedLongitude: normalize360(siderealLongitudeDeg + totalCorrection)
  };
}

export function runChapter7DrikkarmaTests() {
  const tests = [];
  const close = (a, b, tol = 1e-9) => Number.isFinite(a) && Math.abs(a - b) <= tol;
  const base = {
    siderealLongitudeDeg: 100,
    planetLatitudeDeg: 1.2,
    observerLatitudeDeg: 29.583,
    localSiderealAngleDeg: 200,
    ayanamshaDeg: 24.217,
    obliquityDeg: 24
  };
  const sample = calculateChapter7SequentialDrikkarma(base);

  tests.push({
    name: "Cross-language numeric fixture: Ayana correction",
    passed: close(sample.ayanaDeclinationDeg, -13.221707398252294) &&
      close(sample.ayanaDeg, 0.2644341479650459)
  });
  tests.push({
    name: "Cross-language numeric fixture: intermediate RA/declination",
    passed: close(sample.ayanaAppliedLongitude, 100.26443414796505) &&
      close(sample.akshaPointRA, 126.93586520272719) &&
      close(sample.akshaPointDeclination, 19.5893801566642)
  });
  tests.push({
    name: "Cross-language numeric fixture: Aksha and corrected longitude",
    passed: close(sample.hourAngleDeg, 73.0641347972728) &&
      close(sample.halfDayAngleDeg, 101.65543429026734) &&
      close(sample.akshaDeg, 0.4896250078271271) &&
      close(sample.correctedLongitude, 100.75405915579218)
  });

  const equator = calculateChapter7SequentialDrikkarma({
    ...base, observerLatitudeDeg: 0
  });
  tests.push({
    name: "Aksha correction is zero at the equator",
    passed: close(equator.akshaDeg, 0)
  });

  const zeroPlanetLatitude = calculateChapter7SequentialDrikkarma({
    ...base, planetLatitudeDeg: 0
  });
  tests.push({
    name: "Both latitude-dependent corrections vanish for zero planetary latitude",
    passed: close(zeroPlanetLatitude.ayanaDeg, 0) &&
      close(zeroPlanetLatitude.akshaDeg, 0)
  });

  const west = sample;
  const east = calculateChapter7SequentialDrikkarma({
    ...base,
    localSiderealAngleDeg: normalize360(sample.akshaPointRA - sample.hourAngleDeg)
  });
  tests.push({
    name: "Aksha sign reverses when hour angle reverses",
    passed: close(east.hourAngleDeg, -west.hourAngleDeg) &&
      close(east.akshaDeg, -west.akshaDeg, 1e-8)
  });

  const southPlanet = calculateChapter7SequentialDrikkarma({
    ...base, planetLatitudeDeg: -1.2
  });
  tests.push({
    name: "Reversing planetary latitude reverses both correction signs for the fixture",
    passed: Math.sign(southPlanet.ayanaDeg) === -Math.sign(sample.ayanaDeg) &&
      Math.sign(southPlanet.akshaDeg) === -Math.sign(sample.akshaDeg)
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Tests verify implementation arithmetic and sign/zero invariants, not the complete classical algorithm or its event-date agreement."
  };
}
