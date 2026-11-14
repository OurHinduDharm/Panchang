#!/usr/bin/env node
/**
 * Research-only Mahapata ephemeris comparison.
 *
 * The two classical ayana relations are kept separate:
 * - Vaidhriti: Sun and Moon declinations are equal in the same ayana.
 * - Vyatipata: Sun and Moon declinations are equal in magnitude in opposite ayanas.
 *
 * The contact interval is modelled as overlap of the apparent declination
 * bands of the solar and lunar disks. This is a modern numerical comparison
 * model, not yet the approved Karana-Kutuhala shara-khanda implementation.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { scanBracketedRoots } from "../mahapata-root-solver.mjs";

const require = createRequire(import.meta.url);
const astronomyEntry = require.resolve("astronomy-engine");
const Astronomy = require(path.join(path.dirname(astronomyEntry), "astronomy.min.js"));
const {
  Body,
  GeoVector,
  Rotation_EQJ_EQD,
  Rotation_EQJ_ECT,
  RotateVector
} = Astronomy;

const AU_KM = 149597870.7;
const SUN_RADIUS_AU = 695700 / AU_KM;
const MOON_RADIUS_AU = 1737.4 / AU_KM;
const HOUR_MS = 3600000;
const IST_OFFSET_MS = 330 * 60000;
const YEARS = [2026, 2027, 2028, 2029, 2030];
const cache = new Map();

function toIST(value) {
  return new Date(value + IST_OFFSET_MS).toISOString().replace("Z", "+05:30");
}
function vectorLength(v) {
  return Math.hypot(v.x, v.y, v.z);
}
function vectorDeclination(v) {
  return Math.atan2(v.z, Math.hypot(v.x, v.y)) * 180 / Math.PI;
}
function vectorLongitude(v) {
  return ((Math.atan2(v.y, v.x) * 180 / Math.PI) % 360 + 360) % 360;
}
function positions(timeMs) {
  const cached = cache.get(timeMs);
  if (cached) return cached;
  const date = new Date(timeMs);
  const sun = GeoVector(Body.Sun, date, true);
  const moon = GeoVector(Body.Moon, date, true);
  const eqdRotation = Rotation_EQJ_EQD(date);
  const eclipticRotation = Rotation_EQJ_ECT(date);
  const sunEqd = RotateVector(eqdRotation, sun);
  const moonEqd = RotateVector(eqdRotation, moon);
  const sunEcliptic = RotateVector(eclipticRotation, sun);
  const moonEcliptic = RotateVector(eclipticRotation, moon);
  const sunDistance = vectorLength(sun);
  const moonDistance = vectorLength(moon);
  const sunDec = vectorDeclination(sunEqd);
  const moonDec = vectorDeclination(moonEqd);
  const sunRadius = Math.asin(SUN_RADIUS_AU / sunDistance) * 180 / Math.PI;
  const moonRadius = Math.asin(MOON_RADIUS_AU / moonDistance) * 180 / Math.PI;
  const semidiameterSum = sunRadius + moonRadius;
  const declinationDifference = moonDec - sunDec;
  const declinationSum = moonDec + sunDec;
  const value = {
    sunDeclination: sunDec,
    moonDeclination: moonDec,
    declinationDifference,
    declinationSum,
    sunLongitude: vectorLongitude(sunEcliptic),
    moonLongitude: vectorLongitude(moonEcliptic),
    longitudeSum: ((vectorLongitude(sunEcliptic) + vectorLongitude(moonEcliptic)) % 360 + 360) % 360,
    longitudeDifference: Math.abs(((vectorLongitude(moonEcliptic) - vectorLongitude(sunEcliptic) + 540) % 360) - 180),
    semidiameterSum,
    vaidhritiClearance: Math.abs(declinationDifference) - semidiameterSum,
    vyatipataClearance: Math.abs(declinationSum) - semidiameterSum
  };
  cache.set(timeMs, value);
  return value;
}

const events = [];
const scanStart = Date.UTC(2025, 11, 30);
const scanEnd = Date.UTC(2031, 0, 2);
const relations = [
  { type: "वैधृति महापात", key: "vaidhritiClearance", residualKey: "declinationDifference" },
  { type: "व्यतीपात महापात", key: "vyatipataClearance", residualKey: "declinationSum" }
];

for (const relation of relations) {
  const roots = scanBracketedRoots(
    time => positions(time)[relation.key],
    scanStart,
    scanEnd,
    HOUR_MS,
    { timeTolerance: 250, valueTolerance: 1e-11, maxIterations: 80 }
  );
  for (let i = 0; i + 1 < roots.length; i++) {
    const a = roots[i];
    const b = roots[i + 1];
    if (!(b > a)) continue;
    const mid = (a + b) / 2;
    const sample = positions(mid);
    if (sample[relation.key] >= 0) continue;
    const before = positions(mid - HOUR_MS);
    const after = positions(mid + HOUR_MS);
    const sunDeclinationRate = (after.sunDeclination - before.sunDeclination) / 2;
    const moonDeclinationRate = (after.moonDeclination - before.moonDeclination) / 2;
    const year = new Date(mid).getUTCFullYear();
    if (!YEARS.includes(year)) continue;
    events.push({
      year,
      type: relation.type,
      startTime: new Date(a).toISOString(),
      endTime: new Date(b).toISOString(),
      startTimeIST: toIST(a),
      endTimeIST: toIST(b),
      midpoint: new Date(mid).toISOString(),
      midpointSunDeclinationDegrees: Number(sample.sunDeclination.toFixed(8)),
      midpointMoonDeclinationDegrees: Number(sample.moonDeclination.toFixed(8)),
      midpointSunDeclinationRateDegreesPerHour: Number(sunDeclinationRate.toFixed(8)),
      midpointMoonDeclinationRateDegreesPerHour: Number(moonDeclinationRate.toFixed(8)),
      midpointSunLongitudeDegrees: Number(sample.sunLongitude.toFixed(6)),
      midpointMoonLongitudeDegrees: Number(sample.moonLongitude.toFixed(6)),
      midpointLongitudeSumDegrees: Number(sample.longitudeSum.toFixed(6)),
      midpointRelationResidualDegrees: Number(sample[relation.residualKey].toFixed(8)),
      midpointContactClearanceDegrees: Number(sample[relation.key].toFixed(8)),
      apparentSemidiameterSumDegrees: Number(sample.semidiameterSum.toFixed(8)),
      status: "research-only-not-approved",
      model: "geocentric-apparent-declination-disk-band-overlap",
      note: "Compare against Karana-Kutuhala shara-khanda method and Drik timings before approval."
    });
  }
}

events.sort((a, b) => a.startTime.localeCompare(b.startTime));
console.log(JSON.stringify({
  status: "research-only-not-approved",
  years: YEARS,
  engine: "astronomy-engine@2.1.19",
  model: "geocentric apparent Sun/Moon declination-band overlap; same-ayana and opposite-ayana roots separated",
  sampleStepHours: 1,
  eventCount: events.length,
  events
}, null, 2));
