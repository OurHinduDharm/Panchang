import { readFile } from "node:fs/promises";
import { Ecliptic, GeoVector, SunPosition } from "astronomy-engine";

const dataset = JSON.parse(await readFile(new URL("../data/asta-udaya-benchmark.json", import.meta.url), "utf8"));
const sourceId = "trac-new-delhi-combustion-2027";
const events = dataset.eventWindows[sourceId];
if (!Array.isArray(events) || events.length !== 10) throw new Error("Expected 10 TRAC 2027 intervals");

const rules = {
  Mercury: { direct: 14, retrograde: 12 },
  Venus: { direct: 10, retrograde: 8 },
  Jupiter: { direct: 11, retrograde: 11 },
  Saturn: { direct: 15, retrograde: 15 }
};
const HOUR_MS = 3600000;

function wrap360(value) {
  return ((value % 360) + 360) % 360;
}
function wrap180(value) {
  const angle = wrap360(value);
  return angle > 180 ? angle - 360 : angle;
}
function longitude(body, date) {
  return wrap360(Ecliptic(GeoVector(body, date, true)).elon);
}
function isRetrograde(body, date) {
  const before = longitude(body, new Date(date.getTime() - 6 * HOUR_MS));
  const after = longitude(body, new Date(date.getTime() + 6 * HOUR_MS));
  return wrap180(after - before) < 0;
}
function apparentGeocentricLongitudeGap(body, date) {
  const planet = longitude(body, date);
  const sun = wrap360(SunPosition(date).elon);
  return Math.abs(wrap180(planet - sun));
}
function findThresholdCrossing(body, timestamp, threshold, boundary) {
  const target = new Date(timestamp).getTime();
  const step = 15 * 60 * 1000;
  const radius = 12 * HOUR_MS;
  const fn = time => apparentGeocentricLongitudeGap(body, new Date(time)) - threshold;
  let low = target - radius;
  let lowValue = fn(low);
  let bracket = null;
  for (let high = low + step; high <= target + radius; high += step) {
    const highValue = fn(high);
    const correctDirection = boundary === "start"
      ? lowValue >= 0 && highValue <= 0
      : lowValue <= 0 && highValue >= 0;
    if (correctDirection) {
      bracket = [low, high];
      break;
    }
    low = high;
    lowValue = highValue;
  }
  if (!bracket) return null;
  let [left, right] = bracket;
  let leftValue = fn(left);
  for (let i = 0; i < 50 && right - left > 250; i++) {
    const middle = (left + right) / 2;
    const middleValue = fn(middle);
    if ((boundary === "start" && middleValue > 0) ||
        (boundary === "end" && middleValue < 0)) {
      left = middle;
      leftValue = middleValue;
    } else {
      right = middle;
    }
  }
  return (left + right) / 2;
}
function formatIST(time) {
  return new Date(time + 330 * 60000).toISOString().replace("Z", "+05:30");
}
function boundaryResult(event, boundary, timestamp) {
  const date = new Date(timestamp);
  const retrograde = isRetrograde(event.planet, date);
  const rule = rules[event.planet];
  const threshold = retrograde ? rule.retrograde : rule.direct;
  const angle = apparentGeocentricLongitudeGap(event.planet, date);
  const crossing = findThresholdCrossing(event.planet, timestamp, threshold, boundary);
  return {
    planet: event.planet,
    window: event.id,
    boundary,
    timestamp,
    retrograde,
    observedLongitudeGapDegrees: Number(angle.toFixed(6)),
    publishedThresholdDegrees: threshold,
    signedAngleResidualDegrees: Number((angle - threshold).toFixed(6)),
    calculatedBoundaryIST: crossing === null ? null : formatIST(crossing),
    signedTimeDifferenceMinutes: crossing === null ? null : Number(((crossing - date.getTime()) / 60000).toFixed(3))
  };
}

const rows = [];
for (const event of events) {
  rows.push(boundaryResult(event, "start", event.start));
  rows.push(boundaryResult(event, "end", event.end));
}
const summary = {};
for (const planet of Object.keys(rules)) {
  const group = rows.filter(row => row.planet === planet);
  summary[planet] = {
    boundaries: group.length,
    meanAbsoluteAngleResidualDegrees: Number((group.reduce((sum, row) => sum + Math.abs(row.signedAngleResidualDegrees), 0) / group.length).toFixed(6)),
    maxAbsoluteAngleResidualDegrees: Number(Math.max(...group.map(row => Math.abs(row.signedAngleResidualDegrees))).toFixed(6)),
    meanAbsoluteTimeDifferenceMinutes: Number((group.reduce((sum, row) => sum + (row.signedTimeDifferenceMinutes === null ? 0 : Math.abs(row.signedTimeDifferenceMinutes)), 0) / group.filter(row => row.signedTimeDifferenceMinutes !== null).length).toFixed(3)),
    maxAbsoluteTimeDifferenceMinutes: Number(Math.max(...group.map(row => Math.abs(row.signedTimeDifferenceMinutes ?? 0))).toFixed(3)),
    missingCrossings: group.filter(row => row.signedTimeDifferenceMinutes === null).length,
    retrogradeBoundaries: group.filter(row => row.retrograde).length
  };
}
console.log(JSON.stringify({
  title: "TRAC 2027 fixed sidereal longitude-threshold boundary diagnostic",
  warning: "Diagnostic only. This tests the stated angle rules against TRAC's own published event boundaries using Astronomy Engine 2.1.19. It is not a Drik comparison, not a physical heliacal model, and not a production acceptance result.",
  coordinateMethod: "Apparent geocentric true ecliptic-of-date longitudes; SunPosition and GeoVector+Ecliptic, with light-time and aberration for planets.",
  retrogradeMethod: "Signed geocentric ecliptic longitude derivative over a centered 12-hour interval.",
  rootMethod: "15-minute bracketing scan within ±12 hours of each published boundary, then bisection to sub-second interval using the published direct/retrograde threshold at the boundary.",
  summary,
  boundaries: rows
}, null, 2));
