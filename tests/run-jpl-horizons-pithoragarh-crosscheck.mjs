import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DATA_PATH = "data/drik-pithoragarh-asta-udaya-2021-2027.json";
const OUTPUT_PATH = "research/reports/jpl-horizons-pithoragarh-2021-2027-boundaries.json";
const SITE = { longitude: 80.2182, latitude: 29.5828, altitudeKm: 1.65 };
const TARGET_IDS = {
  Mercury: "199",
  Venus: "299",
  Mars: "499",
  Jupiter: "599",
  Saturn: "699"
};
const TIME_OFFSETS_MINUTES = [-10, 0, 10];
const EXPECTED_UNIQUE_WINDOWS_BY_PLANET = { Mercury: 45, Venus: 9, Mars: 3, Jupiter: 7, Saturn: 7 };

function parseHorizonsRow(row) {
  const fields = row.split(",").map(value => value.trim());
  if (fields.length < 8) throw new Error("Unexpected Horizons CSV row: " + row);
  return {
    utc: fields[0],
    visibilityFlag: fields[1],
    interfererFlag: fields[2],
    azimuthDeg: Number(fields[3]),
    elevationDeg: Number(fields[4]),
    apparentMagnitude: Number(fields[5]),
    surfaceBrightness: Number(fields[6]),
    illuminatedPercent: Number(fields[7])
  };
}

