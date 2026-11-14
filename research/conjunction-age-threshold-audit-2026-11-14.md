# Conjunction-age threshold diagnostic — 14 November 2026

## Decision

A new research-only diagnostic tests whether the elapsed time from the associated Sun–planet conjunction to a Drik-published Asta boundary explains the observed local Sun-depression threshold.

**Do not replace the current per-city median calibration with this model.** It improves one difficult Pithoragarh Venus boundary in the 2027 holdout, but it does not generalize across the five cities. No production engine, public annual dataset, or Panchang UI was changed.

## Method

- Source observations are grouped independently by city, planet, Asta boundary, and actual local planet horizon event (rise or set).
- Rows are included only when the local rise/set branch matches the associated conjunction.
- Feature: elapsed days from the computed planet–Sun conjunction instant to the captured Drik boundary.
- Candidate: a simple linear regression of source Sun depression against conjunction age.
- Baseline: fixed median Sun-depression threshold from the same city/planet/boundary/rise-set training rows.
- Training years are 2021–2025. Leave-one-year-out excludes all rows from the target year. Holdout years are 2026–2027.
- The metric is threshold residual in degrees. It is not a predicted date/time error. The audit intentionally does not generate event timestamps.

## Pithoragarh Venus 2027 AstaEnd — important signal

For the Pithoragarh:Venus:astaEnd:set group, four training samples are available (2021, 2022, 2024 and 2025).

| Metric | Conjunction-age linear fit | Fixed median |
|---|---:|---:|
| Leave-one-year-out MAE | 0.12245° | 0.14541° |
| 2027 predicted threshold | 5.77281° | 5.88870° |
| 2027 observed threshold | 5.74071° | 5.74071° |
| 2027 absolute residual | 0.03210° | 0.14799° |

The observed source boundary is 28.566 days after the associated conjunction. The conjunction-age fit is materially closer to the 2027 source threshold than either the fixed median (0.148° residual) or the previously tested azimuth-only linear fit (0.117° residual).

This is the strongest current hypothesis for the two-day Pithoragarh Venus AstaEnd date error. It is still only one independent holdout boundary in a four-sample training group. It has **not** yet been translated into a candidate event timestamp or independently confirmed with a second same-city source year.

## Five-city generalization check

| Measure | Conjunction-age model | Fixed median |
|---|---:|---:|
| Groups with LOO evaluation | 20 | 20 |
| Groups where model improved | 5 | — |
| Groups where median was better or tied | 15 | — |
| Mean per-group LOO MAE | 0.18266° | 0.14681° |
| Holdout boundaries evaluated | 30 | 30 |
| Holdout boundaries with lower residual | 11 | 19 |
| Holdout residual MAE | 0.26509° | 0.18860° |

The conjunction-age feature is not a universal replacement. Its aggregate five-city holdout MAE is worse than the median. Do not pool cities or apply this feature across other planet/boundary branches.

## Comparison with prior azimuth diagnostic

The azimuth-conditioned model also failed the aggregate five-city gate (holdout MAE 0.28968° versus median 0.18860°). For the one Pithoragarh Venus AstaEnd holdout, its residual was 0.11705°. Conjunction age reduces that one-group residual to 0.03210°, but both are diagnostics only.

## Next acceptance gate

1. Re-run the conjunction-age fit from the pinned astronomy engine and source capture in CI; preserve the exact conjunction instant and source timestamp.
2. Generate a candidate timestamp only as a separate experiment, using the local daily set-event series and the predicted threshold; do not use the source date as a selection hint.
3. Evaluate the candidate against the 2027 holdout without changing the fit. Record local date error and signed/absolute clock-time error independently.
4. Obtain another lawful same-city Pithoragarh Venus AstaEnd:set year before considering a production-specific rule.
5. Keep the fixed median and current published data unchanged until the independent holdout gate passes.

**Publication eligibility: false.** The diagnostic is committed for reproducibility, not production use.
