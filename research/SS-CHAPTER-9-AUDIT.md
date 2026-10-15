# Sūrya-siddhānta Chapter 9 Asta/Udaya — Audit Worksheet

**Status:** research only; not a production specification.  
**Branch:** `research/ss-ch9-diagnostic`  
**Production isolation:** `app.js` and `extra-panchang.js` must remain unchanged until the full method and browser behavior are validated.

## Source anchors

- Chapter 9, verses 4–10 (Sanskrit and translation): https://www.siva.sh/surya-siddhanta/9
- Verses 6–10: https://www.siva.sh/surya-siddhanta/9/6-10
- Chapter 9 verse-by-verse source and computational notes: https://www.vidhyamitra.com/surya-siddhanta/9
- Chapter 3, verse 50, on ascensional equivalents in prāṇas: https://www.swaveda.com/texts/surya-siddhanta/3/
- Chapter 7, verses 7–11, Sanskrit with Burgess translation and the explanatory note distinguishing Āyana and Akṣa correction: https://www.swaveda.com/texts/surya-siddhanta/7/
- Chapter 9, verses 2–5 and 6–10, including event classification and the prescribed limits: https://www.vidhyamitra.com/surya-siddhanta/9
- Burgess English translation, Chapter VII discussion of Akṣa/Āyana dṛkkarma and the stated correction order: https://www.wilbourhall.org/pdfs/suryaenglish.pdf
- Chapter IX.5 and its editorial note on 60 prāṇas per time-degree: https://karmasakha.com/texts/surya-siddhanta
- Chapter VII.8–10 Sanskrit and translation: https://karmasakha.com/texts/surya-siddhanta
- Burgess English translation (Chapter IX discussion): https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf

These references support the textual reading below; they do **not** independently validate the current JavaScript implementation.

## Verse-to-computation worksheet

| Verse | Textual requirement | Implementation / audit requirement | Status |
|---|---|---|---|
| IX.2–3 | Determine the relevant horizon and whether the planetary event is rising or setting from Sun-relative longitude and motion. Superior planets (Jupiter, Mars, Saturn) use west-setting when ahead of the Sun and east-rising when behind; retrograde Venus/Mercury follow this rule; direct/swift Venus/Mercury use the reverse pair. | The initial implementation used shortest signed circular separation, which incorrectly reverses the greater/less zodiacal-longitude branch when the pair straddles 0° Aries. The research helper now compares normalized zodiacal longitudes directly, while using signed daily motion for the inferior-planet branch. It evaluates at both local sunrise and sunset; disagreement or ambiguity rejects the date. | **Corrected in research code; awaiting the latest CI run and live event-output review.** The four fixture dates remain unverified gold standards. |
| IX.4 | For a western event, use Sun/planet positions at sunset; for an eastern event, use positions at sunrise. Then apply dṛkkarma to the planet. | Confirm the exact civil-date sunrise/sunset selection, geocentric coordinate frame, and correction order. | Partially implemented in the research page; not independently validated. |
| IX.5 | Find the interval between the two lagnas in prāṇas; for the western calculation add six signs to both longitudes. Divide the prāṇa interval by 60 to obtain kalāṃśa (time degrees). | The current diagnostic converts an oblique-ascension interval in degrees to prāṇas as `interval × 60`, then divides by 60. This is arithmetically equivalent to the interval in degrees, **provided** the oblique ascensions and their branch are correctly derived. Chapter III.50 describes ascensional equivalents in prāṇas; this equivalence alone does not validate the OA or dṛkkarma formulas. | Arithmetic identity clear; geometric inputs still open. |
| IX.6 | Jupiter 11°, Saturn 15°, Mars 17°. | Use these limits without substituting a modern elongation threshold. | Added isolated unit tests. |
| IX.7 | Venus: west-setting and east-rising use 8°; east-setting and west-rising use 10°. | Select the limit from the classified horizon event, not merely from the label Asta/Udaya. The motion/longitude classifier maps the four cases to those event types. | Threshold selector and event-classifier tests pass; external benchmark equivalence remains open. |
| IX.8 | Mercury: 12° for the retrograde case and 14° for the swift-motion case described in the verse. | Require a non-ambiguous signed-motion classification; stationary/unsupported cases must not receive a guessed threshold. | Threshold table and event classifier are tested; external benchmark equivalence remains open. |
| IX.9 | Above the prescribed limit the body is visible; below it, invisible, within the treatise's idealized rule. | Do not equate this classical rule with modern naked-eye visibility under haze, terrain, extinction, or twilight conditions. | Interpretation documented; no modern visibility claim made. |
| IX.10 | Difference between current and target kalāṃśa, divided by relative daily motion; retrograde motion uses the sum of motion magnitudes. | The diagnostic keeps signed lagnāntara and signed daily motion so past/future is not lost. | Implemented as a candidate; tested against daily brackets below. |
| IX.11 | Convert each body's daily longitude motion to time-motion using its sign's rising-asus, dividing the product by 1800. | The research page calculates sign rising-asus from the oblique-ascension span of the same event-frame sign and computes signed estimated days. For western events it uses the longitudes shifted by six signs, as IX.5 requires. | Implemented as a tested candidate; the event-frame detail matters and is covered by the latest browser run. |

## Keep the three event definitions separate

The reference dates currently listed in `SHASTRIYA_REFERENCES` are **working comparison fixtures**, not a verified same-location gold standard. Their original source, coordinates, event definition, and civil-date convention still need to be traced before the differences can be interpreted.

This distinction matters because TKS's public pages describe two separate outputs:
- A classical Sūrya-siddhānta Ch. 9 layer using `K = lagnāntara-asu ÷ 60` and the prescribed (K > C) rule.
- A modern apparent ecliptic-of-date elongation rule comparing Sun–planet separation with the prescribed angular limit.

TKS explicitly says these are different models and that the angular-orb result is not physical heliacal visibility. The current research page therefore now displays **ecliptic longitude separation**, **true 3-D elongation**, and **Chapter IX lagnāntara K candidate** in separate columns. They must not be treated as interchangeable. The current browser checks verify that all three outputs calculate and render; the next review must compare like-for-like methods using the same location, ephemeris, apparent/geometric convention, and local event time.

Sources: https://tksephemeris.com/tks-home and https://tksephemeris.com/tks-udaya-asta.

A second independent implementation describes its daily output as calculated from the Sūrya Siddhānta's own rules, at Ujjayinī, using no bīja correction. That is a different benchmark from applying Chapter VII/IX corrections to modern ephemeris positions at Pithoragarh. The two should not be compared as if they were the same calculation pipeline. See https://vidhyamitra.com/surya-siddhanta/9 and the chapter overview at https://vidhyamitra.com/surya-siddhanta.

## Latest checkpoint — 12 October 2026

- The isolated Chapter IX event-classification tests cover superior-planet branches for Jupiter, Mars, and Saturn, plus both directions for retrograde/direct Mercury. A later review found the wraparound fixture had encoded the wrong premise: IX.2–3's *abhyadhika/ūna* compares zodiacal longitude ordering, not the shortest signed separation. The test and classifier have now been corrected for both sides of 0° Aries.
- GitHub Actions run: https://github.com/OurHinduDharm/Panchang/actions/runs/38208959013 — **success**. This includes Node formula tests, Chapter VII tests, Chapter III tests, the research page in headless Chromium, and the production-file identity check.
- This is an automated/headless browser pass only. It is not a test on the user's Android device and does not validate the date fixtures as astronomical ground truth.
- Production isolation verified by blob identity against `main`: `app.js` and `extra-panchang.js` are unchanged. The research branch has not been merged.

## Verified benchmark-source distinction (12 October 2026)

- **Drik Panchang Venus Asta page:** https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?lang=en — the Delhi page lists 12 October 2026 at 18:19 as the start and 28 October 2026 at 30:00+ as the end. Its own note says its timings use modern algorithms and are observer-location based; it separately describes the Sūrya-siddhānta angular-separation rule as approximate. Therefore these times are useful as a modern location-dependent comparison, but they are not by themselves proof of the classical lagnāntara result.
- **TKS Udaya-asta page:** https://tksephemeris.com/tks-udaya-asta — explicitly separates its Shāstrīya lagnāntara-asu model from geometric arcus-visionis and Schaefer physical-visibility models. This confirms that the research page should preserve separate result columns and labels.
- These source descriptions clarify what the comparison values mean; they do **not** yet explain the numerical date differences in our four fixtures. No discrepancy cause is declared until both calculations are reproduced with the same observer, time convention, ephemeris/coordinate convention, and event definition.

## Elevation / horizon sensitivity audit (12 October 2026)

A research-only panel was added to test-astronomy.html; it does not change the Chapter IX event algorithm or production files. It compares:

1. The existing TKS diagnostic coordinates at 0 m elevation (baseline).
2. The same coordinates with the supplied 1563 m above-sea-level elevation.
3. The more precise supplied coordinates (29.5830° N, 80.2090° E) with 1563 m elevation.
4. A deliberately hypothetical observer 100 m above local ground, using Astronomy Engine's separate `metersAboveGround` argument only to illustrate horizon dip.
5. A separate `SearchAltitude` calculation at geometric solar-center altitude −0.833°.

Astronomy Engine documents `Observer` elevation as height above sea level, and `metersAboveGround` as a separate parameter for a raised observer; the latter affects the horizon dip. `SearchRiseSet` models the Sun's upper limb and typical refraction, while its `SearchAltitude` documentation explicitly warns that it is not intended to calculate sunrise/sunset because it does not combine the same upper-limb and refraction handling. Sources: https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md and https://github.com/cosinekitty/astronomy/releases/tag/v2.1.17.

The TKS values supplied for comparison are sunrise 06:08:40 and sunset 17:47:21 for “दृश्य — ऊँचाई + वक्रीभवन”, versus sunrise 06:08:40 and sunset 17:42:21 for “गणित — मानक −0.833°”. The panel records these as external inputs and does not assert that the library should reproduce them. The hypothetical 100 m above-ground row is not an assumption about the actual Pithoragarh observer. Real mountain skyline/terrain obstruction is not modelled. The exact TKS interpretation of “ऊँचाई + वक्रीभवन” remains unresolved; no formula is fitted to the five-minute sunset difference.

## Decision gate before calling the method validated

1. **Resolve coordinate-frame convention.** Derive and document whether the classical 24° construction is a changed ecliptic-to-equatorial transform in a fixed equatorial frame or a changed equator frame; do not mix apparent sidereal time and coordinates from different frames. Verify the derivation with an independent vector construction and an authoritative numerical example.
2. **Recover each fixture's provenance.** For every Venus/Jupiter reference, record exact source URL, source publication/update date, observer coordinates/elevation, timezone, the event's local date/time meaning, and whether it is classical, apparent-angular, or physical visibility.
3. **Compare like with like.** Recompute each event using the same observer and instant with an independently sourced ephemeris; report intermediate Sun/planet coordinates, dṛkkarma components, signed lagnāntara, selected IX.6–8 limit, and the resulting crossing bracket. Never tune a formula to force a date match.
4. **Expand coverage to all five planets.** Keep each planet's source-specific rule and event branch explicit. Unknown or stationary cases must be reported as unresolved rather than assigned a guessed limit.
5. **Human review and device check.** Once the preceding checks are reproducible, ask the project owner to inspect the research page on Android. Only after that review should a minimal production integration be proposed.

**Decisive stage definition:** the method is ready for a production proposal only when the coordinate-frame blocker is resolved, each claimed benchmark has traceable provenance, independent same-condition recomputation agrees within a declared tolerance, and all event branches have passing regression tests. A green CI run alone is not this decision.

## Code audit findings (research branch)

1. **Correction order and Akṣa inputs:** Burgess's note says Āyana-corrected longitude gives the ecliptic point on the six-o'clock line, then Akṣa correction gives the point on the horizon. Verse VII.8 specifies the planet's own meridian-time and half-day quantities. The helper therefore applies Āyana to the intermediate longitude but calculates Akṣa's hour angle and half-day from the original planet's longitude and signed ecliptic latitude, using the stated 24° obliquity. This is a source-supported interpretation that now has a direct regression test; it still needs independent numerical validation.
2. **Akṣa arithmetic:** VII.8–9 states planetary latitude × equinoctial shadow ÷ 12, then × the planet's own time from meridian ÷ its own half-day. Since equinoctial shadow ÷ 12 = tan(observer latitude), the helper uses signed `planetLatitude × tan(latitude) × (hour angle / half-day hour angle)`. This equivalence assumes hour angle and the rising hour-angle are both expressed in the same sidereal-angle frame; the new tests cover sign and zero invariants.
3. **Āyana arithmetic:** VII.10 multiplies planetary latitude in arcminutes by the absolute declination (degrees) of the longitude increased by three signs, giving arcseconds; same-name latitude/declination is subtractive and unlike-name is additive. The helper implements that unit conversion explicitly.
4. **Important limitation:** these unit tests are formula-component tests, not independent proof that the full classical method reproduces a published date. The numerical fixture is a transparent, hand-checkable test vector and not an observed planetary event.

## Coordinate and correction audit

The current research page uses Astronomy Engine geocentric vectors, converts the state to ecliptic-of-date, and rotates the original vector to equatorial-of-date for RA/declination. It intentionally avoids mixing geocentric ecliptic latitude with topocentric RA/declination.

The dṛkkarma candidate must still be checked against the Chapter VII construction and independent ephemeris values:

1. **Critical coordinate-frame question — unresolved:** the sequential helper computes planetary RA/declination from tropical longitude using a fixed 24° obliquity, but its local sidereal angle comes from the modern apparent sidereal-time function. Unless those angles are transformed to the same equator/equinox frame, subtracting them for the hour angle may mix coordinate frames. The legacy candidate uses modern EQD RA with modern apparent sidereal time consistently, but combines that with a fixed 24° construction for Āyana correction. Neither candidate should be declared fully source-faithful until this frame relationship is derived and tested. This is a blocker for interpreting the final event dates.

