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

The table above is the median of accepted calibration observations; the current planetary holdout candidate uses the 25th percentile of each body/event/branch/motion-state group. The expanding-window comparison (7-day windows around source dates) found q25 no worse than the median and better for the 2027 Jupiter Asta date: 2024 exact 2/4 vs 1/4; 2025 4/5 vs 4/5; 2026 5/5 vs 5/5; 2027 fixed-origin 3/4 vs 2/4.

Full-year q25 holdout: 2026 = 6/7 exact, 7/7 within one day; 2027 fixed-origin (training through 2025) = 4/6 exact, 6/6 within one day. The 2027 rolling-origin test is worse (4/6 exact with one unmatched observation), so the candidate remains fixed-origin until more independent years are available.

These are candidate fitted values, not production constants. Venus direct and retrograde states must be fitted independently; a transition across a station is not evaluated using a blended threshold.

## Data safeguards

- The research file preserves 89 observations: 24 Ganesh Martand, 54 Drik Almora, 6 Drik Ramnagar and 5 Tara Prasad.
- Drik is used for time-threshold fitting only when the source clock is within 15 minutes of the computed target rise/set event.
- Ganesh Martand HH.MM values are preserved verbatim; the source legend confirms IST hour-minute notation and next-day rollover examples. Its timestamps remain an independent cross-check and are not pooled into Drik-fitted thresholds because source-event equivalence is not assumed.
- Ambiguous Tara Prasad AM/PM records are excluded instead of guessed.
- Drik Almora and Ramnagar now use the exact provider-published observer profiles: Almora 29.59713°N, 79.65911°E, 1600 m; Ramnagar 29.3925°N, 79.1283°E, 364 m. These were taken from Drik's own location-detail pages, not substituted from the printed Panchang centres.
- Pithoragarh has two intentionally separate profiles: Drik default city (29.58349°N, 80.20947°E, 1586 m) and project observer (29.5828°N, 80.2182°E, 1650 m). A 17 Nov 2026 sunrise/sunset sanity check compares the Drik profile with its published 06:35 / 17:13 IST. This checks the observer setup only; Pithoragarh Asta/Udaya still needs independent local source observations.
- Ganesh Martand and Tara Prasad retain their own printed calculation-centre coordinates. Their source elevations are still unconfirmed and currently remain 0 m only as a provisional diagnostic assumption.
- Agastya uses a provisional Canopus J2000 position; pin an astrometric catalogue/proper-motion source before production.

## Performance plan

- All multi-year scanning and calibration run offline in CI.
- After the held-out tests pass, precompute compact annual city/year JSON chunks.
- The public Panchang should only load the relevant chunk lazily and display the event. It must not scan multiple years of ephemeris data on every date change.
- No production Panchang code or public display has been changed in this branch.

## Acceptance gates

1. 2026–2027 held-out event dates and times match Drik within an agreed tolerance.
2. Ganesh Martand date cross-checks remain consistent; verify its clock legend before time calibration.
3. Almora and Ramnagar profiles do not use city fallbacks.
4. Guru and Shukra pass before finalizing Agastya astrometry.
5. Only one public label and one calculation path are exposed.
