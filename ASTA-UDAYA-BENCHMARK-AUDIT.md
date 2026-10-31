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


## Real-browser Swiss run and search-window correction (2026-10-30)

A Chromium run successfully executed the Swiss WASM calculation at the project observer (29.5828° N, 80.2182° E, 1650 m). The first run showed that the returned event must be evaluated against the exact boundary rather than assumed to be a match merely because it is the next event returned by Swiss.

For the March 2025 Pithoragarh city-label reference, the initial run returned:
- Evening-last visibility: 18 Mar 2025 18:28 IST versus published 20 Mar 2025 18:42 IST (−2,893.9 minutes).
- Morning-first visibility: 24 Mar 2025 05:39 IST versus published 23 Mar 2025 05:40 IST (+1,439.1 minutes).

These are real calculated results, but **not a match** and not grounds to tune a threshold. The event model may differ. The test page now starts 10 days before the published timestamp (using its explicit timezone offset), which bounds the candidate search near the reference; this window does not itself prove event equivalence. It then reports the actual signed time difference. The browser test asserts that a finite difference is rendered; it does not require or fabricate a match. Re-run the browser workflow and review its logged numbers before drawing any accuracy conclusion.


## Progress checkpoint — 2026-10-31

### Completed in this checkpoint
- Fixed over-escaped regular expressions in `tests/asta-udaya-browser.spec.mjs`; the browser test now extracts the two event blocks and signed minute deltas correctly.
- Confirmed the latest GitHub Actions run for head `8365a135b88894c9a8df2bdf705b3c04ec64569e`: browser validation run `41133812210` **success**, 1 test passed / 0 failed; standard Panchang feature validation run `41133812333` **success**.
- The actual Chromium/Swiss result remains unchanged: Evening Last is −2,893.9 minutes from the published Asta-start; Morning First is +1,439.1 minutes from the published Asta-end. This confirms test stability, not agreement between event models.
- Re-inspected production `main/extra-panchang.js` (blob `d1ab028cfd84224462ced2da9f1bb9ac045cc9a0`). It still uses provisional ecliptic-longitude thresholds and marks verification pending. Production has not been changed by this benchmark PR.

### Six-stage delivery tracker
1. **Reference provenance and test harness** — substantially complete. References are explicitly location/source-bound; browser execution and feature checks pass. Exact provider coordinates remain undisclosed for the Pithoragarh city-label references.
2. **Event-definition and numerical discrepancy review** — in progress. The measured Swiss/Drik time deltas are large; no threshold fitting is permitted. Need reliable same-location, same-event-definition evidence before declaring the method verified.
3. **Choose the production method and its limits** — pending. Keep Drik-style modern calculations separate from the classical Sūrya-siddhānta diagnostic.
4. **Production performance baseline and safe optimization** — pending. First capture repeatable before/after timings and output snapshots; preserve the 400-day search limit, crossing direction, and approximately one-minute root tolerance unless an independently justified change is approved.
5. **Production integration and regression tests** — pending; no production calculation changes are part of PR #149 at this checkpoint.
6. **Location/date acceptance checks, merge and publish** — pending; includes Pithoragarh and a second location, past/future dates, event ordering, and explicit no-result behavior.

### Time estimate
The original 8–17 hours was an estimate of active engineering/review time, not a delivery promise. Given the unresolved event-model discrepancy, remaining work is provisionally **6–14 active hours** after the reference decision is made; if a trustworthy same-event reference cannot be obtained, the correct result may be a documented limitation rather than a falsely “matched” algorithm. Calendar time depends on review/CI turnaround. Do not mark stages 2–6 complete until their acceptance checks actually pass.

### Production performance review checkpoint — 2026-10-31

Read-only inspection of production `main/extra-panchang.js` (blob `d1ab028cfd84224462ced2da9f1bb9ac045cc9a0`) confirms:

