/**
 * Research-only Sūrya-siddhānta Chapter II sine/versed-sine table adapter.
 *
 * The 24 sine entries are the standard tabular values from II.17–22
 * (Burgess edition). Versed-sines are derived by the II.22 instruction:
 * subtract the sine values in reverse order from R = 3438.
 *
 * Inverse lookup uses linear interpolation across the 225-arcminute table
 * intervals as a documented candidate for II.30–32. The returned arc-minute
 * value is also converted to asu/vināḍī/nāḍī using the Chapter I.11–12 scale.
 * This is a candidate table path, not a complete III.39 result; no signed
 * east/west nata is inferred here.
 */

export const SURYA_SIDDHANTA_RADIUS = 3438;
export const SURYA_SIDDHANTA_SINE_STEP_ARCMIN = 225;

export const SURYA_SIDDHANTA_CHAPTER2_SINES = Object.freeze([
  0, 225, 449, 671, 890, 1105, 1315, 1520, 1719, 1910, 2093, 2267,
  2431, 2585, 2728, 2859, 2978, 3084, 3177, 3256, 3321, 3372, 3409,
  3431, 3438
]);

export const SURYA_SIDDHANTA_CHAPTER2_VERSED_SINES = Object.freeze(
  SURYA_SIDDHANTA_CHAPTER2_SINES.map((_, index, sines) =>
    SURYA_SIDDHANTA_RADIUS - sines[sines.length - 1 - index]
  )
);

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite.");
}

/**
 * Invert a table versed-sine value to arcminutes.
 * Interpolation is linear between the two adjacent source table entries.
 */

/** Chapter II sine-table interpolation candidate for a first-quadrant arc. */
export function chapter2SineFromArcMinutes(arcMinutes) {
  finite(arcMinutes, "arcMinutes");
  if (arcMinutes < 0 || arcMinutes > 5400) {
    throw new RangeError("arcMinutes must be in [0, 5400] for a first-quadrant sine.");
  }
  if (arcMinutes === 5400) {
    return { sine: SURYA_SIDDHANTA_RADIUS, lowerTableIndex: 23, upperTableIndex: 24, interpolationFraction: 1 };
  }
  const tablePosition = arcMinutes / SURYA_SIDDHANTA_SINE_STEP_ARCMIN;
  const lower = Math.floor(tablePosition);
  const upper = lower + 1;
  const fraction = tablePosition - lower;
  const sine = SURYA_SIDDHANTA_CHAPTER2_SINES[lower] +
    fraction * (SURYA_SIDDHANTA_CHAPTER2_SINES[upper] - SURYA_SIDDHANTA_CHAPTER2_SINES[lower]);
  return { sine, lowerTableIndex: lower, upperTableIndex: upper, interpolationFraction: fraction };
}

/** Chapter II versed-sine table interpolation candidate for a first-quadrant arc. */
export function chapter2VersedSineFromArcMinutes(arcMinutes) {
  finite(arcMinutes, "arcMinutes");
  if (arcMinutes < 0 || arcMinutes > 5400) {
    throw new RangeError("arcMinutes must be in [0, 5400] for a first-quadrant versed sine.");
  }
  if (arcMinutes === 5400) {
    return { versedSine: SURYA_SIDDHANTA_RADIUS, lowerTableIndex: 23, upperTableIndex: 24, interpolationFraction: 1 };
  }
  const tablePosition = arcMinutes / SURYA_SIDDHANTA_SINE_STEP_ARCMIN;
  const lower = Math.floor(tablePosition);
  const upper = lower + 1;
  const fraction = tablePosition - lower;
  const versedSine = SURYA_SIDDHANTA_CHAPTER2_VERSED_SINES[lower] +
    fraction * (SURYA_SIDDHANTA_CHAPTER2_VERSED_SINES[upper] - SURYA_SIDDHANTA_CHAPTER2_VERSED_SINES[lower]);
  return { versedSine, lowerTableIndex: lower, upperTableIndex: upper, interpolationFraction: fraction };
}

