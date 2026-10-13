/**
 * Research-only transcription of the algebraic chain described in
 * Sūrya-siddhānta III.35–39 (Burgess translation).
 *
 * This module accepts source-table quantities as inputs. It does NOT generate
 * sine/versed-sine tables, infer the meanings or values of antya/day-radius,
 * convert a modern timestamp into classical nata, or certify the reading of
 * the historical tables. It intentionally stops before converting the
 * resulting versed-sine value back to an angle.
 */

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

function positive(value, name) {
  finite(value, name);
  if (!(value > 0)) throw new RangeError(name + " must be > 0.");
}

function nonNegative(value, name) {
  finite(value, name);
  if (value < 0) throw new RangeError(name + " must be >= 0.");
}

/**
 * Algebraic transcription of III.35–36 using explicit table-scaled inputs:
 * cheda = (antya - versedSineNata) * dayRadius / R
 * sineAltitude = cheda * sineColatitude / R
 *
 * The values must all use the same sine-table radius/scale.
 */
export function chapter3ForwardAltitudeSineFromTableValues({
  radius,
  sineColatitude,
  dayRadius,
  antya,
  versedSineNata
}) {
  positive(radius, "radius");
  positive(sineColatitude, "sineColatitude");
  positive(dayRadius, "dayRadius");
  finite(antya, "antya");
  finite(versedSineNata, "versedSineNata");
  if (sineColatitude > radius || dayRadius > radius ||
      antya < 0 || antya > radius ||
      versedSineNata < 0 || versedSineNata > radius) {
    throw new RangeError("All sine/versed-sine table quantities must lie within the supplied radius.");
  }

  const dayMeasureRemainder = antya - versedSineNata;
  if (dayMeasureRemainder < 0) {
    throw new RangeError("antya - versedSineNata must be non-negative for this branch.");
  }
  const cheda = dayMeasureRemainder * dayRadius / radius;
  const sineAltitude = cheda * sineColatitude / radius;
  if (sineAltitude < 0 || sineAltitude > radius + 1e-9) {
    throw new RangeError("Computed altitude sine is outside the table radius.");
  }
  return {
    dayMeasureRemainder,
    cheda,
    sineAltitude,
    provenance: "source-transcription arithmetic candidate",
    sourceAnchor: "Sūrya-siddhānta III.35–36",
    limitation: "Uses caller-supplied table quantities; not a complete historical nata calculation."
  };
}

/**
 * Algebraic inverse of the III.38–39 chain, stopping at the value that must
 * be looked up/inverted in the source's versed-sine table:
 * cheda = sineAltitude * R / sineColatitude
 * unnataSine = cheda * R / dayRadius
 * versedSineNata = antya - unnataSine
 *
 * No modern asin/acos is substituted for the historical table conversion.
 */
export function chapter3InverseVersedSineFromTableValues({
  radius,
  sineColatitude,
  dayRadius,
  antya,
  sineAltitude
}) {
  positive(radius, "radius");
  positive(sineColatitude, "sineColatitude");
  positive(dayRadius, "dayRadius");
  finite(antya, "antya");
  nonNegative(sineAltitude, "sineAltitude");
  if (sineColatitude > radius || dayRadius > radius || antya < 0 || antya > radius) {
    throw new RangeError("All sine-table quantities must lie within the supplied radius.");
  }
  if (sineAltitude > radius) {
    throw new RangeError("sineAltitude cannot exceed the supplied table radius.");
  }

  const cheda = sineAltitude * radius / sineColatitude;
  const unnataSine = cheda * radius / dayRadius;
  const versedSineNata = antya - unnataSine;
  if (versedSineNata < -1e-9) {
    throw new RangeError("Inverse chain produced a negative versed-sine value; supplied table inputs are inconsistent.");
  }
  return {
    cheda,
    unnataSine,
    versedSineNata: Math.max(0, versedSineNata),
    provenance: "source-transcription arithmetic candidate",
    sourceAnchor: "Sūrya-siddhānta III.38–39",
    nextRequiredStep: "Invert the source's versed-sine table to an arc; obtain east/west sign independently.",
    limitation: "Does not calculate a signed nata or implement the historical sine tables."
  };
}

function close(a, b, tolerance = 1e-9) {
  return Math.abs(a - b) <= tolerance;
}

export function runChapter3NataTableArithmeticTests() {
  const tests = [];
  const check = (name, fn) => {
    try {
      tests.push({ name, passed: Boolean(fn()) });
    } catch (error) {
      tests.push({ name, passed: false, error: error.message });
    }
  };

  check("III.35–36 forward and III.38–39 inverse arithmetic round-trip", () => {
    const input = {
      radius: 3438,
      sineColatitude: 3000,
      dayRadius: 2500,
      antya: 2800,
      versedSineNata: 400
    };
    const forward = chapter3ForwardAltitudeSineFromTableValues(input);
    const inverse = chapter3InverseVersedSineFromTableValues({
      radius: input.radius,
      sineColatitude: input.sineColatitude,
      dayRadius: input.dayRadius,
      antya: input.antya,
      sineAltitude: forward.sineAltitude
    });
    return close(inverse.versedSineNata, input.versedSineNata) &&
      close(inverse.cheda, forward.cheda) &&
      close(inverse.unnataSine, input.antya - input.versedSineNata);
  });

  check("forward chain rejects a versed sine beyond antya", () => {
    try {
      chapter3ForwardAltitudeSineFromTableValues({
        radius: 3438, sineColatitude: 3000, dayRadius: 2500,
        antya: 300, versedSineNata: 400
      });
      return false;
    } catch (error) {
      return error instanceof RangeError;
    }
  });

  check("forward chain rejects sine-table quantities above radius", () => {
    try {
      chapter3ForwardAltitudeSineFromTableValues({
        radius: 3438, sineColatitude: 3500, dayRadius: 2500,
        antya: 2800, versedSineNata: 400
      });
      return false;
    } catch (error) {
      return error instanceof RangeError;
    }
  });

  check("inverse chain rejects altitude sine above radius", () => {
    try {
      chapter3InverseVersedSineFromTableValues({
        radius: 3438, sineColatitude: 3000, dayRadius: 2500,
        antya: 2800, sineAltitude: 3438.1
      });
      return false;
    } catch (error) {
      return error instanceof RangeError;
    }
  });

  check("source-table arithmetic does not claim a signed nata", () => {
    const out = chapter3InverseVersedSineFromTableValues({
      radius: 3438, sineColatitude: 3000, dayRadius: 2500,
      antya: 2800, sineAltitude: 1000
    });
    return !("nataDeg" in out) && !("signedNata" in out) &&
      out.nextRequiredStep.includes("east/west sign independently");
  });

  return {
    tests,
    total: tests.length,
    passed: tests.filter(test => test.passed).length,
    allPassed: tests.every(test => test.passed),
    note: "Tests verify the transcribed algebra only using synthetic table values; they do not validate historical table entries or certify a classical nata."
  };
}
