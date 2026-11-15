import * as Astronomy from "astronomy-engine";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const sourcePath = new URL("../research/printed-panchang-guru-shukra-agastya-2019-2026.json", import.meta.url);
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const profiles = {
  "ganesh-martand": {
    name: "Almora",
    latitude: 29 + 37 / 60,
    longitude: 79 + 40 / 60,
    elevationMeters: 0,
    elevationKnown: false
  },
  "tara-prasad": {
    name: "Ramnagar",
    latitude: 29 + 30 / 60,
    longitude: 79 + 8 / 60,
    elevationMeters: 0,
    elevationKnown: false
  },
  "drikpanchang-almora": {
    name: "Almora (Drik Panchang; coordinates provisional from matching city metadata)",
    latitude: 29 + 37 / 60,
    longitude: 79 + 40 / 60,
    elevationMeters: 0,
    elevationKnown: false
  },
  "drikpanchang-ramnagar": {
    name: "Ramnagar (Drik Panchang; coordinates provisional from matching city metadata)",
    latitude: 29 + 30 / 60,
    longitude: 79 + 8 / 60,
    elevationMeters: 0,
    elevationKnown: false
  }
};
const IST_OFFSET_MINUTES = 330;

function parsePrintedClock(dateText, raw) {
  if (typeof raw !== "string" || !/^\d{1,2}[.:]\d{2}$/.test(raw)) return null;
  const [hour, minute] = raw.split(/[.:]/).map(Number);
  if (minute > 59 || hour > 47) return null;
  const rolloverDays = Math.floor(hour / 24);
  const hourOfDay = hour % 24;
  const [year, month, day] = dateText.split("-").map(Number);
  const localDate = new Date(Date.UTC(year, month - 1, day + rolloverDays));
  const localWallClockMs = Date.UTC(
    localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(),
    hourOfDay, minute
  );
  return {
    localDate: localDate.toISOString().slice(0, 10),
    localTime: String(hourOfDay).padStart(2, "0") + ":" + String(minute).padStart(2, "0"),
    utc: new Date(localWallClockMs - IST_OFFSET_MINUTES * 60000)
  };
}

function searchCrossing(bodyName, direction, targetUtc, observer) {
  const start = new Date(targetUtc.getTime() - 12 * 3600000);
  const found = Astronomy.SearchRiseSet(
    Astronomy.Body[bodyName], observer, direction, start, 1.1, 0
  );
  const instant = found?.date instanceof Date ? found.date : found instanceof Date ? found : null;
  if (!instant) return null;
  return {
    utc: instant.toISOString(),
    differenceMinutes: Number(((instant - targetUtc) / 60000).toFixed(2)),
    localDateTimeIST: new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).format(instant)
  };
}

const rows = source.observations.map(record => {
  const profile = profiles[record.sourceId];
  if (record.planet === "अगस्त्य") {
    return { id: record.id, sourceId: record.sourceId, planet: record.planet, event: record.event, date: record.date, timeRaw: record.timeRaw, status: "separate-fixed-star-track", reason: "Canopus traditional date/time needs a fixed-star calculation and must not be passed to the planet rise/set API." };
  }
  const parsed = parsePrintedClock(record.date, record.timeRaw);
  const planetName = record.planet === "शुक्र" ? "Venus"
    : record.planet === "बृहस्पति" ? "Jupiter"
    : record.planet === "अगस्त्य" ? "Canopus" : null;
  if (!profile || !planetName || !parsed) {
    return {
      id: record.id, sourceId: record.sourceId, planet: record.planet,
      event: record.event, date: record.date, timeRaw: record.timeRaw,
      status: "not-comparable",
      reason: !parsed ? "missing-or-unparseable-time" : "unsupported-record"
    };
  }
  const observer = new Astronomy.Observer(
    profile.latitude, profile.longitude, profile.elevationMeters
  );
  const planetEquator = Astronomy.Equator(
    Astronomy.Body[planetName], parsed.utc, observer, true, true
  );
  const sunEquator = Astronomy.Equator(
    Astronomy.Body.Sun, parsed.utc, observer, true, true
  );
  const planetHorizon = Astronomy.Horizon(
    parsed.utc, observer, planetEquator.ra, planetEquator.dec, null
  );
  const planetHorizonNormalRefraction = Astronomy.Horizon(
    parsed.utc, observer, planetEquator.ra, planetEquator.dec, "normal"
  );
  const sunHorizon = Astronomy.Horizon(
    parsed.utc, observer, sunEquator.ra, sunEquator.dec, null
  );
  const sunHorizonNormalRefraction = Astronomy.Horizon(
    parsed.utc, observer, sunEquator.ra, sunEquator.dec, "normal"
  );
  const sunPlanetSeparationDeg = Astronomy.AngleFromSun(
    Astronomy.Body[planetName], parsed.utc
  );
  const directions = record.planet === "अगस्त्य"
    ? [{ key: "rise", value: 1 }]
    : [{ key: "rise", value: 1 }, { key: "set", value: -1 }];
  const crossings = directions.map(item => ({
    direction: item.key,
    result: searchCrossing(planetName, item.value, parsed.utc, observer)
  })).filter(item => item.result);
  const crossingDiagnostics = crossings.map(item => ({
    direction: item.direction,
    result: item.result,
    absoluteDifferenceMinutes: item.result
      ? Number(Math.abs(item.result.differenceMinutes).toFixed(2))
      : null
  }));
  return {
    id: record.id,
    sourceId: record.sourceId,
    sourceName: source.sources.find(item => item.id === record.sourceId)?.name,
    city: profile.name,
    observer: {
      latitude: profile.latitude,
      longitude: profile.longitude,
      elevationMeters: profile.elevationMeters,
      elevationKnown: profile.elevationKnown
    },
    planet: record.planet,
    astronomyBody: planetName,
    event: record.event,
    sourceDirectionRaw: record.direction,
    sourceDate: record.date,
    sourceTimeRaw: record.timeRaw,
    parsedIST: parsed.localDate + " " + parsed.localTime,
    skyGeometryAtPrintedInstant: {
      planetGeometricAltitudeDeg: Number(planetHorizon.altitude.toFixed(4)),
      planetApparentAltitudeNormalRefractionDeg: Number(planetHorizonNormalRefraction.altitude.toFixed(4)),
      planetRefractionCorrectionDeg: Number((planetHorizonNormalRefraction.altitude - planetHorizon.altitude).toFixed(4)),
      sunGeometricAltitudeDeg: Number(sunHorizon.altitude.toFixed(4)),
      sunApparentAltitudeNormalRefractionDeg: Number(sunHorizonNormalRefraction.altitude.toFixed(4)),
      sunPlanetAngularSeparationDeg: Number(sunPlanetSeparationDeg.toFixed(4))
    },
    geometricCrossingDiagnostics: crossingDiagnostics,
    interpretation: "Both local geometric rise and set are reported independently. The planet's altitude, Sun's altitude, and Sun-planet angular separation are also sampled at the printed instant. These are diagnostics only; the source's heliacal visibility/date-selection rule and direction semantics are not assumed."
  };
});