/**
 * Chapter I.11–12 time scale: one prāṇa/asu corresponds to one arcminute
 * of revolution; 6 prāṇas = 1 vināḍī and 360 prāṇas = 1 nāḍī.
 * This converts an already recovered great-circle arc, not a modern clock
 * hour angle and not a shadow length.
 */
export function chapter1ArcMinutesToNataTimeUnits(arcMinutes) {
  finite(arcMinutes, "arcMinutes");
  if (arcMinutes < 0 || arcMinutes > 21600) {
    throw new RangeError("arcMinutes must be in [0, 21600] for one full revolution.");
  }
  return {
    arcMinutes,
    nataAsuCandidate: arcMinutes,
    nataVinadiCandidate: arcMinutes / 6,
    nataNadiCandidate: arcMinutes / 360,
    provenance: "Chapter I.11–12 time-unit conversion candidate",
    limitation: "Requires the Chapter III.39 recovered great-circle arc and separately established east/west sign."
  };
}

/**
 * Invert the Chapter II sine table by locating the enclosing tabular values
 * and interpolating their arc positions. This avoids substituting modern
 * asin() for the source-table operation.
 */
export function chapter2ArcMinutesFromSine(sine) {
  finite(sine, "sine");
  const table = SURYA_SIDDHANTA_CHAPTER2_SINES;
  if (sine < table[0] || sine > table[table.length - 1]) {
    throw new RangeError("sine is outside the Chapter II table range [0, radius].");
  }
  if (sine === table[table.length - 1]) {
    return {
      arcMinutes: 5400,
      lowerTableIndex: 23,
      upperTableIndex: 24,
      interpolationFraction: 1,
      provenance: "Chapter II tabular sine inversion candidate"
    };
  }
  let upper = 1;
  while (upper < table.length && table[upper] < sine) upper++;
  const lower = upper - 1;
  const difference = table[upper] - table[lower];
  if (!(difference > 0)) throw new RangeError("Adjacent sine-table entries are not increasing.");
  const fraction = (sine - table[lower]) / difference;
  return {
    arcMinutes: (lower + fraction) * SURYA_SIDDHANTA_SINE_STEP_ARCMIN,
    lowerTableIndex: lower,
    upperTableIndex: upper,
    interpolationFraction: fraction,
    provenance: "Chapter II tabular sine inversion candidate"
  };
}

export function chapter2ArcMinutesFromVersedSine(versedSine) {
  finite(versedSine, "versedSine");
  const table = SURYA_SIDDHANTA_CHAPTER2_VERSED_SINES;
  if (versedSine < table[0] || versedSine > table[table.length - 1]) {
    throw new RangeError("versedSine is outside the Chapter II table range [0, radius].");
  }
  if (versedSine === table[table.length - 1]) {
    return {
      arcMinutes: 5400,
      lowerTableIndex: 23,
      upperTableIndex: 24,
      interpolationFraction: 1,
      provenance: "Chapter II tabular versed-sine interpolation candidate",
      timeUnits: chapter1ArcMinutesToNataTimeUnits(5400),
      limitation: "Arc/time-unit magnitude only; east/west sign is not inferred."
    };
  }

  let upper = 1;
  while (upper < table.length && table[upper] < versedSine) upper++;
  const lower = upper - 1;
  const difference = table[upper] - table[lower];
  if (!(difference > 0)) throw new RangeError("Adjacent versed-sine table entries are not increasing.");
  const fraction = (versedSine - table[lower]) / difference;
  return {
    arcMinutes: (lower + fraction) * SURYA_SIDDHANTA_SINE_STEP_ARCMIN,
    lowerTableIndex: lower,
    upperTableIndex: upper,
    interpolationFraction: fraction,
    provenance: "Chapter II tabular versed-sine interpolation candidate",
    timeUnits: chapter1ArcMinutesToNataTimeUnits((lower + fraction) * SURYA_SIDDHANTA_SINE_STEP_ARCMIN),
    limitation: "Arc/time-unit magnitude only; east/west sign is not inferred."
  };
}

