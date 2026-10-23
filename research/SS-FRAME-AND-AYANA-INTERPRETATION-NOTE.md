# Sūrya-siddhānta VII–IX: source cross-check and unresolved frame decisions

**Status:** research note only; no production specification and no event-date certification.  
**Branch:** `research/ss-ch9-diagnostic`  
**Production files:** `app.js` and `extra-panchang.js` must remain unchanged.

## Sources cross-checked

- Burgess, Chapter VII, verses 7–11 and his commentary on the two-part operation: https://www.swaveda.com/texts/surya-siddhanta/7/
- Sanskrit transcription and chapter outline for VII.7–11: https://www.vidhyamitra.com/surya-siddhanta/7
- Burgess, Chapter III.9–12 and translator's interpretation of the equinox/asterism-circle model: https://www.swaveda.com/texts/surya-siddhanta/3/
- Sanskrit transcription and outline for IX.2–11: https://www.vidhyamitra.com/surya-siddhanta/9
- Astronomy Engine frame documentation: https://app.unpkg.com/astronomy-engine%402.1.19/files/README.md

## Cross-check result: VII.10 is an apparent-longitude correction, not an ayanāṃśa

The Sanskrit transcription of VII.10 reads:

`satribhagrahajakrāntibhāgaghnāḥ kṣepaliptikāḥ /
vikalāḥ svaṃ ṛṇaṃ krāntikṣepayor bhinnatulyayoḥ //`

Burgess translates the operation as multiplying the planet's latitude in minutes by the declination in degrees of the planet's position increased by three signs (90°), yielding seconds; add for unlike north/south directions and subtract for like directions.

This confirms two separate uses of similar terminology that must not be conflated:

1. **Chapter III ayana model:** describes the changing relationship between the equinox and the stellar/sign reference. Burgess interprets III.9–12 as a libration model with a 7,200-year period and limits of 27° in either direction from ζ Piscium. That is Burgess's historical interpretation of the text, not proof that every modern reconstruction must adopt it without further commentarial study.
2. **Chapter VII ayana-dṛkkarma:** a local correction to a planet's apparent longitude based on planetary latitude and a declination. The Sanskrit dictionary entry for *ayanadṛkkarman* likewise describes a calculation for ecliptic deviation; *ayanagraha* is the longitude corrected for that deviation. Neither term licenses silently inserting a modern Lahiri/Chitrapaksha offset as the Chapter VII correction.

The current candidate's `ayanamshaDeg = 24.217` is therefore only a diagnostic bridge between an input labelled sidereal and a tropical-style longitude. It is not evidence that the classical Chapter III reference frame has been reconstructed.

## What is established versus what remains open

### Established from the cited translation/text

- VII.7 requires the relevant day/night measure, planetary latitude, and the planet's meridian-distance and altitude in time, derived with the corresponding orient ecliptic point.
- VII.8–9 specify an Akṣa correction based on latitude, equinoctial shadow, meridian-distance, and the corresponding half-day, with an explicit east/west and north/south sign rule.
- VII.10 specifies the latitude-times-declination correction in arcseconds and its same-direction/opposite-direction sign rule.
- VII.11 says this operation is used before apparent-place calculations for planetary rising/setting.
- IX.4–5 says to use the planet's apparent place at sunset for western setting and at sunrise for eastern rising, then derive the relevant lagnāntara-prāṇa/kālāṃśa quantities.
- IX.6–9 provides classical visibility limits; these are not identical to a modern optical-visibility model or a fixed Sun–planet elongation threshold.

### Not yet established

- The complete transformation from Astronomy Engine's EQJ/ECT output into the historical coordinate frame assumed by the chosen Sūrya-siddhānta interpretation.
- The target equinox, ecliptic pole, epoch, and obliquity/sine-table conventions for a complete classical frame.
- Whether the Chapter III ayana model should be reconstructed from Burgess's reading, a specific Sanskrit commentary, or another explicitly named textual lineage.
- Whether local sidereal time can be transformed into the same target frame by the current shared-equinox geometric candidate. That candidate is not a general coordinate-frame transformation.
- The exact intended construction for VII.10's “planet's position increased by three signs.” The current code evaluates an ecliptic point at longitude +90° with latitude zero. Keep this as an explicit interpretation, not a hidden assumption, until commentary/derivation confirms it.
- Independent correctness of the planetary ephemeris and event dates.

## Important independent implementation cross-check

Vidhyamitra's public chapter outline groups VII.7–11 into separate named operations: `akshaDrkkarman`, `ayanaDrkkarman`, `apparentLongitude`, and `hourAngleAndHalfDay`; its IX outline separately names `heliacal`, `degreesOfTime`, and `horizonLatitudeCorrection`. This is useful as a checklist of computational stages, but the outline alone does not prove that its code or assumptions match our intended textual lineage. Do not copy results or treat the site's current-date summary as a gold-standard test without auditing the implementation and its ephemeris.

