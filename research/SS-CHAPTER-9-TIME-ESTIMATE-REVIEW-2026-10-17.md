# Chapter IX.10–11 time-estimate review — 17 October 2026

**Scope:** research-only numerical review. No production code, event thresholds, or reference dates changed.

## Evidence from the latest browser diagnostic

Source run: https://github.com/OurHinduDharm/Panchang/actions/runs/38944575146

The browser test calculates both (a) a long-range IX.10–11 estimate from the selected fixture date and (b) an estimate anchored at the daily samples immediately adjacent to the requested sequential K=C crossing. These are distinct checks.

| Body/event | Long-range estimate (days) | Error vs daily-bracket interpolation (days) | Short-horizon error (days) |
|---|---:|---:|---:|
| Venus Asta | -0.1181503 | 0.003827 | 0.003827 |
| Venus Udaya | -3.3335014 | 0.294861 | 0.003093 |
| Jupiter Asta | -7.1402245 | 0.038012 | 0.000834 |
| Jupiter Udaya | -0.1948605 | 0.001436 | 0.001436 |

For Venus Udaya, 0.294861 day is about 7.08 hours. The same diagnostic's short-horizon estimate is 0.003093 day, about 4.45 minutes. The local result is therefore much closer to the daily-bracket interpolation than the long-range extrapolation.

## What this does and does not establish

1. The 7.1-hour discrepancy is reproducible as a **long-range estimate error** in this fixture.
2. It does **not** establish that lagnāntara or dṛkkarma is missing: both are present in the research diagnostic.
3. It does **not** prove that iterative refinement is the sole cause. The contrast between long-range and short-horizon errors supports testing the local-linear approximation over different horizons, but the daily bracket itself is a one-day sampled crossing with linear interpolation, not an independently certified event time.
4. The successful browser/CI run verifies that calculations render and remain finite. It is not evidence that the four fixture dates are authoritative classical ground truth.

## Next verification step

Keep the present formulas unchanged while extending the research diagnostic to report, for every valid daily sample around the crossing:

- event timestamp and horizon branch;
- raw and corrected planet longitude;
- Sun and planet sign-rising-asus used by IX.11;
- signed lagnāntara, K, selected C, and K−C residual;
- both daily time-motion terms and their signed relative rate;
- predicted time from each adjacent sample and its error against the bracket interpolation.

Then compare the residual's local change with the IX.10–11 predicted rate. If the sign, units, and rate are consistent locally but the multi-day estimate drifts, test stepwise re-evaluation as a separate candidate; do not silently replace the source method or tune it to a modern benchmark.

## Guardrails

- Keep PR #22 and PR #35 Draft and unmerged.
- Do not modify `app.js` or production `extra-panchang.js` for this research step.
- Do not label the preliminary angular-threshold dates as verified classical event dates.
- Keep the 0°/360° branch question separate from this time-estimate investigation.
