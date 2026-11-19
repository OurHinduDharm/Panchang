# Drik-Ganita location-based Tara Asta/Udaya model

Status: research prototype; not connected to the public Panchang yet.

## Agreed product rule

The public site will expose one method only: **दृक्-गणितीय उदय-अस्त**.

- Drik Panchang is the primary time-calibration source.
- Ganesh Martand (दृक्गणित), Almora, is an independent date/time cross-check. Its source legend confirms planetary rise/set times as IST hour-minute; values above 24 hours are preserved as next-day notation. These observations remain separate from Drik threshold fitting because source-event equivalence is not assumed.
- Tara Prasad is a secondary Ramnagar cross-check.
- TKS Surya-Siddhanta and photometric values are excluded from calibration.
- No public method selector or separate physical/photometric visibility option will be added.

## Current candidate calculation

The Drik records indicate that the published event clock is the target body's local apparent rise/set event. At that instant, the target is near the local horizon and the Sun is below the horizon by a repeatable amount for each body/event/horizon branch.

For each local date and observer:

1. Use the pinned Astronomy Engine ephemeris and the observer's latitude, longitude and elevation to find the target event. Jupiter/Venus use the standard refraction-corrected `SearchRiseSet`; Agastya/Canopus uses the unrefracted geometric center crossing at 0° via `SearchAltitude`. The Drik source clocks show a consistent ~0.57° apparent-altitude offset for Canopus, matching the refraction distinction rather than a 7–8 minute arbitrary correction.
2. At that exact event instant, calculate the Sun's topocentric apparent altitude and both azimuths using the same observer.
3. For Jupiter/Venus, compare Sun altitude with the calibrated body/event/branch threshold; Venus direct/retrograde profiles remain separate.
4. For Agastya, fit a separate robust relation `hSun = alpha + beta × abs(wrap180(Astar − Asun))` using Theil–Sen regression on Drik star-rise/star-set observations. Udaya is the downward crossing of the residual `hSun − hPredicted`; Asta is the upward crossing. The linear model is accepted only when leave-one-year-out error and slope stability improve on the constant-median baseline.
5. Publish the first actual target event that satisfies the threshold. Do not interpolate between adjacent daily horizon events; the event clock is the computed rise/set or geometric star-crossing instant itself.

This is one local Drik-Ganita calculation path. It uses standard apparent rise/set and topocentric solar altitude; it does not calculate visual magnitude, sky brightness, extinction or a separate photometric/naked-eye visibility product. It does not implement Surya-Siddhanta Ch.9 K/C.

The earlier time-gap-in-degrees measurement remains in the report as a diagnostic, but it is not used for held-out predictions because its fixed threshold does not reproduce all event times consistently.

## Preliminary Drik calibration from 2019–2027 observations

Accepted Drik source events place the target near the horizon at the printed event time. Median Sun altitude by body/event/branch is:

| Body | Event | Horizon branch | Median Sun altitude |
|---|---|---|---:|
| Venus | Asta | Rising | -5.77° |
| Venus | Udaya | Setting | -5.83° |
| Venus | Asta | Setting | -5.08° |
| Venus | Udaya | Rising | -6.53° |
| Jupiter | Asta | Setting | -7.47° |
| Jupiter | Udaya | Rising | -9.29° |
Agastya's constant solar-altitude medians are retained only as diagnostics; its current candidate is the separate azimuth-corrected geometric-star model described above.

The current candidate uses the lower quartile (q25) for most planetary body/event/branch/motion-state profiles. One sparse branch, Venus Udaya on the setting horizon while direct, uses q95; this exception is kept explicit rather than pooling it with retrograde observations. Expanding-window 7-day diagnostics support q25 over the median overall: 2024 exact 2/4 vs 1/4; 2025 4/5 vs 4/5; 2026 5/5 vs 5/5; 2027 fixed-origin 3/4 vs 2/4. For 2027 rolling-origin, q25 gives 3/4 exact while the median gives 2/4 exact, but adding 2026 observations still does not improve every event clock.

