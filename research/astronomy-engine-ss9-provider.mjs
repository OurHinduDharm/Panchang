/**
 * MIT Astronomy Engine apparent-place adapter for the SS9 research kernel.
 * Geocentric apparent vectors are rotated EQJ -> true equator of date (EQD).
 * Observer latitude is applied later by the SS9 oblique-ascension kernel.
 */
import * as Astronomy from "astronomy-engine";
import { signedAngleDifference } from "./ss9-location-model.mjs";

const BODY_NAMES = Object.freeze({
  Mercury: "Mercury",
  Venus: "Venus",
  Jupiter: "Jupiter"
});

const CANOPUS = Object.freeze({
  hip: 30438,
  raHoursJ2000: 6 + 23 / 60 + 57.10988 / 3600,
  decDegreesJ2000: -(52 + 41 / 60 + 44.3810 / 3600),
  properMotionRaCosDecMasPerYear: 19.93,
  properMotionDecMasPerYear: 23.24,
  parallaxMas: 10.55,
  distanceLightYears: (1000 / 10.55) * 3.261563777
});

function normalizeHours(hours) {
  return ((hours % 24) + 24) % 24;
}

function defineCanopusForDate(date) {
  const yearsFromJ2000 =
    (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400_000);
  const cosDec = Math.cos(CANOPUS.decDegreesJ2000 * Math.PI / 180);
  const raShiftDegrees =
    (CANOPUS.properMotionRaCosDecMasPerYear / cosDec) *
    yearsFromJ2000 / 3_600_000;
  const decShiftDegrees =
    CANOPUS.properMotionDecMasPerYear * yearsFromJ2000 / 3_600_000;
  const raHours = normalizeHours(CANOPUS.raHoursJ2000 + raShiftDegrees / 15);
  const decDegrees = CANOPUS.decDegreesJ2000 + decShiftDegrees;
  Astronomy.DefineStar(
    Astronomy.Body.Star1,
    raHours,
    decDegrees,
    CANOPUS.distanceLightYears
  );
}

function vectorFor(body, date) {
  return Astronomy.GeoVector(body, date, true);
}

function apparentEquatorialOfDate(vector, date) {
  const rotation = Astronomy.Rotation_EQJ_EQD(date);
  const eqd = Astronomy.RotateVector(rotation, vector);
  const sphere = Astronomy.SphereFromVector(eqd);
  return {
    rightAscensionDeg: sphere.lon,
    declinationDeg: sphere.lat
  };
}

/**
 * Returns a synchronous sampler for one target body. Supported targets:
 * Mercury, Venus, Jupiter and Agastya (Canopus / alpha Carinae).
 * Each sample is geocentric apparent and independent of observer location;
 * the caller supplies the observer latitude to the SS9 kernel.
 */
export function createSs9ApparentSampleAt(targetName) {
  const bodyName = BODY_NAMES[targetName];
  if (!bodyName && targetName !== "Agastya") {
    throw new RangeError("Unsupported SS9 target: " + targetName);
  }

  return utcMilliseconds => {
    if (!Number.isFinite(utcMilliseconds)) throw new TypeError("UTC milliseconds required");
    const date = new Date(utcMilliseconds);
    if (!Number.isFinite(date.getTime())) throw new RangeError("invalid sample date");

    if (targetName === "Agastya") defineCanopusForDate(date);
    const targetBody = targetName === "Agastya"
      ? Astronomy.Body.Star1
      : Astronomy.Body[bodyName];

    const sunVector = vectorFor(Astronomy.Body.Sun, date);
    const targetVector = vectorFor(targetBody, date);
    const sunEcliptic = Astronomy.Ecliptic(sunVector);
    const targetEcliptic = Astronomy.Ecliptic(targetVector);

    return {
      sunEquatorial: apparentEquatorialOfDate(sunVector, date),
      objectEquatorial: apparentEquatorialOfDate(targetVector, date),
      elongationDeg: signedAngleDifference(targetEcliptic.elon, sunEcliptic.elon),
      frame: "EQD apparent geocentric; true equator of date",
      eclipticFrame: "ECT true ecliptic of date",
      engine: "Astronomy Engine 2.1.19",
      target: targetName,
      utc: date.toISOString()
    };
  };
}

export const CANOPUS_CATALOG_REFERENCE = Object.freeze({
  ...CANOPUS,
  source: "SIMBAD HIP 30438, ICRS J2000; proper motions in mas/year",
  sourceUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=HIP30438",
  limitation: "Astronomy Engine DefineStar has no proper-motion parameter; this adapter applies the listed linear proper-motion correction before defining the star. Radial-velocity perspective acceleration is not modelled."
});
