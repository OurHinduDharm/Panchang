/**
 * Paatadhikara research mathematics. NOT a production Mahapata calendar.
 *
 * Inputs are apparent geocentric TROPICAL ecliptic coordinates of date.
 * Sun, Moon and true obliquity must use the same epoch, frame and timescale.
 * No ayanamsha is applied to declination or seasonal (ayana) classification.
 *
 * The two traditional classes are determined from the relative ayanas and
 * declination hemispheres at an equal-absolute-declination root:
 * Vyatipata: different ayanas, same declination hemisphere;
 * Vaidhriti: same ayana, opposite declination hemispheres.
 * These candidates still require independent Panchang validation.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const DAY_MS = 86_400_000;
const EPS_DEG = 1e-7;

export const MAHAPATA_RESEARCH_ONLY = true;

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
}

export function normalizeDegrees(value) {
  finite("angle", value);
  return ((value % 360) + 360) % 360;
}

export function angularDistanceDegrees(a, b) {
  const difference = normalizeDegrees(a - b);
  return Math.min(difference, 360 - difference);
}

export function declinationFromEcliptic({ longitudeDeg, latitudeDeg, obliquityDeg }) {
  finite("longitude", longitudeDeg);
  finite("latitude", latitudeDeg);
  finite("obliquity", obliquityDeg);
  if (Math.abs(latitudeDeg) > 90 || Math.abs(obliquityDeg) > 90) {
    throw new RangeError("latitude and obliquity must be within +/-90 degrees");
  }
  const lon = longitudeDeg * RAD;
  const lat = latitudeDeg * RAD;
  const eps = obliquityDeg * RAD;
  const sine = Math.sin(lat) * Math.cos(eps) +
    Math.cos(lat) * Math.sin(eps) * Math.sin(lon);
  return Math.asin(Math.max(-1, Math.min(1, sine))) * DEG;
}

function signWithBoundary(value, tolerance = EPS_DEG) {
  return value > tolerance ? 1 : value < -tolerance ? -1 : 0;
}

function validateCoordinates(coordinates, name) {
  if (!coordinates || typeof coordinates !== "object") {
    throw new TypeError(`${name} coordinates are required`);
  }
  finite(`${name} longitude`, coordinates.longitudeDeg);
  finite(`${name} latitude`, coordinates.latitudeDeg);
}

/** Classify an equal-declination candidate using its ayana and gola. */
export function classifyMahapataGeometry({
  sunLongitudeDeg, moonLongitudeDeg,
  sunDeclinationDeg, moonDeclinationDeg
}) {
  finite("Sun longitude", sunLongitudeDeg);
  finite("Moon longitude", moonLongitudeDeg);
  finite("Sun declination", sunDeclinationDeg);
  finite("Moon declination", moonDeclinationDeg);
  const sunGola = signWithBoundary(sunDeclinationDeg);
  const moonGola = signWithBoundary(moonDeclinationDeg);
  // cos(tropical longitude) changes sign at the two solstices.
  const sunAyana = signWithBoundary(Math.cos(sunLongitudeDeg * RAD), 1e-10);
  const moonAyana = signWithBoundary(Math.cos(moonLongitudeDeg * RAD), 1e-10);
  let eventClass = null;
  if (sunGola && moonGola && sunAyana && moonAyana) {
    if (sunAyana !== moonAyana && sunGola === moonGola) eventClass = "Vyatipata";
    if (sunAyana === moonAyana && sunGola !== moonGola) eventClass = "Vaidhriti";
  }
  return { eventClass, sunAyana, moonAyana, sunGola, moonGola };
}

/**
 * Event diagnostic at one instant. A longitude-sum proximity is reported
 * independently, not imposed as a second exact equality: nonzero lunar
 * ecliptic latitude changes the declination equality instant.
 */
export function diagnoseMahapata({ sun, moon, obliquityDeg }) {
  validateCoordinates(sun, "Sun");
  validateCoordinates(moon, "Moon");
  const sunDeclinationDeg = declinationFromEcliptic({
    ...sun, obliquityDeg
  });
  const moonDeclinationDeg = declinationFromEcliptic({
    ...moon, obliquityDeg
  });
  const geometry = classifyMahapataGeometry({
    sunLongitudeDeg: sun.longitudeDeg,
    moonLongitudeDeg: moon.longitudeDeg,
    sunDeclinationDeg,
    moonDeclinationDeg
  });
  const { eventClass, sunAyana, moonAyana, sunGola, moonGola } = geometry;
  const longitudeSumDeg = normalizeDegrees(sun.longitudeDeg + moon.longitudeDeg);
  return {
    eventClass,
    declinationDifferenceDeg: Math.abs(sunDeclinationDeg) - Math.abs(moonDeclinationDeg),
    sunDeclinationDeg,
    moonDeclinationDeg,
    sunAyana,
    moonAyana,
    sunGola,
    moonGola,
    longitudeSumDeg,
    sumResidualDeg: eventClass === "Vyatipata"
      ? angularDistanceDegrees(longitudeSumDeg, 180)
      : eventClass === "Vaidhriti"
        ? angularDistanceDegrees(longitudeSumDeg, 0)
        : null
  };
}

