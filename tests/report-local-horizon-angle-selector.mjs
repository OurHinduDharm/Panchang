import { readFile } from "node:fs/promises";
import {
  Ecliptic,
  Equator,
  GeoVector,
  Horizon,
  Observer,
  SearchRiseSet
} from "astronomy-engine";

const dataset = JSON.parse(await readFile(new URL("../data/asta-udaya-benchmark.json", import.meta.url), "utf8"));
const RULES = {
  Mercury: { direct: 14, retrograde: 12 },
  Venus: { direct: 10, retrograde: 8 },
  Mars: { direct: 17, retrograde: 8 },
  Jupiter: { direct: 11, retrograde: 11 },
  Saturn: { direct: 15, retrograde: 15 }
};

function addDays(dateString, days) {
  const date = new Date(dateString + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function localMidnight(dateString) {
  return new Date(dateString + "T00:00:00+05:30");
}

function wrap180(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function angularSeparation(body, date, observer) {
  const planet = Equator(body, date, observer, true, true);
  const sun = Equator("Sun", date, observer, true, true);
  const vector = point => {
    const ra = point.ra * Math.PI / 12;
    const dec = point.dec * Math.PI / 180;
    return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  };
  const a = vector(planet);
  const b = vector(sun);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return Math.acos(dot) * 180 / Math.PI;
}

function isRetrograde(body, date) {
  const before = Ecliptic(GeoVector(body, new Date(date.getTime() - 6 * 3600000), true)).elon;
  const after = Ecliptic(GeoVector(body, new Date(date.getTime() + 6 * 3600000), true)).elon;
  return wrap180(after - before) < 0;
}

function dailyTwilightCrossing(body, dateString, observer) {
  const start = localMidnight(dateString);
  const events = [1, -1].map(direction => {
    const found = SearchRiseSet(body, observer, direction, start, 1, 0);
    if (!found) return null;
    const sun = Equator("Sun", found.date, observer, true, true);
    const horizontal = Horizon(found.date, observer, sun.ra, sun.dec, "normal");
    return {
      date: dateString,
      instant: found.date,
      direction: direction === 1 ? "rise" : "set",
      sunAltitude: horizontal.altitude,
      separation: angularSeparation(body, found.date, observer),
      retrograde: isRetrograde(body, found.date)
    };
  }).filter(Boolean);
  if (!events.length) return null;
  // Near conjunction, the relevant daily event is the planet's rise/set
  // occurring in twilight; the opposite crossing occurs with the Sun high.
  return events.sort((a, b) => a.sunAltitude - b.sunAltitude)[0];
}

function nearestBoundary(entry, boundaryName, eventType, observer) {
  const targetDate = entry.boundaries[boundaryName].slice(0, 10);
  const body = entry.planet;
  const candidates = [];
  let previous = null;
  for (let offset = -31; offset <= 31; offset++) {
    const date = addDays(targetDate, offset);
    const current = dailyTwilightCrossing(body, date, observer);
    if (!current) continue;
    if (previous) {
      const threshold = RULES[body][current.retrograde ? "retrograde" : "direct"];
      const crossed = eventType === "asta"
        ? previous.separation > threshold && current.separation <= threshold
        : previous.separation <= threshold && current.separation > threshold;
      if (crossed) {
        candidates.push({
          date: current.date,
          instant: current.instant,
          direction: current.direction,
          threshold,
          separation: current.separation,
          sunAltitude: current.sunAltitude,
          retrograde: current.retrograde
        });
      }
    }
    previous = current;
  }
  candidates.sort((a, b) =>
    Math.abs(Date.parse(a.date) - Date.parse(targetDate)) -
    Math.abs(Date.parse(b.date) - Date.parse(targetDate))
  );
  const best = candidates[0];
  return {
    targetDate,
    predictedDate: best?.date ?? null,
    signedDateOffsetDays: best
      ? Math.round((Date.parse(best.date) - Date.parse(targetDate)) / 86400000)
      : null,
    predictedLocalHorizonEvent: best?.direction ?? null,
    thresholdDegrees: best?.threshold ?? null,
    solarAltitudeDegrees: best ? Number(best.sunAltitude.toFixed(4)) : null,
    candidateCount: candidates.length,
    status: best ? "diagnostic-nearest-crossing" : "no-crossing"
  };
}

const rows = [];
for (const entry of dataset.cases) {
  if (entry.precision !== "minute" || !entry.testObserver ||
      !Number.isFinite(entry.testObserver.latitude) ||
      !Number.isFinite(entry.testObserver.longitude)) continue;
  const observer = new Observer(
    entry.testObserver.latitude,
    entry.testObserver.longitude,
    entry.testObserver.elevationMeters ?? 0
  );
  for (const [boundaryName, eventType] of [["astaStart", "asta"], ["astaEnd", "udaya"]]) {
    const prediction = nearestBoundary(entry, boundaryName, eventType, observer);
    rows.push({
      id: entry.id,
      sourceId: entry.sourceId,
      sourceStatus: entry.status,
      planet: entry.planet,
      boundary: boundaryName,
      ...prediction
    });
  }
}

function summarize(items) {
  const errors = items.map(item => item.signedDateOffsetDays).filter(Number.isFinite);
  const abs = errors.map(Math.abs);
  return {
    count: errors.length,
    exact: abs.filter(value => value === 0).length,
    withinOneDay: abs.filter(value => value <= 1).length,
    withinTwoDays: abs.filter(value => value <= 2).length,
    meanAbsoluteErrorDays: errors.length
      ? Number((abs.reduce((sum, value) => sum + value, 0) / errors.length).toFixed(3))
      : null,
    maxAbsoluteErrorDays: abs.length ? Math.max(...abs) : null
  };
}

const byPlanet = Object.fromEntries(
  [...new Set(rows.map(row => row.planet))].sort().map(planet => [
    planet,
    summarize(rows.filter(row => row.planet === planet))
  ])
);
const bySourceStatus = Object.fromEntries(
  [...new Set(rows.map(row => row.sourceStatus))].sort().map(status => [
    status,
    summarize(rows.filter(row => row.sourceStatus === status))
  ])
);

console.log(JSON.stringify({
  title: "Local-horizon event-angle selector diagnostic",
  method: "For each civil date, calculate topocentric Sun-planet separation at the local planet rise or set occurring in the darker twilight; detect direct/retrograde threshold crossings across those daily events; return the local horizon event on the crossing date.",
  warning: "Research diagnostic only. Pithoragarh observer coordinates are project-selected, not Drik's undisclosed coordinates. User-transcribed cases are not independent published references. Each prediction is matched to the nearest crossing within +/-31 days of its published date; this is a boundary-local diagnostic, not blind annual forecasting.",
  thresholdRules: RULES,
  summary: { overall: summarize(rows), byPlanet, bySourceStatus },
  rows
}, null, 2));
