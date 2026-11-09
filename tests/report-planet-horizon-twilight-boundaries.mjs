import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as Astronomy from "astronomy-engine";

const here = dirname(fileURLToPath(import.meta.url));
const dataset = JSON.parse(readFileSync(resolve(here, "../data/asta-udaya-benchmark.json"), "utf8"));
const SOURCE_ID = "drik-pithoragarh-2025-venus";

const directions = {
  "venus-pithoragarh-2025-march": { astaStart: -1, astaEnd: 1 },
  "venus-pithoragarh-2025-december-to-2026-february": { astaStart: 1, astaEnd: -1 }
};

function round(value, digits = 4) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
}

function getSunAltitude(date, observer) {
  const sun = Astronomy.Equator("Sun", date, observer, true, true);
  return Astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
}

function getPlanetAltitude(body, date, observer) {
  const planet = Astronomy.Equator(body, date, observer, true, true);
  return Astronomy.Horizon(date, observer, planet.ra, planet.dec, "normal").altitude;
}

const entries = dataset.cases.filter(entry =>
  entry.sourceId === SOURCE_ID &&
  entry.status === "published-reference" &&
  entry.precision === "minute"
);

if (entries.length !== 2) {
  throw new Error("Expected exactly two independently indexed Pithoragarh Venus apparitions");
}

const rows = [];
for (const entry of entries) {
  if (entry.comparisonLevel !== "city-label-only" || entry.sourceObserver.coordinates !== null) {
    throw new Error("Provider observer provenance changed; review before using this diagnostic");
  }

  const observer = new Astronomy.Observer(
    entry.testObserver.latitude,
    entry.testObserver.longitude,
    entry.testObserver.elevationMeters
  );
  const expected = directions[entry.id];
  if (!expected) throw new Error("Missing explicit event direction for " + entry.id);

  for (const boundary of ["astaStart", "astaEnd"]) {
    const date = new Date(entry.boundaries[boundary]);
    const body = entry.planet;
    const illumination = Astronomy.Illumination(body, date);
    rows.push({
      entry: entry.id,
      boundary,
      expectedHorizonEvent: expected[boundary] === 1 ? "rise" : "set",
      publishedIST: entry.boundaries[boundary],
      observer: {
        latitude: entry.testObserver.latitude,
        longitude: entry.testObserver.longitude,
        elevationMeters: entry.testObserver.elevationMeters
      },
      sunAltitudeDegrees: round(getSunAltitude(date, observer), 5),
      planetAltitudeDegrees: round(getPlanetAltitude(body, date, observer), 5),
      apparentElongationDegrees: round(Astronomy.AngleFromSun(body, date), 5),
      apparentMagnitude: round(illumination.mag, 4),
      illuminatedFraction: round(illumination.phase_fraction, 6)
    });
  }
}

console.log(JSON.stringify({
  title: "Independent Pithoragarh Venus boundary twilight profile",
  sourceId: SOURCE_ID,
  sampleCount: rows.length,
  interpretation: "Diagnostic only. Planetary horizon event time is checked separately; Sun altitude, elongation, magnitude and phase are candidate event-selection observables, not fitted production thresholds. Source observer coordinates remain undisclosed.",
  rows
}, null, 2));
