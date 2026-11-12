import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import * as Astronomy from "astronomy-engine";

const DATA_PATH = "data/drik-pithoragarh-asta-udaya-2021-2027.json";
const OUTPUT_PATH = "research/reports/pithoragarh-event-topology-audit-2021-2027.json";
const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86400000;
const OBSERVER = new Astronomy.Observer(29.5828, 80.2182, 1650);
const EXPECTED_WINDOWS = { Mercury: 45, Venus: 9, Mars: 3, Jupiter: 7, Saturn: 7 };

function localParts(date) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(date).map(part => [part.type, part.value]));
}

function signedOffsetMinutes(a, b) {
  return Number(((a.getTime() - b.getTime()) / 60000).toFixed(3));
}

function wrap180(value) {
  return ((value + 540) % 360) - 180;
}

function angularSeparation(a, b) {
  const rad = Math.PI / 180;
  const dra = (a.ra - b.ra) * 15 * rad;
  const da = a.dec * rad, db = b.dec * rad;
  const cosine = Math.sin(da) * Math.sin(db) +
    Math.cos(da) * Math.cos(db) * Math.cos(dra);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) / rad;
}

function sampleEvent(body, date, direction) {
  const sun = Astronomy.Equator("Sun", date, OBSERVER, true, true);
  const planet = Astronomy.Equator(body, date, OBSERVER, true, true);
  const sunHorizon = Astronomy.Horizon(date, OBSERVER, sun.ra, sun.dec, "normal");
  const planetHorizon = Astronomy.Horizon(date, OBSERVER, planet.ra, planet.dec, "normal");
  const illumination = Astronomy.Illumination(body, date);
  const before = new Date(date.getTime() - 12 * 3600000);
  const after = new Date(date.getTime() + 12 * 3600000);
  const relativeLongitude = instant => {
    const sunVector = Astronomy.GeoVector("Sun", instant, true);
    const planetVector = Astronomy.GeoVector(body, instant, true);
    return wrap180(
      Astronomy.Ecliptic(planetVector).elon - Astronomy.Ecliptic(sunVector).elon
    );
  };
  const longitudeRate = wrap180(relativeLongitude(after) - relativeLongitude(before));
  const parts = localParts(date);
  return {
    utc: date.toISOString(),
    localDate: parts.year + "-" + parts.month + "-" + parts.day,
    localTime: parts.hour + ":" + parts.minute + ":" + parts.second,
    direction: direction === 1 ? "rise" : "set",
    planetAltitudeDeg: Number(planetHorizon.altitude.toFixed(5)),
    sunAltitudeDeg: Number(sunHorizon.altitude.toFixed(5)),
    planetAzimuthDeg: Number(planetHorizon.azimuth.toFixed(5)),
    sunAzimuthDeg: Number(sunHorizon.azimuth.toFixed(5)),
    sunPlanetAzimuthSeparationDeg: Number(Math.abs(wrap180(
      sunHorizon.azimuth - planetHorizon.azimuth
    )).toFixed(5)),
    sunPlanetEquatorialSeparationDeg: Number(angularSeparation(sun, planet).toFixed(5)),
    elongationDeg: Number(Astronomy.AngleFromSun(body, date).toFixed(5)),
    apparentMagnitude: Number(illumination.mag.toFixed(5)),
    illuminatedFraction: Number(illumination.phase_fraction.toFixed(6)),
    relativeEclipticLongitudeDeg: Number(relativeLongitude(date).toFixed(5)),
    relativeLongitudeRateDegPerDay: Number(longitudeRate.toFixed(6)),
    motionState: longitudeRate < 0 ? "retrograde" : "direct"
  };
}

function enumerateBothDirections(body, anchor) {
  const start = new Date(anchor.getTime() - 3 * DAY_MS);
  const finish = new Date(anchor.getTime() + 3 * DAY_MS);
  const events = [];
  for (const direction of [1, -1]) {
    let cursor = start;
    for (let count = 0; count < 10; count++) {
      const found = Astronomy.SearchRiseSet(body, OBSERVER, direction, cursor, 8, 0);
      if (!found?.date || !Number.isFinite(found.date.getTime())) break;
      if (found.date > finish) break;
      if (found.date >= start) events.push(sampleEvent(body, found.date, direction));
      cursor = new Date(found.date.getTime() + 1000);
    }
  }
  return events.sort((a, b) => a.utc.localeCompare(b.utc));
}

const dataset = JSON.parse(await readFile(DATA_PATH, "utf8"));
const rawWindows = dataset.windows.filter(window =>
  window.sourcePageYear >= 2021 && window.sourcePageYear <= 2027 &&
  window.acceptanceEligible === true && EXPECTED_WINDOWS[window.planet]
);
const unique = new Map();
for (const window of rawWindows) {
  const start = window.boundaries?.astaStart?.normalizedUtcInstant;
  const end = window.boundaries?.astaEnd?.normalizedUtcInstant;
  if (!start || !end) throw new Error("Missing normalized interval: " + window.id);
  const key = [window.planet, start, end].join("|");
  if (!unique.has(key)) unique.set(key, window);
}
const windows = [...unique.values()];
const expectedTotal = Object.values(EXPECTED_WINDOWS).reduce((sum, count) => sum + count, 0);
if (rawWindows.length !== 75 || windows.length !== expectedTotal || rawWindows.length - windows.length !== 4) {
  throw new Error("Source ledger mismatch: expected 75 raw / 71 unique / 4 duplicate rows");
}
for (const [planet, expected] of Object.entries(EXPECTED_WINDOWS)) {
  const actual = windows.filter(window => window.planet === planet).length;
  if (actual !== expected) throw new Error(planet + " unique-window count mismatch: " + actual);
}