## Next work order

1. Keep the classical source equations and unit/sign tests separate from frame tests.
2. Build a coordinate-frame inventory for every input: longitude frame/equinox, latitude frame, RA/declination frame, local sidereal-time convention, obliquity model, epoch, and units.
3. Evaluate the literal Chapter II.28 sine-table path (radius 3438, maximum-declination sine 1397) separately from exact modern trigonometry at 24°. Do not silently mix the two.
4. Compare the current shared-equinox sidereal-angle transformation against an independently constructed 3-D rotation only under its stated geometric assumptions; this validates the geometry, not the historical frame.
5. Only after frame decisions are explicit, produce date-specific intermediate logs for Jupiter and Venus: source ephemeris coordinates, event branch, VII.10 correction, VII.8–9 correction, apparent longitude, sunrise/sunset geometry, IX.5 lagnāntara/kālāṃśa, threshold, and IX.10–11 time estimate.
6. Compare against location-specific references and report residuals, not just a pass/fail date match.

## Decision

No production patch, no PR merge, no tuning parameters to match the reference event date. A successful arithmetic test is evidence only for the tested arithmetic. A classical event date is not validated until the coordinate frame, event geometry, and complete Chapter IX chain have independently documented inputs and intermediate values.


## New frame-gate refinement — Chapter III.49 is the source-based meridian construction

A direct cross-check of Burgess's Chapter III.49 translation and the Sanskrit outline clarifies the next experiment: the text does not prescribe transforming a modern local sidereal-time scalar directly. It constructs the meridian ecliptic point from the Sun's longitude and the Sun's east/west *nata* (time from noon), using Lanka's rising-asus/right-ascension equivalents. Chapter III.50 then uses the rising-asus equivalents of the two ecliptic points to derive elapsed time. Sources: https://www.swaveda.com/texts/surya-siddhanta/3/ and https://vidhyamitra.com/surya-siddhanta/3

Therefore, the current `modernLocalSiderealAngleToClassicalFrame()` remains only one geometric candidate. Its norm, inverse, and plane-intersection tests establish rotation algebra—not the historical meridian construction. It must not be promoted to the canonical frame merely because its internal tests pass.

### Next diagnostic to implement

1. At a fixed instant, preserve the modern ephemeris state and record the Sun's longitude and signed local meridian-distance/time-from-noon input explicitly.
2. Construct the candidate meridian point through the Chapter III.49 method, using the documented Lanka rising-asus/right-ascension convention and the selected classical obliquity/sine table.
3. Independently calculate the candidate meridian through the transformed modern meridian plane.
4. Report their angular residual over multiple times, longitudes, and dates; do not force either result to match the other.
5. If the inputs to the Chapter III.49 path require a modern hour angle, label that dependency explicitly. It is not a wholly classical time reconstruction until the source's time/epoch bridge supplies it.

This narrows the frame blocker to a testable comparison between two constructions, but does not resolve the historical interpretation by itself. Keep the production files unchanged and leave the event-date fixtures uncertified.


## Implemented diagnostic — Chapter III.49 meridian candidate comparison (13 October 2026)

Added `ss_chapter3_meridian_frame.js`, with:
- ecliptic longitude ↔ right-ascension conversion under an explicit obliquity;
- the Chapter III.49-shaped candidate: signed nata in ghatis shifts right ascension by 6° per ghati, then maps the meridian point back to ecliptic longitude;
- a side-by-side comparison against the transformed modern meridian-plane candidate, using the modern Sun hour angle as an explicitly labelled provisional nata input;
- tests for inverse conversion, the 6°/ghati unit conversion, identical-frame agreement, and finite residual reporting under a changed frame.

The isolated tests are now wired into `ss_classical_frame_test.js`; workflow #371 passed, including the research-page browser check and the production-file identity check: https://github.com/OurHinduDharm/Panchang/actions/runs/38400900980

**Interpretation:** passing means the comparison implementation behaves as specified. It does not prove modern Sun hour angle is the historical classical *nata*, and it does not select a winning frame. The next review must inspect the actual residual values across multiple Sun states and times, and separately establish the nata/time-epoch input. Production remains unchanged.


### First residual sweep (synthetic geometry; not event validation)

A 40-case grid was evaluated with the same mathematical constructions: solar ecliptic longitudes 0°–315° in 45° steps and modern Sun hour angles −90°, −45°, 0°, +45°, +90°. The Sun state was generated from the source obliquity 23.4367°. Residual is the signed angular difference (Chapter III.49-shaped meridian RA minus transformed-meridian-plane RA).

