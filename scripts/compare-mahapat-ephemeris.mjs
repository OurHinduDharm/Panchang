#!/usr/bin/env node
/**
 * Research-only Mahapata calculation model.
 *
 * 1. Find mean pata when the tropical longitude sum crosses 180° (Vyatipata)
 *    or 360°/0° (Vaidhriti).
 * 2. Search three days either side for true equal-declination instants:
 *    same side of equator for Vyatipata, opposite sides for Vaidhriti.
 * 3. Around the selected true pata, find the interval in which the apparent
 *    declination bands of the Sun and Moon disks overlap.
 *
 * This modern geocentric model is for comparison only. It is not the final
 * Karana-Kutuhala shara-khanda implementation.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { scanBracketedRoots } from "../mahapata-root-solver.mjs";

const require = createRequire(import.meta.url);
const astronomyEntry = require.resolve("astronomy-engine");
const Astronomy = require(path.join(path.dirname(astronomyEntry), "astronomy.min.js"));
const { Body, GeoVector, Rotation_EQJ_EQD, Rotation_EQJ_ECT, RotateVector } = Astronomy;

const AU_KM = 149597870.7;
const SUN_RADIUS_AU = 695700 / AU_KM;
const MOON_RADIUS_AU = 1737.4 / AU_KM;
const HOUR_MS = 3600000;
const MINUTE_MS = 60000;
const IST_OFFSET_MS = 330 * MINUTE_MS;
const DAY_MS = 86400000;
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
function circularDifference(value, target) {
  return ((value - target + 540) % 360) - 180;
}
function angularDistance(value, target) {
  return Math.abs(circularDifference(value, target));
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
  const sunDeclination = vectorDeclination(sunEqd);
  const moonDeclination = vectorDeclination(moonEqd);
  const sunRadius = Math.asin(SUN_RADIUS_AU / sunDistance) * 180 / Math.PI;
  const moonRadius = Math.asin(MOON_RADIUS_AU / moonDistance) * 180 / Math.PI;
  const semidiameterSum = sunRadius + moonRadius;
  const longitudeSum = (vectorLongitude(sunEcliptic) + vectorLongitude(moonEcliptic)) % 360;
  const declinationDifference = moonDeclination - sunDeclination;
  const declinationSum = moonDeclination + sunDeclination;
  const value = {
    sunDeclination,
    moonDeclination,
    declinationDifference,
    declinationSum,
    longitudeSum,
    semidiameterSum,
    vyatipataRelation: declinationDifference,
    vaidhritiRelation: declinationSum,
    vyatipataClearance: Math.abs(declinationDifference) - semidiameterSum,
    vaidhritiClearance: Math.abs(declinationSum) - semidiameterSum
  };
  cache.set(timeMs, value);
  return value;
}

function rootsFor(fn, start, end, step) {
  return scanBracketedRoots(fn, start, end, step, {
    timeTolerance: 250,
    valueTolerance: 1e-11,
    maxIterations: 80,
    dedupTolerance: 1000
  });
}

const scanStart = Date.UTC(2025, 11, 30);
const scanEnd = Date.UTC(2031, 0, 2);
const meanPatas = [];
for (const target of [180, 0]) {
  const roots = rootsFor(
    time => circularDifference(positions(time).longitudeSum, target),
    scanStart,
    scanEnd,
    HOUR_MS
  );
  for (const time of roots) {
    if (angularDistance(positions(time).longitudeSum, target) > 0.02) continue;
    const year = new Date(time).getUTCFullYear();
    if (!YEARS.includes(year)) continue;
    meanPatas.push({
      time,
      year,
      type: target === 180 ? "व्यतीपात महापात" : "वैधृति महापात",
      relationKey: target === 180 ? "vyatipataRelation" : "vaidhritiRelation",
      clearanceKey: target === 180 ? "vyatipataClearance" : "vaidhritiClearance"
    });
  }
}
meanPatas.sort((a, b) => a.time - b.time);

const events = [];
for (const mean of meanPatas) {
  const searchStart = mean.time - 3 * DAY_MS;
  const searchEnd = mean.time + 3 * DAY_MS;
  const trueRoots = rootsFor(
    time => positions(time)[mean.relationKey],
    searchStart,
    searchEnd,
    HOUR_MS
  );
  if (!trueRoots.length) {
    events.push({
      year: mean.year,
      type: mean.type,
      meanPata: new Date(mean.time).toISOString(),
      meanPataIST: toIST(mean.time),
      status: "no-true-crossing-within-three-day-search",
      statusDetail: "research-only-not-approved"
    });
    continue;
  }

  const chosen = trueRoots.slice().sort((a, b) => Math.abs(a - mean.time) - Math.abs(b - mean.time))[0];
  const sample = positions(chosen);
  const contactRoots = rootsFor(
    time => positions(time)[mean.clearanceKey],
    chosen - DAY_MS,
    chosen + DAY_MS,
    15 * MINUTE_MS
  );
  const before = contactRoots.filter(time => time < chosen).at(-1);
  const after = contactRoots.find(time => time > chosen);
  const overlapExists = sample[mean.clearanceKey] < 0 && before !== undefined && after !== undefined;

  events.push({
    year: mean.year,
    type: mean.type,
    meanPata: new Date(mean.time).toISOString(),
    meanPataIST: toIST(mean.time),
    truePata: new Date(chosen).toISOString(),
    truePataIST: toIST(chosen),
    startTime: overlapExists ? new Date(before).toISOString() : null,
    endTime: overlapExists ? new Date(after).toISOString() : null,
    startTimeIST: overlapExists ? toIST(before) : null,
    endTimeIST: overlapExists ? toIST(after) : null,
    sunDeclinationAtTruePata: Number(sample.sunDeclination.toFixed(8)),
    moonDeclinationAtTruePata: Number(sample.moonDeclination.toFixed(8)),
    declinationResidualDegrees: Number(sample[mean.relationKey].toFixed(10)),
    semidiameterSumDegrees: Number(sample.semidiameterSum.toFixed(8)),
    otherTrueCrossings: trueRoots.filter(time => time !== chosen).map(time => toIST(time)),
    status: overlapExists ? "research-only-not-approved" : "overlap-boundary-not-found",
    model: "geocentric-apparent-declination-disk-band-overlap",
    note: "Compare against Karana-Kutuhala shara-khanda method and Drik timings before approval."
  });
}

events.sort((a, b) => a.meanPata.localeCompare(b.meanPata));
console.log(JSON.stringify({
  status: "research-only-not-approved",
  years: YEARS,
  engine: "astronomy-engine@2.1.19",
  model: "mean tropical longitude-sum pata -> nearest true declination equality -> apparent disk overlap",
  searchDaysAroundMeanPata: 3,
  sampleStepHours: 1,
  meanPataCount: meanPatas.length,
  eventCount: events.length,
  events
}, null, 2));
