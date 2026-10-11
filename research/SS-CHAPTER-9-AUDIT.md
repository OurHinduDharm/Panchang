# Sūrya-siddhānta Chapter 9 Asta/Udaya — Audit Worksheet

**Status:** research only; not a production specification.  
**Branch:** `research/ss-ch9-diagnostic`  
**Production isolation:** `app.js` and `extra-panchang.js` must remain unchanged until the full method and browser behavior are validated.

## Source anchors

- Chapter 9, verses 4–10 (Sanskrit and translation): https://www.siva.sh/surya-siddhanta/9
- Verses 6–10: https://www.siva.sh/surya-siddhanta/9/6-10
- Chapter 9 verse-by-verse source and computational notes: https://www.vidhyamitra.com/surya-siddhanta/9
- Chapter 3, verse 50, on ascensional equivalents in prāṇas: https://www.swaveda.com/texts/surya-siddhanta/3/
- Chapter 7, verses 8–11, including the Sanskrit dṛkkarma rules: https://www.vedaseek.com/books/suryasiddhanta/7
- Burgess English translation, Chapter VII discussion of Akṣa/Āyana dṛkkarma and the stated correction order: https://www.wilbourhall.org/pdfs/suryaenglish.pdf
- Chapter IX.5 and its editorial note on 60 prāṇas per time-degree: https://karmasakha.com/texts/surya-siddhanta
- Chapter VII.8–10 Sanskrit and translation: https://karmasakha.com/texts/surya-siddhanta
- Burgess English translation (Chapter IX discussion): https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf

These references support the textual reading below; they do **not** independently validate the current JavaScript implementation.

## Verse-to-computation worksheet

| Verse | Textual requirement | Implementation / audit requirement | Status |
|---|---|---|---|
| IX.2–3 | Determine the relevant horizon and whether the planetary event is rising or setting from Sun-relative longitude and motion. Superior planets (Jupiter, Mars, Saturn) use west-setting when ahead of the Sun and east-rising when behind; retrograde Venus/Mercury follow this rule; direct/swift Venus/Mercury use the reverse pair. | The research branch now classifies all four event geometries from signed circular longitude difference and signed daily motion. It evaluates the branch at both local sunrise and sunset; if they disagree or either is ambiguous, that date is rejected rather than guessed. | **Implemented as a tested candidate**; actual ephemeris classifications on the four target dates still need browser/output review. |
| IX.4 | For a western event, use Sun/planet positions at sunset; for an eastern event, use positions at sunrise. Then apply dṛkkarma to the planet. | Confirm the exact civil-date sunrise/sunset selection, geocentric coordinate frame, and correction order. | Partially implemented in the research page; not independently validated. |
| IX.5 | Find the interval between the two lagnas in prāṇas; for the western calculation add six signs to both longitudes. Divide the prāṇa interval by 60 to obtain kalāṃśa (time degrees). | The current diagnostic converts an oblique-ascension interval in degrees to prāṇas as `interval × 60`, then divides by 60. This is arithmetically equivalent to the interval in degrees, **provided** the oblique ascensions and their branch are correctly derived. Chapter III.50 describes ascensional equivalents in prāṇas; this equivalence alone does not validate the OA or dṛkkarma formulas. | Arithmetic identity clear; geometric inputs still open. |
| IX.6 | Jupiter 11°, Saturn 15°, Mars 17°. | Use these limits without substituting a modern elongation threshold. | Added isolated unit tests. |
| IX.7 | Venus: west-setting and east-rising use 8°; east-setting and west-rising use 10°. | Select the limit from the classified horizon event, not merely from direct/retrograde motion or the label Asta/Udaya. | Added isolated selector and four branch tests; event classification remains open. |
| IX.8 | Mercury: 12° for the retrograde case and 14° for the swift-motion case described in the verse. | Require a validated motion/event classifier before selecting a Mercury branch. | Threshold table tested; no automatic Mercury classification implemented. |
| IX.9 | Above the prescribed limit the body is visible; below it, invisible, within the treatise's idealized rule. | Do not equate this classical rule with modern naked-eye visibility under haze, terrain, extinction, or twilight conditions. | Interpretation documented; no modern visibility claim made. |
| IX.10 | Difference between current and target kalāṃśa, divided by relative daily motion; retrograde motion uses the sum of motion magnitudes. | Ensure both the current/target measure and the daily motions are in the same corrected time measure. Do not feed raw Sun–planet elongation in place of lagnāntara. | Arithmetic tests pass; upstream conversion remains unvalidated. |
| IX.11 | Supplies an additional rising-time conversion for the time-motion calculation. | Independently derive the precise conversion before implementing a complete date/time estimate. | Not implemented by the isolated arithmetic helper. |

