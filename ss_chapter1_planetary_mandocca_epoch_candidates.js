/**
 * Research-only reconstruction of planetary mandocca epoch candidates.
 *
 * Evidence chain:
 * 1. Sūrya-siddhānta I.41–42 supplies eastward apsis revolutions per kalpa.
 * 2. Burgess (1860), table following I.44, reports the model's 1850 apsis
 *    longitudes in a vernal-equinox/tropical frame:
 *      Sun 95°04′, Venus 97°39′, Jupiter 189°09′.
 * 3. A secondary-literature Kali-epoch solar-mandocca candidate is
 *    77°07′48″. Using that value and the source Sun revolution rate calibrates
 *    the common frame offset at the 1850 table epoch.
 * 4. The same offset and each planet's own source revolution count yield
 *    candidate sidereal epoch longitudes for Venus and Jupiter.
 *
 * This is an explicit reconstruction, not an independent canonical proof:
 * the common frame offset depends on the secondary solar anchor. The resulting
 * Venus/Jupiter candidates are checked against a separate worked-model table
 * at a historical date, but that comparison is a validation check, not proof
 * that the solar anchor or historical frame is uniquely correct.
 *
 * No production code imports this module.
 */

import { SS_CHAPTER1_AHARGANA_ANCHOR } from "./ss_chapter1_ahargana_anchor.js";
import { chapter1MeanPlanetaryMandoccaFromElapsedDays } from "./ss_chapter1_mean_planetary_mandocca.js";

const KALPA_DAYS = 1000 * 1577917828;
const KALI_EPOCH_LOCAL_MEAN_JD = 588465.5;
const BURGESS_TABLE_YEAR = 1850;
const BURGESS_TABLE_JD = 2396758.5; // 1850-01-01, Julian-day convention used by this reconstruction
const ELAPSED_DAYS_TO_TABLE = BURGESS_TABLE_JD - KALI_EPOCH_LOCAL_MEAN_JD;

const REVOLUTIONS_PER_KALPA = Object.freeze({
  Sun: 387,
  Venus: 535,
  Jupiter: 900
});

const BURGESS_1850_TROPICAL_LONGITUDE_DEG = Object.freeze({
  Sun: 95 + 4 / 60,
  Venus: 97 + 39 / 60,
  Jupiter: 189 + 9 / 60
});

const SOLAR_KALI_EPOCH_MANDOCCA_DEG = 77 + 7 / 60 + 48 / 3600;

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function meanApsisMotionSinceKaliEpoch(planet, elapsedDays) {
  const revolutions = REVOLUTIONS_PER_KALPA[planet];
  return revolutions * 360 * elapsedDays / KALPA_DAYS;
}

/**
 * Reconstruct Venus/Jupiter epoch anchors by removing the source-rate motion
 * from Burgess's 1850 tropical table and using the solar anchor to infer the
 * common tropical-to-classical-sidereal frame offset.
 */
export function chapter1PlanetaryMandoccaEpochCandidates() {
  const solarMotionToTable = meanApsisMotionSinceKaliEpoch("Sun", ELAPSED_DAYS_TO_TABLE);
  const inferredFrameOffsetDeg =
    BURGESS_1850_TROPICAL_LONGITUDE_DEG.Sun -
    SOLAR_KALI_EPOCH_MANDOCCA_DEG -
    solarMotionToTable;

  const candidates = {};
  for (const planet of ["Venus", "Jupiter"]) {
    const motionToTable = meanApsisMotionSinceKaliEpoch(planet, ELAPSED_DAYS_TO_TABLE);
    const epochLongitudeDeg = normalizeDegrees(
      BURGESS_1850_TROPICAL_LONGITUDE_DEG[planet] -
      inferredFrameOffsetDeg -
      motionToTable
    );
    candidates[planet] = Object.freeze({
      planet,
      kaliEpochLongitudeDeg: epochLongitudeDeg,
      revolutionsPerKalpa: REVOLUTIONS_PER_KALPA[planet],
      burgess1850TropicalLongitudeDeg: BURGESS_1850_TROPICAL_LONGITUDE_DEG[planet],
      motionFromKaliEpochTo1850Deg: motionToTable,
      inferredCommonFrameOffsetDeg: inferredFrameOffsetDeg,
      tableYear: BURGESS_TABLE_YEAR,
      source: "Sūrya-siddhānta I.41–42; Burgess 1860 table after I.44; secondary solar epoch anchor",
      status: "research-only candidate; frame offset is calibrated from the solar epoch anchor"
    });
  }

  return Object.freeze({
    elapsedDaysToTable: ELAPSED_DAYS_TO_TABLE,
    tableJulianDay: BURGESS_TABLE_JD,
    solarKaliEpochMandoccaDeg: SOLAR_KALI_EPOCH_MANDOCCA_DEG,
    solarMotionToTableDeg: solarMotionToTable,
    inferredCommonFrameOffsetDeg: inferredFrameOffsetDeg,
    candidates: Object.freeze(candidates),
    status: "research-only; do not use in production without independent edition/frame adjudication"
  });
}

