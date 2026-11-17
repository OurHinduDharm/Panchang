# Drik-style local Guru–Shukra Asta/Udaya formula

Status: research specification; no production calculation is changed by this document.

## 1. Target
Reproduce the **published Panchang Asta/Udaya boundary** represented by named-city Drik reference rows. This is not a guarantee of naked-eye visibility under that day's weather or terrain. Keep `astaStart` (disappearance) and `astaEnd` (reappearance) separate. Conjunction identifies the apparition cycle; it is not itself the Asta/Udaya event.

## 2. Local astronomical event
For observer latitude, longitude, elevation and IANA time zone, calculate each topocentric apparent planet rise/set instant `t_i`, where `h_p(t_i)=0`. Use one pinned ephemeris engine for both planet and Sun.

At each event:
- `D_i = -h_s(t_i)`: Sun depression in degrees.
- `A_i = abs(wrap180(A_p(t_i)-A_s(t_i)))`: shortest azimuth separation in degrees, 0–180.
- `E_i`: signed apparent ecliptic longitude separation, used only to guard the correct conjunction/apparition cycle.

`wrap180(x) = ((x + 180) mod 360 + 360) mod 360 - 180`.

## 3. Empirical Panchang visibility boundary
Fit a separate threshold for each key `k=(planet,boundary,horizonDirection)`, where planet is Jupiter/Venus, boundary is `astaStart`/`astaEnd`, and direction is rise/set.

For every directly captured source boundary:
1. Find planet rise and set on the normalized local source date.
2. Assign the nearer event only if it is within the strict 5-minute classification tolerance; otherwise reject the row.
3. Calculate `D` and `A` at that exact event.
4. Preserve source row ID, city ID, source URL, printed clock, normalized instant and rollover metadata.

Candidate threshold:
`Dcrit_k(A) = alpha_k + beta_k*A`
with event margin:
`M_i = D_i - Dcrit_k(A_i)`.

Fit robustly (Theil–Sen slope with median intercept, or Huber regression) and compare against a constant-median threshold. Select the azimuth-corrected model only if leave-one-complete-window-out error improves by a predeclared margin and the slope remains stable under leave-one-year-out checks. With only 3–5 samples, prefer the constant median; do not claim a universal law. Never pool different planets, boundaries or horizon directions.

## 4. Select the event, not the nearest timestamp
Evaluate `M_i` over chronological daily horizon events of the same direction. Calibrate transition polarity from source rows separately for each key:
- disappearance: first event where calibrated state changes visible → not visible;
- reappearance: first event where calibrated state changes not visible → visible.

Return that event's actual instant `t_i`. Do **not** interpolate timestamps between daily events about 24 hours apart. Do **not** choose whichever side has the smaller absolute residual: this can shift a boundary by one day. Reject candidates when transition polarity is absent, horizon direction differs, or the event belongs to the wrong conjunction cycle.

## 5. Calibration and validation
Use only rows with explicit provenance: `sourceStatus=direct-page-captured-browser-verified`, `acceptanceEligible=true`, exact requested page year, checked normalized local date/time, and resolved rollover.

Split by complete source windows/years, never random individual boundaries. Report exact local-date agreement, absolute date offset, clock-of-day residual, absolute-instant residual, unmatched/ambiguous boundaries, and independent window/year counts. A small clock residual after nearest-neighbour matching is not exact-date validation; the selector itself must produce the correct event without nearest-event rescue.

## 6. Location
Recompute geometry for the requested observer. Never fall back to Delhi or another city. Named-city source rows are city-level evidence unless provider coordinates are published. Store provider city/ID, project coordinates, and whether coordinates are provider-confirmed or project-selected. Do not transfer a fitted threshold between cities without a held-out-city experiment. Publish only for a city with its own calibration and a recorded observer profile.

## 7. Explicit exclusions
- No fixed geocentric elongation threshold as the sole rule.
- No single universal arcus-visionis angle for all planets and directions.
- No conjunction timestamp substituted for the published boundary.
- No traditional Agastya Udaya label treated as geometric Canopus rise.
- No silent fallback when local events or source evidence are missing.

## 8. Release gate
1. Recheck source rows and clock normalization.
2. Validate train/holdout split by year and full window (no leakage).
3. Require exact event-date predictions on holdout without nearest-event matching.
4. Cover both boundaries and both horizon directions for each released planet.
5. Reject unexplained duplicate, zero-duration, inverted, overlapping or conjunction-mismatched windows.
6. Recompute target-year candidates from the same pinned model, engine and observer profile.
7. Keep main Panchang runtime untouched; annual data page may consume only explicitly accepted records.

A failed gate keeps the affected *derived candidates* in research. It must never rewrite or discard original source observations.
