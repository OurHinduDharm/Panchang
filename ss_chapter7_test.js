/**
 * Source-derived arithmetic/sign tests for Sūrya-siddhānta VII.8–10.
 *
 * These tests check the implementation's arithmetic against the operations
 * described by Burgess, using synthetic inputs. They do NOT establish the
 * historical coordinate frame, validate modern ephemeris inputs, or certify
 * any heliacal event date.
 */
import { calculateChapter7SequentialDrikkarma } from "./ss_chapter7_drikkarma.js";

const normalize360 = (x) => ((x % 360) + 360) % 360;
const close = (a, b, tol = 1e-9) =>
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;

/** Independent vector rotation: ecliptic coordinates to equatorial coordinates. */
function referenceEquatorial(longitudeDeg, latitudeDeg, obliquityDeg) {
  const l = longitudeDeg * Math.PI / 180;
  const b = latitudeDeg * Math.PI / 180;
  const e = obliquityDeg * Math.PI / 180;
  const x = Math.cos(b) * Math.cos(l);
  const y = Math.cos(b) * Math.sin(l) * Math.cos(e) -
    Math.sin(b) * Math.sin(e);
  const z = Math.cos(b) * Math.sin(l) * Math.sin(e) +
    Math.sin(b) * Math.cos(e);
  return {
    ra: normalize360(Math.atan2(y, x) * 180 / Math.PI),
    dec: Math.asin(Math.max(-1, Math.min(1, z))) * 180 / Math.PI
  };
}

function runOne({ longitude = 50, latitude, hourAngle, observerLatitude = 29.583 }) {
  const ayanamsha = 24.217;
  const obliquity = 24;
  const tropicalLongitude = normalize360(longitude + ayanamsha);
  const eq = referenceEquatorial(tropicalLongitude, latitude, obliquity);
  return calculateChapter7SequentialDrikkarma({
    siderealLongitudeDeg: longitude,
    planetLatitudeDeg: latitude,
    observerLatitudeDeg: observerLatitude,
    localSiderealAngleDeg: normalize360(eq.ra + hourAngle),
    ayanamshaDeg: ayanamsha,
    obliquityDeg: obliquity,
    localSiderealObliquityDeg: obliquity
  });
}

