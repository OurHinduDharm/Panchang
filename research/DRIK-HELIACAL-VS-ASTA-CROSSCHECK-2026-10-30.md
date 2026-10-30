# Drik Asta/Udaya cross-check against Swiss Ephemeris — 2026-10-30

Status: research evidence only. No production calculation or display is changed by this report.

## Purpose

Test whether Swiss Ephemeris `heliacal_ut()` can be used as a direct replacement for Drik Panchang's location-dependent Asta/Udaya event times. The test uses the published New Delhi 2026 Drik boundaries already recorded in `research/DRIK-ASTA-UDAya-BENCHMARKS-2026.md`, plus the Pithoragarh 2026/2027 boundaries supplied by the project owner.

## Reproducible setup

Independent calculation executed with PySwissEph 2.10.03 (Swiss Ephemeris 2.10.03).

- Flags: `FLG_SWIEPH | HELFLAG_HIGH_PRECISION`
- Event mapping: `HELIACAL_SETTING = 2` for evening last / Asta beginning; `HELIACAL_RISING = 1` for morning first / Asta ending.
- Observer: `[36, 1, 0, 0, 0, 0]` (age 36, Snellen ratio 1; remaining optical parameters ignored without optical-parameters flag).
- Primary atmospheric input: `[0, 0, 0, 0]`, allowing Swiss Ephemeris to select its documented defaults and altitude adjustment.
- Sensitivity check: `[1013.25, 15, 40, 0]`, the fixed sea-level pressure input previously hard-coded in the browser diagnostic.
- Pithoragarh: longitude 80.2182 E, latitude 29.5828 N, elevation 1650 m.
- New Delhi: longitude 77.2090 E, latitude 28.6139 N, elevation 216 m.
- Returned slot `dret[0]` (start of visibility) is compared with the published boundary. All UTC Julian dates were converted to India Standard Time (UTC+05:30).

Swiss documentation defines `heliacal_ut()` as the next heliacal phenomenon after a start date; its result array contains beginning, optimum and end of visibility. Its visibility criterion depends on celestial positions, observer location/height/eyesight and atmospheric extinction. This is therefore a physically meaningful independent visibility model, but it is not proof of Drik's undisclosed algorithm.

## New Delhi 2026 — Drik published boundary versus Swiss heliacal start

All Drik values below are the published New Delhi local times.

| Planet | Boundary | Drik IST | Swiss IST (atmospheric defaults) | Difference |
|---|---|---:|---:|---:|
| Venus | Asta begins | 12 Oct 2026 18:19 | 09 Oct 2026 18:06:59 | −72 h 12 m |
| Venus | Asta ends | 29 Oct 2026 06:00 | 30 Oct 2026 06:03:49 | +24 h 04 m |
| Mercury | Asta begins | 25 Oct 2026 18:31 | 16 Oct 2026 18:26:13 | −216 h 05 m |
| Mercury | Asta ends | 11 Nov 2026 05:40 | 13 Nov 2026 05:49:26 | +48 h 09 m |
| Jupiter | Asta begins | 15 Jul 2026 19:59 | 07 Jul 2026 19:48:45 | −192 h 10 m |
| Jupiter | Asta ends | 12 Aug 2026 05:03 | 15 Aug 2026 05:15:30 | +72 h 13 m |
| Mars | Asta begins | 01 Nov 2025 18:36 | 22 Sep 2025 18:56:56 | −959 h 39 m |
| Mars | Asta ends | 02 May 2026 04:30 | 20 May 2026 04:36:44 | +432 h 07 m |
| Saturn | Asta begins | 13 Mar 2026 19:13 | 04 Mar 2026 18:56:46 | −216 h 16 m |
| Saturn | Asta ends | 22 Apr 2026 04:49 | 29 Apr 2026 04:55:45 | +168 h 07 m |

These are not acceptable Drik matches. The errors are measured in days, not minutes. The direction and size of the error are not constant across planets or boundaries.

## Pithoragarh supplied checkpoints

These are user-supplied Drik checkpoints, not independently scraped Drik values.

| Planet | Boundary | Supplied Drik IST | Swiss IST (atmospheric defaults) | Difference |
|---|---|---:|---:|---:|
| Venus 2026 | Asta begins | 12 Oct 2026 18:05 | 11 Oct 2026 17:52:32 | −24 h 12 m |
| Venus 2026 | Asta ends | 29 Oct 2026 05:49 | 29 Oct 2026 05:54:43 | +5 m 43 s |
| Jupiter 2027 | Asta begins | 16 Aug 2027 19:24 | 11 Aug 2027 19:17:38 | −120 h 06 m |
| Jupiter 2027 | Asta ends | 13 Sep 2027 05:09 | 14 Sep 2027 05:14:21 | +24 h 05 m |

The same Swiss model can be close for an ending boundary while being several days early for the corresponding beginning boundary. A single global time correction would therefore be invalid.

## Atmospheric-input defect found

The earlier browser diagnostic supplied `[1013.25, 15, 40, 0]` at every elevation. This pins sea-level pressure even for Pithoragarh at 1650 m, bypassing Swiss Ephemeris' documented default altitude adjustment.

For Pithoragarh Jupiter 2027, changing from fixed sea-level atmosphere to all-zero documented defaults moves the Swiss setting result from 09 Aug 2027 19:57 IST to 11 Aug 2027 19:17 IST (about 1 day 23 hours). The rising result moves only by minutes. For Pithoragarh Venus 2026, the setting result moves from 10 Oct to 11 Oct, while the rising result also shifts by only minutes.

This is a real diagnostic-input bug. The all-zero atmospheric array is the correct neutral baseline when local meteorological observations are not supplied; it lets Swiss Ephemeris apply its documented defaults and elevation adjustment. It is not a universal local-weather model.

## Decision

1. **Do not use Swiss `heliacal_ut()` as the production Drik-compatible Asta/Udaya engine.** It is a distinct heliacal visibility model and the benchmark errors disprove a direct substitution.
2. Retain it as an independent visibility diagnostic only, with explicit location, elevation and atmospheric inputs.
3. Do not tune one arbitrary atmosphere/age/visibility parameter to force a handful of event dates to match. That would overfit and could break other planets, boundaries and locations.
4. The next production investigation must recover the actual event semantics used by Drik: determine the local-time boundary calculation from apparent/topocentric planetary geometry and the Sun's local horizon state, then test both sides of each boundary and multiple cities.
5. Keep Surya-siddhanta Chapter IX K/C calculations separate from this modern Drik-compatible track.

## Primary documentation and references

- Swiss Ephemeris heliacal event definition, observer/geography/atmosphere parameters and result slots: https://www.astro.com/swisseph/swephprg.htm
- Swiss Ephemeris heliacal visibility model and its dependence on location, observer and atmospheric extinction: https://www.astro.com/swisseph/swisseph.htm
- Drik Panchang Venus 2026 New Delhi event times and its distinction between approximate Surya-siddhanta angular thresholds and location-based modern timings: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html
- Drik Panchang Mercury 2026 New Delhi event times: https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html
- Drik Panchang Jupiter 2026 New Delhi event times: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html
- Drik Panchang Mars 2026 New Delhi event times: https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html
- Drik Panchang Saturn 2026 New Delhi event times: https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html

No production file, Blogger page, or published CDN file is changed by this audit.
