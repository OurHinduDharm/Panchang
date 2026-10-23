/**
 * Research-only Chapter II.60–63 carakhanda calculation.
 *
 * This implements the verse's proportional equations using continuous
 * trigonometric values as an algebraic cross-check. It is NOT yet a literal
 * integer sine-table implementation: table interpolation, shadow convention,
 * and intermediate rounding remain separate validation gates.
 * Never import this into app.js / extra-panchang.js.
 */

export const SS_SINE_RADIUS = 3438;
export const SS_PRANA_PER_DEGREE = 60;

/**
 * Burgess Ch. II sine-table values at 3°45′ intervals (verses 15–22).
 * These are historical rounded entries, not modern floating-point sines.
 * Linear interpolation below is a diagnostic candidate; the source's exact
 * interpolation/rounding sequence still needs its own validation.
 */
export const SS_SINE_TABLE = Object.freeze([
  0, 225, 449, 671, 890, 1105, 1315, 1520, 1719, 1910, 2093, 2267,
  2431, 2585, 2728, 2859, 2978, 3084, 3177, 3256, 3321, 3372, 3409, 3431, 3438
]);
export const SS_SINE_TABLE_STEP_DEG = 3.75;

export function interpolatedSineTableValue(angleDeg) {
  finite('angleDeg', angleDeg);
  const sign = Math.sign(angleDeg);
  const a = Math.abs(angleDeg);
  if (a > 90) throw new RangeError('Sine-table angle must be within -90°..90°.');
  const position = a / SS_SINE_TABLE_STEP_DEG;
  const index = Math.floor(position);
  if (index >= SS_SINE_TABLE.length - 1) return sign * SS_SINE_TABLE[SS_SINE_TABLE.length - 1];
  const fraction = position - index;
  return sign * (SS_SINE_TABLE[index] + fraction * (SS_SINE_TABLE[index + 1] - SS_SINE_TABLE[index]));
}

function finite(name, value) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function versedSine(declinationDeg, radius = SS_SINE_RADIUS) {
  finite('declinationDeg', declinationDeg);
  finite('radius', radius);
  return radius * (1 - Math.cos(Math.abs(declinationDeg) * Math.PI / 180));
}

export function dayRadius(declinationDeg, radius = SS_SINE_RADIUS) {
  finite('declinationDeg', declinationDeg);
  finite('radius', radius);
  return radius - versedSine(declinationDeg, radius);
}

/** Gnomon-12 equinoctial shadow, derived geometrically for a terrestrial latitude. */
export function equinoctialShadow(observerLatitudeDeg) {
  finite('observerLatitudeDeg', observerLatitudeDeg);
  if (Math.abs(observerLatitudeDeg) >= 90) {
    throw new RangeError('Observer latitude must be strictly between -90° and +90°.');
  }
  return 12 * Math.tan(observerLatitudeDeg * Math.PI / 180);
}

export function sineTableValue(angleDeg, radius = SS_SINE_RADIUS) {
  finite('angleDeg', angleDeg);
  finite('radius', radius);
  return radius * Math.sin(angleDeg * Math.PI / 180);
}

/** Chapter II.61 earth-sine: declination sine × equinoctial shadow / 12. */
export function earthSine(declinationDeg, shadow, radius = SS_SINE_RADIUS) {
  finite('declinationDeg', declinationDeg);
  finite('shadow', shadow);
  finite('radius', radius);
  return sineTableValue(declinationDeg, radius) * shadow / 12;
}

/** Chapter II.61 sine of cara; returns an unclamped diagnostic and validates domain. */
export function caraSine(declinationDeg, observerLatitudeDeg, radius = SS_SINE_RADIUS) {
  const shadow = equinoctialShadow(observerLatitudeDeg);
  const earth = earthSine(declinationDeg, shadow, radius);
  const dyujya = dayRadius(declinationDeg, radius);
  if (dyujya <= 0) throw new RangeError('Day-radius must be positive.');
  const raw = earth * radius / dyujya;
  return { shadow, earthSine: earth, dayRadius: dyujya, sineCara: raw };
}

