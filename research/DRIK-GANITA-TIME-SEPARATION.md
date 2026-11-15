# Drik-Ganita location-based Tara Asta/Udaya model

Status: research prototype; not connected to the public Panchang yet.

## Agreed product rule

The public site will expose one method only: **दृक्-गणितीय उदय-अस्त**.

- Drik Panchang is the primary time-calibration source.
- Ganesh Martand (दृक्गणित), Almora, is an independent date cross-check. Its printed HH.MM clock notation remains provisional until the original time legend is confirmed.
- Tara Prasad is a secondary Ramnagar cross-check.
- TKS Surya-Siddhanta and photometric values are excluded from calibration.
- No public method selector or separate physical/photometric visibility option will be added.

## Current candidate calculation

The Drik records indicate that the published event clock is the target body's local apparent rise/set event. At that instant, the target is near the local horizon and the Sun is below the horizon by a repeatable amount for each body/event/horizon branch.

For each local date and observer:

1. Use the pinned Astronomy Engine ephemeris and the observer's latitude, longitude and elevation to find the target's apparent rise or set event.
2. At that exact event instant, calculate the Sun's topocentric apparent altitude using the same observer.
3. Compare the Sun altitude with the calibrated threshold for that body, event (Asta/Udaya) and horizon branch.
4. Asta is the upward crossing of the solar-altitude threshold (Sun becoming less depressed); Udaya is the downward crossing (Sun becoming more depressed).
5. Interpolate the target's horizon-event instant between adjacent daily samples and validate it against held-out Drik event clocks.

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
| Agastya / Canopus | Udaya | Rising | -14.36° |
| Agastya / Canopus | Asta | Setting | -14.57° |

These are candidate fitted values, not production constants. The 2026–2027 holdout test trains thresholds only through 2025.

## Data safeguards

- The research file preserves 89 observations: 24 Ganesh Martand, 54 Drik Almora, 6 Drik Ramnagar and 5 Tara Prasad.
- Drik is used for time-threshold fitting only when the source clock is within 15 minutes of the computed target rise/set event.
- Ganesh Martand HH.MM values are preserved verbatim but are not used to fit time thresholds until their clock notation is verified. Its event dates remain a separate cross-check.
- Ambiguous Tara Prasad AM/PM records are excluded instead of guessed.
- Drik Almora/Ramnagar coordinates are proxies because the exact coordinates selected in the Drik interface were not captured.
- Source elevations are unconfirmed; the first benchmark pass uses 0 m. Do not treat this as a final elevation correction.
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