For Agastya, the candidate residual offsets are event-specific: q25 for Udaya and q90 for Asta. The expanding/fixed-origin diagnostics show Udaya q25 exact in 2023, 2024, 2025, 2026 and 2027 fixed-origin; q90 Asta is within one day in 2025 and exact in 2026 and 2027 fixed-origin. Some Asta cases in earlier years are unmatched, and each year often contributes only one observation per event. These counts are too small to call the residual offsets validated; retain the full quantile comparison in the CI artifact.

The latest full-year fixed-origin candidate (thresholds trained only through 2025) gives Almora 2026 = 7/7 exact and 7/7 within one day; 2027 = 6/6 exact and 6/6 within one day. Clock residual medians/maxima are 0.53/1.87 min in 2026 and 0.82/1.83 min in 2027. The 2027 rolling-origin test (training through 2026) remains weaker at 3/6 exact and 5/6 within one day, with one unmatched Agastya Asta. Keep the fixed-origin candidate provisional and do not retune against the holdout.

These are candidate fitted values, not production constants. Venus direct and retrograde states remain independent; a transition across a station is never evaluated using a blended threshold.

## Data safeguards

- The research file preserves 95 observations: the original 89 records plus 6 separately transcribed Drik Pithoragarh Venus events. The back-test also reads eight Jupiter boundaries from the direct Pithoragarh source ledger, and four explicit Pithoragarh star rise/set observations for 2026–2027.
- Drik is used for time-threshold fitting only when the source clock is within 15 minutes of the computed target rise/set event.
- Ganesh Martand HH.MM values are preserved verbatim; the source legend confirms IST hour-minute notation and next-day rollover examples. Its timestamps remain an independent cross-check and are not pooled into Drik-fitted thresholds because source-event equivalence is not assumed.
- Ambiguous Tara Prasad AM/PM records are excluded instead of guessed.
- Drik Almora and Ramnagar now use the exact provider-published observer profiles: Almora 29.59713°N, 79.65911°E, 1600 m; Ramnagar 29.3925°N, 79.1283°E, 364 m. These were taken from Drik's own location-detail pages, not substituted from the printed Panchang centres.
- Pithoragarh has two intentionally separate profiles: Drik default city (29.58349°N, 80.20947°E, 1586 m) and project observer (29.5828°N, 80.2182°E, 1650 m). On 17 Nov 2026, the engine returned 06:35:14 sunrise and 17:12:38 sunset at the Drik observer, versus provider-published 06:35 / 17:13 IST (residuals +0.25 / −0.37 min). The project observer differs from the Drik observer by only −0.02 / −0.05 min on that date. This validates the observer setup only.
- Ganesh Martand and Tara Prasad retain their own printed calculation-centre coordinates. Their source elevations are still unconfirmed and currently remain 0 m only as a provisional diagnostic assumption.
- A cross-location transfer test applies thresholds trained only on 27 accepted Drik Almora events through 2025 to six separately transcribed Drik Pithoragarh Venus events. With Drik's own Pithoragarh city observer, 5/6 dates are exact and 6/6 are within one day; median / maximum clock residual is 0.57 / 2.42 min. The same six events, evaluated at the project's distinct Pithoragarh target observer, also give 5/6 exact and 6/6 within one day; median / maximum clock residual is 0.61 / 2.40 min. None of the six Pithoragarh observations is used to fit the thresholds. The sole one-day mismatch is the 11 Dec 2025 Venus Asta, predicted on 12 Dec, with a clock residual of about 2.4 min. These six results describe the tested Venus events.
- Agastya now uses Canopus (α Car) astrometry pinned to SIMBAD's Hipparcos New Reduction entry / van Leeuwen 2007 (2007A&A...474..653V): ICRS J2000 RA 06h 23m 57.10988s, Dec −52° 41′ 44.3810″; μα cosδ = +19.93 mas/yr, μδ = +23.24 mas/yr, parallax 10.55 mas. The date-specific position is propagated from J2000 before each source event and each daily geometric-star scan. Distance for the engine's small parallax correction is derived from the catalog parallax. Source: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Canopus.
- The separate Jupiter transfer uses eight Drik Pithoragarh boundaries from 2024–2027. The Almora-only profiles give 6/8 exact dates at the Drik default observer and 7/8 at the project observer; both give 8/8 within one day. At the project observer, the June 6, 2024 end is predicted June 7, with a 2.82-minute clock-of-day residual. The direct pages establish the city label; their internal coordinates are undisclosed.