const comparable = rows.filter(row => row.geometricCrossingDiagnostics?.some(item => item.result));
const groupedSkyGeometryDiagnostics = [...new Set(comparable.map(row =>
  [row.sourceId, row.planet, row.event].join("|")
))].map(key => {
  const [sourceId, planet, event] = key.split("|");
  const group = comparable.filter(row =>
    row.sourceId === sourceId && row.planet === planet && row.event === event
  );
  const values = field => group
    .map(row => row.skyGeometryAtPrintedInstant?.[field])
    .filter(value => Number.isFinite(value))
    .sort((a, b) => a - b);
  const range = field => {
    const items = values(field);
    return items.length ? {
      min: Number(items[0].toFixed(3)),
      median: Number(items[Math.floor(items.length / 2)].toFixed(3)),
      max: Number(items[items.length - 1].toFixed(3))
    } : null;
  };
  return {
    sourceId,
    planet,
    event,
    records: group.length,
    sunAltitudeDeg: range("sunGeometricAltitudeDeg"),
    planetAltitudeGeometricDeg: range("planetGeometricAltitudeDeg"),
    planetAltitudeApparentNormalRefractionDeg: range("planetApparentAltitudeNormalRefractionDeg"),
    planetRefractionCorrectionDeg: range("planetRefractionCorrectionDeg"),
    sunPlanetSeparationDeg: range("sunPlanetAngularSeparationDeg")
  };
});
const output = {
  schemaVersion: "1.0.0",
  generatedAtUtc: new Date().toISOString(),
  source: "research/printed-panchang-guru-shukra-agastya-2019-2026.json",
  engine: { name: "astronomy-engine", version: "2.1.19", license: "MIT" },
  method: "For each printed IST hour-minute, compute both local topocentric geometric rise and set crossings at the stated Panchang center coordinates; report their time differences independently without assigning either crossing to the Panchang event. Also calculate horizontal altitude with refraction disabled and with Astronomy Engine's normal refraction model. SearchRiseSet itself applies a standard 34-arcminute near-horizon refraction correction. Almora/Ramnagar elevation is not stated in the source and is provisionally set to 0 m; results are diagnostic only.",
  summary: {
    totalRecords: rows.length,
    comparableRecords: comparable.length,
    recordsWithoutUsableTime: rows.length - comparable.length,
    recordsWithAnyCrossingWithin15Minutes: comparable.filter(row =>
      row.geometricCrossingDiagnostics.some(item => item.absoluteDifferenceMinutes !== null && item.absoluteDifferenceMinutes <= 15)
    ).length,
    recordsWithAnyCrossingWithin60Minutes: comparable.filter(row =>
      row.geometricCrossingDiagnostics.some(item => item.absoluteDifferenceMinutes !== null && item.absoluteDifferenceMinutes <= 60)
    ).length,
    medianMinimumAbsoluteCrossingDifferenceMinutes: comparable.length
      ? Number([...comparable].map(row => Math.min(...row.geometricCrossingDiagnostics
          .filter(item => item.absoluteDifferenceMinutes !== null)
          .map(item => item.absoluteDifferenceMinutes)))
        .sort((a,b)=>a-b)[Math.floor(comparable.length/2)].toFixed(2))
      : null
  },
  groupedSkyGeometryDiagnostics,
  rows,
  limitations: [
    "This reports both local geometric crossings and the sky geometry at the printed instant. It does not establish the Panchang's Asta/Udaya date-selection or visibility rule.",
    "The source's पूर्व/पश्चिम labels are retained verbatim and are not interpreted as rise/set direction.",
    "The Panchang gives no observer elevation; 0 m is a documented provisional assumption and may shift horizon times.",
    "The source provides geographic and geocentric latitudes; geographic latitude is used for the observer's local horizon calculation.",
    "Agastya/Canopus records are deliberately routed to a separate fixed-star research track; no planetary-body API is used for them."
  ]
};
const outputPath = process.env.OUTPUT_PATH || "artifacts/printed-panchang-local-horizon-audit.json";
await mkdir(outputPath.slice(0, outputPath.lastIndexOf("/")) || ".", { recursive: true });
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({ result: "PASS", summary: output.summary, sample: rows.slice(0, 4), outputPath }, null, 2));
