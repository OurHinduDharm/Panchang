import { readFile } from "node:fs/promises";
import { Ecliptic, Equator, GeoVector, Observer, SunPosition } from "astronomy-engine";

const dataset = JSON.parse(await readFile(new URL("../data/asta-udaya-benchmark.json", import.meta.url), "utf8"));
const observer = new Observer(28.6139, 77.2090, 216);
const thresholds = {
  Mercury: { direct: 14, retrograde: 12 },
  Venus: { direct: 10, retrograde: 8 },
  Jupiter: { direct: 11, retrograde: 11 },
  Saturn: { direct: 15, retrograde: 15 }
};
const sources = [
  ["Mercury", "drik-new-delhi-mercury-2027"],
  ["Venus", "drik-new-delhi-venus-2027"],
  ["Jupiter", "drik-new-delhi-jupiter-2027"],
  ["Saturn", "drik-new-delhi-saturn-2027"]
];
const HOUR_MS = 3600000;

function wrap360(value) {
  return ((value % 360) + 360) % 360;
}
function wrap180(value) {
  const angle = wrap360(value);
  return angle > 180 ? angle - 360 : angle;
}
function vectorFromEquatorial(point) {
  const ra = point.ra * Math.PI / 12;
  const dec = point.dec * Math.PI / 180;
  return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
}
function topocentricSeparation(body, date) {
  const planet = vectorFromEquatorial(Equator(body, date, observer, true, true));
  const sun = vectorFromEquatorial(Equator("Sun", date, observer, true, true));
  const dot = Math.max(-1, Math.min(1, planet[0] * sun[0] + planet[1] * sun[1] + planet[2] * sun[2]));
  return Math.acos(dot) * 180 / Math.PI;
}
function geocentricLongitude(body, date) {
  return wrap360(Ecliptic(GeoVector(body, date, true)).elon);
}
function isRetrograde(body, date) {
  const before = geocentricLongitude(body, new Date(date.getTime() - 6 * HOUR_MS));
  const after = geocentricLongitude(body, new Date(date.getTime() + 6 * HOUR_MS));
  return wrap180(after - before) < 0;
}
function geocentricLongitudeGap(body, date) {
  const planet = geocentricLongitude(body, date);
  const sun = wrap360(SunPosition(date).elon);
  return Math.abs(wrap180(planet - sun));
}
const rows = [];
for (const [planet, sourceId] of sources) {
  const events = dataset.eventWindows[sourceId] || [];
  for (const event of events) {
    for (const boundary of ["start", "end"]) {
      const timestamp = event[boundary]?.normalizedLocal;
      if (!timestamp) continue;
      const date = new Date(timestamp);
      const retrograde = isRetrograde(planet, date);
      const threshold = retrograde ? thresholds[planet].retrograde : thresholds[planet].direct;
      const longitudeGap = geocentricLongitudeGap(planet, date);
      const topoGap = topocentricSeparation(planet, date);
      rows.push({
        planet, sourceId, window: event.sequence, boundary, timestamp, retrograde, thresholdDegrees: threshold,
        geocentricLongitudeGapDegrees: Number(longitudeGap.toFixed(6)),
        geocentricThresholdResidualDegrees: Number((longitudeGap - threshold).toFixed(6)),
        topocentric3dSeparationDegrees: Number(topoGap.toFixed(6)),
        topocentricThresholdResidualDegrees: Number((topoGap - threshold).toFixed(6))
      });
    }
  }
}
const summary = {};
for (const planet of Object.keys(thresholds)) {
  const group = rows.filter(row => row.planet === planet);
  if (!group.length) continue;
  summary[planet] = {
    boundaries: group.length,
    meanAbsGeocentricLongitudeResidualDegrees: Number((group.reduce((sum,row)=>sum+Math.abs(row.geocentricThresholdResidualDegrees),0)/group.length).toFixed(6)),
    maxAbsGeocentricLongitudeResidualDegrees: Number(Math.max(...group.map(row=>Math.abs(row.geocentricThresholdResidualDegrees))).toFixed(6)),
    meanAbsTopocentric3dResidualDegrees: Number((group.reduce((sum,row)=>sum+Math.abs(row.topocentricThresholdResidualDegrees),0)/group.length).toFixed(6)),
    maxAbsTopocentric3dResidualDegrees: Number(Math.max(...group.map(row=>Math.abs(row.topocentricThresholdResidualDegrees))).toFixed(6))
  };
}
console.log(JSON.stringify({
  title: "Drik New Delhi 2027 fixed-angle candidate boundary residuals",
  warning: "Diagnostic only. Drik provider coordinates/elevation are undisclosed. Topocentric comparison uses approximate New Delhi city-centre coordinates, not Drik's observer. No threshold refitting is performed.",
  ephemeris: "astronomy-engine@2.1.19",
  geocentricMethod: "Apparent geocentric true ecliptic-of-date longitude gap: Ecliptic(GeoVector(planet)) versus SunPosition.",
  topocentricMethod: "Apparent topocentric RA/Dec for planet and Sun, converted to 3D angular separation.",
  retrogradeMethod: "Signed geocentric ecliptic longitude derivative over a centered 12-hour interval.",
  observerApproximation: { latitude: observer.latitude, longitude: observer.longitude, elevationMeters: observer.height },
  summary, boundaries: rows
}, null, 2));
