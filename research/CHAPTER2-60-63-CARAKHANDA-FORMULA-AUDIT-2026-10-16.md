# Chapter II.60–63: carakhaṇḍa formula transcription and implementation gate
Date: 2026-10-16
Branch: research/ss-ch9-diagnostic
Status: source-derived formula audit; no production integration.

## Source checked
- Burgess, Chapter II, verses 60–63: https://www.swaveda.com/texts/surya-siddhanta/2/
- Verse II.61 Sanskrit and translation: https://www.siva.sh/surya-siddhanta/2/61
- Independent readable edition: https://www.vidhyamitra.com/surya-siddhanta/2

## Formula actually stated in II.60–62
1. II.60 defines the day-radius (dyujyā) as the radius minus the versed sine corresponding to the declination magnitude. The sign/north-south label is carried separately.
2. II.61: sine of declination × equinoctial shadow ÷ 12 = earth-sine (kṣitijyā).
3. Earth-sine × sine-table radius ÷ day-radius = sine of the ascensional difference (cara).
4. II.62 says the arc corresponding to that sine, in minutes, is the ascensional difference in prāṇas. Add/subtract this cara from the relevant quarter-day/quarter-night according to the declination rule in II.62–63.

The algebraic core is therefore:

- kṣitijyā = sin(δ) × equinoctialShadow / 12
- sinCara = kṣitijyā × R / dyujyā
- caraPrāṇa = arcFromSine(sinCara)

Here R = 3438 for the traditional sine table. equinoctialShadow is the gnomon-12 shadow for the selected latitude; it must be sourced/derived in the same tradition, not silently substituted with an unrelated modern input.

## Why this is not yet a complete local Chapter III implementation
- The equation needs the signed declination convention, the source's definition of the equinoctial shadow, day-radius construction, sine-table interpolation, inverse arc conversion and rounding order all stated explicitly.
- The Chapter III example's day-radii 3366, 3216, 3140 and the three-sign sine 1397 reproduce the Laṅkā rising-asus 1670, 1795, 1935. They are golden fixtures for the equatorial base table, not local Pithoragarh carakhaṇḍas.
- The reported Washington carakhaṇḍas 578, 1061, 1263 are a critical independent fixture. A candidate implementation must reproduce them from the documented latitude/declination inputs and the source's table conventions before it is called source-faithful.
- A modern analytical oblique-ascension difference remains a comparison baseline only. It must not be used as a fallback inside the classical calculation.

## Required next implementation
Create an isolated research helper with named stages: sineTableValue, versedSine, dayRadius, equinoctialShadow, earthSine, caraSine, arcFromSinePrana, and carakhanda. Each stage should expose intermediates. Add tests for:
- the table's 24 sine entries and radius 3438;
- the 24° / sine-1397 source convention;
- zero declination -> zero cara;
- north/south sign symmetry;
- the printed 3366/3216/3140 and 1670/1795/1935 fixtures;
- Washington 578/1061/1263 once the source example's full inputs and rounding sequence are transcribed;
- Pithoragarh 29.5828° N against an independent analytical comparator, reporting error rather than forcing a match.

## Decision
Do not label any new event date final and do not integrate into app.js or extra-panchang.js. The Chapter II formula is now grounded in the text; the remaining blockers are source-table numerical conventions and fully specified example inputs. Chapter IX Asta/Udaya remains downstream of these checks.
