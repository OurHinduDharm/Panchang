#!/usr/bin/env node
/**
 * Research-only Mahapata ephemeris comparison.
 *
 * Uses geocentric apparent equatorial-of-date vectors. The contact interval
 * is the interval in which the declination bands of the apparent solar and
 * lunar disks overlap. This is a numerical comparison model, not yet the
 * approved Karana-Kutuhala shara-khanda implementation.
 */
import {
  Body,
  GeoVector,
  Rotation_EQJ_EQD,
  Rotation_EQJ_ECT,
  RotateVector
} from "astronomy-engine";
import { scanBracketedRoots } from "../mahapata-root-solver.mjs";

const AU_KM = 149597870.7;
const SUN_RADIUS_AU = 695700 / AU_KM;
const MOON_RADIUS_AU = 1737.4 / AU_KM;
const HOUR_MS = 3600000;
const DAY_MS = 86400000;
const YEARS = [2026, 2027, 2028, 2029, 2030];
const cache = new Map();

function normDegrees(value) {
  return ((value % 360) + 360) % 360;
}
function vectorLength(v) {
  return Math.hypot(v.x, v.y, v.z);
}
function vectorDeclination(v) {
  return Math.atan2(v.z, Math.hypot(v.x, v.y)) * 180 / Math.PI;
}
function vectorLongitude(v) {
  return normDegrees(Math.atan2(v.y, v.x) * 180 / Math.PI);
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
  const sunEcl = RotateVector(eclipticRotation, sun);
  const moonEcl = RotateVector(eclipticRotation, moon);
  const sunDistance = vectorLength(sun);
  const moonDistance = vectorLength(moon);
  const sunDec = vectorDeclination(sunEqd);
  const moonDec = vectorDeclination(moonEqd);
  const sunRadius = Math.asin(SUN_RADIUS_AU / sunDistance) * 180 / Math.PI;
  const moonRadius = Math.asin(MOON_RADIUS_AU / moonDistance) * 180 / Math.PI;
  const value = {
    sunDec,
    moonDec,
    declinationDifference: moonDec - sunDec,
    contactClearance: Math.abs(moonDec - sunDec) - sunRadius - moonRadius,
    sunLongitude: vectorLongitude(sunEcl),
    moonLongitude: vectorLongitude(moonEcl),
    sunRadius,
    moonRadius
  };
  cache.set(timeMs, value);
  return value;
}

function classifyAt(timeMs) {
  const p = positions(timeMs);
  const sum = normDegrees(p.sunLongitude + p.moonLongitude);
  const distanceToZero = Math.min(sum, 360 - sum);
  const distanceTo180 = Math.abs(sum - 180);
  const type = distanceToZero < distanceTo180 ? "वैधृति महापात" : "व्यतीपात महापात";
  return { type, longitudeSum: Number(sum.toFixed(6)), ...p };
}

const events = [];
for (const year of YEARS) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const roots = scanBracketedRoots(
    time => positions(time).contactClearance,
    start,
    end,
    HOUR_MS,
    { timeTolerance: 250, valueTolerance: 1e-11, maxIterations: 80 }
  );
  for (let i = 0; i + 1 < roots.length; i++) {
    const a = roots[i];
    const b = roots[i + 1];
    if (!(b > a)) continue;
    const mid = (a + b) / 2;
    if (positions(mid).contactClearance >= 0) continue;
    const classification = classifyAt(mid);
    events.push({
      year,
      type: classification.type,
      startTime: new Date(a).toISOString(),
      endTime: new Date(b).toISOString(),
      midpoint: new Date(mid).toISOString(),
      longitudeSum: classification.longitudeSum,
      midpointDeclinationDifferenceDegrees: Number(classification.declinationDifference.toFixed(8)),
      midpointContactClearanceDegrees: Number(classification.contactClearance.toFixed(8)),
      status: "research-only-not-approved",
      model: "geocentric-apparent-declination-disk-band-overlap",
      note: "Compare against Karana-Kutuhala shara-khanda method and Drik timings before approval."
    });
  }
}

console.log(JSON.stringify({
  status: "research-only-not-approved",
  years: YEARS,
  engine: "astronomy-engine@2.1.19",
  model: "geocentric apparent Sun/Moon declination-band overlap",
  sampleStepHours: 1,
  eventCount: events.length,
  events
}, null, 2));
