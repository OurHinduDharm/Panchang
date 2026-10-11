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
| IX.10 | Difference between current and target kalāṃśa, divided by relative daily motion; retrograde motion uses the sum of motion magnitudes. | The diagnostic keeps signed lagnāntara and signed daily motion so past/future is not lost. | Implemented as a candidate; tested against daily brackets below. |
| IX.11 | Convert each body's daily longitude motion to time-motion using its sign's rising-asus, dividing the product by 1800. | The research page calculates sign rising-asus from the oblique-ascension span of the same event-frame sign and computes signed estimated days. For western events it uses the longitudes shifted by six signs, as IX.5 requires. | Implemented as a tested candidate; the event-frame detail matters and is covered by the latest browser run. |

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



## Four-case calculation results from headless Chromium

Location used for this comparison: TKS reference point 29.5830° N, 80.2090° E; elevation assumed 0 m because the reference did not specify elevation. Times are local IST. “Estimate” is signed days from the reference-date Sun event: positive = future, negative = past. The bracket is the daily sequential (K-C) sign change; the error is the absolute difference between the IX.10–11 estimate and a linear interpolation of that bracket.

| Case | Classified event | Sequential K at reference date | C | IX.10–11 estimate (days) | Daily sequential bracket | Estimate/bracket difference |
|---|---|---:|---:|---:|---|---:|
| Venus Asta, target 12 Oct 2026 | west-setting | 8.4127° | 8° | +0.4221 | 12 Oct 17:42:20 → 13 Oct 17:41:13 | 0.0204 d |
| Venus Udaya, target 1 Nov 2026 | east-rising | 13.8062° | 8° | −3.3104 | 28 Oct 06:19:17 → 29 Oct 06:20:00 | 0.2672 d |
| Jupiter Asta, target 20 Aug 2027 | west-setting | 6.5587° | 11° | −8.2404 | 12 Aug 18:53:03 → 13 Aug 18:52:08 | 0.6067 d |
| Jupiter Udaya, target 13 Sep 2027 | east-rising | 11.1504° | 11° | −0.1719 | 12 Sep 05:52:00 → 13 Sep 05:52:31 | 0.0030 d |

All four IX.10–11 estimates are within 0.75 day of the linearly interpolated daily bracket in the current test. This is an **internal consistency check**, not an independent proof: both paths share the same ephemeris, event classification, and dṛkkarma candidate, and the daily bracket itself is only a once-per-sunrise/sunset scan.

### Discrepancies that remain open

- Venus Asta and Jupiter Udaya align closely with the supplied reference date under the daily-event convention.
- The diagnostic's current classical threshold crossing for Venus Udaya is around 28–29 October, while the supplied reference fixture is 1 November.
- The diagnostic's current classical threshold crossing for Jupiter Asta is around 12–13 August, while the supplied reference fixture is 20 August.
- These differences must not be “corrected” by shifting thresholds or dates to fit a reference. Next determine whether the reference uses the same event definition, longitude frame, and classical procedure, and independently audit the Chapter VII correction and Chapter III rising-asus derivation.

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

- 32/32 Chapter IX arithmetic, threshold-selection, event-classification, and IX.10–11 conversion tests passed.
- 7/7 Chapter VII formula-component and invariant tests passed.
- HTML module syntax, helper wiring, duplicate-ID checks, and production isolation passed.
- Headless Chromium loaded the research page, calculated all four cases, and passed the event-branch and IX.10–11 bracket-consistency checks.

A headless Chromium run has been performed in CI. A separate manual run on the user's device has not been performed. The browser result does not validate the full classical calculation or resolve the two reference-date discrepancies.
