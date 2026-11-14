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
import {
  findPlanetConjunctions,
  expectedBoundaryEventType,
  pairCandidatesAroundConjunctions
} from "./planetary-conjunction-association.mjs";
import { leaveOneYearOutThresholdAudit } from "./threshold-crossvalidation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "data/drik-planetary-reference-2024-2027.json");
const PROFILE_ARG = process.argv.indexOf("--profiles");
if (PROFILE_ARG < 0 || !process.argv[PROFILE_ARG + 1]) {
  throw new Error("--profiles city-observer-profiles.json is required");
}
const profiles = JSON.parse(fs.readFileSync(process.argv[PROFILE_ARG + 1], "utf8")).profiles;
const baseReference = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const supplementalPath = path.join(ROOT, "research/data/multi-city-guru-shukra-history-2021-2023.json");
const supplemental = JSON.parse(fs.readFileSync(supplementalPath, "utf8"));
if (supplemental.identityAndBoundaryVerifiedPages !== 24 ||
    supplemental.verifiedWindows !== 28 ||
    supplemental.windows.length !== 28 ||
    supplemental.publicationEligible !== false) {
  throw new Error("Supplemental 2021-2023 city capture failed its fixed provenance gate");
}
const reference = {
  ...baseReference,
  windows: [...baseReference.windows, ...supplemental.windows]
};
const sourceKeys = new Set();
for (const row of reference.windows) {
  const key = [row.sourceCityId, row.planet, row.boundaries.astaStart.normalizedUtcInstant,
    row.boundaries.astaEnd.normalizedUtcInstant].join("|");
  if (sourceKeys.has(key)) throw new Error("Duplicate city/planet source window: " + key);
  sourceKeys.add(key);
}
const PLANETS = ["Jupiter", "Venus"];
const PITHORAGARH = Object.freeze({
  latitude: 29.5828, longitude: 80.2182, height: 1650,
  source: "project-verified-reference-profile"
});
const conjunctionsByPlanet = new Map(PLANETS.map(planet => [planet,
  findPlanetConjunctions({
    astronomy: Astronomy, planet,
    start: "2020-01-01T00:00:00.000Z",
    end: "2030-01-01T00:00:00.000Z"
  })
]));

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

function conjunctionForWindow(row) {
  const startMs = Date.parse(row.boundaries?.astaStart?.normalizedUtcInstant);
  const endMs = Date.parse(row.boundaries?.astaEnd?.normalizedUtcInstant);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return null;
  const matches = (conjunctionsByPlanet.get(row.planet) || []).filter(event => {
    const instant = Date.parse(event.instant);
    return instant > startMs && instant < endMs;
  });
  return matches.length === 1 ? matches[0] : null;
}

