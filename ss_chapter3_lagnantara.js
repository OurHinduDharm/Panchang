/**
 * Chapter III rising-asus interpolation used by Chapter IX lagnāntara.
 *
 * The source builds rising-times sign by sign (III.43–46), then interpolates
 * the degrees traversed within the sign. This is distinct from taking the
 * exact analytical oblique ascension at every longitude. The latter remains
 * useful as a comparison, but is not silently substituted for the source's
 * sign-table/interpolation procedure.
 */

function norm360(x) {
  const y = x % 360;
  return y < 0 ? y + 360 : y;
}

function obliqueAscensionTropical(longitudeDeg, observerLatitudeDeg, obliquityDeg) {
  const lambda = norm360(longitudeDeg) * Math.PI / 180;
  const phi = observerLatitudeDeg * Math.PI / 180;
  const eps = obliquityDeg * Math.PI / 180;
  const dec = Math.asin(Math.max(-1, Math.min(1, Math.sin(eps) * Math.sin(lambda))));
  const ra = Math.atan2(Math.sin(lambda) * Math.cos(eps), Math.cos(lambda));
  const x = Math.max(-1, Math.min(1, Math.tan(phi) * Math.tan(dec)));
  const ad = Math.asin(x);
  return norm360((ra - ad) * 180 / Math.PI);
}

export function chapter3SignRisingAsus({
  signIndex,
  observerLatitudeDeg,
  obliquityDeg = 24
}) {
  if (!Number.isInteger(signIndex) || signIndex < 0 || signIndex > 11 ||
      !Number.isFinite(observerLatitudeDeg) || Math.abs(observerLatitudeDeg) >= 90 ||
      !Number.isFinite(obliquityDeg)) {
    throw new TypeError("Sign index, observer latitude, and obliquity must be valid.");
  }
  const start = signIndex * 30;
  const oaStart = obliqueAscensionTropical(start, observerLatitudeDeg, obliquityDeg);
  const oaEnd = obliqueAscensionTropical(start + 30, observerLatitudeDeg, obliquityDeg);
  const arc = norm360(oaEnd - oaStart);
  if (!(arc > 0) || !(arc < 180)) {
    throw new RangeError("This sign's rising-asus is undefined for the supplied latitude.");
  }
  return arc * 60;
}

/**
 * Convert a sidereal longitude to its rising-equivalent asus using tropical
 * sign boundaries (the ayanāṃśa restores the ecliptic-of-date frame), then
 * linearly interpolate within the sign as in III.46.
 */
export function chapter3RisingAsusAtSiderealLongitude({
  siderealLongitudeDeg,
  observerLatitudeDeg,
  ayanamshaDeg = 24.217,
  obliquityDeg = 24
}) {
  if (![siderealLongitudeDeg, observerLatitudeDeg, ayanamshaDeg, obliquityDeg].every(Number.isFinite)) {
    throw new TypeError("All longitude/frame/latitude values must be finite.");
  }
  const tropicalLongitude = norm360(siderealLongitudeDeg + ayanamshaDeg);
  const signIndex = Math.floor(tropicalLongitude / 30);
  const degreesIntoSign = tropicalLongitude - signIndex * 30;
  let cumulativeAsus = 0;
  for (let i = 0; i < signIndex; i++) {
    cumulativeAsus += chapter3SignRisingAsus({
      signIndex: i,
      observerLatitudeDeg,
      obliquityDeg
    });
  }
  const thisSignAsus = chapter3SignRisingAsus({
    signIndex,
    observerLatitudeDeg,
    obliquityDeg
  });
  return {
    risingAsus: cumulativeAsus + degreesIntoSign * thisSignAsus / 30,
    signIndex,
    tropicalLongitude,
    degreesIntoSign,
    signRisingAsus: thisSignAsus
  };
}

/**
 * Chapter IX.5: for a western event, shift both sidereal longitudes by six
 * signs before obtaining the sign-table rising equivalents. Inputs here are
 * the corrected planet longitude and the Sun longitude before that shift.
 */