function utcCalendar(date) {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

function csvRows(text) {
  const section = text.split("$$SOE")[1]?.split("$$EOE")[0];
  if (!section) throw new Error("Horizons response has no $$SOE/$$EOE data block");
  return section.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

async function queryHorizons(targetId, times, label) {
  const params = new URLSearchParams({
    format: "json",
    COMMAND: "'" + targetId + "'",
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "OBSERVER",
    CENTER: "coord",
    COORD_TYPE: "GEODETIC",
    SITE_COORD: "'" + SITE.longitude + "," + SITE.latitude + "," + SITE.altitudeKm + "'",
    TLIST_TYPE: "CAL",
    TLIST: times.map(time => "'" + utcCalendar(new Date(time)) + "'").join(" "),
    TIME_TYPE: "UT",
    TIME_DIGITS: "SECONDS",
    CAL_FORMAT: "CAL",
    CAL_TYPE: "GREGORIAN",
    QUANTITIES: "'4,9,10'",
    CSV_FORMAT: "YES",
    APPARENT: "AIRLESS"
  });
  const url = "https://ssd.jpl.nasa.gov/api/horizons.api?" + params.toString();
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Horizons HTTP " + response.status + " for " + label);
  const payload = await response.json();
  if (payload.error) throw new Error("Horizons error for " + label + ": " + payload.error);
  if (typeof payload.result !== "string") {
    throw new Error("Horizons returned no result text for " + label);
  }
  const rows = csvRows(payload.result);
  if (rows.length !== times.length) {
    throw new Error(label + ": expected " + times.length + " ephemeris rows, received " + rows.length);
  }
  return {
    targetId,
    requestedTimesUTC: times,
    header: payload.result.split("$$SOE")[0].split(/\r?\n/).filter(line => line.includes("Date") || line.includes("Azi") || line.includes("Vis.")).slice(-8),
    rows
  };
}

async function queryHorizonsBatched(targetId, times, label) {
  const batchSize = 8;
  const batches = [];
  for (let start = 0; start < times.length; start += batchSize) {
    batches.push(times.slice(start, start + batchSize));
  }
  const results = [];
  for (let index = 0; index < batches.length; index++) {
    results.push(await queryHorizons(targetId, batches[index], label + " batch " + (index + 1)));
  }
  return {
    targetId,
    requestedTimesUTC: times,
    header: results[0]?.header ?? [],
    rows: results.flatMap(result => result.rows),
    batchCount: batches.length
  };
}

const dataset = JSON.parse(await readFile(DATA_PATH, "utf8"));
const rawWindows = dataset.windows.filter(window =>
  window.sourcePageYear >= 2021 && window.sourcePageYear <= 2027 &&
  window.acceptanceEligible === true &&
  TARGET_IDS[window.planet]
);
if (!rawWindows.length) throw new Error("No accepted 2021–2027 Pithoragarh Drik windows found");

// Annual pages overlap at year boundaries. Deduplicate by the actual published
// event interval, not by page year or capture-row ID, before counting evidence.
const uniqueWindowMap = new Map();
for (const window of rawWindows) {
  const start = window.boundaries?.astaStart?.normalizedUtcInstant;
  const end = window.boundaries?.astaEnd?.normalizedUtcInstant;
  if (!start || !end) throw new Error("Missing normalized UTC interval: " + window.id);
  const key = [window.planet, start, end].join("|");
  const existing = uniqueWindowMap.get(key);
  if (!existing || window.sourcePageYear < existing.sourcePageYear) {
    uniqueWindowMap.set(key, window);
  }
}
const windows = [...uniqueWindowMap.values()].sort((a, b) =>
  a.planet.localeCompare(b.planet) ||
  a.boundaries.astaStart.normalizedUtcInstant.localeCompare(b.boundaries.astaStart.normalizedUtcInstant)
);
const duplicateWindowReferences = rawWindows.length - windows.length;
const uniqueWindowsByPlanet = Object.fromEntries(
  Object.keys(EXPECTED_UNIQUE_WINDOWS_BY_PLANET).map(planet => [planet, windows.filter(window => window.planet === planet).length])
);
if (windows.length !== 71 || duplicateWindowReferences !== 4 ||
    Object.entries(EXPECTED_UNIQUE_WINDOWS_BY_PLANET).some(([planet, count]) => uniqueWindowsByPlanet[planet] !== count)) {
  throw new Error("Unexpected deduplicated source ledger: " +
    windows.length + " unique windows from " + rawWindows.length +
    " raw rows (" + duplicateWindowReferences + " duplicates); expected 71/75/4 and " +
    JSON.stringify(EXPECTED_UNIQUE_WINDOWS_BY_PLANET) + "; received " + JSON.stringify(uniqueWindowsByPlanet));
}

const grouped = new Map();
for (const window of windows) {
  if (!grouped.has(window.planet)) grouped.set(window.planet, []);
  for (const boundaryName of ["astaStart", "astaEnd"]) {
    const boundary = window.boundaries[boundaryName];
    const instant = boundary?.normalizedUtcInstant;
    if (!instant) throw new Error("Missing normalized UTC boundary: " + window.id + "/" + boundaryName);
    grouped.get(window.planet).push({
      windowId: window.id,
      sourcePageYear: window.sourcePageYear,
      boundaryName,
      drikUTC: instant,
      samplesUTC: TIME_OFFSETS_MINUTES.map(offset =>
        new Date(Date.parse(instant) + offset * 60000).toISOString()
      )
    });
  }
}

const expectedBoundariesByPlanet = Object.fromEntries(Object.entries(EXPECTED_UNIQUE_WINDOWS_BY_PLANET).map(([planet, count]) => [planet, count * 2]));
const actualBoundariesByPlanet = Object.fromEntries(Object.keys(expectedBoundariesByPlanet).map(planet => [planet, grouped.get(planet)?.length ?? 0]));
if (Object.entries(expectedBoundariesByPlanet).some(([planet, count]) => actualBoundariesByPlanet[planet] !== count)) {
  throw new Error("Unique JPL boundary counts do not reconcile: expected " + JSON.stringify(expectedBoundariesByPlanet) + "; received " + JSON.stringify(actualBoundariesByPlanet));
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "JPL Horizons API observer ephemeris, independent geometry cross-check",
  sourceUrl: "https://ssd-api.jpl.nasa.gov/api/horizons.api",
  referenceSource: "Direct browser-verified Drik Pithoragarh 2021–2027 annual pages",
  referencePrecision: "minute",
  sourceLedger: {
    rawAnnualPageRows: rawWindows.length,
    uniqueEventWindows: windows.length,
    duplicateAnnualPageReferences: duplicateWindowReferences,
    deduplicationKey: "planet + normalized UTC AstaStart + normalized UTC AstaEnd"
  },
  observer: {
    ...SITE,
    altitudeUnit: "km supplied in Horizons SITE_COORD; vertical datum is unverified",
    altitudeDatum: "unverified; 1.65 km is a project-observer proxy and is not confirmed ellipsoidal height",
    caveat: "Horizons SITE_COORD requires ellipsoidal height. The project elevation 1650 m may be orthometric/MSL; do not interpret these samples as datum-corrected sub-minute validation or proof of Drik internal coordinates."
  },
  settings: {
    ephemerisType: "OBSERVER",
    apparentCoordinates: "AIRLESS",
    quantities: ["apparent AZ/EL", "visual magnitude/surface brightness", "illuminated fraction"],
    timeScale: "UT",
    timeDigits: "SECONDS",
    sampleOffsetsMinutes: TIME_OFFSETS_MINUTES
  },
  planetResults: [],
  interpretation: [
    "This report checks JPL apparent topocentric geometry at the 142 unique published Drik boundary instants from 2021 through 2027 and at +/-10 minutes.",
    "Overlapping annual-page rows are deduplicated by planet and normalized UTC Asta interval before querying or calculating aggregate statistics.",
    "It does not assert that a planet being at the geometric horizon is identical to Drik's event definition.",
    "It does not train or fit the production event selector.",
    "Drik publishes the named city but not its internal observer coordinates/elevation; comparisons remain city-label-only."
  ]
};

for (const [planet, boundaries] of grouped) {
  const times = [...new Set(boundaries.flatMap(boundary => boundary.samplesUTC))].sort();
  const [target, sun] = await Promise.all([
    queryHorizonsBatched(TARGET_IDS[planet], times, planet + " target"),
    queryHorizonsBatched("10", times, planet + " Sun")
  ]);
  const boundaryDiagnostics = boundaries.map(boundary => {
    const centerIndex = target.requestedTimesUTC.indexOf(boundary.samplesUTC[1]);
    if (centerIndex < 0) throw new Error("Missing JPL center sample for " + boundary.windowId);
    const beforeIndex = target.requestedTimesUTC.indexOf(boundary.samplesUTC[0]);
    const afterIndex = target.requestedTimesUTC.indexOf(boundary.samplesUTC[2]);
    if (beforeIndex < 0 || afterIndex < 0) throw new Error("Missing JPL +/-10 minute samples for " + boundary.windowId);
    const targetBefore = parseHorizonsRow(target.rows[beforeIndex]);
    const targetAt = parseHorizonsRow(target.rows[centerIndex]);
    const targetAfter = parseHorizonsRow(target.rows[afterIndex]);
    const sunAt = parseHorizonsRow(sun.rows[centerIndex]);
    const altitudeRate = targetAfter.elevationDeg - targetBefore.elevationDeg;
    if (Math.abs(altitudeRate) < 1e-9) throw new Error("No measurable altitude change around " + boundary.windowId);
    const interpolatedMinusHalfCrossingOffsetMinutes =
      ((-0.5 - targetBefore.elevationDeg) / altitudeRate) * 20 - 10;
    return {
      windowId: boundary.windowId,
      sourcePageYear: boundary.sourcePageYear,
      boundaryName: boundary.boundaryName,
      drikUTC: boundary.drikUTC,
      targetAltitudeDeg: targetAt.elevationDeg,
      targetAltitudeMinus10MinDeg: targetBefore.elevationDeg,
      targetAltitudePlus10MinDeg: targetAfter.elevationDeg,
      targetMotion: targetAfter.elevationDeg > targetBefore.elevationDeg ? "rising" : "setting",
      targetAzimuthDeg: targetAt.azimuthDeg,
      apparentMagnitude: targetAt.apparentMagnitude,
      illuminatedPercent: targetAt.illuminatedPercent,
      sunAltitudeDeg: sunAt.elevationDeg,
      targetAltitudeDifferenceFromMinusHalfDeg: targetAt.elevationDeg + 0.5,
      interpolatedMinusHalfCrossingOffsetMinutes: Number(interpolatedMinusHalfCrossingOffsetMinutes.toFixed(3)),
      absoluteInterpolatedMinusHalfCrossingOffsetMinutes: Number(Math.abs(interpolatedMinusHalfCrossingOffsetMinutes).toFixed(3)),
      nearMinusHalfDegreeHorizon: Math.abs(targetAt.elevationDeg + 0.5) <= 0.2
    };
  });
  report.planetResults.push({
    planet,
    boundaryCount: boundaries.length,
    sampleCount: times.length,
    boundaries,
    boundaryDiagnostics,
    target,
    sun
  });
}

const totalBoundaries = report.planetResults.reduce((sum, item) => sum + item.boundaryCount, 0);
const totalRows = report.planetResults.reduce((sum, item) => sum + item.target.rows.length + item.sun.rows.length, 0);
const allDiagnostics = report.planetResults.flatMap(item => item.boundaryDiagnostics);
const meanTargetAltitude = allDiagnostics.reduce((sum, item) => sum + item.targetAltitudeDeg, 0) / allDiagnostics.length;
const nearHorizonCount = allDiagnostics.filter(item => item.nearMinusHalfDegreeHorizon).length;
report.summary = {
  planets: report.planetResults.length,
  rawAnnualPageRows: rawWindows.length,
  duplicateAnnualPageReferences: duplicateWindowReferences,
  uniqueWindows: windows.length,
  boundaries: totalBoundaries,
  uniqueBoundariesByPlanet: actualBoundariesByPlanet,
  ephemerisRows: totalRows,
  apiQueries: report.planetResults.reduce((sum, item) => sum + 2 * item.target.batchCount, 0),
  meanTargetAltitudeAtPublishedBoundaryDeg: Number(meanTargetAltitude.toFixed(4)),
  meanAbsoluteDifferenceFromMinusHalfDegreeDeg: Number((allDiagnostics.reduce((sum, item) => sum + Math.abs(item.targetAltitudeDifferenceFromMinusHalfDeg), 0) / allDiagnostics.length).toFixed(4)),
  withinPointTwoDegreesOfMinusHalfHorizon: nearHorizonCount,
  crossingsWithinOneMinuteOfPublishedTime: allDiagnostics.filter(item => item.absoluteInterpolatedMinusHalfCrossingOffsetMinutes <= 1).length,
  meanAbsoluteMinutesFromInterpolatedMinusHalfDegreeCrossing: Number((allDiagnostics.reduce((sum, item) => sum + item.absoluteInterpolatedMinusHalfCrossingOffsetMinutes, 0) / allDiagnostics.length).toFixed(3)),
  maxAbsoluteMinutesFromInterpolatedMinusHalfDegreeCrossing: Number(Math.max(...allDiagnostics.map(item => item.absoluteInterpolatedMinusHalfCrossingOffsetMinutes)).toFixed(3)),
  boundaryCount: allDiagnostics.length,
  sourceYears: [...new Set(report.planetResults.flatMap(item => item.boundaryDiagnostics.map(boundary => boundary.sourcePageYear)))].sort(),
  solarAltitudeRangeAtPublishedBoundariesDeg: [
    Number(Math.min(...allDiagnostics.map(item => item.sunAltitudeDeg)).toFixed(3)),
    Number(Math.max(...allDiagnostics.map(item => item.sunAltitudeDeg)).toFixed(3))
  ],
  interpretation: "Observed alignment is consistent with a local planetary horizon-crossing boundary near -0.5 degrees for this sample. It is not proof of Drik's complete event algorithm or observer elevation.",
  status: "complete"
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2) + "\n");
process.stdout.write(JSON.stringify(report.summary, null, 2) + "\n");
