import * as Astronomy from "astronomy-engine";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const inputPath = new URL("../data/drik-planetary-reference-2024-2027.json", import.meta.url);
const dataset = JSON.parse(await readFile(inputPath, "utf8"));
const observer = new Astronomy.Observer(29.5828, 80.2182, 1650);
const targetPlanets = new Set(["Jupiter", "Venus"]);

function angle180(value) {
  const normalized = ((value % 360) + 360) % 360;
  return Math.min(normalized, 360 - normalized);
}

function position(bodyName, date) {
  const body = Astronomy.Body[bodyName];
  if (body === undefined) throw new Error("Unknown Astronomy Engine body: " + bodyName);
  const equatorial = Astronomy.Equator(body, date, observer, true, true);
  const horizontal = Astronomy.Horizon(date, observer, equatorial.ra, equatorial.dec, "normal");
  return {
    rightAscensionHours: Number(equatorial.ra.toFixed(8)),
    declinationDegrees: Number(equatorial.dec.toFixed(8)),
    altitudeDegrees: Number(horizontal.altitude.toFixed(6)),
    azimuthDegrees: Number(horizontal.azimuth.toFixed(6))
  };
}

const rows = dataset.windows
  .filter(row =>
    row.sourceLocation === "Pithoragarh, Uttarakhand, India" &&
    targetPlanets.has(row.planet) &&
    row.acceptanceEligible === true &&
    row.sourceStatus === "direct-page-captured-browser-verified"
  )
  .flatMap(row => ["astaStart", "astaEnd"].map(boundaryName => {
    const boundary = row.boundaries[boundaryName];
    const date = new Date(boundary.normalizedUtcInstant);
    if (!Number.isFinite(date.getTime())) throw new Error("Invalid source boundary: " + row.id);
    const planet = position(row.planet, date);
    const sun = position("Sun", date);
    const elongation = angle180(Astronomy.PairLongitude(Astronomy.Body[row.planet], Astronomy.Body.Sun, date));
    return {
      sourceWindowId: row.id,
      planet: row.planet,
      sourceYear: row.sourcePageYear,
      boundary: boundaryName,
      sourceLocalDateTime: boundary.normalizedLocalDateTime,
      sourceRawDate: boundary.sourcePrintedDate,
      sourceRawClock: boundary.sourcePrintedClock,
      sourcePageUrl: row.sourcePageUrl,
      observer: {
        latitude: observer.latitude,
        longitude: observer.longitude,
        elevationMeters: observer.height,
        coordinatesAreExactProviderCoordinates: false
      },
      geocentricEclipticLongitudeSeparationDegrees: Number(elongation.toFixed(6)),
      planetTopocentric: planet,
      sunTopocentric: sun,
      solarDepressionDegrees: Number((-sun.altitudeDegrees).toFixed(6)),
      method: "Astronomy Engine 2.1.19: Equator + Horizon(normal) + PairLongitude",
      interpretation: "diagnostic-only; not a fitted visibility rule or a production Asta/Udaya prediction"
    };
  }))
  .sort((a, b) => Date.parse(a.sourceLocalDateTime) - Date.parse(b.sourceLocalDateTime));

const output = {
  schemaVersion: "1.0.0",
  generatedAtUtc: new Date().toISOString(),
  sourceDataset: "data/drik-planetary-reference-2024-2027.json",
  sourceWindowCount: new Set(rows.map(row => row.sourceWindowId)).size,
  boundaryCount: rows.length,
  observer: { latitude: observer.latitude, longitude: observer.longitude, elevationMeters: observer.height },
  engine: { name: "astronomy-engine", version: "2.1.19", license: "MIT" },
  rows,
  limitations: [
    "Drik's named-city page does not disclose its exact observer coordinates or elevation.",
    "Pithoragarh reference rows are city-label-only, so this observer is a documented representative coordinate, not claimed provider truth.",
    "The report measures geometry at published boundaries; it does not infer visibility thresholds or publish new event times.",
    "Local atmospheric extinction, weather, terrain obstruction, and observer-specific visibility are not modelled."
  ]
};

const outputPath = process.env.OUTPUT_PATH || "artifacts/tara-boundary-geometry-pithoragarh.json";
await mkdir(outputPath.slice(0, outputPath.lastIndexOf("/")) || ".", { recursive: true });
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({
  result: "PASS",
  sourceWindows: output.sourceWindowCount,
  boundaries: output.boundaryCount,
  planets: [...targetPlanets],
  outputPath,
  sample: rows.slice(0, 2)
}, null, 2));