- `getPlanetEvent()` performs separate nearest-boundary searches for Asta and Udaya. Both searches share `planetDailyCache`, so cached daily elongation samples are reused within the page session; treating the two searches as wholly independent would overstate duplicated work.
- `findNearestAngularBoundary()` scans daily brackets in the direction implied by the selected date's relation to the threshold, up to the existing 400-day bound.
- `findThresholdCrossingInstant()` bisects the daily bracket until its width is at most about one minute, with the existing 18-iteration cap.
- `planetEventBracketCache` reuses a paired result only when both found instants enclose the selected local noon; it is bounded to 12 intervals per planet.
- The current performance mark combines planetary calculation and card construction, so it does not by itself identify whether ephemeris calls, cache misses, or rendering dominate the measured phase.

**No production code or thresholds were changed during this review.** A new numeric baseline has not been measured in this checkpoint; the previously recorded 616–654 ms is historical and must not be presented as a fresh measurement.

#### Safe next benchmark/optimization gate

1. Capture repeated `?perf=1` runs for the same fixed date and location, including first (cold) and subsequent (warm) updates.
2. Record the five planets' displayed Asta/Udaya strings and no-result states as the output fingerprint.
3. Add finer instrumentation only if it can be done without changing astronomy inputs or returned values; distinguish boundary search from card rendering.
4. Change one measured bottleneck at a time. Re-run the same fixed cases and compare exact output fingerprints, event ordering, and cold/warm timing distributions.
5. Preserve thresholds, observer, 400-day limit, daily bracketing, bisection tolerance, and no-result behavior unless a separate correctness review explicitly approves a change.

A speedup is accepted only when repeatable timings improve and all output fingerprints remain identical. A different output is a correctness regression, not an optimization.



## Repeatable production performance baseline — 2026-10-31 (CI Chromium)

The new browser test on PR head `0449c8ce8e7d1923674d883b3e0236d41b8a0751` passed (1/1; 0 failures). The standard feature workflow also passed (139/139 feature tests and 3/3 Asta/Udaya direction tests).

Fixed observer: Pithoragarh (29.5828° N, 80.2182° E, 1650 m), selected date 2026-10-31. Observed combined `planet rise/set calculation and card` timings:
- First/cold update: **233.1 ms**.
- Date switched to 2026-11-01: **81.6 ms**, then **75.3 ms** on repeated update.
- Date switched back to 2026-10-31: **75.1 ms**, then **74.1 ms** on repeated update.
- Visible Asta/Udaya card fingerprint was identical after switching away and back; test passed.

These are repeatable browser-run measurements, not a proven before/after speedup. They are not directly comparable to the historical 616–654 ms log because the earlier environment/run conditions are not controlled here. No production JS, thresholds, search bounds, or calculation outputs were changed. Next safe step: establish a same-environment baseline, then optimize only a measured bottleneck and require exact fingerprint equality.


## CI timing correction and phase-level measurement — 2026-10-31

The successful run #41162201755 log was inspected directly. The precise production phase measurements are:
- Initial 2026-10-31 update: **219.7 ms** for planetary calculation + card.
- 2026-11-01 update: **78.0 ms**, then **71.1 ms** on the repeated update.
- Return to 2026-10-31: **70.5 ms**, then **70.1 ms** on the repeated update.
- The final visible card fingerprint exactly matched the initial fingerprint; browser test passed 1/1, with no uncaught page errors.
- The full Extra Panchang update was 297.2 ms initially; DOM replacement itself was 1.2 ms. Thus DOM replacement is not the bottleneck in this run.

**Correction:** An earlier checkpoint note gave approximate values of 233.1 ms and 74–82 ms. Those were not the values in the captured CI log. Use the log-derived figures above as the authoritative measurements for run #41162201755. The older 616–654 ms figure remains a separate historical run and is not a controlled before/after comparison.

Standard feature CI run #41162201760 also passed: 139/139 feature tests and 3/3 Asta/Udaya direction tests. The Swiss heliacal browser test passed 1/1, but its event times still differ from the published Drik boundaries by −2,893.9 and +1,439.1 minutes respectively; this remains a diagnostic mismatch, not a verified method.

The measurable hot path is now clearly the planetary calculation/card phase (about 70 ms warm, 220 ms cold in this CI run), not DOM replacement. Next instrumentation should split ephemeris calls, daily-cache hits/misses, bisection calls, and card formatting without altering any astronomy inputs or returned values. Do not attempt a speed optimization until this split identifies a safe target.