## Code audit findings (research branch)

1. **Correction order:** the older `getDrikkarmaCorrection()` calculates Akṣa from the uncorrected planet RA/declination and then adds Āyana. This is retained only as a comparison baseline. The sequential candidate now calls the isolated `ss_chapter7_drikkarma.js` helper: apply Āyana first, recompute the intermediate ecliptic point's RA/declination, then derive Akṣa from that point. Burgess's explanatory note describes this same intermediate-point sequence. This is the better-supported candidate, but it still requires full numerical validation.
2. **Akṣa arithmetic:** VII.8–9 states planetary latitude × equinoctial shadow ÷ 12, then × the planet's own time from meridian ÷ its own half-day. Since equinoctial shadow ÷ 12 = tan(observer latitude), the helper uses signed `planetLatitude × tan(latitude) × (hour angle / half-day hour angle)`. This equivalence assumes hour angle and the rising hour-angle are both expressed in the same sidereal-angle frame; the new tests cover sign and zero invariants.
3. **Āyana arithmetic:** VII.10 multiplies planetary latitude in arcminutes by the absolute declination (degrees) of the longitude increased by three signs, giving arcseconds; same-name latitude/declination is subtractive and unlike-name is additive. The helper implements that unit conversion explicitly.
4. **Important limitation:** these unit tests are formula-component tests, not independent proof that the full classical method reproduces a published date. The numerical fixture is a transparent, hand-checkable test vector and not an observed planetary event.

## Coordinate and correction audit

The current research page uses Astronomy Engine geocentric vectors, converts the state to ecliptic-of-date, and rotates the original vector to equatorial-of-date for RA/declination. It intentionally avoids mixing geocentric ecliptic latitude with topocentric RA/declination.

The dṛkkarma candidate must still be checked against the Chapter VII construction and independent ephemeris values:

1. **Akṣa-dṛkkarma (VII.8–9):** the text says to multiply planetary latitude by equinoctial shadow, divide by 12, then multiply by the time in ghaṭikās from the planet's meridian passage and divide by the planet's half-day length. Since equinoctial shadow / 12 corresponds to tan(observer latitude), the helper's hour-angle / half-day-angle ratio is the proposed conversion of that time ratio. The isolated tests now check its sign and zero invariants, but not independent event-date accuracy.
2. **Āyana-dṛkkarma:** verify the prescribed longitude shifted by three signs, the declination calculation, the units of planetary latitude and declination, and the same-name/different-name sign rule.
3. **Correction order:** Burgess's explanatory note says the Āyana correction first gives the ecliptic point on the six-o'clock line; applying Akṣa correction to that corrected point then gives the horizon point. This supports the *sequential* order as the source-faithful candidate. The current combined-from-raw-position variant is not equivalent by definition; the sequential code still needs independent numerical checks against the source proportions and sign rules. Do not choose a method merely because its output is closer to a reference date.
4. **Coordinate frame:** the fixed 24.217° ayanāṃśa is a stated research assumption. In the current helper it is restored before the oblique-ascension calculation; this is not an independent validation of ayanāṃśa.
5. **Daily event bracket:** the current scan evaluates one local sunrise or sunset per civil date. A sign change brackets adjacent daily samples; it is not an exact continuous-time root and must not be reported as a precise event instant.
6. **Independent ephemeris:** comparing Astronomy Engine and Swiss Ephemeris at the same UTC instant checks input-state consistency, not the classical formula itself.