const boundaries = [];
for (const window of windows) {
  for (const boundaryName of ["astaStart", "astaEnd"]) {
    const source = window.boundaries[boundaryName];
    const anchor = new Date(source.normalizedUtcInstant);
    if (!Number.isFinite(anchor.getTime())) throw new Error("Invalid boundary instant: " + window.id);
    const events = enumerateBothDirections(window.planet, anchor);
    const ranked = events.map(event => ({
      ...event,
      offsetMinutes: signedOffsetMinutes(new Date(event.utc), anchor)
    })).sort((a, b) => Math.abs(a.offsetMinutes) - Math.abs(b.offsetMinutes));
    const close = ranked.filter(event => Math.abs(event.offsetMinutes) <= 5);
    const nearest = ranked[0] ?? null;
    const sourceLocalDate = localParts(anchor);
    const expectedDate = sourceLocalDate.year + "-" + sourceLocalDate.month + "-" + sourceLocalDate.day;
    boundaries.push({
      windowId: window.id,
      planet: window.planet,
      sourcePageYear: window.sourcePageYear,
      boundaryName,
      publishedUTC: anchor.toISOString(),
      publishedLocalDate: expectedDate,
      publishedLocalTime: sourceLocalDate.hour + ":" + sourceLocalDate.minute + ":" + sourceLocalDate.second,
      eventCountWithinThreeDays: events.length,
      riseCount: events.filter(event => event.direction === "rise").length,
      setCount: events.filter(event => event.direction === "set").length,
      uniqueEventsWithinFiveMinutes: close.length,
      nearestEvent: nearest,
      allEvents: ranked
    });
  }
}

const summaryByPlanet = Object.fromEntries(Object.keys(EXPECTED_WINDOWS).map(planet => {
  const rows = boundaries.filter(row => row.planet === planet);
  return [planet, {
    boundaries: rows.length,
    withBothRiseAndSetEnumerated: rows.filter(row => row.riseCount > 0 && row.setCount > 0).length,
    uniqueWithinFiveMinutes: rows.filter(row => row.uniqueEventsWithinFiveMinutes === 1).length,
    noEventWithinFiveMinutes: rows.filter(row => row.uniqueEventsWithinFiveMinutes === 0).length,
    multipleEventsWithinFiveMinutes: rows.filter(row => row.uniqueEventsWithinFiveMinutes > 1).length,
    nearestEventOnPublishedLocalDate: rows.filter(row =>
      row.nearestEvent?.localDate === row.publishedLocalDate
    ).length,
    nearestEventOffsetMeanAbsoluteMinutes: rows.length
      ? Number((rows.reduce((sum, row) => sum + Math.abs(row.nearestEvent?.offsetMinutes ?? 0), 0) / rows.length).toFixed(3))
      : null,
    nearestEventDirectionCounts: {
      rise: rows.filter(row => row.nearestEvent?.direction === "rise").length,
      set: rows.filter(row => row.nearestEvent?.direction === "set").length
    }
  }];
}));

const total = boundaries.length;
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: "diagnostic-complete-not-production-acceptance",
  source: "Direct browser-verified Drik Pithoragarh 2021–2027 accepted event ledger",
  ephemeris: "Astronomy Engine 2.1.19 topocentric SearchRiseSet",
  observer: {
    latitudeDeg: 29.5828, longitudeDeg: 80.2182, heightMeters: 1650,
    heightDatum: "unverified project proxy; not datum-corrected ellipsoidal height"
  },
  search: {
    window: "±72 elapsed hours around each published UTC boundary",
    directions: ["rise", "set"],
    horizonMetersAboveSearchHorizon: 0,
    timeZone: TIME_ZONE
  },
  sourceLedger: {
    rawAnnualPageRows: rawWindows.length,
    uniqueWindows: windows.length,
    duplicateAnnualPageReferences: rawWindows.length - windows.length,
    uniqueBoundaries: total
  },
  summaryByPlanet,
  summary: {
    boundaries: total,
    bothDirectionsEnumerated: boundaries.filter(row => row.riseCount > 0 && row.setCount > 0).length,
    uniqueRiseOrSetWithinFiveMinutes: boundaries.filter(row => row.uniqueEventsWithinFiveMinutes === 1).length,
    noRiseOrSetWithinFiveMinutes: boundaries.filter(row => row.uniqueEventsWithinFiveMinutes === 0).length,
    multipleRiseOrSetEventsWithinFiveMinutes: boundaries.filter(row => row.uniqueEventsWithinFiveMinutes > 1).length,
    nearestEventOnPublishedLocalDate: boundaries.filter(row =>
      row.nearestEvent?.localDate === row.publishedLocalDate
    ).length
  },
  interpretation: [
    "Every accepted published boundary is audited against all locally computed rise and set events within ±72 elapsed hours.",
    "The nearest event is diagnostic only; a close event does not prove the complete Drik visibility algorithm.",
    "A unique event within five minutes is reported separately from exact local-date and event-direction agreement.",
    "Observer height remains an unverified 1650 m proxy; this report is not datum-corrected location validation.",
    "No prediction or production display is changed by this audit."
  ],
  boundaries
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2) + "\n");
process.stdout.write(JSON.stringify({ ...report.summary, summaryByPlanet }, null, 2) + "\n");
