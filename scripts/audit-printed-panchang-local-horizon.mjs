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
  }
};
const IST_OFFSET_MINUTES = 330;

function parsePrintedClock(dateText, raw) {
  if (typeof raw !== "string" || !/^\d{1,2}\.\d{2}$/.test(raw)) return null;
  const [hour, minute] = raw.split(".").map(Number);
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
  const directions = record.planet === "अगस्त्य"
    ? [{ key: "rise", value: 1 }]
    : [{ key: "rise", value: 1 }, { key: "set", value: -1 }];
  const crossings = directions.map(item => ({
    direction: item.key,
    result: searchCrossing(planetName, item.value, parsed.utc, observer)
  })).filter(item => item.result);
  const nearest = [...crossings].sort((a, b) =>
    Math.abs(a.result.differenceMinutes) - Math.abs(b.result.differenceMinutes)
  )[0] ?? null;
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
    nearestGeometricCrossing: nearest,
    allCrossings: crossings,
    interpretation: "clock-time geometry diagnostic only; not validation of Panchang Asta/Udaya date-selection or source direction semantics"
  };
});

const comparable = rows.filter(row => row.nearestGeometricCrossing);
const output = {
  schemaVersion: "1.0.0",
  generatedAtUtc: new Date().toISOString(),
  source: "research/printed-panchang-guru-shukra-agastya-2019-2026.json",
  engine: { name: "astronomy-engine", version: "2.1.19", license: "MIT" },
  method: "For each printed IST hour-minute, compute the nearest local topocentric geometric rise/set crossing at the stated Panchang center coordinates. Almora/Ramnagar elevation is not stated in the source and is provisionally set to 0 m; results are diagnostic only.",
  summary: {
    totalRecords: rows.length,
    comparableRecords: comparable.length,
    recordsWithoutUsableTime: rows.length - comparable.length,
    within15Minutes: comparable.filter(row => Math.abs(row.nearestGeometricCrossing.result.differenceMinutes) <= 15).length,
    within60Minutes: comparable.filter(row => Math.abs(row.nearestGeometricCrossing.result.differenceMinutes) <= 60).length,
    medianAbsoluteDifferenceMinutes: comparable.length
      ? Number([...comparable].map(row => Math.abs(row.nearestGeometricCrossing.result.differenceMinutes))
        .sort((a,b)=>a-b)[Math.floor(comparable.length/2)].toFixed(2))
      : null
  },
  rows,
  limitations: [
    "This checks only whether the printed clock time is near a local geometric horizon crossing; it does not establish the Panchang's Asta/Udaya visibility rule.",
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