### Coordinate-frame correction now under test

The previous Chapter VII candidate compared a planet's RA computed with a fixed 24° obliquity against local apparent sidereal time measured in the modern true-equator-of-date frame. Those are not exactly the same equatorial frame. The helper now transforms the local meridian angle into the 24° calculation frame before deriving the planet's hour angle.

This transformation is a **coordinate-geometry consistency correction**, not a new Sūrya-siddhānta verse or proof that 24° is the correct value for every date. If θ is the source-frame local sidereal angle and Δε = ε_source − ε_target, the meridian-plane/equator intersection gives:

θ_target = atan2(sin θ, cos θ × cos Δε)

The atan2 form preserves the quadrant. Three isolated tests check identity when the obliquities match, a finite small correction when they differ, and wraparound near 360°. The browser diagnostic now displays the source sidereal angle, transformed 24°-frame angle, and applied correction. This should reduce the internal coordinate mismatch; it is not expected by itself to explain a multi-day discrepancy.

Headless Chromium after this correction showed the following source-to-24° meridian-angle adjustments at the four reference Sun events: Venus Asta −0.000663°, Venus Udaya −0.001377°, Jupiter Asta +0.000971°, and Jupiter Udaya +0.000578°. The resulting sequential K values were 7.883540°, 13.842884°, 6.509353°, and 11.170043°, respectively. The changes are tiny and **do not explain** the roughly seven-day Jupiter-Asta or late-October Venus-Udaya discrepancies. They remove one small frame inconsistency, not the central uncertainty. A stricter numeric regression test now checks the transformation against a fixed expected value.

2. **Akṣa-dṛkkarma (VII.8–9):** the text says to multiply planetary latitude by equinoctial shadow, divide by 12, then multiply by the time in ghaṭikās from the planet's meridian passage and divide by the planet's half-day length. Since equinoctial shadow / 12 corresponds to tan(observer latitude), the helper's hour-angle / half-day-angle ratio is the proposed conversion of that time ratio. The isolated tests now check its sign and zero invariants, but not independent event-date accuracy.
3. **Āyana-dṛkkarma:** verify the prescribed longitude shifted by three signs, the declination calculation, the units of planetary latitude and declination, and the same-name/different-name sign rule.
4. **Correction order:** Burgess's explanatory note says the Āyana correction first gives the ecliptic point on the six-o'clock line; applying Akṣa correction to that corrected point then gives the horizon point. This supports the *sequential* order as the source-faithful candidate. The current combined-from-raw-position variant is not equivalent by definition; the sequential code still needs independent numerical checks against the source proportions and sign rules. Do not choose a method merely because its output is closer to a reference date.
5. **Ayanāṃśa:** the fixed 24.217° ayanāṃśa is a stated research assumption. It is not an independently validated classical epoch conversion.
6. **Daily event bracket:** the current scan evaluates one local sunrise or sunset per civil date. A sign change brackets adjacent daily samples; it is not an exact continuous-time root and must not be reported as a precise event instant.
7. **Independent ephemeris:** comparing Astronomy Engine and Swiss Ephemeris at the same UTC instant checks input-state consistency, not the classical formula itself.



## Four-case calculation results from headless Chromium

Location: TKS comparison point 29.5830° N, 80.2090° E; elevation assumed 0 m because the external reference did not specify it. Times are local IST. The “estimate” is the signed IX.10–11 time correction from the reference-date Sun event; negative means the threshold is estimated to have been passed earlier. The bracket is the adjacent daily sequential (K−C) sign change.

| Case | K at supplied reference event | C | IX.10–11 estimate (days) | Daily sequential bracket | Estimate vs bracket interpolation |
|---|---:|---:|---:|---|---:|
| Venus Asta, target 12 Oct 2026 | 7.8835° | 8° | −0.1182 | 11 Oct 17:43:27 → 12 Oct 17:42:20 | 0.0038 d |
| Venus Udaya, target 1 Nov 2026 | 13.8429° | 8° | −3.3335 | 28 Oct 06:19:17 → 29 Oct 06:20:00 | 0.2949 d |
| Jupiter Asta, target 20 Aug 2027 | 6.5093° | 11° | −7.1402 | 12 Aug 18:53:03 → 13 Aug 18:52:08 | 0.0380 d |
| Jupiter Udaya, target 13 Sep 2027 | 11.1700° | 11° | −0.1949 | 12 Sep 05:52:00 → 13 Sep 05:52:31 | 0.0014 d |

All four IX.10–11 estimates are within 0.75 day of the linear interpolation of the adjacent daily bracket. The research page visibly discloses that the comparison dates are unverified and that the coordinate-frame question remains open. The browser test also emits an explicit **REVIEW** warning for discrepancies greater than 0.25 day; the latest run flags Venus Udaya at about 0.295 day (roughly 7.1 hours). This should be investigated rather than hidden by the wider hard-failure tolerance. It may reflect the local linear-motion approximation, the conversion, or an upstream method mismatch; current evidence does not distinguish those causes. Both paths share the same ephemeris, event classification, and dṛkkarma candidate, and the bracket itself is a once-per-sunrise/sunset scan. The estimate is not an exact continuous-time root.

### Discrepancies that remain open

- Venus Asta and Jupiter Udaya align closely with the supplied reference date under the daily-event convention.
- The diagnostic's current K-candidate threshold crossing for Venus Udaya is around 28–29 October, while the supplied reference fixture is 1 November.
- The diagnostic's current K-candidate threshold crossing for Jupiter Asta is around 12–13 August, while the supplied reference fixture is 20 August.
- These differences must not be “corrected” by shifting thresholds or dates to fit a reference. Next determine whether the reference uses the same event definition, longitude frame, and classical procedure, and independently audit the Chapter VII correction and Chapter III rising-asus derivation.

## What the latest automated tests establish

Latest full CI/browser run: https://github.com/OurHinduDharm/Panchang/actions/runs/38185464745

- 32/32 Chapter IX arithmetic/classifier/time-conversion tests passed.
- 9/9 Chapter VII formula and invariant tests passed, including the explicit test that Akṣa uses the original planet RA/declination rather than the Āyana-corrected intermediate point, and the observer-hemisphere sign test.
- 5/5 Chapter III rising-asus tests passed.
- Headless Chromium loaded the research page, rendered all four cases and correction components, and reported no page/console errors.
- Production isolation passed; `app.js` and `extra-panchang.js` remain unchanged.

These checks do **not** establish that the complete classical algorithm is correct. The browser run is headless CI validation, not a manual test on the user's phone.

## Next research steps

1. Independently transcribe and derive the Chapter VII Akṣa/Āyana dṛkkarma proportions, units, and signs from the source text.
2. Add small, independently calculated geometry fixtures (equator, northern latitude, southern latitude; east/west hour angle; positive/negative planetary latitude) before testing the four real dates.
3. Validate the IX.2–3 event classifier for the Venus cases; keep the explicit fixture labels until that classifier is proven.
4. Recalculate the four Venus/Jupiter cases using the same documented method and same location/time convention; keep Drik, classical, and heliacal-visibility outputs in separate columns.
5. Perform a live browser test of the research page and inspect console errors before considering any merge.

**Decision gate:** no production patch and no merge until the dṛkkarma derivation, event classification, all four cases, and live browser test have been reviewed.


## Chapter IX event-classification candidate

The research page now calls `classifyChapter9HorizonEvent()` for each date in the ±15-day scan. It derives signed daily longitude motion from geocentric states at ±12 hours around the Sun event, classifies at both sunrise and sunset, and accepts the date only if both classifications agree. It then chooses sunrise for east-side events and sunset for west-side events, and selects the corresponding Chapter IX threshold dynamically. The daily crossing detector now refuses to form a bracket if invalid/ambiguous dates create a gap; it will not silently call a multi-day gap “adjacent daily events”.

This is grounded in the source's explicit IX.2–3 contrast and is covered by tests for superior-planet branches, direct/retrograde Venus and Mercury, wraparound across 0° Aries, exact conjunction, stationary motion, and unsupported bodies. The wraparound regression was corrected on 12 October 2026: a planet at 359.5° is zodiacally greater than the Sun at 0.5°, even though the shortest circular separation is negative. CI and a live rerun must confirm the revised behavior before relying on the event brackets.

## New Chapter VII formula tests

The research branch now contains `ss_chapter7_drikkarma.js`, an isolated implementation of the VII.8–10 candidate. The research page's sequential diagnostic delegates to this helper; the earlier calculation remains visible as a comparison baseline.

The helper includes a cross-language numeric fixture (same equations independently evaluated in Python) for the Āyana-corrected intermediate longitude, the planet's own right ascension/declination used for Akṣa, hour angle, half-day angle, both correction terms, and final corrected longitude. It also tests that Akṣa vanishes at the equator, both latitude-dependent corrections vanish for zero planetary latitude, the Akṣa sign reverses with hour-angle sign, and reversing planetary latitude reverses the fixture's correction signs.

These are **internal arithmetic/invariant tests**, not observational validation. They do not make the four Asta/Udaya results authoritative. The next gate remains comparison against an independently implemented Chapter VII derivation and then the four same-location event cases.


## Current automated-test snapshot

Latest successful full workflow for the current research-page code:  
https://github.com/OurHinduDharm/Panchang/actions/runs/38185464745

- 32/32 Chapter IX arithmetic, threshold-selection, event-classification, and IX.10–11 conversion tests passed.
- 9/9 Chapter VII formula/invariant tests passed.
- 5/5 Chapter III rising-asus tests passed.
- HTML syntax/wiring, duplicate-ID checks, visible research-limit disclosures, and conservative K-candidate label passed.
- Headless Chromium rendered all four cases and the correction diagnostics without page/console errors.
- The browser test deliberately emits a **REVIEW** warning for the Venus Udaya IX.10–11 estimate/bracket difference of 0.2949 day; the wider 0.75-day hard-failure ceiling is not a claim of precision.
- Production isolation passed: `app.js` and `extra-panchang.js` are unchanged from `main`.

A headless Chromium run has been performed in CI. A separate manual run on the user's device has not been performed. These tests do not validate the full classical algorithm or resolve the reference-date discrepancies.

## Same-location comparison from headless Chromium

At the Pithoragarh validation coordinates (29.5830° N, 80.2090° E; elevation assumed 0 m because the external reference did not specify it), the current diagnostic produces these **model-specific daily brackets**:

| Event | Current K candidate (K=C) bracket | Apparent ecliptic-longitude (Deltalambda=C) bracket | Interpretation |
|---|---|---|---|
| Venus Asta | 11–12 Oct 2026 | 18–19 Oct 2026 | 7-day separation between model outputs |
| Venus Udaya | 28–29 Oct 2026 | 29–30 Oct 2026 | about 1 day |
| Jupiter Asta | 12–13 Aug 2027 | 16–17 Aug 2027 | about 4 days |
| Jupiter Udaya | 12–13 Sep 2027 | 14–15 Sep 2027 | about 2 days |

These are calculated brackets from the current research implementation, not adjudicated correct dates. The browser test confirms that the page calculates and renders them without JavaScript errors; it does not prove the formulas are classically correct. The model separation is consistent with the fact that TKS publicly describes its classical (K)-based layer and apparent ecliptic-angle layer as distinct models, but that fact alone does not validate either of these calculated brackets.

**Highest-priority next audit:** the specific local-meridian frame conversion has now been implemented and independently checked against a 3-D meridian-plane/equator intersection at six test angles. This validates that geometric transformation, not the entire dṛkkarma method or the historical choice of fixed 24° obliquity. Next, normalize the reference source/model and observer metadata. Venus Asta has a large geocentric latitude (about −7.57° in the current ephemeris state), so Akṣa is a major term; its sign and time-from-meridian ratio must be checked against VII.8–9. Until benchmark provenance is settled, the seven-day difference between the current K candidate and the apparent-angle candidate is only a diagnostic observation, not a verdict on either method.

## Latest diagnostic extension — angular separation side by side

