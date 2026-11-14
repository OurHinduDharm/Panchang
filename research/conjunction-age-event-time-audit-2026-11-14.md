# Implicit conjunction-age event-time holdout — 14 November 2026

## Result

After correcting calibration to sample Sun depression at the actual local horizon-event instant, a separate implicit threshold-crossing model was evaluated against the full 2026–2027 horizon-event series.

For every conjunction, candidate events are generated without consulting the Drik source date/time. The model solves:

`SunDepression(local rise/set event) = fittedThreshold(days from conjunction)`

AstaStart selects the last threshold crossing before conjunction; AstaEnd selects the first crossing after conjunction. Only after a candidate is selected is the Drik source timestamp used to calculate date and clock-time errors.

## Pithoragarh — Venus 2027

| Boundary | Drik source | Candidate | Signed time error |
|---|---|---|---:|
| AstaStart | 21 Jul 2027, 04:54 | 21 Jul 2027, 04:54 | +0.11 min |
| AstaEnd | 9 Sep 2027, 18:48 | 9 Sep 2027, 18:47 | −0.47 min |

The previously unresolved two-day Venus AstaEnd mismatch is now reproduced on the correct date, with a clock-time difference of about 28 seconds. Both 2027 Venus boundaries in Pithoragarh are within 15 minutes.

## Venus 2027 AstaEnd — five-city comparison

| City | Drik source | Candidate | Signed error |
|---|---:|---:|---:|
| New Delhi | 9 Sep, 19:00 | 9 Sep, 18:59 | −0.43 min |
| Mumbai | 5 Sep, 19:14 | 5 Sep, 19:14 | +0.35 min |
| Ujjain | 6 Sep, 19:04 | 6 Sep, 19:04 | +0.28 min |
| Varanasi | 7 Sep, 18:36 | 7 Sep, 18:36 | +0.04 min |
| Pithoragarh | 9 Sep, 18:48 | 9 Sep, 18:47 | −0.47 min |

All five city-labelled Venus 2027 AstaEnd holdouts have the correct local date and clock-time errors below 30 seconds.

## Wider holdout limits

Across all five cities, 40 source holdout boundaries were present:
- 30 produced a candidate; 10 remained unresolved.
- 18 of the 30 resolved candidates were within 15 minutes.
- 12 resolved candidates had a one-day local-date mismatch.
- No resolved candidate had the correct local date but a clock-time error greater than 15 minutes.
- Pithoragarh Jupiter AstaStart 2026 and 2027 remain one day later than the Drik dates, although the clock times are within about five minutes.
- Pithoragarh Venus 2026 AstaStart/AstaEnd remain unresolved.
- Venus 2027 AstaStart matched in New Delhi, Mumbai and Pithoragarh, but was one day off in Ujjain and Varanasi.

The event-time model is therefore promising for the Venus 2027 AstaEnd branch, not a universal Guru/Shukra model.

## Reproducibility and safeguards

- The training threshold uses only same-city, same-planet, same-boundary and same-rise/set-branch records from 2021–2025.
- Whole target years are excluded in leave-one-year-out diagnostics.
- Candidate selection uses the full 2026–2027 local horizon series and conjunction timing, not the source date.
- Rounded source time is retained for post-selection signed error measurement.
- All candidates and reports remain publication-ineligible.

**Decision:** preserve the research result and add a regression assertion for the five-city Venus 2027 AstaEnd holdout. Do not apply it to production or annual public data until more independent years and the remaining Jupiter/Venus branches pass.
