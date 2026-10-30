# Asta–Udaya benchmark: source audit and acceptance rules

**Status:** benchmark foundation only. No production calculation is changed by this dataset.

## Why this file exists

The previous astronomy test page contains three different kinds of evidence that must not be blended:

1. Drik Panchang's location-specific Tara Asta/Udaya boundaries.
2. Rashtriya Panchang's date-only visibility periods for its Central Station.
3. Tantrakulam / Surya Siddhanta diagnostics and sample elongations.

They describe related but not identical events. A timestamp comparison is valid only after location, event definition, time zone, coordinate frame, and elevation assumptions are aligned.

## Verified reference points added

- **Drik, Pithoragarh, Venus 2025:** 20 Mar 2025 18:42 to 23 Mar 2025 05:40; and 11 Dec 2025 06:25 to 2 Feb 2026 18:15. These are published local times for Pithoragarh. The test coordinates stored in the dataset are OurHinduDharm’s chosen validation point; they are not claimed to be Drik’s undisclosed internal geoname coordinates.
- **Drik, New Delhi, Jupiter 2027:** 17 Aug 2027 19:32 to 13 Sep 2027 05:22. This is a separate city reference, not a Pithoragarh result.
- **Rashtriya Panchang 2026–27, Venus:** western-evening visibility through 12 Oct 2026 and eastern-morning visibility from 29 Oct 2026 at the Central Station. The source gives dates, not exact clock times; this is an independent date-window check only.

## Historical values deliberately excluded

The old test page contains Pithoragarh Venus 2026 (12 Oct 18:05 / 29 Oct 05:49) and Jupiter 2027 (16 Aug 19:24 / 13 Sep 05:09) as manually transcribed values. The currently retrieved primary evidence does not independently confirm those exact Pithoragarh timestamps. They remain quarantined in `excludedUnverifiedData`, not used as pass/fail targets.

The four old Tantrakulam samples are tagged Dehradun and represent sample elongations, not Pithoragarh event boundaries. They are not valid local-time benchmark targets.

## Decision rules for the engine

1. Calculate the Sun and planet from the same ephemeris and coordinate frame.
2. Calculate the observer's local geometry using the selected latitude, longitude, and elevation.
3. Keep classical Surya Siddhanta K/C results as a separate method and output field. Do not mix its positions or sunrise with the Drik-style engine.
4. Compare exact timestamps only against exact-time references for the same location and event definition.
5. Compare date-only official visibility periods only at date precision.
6. Never average outputs from different methods. Record signed time difference, date difference, and source provenance.
7. Do not publish a result as verified if the only support is a fitted threshold or a manually transcribed value.
8. Preserve a no-result state where the event cannot be confidently determined.

## Acceptance gate before production integration

- At least two independently sourced event windows for the same planet and location, where available.
- Both Asta-start and Asta-end are checked; a single boundary is insufficient.
- At least one second location demonstrates that the output responds to observer location. Do not infer a provider’s hidden coordinates from its city label.
- No mixing of geocentric and topocentric coordinates in one derived angle.
- Regression tests pass and the previous production output is not silently re-labelled as Drik-compatible.

## Primary sources

- Drik Pithoragarh Venus 2025: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?time-format=12hour&year=2025
- Drik New Delhi Jupiter 2027: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2027
- Rashtriya Panchang visibility: https://packolkata.imd.gov.in/panchang/en/visibility
- Rashtriya Panchang preface: https://packolkata.imd.gov.in/panchang/en/preface

