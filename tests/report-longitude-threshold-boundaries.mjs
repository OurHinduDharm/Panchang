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
function boundaryResult(event, boundary, timestamp) {
  const date = new Date(timestamp);
  const retrograde = isRetrograde(event.planet, date);
  const rule = rules[event.planet];
  const threshold = retrograde ? rule.retrograde : rule.direct;
  const angle = apparentGeocentricLongitudeGap(event.planet, date);
  return {
    planet: event.planet,
    window: event.id,
    boundary,
    timestamp,
    retrograde,
    observedLongitudeGapDegrees: Number(angle.toFixed(6)),
    publishedThresholdDegrees: threshold,
    signedAngleResidualDegrees: Number((angle - threshold).toFixed(6))
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
    retrogradeBoundaries: group.filter(row => row.retrograde).length
  };
}
console.log(JSON.stringify({
  title: "TRAC 2027 fixed sidereal longitude-threshold boundary diagnostic",
  warning: "Diagnostic only. This tests the stated angle rules against TRAC's own published event boundaries using Astronomy Engine 2.1.19. It is not a Drik comparison, not a physical heliacal model, and not a production acceptance result.",
  coordinateMethod: "Apparent geocentric true ecliptic-of-date longitudes; SunPosition and GeoVector+Ecliptic, with light-time and aberration for planets.",
  retrogradeMethod: "Signed geocentric ecliptic longitude derivative over a centered 12-hour interval.",
  summary,
  boundaries: rows
}, null, 2));