## What the latest automated tests establish

At commit `86ab48a89010da334ae2b038dd191214d49f3c28`, GitHub Actions passed:

- 14/14 isolated tests: four relative-motion arithmetic cases plus ten threshold-selection cases.
- Main HTML module syntax.
- Helper import and selector wiring.
- No duplicate HTML IDs.
- Explicit disclosure of the legacy Venus-threshold limitation.
- Production isolation check: `app.js` and `extra-panchang.js` unchanged.

These checks do **not** establish that the complete classical algorithm is correct, nor do they count as a live browser test.

## Next research steps

1. Independently transcribe and derive the Chapter VII Akṣa/Āyana dṛkkarma proportions, units, and signs from the source text.
2. Add small, independently calculated geometry fixtures (equator, northern latitude, southern latitude; east/west hour angle; positive/negative planetary latitude) before testing the four real dates.
3. Validate the IX.2–3 event classifier for the Venus cases; keep the explicit fixture labels until that classifier is proven.
4. Recalculate the four Venus/Jupiter cases using the same documented method and same location/time convention; keep Drik, classical, and heliacal-visibility outputs in separate columns.
5. Perform a live browser test of the research page and inspect console errors before considering any merge.

**Decision gate:** no production patch and no merge until the dṛkkarma derivation, event classification, all four cases, and live browser test have been reviewed.


## Chapter IX event-classification candidate

The research page now calls `classifyChapter9HorizonEvent()` for each date in the ±15-day scan. It derives signed daily longitude motion from geocentric states at ±12 hours around the Sun event, classifies at both sunrise and sunset, and accepts the date only if both classifications agree. It then chooses sunrise for east-side events and sunset for west-side events, and selects the corresponding Chapter IX threshold dynamically. The daily crossing detector now refuses to form a bracket if invalid/ambiguous dates create a gap; it will not silently call a multi-day gap “adjacent daily events”.

This is grounded in the source's explicit IX.2–3 contrast and is covered by twelve added tests for superior-planet branches, direct/retrograde Venus and Mercury, longitude wraparound, exact conjunction, stationary motion, and unsupported bodies. It remains a candidate until the actual calculated classifications and four date brackets are inspected in a live run.

## New Chapter VII formula tests

The research branch now contains `ss_chapter7_drikkarma.js`, an isolated implementation of the sequential VII.8–10 candidate. The research page's sequential diagnostic delegates to this helper; the earlier calculation remains visible as a comparison baseline.

The helper includes a cross-language numeric fixture (same equations independently evaluated in Python) for the intermediate longitude, right ascension, declination, hour angle, half-day angle, both correction terms, and final corrected longitude. It also tests that Akṣa vanishes at the equator, both latitude-dependent corrections vanish for zero planetary latitude, the Akṣa sign reverses with hour-angle sign, and reversing planetary latitude reverses the fixture's correction signs.

These are **internal arithmetic/invariant tests**, not observational validation. They do not make the four Asta/Udaya results authoritative. The next gate remains comparison against an independently implemented Chapter VII derivation and then the four same-location event cases.


## Current automated-test snapshot

The latest successful workflow run after integrating the IX.2–3 classifier is:
https://github.com/OurHinduDharm/Panchang/actions/runs/38182695977

- 26/26 Chapter IX arithmetic, threshold-selection, and event-classification tests passed.
- 7/7 Chapter VII formula-component and invariant tests passed.
- HTML module syntax, helper wiring, duplicate-ID checks, and production isolation passed.

No live browser run has been performed. Therefore the dynamic classifier and four event-date brackets have not yet been observed in the browser, and this does not validate the full classical calculation.
