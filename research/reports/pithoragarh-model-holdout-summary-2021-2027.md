# Pithoragarh Asta/Udaya Model Holdout Findings (2021–2027)

**Status:** Research-only cross-validation; not a production release  
**Date:** 2026-11-10  
**Reference data:** Direct browser-verified Drik Pithoragarh annual pages  
**Observer proxy:** 29.5828° N, 80.2182° E, 1650 m  
**Important:** Drik's internal coordinates/elevation are not published. The project observer elevation datum also still needs ellipsoidal-height confirmation for JPL comparisons.

## 1. Seven-year local leave-one-source-year-out validation

For each held-out source year, the model was trained on the other Pithoragarh source years only. The test compared three ways to label the solar-altitude visibility threshold:
- `thresholdCurrent`: Sun altitude at the current planet rise/set event
- `thresholdMidpoint`: midpoint of the previous and current same-direction planet-event Sun altitudes
- `thresholdPrevious`: Sun altitude at the previous same-direction event

The best tested variants were:

| Planet | Model | Threshold target | Asta exact | Asta within 1 day | Asta MAE | Udaya exact | Udaya within 1 day | Udaya MAE |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Mercury | Magnitude + event direction + magnitude×direction | Midpoint | 28/45 | 45/45 | 0.378 d | 40/45 | 45/45 | 0.111 d |
| Venus | Magnitude only | Midpoint | 7/9 | 9/9 | 0.222 d | 4/9 | 9/9 | 0.556 d |
| Jupiter | Magnitude only | Midpoint | 7/7 | 7/7 | 0.000 d | 6/7 | 7/7 | 0.143 d |
| Saturn | Magnitude only | Midpoint | 6/7 | 7/7 | 0.143 d | 5/7 | 7/7 | 0.286 d |

For Mercury, the midpoint magnitude-only baseline was weaker:
- Asta: 19/45 exact, 40/45 within one day, MAE 0.689 d, maximum error 2 days.
- Udaya: 27/45 exact, 38/45 within one day, MAE 0.600 d, maximum error 3 days.

The event-direction interaction therefore materially improved Mercury's blind year results. Geocentric retrograde state/longitude rate did not show a consistent enough gain in prior tests to be retained as a fitted feature in this comparison.

Mars was not eligible for a stable per-year model in several folds: only two usable training windows remained for the affected held-out years. Do not fill these gaps with a borrowed planet threshold.

## 2. Pooled multi-city plus local-history holdout (2024–2027)

A second experiment trained on verified windows from other cities plus Pithoragarh's prior years, while excluding every Pithoragarh row from the held-out year. It compared the pooled model against a prior-Pithoragarh-years-only baseline.

Accepted sample coverage: 200 windows total, including 40 Pithoragarh windows, across five cities and four held-out Pithoragarh years.

| Planet | Pooled model | Asta exact | Asta within 1 day | Udaya exact | Udaya within 1 day |
|---|---|---:|---:|---:|---:|
| Mercury | Magnitude + event direction + interaction | 19/25 | 25/25 | 23/25 | 25/25 |
| Venus | Magnitude + event direction + interaction | 3/5 | 5/5 | 4/5 | 5/5 |
| Jupiter | Magnitude only | 4/4 | 4/4 | 3/4 | 4/4 |
| Saturn | Magnitude only | 4/4 | 4/4 | 4/4 | 4/4 |

For Mercury, pooled training improved over local-history-only direction model:
- Asta exact dates: 19/25 pooled vs 17/25 local-only.
- Udaya exact dates: 23/25 pooled vs 16/25 local-only.
- Both approaches placed all 25 windows within one day, but pooled mean absolute error was lower (Asta 0.24 d; Udaya 0.08 d).

This supports pooling carefully selected multi-city training data, but it does not justify treating other cities as identical observers. Each city still uses an explicit observer proxy and the held-out Pithoragarh year remains excluded from training.

## 3. Combined interpretation with the JPL seven-year geometry check

The independent JPL Horizons run checked 150 direct Drik boundaries across 2021–2027. All 150 were within one minute of an interpolated local apparent planet-elevation crossing near -0.5°. This supports the local horizon-event clock used by the selector.

Together, the tests suggest the next candidate should retain:
1. Topocentric local planet rise/set event clocks.
2. Actual event direction (rise or set), not an assumed universal direction.
3. Conjunction/apparition family.
4. Planet-specific visibility calibration; use magnitude and the direction interaction for Mercury.
5. The midpoint threshold target as the best currently tested option for the listed planets.

This is still not a final production formula. Exact-date acceptance, missing Mars coverage, source-coordinate uncertainty, and observer-height datum remain unresolved.

## 4. Release gate

- Do not publish predictions for Mars where training coverage is insufficient.
- Do not replace missing events with New Delhi or another city.
- Do not merge or publish this research selector as a production engine until the full 2021–2027 held-out results, current-year predictions, exact local event clocks, and unchanged Panchang performance are reviewed.
- PR #278 remains Draft.
