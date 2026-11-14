# Azimuth-conditioned threshold audit — 14 November 2026

## Calibration basis correction

This report supersedes the earlier source-time-only figures. Source observations now retain the rounded Drik timestamp separately, but the calibration Sun depression and local planet/Sun geometry are sampled at the actual computed local rise/set event instant. This makes the training geometry consistent with the daily horizon-event series.

## Decision

The local absolute azimuth separation between planet and Sun can be informative for selected city/event branches, but it is **not a universal threshold model** and must not replace the fixed median across cities.

## Method

- Group independently by city, planet, Asta boundary and actual local rise/set branch.
- Feature: absolute shortest azimuth difference between planet and Sun at the actual local horizon event.
- Candidate: a two-parameter linear fit of Sun depression against azimuth separation.
- Baseline: fixed median Sun depression from the same group.
- Training years: 2021–2025. Leave-one-year-out removes the entire target year. Holdout years: 2026–2027.
- Threshold residual is measured in degrees. This audit alone does not produce event timestamps.

## Five-city result

| Measure | Azimuth-conditioned model | Fixed median |
|---|---:|---:|
| Groups with LOO evaluation | 20 | 20 |
| Groups where linear model improved | 5 | — |
| Groups where median was better or tied | 15 | — |
| Mean per-group LOO MAE | 0.17322° | 0.13586° |
| Holdout boundaries evaluated | 30 | 30 |
| Holdout boundaries with lower residual | 10 | 20 |
| Holdout residual MAE | 0.25947° | 0.16462° |

The aggregate five-city result rejects azimuth-only linear calibration as a general replacement.

## Pithoragarh Venus 2027 AstaEnd:set

This is a notable branch-specific exception. Four training years (2021, 2022, 2024 and 2025) produce:

| Metric | Azimuth-conditioned | Fixed median |
|---|---:|---:|
| Leave-one-year-out MAE | 0.05100° | 0.15131° |
| 2027 predicted threshold | 5.59834° | 5.76558° |
| 2027 observed event threshold | 5.63976° | 5.63976° |
| 2027 absolute residual | 0.04142° | 0.12581° |

The Pithoragarh azimuth feature is materially more stable than the median in this one branch. It is still only four training samples and one 2027 holdout. It does not justify applying the formula to other cities or event branches.

## Event-time cross-check

A separate implicit conjunction-age event-time experiment selected the Pithoragarh Venus 2027 AstaEnd candidate at 9 September 18:47 IST, compared with Drik's 9 September 18:48 IST. Across five cities, the conjunction-age event-time candidate also matched the Venus 2027 AstaEnd source dates and clock times to within 0.5 minutes. These results are recorded separately in the conjunction-age event-time report; they do not mean the azimuth model generated those timestamps.

## Decision and next gate

1. Keep the azimuth model as a diagnostic; do not deploy it as a global threshold.
2. Investigate whether the Pithoragarh Venus AstaEnd branch has a repeatable azimuth-conditioned relationship with additional independent years.
3. Keep cities, planets, boundaries and rise/set directions isolated.
4. Continue exact local-date and signed clock-time holdout checks.
5. Do not change production calculations or public annual data until a branch-specific model has sufficient independent holdout evidence.

**Publication eligibility: false.** No production or public data was changed.
