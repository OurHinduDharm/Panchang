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