## Performance plan

- All multi-year scanning and calibration run offline in CI.
- After the held-out tests pass, precompute compact annual city/year JSON chunks.
- The public Panchang should only load the relevant chunk lazily and display the event. It must not scan multiple years of ephemeris data on every date change.
- No production Panchang code or public display has been changed in this branch.

## Acceptance gates

1. Freeze all model profiles, then validate against a genuinely unseen year (for example 2028); do not retune thresholds on that holdout.
2. Validate the Pithoragarh Agastya model against independently captured rise/set events, and extend the Venus and Jupiter comparisons to additional years.
3. Complete independent Ganesh Martand / Tara Prasad date cross-checks using their separate observer centres; their source elevations remain unknown.
4. Revalidate the proper-motion-propagated Canopus model over additional held-out years and independent Agastya locations.
5. Preserve separate city observer profiles and one public method/label; never use city fallbacks.


## Pithoragarh annual date selection

The planetary scan includes the preceding December 31 to detect transitions on January 1. Only events in the requested IST year are returned. The Canopus scan uses the seasonal window learned from Almora. Both use Almora calibration through 2025 and the project observer at 1650 m. Published Pithoragarh dates enter the matching step after the scans.

| Year | Guru and Shukra exact dates | Agastya exact dates | Total within one day | Extra or missing predictions |
|---|---:|---:|---:|---:|
| 2026 | 5/5 | 0/2 | 7/7 | 0 |
| 2027 | 4/4 | 0/2 | 6/6 | 0 |

Both years give April 16 for Agastya setting and September 6 for rising. The city-labelled reference gives April 15 and September 7. The comparison uses the explicit published star rise/set clocks. Arghya duration and visibility to the naked eye require separate evidence.

## Offline city forecasts, 2026–2030

With the workflow's pinned `astronomy-engine@2.1.19`, run `node scripts/predict-annual-tara.mjs` for Pithoragarh (project observer, 1650 m), Almora (Drik observer, 1600 m) and Ramnagar (Drik observer, 364 m). For one coordinate and year, run e.g. `node scripts/predict-annual-tara.mjs 2028 29.5828 80.2182 1650`. Both commands emit IST event timestamps. The CI artifact includes `city-forecasts.json`. City altitude must be known to this offline calculation. When integrating legacy Panchang selections, treat their placeholder zero as unknown. A confirmed sea-level location can pass `elevationStatus: "provided"`.

The forecast fits the existing rules to Almora observations through 2025. It does not read Pithoragarh's target ledgers. The ordinary back-test now calls the same annual function. At the Pithoragarh project observer, all nine planetary dates from 2026–2027 still match the captured local records.

| Pithoragarh boundary | Calculated date (IST) | Recorded date (city label) | Difference |
|---|---|---|---:|
| Jupiter Udaya, 2024 | 7 Jun | 6 Jun | +1 day |
| Venus Asta, Dec 2025 | 12 Dec | 11 Dec | +1 day |
| Canopus Asta, 2028 | 15 Apr | 14 Apr | +1 day |
| Canopus Udaya, 2028 | 5 Sep | 7 Sep | −2 days |

At the project observer's morning rise on 6 Jun 2024 the Sun was at −8.988°, above the fitted Jupiter Udaya threshold of −9.247°. On 7 Jun it was at −9.527°. For Venus on 11 Dec 2025 it was at −5.824°, just below the fitted Asta threshold of −5.808°. On 12 Dec it was at −5.563°. These diagnostics explain the date selected by the model. The offsets do not identify the reference provider's rule.

The 2028 Canopus comparison uses the saved star rise/set fields and the civil dates for clocks beyond 24:00. The 2028 Guru/Shukra forecasts still require a comparable independent city reference. For Almora 2030 the fitted Canopus setting criterion returns no crossing. All 91 daily samples exist, but even the minimum residual is 0.005° above the fitted boundary. The output records the missing event under `canopusIssues`. No date was filled in.
