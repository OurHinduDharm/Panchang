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

  const series = [];
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

    // Sample the same directed local horizon event on nearby civil dates.
    // This reveals how twilight geometry evolves around the published boundary
    // without fitting a threshold or substituting another city's data.
    for (let dayOffset = -5; dayOffset <= 5; dayOffset++) {
      const searchStart = new Date(date.getTime() + dayOffset * 86400000 - 12 * 3600000);
      const event = Astronomy.SearchRiseSet(body, observer, expected[boundary], searchStart, 1, 0);
      if (!event) continue;
      const eventDate = event.date;
      const eventIllumination = Astronomy.Illumination(body, eventDate);
      series.push({
        entry: entry.id,
        boundaryAnchor: boundary,
        dayOffset,
        localEvent: expected[boundary] === 1 ? "rise" : "set",
        eventUTC: eventDate.toISOString(),
        sunAltitudeDegrees: round(getSunAltitude(eventDate, observer), 5),
        planetAltitudeDegrees: round(getPlanetAltitude(body, eventDate, observer), 5),
        apparentElongationDegrees: round(Astronomy.AngleFromSun(body, eventDate), 5),
        apparentMagnitude: round(eventIllumination.mag, 4),
        illuminatedFraction: round(eventIllumination.phase_fraction, 6)
      });
    }
  }
  rows.push({ entry: entry.id, boundarySeries: series });
}

console.log(JSON.stringify({
  title: "Independent Pithoragarh Venus boundary twilight profile",
  sourceId: SOURCE_ID,
  boundaryCount: rows.filter(row => row.boundary && !row.boundarySeries).length,
  nearbyRiseSetSampleCount: rows.reduce((sum, row) => sum + (row.boundarySeries?.length || 0), 0),
  interpretation: "Diagnostic only. Planetary horizon event time is checked separately; Sun altitude, elongation, magnitude and phase are candidate event-selection observables, not fitted production thresholds. Source observer coordinates remain undisclosed.",
  rows
}, null, 2));
