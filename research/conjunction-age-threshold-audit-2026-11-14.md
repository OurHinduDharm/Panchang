# Conjunction-age threshold and event-time audit — 14 November 2026

## Important correction: train at the actual horizon event instant

The earlier diagnostic sampled Sun depression at Drik's minute-rounded source timestamp. That is not the same instant as the computed local planet rise/set event. A source timestamp can differ from the actual horizon crossing by tens of seconds; near the horizon, that can materially change the Sun-depression angle.

The back-test now records both instants:
- `sourceUtcInstant`: Drik-published minute-rounded time, retained for signed clock-time error.
- `horizonEventInstant`: actual Astronomy Engine local rise/set crossing.
- Calibration Sun depression, planet altitude/azimuth and Sun azimuth are sampled at the actual horizon-event instant.
- Conjunction age is also measured to the actual horizon-event instant.

This aligns training geometry with the daily event series used to generate candidate times. The previous source-instant threshold figures are superseded.

## Threshold-only model: still not a universal replacement

A linear relationship between Sun depression and elapsed days from conjunction is tested separately for each city, planet, boundary and local rise/set branch.

| Five-city threshold metric | Conjunction-age model | Fixed median |
|---|---:|---:|
| Groups with leave-one-year-out evaluation | 20 | 20 |
| Groups where conjunction-age model improved | 3 | — |
| Groups where median was better or tied | 17 | — |
| Mean per-group LOO MAE | 0.17519° | 0.13586° |
| Holdout boundaries evaluated | 30 | 30 |
| Holdout boundaries with lower threshold residual | 13 | 17 |
| Holdout threshold-residual MAE | 0.23891° | 0.16462° |

**Decision:** do not replace the per-city median threshold globally. The conjunction-age threshold has worse aggregate cross-city error.

For Pithoragarh Venus AstaEnd:set, the fitted threshold residual at the 2027 holdout is 0.06947° versus 0.12581° for the fixed median. The four-sample training group's LOO MAE is 0.15839° versus 0.15131° for the median. The threshold residual alone is therefore not a full validation result.

## Separate implicit event-time experiment: strong Venus 2027 result

A second diagnostic solves the implicit condition:

`SunDepression(event) = fittedThreshold(daysFromConjunction(event))`

It evaluates the complete 2026–2027 local horizon-event series. For each conjunction it selects the last crossing before conjunction for AstaStart or the first crossing after conjunction for AstaEnd. It does not use the Drik source date/time to select a candidate; the source timestamp is consulted only after selection to measure error.

### Pithoragarh Venus 2027

| Boundary | Drik source | Candidate | Signed time error |
|---|---|---|---:|
| AstaStart | 21 Jul 2027, 04:54 | 21 Jul 2027, 04:54 | +0.11 min |
| AstaEnd | 9 Sep 2027, 18:48 | 9 Sep 2027, 18:47 | −0.47 min |

This resolves the previously reported two-day Pithoragarh Venus AstaEnd mismatch in the research holdout. Both Venus boundaries in 2027 now match the source date and clock time to within half a minute.

### Venus 2027 AstaEnd across five cities

| City | Drik source time | Candidate time | Signed error |
|---|---:|---:|---:|
| New Delhi | 9 Sep, 19:00 | 9 Sep, 18:59 | −0.43 min |
| Mumbai | 5 Sep, 19:14 | 5 Sep, 19:14 | +0.35 min |
| Ujjain | 6 Sep, 19:04 | 6 Sep, 19:04 | +0.28 min |
| Varanasi | 7 Sep, 18:36 | 7 Sep, 18:36 | +0.04 min |
| Pithoragarh | 9 Sep, 18:48 | 9 Sep, 18:47 | −0.47 min |

All five city-labelled Venus 2027 AstaEnd holdouts have the correct local date and a clock-time error below 30 seconds.

## Limits that remain

The implicit model is not a universal pass. Across all 40 city holdout records:
- 30 candidates were resolved; 10 had no candidate.
- 18 of the 30 resolved records were within 15 minutes.
- 12 resolved records had a one-day local-date mismatch.
- The Pithoragarh Jupiter AstaStart 2026 and 2027 candidates are still one day later than the Drik source dates, although their clock times are within about five minutes.
- Pithoragarh Venus 2026 AstaStart/AstaEnd still have no accepted conjunction-age crossing.
- The Venus 2027 AstaStart candidate matched in New Delhi, Mumbai and Pithoragarh, but was one day off in Ujjain and Varanasi.

The excellent Venus 2027 AstaEnd result is branch-specific evidence, not permission to apply the model to Guru, all Venus windows, all years, or all cities.

## Acceptance gate

1. Keep this implicit event-time model research-only.
2. Add more independent same-city years for Pithoragarh Venus AstaEnd and test other conjunction cycles.
3. Investigate Jupiter AstaStart date selection separately; do not force the Venus result onto Guru.
4. Re-run exact-date and signed-clock-time holdouts after every change.
5. Require review of source definitions and independent validation before any public annual dataset or Panchang UI uses this model.

**Publication eligibility: false.** No production calculation, public annual data or Panchang UI was changed.
