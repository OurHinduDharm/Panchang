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

## First candidate model to evaluate: Swiss Ephemeris heliacal visibility

The existing `test-astronomy.html` already contains a Swiss Ephemeris `heliacal_ut()` diagnostic. This is the first modern visibility candidate to benchmark, not an automatic winner and not a Drik algorithm clone.

The official Swiss Ephemeris programming documentation defines:
- `dgeo`: longitude, latitude, observer/eye elevation in metres.
- `datm`: pressure, temperature, relative humidity, and atmospheric extinction/meteorological range.
- `dobs`: observer age and Snellen eyesight ratio; optional optical parameters only apply with the corresponding flag.
- Event type 1 = morning first / heliacal rising; event type 2 = evening last / heliacal setting.

The documented method models visibility/contrast and meteorological conditions, which is more physically relevant than a fixed Sun–planet angle alone. It still may differ from Drik's proprietary modern algorithm and must be calibrated against same-location references before acceptance.

Important implementation checks:
- Keep longitude/latitude/elevation order exactly as documented.
- Use the same observer coordinates and atmosphere for both event search and phenomenon diagnostics.
- Treat the returned beginning/optimum/end as a visibility window, not three separate Asta/Udaya boundaries.
- Record the atmospheric and observer assumptions with every result.
- Do not change production output until the event mapping and location tests pass.

Official documentation: https://www.astro.com/swisseph-download/doc/swephprg.2.10.htm

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



## Strict location-to-location rule (added 2026-10-30)

Every case now has an explicit `sourceLocation`, `sourceObserver`, and `comparisonLevel`.

- `coordinate-exact` is allowed only when the source publishes coordinates and the test observer uses those same coordinates.
- `city-label-only` means the source gives a city name but does not disclose its exact observer coordinates. Such a case may be discussed only as a same-city reference; it is not an exact coordinate match and must not be used to claim minute-level location equivalence.
- New Delhi data must never be evaluated using Pithoragarh coordinates. If Delhi coordinates are unavailable, the Delhi calculation remains unavailable.
- The Rashtriya Panchang Central Station is a separate observer with its own published coordinates. It is never a Pithoragarh result.
- No averaging, blending, or cross-city substitution is permitted.

### Existing test-page quarantine

The current `test-astronomy.html` contains a Dehradun/Tantrakulam sample set in `REFERENCES`, while its global `CONFIG` is Pithoragarh. Those samples are elongation diagnostics, not local event-time boundaries; the Swiss heliacal routine in that page uses the global Pithoragarh observer. Therefore those Dehradun rows are **not valid local heliacal benchmarks** and must not be presented as such. The separate manually transcribed Pithoragarh 2026/2027 times remain excluded above. Until a location-bound reference adapter is in place, do not use that page's Swiss result table to certify any Drik location match.

The current Swiss test page also supplies fixed sea-level pressure (1013.25 hPa) at the 1650 m project observer. Swiss documentation says all-zero atmospheric inputs invoke altitude-adjusted defaults. This input should be corrected in the dedicated location-bound benchmark runner before any further comparison; existing outputs made with the fixed sea-level pressure are not accepted as final evidence.
