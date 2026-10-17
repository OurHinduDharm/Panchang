/**
 * Isolated Sūrya-siddhānta VII.8–10 dṛkkarma candidate.
 *
 * Uses geocentric sidereal ecliptic longitude and signed ecliptic latitude,
 * restores the explicitly configured equinox frame for declination/RA, then
 * applies Ayana followed by Aksha to the longitude. For the Aksha time ratio,
 * it uses the original planet's RA/declination (not the intermediate Ayana-
 * corrected point). This is a testable interpretation of VII.8–10, not proof
 * that the full Chapter VII or Chapter IX event algorithm is validated.
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
 * Express the local meridian's equatorial angle in a calculation frame whose
 * obliquity differs from the source frame. The physical meridian plane is
 * unchanged; its intersection with the target equator is recomputed rather
 * than treating modern apparent sidereal time as if it belonged to the
 * classical fixed-obliquity frame.
 *
 * Derived from the meridian-plane/equator intersection with a shared
 * equinox axis: tan(theta_target) = tan(theta_source) * sec(delta epsilon).
 * atan2 form preserves quadrant and behaves safely near 90°/270°.
 */
export function convertLocalSiderealAngleObliquityFrame({
  localSiderealAngleDeg,
  sourceObliquityDeg,
  targetObliquityDeg
}) {
  if (![localSiderealAngleDeg, sourceObliquityDeg, targetObliquityDeg].every(Number.isFinite)) {
    throw new TypeError("Local sidereal angle and both obliquities must be finite.");
  }
  const theta = localSiderealAngleDeg * Math.PI / 180;
  const deltaEpsilon = (sourceObliquityDeg - targetObliquityDeg) * Math.PI / 180;
  return normalize360(
    Math.atan2(Math.sin(theta), Math.cos(theta) * Math.cos(deltaEpsilon)) * 180 / Math.PI
  );
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
  localSiderealObliquityDeg = obliquityDeg,
  planetDeclinationDeg = NaN,
  planetRightAscensionDeg = NaN
}) {
  const inputs = [
    siderealLongitudeDeg, planetLatitudeDeg, observerLatitudeDeg,
    localSiderealAngleDeg, ayanamshaDeg, obliquityDeg,
    localSiderealObliquityDeg
  ];
  if (!inputs.every(Number.isFinite) || Math.abs(observerLatitudeDeg) >= 90) {
    throw new TypeError("Finite coordinates are required; observer latitude must be between -90° and +90°.");
  }

  const tropicalLongitudeDeg = normalize360(siderealLongitudeDeg + ayanamshaDeg);

  // VII.10 / Gūḍhārtha-prakāśaka says to use the declination arising from
  // the planet with three signs added. This candidate evaluates the shifted
  // longitude with ecliptic latitude = 0. The commentary's wording has not
  // yet been conclusively mapped to whether the planet's signed latitude is
  // retained at the shifted point; see the source audit. Do not treat this
  // zero-latitude choice as a fully adjudicated classical convention.
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
  const calculationFrameSiderealAngleDeg = convertLocalSiderealAngleObliquityFrame({
    localSiderealAngleDeg,
    sourceObliquityDeg: localSiderealObliquityDeg,
    targetObliquityDeg: obliquityDeg
  });
  const hourAngleDeg = signedAngleDelta(
    calculationFrameSiderealAngleDeg, planetEquatorial.rightAscensionDeg
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
    sourceLocalSiderealAngleDeg: normalize360(localSiderealAngleDeg),
    calculationFrameSiderealAngleDeg,
    localSiderealFrameCorrectionDeg: signedAngleDelta(
      calculationFrameSiderealAngleDeg, normalize360(localSiderealAngleDeg)
    ),
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
    name: "Cross-language numeric fixture: planet RA/declination for Aksha",
    passed: close(sample.ayanaAppliedLongitude, 100.26443414796505) &&
      close(sample.planetRAForAksha, 126.97536542166314) &&
      close(sample.planetDeclinationForHalfDay, 20.817606965695532)
  });
  tests.push({
    name: "Cross-language numeric fixture: Aksha and corrected longitude",
    passed: close(sample.hourAngleDeg, 73.02463457833687) &&
      close(sample.halfDayAngleDeg, 102.4650232173461) &&
      close(sample.akshaDeg, 0.4854938080385521) &&
      close(sample.correctedLongitude, 100.7499279560036)
  });

  const sameFrameAngle = convertLocalSiderealAngleObliquityFrame({
    localSiderealAngleDeg: 123.4,
    sourceObliquityDeg: 24,
    targetObliquityDeg: 24
  });
  tests.push({
    name: "Coordinate-frame conversion is identity when obliquities match",
    passed: close(sameFrameAngle, 123.4, 1e-12)
  });

  const changedFrameAngle = convertLocalSiderealAngleObliquityFrame({
    localSiderealAngleDeg: 45,
    sourceObliquityDeg: 23.4367,
    targetObliquityDeg: 24
  });
  tests.push({
    name: "Independent numeric fixture for modern-to-24° meridian-frame conversion",
    passed: close(changedFrameAngle, 45.00138453479633, 1e-10)
  });

  // Independent 3-D geometry check: construct the physical meridian plane
  // from the source pole and its equatorial intersection, intersect it with
  // the target equator, then recover the target-frame RA. This does not reuse
  // the tan/sec identity used by convertLocalSiderealAngleObliquityFrame.
  const vectorCross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
  const meridianIntersectionRA = (thetaDeg, sourceEpsilonDeg, targetEpsilonDeg) => {
    const theta = thetaDeg * Math.PI / 180;
    const sourceEpsilon = sourceEpsilonDeg * Math.PI / 180;
    const targetEpsilon = targetEpsilonDeg * Math.PI / 180;
    const sourcePole = [0, -Math.sin(sourceEpsilon), Math.cos(sourceEpsilon)];
    const sourceEquatorPoint = [
      Math.cos(theta),
      Math.sin(theta) * Math.cos(sourceEpsilon),
      Math.sin(theta) * Math.sin(sourceEpsilon)
    ];
    const meridianPlaneNormal = vectorCross(sourcePole, sourceEquatorPoint);
    const targetPole = [0, -Math.sin(targetEpsilon), Math.cos(targetEpsilon)];
    const intersection = vectorCross(meridianPlaneNormal, targetPole);
    const targetEquatorialY =
      intersection[1] * Math.cos(targetEpsilon) +
      intersection[2] * Math.sin(targetEpsilon);
    return normalize360(Math.atan2(targetEquatorialY, intersection[0]) * 180 / Math.PI);
  };
  const frameGeometryCases = [0, 45, 90, 123.4, 200, 359.9].map(theta => {
    const expected = meridianIntersectionRA(theta, 23.4367, 24);
    const actual = convertLocalSiderealAngleObliquityFrame({
      localSiderealAngleDeg: theta,
      sourceObliquityDeg: 23.4367,
      targetObliquityDeg: 24
    });
    return close(actual, expected, 1e-9);
  });
  tests.push({
    name: "Frame conversion matches an independent 3-D meridian-plane/equator intersection at six angles",
    passed: frameGeometryCases.every(Boolean)
  });

  const wrappedFrameAngle = convertLocalSiderealAngleObliquityFrame({
    localSiderealAngleDeg: 359.9,
    sourceObliquityDeg: 23.4367,
    targetObliquityDeg: 24
  });
  tests.push({
    name: "Coordinate-frame conversion preserves angle wraparound",
    passed: wrappedFrameAngle >= 0 && wrappedFrameAngle < 360 &&
      Math.abs(signedAngleDelta(wrappedFrameAngle, 359.9)) < 0.1
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
    localSiderealAngleDeg: normalize360(sample.planetRAForAksha - sample.hourAngleDeg)
  });
  tests.push({
    name: "Aksha sign reverses when hour angle reverses",
    passed: close(east.hourAngleDeg, -west.hourAngleDeg) &&
      close(east.akshaDeg, -west.akshaDeg, 1e-8)
  });

  const originalEquatorial = eclipticEquatorial(
    sample.tropicalLongitudeDeg, base.obliquityDeg, base.planetLatitudeDeg
  );
  const intermediateEquatorial = eclipticEquatorial(
    sample.ayanaAppliedLongitude + base.ayanamshaDeg,
    base.obliquityDeg, base.planetLatitudeDeg
  );
  tests.push({
    name: "Aksha time ratio uses original planet RA/declination, not the Ayana-corrected intermediate point",
    passed: close(sample.planetRAForAksha, originalEquatorial.rightAscensionDeg) &&
      close(sample.planetDeclinationForHalfDay, originalEquatorial.declinationDeg) &&
      Math.abs(sample.planetRAForAksha - intermediateEquatorial.rightAscensionDeg) > 1e-4
  });

  const southernObserver = calculateChapter7SequentialDrikkarma({
    ...base, observerLatitudeDeg: -29.583
  });
  tests.push({
    name: "Aksha correction reverses sign across observer hemispheres for the same planet/hour angle",
    passed: Math.sign(southernObserver.akshaDeg) === -Math.sign(sample.akshaDeg)
  });

  const southPlanet = calculateChapter7SequentialDrikkarma({
    ...base, planetLatitudeDeg: -1.2
  });
  tests.push({
    name: "Reversing planetary latitude reverses both correction signs for the fixture",
    passed: Math.sign(southPlanet.ayanaDeg) === -Math.sign(sample.ayanaDeg) &&
      Math.sign(southPlanet.akshaDeg) === -Math.sign(sample.akshaDeg)
  });

  // Verse-derived VII.8–9 sign truth table. East of meridian means negative
  // hour angle; west means positive. For this isolated sign audit, use a
  // moderate |H| safely inside the planet's half-day in both hemispheres.
  const akshaSignCases = [];
  for (const observerLatitudeDeg of [29.583, -29.583]) {
    for (const planetLatitudeDeg of [1.2, -1.2]) {
      const probe = calculateChapter7SequentialDrikkarma({
        ...base, observerLatitudeDeg, planetLatitudeDeg,
        localSiderealAngleDeg: 0
      });
      for (const hourAngleDeg of [-20, 20]) {
        const result = calculateChapter7SequentialDrikkarma({
          ...base,
          observerLatitudeDeg,
          planetLatitudeDeg,
          localSiderealAngleDeg: normalize360(
            probe.planetRAForAksha + hourAngleDeg
          )
        });
        const expectedSign = Math.sign(
          planetLatitudeDeg *
          Math.tan(observerLatitudeDeg * Math.PI / 180) *
          hourAngleDeg
        );
        akshaSignCases.push(
          Number.isFinite(result.akshaDeg) &&
          Math.sign(result.akshaDeg) === expectedSign &&
          Math.abs(result.hourAngleDeg - hourAngleDeg) < 1e-8
        );
      }
    }
  }
  tests.push({
    name: "VII.8–9 Aksha add/subtract sign truth table: east/west × north/south planet latitude × observer hemisphere (8 cases)",
    passed: akshaSignCases.length === 8 && akshaSignCases.every(Boolean)
  });

  // Paired sensitivity: II.28's tabulated sine ratio versus rounded 24°.
  // This isolates the obliquity input by keeping the local sidereal angle
  // expressed in the same chosen frame in each run. It is not a claim that
  // modern local sidereal time has already been transformed to either frame.
  const exactII28ObliquityDeg =
    Math.asin(1397 / 3438) * 180 / Math.PI;
  const rounded24 = calculateChapter7SequentialDrikkarma({
    ...base, obliquityDeg: 24, localSiderealObliquityDeg: 24
  });
  const exactII28 = calculateChapter7SequentialDrikkarma({
    ...base,
    obliquityDeg: exactII28ObliquityDeg,
    localSiderealObliquityDeg: exactII28ObliquityDeg
  });
  const dAyana = exactII28.ayanaDeg - rounded24.ayanaDeg;
  const dAksha = exactII28.akshaDeg - rounded24.akshaDeg;
  tests.push({
    name: `II.28 obliquity sensitivity (23.975182° vs 24°): ΔĀyana=${dAyana.toFixed(8)}°, ΔAkṣa=${dAksha.toFixed(8)}°`,
    passed: Number.isFinite(exactII28ObliquityDeg) &&
      Number.isFinite(dAyana) && Number.isFinite(dAksha) &&
      Math.abs(exactII28ObliquityDeg - 24) < 0.03
  });

  // Independent horizon-geometry audit of the planet's half-day angle.
  // At rising/setting, sin(altitude) = sin(phi)sin(delta) +
  // cos(phi)cos(delta)cos(H) = 0. This checks the boundary from the
  // altitude equation rather than repeating the acos expression alone.
  const horizonGeometryCases = [];
  for (const observerLatitudeDeg of [29.583, -29.583, 0]) {
    for (const declinationDeg of [-20, -5, 0, 12, 23]) {
      const phi = observerLatitudeDeg * Math.PI / 180;
      const dec = declinationDeg * Math.PI / 180;
      const cosH0 = -Math.tan(phi) * Math.tan(dec);
      if (cosH0 < -1 || cosH0 > 1) continue;
      const H0 = Math.acos(Math.max(-1, Math.min(1, cosH0)));
      const sinAltitude = H =>
        Math.sin(phi) * Math.sin(dec) +
        Math.cos(phi) * Math.cos(dec) * Math.cos(H);
      const atBoundary = sinAltitude(H0);
      const inside = sinAltitude(Math.max(0, H0 - 1e-4));
      const outside = sinAltitude(Math.min(Math.PI, H0 + 1e-4));
      horizonGeometryCases.push(
        Math.abs(atBoundary) < 1e-12 &&
        (H0 < 1e-8 || inside > -1e-12) &&
        (H0 > Math.PI - 1e-8 || outside < 1e-12)
      );
    }
  }
  tests.push({
    name: "Aksha half-day boundary independently satisfies the spherical horizon-altitude equation",
    passed: horizonGeometryCases.length >= 12 && horizonGeometryCases.every(Boolean)
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Tests verify implementation arithmetic and sign/zero invariants, not the complete classical algorithm or its event-date agreement."
  };
}