| Frame choice | Mean absolute residual | Maximum absolute residual |
|---|---:|---:|
| Source obliquity 23.4367°, ayanamsha 24.217°, classical obliquity 24° | 2.01949° | 4.38549° |
| Same ayanamsha, classical obliquity from II.28 ratio (23.975182°) | 2.01714° | 4.37802° |
| Control: zero ecliptic-origin rotation, classical obliquity 24° | 0.06177° | 0.12464° |

This grid is synthetic and deliberately holds the modern Sun hour angle unchanged when carrying it into the transformed Sun frame. It does **not** represent an ephemeris-date validation or establish that this carry-over is historically valid. Its useful finding is narrower: the large residual in the full candidate is associated mainly with the ecliptic-origin/ayanamsha rotation assumption, not the 24° versus II.28 obliquity difference. This is evidence to investigate the frame/time bridge, not a reason to tune the rotation or accept the control frame.


## Reproducibility follow-up — synthetic sweep now runs in the test suite

Commit `90e4c3df0e881da8ca84972af32f92d1bcafc9cc` adds `runChapter3MeridianResidualSweep()` to `ss_chapter3_meridian_frame.js`. It generates the same 8 solar ecliptic longitudes × 5 signed modern hour angles (40 cases) and reports mean/max absolute residuals for the rotated-frame candidate and the zero-rotation control. The regression test checks that both configurations produce all 40 finite cases and that the rotated-frame mean residual is more than ten times the control's mean residual. This is a reproducibility guard, not a rule that the control frame is historically correct.

The isolated Node test step passed on this commit; the full workflow's headless Chromium and production-file identity steps were still running at the time this note was prepared. Workflow: https://github.com/OurHinduDharm/Panchang/actions/runs/38401627087

## Source constraint on the next time-bridge step

Burgess's translation of III.49 explicitly describes the Sun's east/west `nata` in nāḍīs and the corresponding Lanka rising-asus calculation, followed by subtraction/addition to the Sun's longitude to obtain the meridian ecliptic point. The Sanskrit text is also available at https://vidhyamitra.com/surya-siddhanta/3 and Burgess's translation at https://www.swaveda.com/texts/surya-siddhanta/3/.

This supports a source-shaped meridian construction, but it does **not** validate carrying a modern hour-angle scalar unchanged into a transformed Sun frame. The next calculation must make explicit how the chosen classical solar model supplies the signed local `nata` for the same instant, and how the Sun's longitude and the Lanka rising-asus table belong to one consistent frame. Until that bridge is justified, the rotated-frame residual is a diagnostic warning, not a correction factor to tune away.

## Latest verification checkpoint — signed nata wraparound (13 October 2026)

Commit `772eab6e9e1ca7c4115a97026b4880086203a04a` adds regression cases for signed hour angle crossing 0° in both directions: LST 1° with solar RA 359° must yield +2° (+⅓ ghati), while LST 359° with solar RA 1° must yield −2° (−⅓ ghati). This guards against a 358°/−358° wraparound error in the provisional modern-derived nata input.

Workflow #38402157939 completed successfully: arithmetic/source tests, Chapter III frame tests, headless Chromium research-page test, and production-file identity check all passed. https://github.com/OurHinduDharm/Panchang/actions/runs/38402157939

**What this proves:** the signed-angle normalization and existing research-page/test wiring behave as coded. **What it does not prove:** that modern local sidereal angle minus modern solar RA is the classical nata, or that any selected ayanamsha/frame is historically correct. No production file was changed.

## Next gate — derive the time bridge; do not tune the residual

The source descriptions of III.37–39 treat *nata* as a solar hour-angle quantity and describe deriving it through shadow/altitude geometry; III.49 then uses east/west nata with Lanka's rising-asus equivalents to obtain the meridian point. See Burgess's translation and the Sanskrit text: https://www.swaveda.com/texts/surya-siddhanta/3/ and https://vidhyamitra.com/surya-siddhanta/3

The next implementation must therefore answer, with a declared textual convention, how a civil instant becomes the relevant classical local-time/nata input **without silently importing modern LST−RA as the answer**. Keep these as separate candidate paths until evidence resolves them:
1. reconstruct the classical day/time boundary from an explicit epoch/day-number convention;
2. compute the selected classical Sun state at that instant;
3. derive local time-from-noon / signed nata under that same model and meridian convention;
4. use the matching Lanka rising-asus table and classical obliquity consistently in III.49;
5. compare against the transformed modern meridian plane as a diagnostic only.

The optional raw TKS capture remains uncollected as reproducible same-instant evidence. If used, preserve the request and raw response first and establish the endpoint's time convention before comparing coordinates. Neither that capture nor a date-only match can substitute for the independent source/time bridge.

**Gate status:** arithmetic and browser checks PASS; historical time/frame bridge OPEN; raw same-time comparison OPEN; independent final Udaya/Asta correction validation OPEN. Production `app.js` and `extra-panchang.js` remain untouched.

