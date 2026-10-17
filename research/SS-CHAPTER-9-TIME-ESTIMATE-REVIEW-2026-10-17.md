# Chapter IX.10–11 time-estimate review — 17 October 2026

**Scope:** research-only numerical review. No production code, event thresholds, or reference dates changed.

## Evidence from the latest browser diagnostic

Source run for the per-sample rate audit: https://github.com/OurHinduDharm/Panchang/actions/runs/39009894837

The browser run passed, including the headless Chromium audit and the check that `app.js` and `extra-panchang.js` are unchanged.

The browser test calculates both (a) a long-range IX.10–11 estimate from the selected fixture date and (b) an estimate anchored at the daily samples immediately adjacent to the requested sequential K=C crossing. These are distinct checks.

| Body/event | Long-range estimate (days) | Error vs daily-bracket interpolation (days) | Short-horizon error (days) |
|---|---:|---:|---:|
| Venus Asta | -0.1181503 | 0.003827 | 0.003827 |
| Venus Udaya | -3.3335014 | 0.294861 | 0.003093 |
| Jupiter Asta | -7.1402245 | 0.038012 | 0.000834 |
| Jupiter Udaya | -0.1948605 | 0.001436 | 0.001436 |

For Venus Udaya, 0.294861 day is about 7.08 hours. The same diagnostic's short-horizon estimate is 0.003093 day, about 4.45 minutes. The local result is therefore much closer to the daily-bracket interpolation than the long-range extrapolation.

## New finding: IX.10–11 rate versus observed daily K change

The daily audit now compares the signed IX.10–11 rate with the empirical change in the corrected (K) between adjacent actual sunrise/sunset samples, only when both samples remain on the same horizon branch and retain the same (C).

| Case / sample | IX.10–11 rate (prāṇa/day) | Empirical next-sample ΔK (prāṇa/day) | Difference (analytic − empirical) |
|---|---:|---:|---:|
| Venus Udaya, 29 Oct 2026 | 110.0368 | 117.4467 | −7.4099 |
| Venus Udaya, 30 Oct 2026 | 108.6426 | 115.4073 | −6.7646 |
| Venus Udaya, 31 Oct 2026 | 107.0125 | 113.1188 | −6.1063 |
| Venus Udaya, 1 Nov 2026 | 105.1666 | 110.6112 | −5.4446 |
| Jupiter Asta, 5 Aug 2027 | −37.7478 | −37.5702 | −0.1776 |
| Jupiter Udaya, 1 Sep 2027 | 51.8898 | 51.5521 | +0.3377 |

**Interpretation:** for the Venus Udaya samples, the IX.10–11 rate is lower in magnitude than the next-sample K change by about 4.9–6.3%. That accumulated rate mismatch is numerically consistent with why a multi-day backward extrapolation can miss the daily-bracket interpolation by about 7.08 hours, while an estimate anchored near the crossing misses by only about 4.45 minutes. In the shown Jupiter samples the rate agreement is much closer.

This narrows the problem: it is not merely a vague “long-range estimate” issue; the current analytical time-rate does not match the observed local slope of corrected K in the Venus Udaya fixture. It does **not** yet identify the exact theoretical cause. Candidate causes to test separately include the derivative of the dṛkkarma corrections, which are part of K but are not explicitly differentiated in the current IX.11 rate, and any mismatch between the longitude-motion inputs and the corrected event-frame geometry. Do not assume either cause until independently tested.

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

The residual's local change is now compared with the IX.10–11 predicted rate. Next isolate the missing rate contribution, if any: (1) hold the same branch and (C) fixed and compare corrected K with K before dṛkkarma; (2) measure the day-to-day change in the Aksha and Ayana dṛkkarma terms separately; (3) compare raw versus corrected longitude-motion inputs; (4) only then test stepwise re-evaluation as a separate candidate. Do not silently replace the source method or tune it to a modern benchmark.

## Guardrails

- Keep PR #22 and PR #35 Draft and unmerged.
- Do not modify `app.js` or production `extra-panchang.js` for this research step.
- Do not label the preliminary angular-threshold dates as verified classical event dates.
- Keep the 0°/360° branch question separate from this time-estimate investigation.


## Follow-up: raw K versus corrected K rate (17 Oct 2026)

The browser audit was extended to compare the adjacent-sample rate of (K) before dṛkkarma with the rate after dṛkkarma. In the Venus Udaya sequence, the 30 Oct 2026 sunrise sample gives:

| Quantity | Measured value |
|---|---:|
| IX.10–11 analytical signed K-rate | 108.642626 prāṇa/day |
| Empirical raw-K rate, before dṛkkarma | 107.855836 prāṇa/day |
| Empirical corrected-K rate | 115.407269 prāṇa/day |
| Corrected minus raw empirical K-rate | +7.551432 prāṇa/day |
| Analytical minus raw empirical rate | +0.786790 prāṇa/day |
| Analytical minus corrected empirical rate | −6.764642 prāṇa/day |

This is the strongest current localization of the Venus discrepancy: at this sample, the analytical rate is much closer to the empirical **raw-K** rate than to the corrected-K rate. The day-to-day correction contribution (+7.551432 prāṇa/day in K-space) accounts numerically for most of the observed gap. This supports investigating the time derivative of dṛkkarma, but does not by itself prove that the classical text requires adding such a derivative to IX.11. The measured raw/corrected K difference is nonlinear geometry, so it must not be treated as a direct sum of longitude-correction rates.

A second diagnostic now reports the day-to-day changes in Akṣa and Āyana correction separately (arcminutes/day), alongside the combined correction contribution to K-rate. That newest split-component run is pending CI; no conclusion about which component dominates is recorded until its browser output is checked.

Validation status: the preceding raw-versus-corrected rate instrumentation passed headless Chromium and the production-file guard. The current component-split instrumentation remains research-only and must pass CI before its numbers are accepted.
