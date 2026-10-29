/**
 * Research-only same-date comparison ledger for Sūrya-siddhānta II.47–51
 * daily-motion candidates.
 *
 * Reference control: Vidhyamitra's 2026-10-11 apparent-noon Ujjayinī table
 * (Burgess/no-bīja model): Sun +59.5, Venus −38.4, Jupiter +9.9 arcmin/day.
 *
 * The ahargana below advances the repository's 2026-10-08 source-anchored
 * reference by three savana days. It is a candidate alignment, not proof that
 * apparent noon and local-mean noon are identical. The output is a comparison
 * ledger only; it does not feed Chapter IX or production code.
 */
import {
  chapter2PlanetaryDailyMotionAtAhargana
} from "./ss_chapter2_planetary_daily_motion_candidate.js";

export const CHAPTER2_MOTION_LEDGER_FIXTURE = Object.freeze({
  date: "2026-10-11",
  instantConvention: "Vidhyamitra apparent noon, Ujjayinī; compared with source-anchor-derived ahargana candidate",
  aharganaCandidate: 714404169486.5,
  source: "Vidhyamitra Sūrya-siddhānta ledger, 2026-10-11; Burgess/no-bīja",
  referenceRatesArcminPerDay: Object.freeze({
    Sun: 59.5,
    Venus: -38.4,
    Jupiter: 9.9
  }),
  status: "research-only comparison; not a canonical epoch/frame ruling"
});

export function runChapter2DailyMotionLedger() {
  const rows = Object.entries(CHAPTER2_MOTION_LEDGER_FIXTURE.referenceRatesArcminPerDay)
    .map(([planet, referenceRateArcminPerDay]) => {
      const result = chapter2PlanetaryDailyMotionAtAhargana({
        planet,
        ahargana: CHAPTER2_MOTION_LEDGER_FIXTURE.aharganaCandidate
      });
      return Object.freeze({
        planet,
        referenceRateArcminPerDay,
        sourceCandidateRateArcminPerDay: result.sourceDailyMotionArcminPerDay,
        alternateRadiusCandidateRateArcminPerDay:
          result.alternateSourceDailyMotionArcminPerDay,
        bhujantaraCorrectedFiniteDifferenceArcminPerDay: result.finiteDifferenceArcminPerDay,
        sourceMinusBhujantaraCorrectedFiniteDifferenceArcminPerDay:
          result.sourceMinusFiniteDifferenceArcminPerDay,
        uncorrectedTruePlaceFiniteDifferenceArcminPerDay:
          result.uncorrectedFiniteDifferenceArcminPerDay,
        sourceMinusUncorrectedTruePlaceFiniteDifferenceArcminPerDay:
          result.sourceMinusUncorrectedFiniteDifferenceArcminPerDay,
        sourceMinusReferenceArcminPerDay:
          result.sourceDailyMotionArcminPerDay - referenceRateArcminPerDay,
        alternateMinusReferenceArcminPerDay:
          Number.isFinite(result.alternateSourceDailyMotionArcminPerDay)
            ? result.alternateSourceDailyMotionArcminPerDay - referenceRateArcminPerDay
            : null,
        sourceMotionDirection: result.sourceMotionDirection,
        meanLongitudeDeg: result.meanLongitudeDeg,
        meanMandoccaLongitudeDeg: result.meanMandoccaLongitudeDeg,
        mandaKendraDeg: result.mandaKendraDeg,
        correctedMandaEpicycleDeg: result.correctedMandaEpicycleDeg,
        sineBracket: result.sineBracket,
        variableHypotenuse: result.variableHypotenuse,
        radiusConvention: result.sighraMotion?.radiusConvention ?? "Sun: solar-manda path"
      });
    });

  // Inspect a short neighbourhood to determine whether source-rate versus
  // same-model finite-difference disagreement is a one-date anomaly or persists.
  // These are independent evaluations of the same research candidate, not
  // additional observations or a production event-time solver.
  const sensitivityOffsetsDays = [-2, -1, 0, 1, 2];
  const sensitivityRows = sensitivityOffsetsDays.flatMap(offsetDays =>
    Object.entries(CHAPTER2_MOTION_LEDGER_FIXTURE.referenceRatesArcminPerDay)
      .map(([planet, referenceRateArcminPerDay]) => {
        const result = chapter2PlanetaryDailyMotionAtAhargana({
          planet,
          ahargana: CHAPTER2_MOTION_LEDGER_FIXTURE.aharganaCandidate + offsetDays
        });
        const sourceMinusFiniteDifferenceArcminPerDay =
          result.sourceDailyMotionArcminPerDay - result.finiteDifferenceArcminPerDay;
        return Object.freeze({
          offsetDays,
          planet,
          referenceRateArcminPerDay,
          sourceCandidateRateArcminPerDay: result.sourceDailyMotionArcminPerDay,
          bhujantaraCorrectedFiniteDifferenceArcminPerDay: result.finiteDifferenceArcminPerDay,
          sourceMinusBhujantaraCorrectedFiniteDifferenceArcminPerDay:
            sourceMinusFiniteDifferenceArcminPerDay,
          uncorrectedTruePlaceFiniteDifferenceArcminPerDay:
            result.uncorrectedFiniteDifferenceArcminPerDay,
          sourceMinusUncorrectedTruePlaceFiniteDifferenceArcminPerDay:
            result.sourceMinusUncorrectedFiniteDifferenceArcminPerDay,
          correctedRelativeDifferencePercent:
            Math.abs(result.finiteDifferenceArcminPerDay) > 1e-12
              ? sourceMinusFiniteDifferenceArcminPerDay /
                result.finiteDifferenceArcminPerDay * 100
              : null,
          uncorrectedRelativeDifferencePercent:
            Math.abs(result.uncorrectedFiniteDifferenceArcminPerDay) > 1e-12
              ? result.sourceMinusUncorrectedFiniteDifferenceArcminPerDay /
                result.uncorrectedFiniteDifferenceArcminPerDay * 100
              : null
        });
      })
  );

  const allRatesFinite = rows.every(row =>
    Number.isFinite(row.sourceCandidateRateArcminPerDay) &&
    Number.isFinite(row.bhujantaraCorrectedFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.uncorrectedTruePlaceFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.sourceMinusBhujantaraCorrectedFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.sourceMinusUncorrectedTruePlaceFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.sourceMinusReferenceArcminPerDay) &&
    (row.planet === "Sun" ||
      Number.isFinite(row.alternateRadiusCandidateRateArcminPerDay))
  ) && sensitivityRows.every(row =>
    Number.isFinite(row.sourceCandidateRateArcminPerDay) &&
    Number.isFinite(row.bhujantaraCorrectedFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.uncorrectedTruePlaceFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.sourceMinusBhujantaraCorrectedFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.sourceMinusUncorrectedTruePlaceFiniteDifferenceArcminPerDay) &&
    Number.isFinite(row.correctedRelativeDifferencePercent) &&
    Number.isFinite(row.uncorrectedRelativeDifferencePercent)
  );

  return Object.freeze({
    fixture: CHAPTER2_MOTION_LEDGER_FIXTURE,
    rows: Object.freeze(rows),
    sensitivityOffsetsDays: Object.freeze(sensitivityOffsetsDays),
    sensitivityRows: Object.freeze(sensitivityRows),
    allRatesFinite,
    note: "Do not select a motion convention from closeness alone. The source epoch/frame and apparent-noon versus mean-time alignment remain unresolved; reference rates are rounded external controls, not tuning targets. The neighbourhood table tests whether source-rate versus same-model finite-difference mismatch persists across nearby ahargana values."
  });
}