export function runChapter7SourceDerivedTests() {
  const tests = [];
  const check = (name, passed, details = "") => tests.push({ name, passed, details });

  // VII.8: S = 12 tan(phi), if that is the chosen equinoctial-shadow convention.
  // Thus |A| in degrees = |b| in degrees × tan(phi) × |N/H|.
  for (const latitude of [2, -2]) {
    for (const hourAngle of [-30, 30]) {
      const result = runOne({ latitude, hourAngle });
      const east = hourAngle < 0;
      const northLatitude = latitude > 0;
      const sign = northLatitude
        ? (east ? -1 : 1)
        : (east ? 1 : -1);
      const expectedAkshaDeg = sign * Math.abs(latitude) *
        Math.tan(29.583 * Math.PI / 180) *
        Math.abs(result.hourAngleDeg / result.halfDayAngleDeg);
      check(
        `VII.8–9 Akṣa sign/magnitude: latitude ${latitude > 0 ? "north" : "south"}, ${east ? "east" : "west"} of meridian`,
        close(result.akshaDeg, expectedAkshaDeg, 1e-10),
        `actual=${result.akshaDeg}; reference=${expectedAkshaDeg}`
      );
    }
  }

  // VII.10: b in arcminutes × |declination| in degrees = arcseconds.
  // Same north/south name subtracts; unlike names adds.
  for (const longitude of [0, 180]) {
    for (const latitude of [2, -2]) {
      const ayanamsha = 24.217;
      const tropicalLongitude = normalize360(longitude + ayanamsha);
      const eq = referenceEquatorial(tropicalLongitude + 90, 0, 24);
      const result = calculateChapter7SequentialDrikkarma({
        siderealLongitudeDeg: longitude,
        planetLatitudeDeg: latitude,
        observerLatitudeDeg: 29.583,
        localSiderealAngleDeg: eq.ra,
        ayanamshaDeg: ayanamsha,
        obliquityDeg: 24,
        localSiderealObliquityDeg: 24
      });
      const sameName = (latitude > 0 && result.ayanaDeclinationDeg > 0) ||
        (latitude < 0 && result.ayanaDeclinationDeg < 0);
      const sign = sameName ? -1 : 1;
      const expectedAyanaDeg = sign *
        (Math.abs(latitude * 60) * Math.abs(result.ayanaDeclinationDeg)) / 3600;
      check(
        `VII.10 Āyana sign/unit: longitude ${longitude}°, latitude ${latitude > 0 ? "north" : "south"}`,
        close(result.ayanaDeg, expectedAyanaDeg, 1e-12),
        `actual=${result.ayanaDeg}; reference=${expectedAyanaDeg}`
      );
    }
  }

  // VII.8–9: meridian passage means N = 0, hence Akṣa correction is zero.
  const atMeridian = runOne({ latitude: 2, hourAngle: 0 });
  check(
    "VII.8–9 Akṣa correction is zero at meridian passage",
    close(atMeridian.hourAngleDeg, 0, 1e-10) &&
      close(atMeridian.akshaDeg, 0, 1e-12),
    `hourAngle=${atMeridian.hourAngleDeg}; aksha=${atMeridian.akshaDeg}`
  );


  // Chapter II.28 specifies a maximum-declination sine of 1397 on radius 3438.
  // The candidate currently uses exact trig with epsilon=24°, which is a
  // documented approximation rather than the literal II.28 sine constant.
  const roundedObliquityCase = calculateChapter7SequentialDrikkarma({
    siderealLongitudeDeg: normalize360(-24.217),
    planetLatitudeDeg: 1,
    observerLatitudeDeg: 29.583,
    localSiderealAngleDeg: 0,
    ayanamshaDeg: 24.217,
    obliquityDeg: 24,
    localSiderealObliquityDeg: 24
  });
  const chapter2MaximumDeclinationDeg =
    Math.asin(1397 / 3438) * 180 / Math.PI;
  check(
    "Chapter II.28 approximation is explicitly distinguishable from exact 24° geometry",
    close(roundedObliquityCase.ayanaDeclinationDeg, 24, 1e-10) &&
      Math.abs(roundedObliquityCase.ayanaDeclinationDeg - chapter2MaximumDeclinationDeg) > 0.02,
    `candidate=${roundedObliquityCase.ayanaDeclinationDeg}; II.28 asin(1397/3438)=${chapter2MaximumDeclinationDeg}`
  );

  // Direct Gūḍhārtha-prakāśaka VII.10 wording: declination arising from
  // the planet with three signs added. The candidate currently sets the
  // shifted point's ecliptic latitude to zero. Compare that with the alternative
  // that retains the planet's signed latitude, without asserting which is the
  // final historical convention; the commentary wording needs a cross-commentary
  // and geometry decision before that choice can be promoted.
  {
    const siderealLongitudeDeg = 100;
    const planetLatitudeDeg = 1.2;
    const ayanamshaDeg = 24.217;
    const obliquityDeg = 24;
    const tropicalLongitudeDeg = normalize360(siderealLongitudeDeg + ayanamshaDeg);
    const shiftedLongitudeDeg = normalize360(tropicalLongitudeDeg + 90);
    const zeroLatitudeDeclination = referenceEquatorial(
      shiftedLongitudeDeg, 0, obliquityDeg
    ).dec;
    const retainedLatitudeDeclination = referenceEquatorial(
      shiftedLongitudeDeg, planetLatitudeDeg, obliquityDeg
    ).dec;
    const candidate = calculateChapter7SequentialDrikkarma({
      siderealLongitudeDeg,
      planetLatitudeDeg,
      observerLatitudeDeg: 29.583,
      localSiderealAngleDeg: 0,
      ayanamshaDeg,
      obliquityDeg,
      localSiderealObliquityDeg: obliquityDeg
    });
    const retainedSign = (planetLatitudeDeg > 0 && retainedLatitudeDeclination > 0) ||
      (planetLatitudeDeg < 0 && retainedLatitudeDeclination < 0) ? -1 : 1;
    const retainedLatitudeAyanaDeg = retainedSign *
      (Math.abs(planetLatitudeDeg * 60) * Math.abs(retainedLatitudeDeclination)) / 3600;
    check(
      "VII.10 shifted-place latitude convention is exposed as an unresolved sensitivity diagnostic",
      close(candidate.ayanaDeclinationDeg, zeroLatitudeDeclination, 1e-10) &&
        close(candidate.ayanaDeg,
          Math.sign(candidate.ayanaDeg) *
          (Math.abs(planetLatitudeDeg * 60) * Math.abs(zeroLatitudeDeclination)) / 3600,
          1e-10) &&
        Math.abs(candidate.ayanaDeg - retainedLatitudeAyanaDeg) > 0.02,
      `zero-latitude candidate: dec=${zeroLatitudeDeclination}°, correction=${candidate.ayanaDeg}°; retained-latitude alternative: dec=${retainedLatitudeDeclination}°, correction=${retainedLatitudeAyanaDeg}°; difference=${Math.abs(candidate.ayanaDeg - retainedLatitudeAyanaDeg)}°. This test records sensitivity only; it does not choose the source convention.`
    );
  }

  const passed = tests.filter((t) => t.passed).length;
  return { passed, total: tests.length, allPassed: passed === tests.length, tests };
}