export function runChapter2VersedSineTableTests() {
  const tests = [];
  const check = (name, fn) => {
    try {
      tests.push({ name, passed: Boolean(fn()) });
    } catch (error) {
      tests.push({ name, passed: false, error: error.message });
    }
  };
  const table = SURYA_SIDDHANTA_CHAPTER2_VERSED_SINES;


  check("sine-table interpolation reproduces all tabular nodes", () =>
    SURYA_SIDDHANTA_CHAPTER2_SINES.every((value, index) =>
      Math.abs(chapter2SineFromArcMinutes(index * 225).sine - value) < 1e-9));

  check("versed-sine interpolation reproduces all tabular nodes", () =>
    table.every((value, index) =>
      Math.abs(chapter2VersedSineFromArcMinutes(index * 225).versedSine - value) < 1e-9));

  check("inverse sine table maps exact sine nodes back to 225-arcminute arcs", () =>
    SURYA_SIDDHANTA_CHAPTER2_SINES.every((value, index) =>
      Math.abs(chapter2ArcMinutesFromSine(value).arcMinutes - index * 225) < 1e-9));

  check("inverse sine table midpoint interpolation is monotonic and rejects out-of-range values", () => {
    const i = 8;
    const mid = (SURYA_SIDDHANTA_CHAPTER2_SINES[i] + SURYA_SIDDHANTA_CHAPTER2_SINES[i + 1]) / 2;
    const got = chapter2ArcMinutesFromSine(mid);
    let rejected = false;
    try { chapter2ArcMinutesFromSine(SURYA_SIDDHANTA_RADIUS + 1); }
    catch (error) { rejected = error instanceof RangeError; }
    return Math.abs(got.arcMinutes - (i + 0.5) * 225) < 1e-9 && rejected;
  });

  check("sine interpolation rejects arcs outside the first quadrant", () => {
    try {
      chapter2SineFromArcMinutes(5400.01);
      return false;
    } catch (error) {
      return error instanceof RangeError;
    }
  });

  check("derived versed-sine table begins at zero and ends at radius", () =>
    table[0] === 0 && table[24] === SURYA_SIDDHANTA_RADIUS);

  check("derived versed-sine table is strictly increasing", () =>
    table.every((value, index) => index === 0 || value > table[index - 1]));

  check("every exact table entry maps to its 225-arcminute grid point", () =>
    table.every((value, index) => {
      const result = chapter2ArcMinutesFromVersedSine(value);
      return Math.abs(result.arcMinutes - index * 225) < 1e-9 &&
        Math.abs(result.timeUnits.nataAsuCandidate - index * 225) < 1e-9 &&
        Math.abs(result.timeUnits.nataNadiCandidate - index * 225 / 360) < 1e-9;
    }));

  check("midpoint interpolation stays midway between adjacent table arcs", () => {
    const index = 10;
    const midpoint = (table[index] + table[index + 1]) / 2;
    const result = chapter2ArcMinutesFromVersedSine(midpoint);
    return Math.abs(result.arcMinutes - (index + 0.5) * 225) < 1e-9;
  });

  check("out-of-range versed-sine values are rejected", () => {
    try {
      chapter2ArcMinutesFromVersedSine(SURYA_SIDDHANTA_RADIUS + 0.01);
      return false;
    } catch (error) {
      return error instanceof RangeError;
    }
  });

  check("arc-minute to asu/nāḍī conversion follows Chapter I.11–12", () => {
    const result = chapter2ArcMinutesFromVersedSine(table[8]);
    return Math.abs(result.timeUnits.nataAsuCandidate - result.arcMinutes) < 1e-9 &&
      Math.abs(result.timeUnits.nataNadiCandidate - result.arcMinutes / 360) < 1e-9;
  });

  check("lookup does not fabricate an east/west sign", () => {
    const result = chapter2ArcMinutesFromVersedSine(table[8]);
    return !("signedNata" in result) && result.limitation.includes("east/west sign");
  });

  return {
    tests,
    total: tests.length,
    passed: tests.filter(test => test.passed).length,
    allPassed: tests.every(test => test.passed),
    tableSines: SURYA_SIDDHANTA_CHAPTER2_SINES,
    tableVersedSines: table,
    note: "This validates the encoded table, interpolation, and unit arithmetic only; it does not certify the III.35–39 source inputs or a signed classical nata."
  };
}