export function runChapter2DailyMotionLedgerTests() {
  const ledger = runChapter2DailyMotionLedger();
  const tests = [
    {
      name: "Same-date source-motion ledger returns Sun, Venus, and Jupiter rows",
      passed: ledger.rows.map(row => row.planet).join(",") === "Sun,Venus,Jupiter"
    },
    {
      name: "Source, pre-II.46, and post-II.46 rates remain finite and separately labelled",
      passed: ledger.allRatesFinite &&
        ledger.rows.every(row =>
          Number.isFinite(row.sourceCandidateRateArcminPerDay) &&
          Number.isFinite(row.sameModelFiniteDifferenceArcminPerDay)
        )
    },
    {
      name: "Retrograde Venus reference sign is preserved",
      passed: ledger.rows.find(row => row.planet === "Venus")?.referenceRateArcminPerDay < 0
    },
    {
      name: "Five-day neighbourhood keeps source-rate and finite-difference rates separate",
      passed: ledger.sensitivityRows.length === 15 &&
        ledger.sensitivityOffsetsDays.join(",") === "-2,-1,0,1,2" &&
        ledger.sensitivityRows.every(row =>
          Number.isFinite(row.sourceCandidateRateArcminPerDay) &&
          Number.isFinite(row.bhujantaraCorrectedFiniteDifferenceArcminPerDay) &&
          Number.isFinite(row.uncorrectedTruePlaceFiniteDifferenceArcminPerDay) &&
          Number.isFinite(row.correctedRelativeDifferencePercent) &&
          Number.isFinite(row.uncorrectedRelativeDifferencePercent)
        )
    },
    {
      name: "Ledger explicitly marks the epoch/frame alignment as unresolved",
      passed: ledger.fixture.status.includes("research-only") &&
        ledger.note.includes("remain unresolved")
    }
  ];
  return {
    ledger,
    tests,
    passed: tests.filter(test => test.passed).length,
    total: tests.length,
    allPassed: tests.every(test => test.passed)
  };
}
