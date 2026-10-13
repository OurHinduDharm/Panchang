import { chapter2SineFromArcMinutes, chapter2VersedSineFromArcMinutes, SURYA_SIDDHANTA_RADIUS } from "./ss_chapter2_versed_sine_table.js";

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
      antya < 0 || antya > 2 * radius ||
      versedSineNata < 0 || versedSineNata > radius) {
    throw new RangeError("Sine values must lie within the radius; antya must lie within [0, 2R].");
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
  if (sineColatitude > radius || dayRadius > radius || antya < 0 || antya > 2 * radius) {
    throw new RangeError("Sine values must lie within the radius; antya must lie within [0, 2R].");
  }
  if (sineAltitude > radius) {
    throw new RangeError("sineAltitude cannot exceed the supplied table radius.");
  }

  const cheda = sineAltitude * radius / sineColatitude;
  const unnataSine = cheda * radius / dayRadius;
  const versedSineNata = antya - unnataSine;
  if (versedSineNata < -1e-9 || versedSineNata > radius + 1e-9) {
    throw new RangeError("Inverse chain produced a versed-sine value outside [0, radius]; supplied table inputs are inconsistent.");
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


/**
 * Reconstruct source inputs for III.35–39 using II.60–61 and III.34.
 * Latitude and declination sine inputs are signed; co-latitude sine and
 * declination versed-sine are non-negative magnitudes.
 */
export function chapter3DayMeasureInputsFromTableValues({
  radius,
  sineLatitude,
  sineColatitude,
  sineDeclination,
  versedSineDeclination
}) {
  positive(radius, "radius");
  finite(sineLatitude, "sineLatitude");
  positive(sineColatitude, "sineColatitude");
  finite(sineDeclination, "sineDeclination");
  finite(versedSineDeclination, "versedSineDeclination");

  if (Math.abs(sineLatitude) > radius || sineColatitude > radius ||
      Math.abs(sineDeclination) > radius ||
      versedSineDeclination < 0 || versedSineDeclination > radius) {
    throw new RangeError("Latitude/declination sine quantities must lie within the supplied radius.");
  }
  if (sineColatitude < 1e-9) {
    throw new RangeError("Co-latitude sine is too close to zero for the cara construction.");
  }

  const dayRadius = radius - versedSineDeclination; // SS II.60
  if (!(dayRadius > 0)) {
    throw new RangeError("Day-radius is non-positive for the supplied declination table value.");
  }
  const earthSine = sineDeclination * sineLatitude / sineColatitude; // SS II.61, equinoctial shadow = 12 tan(latitude)
  const caraSine = earthSine * radius / dayRadius; // SS II.61
  if (Math.abs(caraSine) > radius + 1e-9) {
    throw new RangeError("Cara sine lies outside the table radius; geometry or input signs are inconsistent.");
  }
  const antya = radius + caraSine; // SS III.34, signed by latitude/declination convention
  return {
    dayRadius,
    earthSine,
    caraSine,
    antya,
    provenance: "Chapter II.60–61 and Chapter III.34 formula candidate",
    limitation: "Requires validated signed table values and edition-specific sign confirmation."
  };
}


/**
 * Full table-input candidate: derive signed latitude/declination sine values,
 * day-radius, cara-sine, and antya using the Chapter II table adapter.
 * Angles are supplied as signed arcminutes (not decimal degrees).
 */
export function chapter3DayMeasureInputsFromAngles({
  latitudeArcMinutes,
  declinationArcMinutes,
  radius = SURYA_SIDDHANTA_RADIUS
}) {
  finite(latitudeArcMinutes, "latitudeArcMinutes");
  finite(declinationArcMinutes, "declinationArcMinutes");
  positive(radius, "radius");
  if (radius !== SURYA_SIDDHANTA_RADIUS) {
    throw new RangeError("This table adapter is fixed to the Chapter II radius 3438.");
  }
  if (Math.abs(latitudeArcMinutes) > 5400 || Math.abs(declinationArcMinutes) > 5400) {
    throw new RangeError("Latitude and declination magnitudes must be within the first quadrant.");
  }
  const absLatitude = Math.abs(latitudeArcMinutes);
  const absDeclination = Math.abs(declinationArcMinutes);
  const latitudeSign = Math.sign(latitudeArcMinutes);
  const declinationSign = Math.sign(declinationArcMinutes);
  const sineLatitude = chapter2SineFromArcMinutes(absLatitude).sine * latitudeSign;
  const sineColatitude = chapter2SineFromArcMinutes(5400 - absLatitude).sine;
  const sineDeclination = chapter2SineFromArcMinutes(absDeclination).sine * declinationSign;
  const versedSineDeclination = chapter2VersedSineFromArcMinutes(absDeclination).versedSine;
  const result = chapter3DayMeasureInputsFromTableValues({
    radius,
    sineLatitude,
    sineColatitude,
    sineDeclination,
    versedSineDeclination
  });
  return {
    ...result,
    latitudeArcMinutes,
    declinationArcMinutes,
    sineLatitude,
    sineColatitude,
    sineDeclination,
    versedSineDeclination,
    provenance: "Chapter II tabular interpolation + II.60–61 + III.34 formula candidate",
    limitation: "No civil-instant/epoch mapping, observed altitude, or east/west nata sign is inferred."
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



  check("angle inputs flow through Chapter II tables into day-radius and antya", () => {
    const out = chapter3DayMeasureInputsFromAngles({
      latitudeArcMinutes: 1800,
      declinationArcMinutes: 600
    });
    return close(out.sineLatitude, 1719) &&
      out.dayRadius > 0 && out.antya > 3438 &&
      out.provenance.includes("tabular interpolation");
  });

  check("signed declination controls cara correction through the table path", () => {
    const north = chapter3DayMeasureInputsFromAngles({
      latitudeArcMinutes: 1800, declinationArcMinutes: 600
    });
    const south = chapter3DayMeasureInputsFromAngles({
      latitudeArcMinutes: 1800, declinationArcMinutes: -600
    });
    return north.antya > 3438 && south.antya < 3438 &&
      close(north.dayRadius, south.dayRadius);
  });

  check("II.60–61 and III.34 build day-radius and antya from synthetic table values", () => {
    const out = chapter3DayMeasureInputsFromTableValues({
      radius: 3438, sineLatitude: 1000, sineColatitude: 3290,
      sineDeclination: 500, versedSineDeclination: 37
    });
    const expectedDayRadius = 3438 - 37;
    const expectedCaraSine = (500 * 1000 / 3290) * 3438 / expectedDayRadius;
    return close(out.dayRadius, expectedDayRadius) &&
      close(out.caraSine, expectedCaraSine) &&
      close(out.antya, 3438 + expectedCaraSine);
  });

  check("southern declination reverses cara/antya correction sign", () => {
    const north = chapter3DayMeasureInputsFromTableValues({
      radius: 3438, sineLatitude: 1000, sineColatitude: 3290,
      sineDeclination: 500, versedSineDeclination: 37
    });
    const south = chapter3DayMeasureInputsFromTableValues({
      radius: 3438, sineLatitude: 1000, sineColatitude: 3290,
      sineDeclination: -500, versedSineDeclination: 37
    });
    return north.antya > 3438 && south.antya < 3438 &&
      close(north.caraSine, -south.caraSine);
  });

  check("antya may exceed radius because it is a day-measure quantity", () => {
    const out = chapter3ForwardAltitudeSineFromTableValues({
      radius: 3438, sineColatitude: 3000, dayRadius: 2500,
      antya: 3500, versedSineNata: 400
    });
    return out.sineAltitude > 0;
  });

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
