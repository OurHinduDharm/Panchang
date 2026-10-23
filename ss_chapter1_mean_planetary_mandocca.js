/**
 * Research-only Sūrya-siddhānta I.41–43 planetary mandocca layer.
 *
 * Source revolution counts per kalpa:
 * Sun 387, Mars 204, Mercury 368, Jupiter 900, Venus 535, Saturn 39.
 *
 * The epoch longitude is deliberately required from the caller. The source
 * gives revolution counts here, but this module does not pretend those counts
 * alone determine each body's longitude at the chosen epoch.
 *
 * Input elapsedDaysSinceKaliEpoch must use the same savana-day convention as
 * the declared epoch longitude. This is not a civil-date or epoch bridge.
 */
export const SS_PLANETARY_MANDOCCA_REVOLUTIONS_PER_KALPA = Object.freeze({
  Sun: 387,
  Mars: 204,
  Mercury: 368,
  Jupiter: 900,
  Venus: 535,
  Saturn: 39
});

export const SS_PLANETARY_MANDOCCA_TIMEBASE = Object.freeze({
  yugasPerKalpa: 1000,
  savanaDaysPerYuga: 1577917828,
  source: "Sūrya-siddhānta I.20, I.41–43",
  status: "research-only revolution rates; epoch longitudes and coordinate frame must be independently established"
});

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

/**
 * Compute mean mandocca longitude from an explicit epoch longitude and
 * elapsed savana days. The required anchor prevents silently reusing the
 * Sun's 77°07′48″ candidate for a different planet.
 */
export function chapter1MeanPlanetaryMandoccaFromElapsedDays({
  planet,
  elapsedDaysSinceKaliEpoch,
  kaliEpochLongitudeDeg
}) {
  const revolutions = SS_PLANETARY_MANDOCCA_REVOLUTIONS_PER_KALPA[planet];
  if (!Number.isSafeInteger(revolutions)) {
    throw new RangeError("Unsupported planet; choose Sun, Mars, Mercury, Jupiter, Venus, or Saturn.");
  }
  if (!Number.isFinite(elapsedDaysSinceKaliEpoch)) {
    throw new TypeError("elapsedDaysSinceKaliEpoch must be finite.");
  }
  if (!Number.isFinite(kaliEpochLongitudeDeg)) {
    throw new TypeError("kaliEpochLongitudeDeg must be explicitly supplied and finite.");
  }

  const wholeDays = Math.trunc(elapsedDaysSinceKaliEpoch);
  if (!Number.isSafeInteger(wholeDays)) {
    throw new RangeError("Whole elapsed days must be a safe integer.");
  }
  const fractionalDay = elapsedDaysSinceKaliEpoch - wholeDays;
  const kalpaDays = BigInt(SS_PLANETARY_MANDOCCA_TIMEBASE.savanaDaysPerYuga) *
    BigInt(SS_PLANETARY_MANDOCCA_TIMEBASE.yugasPerKalpa);

  let wholeDayNumerator = (BigInt(wholeDays) * BigInt(revolutions)) % kalpaDays;
  if (wholeDayNumerator < 0n) wholeDayNumerator += kalpaDays;

  let motionDeg = Number(wholeDayNumerator) / Number(kalpaDays) * 360;
  motionDeg += fractionalDay * revolutions * 360 / Number(kalpaDays);
  motionDeg = normalizeDegrees(motionDeg);

  return Object.freeze({
    planet,
    elapsedDaysSinceKaliEpoch,
    kaliEpochLongitudeDeg: normalizeDegrees(kaliEpochLongitudeDeg),
    revolutionsPerKalpa: revolutions,
    meanMotionDegPerDay: revolutions * 360 / Number(kalpaDays),
    meanMotionArcsecPerDay: revolutions * 360 * 3600 / Number(kalpaDays),
    meanMotionSinceEpochDeg: motionDeg,
    meanMandoccaLongitudeDeg: normalizeDegrees(kaliEpochLongitudeDeg + motionDeg),
    source: SS_PLANETARY_MANDOCCA_TIMEBASE.source,
    status: SS_PLANETARY_MANDOCCA_TIMEBASE.status
  });
}

