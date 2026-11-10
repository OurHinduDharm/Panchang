import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DATA_PATH = "data/drik-pithoragarh-asta-udaya-2021-2027.json";
const OUTPUT_PATH = "research/reports/jpl-horizons-pithoragarh-2025-boundaries.json";
const SITE = { longitude: 80.2182, latitude: 29.5828, altitudeKm: 1.65 };
const TARGET_IDS = {
  Mercury: "199",
  Venus: "299",
  Mars: "499",
  Jupiter: "599",
  Saturn: "699"
};
const TIME_OFFSETS_MINUTES = [-10, 0, 10];

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

const dataset = JSON.parse(await readFile(DATA_PATH, "utf8"));
const windows = dataset.windows.filter(window =>
  window.sourcePageYear === 2025 &&
  window.acceptanceEligible === true &&
  TARGET_IDS[window.planet]
);
if (!windows.length) throw new Error("No accepted 2025 Pithoragarh Drik windows found");

const grouped = new Map();
for (const window of windows) {
  if (!grouped.has(window.planet)) grouped.set(window.planet, []);
  for (const boundaryName of ["astaStart", "astaEnd"]) {
    const boundary = window.boundaries[boundaryName];
    const instant = boundary?.normalizedUtcInstant;
    if (!instant) throw new Error("Missing normalized UTC boundary: " + window.id + "/" + boundaryName);
    grouped.get(window.planet).push({
      windowId: window.id,
      boundaryName,
      drikUTC: instant,
      samplesUTC: TIME_OFFSETS_MINUTES.map(offset =>
        new Date(Date.parse(instant) + offset * 60000).toISOString()
      )
    });
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "JPL Horizons API observer ephemeris, independent geometry cross-check",
  sourceUrl: "https://ssd-api.jpl.nasa.gov/api/horizons.api",
  referenceSource: "Direct browser-verified Drik Pithoragarh 2025 annual pages",
  referencePrecision: "minute",
  observer: {
    ...SITE,
    altitudeUnit: "km above reference ellipsoid as supplied to Horizons",
    caveat: "The project elevation 1650 m may be orthometric/MSL rather than ellipsoidal; this is a project-observer proxy, not proof of Drik internal coordinates."
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
    "This report checks JPL apparent topocentric geometry at the published Drik boundary instants and at +/-10 minutes.",
    "It does not assert that a planet being at the geometric horizon is identical to Drik's event definition.",
    "It does not train or fit the production event selector.",
    "Drik publishes the named city but not its internal observer coordinates/elevation; comparisons remain city-label-only."
  ]
};

for (const [planet, boundaries] of grouped) {
  const times = [...new Set(boundaries.flatMap(boundary => boundary.samplesUTC))].sort();
  const [target, sun] = await Promise.all([
    queryHorizons(TARGET_IDS[planet], times, planet + " target"),
    queryHorizons("10", times, planet + " Sun")
  ]);
  report.planetResults.push({
    planet,
    boundaryCount: boundaries.length,
    sampleCount: times.length,
    boundaries,
    target,
    sun
  });
}

const totalBoundaries = report.planetResults.reduce((sum, item) => sum + item.boundaryCount, 0);
const totalRows = report.planetResults.reduce((sum, item) => sum + item.target.rows.length + item.sun.rows.length, 0);
report.summary = {
  planets: report.planetResults.length,
  boundaries: totalBoundaries,
  ephemerisRows: totalRows,
  apiQueries: report.planetResults.length * 2,
  status: "complete"
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2) + "\n");
process.stdout.write(JSON.stringify(report.summary, null, 2) + "\n");
