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
export function arcFromSinePrana(sineValue) {
  finite('sineValue', sineValue);
  if (Math.abs(sineValue) > 1 + 1e-12) {
    throw new RangeError(`Sine outside inverse-sine domain: ${sineValue}`);
  }
  const arcDeg = Math.asin(clamp(sineValue, -1, 1)) * 180 / Math.PI;
  return { arcDeg, carakhandaPrana: arcDeg * SS_PRANA_PER_DEGREE };
}

/** Full continuous-equation diagnostic; declination sign is preserved. */
export function carakhanda({ declinationDeg, observerLatitudeDeg, radius = SS_SINE_RADIUS }) {
  const intermediate = caraSine(declinationDeg, observerLatitudeDeg, radius);
  const arc = arcFromSinePrana(intermediate.sineCara);
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
  check('versed sine at 0° is zero', near(versedSine(0), 0));
  check('day radius at 0° equals radius', near(dayRadius(0), 3438));
  check('equinoctial shadow at equator is zero', near(equinoctialShadow(0), 0));
  check('cara is zero at equator', near(carakhanda({ declinationDeg: 20, observerLatitudeDeg: 0 }).carakhandaPrana, 0));
  const north = carakhanda({ declinationDeg: 20, observerLatitudeDeg: 29.5828 });
  const south = carakhanda({ declinationDeg: 20, observerLatitudeDeg: -29.5828 });
  check('north/south latitude gives opposite signed cara', near(north.carakhandaPrana, -south.carakhandaPrana));
  const southDec = carakhanda({ declinationDeg: -20, observerLatitudeDeg: 29.5828 });
  check('north/south declination gives opposite signed cara', near(north.carakhandaPrana, -southDec.carakhandaPrana));
  check('cara intermediate matches tan(latitude) × tan(declination)', near(north.sineCara, Math.tan(29.5828 * Math.PI / 180) * Math.tan(20 * Math.PI / 180)));
  return { pass: checks.every(item => item.pass), checks };
}
