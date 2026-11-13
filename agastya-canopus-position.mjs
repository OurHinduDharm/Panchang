/**
 * Canopus (Agastya) astrometric reference and topocentric position adapter.
 *
 * Source: CDS SIMBAD, alpha Carinae / HIP 30438, ICRS J2000 position,
 * proper motion and V-band magnitude as retrieved 2026-11-13.
 * Proper motion is propagated in the tangent plane; Astronomy Engine then
 * transforms the J2000 vector to the observer's true horizontal frame.
 */
const MAS_TO_RAD = Math.PI / (180 * 3600 * 1000);
const JULIAN_YEAR_DAYS = 365.25;
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);

export const AGASTYA_CANOPUS_CATALOG = Object.freeze({
  id: "HIP 30438",
  name: "Canopus (alpha Carinae)",
  source: "CDS SIMBAD",
  sourceUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Canopus",
  referenceFrame: "ICRS",
  referenceEpoch: "J2000.0",
  rightAscensionHours: 6 + 23 / 60 + 57.10988 / 3600,
  declinationDegrees: -(52 + 41 / 60 + 44.3810 / 3600),
  properMotionRaCosDecMasPerYear: 19.93,
  properMotionDecMasPerYear: 23.24,
  parallaxMas: 10.55,
  apparentVisualMagnitude: -0.74,
  properMotionReference: "2007A&A...474..653V",
  coordinatesReference: "2007A&A...474..653V"
});

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(label + " must be finite");
  return number;
}

function normalized(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

/** Propagates the catalogue direction to a date, returning a unit EQJ vector. */
export function getCanopusJ2000Direction(instant) {
  const date = instant instanceof Date ? instant : new Date(instant);
  if (!Number.isFinite(date.getTime())) throw new TypeError("instant must be a valid date");
  const years = (date.getTime() - J2000) / (JULIAN_YEAR_DAYS * 86_400_000);
  const ra = AGASTYA_CANOPUS_CATALOG.rightAscensionHours * 15 * Math.PI / 180;
  const dec = AGASTYA_CANOPUS_CATALOG.declinationDegrees * Math.PI / 180;
  const eastMotion = AGASTYA_CANOPUS_CATALOG.properMotionRaCosDecMasPerYear * MAS_TO_RAD * years;
  const northMotion = AGASTYA_CANOPUS_CATALOG.properMotionDecMasPerYear * MAS_TO_RAD * years;

  const base = {
    x: Math.cos(dec) * Math.cos(ra),
    y: Math.cos(dec) * Math.sin(ra),
    z: Math.sin(dec)
  };
  const east = { x: -Math.sin(ra), y: Math.cos(ra), z: 0 };
  const north = {
    x: -Math.sin(dec) * Math.cos(ra),
    y: -Math.sin(dec) * Math.sin(ra),
    z: Math.cos(dec)
  };
  return normalized({
    x: base.x + eastMotion * east.x + northMotion * north.x,
    y: base.y + eastMotion * east.y + northMotion * north.y,
    z: base.z + eastMotion * east.z + northMotion * north.z
  });
}

/** Computes Canopus apparent horizontal coordinates for a selected observer. */
export function getCanopusHorizontalPosition({ astronomy, observer, instant, refraction = "normal" }) {
  if (!astronomy || typeof astronomy.VectorFromSphere !== "function" ||
      typeof astronomy.Rotation_EQJ_HOR !== "function" ||
      typeof astronomy.RotateVector !== "function" ||
      typeof astronomy.HorizonFromVector !== "function") {
    throw new TypeError("Astronomy Engine vector and horizontal-coordinate APIs are required");
  }
  if (!observer || !Number.isFinite(Number(observer.latitude)) ||
      !Number.isFinite(Number(observer.longitude)) || !Number.isFinite(Number(observer.height))) {
    throw new TypeError("A complete Astronomy Engine observer is required");
  }
  const date = instant instanceof Date ? new Date(instant.getTime()) : new Date(instant);
  if (!Number.isFinite(date.getTime())) throw new TypeError("instant must be a valid date");

  const direction = getCanopusJ2000Direction(date);
  const sphere = {
    lon: Math.atan2(direction.y, direction.x) * 180 / Math.PI,
    lat: Math.asin(direction.z) * 180 / Math.PI,
    dist: 1e9
  };
  const eqjVector = astronomy.VectorFromSphere(sphere, date);
  const eqjToHor = astronomy.Rotation_EQJ_HOR(date, observer);
  const horizontalVector = astronomy.RotateVector(eqjToHor, eqjVector);
  const horizontal = astronomy.HorizonFromVector(horizontalVector, refraction);
  return Object.freeze({
    instant: date.toISOString(),
    object: "Canopus",
    catalogId: AGASTYA_CANOPUS_CATALOG.id,
    altitudeDeg: horizontal.lat,
    azimuthDeg: horizontal.lon,
    apparentMagnitude: AGASTYA_CANOPUS_CATALOG.apparentVisualMagnitude,
    referenceFrame: "J2000 propagated by proper motion, transformed to true horizontal frame",
    source: AGASTYA_CANOPUS_CATALOG.source
  });
}