function expectedEventType(planet, conjunctionKind, boundary) {
  return expectedBoundaryEventType(planet, conjunctionKind, boundary);
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
  const rowConjunctions = new Map(rows.map(row => [row.id, conjunctionForWindow(row)]));
  const observations = [];

  for (const row of rows) {
    for (const boundary of ["astaStart", "astaEnd"]) {
      const source = row.boundaries?.[boundary];
      if (!source?.normalizedUtcInstant) continue;
      const referenceMs = Date.parse(source.normalizedUtcInstant);
      const horizon = nearestHorizonEvent(row.planet, observer, referenceMs);
      const conjunction = rowConjunctions.get(row.id);
      const expectedHorizonEventType = conjunction
        ? expectedEventType(row.planet, conjunction.kind, boundary)
        : null;
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
        conjunctionKind: conjunction?.kind ?? null,
        conjunctionInstant: conjunction?.instant ?? null,
        expectedHorizonEventType,
        horizonEventType: horizon?.type ?? null,
        branchMatchesConjunction: Boolean(
          conjunction && expectedHorizonEventType &&
          horizon?.type === expectedHorizonEventType
        ),
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
          item.sourceYear <= 2025 &&
          item.branchMatchesConjunction &&
          item.expectedHorizonEventType === eventType
        ).map(item => item.sunDepressionDeg);
        if (values.length >= 2) {
          training[planet + ":" + boundary + ":" + eventType] = {
            sampleCount: values.length,
            thresholdDepressionDeg: median(values),
            trainingMinDeg: Math.min(...values),
            trainingMaxDeg: Math.max(...values),
            trainingYears: [...new Set(observations.filter(item =>
              item.planet === planet && item.boundary === boundary &&
              item.sourceYear <= 2025 &&
              item.branchMatchesConjunction &&
              item.expectedHorizonEventType === eventType
            ).map(item => item.sourceYear))].sort()
          };
        }
      }
    }
  }

  const leaveOneYearOut = leaveOneYearOutThresholdAudit(observations);
  const holdout = [];
  const pairingDiagnostics = {};
  for (const planet of PLANETS) {
    const horizonSeries = scanPlanetHorizonEvents({
      astronomy: Astronomy, planet, observer,
      start: "2026-01-01T00:00:00.000Z",
      end: "2028-01-01T00:00:00.000Z"
    });

    // Generate every threshold crossing without consulting any reference date.
    const rawCandidates = [];
    for (const boundary of ["astaStart", "astaEnd"]) {
      for (const eventType of ["rise", "set"]) {
        const model = training[planet + ":" + boundary + ":" + eventType];
        if (!model) continue;
        const crossings = findHorizonTwilightThresholdCrossings({
          horizonSeries,
          thresholdDepressionDeg: model.thresholdDepressionDeg,
          eventType
        });
        rawCandidates.push(...crossings.map(crossing => ({
          ...crossing,
          boundary,
          eventType
        })));
      }
    }

    // Pair each candidate window using conjunction family, side and expected
    // horizon direction. Reference timestamps are not involved in selection.
    const holdoutConjunctions = (conjunctionsByPlanet.get(planet) || []).filter(event => {
      const instant = Date.parse(event.instant);
      return instant >= Date.parse("2026-01-01T00:00:00.000Z") &&
        instant < Date.parse("2028-01-01T00:00:00.000Z");
    });
    const paired = pairCandidatesAroundConjunctions({
      planet,
      candidates: rawCandidates,
      conjunctions: holdoutConjunctions,
      maxDistanceDays: 90
    });
    pairingDiagnostics[planet] = {
      rawThresholdCandidates: rawCandidates.length,
      pairedConjunctionWindows: paired.windows.length,
      rejectedConjunctions: paired.rejectedConjunctions.length
    };

    for (const item of observations.filter(row =>
      row.planet === planet && row.sourceYear >= 2026
    )) {
      const key = item.planet + ":" + item.boundary + ":" + item.expectedHorizonEventType;
      const model = item.branchMatchesConjunction ? training[key] : null;
      const pairedWindow = item.conjunctionInstant
        ? paired.windows.find(window =>
            window.conjunctionInstant === item.conjunctionInstant &&
            window.conjunctionKind === item.conjunctionKind
          )
        : null;
      const predictedInstant = pairedWindow
        ? (item.boundary === "astaStart" ? pairedWindow.astaStart : pairedWindow.udaya)
        : null;
      const predictedCandidate = predictedInstant
        ? rawCandidates.find(candidate =>
            candidate.boundary === item.boundary && candidate.instant === predictedInstant
          )
        : null;
      const predicted = predictedInstant ? {
        ...(predictedCandidate || {}),
        type: item.boundary === "astaStart"
          ? pairedWindow.astaStartEventType : pairedWindow.udayaEventType,
        instant: predictedInstant,
        conjunctionKind: pairedWindow.conjunctionKind,
        conjunctionInstant: pairedWindow.conjunctionInstant,
        daysFromConjunction: item.boundary === "astaStart"
          ? -pairedWindow.daysBeforeConjunction : pairedWindow.daysAfterConjunction,
        errorMinutes: (Date.parse(predictedInstant) - Date.parse(item.sourceUtcInstant)) / 60_000
      } : null;
      holdout.push({
        ...item,
        training: model || null,
        prediction: predicted,
        predictionSelection: "conjunction-paired-without-reference-date-lookahead",
        pairedWindowFound: Boolean(pairedWindow),
        within15Minutes: predicted ? Math.abs(predicted.errorMinutes) <= 15 : false,
        within1Hour: predicted ? Math.abs(predicted.errorMinutes) <= 60 : false,
        within1Day: predicted ? Math.abs(predicted.errorMinutes) <= 1440 : false,
        within3Days: predicted ? Math.abs(predicted.errorMinutes) <= 4320 : false,
        status: !item.conjunctionInstant ? "no-unique-conjunction-in-source-window"
          : !item.branchMatchesConjunction ? "source-horizon-branch-does-not-match-conjunction"
          : !model ? "insufficient-same-city-training-samples"
          : !pairedWindow ? "no-complete-conjunction-paired-window"
          : predicted && Math.abs(predicted.errorMinutes) <= 15 ? "within-15-minutes"
          : predicted && Math.abs(predicted.errorMinutes) <= 60 ? "within-1-hour"
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
    trainingYears: "available 2021-2025",
    holdoutYears: "2026-2027",
    trainingThresholds: training,
    leaveOneYearOutThresholdAudit: leaveOneYearOut,
    pairingDiagnostics,
    holdoutSummary: {
      records: holdout.length,
      predictions: holdout.filter(item => item.prediction).length,
      within15Minutes: holdout.filter(item => item.within15Minutes).length,
      within1Hour: holdout.filter(item => item.within1Hour).length,
      within1Day: holdout.filter(item => item.within1Day).length,
      within3Days: holdout.filter(item => item.within3Days).length,
      unresolved: holdout.filter(item => !item.prediction).length,
      mismatchReviewRequired: holdout.filter(item => item.prediction && !item.within1Hour).length,
      conjunctionUnresolved: holdout.filter(item => !item.conjunctionInstant).length,
      sourceBranchMismatches: holdout.filter(item =>
        item.conjunctionInstant && !item.branchMatchesConjunction
      ).length,
      branchMatchedRecords: holdout.filter(item => item.branchMatchesConjunction).length
    },
    holdout
  });
}

const report = {
  schemaVersion: 2,
  model: "same-city-conjunction-paired-rise-set-sun-depression-threshold-backtest-v3",
  sourceDataset: ["data/drik-planetary-reference-2024-2027.json", "research/data/multi-city-guru-shukra-history-2021-2023.json"],
  observerProfiles: "city-observer-profiles.json",
  trainingPolicy: "same city + same planet + same boundary + conjunction-specific expected rise/set branch; years 2021-2025; source records with unresolved/mismatched conjunction branches are excluded; whole-year leave-one-out threshold stability is reported separately",
  holdoutPolicy: "2026-2027; no holdout threshold tuning; candidates are generated across the fixed horizon series and paired to conjunctions using branch and side only; reference timestamps are used only after selection to measure error",
  cities: cityReports,
  publicationEligible: false,
  interpretation: "This report tests independent city-centre observer profiles against city-labelled Drik references. Every source window must contain exactly one computed conjunction; expected rise/set direction is derived from planet and conjunction family. Training excludes source boundaries whose nearest physical horizon event conflicts with that branch. Predictions are generated from the fixed 2026-2028 horizon series and paired to conjunctions by correct boundary, horizon direction and before/after side; source reference timestamps are not used to select candidates, preventing nearest-reference look-ahead leakage. Drik does not disclose exact observer coordinates/elevation. Pithoragarh retains the project's fixed 1650 m observer. Results are research-only and must not be pooled across cities or published as verified times."
};
const outputIndex = process.argv.indexOf("--output");
if (outputIndex >= 0 && process.argv[outputIndex + 1]) {
  fs.writeFileSync(process.argv[outputIndex + 1], JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