The research table now prints both the ecliptic-longitude separation `Δλ` and the spherical 3-D angular separation alongside the Chapter IX classical `K). This is deliberately a comparison panel, not a replacement of the classical method with a modern angular threshold.

**Important outstanding issue:** the current four reference dates are not yet a provenance-verified benchmark set. Do not describe the Venus Udaya or Jupiter Asta offsets as a proven error in Sūrya-siddhānta until the reference source, observer location, event-time convention, ephemeris, and model are matched. The Jupiter Asta discrepancy is large enough to require investigation, not enough by itself to identify the faulty component.


## Chapter VII formula correction after component audit

The browser's component audit exposed the reason to revisit the initial sequential candidate: it used the intermediate Āyana-corrected ecliptic point's RA/declination to compute the Akṣa time ratio. The wording of VII.8 specifies the planet's own time from meridian and its own half-day. The helper now uses the planet's original longitude and signed ecliptic latitude (converted with the stated 24° obliquity) for those quantities, while the Āyana-corrected longitude remains the intermediate longitude to which Akṣa is applied.

The updated headless Chromium run completed successfully after the correction. At the latest tested point, the four daily K brackets were 11–12 Oct 2026 (Venus Asta), 28–29 Oct 2026 (Venus Udaya), 12–13 Aug 2027 (Jupiter Asta), and 12–13 Sep 2027 (Jupiter Udaya). The apparent ecliptic-angle brackets remain a separate comparison model and are not changed by the helper-only correction.


## Latest successful browser check after the Akṣa-input correction

Latest full workflow after independent 3-D validation of the local-meridian frame conversion: https://github.com/OurHinduDharm/Panchang/actions/runs/38206896593

- 32/32 Chapter IX arithmetic/classifier/time-conversion tests passed.
- 13/13 Chapter VII formula, frame-conversion, and invariant tests passed.
- 5/5 Chapter III rising-asus tests passed.
- Headless Chromium rendered all four reference cases, all three separate angular/K outputs, and all Akṣa/Āyana components without browser errors.
- The local-meridian conversion also matched an independently constructed 3-D vector intersection at six angles; this is a geometry regression check, not a full historical-model validation.
- Production isolation passed; `app.js` and `extra-panchang.js` remain unchanged.

The additional checks improve regression coverage; they do not replace an independent implementation or source-verified numerical benchmark.


## Independent source/provenance audit — 2026-10-12

### Chapter VII reference check

The primary-source cross-check confirms that Chapter VII is titled “Planetary Conjunctions,” but verses VII.7–11 specifically contain the dṛkkarma construction: VII.8–9 give the Akṣa correction, VII.10 gives the Āyana correction, and VII.11 states that this operation is used for planetary setting/rising. Therefore the helper's VII.8–10 verse reference is appropriate; the chapter title alone must not be used to dismiss it. Cross-check: [Burgess translation, Chapter VII](https://www.swaveda.com/texts/surya-siddhanta/7/) and [Sanskrit/translation, verses VII.7–11](https://www.vidhyamitra.com/surya-siddhanta/7).

### Benchmark provenance is not interchangeable

The diagnostic contains distinct reference groups that must remain separate:

- `REFERENCES`: Tantrakulam/Drik comparison samples labelled Dehradun, with sample instants and elongations.
- `DRIK_PITHORAGARH_BOUNDARIES`: local boundary timestamps for Pithoragarh, transcribed separately.
- `SHASTRIYA_REFERENCES`: working Chapter IX comparison fixtures used for the K-candidate table; these are explicitly not yet provenance-verified.

The public [TKS Udaya–Asta page](https://tksephemeris.com/tks-udaya-asta) describes its classical layer as K = lagnāntara-asu ÷ 60 using TKS apparent longitudes, and presents the Ptolemaic arcus-visionis and Schaefer visibility model as separate methods. The public [Drik Panchang Delhi Venus page](https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?lang=en) reports a Venus asta interval beginning 12 October 2026 at 18:19 and ending 28 October at 30:00+ in Delhi local time. This is useful as a source-specific sanity check, **not** a Pithoragarh timestamp and **not** a verified gold standard for the classical K algorithm.

Consequently, the prior four-case K fixtures must not be described as matching or contradicting a source until each row records (1) exact URL and retrieval date, (2) location and elevation, (3) local event instant and civil-date convention, (4) source engine and coordinate convention, and (5) whether the value is classical K, apparent ecliptic elongation, or physical heliacal visibility.

### Next action

Before altering any formula, recover the exact provenance of the four K fixtures and build a same-location/same-time comparison ledger. Then independently recompute VII.8–10 from the source proportions and compare each intermediate term—not just the final date. Production files remain untouched; no merge is authorized by this audit.


## Coordinate-frame audit update — 12 October 2026

### A further unresolved frame mismatch was identified

The local-sidereal-angle conversion added earlier is geometrically self-consistent for intersecting one physical meridian plane with two equatorial planes that share the same equinox axis. Its six-angle vector test validates that narrow identity. It does **not** establish that the planetary coordinates supplied to the calculation belong to either of those planes.

The research page obtains longitude and latitude from Astronomy Engine's geocentric **ecliptic-of-date** vector. It then subtracts/adds a fixed ayanāṃśa to label the longitude sidereal/tropical, but the sequential helper recomputes the planet's RA/declination by interpreting those same longitude/latitude numbers in a **fixed 24° obliquity** ecliptic. When the source ecliptic plane and the target fixed-obliquity ecliptic are not the same plane, reusing the angles unchanged is not a valid 3-D coordinate transformation. In particular, ecliptic latitude can affect the resulting longitude and declination; this cannot be repaired solely by transforming local sidereal angle.

Therefore the previous frame correction is only a partial consistency fix. The full input vector must be rotated from its documented source frame into the explicitly defined calculation frame before extracting target-frame ecliptic longitude/latitude or RA/declination. The equinox convention (mean versus true/apparent), precession/nutation treatment, and the relation between the selected ayanāṃśa and the source ecliptic must be specified together. Until this is derived, the current K values and event brackets remain exploratory and must not be used to validate or reject the classical method.

### Required next check before changing the implementation

1. Document Astronomy Engine's exact output frame for GeoVector and Ecliptic, and the time/equinox frame returned by SiderealTime.
2. Define the intended classical frame as explicit axes, not just the scalar value “24°”: identify its equinox axis, ecliptic pole, epoch, and how the sidereal longitude/ayanāṃśa is related to it.
3. Construct an independent 3-D rotation from the source frame to that target frame. Verify it with round-trip vector tests and special cases (zero latitude, nonzero latitude, equinox/solstice directions, and dates on both sides of the epoch).
4. Only then recompute the Chapter VII terms and the four event cases. Keep the old values as a labelled baseline so the change is measurable; do not tune a threshold to match a published date.

**Decision status:** the coordinate-frame gate is still open. Existing CI establishes arithmetic invariants and page wiring, not frame correctness or source-faithful event dates. Production files remain unchanged and no merge is authorized.


### API-frame facts verified against the pinned Astronomy Engine documentation

The code pins Astronomy Engine 2.1.19. Its documentation says `GeoVector` supplies a geocentric vector in J2000 equatorial coordinates (EQJ); `Ecliptic` converts that vector to true ecliptic of date (ECT); and `SiderealTime` returns Greenwich **apparent** sidereal time (GAST), referenced to the true equinox of date. The implementation adds east longitude to GAST to obtain local apparent sidereal angle. These are modern, date-dependent frames. Source: [Astronomy Engine 2.1.19 API documentation](https://app.unpkg.com/astronomy-engine%402.1.2/files/README.md) and [package documentation](https://www.npmjs.com/package/astronomy-engine?activeTab=versions).

This confirms the concrete mismatch to solve: the code currently takes ECT spherical angles and reinterprets them as if they belonged to an ecliptic with fixed 24° obliquity, while the local angle begins in the true-equator/true-equinox-of-date frame. A scalar obliquity-angle adjustment cannot establish a fully consistent transformation for both the planetary vector and the observer's meridian. The target classical frame must first be defined as a full orientation convention; otherwise multiple plausible rotations can produce internally consistent but historically different answers.

**Implementation decision:** do not patch the transform yet. The API facts are now sourced, but the target classical epoch/equinox/ayanāṃśa relationship is still not sufficiently specified by the current fixture set. Next step is to derive that convention from the chosen Sūrya-siddhānta interpretation and source references, then implement the 3-D rotation and run independent vector tests. This is a deliberate stop against guessing, not a production delay hidden behind passing tests.


## New source check — Ranganātha's commentary on IX.4–5 (12 October 2026)

A direct reading of Ranganātha's **Gūḍhārtha-prakāśaka** commentary changes the precision checklist for the Chapter IX diagnostic. The commentary is available in the Sanskrit transcription at https://vishvasa.github.io/jyotiSham/observation/history/hindu/prakIrNam/ranganAthaH/sUryasiddhAntaH/ around source lines 2090–2100 (the rendered source's line references are not stable, so the verse text is also linked directly).

### What the commentary makes explicit

1. **IX.4's event-time anchor:** for a western setting/rising calculation, compute the Sun and planet at sunset; for an eastern rising/setting calculation, compute them at sunrise. Ranganātha then explicitly says to apply both Āyana and Akṣa dṛkkarma to the planet. This confirms the correction order but does not settle the modern-to-classical coordinate-frame mismatch documented above.
2. **IX.5's six-sign shift:** for the western-event calculation, both the corrected planet and the Sun are shifted by six signs before the lagnāntara interval is obtained. For eastern events, the sunrise pair is used without that western shift.
3. **Event-time refinement:** the commentary explains that sunrise-anchored positions are first advanced using the elapsed daytime to estimate an eastern event; sunset-anchored positions use the remaining daytime to estimate a western event. It then describes advancing the positions to the estimated instant and recomputing the interval. Repeating this refinement yields a closer result than a single calculation made only at sunrise/sunset. It cautions that a single-pass time estimate is coarser.

### Impact on the current research implementation

The current page computes a Chapter IX K/lagnāntara candidate at the selected sunrise/sunset anchor and reports an IX.10–11 time estimate against a daily bracket. It does **not yet implement Ranganātha's full event-time iteration loop** that advances both bodies and recomputes the corrected lagnāntara at the estimated instant. Therefore:

- A single-pass estimate must remain labelled a first estimate, not a final shāstrīya event instant.
- The difference between the single-pass estimate and the independently sampled daily bracket is a diagnostic residual, not evidence by itself that the threshold or source rule is wrong.
- Iteration should be implemented only after the coordinate-frame gate is resolved; otherwise it would refine a potentially inconsistent input geometry and create false precision.
- A future test should assert convergence and report each iteration (anchor time, corrected Sun/planet positions, event-frame lagnāntara/K, IX.10–11 motion estimate, and time update). It must also stop explicitly if the sequence fails to converge or crosses into a different event branch.

### Source distinction

The Sanskrit verse and commentary are the textual evidence for the event anchor, dṛkkarma order, six-sign shift, and iterative refinement. The current JavaScript's regression tests only show that its present formulas execute consistently; they do not show that the complete iterative Chapter IX algorithm has been implemented. See also the independently organized verse outline at https://www.vidhyamitra.com/surya-siddhanta/9, which lists IX.4–5 as the apparent-place/lagnāntara stage and IX.10–11 as the time-estimation stage.

**Decision:** add event-time iteration to the research backlog, but do not implement it before the full source/target coordinate frame is defined. No production code change and no PR merge.


## Browser-run findings — 2026-10-12 (diagnostic only)

A successful headless Chromium run (GitHub Actions run [38238396950](https://github.com/OurHinduDharm/Panchang/actions/runs/38238396950)) exercised the current/sequential Chapter IX candidates, separate modern angular-threshold scans, and the Chapter III/VII browser checks. The run also confirmed that `app.js` and `extra-panchang.js` were unchanged. A later run, [38239221212](https://github.com/OurHinduDharm/Panchang/actions/runs/38239221212), was still in progress at its Chromium step when last checked; do not call that later run green until its final conclusion is available.

The successful browser output is useful because it makes the disagreement explicit. For the Pithoragarh research configuration (29.5828° N, 80.2182° E, 1650 m), the then-current diagnostic reported these daily crossing brackets:

| Event | Current Chapter IX K candidate | Separate apparent ecliptic-longitude threshold scan |
|---|---|---|
| Venus Asta | 11 Oct 2026 17:43 IST → 12 Oct 2026 17:42 IST | 18 Oct 2026 17:35 IST → 19 Oct 2026 17:34 IST |
| Venus Udaya | 28 Oct 2026 06:19 IST → 29 Oct 2026 06:20 IST | 29 Oct 2026 06:20 IST → 30 Oct 2026 06:20 IST |
| Jupiter Asta | 12 Aug 2027 18:53 IST → 13 Aug 2027 18:52 IST | 16 Aug 2027 18:49 IST → 17 Aug 2027 18:48 IST |
| Jupiter Udaya | 12 Sep 2027 05:52 IST → 13 Sep 2027 05:52 IST | 14 Sep 2027 05:53 IST → 15 Sep 2027 05:53 IST |

These are **outputs of candidate algorithms, not validated Sūrya-siddhānta event times**. The user-supplied Drik Pithoragarh boundaries are a separate comparator, not a proof of the classical method. The apparent-angular scan lands near the supplied Jupiter Asta boundary but does not thereby become the Chapter IX algorithm; conversely, the K candidate's earlier Jupiter Asta bracket is not validated merely because the other events look closer. No threshold, frame, or correction should be tuned just to force a match.

The run confirms that the browser page renders and that the numerical checks pass; it does **not** close the central scientific question. The present code still has a modern-to-24° frame assumption and an incompletely reconstructed Chapter I time/ahargana bridge. The next research gate remains: establish the classical coordinate/time conventions and independently derive the required input longitudes and dṛkkarma in that same frame, then rerun the event brackets against independently sourced examples. Keep the modern ecliptic-angle model, current K candidate, and any physical visibility model labelled separately. Production files remain out of scope until that gate is met.


## Follow-up after completed browser run — 2026-10-12

The formerly pending run [38239221212](https://github.com/OurHinduDharm/Panchang/actions/runs/38239221212) has now completed successfully. All workflow steps passed, including headless Chromium and the final `git diff --exit-code origin/main...HEAD -- app.js extra-panchang.js` guard. This establishes research-code/test integrity only; it does not certify event dates.

### Newly surfaced source-order question: VII.11 versus the current/sequential candidates

The browser's intermediate geometry output records both implementations at the same four sample events. The current and sequential K values are numerically close in these samples, but they are not identical:

| Sample | Current K | Sequential K | Difference (sequential − current) |
|---|---:|---:|---:|
| Venus Asta | 7.900165° | 7.883540° | −0.016625° |
| Venus Udaya | 13.841943° | 13.842884° | +0.000941° |
| Jupiter Asta | 6.510164° | 6.509353° | −0.000811° |
| Jupiter Udaya | 11.170096° | 11.170043° | −0.000053° |

The present browser assertion that the current method uses the planet's original RA/declination is a software invariant, not proof that this is the only correct reading of VII.11. Burgess's explanatory note to VII.11 describes the two-stage geometric construction: Āyana correction first gives the point on the hour circle; Akṣa correction then gives the point on the circle of position. That points toward the sequential candidate geometrically. However, the exact Sanskrit commentary's interpretation of the Akṣa quantities at the *event instant* must be reconciled with IX.4's sunrise/sunset instruction before declaring the sequential candidate canonical. Keep both outputs visible in research until this is resolved; do not select a variant just because the numerical date moves closer to a comparator.

### Ahargana time-boundary gate remains open

The Chapter I.45–51 helper reproduces the reported 1827 integer benchmark and passes its arithmetic tests. The 2026 source-ledger scale fixture still uses a synthetic 26.5 elapsed-tithi input; the same ledger's rounded Sun/Moon longitudes imply about 27.589 elapsed tithes at its stated apparent-noon sample, which does not reproduce the displayed Ahargana. Burgess describes the Chapter I result as the remainder at Lanka midnight. Therefore, the modern apparent-noon ledger value cannot be used as an exact midnight anchor without reconstructing the source's day boundary and fractional-tithi convention. The anchor helper remains provisional; do not convert arbitrary civil event times to ahargana from it as though independently validated.

### Updated next gate

1. Preserve the green browser run as a reproducible baseline.
2. Resolve the exact VII.11/Ranganātha event-time construction and record why the current or sequential candidate is textually preferred.
3. Reconstruct a consistent classical time argument: Lanka/prime-meridian midnight, local longitude/time correction, and the Chapter I fractional tithi convention.
4. Only then choose the event-time dṛkkarma variant, implement IX.10–11 iteration, and compare independent date/location references.
5. Production remains isolated. The green CI result is not a merge signal.


## Source cross-check — VII.8–11 and IX.4–11 (2026-10-12)

Fresh source review confirms the following distinctions:

- Burgess's Chapter VII.8 translation says to multiply latitude by the equinoctial shadow, divide by 12, multiply by meridian-distance in nāḍīs, then divide by the corresponding ball-day. VII.9 gives the hemisphere/latitude sign reversals. In the implementation, using (S/12=\tan(\phi)) is a derived geometric substitution only when the chosen equinoctial-shadow convention is explicitly (S=12\tan(\phi)); it should not be mistaken for the literal verse's notation.
- VII.10 specifies the declination of the planetary position increased by three signs, then multiplies by latitude in minutes and gives seconds with a same-name/unlike-name sign rule. The exact treatment of latitude when constructing that 90°-shifted point remains an interpretation choice to check against Ranganātha, not a licence to mix equatorial and ecliptic frames.
- Burgess's explanatory note to VII.12 describes the complete dṛkkarman as referring a planet with given latitude to an apparent longitude on the ecliptic via a secondary to the prime vertical. It says the procedure has two separate processes. This supports keeping the two corrections separately auditable, but does not by itself decide every computational input in the Chapter IX event-time setting.
- IX.4–5 in the Sanskrit and the independent verse outline explicitly anchor western calculations to the Sun's setting and eastern calculations to the Sun's rising, apply the planet's dṛkkarma, then derive lagnāntara-prāṇa/kālāṃśa; western calculations add six signs to both bodies. IX.6–9 then apply the planet-specific limits, and IX.10–11 estimate elapsed/remaining days from daily motions and lagnāntara. A daily angular threshold is therefore a useful comparator, not a replacement for this sequence.

Sources: [Burgess, Chapter VII, verses 7–12 and commentary](https://www.swaveda.com/texts/surya-siddhanta/7/); [Vidhyamitra, Chapter IX, verses 2–11](https://www.vidhyamitra.com/surya-siddhanta/9); [Siva.sh, Chapter IX.5 Sanskrit and translation](https://www.siva.sh/surya-siddhanta/9/5).

**Implementation decision:** keep the original-place Aksha-time ratio as the explicit baseline because VII.8 refers to the planet's own meridian-distance and half-day; keep the sequentially applied longitude and the competing candidate separately labelled. Do not silently change the RA/declination inputs merely because the two-stage prose sounds sequential. The remaining adjudication is the exact geometric meaning of the intermediate point and how the commentary carries it into IX.4's event anchor. No production integration.


## Latest reproducibility check — 2026-10-12

The workflow triggered for the current research head and completed successfully: [run 38240603479](https://github.com/OurHinduDharm/Panchang/actions/runs/38240603479), commit `7afac2b81ae22c66bca2d05e99d35a42135b1b46`. All 14 substantive steps passed, including helper syntax, Chapter I/III/VII/IX tests, HTML wiring, headless Chromium, and the final production-isolation guard for `app.js` and `extra-panchang.js`. The PR remains open and Draft. This is a reproducibility/integrity pass, not proof that the current candidate event dates are canonical.

### Source reading clarification

The accessible Chapter IX verse outline explicitly separates (a) horizon/event direction (IX.2–3), (b) apparent positions at sunrise/sunset plus the planet's dṛkkarma and lagnāntara (IX.4–5), (c) planet-specific visibility limits (IX.6–9), and (d) time since/until the event from motion (IX.10–11). Chapter VII.8–12 separately defines the apparent-longitude dṛkkarman, including the latitude/meridian-distance/half-day correction and the further declination-based correction. This separation is now a firm architectural constraint: event-direction classification, classical apparent longitude, visibility threshold, and time interpolation must remain individually inspectable.

Sources: [Vidhyamitra, Chapter IX](https://www.vidhyamitra.com/surya-siddhanta/9); [Burgess, Chapter VII](https://www.swaveda.com/texts/surya-siddhanta/7/); [Hall edition with Ranganātha's commentary, Chapter IX scan](https://www.e-rara.ch/zut/content/pagetext/25255183).

Next work remains the non-negotiable time/frame gate: do not start an iteration or tune constants until the prime-meridian midnight and fractional ahargana argument, plus the classical-versus-modern coordinate frame, are independently reconciled.


## Two remaining gates — narrowed to testable contracts (2026-10-12)

### Gate A — time coordinate versus ahargana epoch

The time-coordinate conversion is now explicit in `ss_chapter1_ahargana_anchor.js`:

`JD_{prime mean}=JD_{UT}+\lambda_{prime}/360`

where east longitude is positive and both quantities are day-valued Julian coordinates. The new tests cover zero longitude, ±15° (±1 hour), Ujjayinī longitude 75.768° E, and invalid longitude. This only converts the time coordinate; it does **not** prove the epoch anchor or the current-month fractional-tithi convention.

The source's wording is unambiguous that I.48–51 produces the elapsed day count to the present midnight at Laṅkā. Burgess/Sastri's explanatory text also distinguishes the elapsed lunar-day input from the final midnight result. Vidhyamitra's independently published daily ledger labels its snapshot “apparent noon at Ujjayinī” and reports a fractional ahargana, so it must not be treated as a direct midnight gold standard without reconstructing the exact fractional-tithi and time-of-day convention. Keep the 26.5-tithi fixture explicitly synthetic; do not silently recalibrate the epoch to it.

Sources: [Sastri translation, I.48–51](https://en.wikisource.org/wiki/Page:English_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri,_1861.djvu/18); [Vidhyamitra's dated ledger](https://www.vidhyamitra.com/surya-siddhanta).

### Gate B — coordinate frame

Freeze the textual lineage for this diagnostic as the vulgate text with Ranganātha's Gūḍhārtha-prakāśa, cross-checked against Burgess's translation. The implementation must keep these coordinate products separate until an explicit rotation connects them:

1. Modern geocentric vector in J2000 equatorial axes (ephemeris input).
2. Modern true ecliptic-of-date longitude/latitude (ECT).
3. Modern true equatorial-of-date RA/declination (EQD), used only with matching apparent sidereal time.
4. The classical diagnostic ecliptic longitude after the Chapter III.9–12 ayana model and the Chapter VII apparent-longitude corrections.
5. The classical hour-angle/declination frame used by the lagnāntara geometry, with the local meridian transformed into that same frame.

A fixed `24.217°` offset is only a comparator, not the Chapter III ayana model. A fixed `24°` obliquity and modern true RA/declination are not a single frame by themselves. The next frame test must construct and expose the full rotation matrix and its inverse, prove round-trip vector preservation and matching local-meridian/hour-angle geometry, and compare the Chapter II.28 sine-table convention (radius 3438, max-declination sine 1397) separately from exact trigonometry. Until that test exists, neither current nor sequential K candidate is certified as canonical.

### Gate decision

The UTC-to-prime-meridian time-coordinate conversion is now implemented and unit-tested; the ahargana epoch/fractional-tithi convention remains open. The coordinate-frame inventory and target textual lineage are now explicit; the actual full frame transform remains open. These are bounded next tasks, not permission to ship. No production patch and no merge.


## Follow-up frame review — 12 October 2026

A closer code-path review narrows the coordinate-frame blocker further. The current helper `convertLocalSiderealAngleObliquityFrame()` changes the local meridian's equatorial intersection for a changed obliquity, and its six-angle 3-D intersection regression is useful. However, the event pipeline also converts tropical ecliptic longitude to a sidereal longitude using the fixed `24.217°` comparator. The helper does **not** include that ecliptic-origin/equinox rotation in the meridian transform, and the current `24.217°` value is not the Chapter III ayana model. Thus its successful geometry test proves the obliquity-only construction, not the full modern-EQD → classical Chapter III/VII frame transformation.

**Decision:** do not describe the coordinate gate as solved. The next implementation should be an isolated 3-D transform candidate with explicitly ordered rotations (modern EQD → modern ECT → classical ecliptic origin/ayana → classical equatorial frame), inverse transform, norm/orthogonality/round-trip tests, and a separate derivation of how local meridian/hour angle enters that frame. It must not be wired into event-date calculation until the meridian geometry is independently derived. The Chapter I ledger also remains a comparison point rather than an epoch proof: the source's “Lanka midnight” and the ledger's “apparent noon at Ujjayinī” are different time arguments.


## Isolated full planetary-vector transform candidate — 12 October 2026

Added `ss_classical_frame.js` and `ss_classical_frame_test.js` on the research branch. The transform makes the assumed order explicit:

1. Modern true equatorial-of-date (EQD) → modern true ecliptic-of-date (ECT).
2. Rotate the ecliptic origin by the selected Chapter III ayana value (tropical longitude → classical sidereal longitude).
3. Rotate into the explicitly selected classical equatorial frame.

The inverse is implemented separately. CI run [38248445775](https://github.com/OurHinduDharm/Panchang/actions/runs/38248445775) passed **7/7** isolated transform tests: inverse round-trip, norm preservation, orthonormal basis, longitude-minus-ayana with latitude preservation, identity case, and invalid-input rejection. The same run passed the existing ahargana/Chapter III/VII/IX checks, headless Chromium, and production-isolation guard.

**Scope boundary:** this is now a tested planetary-vector transform candidate, not a solved Chapter IX coordinate frame. It does not construct the local meridian or prove how local sidereal time/hour angle should be generated in the classical model. The helper is not wired into the event-date engine; the obliquity-only local-meridian candidate remains separate. The next unresolved part is the local meridian/hour-angle construction in the same classical frame, with a source-derived time argument. No production files changed and the PR remains Draft.


## Ahargana date alignment and local-meridian candidate — 12 October 2026

A fresh read of the live Vidhyamitra ledger shows **11 October 2026**, apparent noon at Ujjayinī, with Ahargana **7,14,40,41,69,486.5** and ayanāṃśa 22.9123°. The research anchor's archived 8 October reference is 714404169483.5; the three-day difference is consistent with the ledger's one-day-per-day progression, not a three-day epoch error. This does **not** resolve the fractional-tithi question: the rounded Sun/Moon longitudes at apparent noon imply a tithi fraction different from the synthetic 26.5 input, and the ledger's apparent-noon value is not the Chapter I.48–51 Lanka-midnight result. Keep those as separate issues.

Source: [Vidhyamitra Sūrya Siddhānta live ledger](https://www.vidhyamitra.com/surya-siddhanta).

The local-meridian candidate in `ss_classical_frame.js` now explicitly transforms the meridian plane and intersects it with the classical target equator. The isolated frame-test step passed with the new identity, six-angle independent plane-intersection, and ayana/ecliptic-origin cases. This makes the geometry reproducible; the assumption that this is the source-faithful Chapter VII/IX time construction remains open. It is not connected to the event engine.


## Chapter II.28 sine-table obliquity regression — 12 October 2026

The isolated frame helper now derives the text's tabular greatest-declination angle from the stated sine and radius instead of silently treating the ratio as exactly 24°:

- Chapter II.28 inputs: maximum-declination sine = 1397; sine-table radius = 3438.
- Exact inverse-sine diagnostic: asin(1397 / 3438) = approximately **23.9751819°**.
- Rounded traditional construction: **24°** remains a distinct approximation and is not overwritten or retroactively treated as the exact inverse-sine result.
- Added regression checks for the derived value, explicit separation from 24°, and rejection of an invalid sine-table ratio.

Sources: [Sūrya Siddhānta II.28, Sanskrit and computation](https://www.siva.sh/surya-siddhanta/2/28); [Vidhyamitra, Chapter II.28](https://vidhyamitra.com/surya-siddhanta/2).

**Scope:** this isolates the textual sine-table constant and its mathematical consequence. It does not prove which obliquity convention should drive every Chapter VII/IX step, and it does not resolve the local-meridian/time argument. The new tests must pass in CI before this addition is marked verified. The full coordinate transform remains research-only and is not connected to event-date calculation.


## Latest numerical-invariant expansion — 12 October 2026

The isolated full-vector transform test suite now includes a deterministic property-style sweep over 256 vectors and four explicit angle sets (1,024 transform/inverse cases), plus a meridian-plane membership test across six meridian angles and five declinations. These tests verify algebraic consistency, not the historically correct ayana or obliquity. GitHub Actions run [38254937143](https://github.com/OurHinduDharm/Panchang/actions/runs/38254937143) passed, including the headless Chromium page test and the production-file identity guard.

### Ahargaṇa source boundary reinforced

The independent Sri Jagannāth Center explanation of I.48–51 explicitly says to add the **elapsed lunar-day/tithi count** for the current month, subtract the quotient of omitted tithis, and interpret the result as the civil-day count at **Laṅkā midnight**. Its 2 May 1827 Vaiśākha Śukla Ṣaṣṭhī example gives 714,404,096,641 and is reproduced by the integer arithmetic fixture. This is useful validation of the arithmetic and its inclusive tithi-day convention, but it does not justify feeding a fractional instantaneous tithi into the classical midnight formula or equating that result with Vidhyamitra's “apparent noon at Ujjayinī” ledger.

Sources: [Sri Jagannāth Center, Ahargaṇa Calculations](https://srijagannath.org/jyoti%E1%B9%A3a/aharga%E1%B9%87a-calculations/); [Sastri translation, I.48–51](https://en.wikisource.org/wiki/Page:English_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri,_1861.djvu/18).

**Current gate status:** the time-coordinate conversion and its unit tests are complete; the source-derived epoch/time-of-day mapping is not. The planetary-vector transform is algebraically tested; the source-faithful local-meridian/hour-angle construction is not. The Chapter IX candidate event dates therefore remain research diagnostics, not certified classical outputs. No production files changed; PR #22 remains Draft and unmerged.

## Continuation — 12 October 2026: Ahargaṇa tithi-ordinal check

The date label for 8 October 2026 is independently reported as Āśvina Kṛṣṇa Trayodaśī by current Panchāṅga references (for example, [Drik Panchang](https://www.drikpanchang.com/panchang/day-panchang.html?date=08%2F10%2F2026&time-format=24hour) and [Vedicmatters](https://vedicmatters.com/tithi/2026-10-08)). If the input coordinate is elapsed tithis from Śukla Pratipadā at the start of the lunar month, Kṛṣṇa Trayodaśī occupies the interval **[27, 28)**. The existing `26.5` reference fixture is therefore not a valid ordinal coordinate for that date label; it remains a deliberately synthetic arithmetic fixture and must not be cited as a reconstructed historical input.

A research-only helper and tests now explicitly check the ordinal intervals for Śukla Pratipadā, Śukla Pūrṇimā, Kṛṣṇa Pratipadā, and Kṛṣṇa Trayodaśī, and assert that `26.5` is outside the Trayodaśī interval. This resolves the **ordinal** ambiguity, not the fractional tithi at the source's exact timestamp.

The rounded longitudes previously transcribed for the Vidhyamitra ledger imply approximately `27.5889` elapsed tithis at apparent noon. That remains a rough comparator only: the exact source timestamp, longitude precision, time standard, and conversion from the displayed “apparent noon at Ujjayinī” to the Chapter I result at Laṅkā midnight have not been independently reconstructed. The 1827 benchmark validates the integer quotient arithmetic and its inclusive tithi-day convention, but it does not validate the 2026 fractional-time mapping.

**Current result:** one concrete input-label defect is now guarded by tests; the Ahargaṇa epoch/time boundary is still **not certified**. No adjustment has been made to force the output to match the external ledger.


## External benchmark snapshot supplied by project owner — 12 October 2026

Observer reported by TKS: Pithoragarh, 29.58° N (the displayed data does not state elevation or an explicit timezone; the timestamps below are transcribed as displayed and should be confirmed as IST before sub-hour comparison).

### TKS Shāstrīya · Sūrya-siddhānta IX layer

| Body | Reported state at capture | TKS classical event times | Current research K-candidate bracket | Initial interpretation |
|---|---|---|---|---|
| Venus | Asta | Asta began 12 Oct 2026 10:20:13; next Udaya 31 Oct 2026 12:06:13; next Asta 12 Jul 2027 05:29:31 | Asta 11 Oct 17:43 → 12 Oct 17:42; Udaya 28 Oct 06:19 → 29 Oct 06:20 | Asta civil date is broadly consistent, but the exact event-time meaning is not yet matched; Udaya differs by roughly two civil days. |
| Jupiter | Udaya | Udaya began 11 Aug 2026 03:40:54; next Asta 20 Aug 2027 00:48:16; next Udaya 12 Sep 2027 23:14:18 | Asta 12 Aug 18:53 → 13 Aug 18:52; Udaya 12 Sep 05:52 → 13 Sep 05:52 | The 2027 Asta date differs by about 7–8 days. The Udaya civil date is near the bracket, but the clock time cannot be compared until TKS's IX.10–11 event-time convention is reproduced. |
| Agastya | Udaya | Asta 17 May 2027; Udaya 23 Aug 2027; TKS labels the method Sūrya-siddhānta IX.17, nakṣatra rising/setting | Not calculated in the current four-case planetary test set | Keep as a separate fixed-star/nakṣatra test case; do not apply planetary IX.6–8 thresholds to Agastya. |

### TKS “scientific (photometric)” output — separate model

| Body | Reported photometric events |
|---|---|
| Venus | Asta 12 Oct 2026 18:02:15; Udaya 28 Oct 2026 05:58:44; Asta 22 Jul 2027 05:07:06 |
| Jupiter | Asta 16 Aug 2027 19:19:41; Udaya 12 Sep 2027 05:16:25; Asta 16 Sep 2028 18:40:42 |
| Agastya | Asta 12 Apr 2027; Udaya 19 Sep 2027 |

These are an owner-supplied snapshot, not independently fetched or verified in this audit. The two TKS sections must remain distinct: the Shāstrīya K/C result is not the same calculation as the photometric visibility result. In particular, do not treat the photometric date as proof of the Chapter IX K crossing, and do not call a longitude-threshold crossing “photometric.”

### What this comparison tells us (and does not tell us)

1. The Venus Asta civil date from the current K candidate and the TKS Shāstrīya date are close, but the reported TKS time (10:20) is not the daily sunset sample used by the current bracket. It is not a precise agreement until the time coordinate and IX.10–11 interpolation are reconstructed.
2. Venus Udaya remains an unresolved multi-day discrepancy: the current K bracket is 28–29 October, while the TKS Shāstrīya output reports 31 October. This must be investigated from intermediate values, not fixed by shifting an ayanāṃśa or threshold.
3. Jupiter Asta is the strongest current classical discrepancy: the current K bracket is 12–13 August 2027 versus TKS 20 August 2027. The frame/meridian and event-time interpretation gates remain open, so no cause is assigned yet.
4. TKS photometric Venus Udaya (28 October 05:58) and Jupiter Asta (16 August 19:19) are useful modern visibility comparators, but they are not equivalent to a Chapter IX threshold calculation. The research page's apparent ecliptic-longitude threshold and 3-D elongation columns are also not photometric visibility models.
5. Agastya is a new scope item. Its IX.17 nakṣatra rising/setting method needs a separate source-based implementation and validation fixture; it should not be forced through the planetary K/C pipeline.

**Next comparison step:** capture TKS's exact page output and its observer/time settings, then log our Sun/planet state, chosen sunrise/sunset anchor, both dṛkkarma components, K, C, signed relative daily motion, and IX.10–11 estimated days at the same anchor. Do this for Venus Udaya and Jupiter Asta first. No parameter tuning, no production changes, and no merge based on this snapshot alone.


## 12 October 2026 addendum — zodiac wraparound in IX.2–3

A review of the actual classifier found that it computed the shortest signed circular difference
`((planetLongitude - sunLongitude + 540) % 360) - 180` and used its sign to decide whether a planet was *abhyadhika* (greater) or *ūna* (less) than the Sun. That is not equivalent to comparing the two zodiacal longitudes when they straddle 0° Aries. For example, 359.5° is greater than 0.5° in zodiacal longitude ordering, while the shortest signed separation is −1°; the prior code therefore selected the opposite IX.2–3 branch in that case.

The research helper now normalizes both longitudes to [0°, 360°) and compares their ordering directly. Tests now cover both sides of the zodiac wrap for Jupiter, plus direct and retrograde Venus. This is a source-interpretation correction, not a benchmark-fitting change. The revised commit must pass the complete workflow, and the four live event cases must be rerun to confirm their branch labels and event anchors. No production file was changed.

## Owner-supplied TKS Venus cross-panel discrepancy — 12 October 2026

The owner supplied two TKS views for Venus at the same nominal date:

- 3-D event view: **2026-10-12 06:30 UTC** (12:00:00 IST), heading “Combust · Śāstrīya”; reported Sun–Venus separation **19.4°**, stated limit **10°**, and explanatory text says the planet is asta when it is *within* that limit.
- Udaya-asta detailed shāstrīya panel: Venus is **Asta**, **K = 7.698°**, **C = 8°**, ecliptic-longitude separation **17.6°**. The same supplied TKS observations list Venus’s retrograde station at 2026-10-03 12:46 local time, so Venus should be retrograde on 12 October if the time bases are consistent.
- The Udaya-asta page explicitly lists Venus limits **8° / 10°** and says the branch changes with retrograde/direct state. The Sanskrit source for Sūrya-siddhānta IX.7, however, describes the limits in terms of the event direction: west-setting/east-rising at 8°, east-setting/west-rising at 10°. IX.8 gives Mercury's 12°/14° distinction according to the described motion.
- The 3-D view's own angular explanation is internally inconsistent: **19.4° is not within a 10° limit**, yet the text uses that angle/limit explanation under a “Combust” heading. This does not by itself prove its separate classical K calculation is wrong; it does show that the 3-D explanatory label/logic must not be used as validation of the detailed Chapter IX method.
- The two reported angular quantities, **19.4° true 3-D elongation** and **17.6° ecliptic-longitude separation**, are different geometrical measures and must remain separately labelled. Neither is the same as the Chapter IX lagnāntara-derived **K = 7.698°**.

### Research decision

1. Treat the detailed shāstrīya panel (K, C, event date) as the more relevant TKS comparator for Chapter IX, but not as independently verified truth.
2. Record the 3-D panel as a separate cross-panel inconsistency. Do not “fix” our classifier to match its C=10° label.
3. Recheck the exact event-direction classification (east/west setting/rising), apparent longitude ordering, signed daily motion, and the event timestamp at the same instant. The event-specific IX.7 threshold is the source-faithful branch to test; the legacy angular diagnostic's motion-only threshold remains exploratory.
4. Keep all changes research-only. No production files changed.

Sources:
- Sūrya-siddhānta IX.6–10, including IX.7 event-direction wording: https://www.siva.sh/surya-siddhanta/9/6-10
- TKS Udaya-asta method/limits (Beta): https://tksephemeris.com/tks-udaya-asta
- TKS API distinction between ephemeris state, planetary events, and heliacal outputs: https://tksephemeris.com/tks-api

## TKS comparison dataset supplied by the project owner (12 October 2026)

TKS is explicitly marked Beta/under development by its own Udaya–Asta page. Treat its output as a comparison dataset and a source of candidate event dates, not as proof of the classical algorithm.

### Location and Sun/Moon outputs

Coordinates supplied in the TKS form: latitude 29.5830° N, longitude 80.2090° E, local time zone UTC+05:30.

| Mode | Elevation | Sunrise | Meridian | Transit | Sunset | Moonrise | Moonset |
|---|---:|---|---|---|---|---|---|
| दृश्य — ऊँचाई + वक्रीभवन | 0 m | 06:08:40 | 11:55:31 | 11:55:43 | 17:42:21 | 07:36 | 18:26 |
| गणित — मानक −0.833° | 0 m | 06:08:40 | 11:55:31 | 11:55:43 | 17:42:21 | 07:36 | 18:26 |
| दृश्य — ऊँचाई + वक्रीभवन | 1563 m | 06:03:40 | 11:55:30 | 11:55:43 | 17:47:21 | 07:30 | 18:31 |
| गणित — मानक −0.833° | 1563 m | 06:08:40 | 11:55:31 | 11:55:43 | 17:42:21 | 07:36 | 18:26 |

Interpretation: the elevation-sensitive mode changes sunrise/sunset and moonrise/moonset, while the standard −0.833° outputs are unchanged. This is evidence about TKS mode behavior only; it does not validate the horizon/refraction model or show that local mountain skyline obstruction is modelled.

### Classical planetary outputs copied from TKS

- Venus: K = 7.698°, detailed panel C = 8°, state Asta; listed next Udaya 1 November 2026 on the detailed page. An earlier captured output listed 31 October 2026 12:06:07 local; preserve both as separate captures until page state, time basis, and version are reconciled.
- Jupiter: K = 58.015°, C = 11°, state Udaya; Asta 20 August 2027, next Udaya 12/13 September 2027 depending on the page/date/time-zone display.
- Agastya/Canopus: C = 13°; classical Asta 17 May 2027, Udaya 23 August 2027; method identified as Sūrya-siddhānta IX.17 / nakshatra rise/set. Do not run it through the generic planet K/C path without source justification.
- One supplied TKS event list shows Venus retrograde station 3 October 2026 12:46 local and Mercury retrograde station 24 October 2026 12:43 local.
- TKS 3-D Venus view at 2026-10-12 06:30 UTC reports 19.4° 3-D separation and C=10° under “Combust · Śāstrīya”, while the detailed classical panel reports 17.6° ecliptic-longitude separation and K=7.698°, C=8°. Keep these fields distinct; the 3-D explanation says “within the limit” although 19.4° is not within 10°.

### Comparison protocol

For every comparison, record exact UTC/local instant, source page/version, location, elevation, apparent/geometric frame, tropical/sidereal frame, longitude, latitude, signed daily motion, dṛkkarma inputs/outputs, event branch, K, C, and event time. Do not tune a formula to fit a single TKS date. First reproduce each intermediate quantity independently, then compare the event result. Keep all work research-only until source interpretation and independent tests agree.


## Checkpoint — 13 October 2026: K discrepancy and IX.10 estimate review

- Latest browser workflow: https://github.com/OurHinduDharm/Panchang/actions/runs/38343454502 — passed. The test assertion was updated to match the explicit “Our sign-table K minus TKS K” label. This is a test-harness fix, not a formula change.
- Same-instant comparison at 2026-10-12 06:30 UTC: sign-table K = 12.001454°; exact analytical oblique-ascension K = 12.015292°; TKS-supplied K = 7.698°. Our two K constructions differ by only 0.013837°, so that numerical-method choice does not explain the 4.303454° gap to the supplied TKS K. The gap remains unexplained.
- TKS's public Udaya-asta page explicitly describes its primary method as the classical lagnāntara-asu test on **TKS apparent longitudes**, with K = lagnāntara-asu ÷ 60 and visible iff K > C. Our diagnostic currently uses Astronomy Engine positions plus a stated fixed 24.217° ayanāṃśa assumption. This is not yet a like-for-like input pipeline. Source: https://tksephemeris.com/tks-udaya-asta.
- The Venus Udaya IX.10–11 estimate is −3.3335 days from the 1 Nov fixture, while the sequential daily K−C crossing is 28–29 Oct; linear interpolation and estimate differ by 0.2949 day (~7.1 h). Because this is a roughly 3.33-day extrapolation and the comparison bracket samples only one sunrise/sunset per civil day, this warning alone does not prove the formula is wrong. It must be checked with short-horizon anchor dates (0–1 day from a bracket) and with the actual event branch held consistent.
- Do not change thresholds or tune the dṛkkarma formula to force a date match. Next audit: reproduce the TKS apparent-longitude input pipeline if its intermediate values can be obtained; otherwise compare only the shared classical method while explicitly marking ephemeris/input differences. Add short-horizon IX.10–11 residual checks before interpreting the long-range estimate error.
- Production isolation remains mandatory: no changes to `app.js` or `extra-panchang.js`; no merge based on CI success alone.


## Checkpoint — 13 October 2026: short-horizon IX.10–11 check

The updated diagnostic workflow passed on commit `6ce1f659465eb05b34163fb898b661489416dd76` (run [38344580018](https://github.com/OurHinduDharm/Panchang/actions/runs/38344580018)). This validates the browser wiring and arithmetic fixtures, not the entire classical algorithm.

The new short-horizon residual is the smaller absolute error from the two daily samples immediately adjacent to the sequential K=C crossing, using the same event branch and C:

| Case | Long-range estimate error | Short-horizon estimate error |
|---|---:|---:|
| Venus Asta | 0.003827 day (~5.5 min) | 0.003827 day (~5.5 min) |
| Venus Udaya | 0.294861 day (~7.08 h) | 0.003093 day (~4.5 min) |
| Jupiter Asta | 0.038012 day (~54.7 min) | 0.000834 day (~1.2 min) |
| Jupiter Udaya | 0.001436 day (~2.1 min) | 0.001436 day (~2.1 min) |

Interpretation: the short-horizon estimates are all within about 5.5 minutes of the daily K=C interpolation for these four fixtures. This is encouraging evidence that the local IX.10–11 rate estimate is internally consistent near the crossing. The Venus Udaya long-range error remains large because it extrapolates about 3.33 days; it must not be described as a confirmed formula defect. The daily bracket itself has only one sample per local day, so these figures are a coarse internal comparison, not exact event-time validation.

### Next research action: isolate the K gap by inputs, not by tuning

At 2026-10-12 06:30 UTC, our sign-table K is 12.001454° and TKS-supplied K is 7.698°, while the ecliptic-longitude separations are 17.947299° and 17.6° respectively. The longitude-separation difference (~0.347°) is far smaller than the K difference (~4.303°); this suggests the main unresolved gap is in the lagnāntara/dṛkkarma construction or its coordinate/time conventions, not simply the raw elongation.

TKS publicly describes its pipeline as DE reference states → apparent-place reduction (light-time, aberration, deflection, precession/nutation) → ecliptic-of-date → its dynamic TKS ayanāṃśa, and says the shāstrīya Udaya–Asta K is computed from TKS apparent longitudes with classical rising-time geometry. Our current diagnostic uses Astronomy Engine positions and an assumed fixed 24.217° ayanāṃśa. These are not yet like-for-like inputs. The TKS public documentation also marks Udaya–Asta Beta/under development, so it remains a comparison target, not independent proof.

Next:
1. Capture TKS and our Sun/Venus apparent tropical longitude, apparent ecliptic latitude, apparent RA/declination, sidereal offset, signed daily motion, and local sidereal angle at the exact same UTC instant.
2. Recompute our K using TKS-provided apparent inputs if the public endpoint exposes them; separately recompute using our own inputs. Do not substitute the reported K as an input.
3. Audit each Chapter VII dṛkkarma intermediate in a common coordinate frame and verify whether the chapter's longitude correction is being applied to the same point/frame in both implementations.
4. Keep event-specific C and IX.2–3 branch selection separate from the geometry audit. Do not tune C or dṛkkarma to force a match.
5. Keep all work on `research/ss-ch9-diagnostic`; production `app.js` and `extra-panchang.js` remain unchanged.


## IX.10–11 short-horizon check — 13 October 2026

The corrected browser workflow passed at commit `6ce1f659465eb05b34163fb898b661489416dd76` (run https://github.com/OurHinduDharm/Panchang/actions/runs/38344580018). The browser test now reports the IX.10–11 estimate error using the two daily samples immediately adjacent to the sequential K=C bracket, separately from the estimate made at the distant reference fixture.

| Case | Short-horizon estimate error | Long-range fixture estimate error | Interpretation |
|---|---:|---:|---|
| Venus Asta | 0.003827 day (~5.5 min) | 0.0040 day | Near-boundary estimate agrees closely with the interpolated daily bracket. |
| Venus Udaya | 0.003093 day (~4.5 min) | 0.294861 day (~7.08 h) | Near-boundary estimate is close; long-range linear projection is not reliable over the full multi-day interval. |
| Jupiter Asta | 0.000834 day (~1.2 min) | 0.038012 day (~54.7 min) | Near-boundary estimate is close; the distant projection has noticeable accumulated error. |
| Jupiter Udaya | 0.001436 day (~2.1 min) | 0.0014 day | Both estimates are close in this fixture. |

These are **internal consistency checks**, not independent proof of the Sanskrit interpretation or of the absolute event dates: the bracket and estimate share the same ephemeris, dṛkkarma candidate, rising-asus implementation, and threshold. The result supports keeping IX.10–11 as a local estimate and not using a multi-day linear extrapolation as a final event time. Do not change the method or relax tolerances based on these numbers alone.

### Next research action

Investigate the unresolved same-instant TKS K gap using a controlled input audit. At a single timestamp, collect the same Sun/planet apparent ecliptic longitude and latitude, apparent RA/declination, ayanāṃśa, local sidereal angle, signed daily motion, observer, and event branch for both pipelines. First reproduce our own K from our recorded intermediates; then vary one input convention at a time. If TKS does not publish intermediate inputs, document the gap as unidentifiable from public output rather than reverse-engineering by arbitrary tuning. Keep all changes on the research branch and preserve production isolation.


## TKS same-instant input capture protocol — 13 October 2026

TKS's published API reference identifies `GET /v1/tks/ephemeris` with `date`, `time`, `lat`, `lon`, `tz`, and `body` parameters, and says its response includes apparent right ascension/declination, ecliptic longitude/latitude, ayanāṃśa, and nirayana longitude. Source: https://tksephemeris.com/tks-api. The Udaya-Asta page states that its shāstrīya K is calculated on TKS apparent longitudes and classical rising-time geometry; it is explicitly Beta / under development. Source: https://tksephemeris.com/tks-udaya-asta.

### Fixed comparison instant

Use **12 October 2026, 12:00 local time, UTC+05:30** (06:30 UTC), observer **29.5830° N, 80.2090° E**, and request the Sun and Venus separately for that exact instant. Do not compare the previous 06:30 local event snapshots against this noon snapshot; same date is not same instant.

Capture for both bodies:
- apparent tropical ecliptic longitude and latitude;
- apparent geocentric right ascension and declination;
- sidereal/ayanāṃśa value and nirayana longitude;
- signed daily longitude motion, if exposed;
- time scale / epoch label and any apparent-vs-geometric flag.

Also capture the TKS Udaya-Asta output's K, selected C, branch/event type, and its own intermediate values if exposed. Keep the reported K as an output only; never feed it into our calculation.

### Reproduction sequence

1. Recompute our K from the current stored snapshot and assert it reproduces the recorded value before changing anything.
2. Replace only Sun/Venus apparent ecliptic inputs with TKS inputs while retaining our current dṛkkarma/rising-asus implementation. Label this a hybrid sensitivity test, not a valid final model.
3. Replace the ayanāṃśa/frame convention alone, then test apparent vs geometric positions alone, then the Chapter VII correction inputs/order alone. Record ΔK for each isolated change.
4. Only call a cause identified if one convention change explains the discrepancy and remains consistent across a second independent timestamp. Otherwise retain “unresolved / mixed pipelines.”
5. The public documentation lists the required ephemeris fields but does not by itself supply the actual same-instant payload or establish that the Udaya-Asta page exposes its intermediate lagnāntara values. Until those payloads are captured, no numerical attribution of the ~4.3° gap is justified.

This protocol is research-only. Do not change the production calculation, thresholds, or event dates based on a hybrid comparison.


## Browser verification — 13 October 2026, 09:45 IST

The asynchronous same-instant TKS/Swiss diagnostic now waits for its completed output, and the Chromium test waits for the timestamped comparison before asserting it. The Swiss Venus helper also now consistently reads the requested planet state rather than a stale Jupiter variable.

- Research branch commit: `45931843387a64f8f2131c095c3ce47bfb23130c` (Swiss Venus state variable fix), followed by browser-test synchronization commit `e3b35d287cb05f7a3dc8ca39924570a111b5c6a3`.
- Successful Chromium workflow: [38345380797](https://github.com/OurHinduDharm/Panchang/actions/runs/38345380797); latest paired workflow also succeeded: [38345385407](https://github.com/OurHinduDharm/Panchang/actions/runs/38345385407).
- At 2026-10-12 06:30 UTC, the browser rendered Swiss Ephemeris Venus K = **12.006133°** and Swiss−Astronomy Engine K = **+0.004678°** using the same candidate geometry.
- Our sign-table K remains about **12.001454°**, versus the owner-supplied TKS K = **7.698°**; the gap is about **4.303°**. The small Swiss-vs-Astronomy-Engine difference makes the modern ephemeris input source alone an unlikely explanation for this large gap, but it does not establish which classical dṛkkarma/frame convention is correct.
- Chromium assertions passed for the research page, all four Chapter IX event branches, Chapter VII formula/frame invariants, Chapter III interpolation, finite separated elongation diagnostics, correction-component visibility, IX.10–11 estimates, and both K candidate tables.

### Next controlled step

Do not tune the method to fit TKS K. Obtain the actual TKS Sun and Venus ephemeris JSON for the same instant and observer, then record tropical apparent longitude/latitude, apparent RA/declination, ayanāṃśa, nirayana longitude, and signed motion. The public API docs list these fields but do not themselves provide the required captured payload. First replay the local calculation from stored inputs; then run one-variable-at-a-time hybrid sensitivity checks. If the required payload cannot be obtained, keep the K gap explicitly unresolved. Production files remain untouched.


## Browser verification — latest assertion run, 13 October 2026

The latest research-branch commit `239388dec8ee2e468bfb7c334e0f60e1458c7362` passed the full `SS Chapter 9 Diagnostic Tests` workflow, including the explicit assertion that the independent Swiss Venus K result is numeric and the Swiss-minus-Astronomy-Engine delta is rendered. The paired run also passed.

- [Latest workflow run](https://github.com/OurHinduDharm/Panchang/actions/runs/38345685877) — success.
- [Paired workflow run](https://github.com/OurHinduDharm/Panchang/actions/runs/38345681664) — success.
- The workflow explicitly confirmed production Panchang files are unchanged.
- Coordinate convention in this audit now matches the browser diagnostic: **29.5830° N, 80.2090° E, 0 m** for the comparison snapshot. This is a research comparison point, not a production default.

### Immediate next gate

The numerical K discrepancy is still not attributable. The API documentation confirms the fields and endpoint, but this research environment cannot retrieve a live TKS endpoint payload directly. Do not fabricate a snapshot or treat page descriptions as data. Next, capture the Sun and Venus JSON through the live API reference's “Run example” controls for **2026-10-12 12:00 IST / 06:30 UTC**, at the coordinates above. Save the unedited responses and request metadata before calculating any hybrid deltas. If the live UI does not expose/copy the JSON, record that access limitation and keep the cause explicitly unresolved. No threshold tuning or production changes.


## User-supplied TKS Engine A heliacal response — 13 October 2026

Endpoint: `GET /v1/tks/heliacal?body=2&year=2026&month=10&day=12&days=420`. Description supplied with the response: first/last visibility transitions from the traditional elongation-orb (aṣṭāṃśa), using apparent ecliptic-of-date longitudes.

Unedited response:

```json
[
  {
    "date": "2026-10-19",
    "date_utc": "2026-10-19",
    "et": 845726399.998377,
    "planet_ecliptic_lon_deg": 213.23958607564057,
    "separation_deg": 6.622213782735912,
    "state": "asta",
    "sun_ecliptic_lon_deg": 206.61737229290466
  },
  {
    "date": "2026-10-29",
    "date_utc": "2026-10-29",
    "et": 846590399.998377,
    "planet_ecliptic_lon_deg": 207.29343760554787,
    "separation_deg": 9.283845532592409,
    "state": "udaya",
    "sun_ecliptic_lon_deg": 216.57728313814027
  },
  {
    "date": "2027-07-06",
    "date_utc": "2027-07-06",
    "et": 868190399.998377,
    "planet_ecliptic_lon_deg": 94.79580908859752,
    "separation_deg": 9.900716346994415,
    "state": "asta",
    "sun_ecliptic_lon_deg": 104.69652543559194
  },
  {
    "date": "2027-09-17",
    "date_utc": "2027-09-17",
    "et": 874497599.998377,
    "planet_ecliptic_lon_deg": 184.94362912167753,
    "separation_deg": 10.073999787277927,
    "state": "udaya",
    "sun_ecliptic_lon_deg": 174.8696293343996
  }
]
```

### What this does and does not establish

- This is a genuine user-supplied TKS Engine A heliacal response, with Sun/Venus apparent ecliptic-of-date longitudes and elongation at four reported dates.
- The reported separations are consistent with the absolute differences of the two listed longitudes (within rounding).
- It is **not** the requested 12 October 2026 12:00 IST same-instant ephemeris snapshot, and it does not return K, the selected classical threshold C, RA/declination, latitude, ayanāṃśa, or the underlying Chapter VII dṛkkarma inputs. It therefore cannot yet explain the same-instant ~4.303° K gap.
- Important audit question: the reported state dates have separations 6.622°, 9.284°, 9.901°, and 10.074°, which are not all exactly on a single 8°/10° boundary. Do not call these exact threshold instants without confirming the endpoint's sampling, event-date convention, and branch-specific orb. Ask the TKS endpoint/UI for an event definition or finer time scan before using these as exact event-time validation.
- Keep this endpoint as a separate **heliacal elongation cross-check**. Do not substitute its date/state output for the classical lagnāntara K calculation.

### Next required capture

Use the API reference's live ephemeris endpoint for the same fixed instant **2026-10-12 12:00 IST / 06:30 UTC**, observer **29.5830° N, 80.2090° E**, requesting the Sun and Venus separately. Capture the unedited response and exact request URL/parameters. Then independently compare apparent ecliptic-of-date longitude/latitude, RA/declination, and any available motion/time-scale fields. Until that is captured, the K discrepancy remains unresolved; do not tune thresholds or production calculations.


## User-supplied TKS classical Pañcāṅga snapshot — 12 October 2026, 12:00 IST

The user supplied the separate TKS “Ephemeris · पारम्परिक पञ्चाङ्ग” output for Pithoragarh, 29.5830° N, 80.2090° E, altitude 1560 m, UTC+05:30, with the Sun-visibility basis set to “dṛśya — height + refraction”.

### Values relevant to the Chapter IX audit

- Venus: shāstrīya status **asta**; **K = 7.698°**, **C = 8°**, displayed Sun separation **17.6°**; displayed asta start **12 October 2026 10:20:24**, next udaya **31 October 2026 12:06:07**, next asta **12 July 2027 05:29:26**.
- Jupiter: shāstrīya status **udaya**; **K = 58.015°**, **C = 11°**, displayed Sun separation **57.2°**; next asta **20 August 2027 00:48:11**, next udaya **12 September 2027 23:14:23**.
- The same page separately reports photometric visibility events. Keep those separate from the shāstrīya K/C event calculation.
- Sunrise/sunset are shown under both sea-level and dṛśya-at-1560-m modes. This is useful for verifying the chosen solar-day/visibility basis, but does not by itself explain the K discrepancy.

### Cross-page consistency warning

The user's separate Jeevant Panchāṅga display at the stated date/time showed Lahiri nirayana Sun longitude **177.4601°** and Venus longitude **191.5902°**, a simple longitude difference of **14.1301°**. That is not numerically the same as the other TKS page's displayed “Sun se 17.6°”. This comparison is not yet proven like-for-like: the values may represent different instants, different angular definitions (ecliptic-longitude difference versus spherical separation), or different page/source settings. Do not treat the two figures as contradictory until their timestamp and definitions are verified.

This user-supplied page output is a useful displayed result, **not** the missing raw TKS ephemeris Sun and Venus JSON for the fixed comparison instant. It does not expose the apparent tropical longitude/latitude, RA/declination, ayanāṃśa, signed motion, or the Chapter VII intermediate inputs needed to identify the ~4.3° K gap. The gap remains unresolved.

### Next controlled action

Obtain the unedited Sun and Venus JSON responses from the TKS ephemeris endpoint at **2026-10-12 12:00 IST / 06:30 UTC**, lat **29.5830**, lon **80.2090**, timezone **+5.5**, each body separately. Preserve the request parameters. Reproduce the local K from stored intermediates first; then compare one convention at a time. No threshold tuning, no inferred intermediate values, and no production changes.

## Execution checkpoint — 13 October 2026

- Latest workflow after adding the civil-instant adapter: [run #343](https://github.com/OurHinduDharm/Panchang/actions/runs/38391518627) — **success**.
- The research-only `ss_civil_date_epoch_adapter.js` now has its own CI step. All 7 adapter checks passed, including explicit timezone/meridian validation, local-mean-solar midnight arithmetic, and invoking the Chapter I.45–51 helper only when traditional calendar fields are separately supplied.
- Full workflow completed successfully, including headless Chromium and the production isolation check. `app.js` and `extra-panchang.js` remain unchanged from `main`.
- This closes the **adapter test-wiring** task only. It does not reconstruct a Gregorian date into traditional Ahargana, establish the historical Lanka meridian/epoch convention, or validate Asta/Udaya dates.
- **Immediate next task:** resolve the source and target 3-D coordinate frames for the Chapter VII calculation, as specified in the “Coordinate-frame audit update” above. Do not reopen already-passing arithmetic tests unless a new change breaks them. Then trace the four comparison fixtures' provenance and compare intermediate correction terms. Production integration remains blocked until these two gates are resolved.

## Execution checkpoint — 13 October 2026, after run #344

- Latest workflow: [run #344](https://github.com/OurHinduDharm/Panchang/actions/runs/38391636068) — **success**. The job ran the separate classical-frame transform tests, headless Chromium, and the production-file identity check.
- The research-only `ss_classical_frame.js` implements explicit 3-D rotations between a modern EQD source vector and a candidate classical equatorial frame, including an ecliptic-origin rotation and a transformed local-meridian-plane intersection. Its tests cover inverse round trips, norm preservation, orthogonality, longitude/latitude preservation under the stated transform, Chapter II.28's sine-table obliquity, invalid inputs, and a deterministic vector sweep.
- **Integration limitation found in code review:** the current browser event path in `test-astronomy.html` still obtains `state.longitude`/`state.latitude` from `getPlanetSiderealState()` and passes them into `calculateChapter7SequentialDrikkarma()`. That helper continues to construct planetary RA/declination with its own fixed-obliquity scalar formula and converts the local sidereal angle with the obliquity-only helper. The new full 3-D transform module is tested in isolation; it is **not yet the coordinate pipeline used for the event-date result**.
- Do not call the new module a solved historical frame. It encodes an explicit candidate transform (modern equator/ecliptic of date, an ayanāṃśa rotation, and selected classical obliquity); the source-supported relationship among the classical equinox, the sidereal origin, the epoch, and local time still needs adjudication.
- **Next action:** add a research-only side-by-side diagnostic that runs the current pipeline and the full-vector candidate from the same EQD vectors and same UTC instants, displaying the transformed longitude/latitude, transformed local meridian, each Chapter VII correction term, and final K. First validate vector reconstruction against the page's source RA/declination and ECT coordinates; keep candidate results clearly labelled and do not replace the baseline. Then compare with the captured TKS values without fitting the model. Keep `app.js` and `extra-panchang.js` unchanged.

## Execution checkpoint — 13 October 2026, after 3-D frame panel browser test

- The research-only EQD → candidate-classical-frame comparison panel and its automated browser assertion are now committed. Commits: [panel/helpers](https://github.com/OurHinduDharm/Panchang/commit/b38ac7e09bc6c2a73c2b9daa4ddead931d74fbe3), [browser assertion](https://github.com/OurHinduDharm/Panchang/commit/b34ca1f9874f15d096d4890309ad4ceda2a01970).
- Latest workflows [#350](https://github.com/OurHinduDharm/Panchang/actions/runs/38397044874) and [#351](https://github.com/OurHinduDharm/Panchang/actions/runs/38397053493) — **success**. The isolated frame tests, browser page test, new two-body comparison panel, and production-file identity check all passed.
- At the fixed test instant (2026-10-12 12:00 IST), the browser rendered finite candidate values for Sun and Venus. EQD↔ECT reconstruction residuals displayed as 0.000000° (rounding) and -0.000000° for the two tested bodies. This validates the numerical reconstruction path for this instant only; it does **not** validate the historical classical frame, source conventions, Chapter VII correction inputs, K, or event dates.
- `app.js` and `extra-panchang.js` remain unchanged. No production integration is authorized by these results.

### Next work package (do not skip gates)

1. **Coordinate-frame source gate:** trace the exact frame/epoch/ayanāṃśa/local-sidereal conventions asserted by the relevant Sūrya-siddhānta chapters and commentaries. Record which transformations are text-supported, which are modern comparison assumptions, and what remains undecided. Do not choose a frame merely because it agrees better with TKS.
2. **Same-instant input gate:** capture the unedited TKS Sun and Venus ephemeris JSON for 2026-10-12 12:00 IST / 06:30 UTC at 29.5830° N, 80.2090° E, timezone +05:30, preserving exact endpoint and parameters. Compare raw coordinates before applying any Chapter VII correction.
3. **Correction audit gate:** once frames and raw coordinates are like-for-like, compare Akṣa dṛkkarma, Āyana dṛkkarma, sequential frame conversion, and final K as separate terms. Preserve any unexplained residual; do not fit a threshold or date.
4. Only after all three gates pass should a production-integration proposal be considered. Until then, production files stay unchanged.

**Progress count:** 3 gates remain before a production-integration proposal; each gate can reveal additional source or validation work. The broader Udaya/Asta research is not yet complete.

### Source-gate note — Chapter VII verses checked against the TextGrid edition

- Primary text locator: [TextGrid Sūryasiddhānta edition](https://www.textgridrep.org/browse/49kc2.0), which identifies its witnesses as Hall's *Gūḍhārthaprakāśikā* edition (1854), Kāśī Sanskrit Granthamālā (1987), and Sudhākara Dvivedī's edition/commentary (1987). The displayed Sanskrit at VII.7–11 is available in the chapter sequence on that page.
- VII.7 sets up day/night measure, planetary latitude (vikṣepa), and natonnata (hour-angle/meridian relation) before the corrections. VII.8–9 gives the signed first correction and direction/hemisphere rules. VII.10 gives a second correction involving planetary latitude and the declination of the point three signs away. VII.11 explicitly says these corrections are used for conjunctions and planetary rising/setting.
- This confirms that the two correction components and their sign rules are text-grounded. It does **not**, by itself, specify that modern EQD coordinates should be converted by subtracting a fixed 24.217° ayanāṃśa and then rotating to a 24° equator, nor does it fully settle epoch/equinox/local-sidereal conventions. Therefore the new 3-D transformation remains a candidate input-preparation model, not a proven historical reconstruction.
- Source-gate status: **in progress**. Next, map each variable used in the implementation to the Sanskrit instruction and both translation/commentary witnesses; explicitly separate (a) classical computational frame, (b) modern apparent coordinates, and (c) the observational visibility threshold. Do not infer a source convention from a matching event date.


### Raw TKS capture tooling checkpoint — 2026-10-13

- Added an **optional, manual-only** capture panel to `test-astronomy.html` (commit `b79fae6e06fd24484945d618fcc13a1575389cf5`). It issues separate GET requests to `/v1/tks/ephemeris` for `body=sun` and `body=venus`, using date `2026-10-12`, time `12:00`, place `Pithoragarh`, latitude `29.5830`, longitude `80.2090`.
- The panel preserves each exact request URL, requested parameters, HTTP status, response text, parsed JSON where possible, and browser fetch/CORS errors. It does not transform or normalize the returned data.
- The endpoint's published parameter list does not include a timezone field. The panel therefore does not silently add one; its output flags this limitation for review. Do not label the returned time as UTC or as correctly interpreted local time until the endpoint behavior is confirmed.
- This external request is deliberately **not** part of the automated test suite; CI must not depend on TKS availability or CORS. Production files remain untouched.
- The API documentation lists `date,time,place,lat,lon,body` for this endpoint: https://tksephemeris.com/tks-api
- Workflow for the capture-tool commit was queued when checked; report pass/fail only after its completed result is inspected. Raw JSON has **not yet been captured** at this checkpoint.


### Variable-to-source traceability matrix — 2026-10-13

This matrix distinguishes what the cited text actually supplies from the modern input-preparation assumptions currently present in the research implementation. It is a research decision record, not approval of the current formula.

| Implementation item | Textual anchor | What is supported | What remains an assumption / next decision |
|---|---|---|---|
| Two correction terms and sequential use | VII.8–11; Burgess translation and note | Akṣa and Āyana are distinct; apply Āyana to obtain the hour-circle/ecliptic point, then Akṣa to obtain the horizon point; the method is used for rising/setting. | The exact mapping from modern apparent ephemeris fields into the text's computational quantities is not established by the verses alone. |
| Akṣa sign rules | VII.8–9 | Direction relative to meridian and north/south planetary latitude determine add/subtract. | Must ensure the implementation's sign convention matches the text's eastern/western hour-angle convention in all quadrants; verify with a verse-derived truth table, not just a numeric fixture. |
| Akṣa time ratio | VII.7–8 | Use the planet's own day/night measure and natonnata relation; the denominator is its half-day measure. | Current implementation uses RA hour angle and analytic half-day angle in a chosen equatorial frame. Need demonstrate this is a faithful computational equivalent of the source's prescribed asu/shadow geometry. |
| Āyana correction magnitude and sign | VII.10 | Add three signs to the planet's place, obtain declination, multiply declination degrees by planet-latitude arcminutes to obtain arcseconds; same-name/different-name determines sign. | The current code computes declination of a zero-latitude point at longitude +90° after restoring a modern fixed ayanāṃśa. The interpretation of latitude at the shifted point and the frame used for the declination remain unadjudicated. |
| Sidereal longitude → tropical longitude | Current research adapter; no direct VII.7–10 instruction establishes the numeric offset | The correction formula requires a consistently defined longitude and declination input. | The current `ayanamshaDeg = 24.217` is a modern comparison parameter, not a value established by VII.7–10. Replace with a source/epoch-appropriate derivation or keep as an explicitly labeled sensitivity variable. |
| Classical obliquity | II.28 sine-table rule; III and VII geometry | The source has its own sine-table parameters; II.28's maximum declination sine 1397 on radius 3438 implies `asin(1397/3438)`, approximately 23.97518°. | `obliquityDeg = 24` is a rounded construction currently used by the candidate. It must not be silently described as the exact II.28 value. Run both interpretations as separate candidates until commentary and computational context settle it. |
| Local sidereal angle / meridian frame | III.49 and Chapter VII's natonnata setup are relevant; exact bridge not yet established | The meridian and time-from-meridian geometry matter to the calculation. | Transforming modern local sidereal angle into a fixed-obliquity classical frame by preserving a modern geometric meridian plane is a mathematically testable assumption, not yet source-proven. |
| Modern EQD/ECT vector transforms | Research-only vector mathematics | The tested rotations reconstruct the modern coordinate vector with negligible residual. | Reconstruction residual only validates algebra. It does not validate the chosen historical equinox, epoch, ayanāṃśa, obliquity, or meridian interpretation. |
| Chapter III sign rising-asus interpolation | III.43–48; especially III.46–48 | Source uses sign-wise rising-asus and interpolation of degrees within a sign. | Current sign endpoints are derived analytically from a selected tropical/equatorial frame. Need compare against the source's own rising-asus table and interpolation procedure before treating this as source-faithful. |
| Chapter IX event visibility threshold | IX.6–8 and subsequent event rule | The text gives planet-specific east/west rising/setting conditions and angular thresholds. | A threshold is not interchangeable with a modern visibility model; local horizon, refraction, elevation, and apparent solar/planetary coordinates must remain distinct from the classical rule. |

#### Gate-1 next action

1. Create a verse-derived sign truth table for VII.8–9 and test all combinations of east/west and north/south latitude.
2. Compare the analytic half-day/hour-angle ratio against the Chapter III/related asu geometry used by the source, at several longitudes and latitudes.
3. Run a paired sensitivity report for (a) exact II.28 sine-table obliquity and (b) rounded 24°, with the same unmodified state vector. Do not choose whichever happens to match a reference event.
4. Keep `24.217°` and all modern frame conversions labeled as assumptions until an independent epoch/ayanāṃśa derivation is documented.

**Source-gate status remains in progress.** No raw TKS JSON has yet been captured. The optional manual capture UI exists on the research branch, but the automated suite intentionally does not call the external API.


## Checkpoint — 13 October 2026: source/sign and horizon geometry tests

- The eight-case VII.8–9 Akṣa sign truth table passed in the diagnostic workflow: observer hemisphere × planetary latitude sign × east/west hour-angle direction.
- Added an independent horizon-altitude geometry check for the planet's half-day angle. The test evaluates `sin(altitude) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(H)` at the calculated rising/setting boundary and just to either side across multiple latitudes and declinations. It passed in the Chapter VII formula-test step.
- Workflow #361: https://github.com/OurHinduDharm/Panchang/actions/runs/38400207055 — **success**, including all arithmetic/source tests, headless Chromium research-page test, and production-file identity check.
- Research changes: `ss_chapter7_drikkarma.js` and `research/SS-CHAPTER-7-FORMULA-AUDIT.md`. No production file changed.
- This establishes the consistency of the tested sign and horizon geometry only. It does **not** settle the classical coordinate-frame/epoch blocker, prove the modern-to-classical input bridge, recover raw same-instant TKS JSON, or validate the event-date fixtures.


## Frame-sensitivity diagnostic review — 14 October 2026

The PR-preview run of **Chapter VII — same-instant frame sensitivity** was reviewed at the fixed instant 2026-10-12 12:00 IST and Pithoragarh validation coordinates.

- The scalar baseline and the full-vector **obliquity-only** candidate agree to the displayed precision for Sun and Venus: same calculation-frame LST, RA, declination, hour angle, half-day angle, Āyana/Akṣa corrections, and corrected longitude. This is a useful cross-path numerical consistency check for converting the same modern state between ecliptic/equatorial coordinates while changing obliquity. It is not an independent validation of the historical source convention, because both paths share the same selected longitude/latitude inputs and the same candidate equations.
- With the assumed equinox rotation included, the candidate meridian angle differs by −22.375172°. This must not be described as simply “the ayanāṃśa difference”: it is the result of the complete chosen frame transform, including the target equator/meridian-plane intersection. The 24.217° ayanāṃśa and 24° obliquity remain assumptions, not source-derived settings.
- Venus’s total correction changes from −1.663625° to −2.311891°, and corrected longitude from 191.020409° to 190.372143° (−0.648266°). Sun’s corrected longitude is nearly unchanged at the shown precision. The body-dependent response is expected from the changed RA/declination/hour-angle geometry, but does not identify which candidate is historically correct.
- Therefore this run **does not resolve** the classical frame/epoch blocker and does not validate any Chapter IX K value or Asta/Udaya event date.
- GitHub Actions workflow #480 for commit `e4490baf83cb76d5239a9c56e17dcb8057befc87` completed successfully, including the headless Chromium research-page test and the check that production `app.js` and `extra-panchang.js` remain unchanged: https://github.com/OurHinduDharm/Panchang/actions/runs/38579546867.

### Obliquity sensitivity result — 14 October 2026

The paired fixed-instant test was run in the PR preview at 2026-10-12 12:00 IST, holding the same modern geocentric state and 24.217° comparison ayanāṃśa constant while changing only the obliquity parameter from 24° to the Chapter II.28 sine-table candidate `asin(1397/3438) ≈ 23.9751819°`.

- Sun corrected longitude is unchanged to the displayed precision. The calculation-frame LST differs by approximately −0.000072° between candidates.
- Venus Āyana correction changes by +0.002420°; Akṣa correction by +0.000378°; total correction and corrected longitude each change by +0.002798° (about 10.1 arcseconds).
- This establishes the numerical sensitivity of this implementation to the two obliquity inputs. The small difference does not determine which convention is historically intended. The test keeps modern RA/declination/state fixed and changes only the obliquity parameter in the Chapter VII correction calculation; it is not a complete re-derivation of all state coordinates in two self-consistent historical frames.
- The II.28 value is derived from the text's sine-table ratio, but whether that value is the exact obliquity intended for this Chapter VII construction still requires contextual/source review. Neither candidate is selected as authoritative.
- This result does not validate a Chapter IX K value or any Asta/Udaya event date. The frame/epoch, source-faithful civil-time bridge, and independent raw same-instant TKS intermediate comparison remain unresolved.
- GitHub Actions workflow #487 for commit `53f158581f1d110f09423b7186b790fe62228c81` completed successfully, including the headless Chromium research-page test and production-file identity check: https://github.com/OurHinduDharm/Panchang/actions/runs/38595093465.

**Next research gate:** establish a source-derived epoch/meridian/time bridge and, where possible, compare a worked classical example or captured raw same-instant intermediate outputs. Do not select either obliquity by tuning to TKS/Drik event dates.


## Checkpoint — 14 October 2026: separate fixed-LST frame sensitivity

- Added a fourth row to the Chapter VII frame-comparison diagnostic: the same vector-derived planetary coordinates are evaluated with the numerical local sidereal angle held fixed, alongside the transformed-meridian candidate. This separates (i) changing the planet's ecliptic/equatorial geometry from (ii) changing the local-meridian angle through a frame transform.
- Commit `456ef265ede30b600ed56b373e5eb571d668e59b`; workflow #489 completed successfully, including arithmetic/formula tests, HTML wiring, headless Chromium research-page test, and production-file identity check: https://github.com/OurHinduDharm/Panchang/actions/runs/38597733357.
- This commit adds the diagnostic path only. It does not supply a historical verdict, and the numerical output for the new fixed-LST row has not yet been captured in the audit. The existing transformed-meridian hypothesis remains unproven.

## Source boundary — civil time, Lanka midnight, and local nata

- I.50–51 defines the civil-day count to midnight on Lanka's meridian; I.66 discusses longitude difference as a time difference in nāḍīs, and I.67 advances/recedes mean planetary place from the midnight anchor using the elapsed nāḍīs.
- III.49 constructs madhya-lagna from the Sun and signed east/west nata using Lanka-rising asus. This is a source-shaped local-meridian method, but it requires the nata and Sun longitude to be expressed in a consistent classical frame.
- Therefore the current `ss_chapter1_epoch_bridge.js` (UTC Julian Day → local-mean JD using a configurable longitude, with a modern Ujjayinī longitude as default) is only a civil-time adapter. Its epoch anchor and default longitude are not yet a full reconstruction of the text's epoch, longitude correction, and local nata procedure.
- Next gate: document the exact chain from the selected civil instant to (a) elapsed nāḍīs from the chosen Lanka-midnight reference and (b) a source-consistent signed nata, while keeping any modern UTC/longitude conversion explicitly labeled as an input adapter. Then compare the Chapter III.49-shaped meridian result against the transformed-meridian-plane candidate over several dates and longitudes. Do not feed either candidate into Chapter IX event dates until the bridge and frame are independently adjudicated.


## Checkpoint — 15 October 2026: Chapter II table-derived rising-asus candidate

- Added `ss_chapter3_table_rising_asus.js` as a separate research-only path. It obtains solar-declination sine from the Chapter II tabular sine values, derives day-radius/cara inputs through the existing Chapter II/III arithmetic, inverts the sine quantity through the Chapter II table, and passes the three cara endpoints to the isolated III.43–45 source-sequence implementation.
- The Washington worked-example check compares the table-derived cara endpoints with Burgess's published 578, 1061, and 1263 prāṇa values, with a 3-prāṇa tolerance. The same test module checks the 21,600-prāṇa twelve-sign total, a Pithoragarh candidate, and reversal of the signed cara correction for southern latitude.
- Commit `27f615e9134b532240d3ae74a1c29abbc822d128`; workflow #499 completed successfully, including the new table-derived tests, headless Chromium research-page test, and production-file identity check: https://github.com/OurHinduDharm/Panchang/actions/runs/38683285864.
- **Interpretation limit:** the new path is table-based, but linear interpolation is still a documented candidate for the table inversion; the source's historical interpolation/rounding conventions have not yet been fully adjudicated. Solar longitude is supplied to this helper; it does not independently derive the civil-date-to-classical-longitude chain.
- Production `app.js` and `extra-panchang.js` remain unchanged. PR #22 remains Draft/unmerged. No Asta/Udaya date is certified by this checkpoint.

**Next gate:** audit the Chapter II table interpolation and the worked example line-by-line against the source edition, then compare all three table-derived Washington cara endpoints with the independent trigonometric control and preserve the signed numerical differences. Only after this local-geometry gate should the research path be connected to the still-open ahargana/epoch/frame bridge.

## Checkpoint — 15 October 2026: table-versus-trigonometric cara values

- The Chapter II table-derived path and the trigonometric control now expose the same three Washington worked-example endpoints side by side. Signed difference is defined as **table-derived minus trigonometric control**:
  - Solar longitude 30°: table 578.407419 asu; trig 578.898440 asu; difference **−0.491021 asu**.
  - Solar longitude 60°: table 1060.719250 asu; trig 1060.759644 asu; difference **−0.040394 asu**.
  - Solar longitude 90°: table 1263.419852 asu; trig 1263.264279 asu; difference **+0.155572 asu**.
- The table path reproduces the Burgess worked-example targets 578/1061/1263 within the existing 3-asu tolerance. Pithoragarh (29.5828° N) table-derived cara endpoints are 405.766436, 739.814193, and 877.573113 asu. The twelve rising periods total 21,600 asu.
- Workflow #514 for commit `5732ff85668c4a887f666e9e5aa95818b98ae78b` completed successfully, including the six table-derived tests, browser diagnostics, and the production-file identity check: https://github.com/OurHinduDharm/Panchang/actions/runs/38687706047.
- A preceding run #504 failed because the workflow's JSON diagnostic contained a literal `\\n` token. The workflow syntax was corrected; the subsequent run passed. A separate result-wiring issue was then fixed so `washingtonCrossCheck` is actually returned and printed, rather than silently omitted from JSON.
- **Interpretation:** the small table-vs-trig differences show numerical agreement for these three endpoints only; they do not validate the historical interpolation convention, source-frame meridian, ahargaṇa epoch bridge, or Chapter IX Asta/Udaya dates.
- PR #22 remains Draft/unmerged; production `app.js` and `extra-panchang.js` remain unchanged.

**Next gate:** use the source-faithful time/epoch bridge to generate a same-instant classical Sun/planet state, then audit Chapter VII dṛkkarma and Chapter IX event classification against raw same-instant intermediate values. Keep the current Chapter IX K brackets separate from apparent ecliptic-angle crossings; do not certify the event dates until the epoch/frame choice is independently justified.