/**
 * Finite bisection on a sign-changing bracket. Throws instead of fabricating
 * a result for a non-bracketed (including generic tangent) root.
 * The default 1 ms resolution keeps the root residual sufficiently small
 * for rapidly varying lunar declination; this is numerical precision only,
 * not a guarantee of astronomical timing accuracy.
 */
export function bisectSignChange(fn, startUtcMs, endUtcMs, toleranceMs = 1) {
  if (typeof fn !== "function") throw new TypeError("function required");
  [startUtcMs, endUtcMs, toleranceMs].forEach((v, i) => finite(["start", "end", "tolerance"][i], v));
  if (endUtcMs <= startUtcMs || toleranceMs <= 0) throw new RangeError("invalid root bracket");
  let low = startUtcMs, high = endUtcMs;
  let a = finite("bracket start value", fn(low));
  let b = finite("bracket end value", fn(high));
  if (a === 0) return low;
  if (b === 0) return high;
  if (Math.sign(a) === Math.sign(b)) throw new RangeError("root is not bracketed");
  for (let i = 0; i < 100 && high - low > toleranceMs; i++) {
    const mid = low + (high - low) / 2;
    const val = finite("midpoint value", fn(mid));
    if (val === 0) return mid;
    if (Math.sign(val) === Math.sign(a)) {
      low = mid; a = val;
    } else {
      high = mid; b = val;
    }
  }
  return low + (high - low) / 2;
}

/**
 * Returns diagnostic candidates; does not assert that they are verified
 * Drik Panchang or Surya Siddhanta Mahapata timestamps.
 *
 * ephemeris(dateUTC) -> {sun:{longitudeDeg,latitudeDeg},
 *                       moon:{longitudeDeg,latitudeDeg}, obliquityDeg}
 *
 * A sampled sign change or exact sampled zero is required. Unsampled
 * tangencies and multiple crossings inside one step are NOT guaranteed.
 */
export function scanMahapataCandidates({
  startUtcMs, endUtcMs, ephemeris, stepMs = 3 * 60 * 60_000,
  toleranceMs = 1
}) {
  if (typeof ephemeris !== "function") throw new TypeError("ephemeris callback required");
  [startUtcMs, endUtcMs, stepMs, toleranceMs].forEach((v, i) =>
    finite(["start", "end", "step", "tolerance"][i], v));
  if (endUtcMs <= startUtcMs || stepMs <= 0 || stepMs > DAY_MS ||
      toleranceMs <= 0) throw new RangeError("invalid scan range or resolution");
  const evaluate = utc => diagnoseMahapata(ephemeris(new Date(utc)));
  const found = [];
  let beforeUtc = startUtcMs, before = evaluate(beforeUtc);
  for (let utc = Math.min(startUtcMs + stepMs, endUtcMs);
       utc <= endUtcMs;) {
    const after = evaluate(utc);
    const x = before.declinationDifferenceDeg, y = after.declinationDifferenceDeg;
    if (x === 0 || y === 0 || Math.sign(x) !== Math.sign(y)) {
      const root = x === 0 ? beforeUtc : y === 0 ? utc :
        bisectSignChange(t => evaluate(t).declinationDifferenceDeg,
          beforeUtc, utc, toleranceMs);
      const diagnosis = evaluate(root);
      if (diagnosis.eventClass &&
          Math.abs(diagnosis.declinationDifferenceDeg) <= 1e-4 &&
          (!found.length || root - found[found.length - 1].utcMilliseconds > toleranceMs)) {
        found.push({
          utcMilliseconds: Math.round(root),
          utc: new Date(root).toISOString(),
          ...diagnosis,
          status: "research-candidate-unverified"
        });
      }
    }
    beforeUtc = utc;
    before = after;
    if (utc === endUtcMs) break;
    utc = Math.min(utc + stepMs, endUtcMs);
  }
  return found;
}