/** Evaluate the candidate mandocca at an explicit creation-era ahargana. */
export function chapter1CandidateMandoccaAtAhargana({ planet, ahargana }) {
  if (planet !== "Venus" && planet !== "Jupiter") {
    throw new RangeError("Candidate anchors currently exist only for Venus and Jupiter.");
  }
  if (!Number.isFinite(ahargana)) {
    throw new TypeError("ahargana must be a finite creation-era day count.");
  }
  const reconstruction = chapter1PlanetaryMandoccaEpochCandidates();
  const candidate = reconstruction.candidates[planet];
  const elapsedDaysSinceKaliEpoch =
    ahargana - Number(SS_CHAPTER1_AHARGANA_ANCHOR.aharganaAtKaliEpochMidnight);
  const evaluated = chapter1MeanPlanetaryMandoccaFromElapsedDays({
    planet,
    elapsedDaysSinceKaliEpoch,
    kaliEpochLongitudeDeg: candidate.kaliEpochLongitudeDeg
  });
  return Object.freeze({
    ...evaluated,
    candidateProvenance: candidate.source,
    candidateStatus: candidate.status,
    frameOffsetDeg: candidate.inferredCommonFrameOffsetDeg
  });
}

export function runChapter1PlanetaryMandoccaEpochCandidateTests() {
  const tests = [];
  const close = (a, b, tolerance = 1e-8) =>
    Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
  const reconstruction = chapter1PlanetaryMandoccaEpochCandidates();

  tests.push({
    name: "Burgess 1850 table fixture is explicit and has the expected epoch interval",
    passed: close(reconstruction.elapsedDaysToTable, 1808293) &&
      close(reconstruction.candidates.Venus.burgess1850TropicalLongitudeDeg, 97.65) &&
      close(reconstruction.candidates.Jupiter.burgess1850TropicalLongitudeDeg, 189.15)
  });

  tests.push({
    name: "Solar anchor calibrates the common frame offset without replacing source revolution counts",
    passed: close(
      BURGESS_1850_TROPICAL_LONGITUDE_DEG.Sun -
      reconstruction.inferredCommonFrameOffsetDeg -
      reconstruction.solarMotionToTableDeg,
      SOLAR_KALI_EPOCH_MANDOCCA_DEG
    ) &&
      reconstruction.candidates.Venus.revolutionsPerKalpa === 535 &&
      reconstruction.candidates.Jupiter.revolutionsPerKalpa === 900
  });

  tests.push({
    name: "Reconstructed epoch anchors remain normalized and retain explicit provenance",
    passed: ["Venus", "Jupiter"].every(planet => {
      const candidate = reconstruction.candidates[planet];
      return candidate.kaliEpochLongitudeDeg >= 0 &&
        candidate.kaliEpochLongitudeDeg < 360 &&
        candidate.status.includes("research-only") &&
        Number.isFinite(candidate.inferredCommonFrameOffsetDeg);
    })
  });

  // Independent worked-model control from R. Kane Tech's published example:
  // Ahargana 714403972030; Venus mandocca 79.85450°, Jupiter 171.34402°.
  // The candidate reconstruction must reproduce these rounded values within
  // 0.02° without using modern Asta/Udaya event dates as fitting targets.
  const historicalAhargana = 714403972030;
  const venus = chapter1CandidateMandoccaAtAhargana({
    planet: "Venus", ahargana: historicalAhargana
  });
  const jupiter = chapter1CandidateMandoccaAtAhargana({
    planet: "Jupiter", ahargana: historicalAhargana
  });
  tests.push({
    name: "Venus candidate agrees within 0.02° with independent published historical worked-model control",
    passed: Math.abs(venus.meanMandoccaLongitudeDeg - 79.85450) <= 0.02
  });
  tests.push({
    name: "Jupiter candidate agrees within 0.02° with independent published historical worked-model control",
    passed: Math.abs(jupiter.meanMandoccaLongitudeDeg - 171.34402) <= 0.02
  });

  let rejectedUnknown = false;
  try {
    chapter1CandidateMandoccaAtAhargana({ planet: "Mars", ahargana: historicalAhargana });
  } catch (error) {
    rejectedUnknown = error instanceof RangeError;
  }
  tests.push({
    name: "Unreconstructed planet anchors are rejected instead of silently fabricated",
    passed: rejectedUnknown
  });

  return {
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed),
    candidateEpochLongitudesDeg: {
      Venus: reconstruction.candidates.Venus.kaliEpochLongitudeDeg,
      Jupiter: reconstruction.candidates.Jupiter.kaliEpochLongitudeDeg
    },
    inferredCommonFrameOffsetDeg: reconstruction.inferredCommonFrameOffsetDeg,
    note: "Historical control agreement is supportive but not independent proof of the solar anchor/frame conversion. Keep this candidate layer research-only."
  };
}