export function runChapter1PlanetaryMandoccaTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-9) =>
    Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
  const kalpaDays = SS_PLANETARY_MANDOCCA_TIMEBASE.savanaDaysPerYuga *
    SS_PLANETARY_MANDOCCA_TIMEBASE.yugasPerKalpa;

  const expected = {
    Sun: 387, Mars: 204, Mercury: 368, Jupiter: 900, Venus: 535, Saturn: 39
  };
  tests.push({
    name: "I.41–43 source revolution counts are retained for all six mandocca bodies",
    passed: Object.entries(expected).every(([planet, count]) =>
      SS_PLANETARY_MANDOCCA_REVOLUTIONS_PER_KALPA[planet] === count)
  });

  tests.push({
    name: "Epoch longitude is mandatory rather than silently guessed",
    passed: (() => {
      try {
        chapter1MeanPlanetaryMandoccaFromElapsedDays({
          planet: "Venus", elapsedDaysSinceKaliEpoch: 0
        });
        return false;
      } catch (error) {
        return error instanceof TypeError;
      }
    })()
  });

  const epoch = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet: "Venus", elapsedDaysSinceKaliEpoch: 0, kaliEpochLongitudeDeg: 123.5
  });
  tests.push({
    name: "Zero elapsed days returns the caller's explicit epoch longitude",
    passed: close(epoch.meanMandoccaLongitudeDeg, 123.5) &&
      close(epoch.meanMotionSinceEpochDeg, 0)
  });

  const venusOneYuga = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet: "Venus",
    elapsedDaysSinceKaliEpoch: SS_PLANETARY_MANDOCCA_TIMEBASE.savanaDaysPerYuga,
    kaliEpochLongitudeDeg: 123.5
  });
  tests.push({
    name: "Venus advances 535/1000 of a revolution per yuga",
    passed: close(venusOneYuga.meanMotionSinceEpochDeg, 535 * 360 / 1000, 1e-8)
  });

  const fullKalpa = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet: "Jupiter", elapsedDaysSinceKaliEpoch: kalpaDays,
    kaliEpochLongitudeDeg: 222.25
  });
  tests.push({
    name: "A full kalpa returns to the explicit Jupiter epoch longitude",
    passed: close(fullKalpa.meanMandoccaLongitudeDeg, 222.25, 1e-8)
  });

  const halfDay = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet: "Saturn", elapsedDaysSinceKaliEpoch: 1000000.5,
    kaliEpochLongitudeDeg: 90
  });
  const wholeDay = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet: "Saturn", elapsedDaysSinceKaliEpoch: 1000000,
    kaliEpochLongitudeDeg: 90
  });
  tests.push({
    name: "Fractional-day motion is preserved for Saturn",
    passed: close(
      normalizeDegrees(halfDay.meanMandoccaLongitudeDeg - wholeDay.meanMandoccaLongitudeDeg),
      0.5 * 39 * 360 / kalpaDays,
      1e-8
    )
  });

  const beforeEpoch = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet: "Mars", elapsedDaysSinceKaliEpoch: -1,
    kaliEpochLongitudeDeg: 0
  });
  tests.push({
    name: "Negative elapsed days normalize safely around the epoch",
    passed: beforeEpoch.meanMandoccaLongitudeDeg >= 0 &&
      beforeEpoch.meanMandoccaLongitudeDeg < 360
  });

  let rejectedPlanet = false;
  try {
    chapter1MeanPlanetaryMandoccaFromElapsedDays({
      planet: "Pluto", elapsedDaysSinceKaliEpoch: 1, kaliEpochLongitudeDeg: 0
    });
  } catch (error) {
    rejectedPlanet = error instanceof RangeError;
  }
  tests.push({
    name: "Unsupported bodies are rejected",
    passed: rejectedPlanet
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    note: "Arithmetic tests only. No epoch longitude, true longitude, or Asta/Udaya event is certified."
  };
}