export function chapter9LagnantaraAsus({
  sunSiderealLongitudeDeg,
  planetSiderealLongitudeDeg,
  direction,
  observerLatitudeDeg,
  ayanamshaDeg = 24.217,
  obliquityDeg = 24
}) {
  if (![sunSiderealLongitudeDeg, planetSiderealLongitudeDeg].every(Number.isFinite) ||
      (direction !== "east" && direction !== "west")) {
    throw new TypeError("Finite longitudes and direction east/west are required.");
  }
  const shift = direction === "west" ? 180 : 0;
  const sunFrameLongitude = norm360(sunSiderealLongitudeDeg + shift);
  const planetFrameLongitude = norm360(planetSiderealLongitudeDeg + shift);
  const sun = chapter3RisingAsusAtSiderealLongitude({
    siderealLongitudeDeg: sunFrameLongitude,
    observerLatitudeDeg,
    ayanamshaDeg,
    obliquityDeg
  });
  const planet = chapter3RisingAsusAtSiderealLongitude({
    siderealLongitudeDeg: planetFrameLongitude,
    observerLatitudeDeg,
    ayanamshaDeg,
    obliquityDeg
  });
  const signedLagnantaraAsu = ((planet.risingAsus - sun.risingAsus + 32400) % 21600) - 10800;
  return {
    sunFrameLongitude,
    planetFrameLongitude,
    sunRisingAsus: sun.risingAsus,
    planetRisingAsus: planet.risingAsus,
    sunSignIndex: sun.signIndex,
    planetSignIndex: planet.signIndex,
    sunSignRisingAsus: sun.signRisingAsus,
    planetSignRisingAsus: planet.signRisingAsus,
    signedLagnantaraAsu,
    lagnantaraAsu: Math.abs(signedLagnantaraAsu),
    K: Math.abs(signedLagnantaraAsu) / 60
  };
}

export function runChapter3LagnantaraTests() {
  const tests = [];
  const close = (a, b, tol = 0.02) => Number.isFinite(a) && Math.abs(a - b) <= tol;

  const equatorAsus = [0, 1, 2].map(signIndex =>
    chapter3SignRisingAsus({ signIndex, observerLatitudeDeg: 0 })
  );
  tests.push({
    name: "III.44 equatorial Aries/Taurus/Gemini rising-asus match the text's 1670/1795/1935 values within table rounding",
    passed: close(equatorAsus[0], 1670, 5) &&
      close(equatorAsus[1], 1795, 2) &&
      close(equatorAsus[2], 1935, 5)
  });

  const localSum = Array.from({ length: 12 }, (_, signIndex) =>
    chapter3SignRisingAsus({ signIndex, observerLatitudeDeg: 29.583 })
  ).reduce((sum, value) => sum + value, 0);
  tests.push({
    name: "Local sign rising-asus sum to one full circle of 21600 prāṇas",
    passed: close(localSum, 21600, 1e-8)
  });

  const beforeBoundary = chapter3RisingAsusAtSiderealLongitude({
    siderealLongitudeDeg: 30 - 24.217 - 1e-7,
    observerLatitudeDeg: 29.583,
    ayanamshaDeg: 24.217
  });
  const atBoundary = chapter3RisingAsusAtSiderealLongitude({
    siderealLongitudeDeg: 30 - 24.217,
    observerLatitudeDeg: 29.583,
    ayanamshaDeg: 24.217
  });
  tests.push({
    name: "III.46 interpolation is continuous at a tropical sign boundary",
    passed: close(beforeBoundary.risingAsus, atBoundary.risingAsus, 1e-5)
  });

  const sample = chapter9LagnantaraAsus({
    sunSiderealLongitudeDeg: 123.4,
    planetSiderealLongitudeDeg: 132.1,
    direction: "east",
    observerLatitudeDeg: 29.583
  });
  const west = chapter9LagnantaraAsus({
    sunSiderealLongitudeDeg: 123.4,
    planetSiderealLongitudeDeg: 132.1,
    direction: "west",
    observerLatitudeDeg: 29.583
  });
  tests.push({
    name: "IX.5 western calculation uses the opposite six-sign frame for both bodies",
    passed: west.sunFrameLongitude === norm360(sample.sunFrameLongitude + 180) &&
      west.planetFrameLongitude === norm360(sample.planetFrameLongitude + 180) &&
      Number.isFinite(west.K)
  });

  const reversed = chapter9LagnantaraAsus({
    sunSiderealLongitudeDeg: 132.1,
    planetSiderealLongitudeDeg: 123.4,
    direction: "east",
    observerLatitudeDeg: 29.583
  });
  tests.push({
    name: "Swapping Sun and planet reverses signed lagnāntara but preserves its magnitude",
    passed: close(reversed.signedLagnantaraAsu, -sample.signedLagnantaraAsu, 1e-7) &&
      close(reversed.lagnantaraAsu, sample.lagnantaraAsu, 1e-7)
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "These tests validate the sign-table interpolation arithmetic against Chapter III.43–46; they do not validate the complete Asta/Udaya dates."
  };
}
