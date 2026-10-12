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
| IX.2–3 | Determine the relevant horizon and whether the planetary event is rising or setting from Sun-relative longitude and motion. Superior planets (Jupiter, Mars, Saturn) use west-setting when ahead of the Sun and east-rising when behind; retrograde Venus/Mercury follow this rule; direct/swift Venus/Mercury use the reverse pair. | The research branch classifies event geometry from signed circular longitude difference and signed daily motion. It evaluates the branch at both local sunrise and sunset; if they disagree or either is ambiguous, that date is rejected rather than guessed. | **Implemented as a tested candidate**; the four fixture classifications pass headless Chromium, but the fixture dates are not yet a source-verified gold standard. |
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

- The isolated Chapter IX event-classification tests now explicitly cover superior-planet branches for Jupiter, Mars, and Saturn, plus both directions for retrograde/direct Mercury.
- GitHub Actions run: https://github.com/OurHinduDharm/Panchang/actions/runs/38208959013 — **success**. This includes Node formula tests, Chapter VII tests, Chapter III tests, the research page in headless Chromium, and the production-file identity check.
- This is an automated/headless browser pass only. It is not a test on the user's Android device and does not validate the date fixtures as astronomical ground truth.
- Production isolation verified by blob identity against `main`: `app.js` and `extra-panchang.js` are unchanged. The research branch has not been merged.

## Verified benchmark-source distinction (12 October 2026)

- **Drik Panchang Venus Asta page:** https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?lang=en — the Delhi page lists 12 October 2026 at 18:19 as the start and 28 October 2026 at 30:00+ as the end. Its own note says its timings use modern algorithms and are observer-location based; it separately describes the Sūrya-siddhānta angular-separation rule as approximate. Therefore these times are useful as a modern location-dependent comparison, but they are not by themselves proof of the classical lagnāntara result.
- **TKS Udaya-asta page:** https://tksephemeris.com/tks-udaya-asta — explicitly separates its Shāstrīya lagnāntara-asu model from geometric arcus-visionis and Schaefer physical-visibility models. This confirms that the research page should preserve separate result columns and labels.
- These source descriptions clarify what the comparison values mean; they do **not** yet explain the numerical date differences in our four fixtures. No discrepancy cause is declared until both calculations are reproduced with the same observer, time convention, ephemeris/coordinate convention, and event definition.

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

This is grounded in the source's explicit IX.2–3 contrast and is covered by twelve added tests for superior-planet branches, direct/retrograde Venus and Mercury, longitude wraparound, exact conjunction, stationary motion, and unsupported bodies. It remains a candidate until the actual calculated classifications and four date brackets are inspected in a live run.

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
