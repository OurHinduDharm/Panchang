/**
 * Same-city Guru/Shukra holdout audit using city-centre DEM observer profiles.
 * Pithoragarh retains the project's fixed reference observer (29.5828,80.2182,
 * 1650 m) so its historical back-test remains directly comparable.
 *
 * Usage:
 * node research/multi-city-planetary-backtest.mjs --profiles city-observer-profiles.json --output multi-city-planetary-backtest.json
 *
 * Research-only. No threshold is borrowed across cities or planets.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Astronomy from "astronomy-engine";
import { getPlanetVisibilitySample } from "../planetary-heliacal-ephemeris.mjs";
import {
  scanPlanetHorizonEvents,
  findHorizonTwilightThresholdCrossings
} from "../planetary-city-horizon-threshold.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "data/drik-planetary-reference-2024-2027.json");
const PROFILE_ARG = process.argv.indexOf("--profiles");
if (PROFILE_ARG < 0 || !process.argv[PROFILE_ARG + 1]) {
  throw new Error("--profiles city-observer-profiles.json is required");
}
const profiles = JSON.parse(fs.readFileSync(process.argv[PROFILE_ARG + 1], "utf8")).profiles;
const reference = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const PLANETS = ["Jupiter", "Venus"];
const PITHORAGARH = Object.freeze({
  latitude: 29.5828, longitude: 80.2182, height: 1650,
  source: "project-verified-reference-profile"
});

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function nearestHorizonEvent(planet, observer, referenceMs) {
  const start = new Date(referenceMs - 12 * 60 * 60_000);
  const body = Astronomy.Body[planet];
  const events = [1, -1].map(direction => {
    const found = Astronomy.SearchRiseSet(body, observer, direction, start, 1.5);
    return found?.date ? {
      type: direction > 0 ? "rise" : "set",
      instant: found.date.toISOString(),
      errorMinutes: (found.date.getTime() - referenceMs) / 60_000
    } : null;
  }).filter(Boolean);
  events.sort((a, b) => Math.abs(a.errorMinutes) - Math.abs(b.errorMinutes));
  return events[0] || null;
}

function nearestCrossing(crossings, eventType, referenceMs) {
  return crossings.filter(item => item.type === eventType).map(item => ({
    ...item,
    errorMinutes: (Date.parse(item.instant) - referenceMs) / 60_000
  })).sort((a, b) => Math.abs(a.errorMinutes) - Math.abs(b.errorMinutes))[0] || null;
}

const profileById = new Map(profiles.map(profile => [profile.geonameId, profile]));
const cityReports = [];

for (const profile of profiles) {
  const observerProfile = profile.geonameId === "1259503"
    ? { ...PITHORAGARH, city: profile.city, state: profile.state,
        geonameId: profile.geonameId, elevationMeters: PITHORAGARH.height }
    : { latitude: profile.latitude, longitude: profile.longitude,
        height: profile.elevationMeters, source: "Open-Meteo-Copernicus-DEM-city-centre" };
  const observer = new Astronomy.Observer(
    observerProfile.latitude, observerProfile.longitude, observerProfile.height
  );
  const rows = reference.windows.filter(row =>
    row.acceptanceEligible === true &&
    row.sourceCityId === profile.geonameId &&
    PLANETS.includes(row.planet)
  );
  const observations = [];

  for (const row of rows) {
    for (const boundary of ["astaStart", "astaEnd"]) {
      const source = row.boundaries?.[boundary];
      if (!source?.normalizedUtcInstant) continue;
      const referenceMs = Date.parse(source.normalizedUtcInstant);
      const horizon = nearestHorizonEvent(row.planet, observer, referenceMs);
      const geometry = getPlanetVisibilitySample({
        astronomy: Astronomy, planet: row.planet, observer,
        instant: source.normalizedUtcInstant
      });
      observations.push({
        sourceWindowId: row.id,
        city: profile.city,
        geonameId: profile.geonameId,
        planet: row.planet,
        sourceYear: row.sourcePageYear,
        boundary,
        sourceLocalDateTime: source.normalizedLocalDateTime,
        sourceUtcInstant: source.normalizedUtcInstant,
        horizonEventType: horizon?.type ?? null,
        horizonEventErrorMinutes: horizon?.errorMinutes ?? null,
        sunDepressionDeg: -geometry.sunAltitudeDeg,
        planetAltitudeDeg: geometry.objectAltitudeDeg,
        planetAzimuthDeg: geometry.objectAzimuthDeg
      });
    }
  }

  const training = {};
  for (const planet of PLANETS) {
    for (const boundary of ["astaStart", "astaEnd"]) {
      for (const eventType of ["rise", "set"]) {
        const values = observations.filter(item =>
          item.planet === planet && item.boundary === boundary &&
          item.sourceYear <= 2025 && item.horizonEventType === eventType
        ).map(item => item.sunDepressionDeg);
        if (values.length >= 2) {
          training[planet + ":" + boundary + ":" + eventType] = {
            sampleCount: values.length,
            thresholdDepressionDeg: median(values),
            trainingMinDeg: Math.min(...values),
            trainingMaxDeg: Math.max(...values),
            trainingYears: [...new Set(observations.filter(item =>
              item.planet === planet && item.boundary === boundary &&
              item.sourceYear <= 2025 && item.horizonEventType === eventType
            ).map(item => item.sourceYear))].sort()
          };
        }
      }
    }
  }

  const holdout = [];
  for (const planet of PLANETS) {
    const horizonSeries = scanPlanetHorizonEvents({
      astronomy: Astronomy, planet, observer,
      start: "2026-01-01T00:00:00.000Z",
      end: "2028-01-01T00:00:00.000Z"
    });
    for (const item of observations.filter(row => row.planet === planet && row.sourceYear >= 2026)) {
      const key = item.planet + ":" + item.boundary + ":" + item.horizonEventType;
      const model = training[key];
      const predicted = model ? nearestCrossing(
        findHorizonTwilightThresholdCrossings({
          horizonSeries,
          thresholdDepressionDeg: model.thresholdDepressionDeg,
          eventType: item.horizonEventType
        }),
        item.horizonEventType,
        Date.parse(item.sourceUtcInstant)
      ) : null;
      holdout.push({
        ...item,
        training: model || null,
        prediction: predicted,
        within15Minutes: predicted ? Math.abs(predicted.errorMinutes) <= 15 : false,
        within1Hour: predicted ? Math.abs(predicted.errorMinutes) <= 60 : false,
        within1Day: predicted ? Math.abs(predicted.errorMinutes) <= 1440 : false,
        within3Days: predicted ? Math.abs(predicted.errorMinutes) <= 4320 : false,
        status: !model ? "insufficient-same-city-training-samples"
          : !predicted ? "no-matching-event-branch"
          : Math.abs(predicted.errorMinutes) <= 1440 ? "within-one-day"
          : "holdout-mismatch-review-required"
      });
    }
  }

  cityReports.push({
    city: profile.city,
    state: profile.state,
    geonameId: profile.geonameId,
    calculationObserver: {
      latitude: observerProfile.latitude,
      longitude: observerProfile.longitude,
      elevationMeters: observerProfile.elevationMeters,
      source: observerProfile.source,
      profileElevationFromCityCentreDem: profile.elevationMeters,
      profileCoordinateSource: profile.coordinateSource,
      profileElevationSource: profile.elevationSource,
      elevationResolutionMeters: profile.elevationResolutionMeters
    },
    sourceWindows: rows.length,
    sourceBoundaries: observations.length,
    trainingYears: profile.geonameId === "1259503" ? "available 2021-2025" : "2024-2025",
    holdoutYears: "2026-2027",
    trainingThresholds: training,
    holdoutSummary: {
      records: holdout.length,
      predictions: holdout.filter(item => item.prediction).length,
      within15Minutes: holdout.filter(item => item.within15Minutes).length,
      within1Hour: holdout.filter(item => item.within1Hour).length,
      within1Day: holdout.filter(item => item.within1Day).length,
      within3Days: holdout.filter(item => item.within3Days).length,
      unresolved: holdout.filter(item => item.status !== "within-one-day").length
    },
    holdout
  });
}

const report = {
  schemaVersion: 1,
  model: "same-city-rise-set-sun-depression-threshold-backtest-v1",
  sourceDataset: "data/drik-planetary-reference-2024-2027.json",
  observerProfiles: "city-observer-profiles.json",
  trainingPolicy: "same city + same planet + same boundary + same rise/set branch; years through 2025",
  holdoutPolicy: "2026-2027; no holdout threshold tuning",
  cities: cityReports,
  publicationEligible: false,
  interpretation: "This report tests independent city-centre observer profiles against city-labelled Drik references. Drik does not disclose exact observer coordinates/elevation. Pithoragarh retains the project's fixed 1650 m observer. Results are research-only and must not be pooled across cities or published as verified times."
};
const outputIndex = process.argv.indexOf("--output");
if (outputIndex >= 0 && process.argv[outputIndex + 1]) {
  fs.writeFileSync(process.argv[outputIndex + 1], JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
