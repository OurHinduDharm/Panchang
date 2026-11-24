#!/usr/bin/env node
/**
 * Research-only Mahapata calculation model.
 *
 * 1. Find mean pata when the tropical longitude sum crosses 180° (Vyatipata)
 *    or 360°/0° (Vaidhriti).
 * 2. Search three days either side for true equal-declination instants:
 *    same side of equator for Vyatipata, opposite sides for Vaidhriti.
 * 3. Find sparsha/moksha directly from apparent declination-band contacts
 *    of the Sun and Moon discs.
 * 4. Keep the Surya Siddhanta XI.14-15 duration as a separate classical
 *    comparison; it never controls the primary Drik-style result.
 *
 * Research-only Drik-style geocentric apparent-position model.
 * This is not a reconstruction of the Karana-Kutuhala tables.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { scanBracketedRoots, scanSmoothRoots } from "../mahapata-root-solver.mjs";
import { suryaSiddhantaWindow } from "../research/paatadhikar/surya-siddhanta-xi.mjs";
import { contactModel, contactBoundaryDegrees } from "../research/paatadhikar/contact-boundary.mjs";
import { classifyMahapataGeometry } from "../research/paatadhikar/mahapata-math.mjs";

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
const yearArgument = process.argv.find(value => value.startsWith("--years="));
const YEARS = yearArgument
  ? yearArgument.slice("--years=".length).split(",").map(Number)
  : [2026, 2027, 2028, 2029, 2030];
if (!YEARS.length || YEARS.some(year => !Number.isInteger(year) || year < 1 || year > 9998)) {
  throw new RangeError("--years must be a comma-separated list of valid years");
}
const auditStepArgument = process.argv.find(value => value.startsWith("--audit-step-minutes="));
const auditStepMinutes = auditStepArgument ? Number(auditStepArgument.split("=")[1]) : 60;
if (![15, 30, 60].includes(auditStepMinutes)) {
  throw new RangeError("--audit-step-minutes must be 15, 30, or 60");
}
const contactArgument = process.argv.find(value => value.startsWith("--contact-model="));
const selectedContactModel = contactModel(contactArgument?.split("=")[1]);
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
function dailyLongitudeMotion(timeMs, longitudeKey) {
  const halfSpanMs = 30 * MINUTE_MS;
  const before = positions(timeMs - halfSpanMs)[longitudeKey];
  const after = positions(timeMs + halfSpanMs)[longitudeKey];
  return circularDifference(after, before) / ((2 * halfSpanMs) / DAY_MS);
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
  const contactBoundary = contactBoundaryDegrees(selectedContactModel.id, semidiameterSum);
  const longitudeSum = (vectorLongitude(sunEcliptic) + vectorLongitude(moonEcliptic)) % 360;
  const declinationDifference = moonDeclination - sunDeclination;
  const declinationSum = moonDeclination + sunDeclination;
  const value = {
    sunLongitude: vectorLongitude(sunEcliptic),
    moonLongitude: vectorLongitude(moonEcliptic),
    sunDeclination,
    moonDeclination,
    declinationDifference,
    declinationSum,
    longitudeSum,
    semidiameterSum,
    contactBoundary,
    vyatipataRelation: declinationDifference,
    vaidhritiRelation: declinationSum,
    vyatipataClearance: Math.abs(declinationDifference) - contactBoundary,
    vaidhritiClearance: Math.abs(declinationSum) - contactBoundary
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

const smoothOptions = { timeTolerance: 250, valueTolerance: 1e-10 };
function smoothRoots(fn, start, end, step) {
  return scanSmoothRoots(fn, start, end, step, smoothOptions);
}

function januaryFirst(year) {
  const date = new Date(0);
  date.setUTCFullYear(year, 0, 1);
  return date.getTime();
}
// An IST New Year contact, its true middle and its longitude seed may all
// fall on different dates. Pad both the middle and contact search horizons.
const scanStart = januaryFirst(Math.min(...YEARS)) - 7 * DAY_MS;
const scanEnd = januaryFirst(Math.max(...YEARS) + 1) + 7 * DAY_MS;
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
    meanPatas.push({
      time,
      year,
      type: target === 180 ? "व्यतीपात महापात" : "वैधृति महापात",
      relationKey: target === 180 ? "vyatipataRelation" : "vaidhritiRelation",
      clearanceKey: target === 180 ? "vyatipataClearance" : "vaidhritiClearance",
      eventClassKey: target === 180 ? "Vyatipata" : "Vaidhriti"
    });
  }
}
meanPatas.sort((a, b) => a.time - b.time);

const events = [];
const reviewItems = [];
for (const mean of meanPatas) {
  const searchStart = mean.time - 3 * DAY_MS;
  const searchEnd = mean.time + 3 * DAY_MS;
  const equality = smoothRoots(
    time => positions(time)[mean.relationKey],
    searchStart,
    searchEnd,
    HOUR_MS
  );
  const classifiedRoots = equality.crossings.map(time => {
    const position = positions(time);
    const geometry = classifyMahapataGeometry({
      sunLongitudeDeg: position.sunLongitude,
      moonLongitudeDeg: position.moonLongitude,
      sunDeclinationDeg: position.sunDeclination,
      moonDeclinationDeg: position.moonDeclination
    });
    return { time, eventClass: geometry.eventClass };
  });
  const trueRoots = classifiedRoots
    .filter(root => root.eventClass === mean.eventClassKey)
    .map(root => root.time);
  const grazing = equality.grazing.filter(time => {
    const p = positions(time);
    return classifyMahapataGeometry({
      sunLongitudeDeg: p.sunLongitude, moonLongitudeDeg: p.moonLongitude,
      sunDeclinationDeg: p.sunDeclination, moonDeclinationDeg: p.moonDeclination
    }).eventClass === mean.eventClassKey;
  });
  if (!trueRoots.length || grazing.length) {
    const reviewYear = new Date(mean.time + IST_OFFSET_MS).getUTCFullYear();
    if (YEARS.includes(reviewYear)) reviewItems.push({
      meanPataYear: mean.year, type: mean.type,
      meanPata: new Date(mean.time).toISOString(), meanPataIST: toIST(mean.time),
      equalDeclinationCrossings: classifiedRoots.map(root => ({
        timeIST: toIST(root.time), eventClass: root.eventClass
      })),
      grazingCandidatesIST: grazing.map(toIST),
      status: grazing.length ? "grazing-equality-needs-review" :
        "no-class-compatible-true-crossing-within-three-day-search"
    });
    continue;
  }

  // Multiple class-compatible middles can belong to one continuous overlap
  // or to distinct intervals. Solve both contacts for every middle first.
  const windows = [];
  for (const middle of trueRoots.sort((a, b) => Math.abs(a - mean.time) - Math.abs(b - mean.time))) {
    const event = buildContactEvent(mean, middle, classifiedRoots);
    if (!YEARS.includes(event.year)) continue;
    if (!event.startTime || !event.endTime) {
      reviewItems.push(event);
      continue;
    }
    const same = windows.find(prior =>
      Math.abs(Date.parse(prior.startTime) - Date.parse(event.startTime)) < 1000 &&
      Math.abs(Date.parse(prior.endTime) - Date.parse(event.endTime)) < 1000);
    if (same) same.otherTrueCrossings.push(event.truePataIST);
    else windows.push(event);
  }
  events.push(...windows);
}

function buildContactEvent(mean, chosen, classifiedRoots) {
  const sample = positions(chosen);
  const sunMotionDegPerDay = dailyLongitudeMotion(chosen, "sunLongitude");
  const moonMotionDegPerDay = dailyLongitudeMotion(chosen, "moonLongitude");
  const sunDistance = vectorLength(GeoVector(Body.Sun, new Date(chosen), true));
  const moonDistance = vectorLength(GeoVector(Body.Moon, new Date(chosen), true));
  const suryaSiddhantaInterval = suryaSiddhantaWindow({
    middleUtcMs: chosen,
    sunSemidiameterDeg: Math.asin(SUN_RADIUS_AU / sunDistance) * 180 / Math.PI,
    moonSemidiameterDeg: Math.asin(MOON_RADIUS_AU / moonDistance) * 180 / Math.PI,
    sunMotionDegPerDay,
    moonMotionDegPerDay
  });
  // Use two smooth signed limbs. An absolute-value cusp at equality can
  // hide two contacts in one sample. A tangent inside an overlap is not an exit.
  const contactRoots = [-1, 1].flatMap(side => smoothRoots(time => {
    const p = positions(time);
    return p[mean.relationKey] - side * p.contactBoundary;
  }, chosen - 3 * DAY_MS, chosen + 3 * DAY_MS, 15 * MINUTE_MS).crossings)
    .sort((a, b) => a - b);
  const before = contactRoots.filter(time => time < chosen).at(-1);
  const after = contactRoots.find(time => time > chosen);
  const overlapExists = sample[mean.clearanceKey] < 0 && before !== undefined && after !== undefined;

  const comparatorYear = overlapExists ? new Date(before + IST_OFFSET_MS).getUTCFullYear() : new Date(chosen + IST_OFFSET_MS).getUTCFullYear();
  const displayYear = comparatorYear;
  const suryaSiddhantaYear = new Date(suryaSiddhantaInterval.startUtcMs + IST_OFFSET_MS).getUTCFullYear();
  return {
    year: displayYear,
    suryaSiddhantaComparisonYear: suryaSiddhantaYear,
    meanPataYear: mean.year,
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
    contactModel: selectedContactModel,
    contactBoundaryDegrees: sample.contactBoundary,
    suryaSiddhantaComparison: {
      startTime: new Date(suryaSiddhantaInterval.startUtcMs).toISOString(),
      endTime: new Date(suryaSiddhantaInterval.endUtcMs).toISOString(),
      startTimeIST: toIST(suryaSiddhantaInterval.startUtcMs),
      endTimeIST: toIST(suryaSiddhantaInterval.endUtcMs),
      halfDurationNadi: Number(suryaSiddhantaInterval.halfDurationNadi.toFixed(8)),
      sunMotionDegPerDay: Number(sunMotionDegPerDay.toFixed(8)),
      moonMotionDegPerDay: Number(moonMotionDegPerDay.toFixed(8)),
      relativeMotionDegPerDay: Number(suryaSiddhantaInterval.relativeMotionDegPerDay.toFixed(8)),
      method: suryaSiddhantaInterval.method,
      status: "research-only-not-approved"
    },
    otherTrueCrossings: [],
    rejectedEqualDeclinationCrossings: classifiedRoots
      .filter(root => root.eventClass !== mean.eventClassKey)
      .map(root => ({ timeIST: toIST(root.time), eventClass: root.eventClass })),
    status: overlapExists ? "research-only-not-approved" : "overlap-boundary-not-found",
    model: selectedContactModel.id === "apparent-disks"
      ? "drik-style-geocentric-apparent-declination-band-overlap"
      : "drik-style-geocentric-fixed-30-arcmin-declination-boundary",
    note: "Primary event window uses the explicitly selected contact definition; Surya Siddhanta XI.14-15 is stored only as a separate comparison."
  };
}

events.sort((a, b) => a.startTime.localeCompare(b.startTime));

// Independent discovery audit: do not limit equality searches to longitude seeds.
// This reports completeness of sampled sign changes, not unsampled tangencies.
let discoveryAudit;
if (process.argv.includes("--audit")) {
  const allRoots = [];
  const grazingCandidates = [];
  for (const [relationKey, eventClass, type] of [
    ["vyatipataRelation", "Vyatipata", "व्यतीपात महापात"],
    ["vaidhritiRelation", "Vaidhriti", "वैधृति महापात"]
  ]) {
    const scan = smoothRoots(t => positions(t)[relationKey], scanStart, scanEnd, auditStepMinutes * MINUTE_MS);
    for (const time of scan.grazing) {
      if (YEARS.includes(new Date(time + IST_OFFSET_MS).getUTCFullYear())) {
        grazingCandidates.push({ relation: relationKey, timeIST: toIST(time) });
      }
    }
    for (const time of scan.crossings) {
      const p = positions(time);
      const geometry = classifyMahapataGeometry({
        sunLongitudeDeg: p.sunLongitude, moonLongitudeDeg: p.moonLongitude,
        sunDeclinationDeg: p.sunDeclination, moonDeclinationDeg: p.moonDeclination
      });
      if (geometry.eventClass !== eventClass ||
          !YEARS.includes(new Date(time + IST_OFFSET_MS).getUTCFullYear())) continue;
      const represented = events.some(event => event.type === type &&
        Date.parse(event.startTime) < time && time < Date.parse(event.endTime) &&
        [event.truePata, ...event.otherTrueCrossings].some(t => Math.abs(Date.parse(t) - time) < 1000));
      const nearestSeed = meanPatas.filter(mean => mean.type === type)
        .sort((a, b) => Math.abs(a.time - time) - Math.abs(b.time - time))[0];
      allRoots.push({ type, truePataIST: toIST(time), represented,
        nearestSeedIST: nearestSeed ? toIST(nearestSeed.time) : null,
        seedDistanceDays: nearestSeed ? Math.abs(nearestSeed.time - time) / DAY_MS : null });
    }
  }
  const duplicateIntervals = events.filter((event, index) => events.slice(0, index).some(previous =>
    previous.type === event.type &&
    Math.abs(Date.parse(previous.startTime) - Date.parse(event.startTime)) < 1000 &&
    Math.abs(Date.parse(previous.endTime) - Date.parse(event.endTime)) < 1000));
  discoveryAudit = {
    method: "seed-independent-extremum-refined-signed-declination-scan",
    sampleStepHours: auditStepMinutes / 60,
    limitations: "Resolved turning points split brackets. Multiple unresolved extrema inside a sampling cell remain possible. Near-zero stationary points require review.",
    grazingCandidates,
    rootCount: allRoots.length,
    unrepresentedRoots: allRoots.filter(root => !root.represented),
    duplicateIntervals: duplicateIntervals.map(event => ({ type: event.type, startTimeIST: event.startTimeIST })),
    longIntervals: events.filter(event => Date.parse(event.endTime) - Date.parse(event.startTime) > DAY_MS)
      .map(event => ({ type: event.type, startTimeIST: event.startTimeIST, endTimeIST: event.endTimeIST })),
    roots: allRoots
  };
}

console.log(JSON.stringify({
  status: "research-only-not-approved",
  years: YEARS,
  engine: "astronomy-engine@2.1.19",
  contactModel: selectedContactModel,
  model: "Drik-style apparent geocentric positions: mean-pata seed -> true declination-equality middle -> nonlinear contacts using the declared contactModel; Surya Siddhanta XI.14-15 retained only as a separate comparison",
  searchDaysAroundMeanPata: 3,
  sampleStepHours: 1,
  meanPataCount: meanPatas.length,
  eventCount: events.length,
  reviewItemCount: reviewItems.length,
  events,
  reviewItems,
  ...(discoveryAudit ? { discoveryAudit } : {})
}, null, 2));