/** Convert the sine to the corresponding arc and then prāṇas (60 per degree). */
export function arcFromSinePrana(sineValue, radius = SS_SINE_RADIUS) {
  finite('sineValue', sineValue);
  finite('radius', radius);
  if (radius <= 0) throw new RangeError('Sine-table radius must be positive.');
  const normalizedSine = sineValue / radius;
  if (Math.abs(normalizedSine) > 1 + 1e-12) {
    throw new RangeError(`Sine outside inverse-sine domain after radius normalization: ${normalizedSine}`);
  }
  const arcDeg = Math.asin(clamp(normalizedSine, -1, 1)) * 180 / Math.PI;
  return { arcDeg, carakhandaPrana: arcDeg * SS_PRANA_PER_DEGREE };
}

/** Full continuous-equation diagnostic; declination sign is preserved. */
export function carakhanda({ declinationDeg, observerLatitudeDeg, radius = SS_SINE_RADIUS }) {
  const intermediate = caraSine(declinationDeg, observerLatitudeDeg, radius);
  const arc = arcFromSinePrana(intermediate.sineCara, radius);
  return {
    method: 'continuous-trigonometric-equation-diagnostic-not-literal-table',
    inputs: { declinationDeg, observerLatitudeDeg, radius },
    ...intermediate,
    ...arc
  };
}

export function runCarakhandaEquationTests() {
  const checks = [];
  const check = (name, condition, detail = '') => checks.push({ name, pass: Boolean(condition), detail });
  const near = (a, b, tolerance = 1e-9) => Math.abs(a - b) <= tolerance;

  check('sine radius at 90° equals 3438', near(sineTableValue(90), 3438));
  check('historical sine table has 25 entries including 0° and 90°', SS_SINE_TABLE.length === 25);
  check('historical sine table ends at radius 3438', SS_SINE_TABLE.at(-1) === 3438);
  check('linear interpolation between table nodes gives the 24° sine 1397', Math.round(interpolatedSineTableValue(24)) === 1397);
  check('table interpolation reproduces every tabular node', SS_SINE_TABLE.every((value, i) => near(interpolatedSineTableValue(i * SS_SINE_TABLE_STEP_DEG), value)));
  check('versed sine at 0° is zero', near(versedSine(0), 0));
  check('day radius at 0° equals radius', near(dayRadius(0), 3438));
  check('equinoctial shadow at equator is zero', near(equinoctialShadow(0), 0));
  check('cara is zero at equator', near(carakhanda({ declinationDeg: 20, observerLatitudeDeg: 0 }).carakhandaPrana, 0));
  const north = carakhanda({ declinationDeg: 20, observerLatitudeDeg: 29.5828 });
  const south = carakhanda({ declinationDeg: 20, observerLatitudeDeg: -29.5828 });
  check('north/south latitude gives opposite signed cara', near(north.carakhandaPrana, -south.carakhandaPrana));
  const southDec = carakhanda({ declinationDeg: -20, observerLatitudeDeg: 29.5828 });
  check('north/south declination gives opposite signed cara', near(north.carakhandaPrana, -southDec.carakhandaPrana));
  check('cara intermediate matches tan(latitude) × tan(declination)', near(north.sineCara / SS_SINE_RADIUS, Math.tan(29.5828 * Math.PI / 180) * Math.tan(20 * Math.PI / 180)));

  // Burgess's Washington table (578, 1061, 1263 prāṇas) is a benchmark
  // comparator. This continuous model checks the geometry only; it does not
  // claim exact reproduction of Burgess's integer-table rounding.
  const washingtonLatitude = 38.9; // 38°54′ N, as used for the comparator
  const obliquity = 24;
  const washington = [30, 60, 90].map(longitudeDeg => {
    const sinDeclination = Math.sin(obliquity * Math.PI / 180) *
      Math.sin(longitudeDeg * Math.PI / 180);
    const declinationDeg = Math.asin(sinDeclination) * 180 / Math.PI;
    return carakhanda({ declinationDeg, observerLatitudeDeg: washingtonLatitude }).carakhandaPrana;
  });
  check('Washington 30° continuous comparator is within 1.5 prāṇas of 578', Math.abs(washington[0] - 578) <= 1.5, washington[0].toFixed(4));
  check('Washington 60° continuous comparator is within 1.5 prāṇas of 1061', Math.abs(washington[1] - 1061) <= 1.5, washington[1].toFixed(4));
  check('Washington 90° continuous comparator is within 1.5 prāṇas of 1263', Math.abs(washington[2] - 1263) <= 1.5, washington[2].toFixed(4));
  return { pass: checks.every(item => item.pass), checks };
}
