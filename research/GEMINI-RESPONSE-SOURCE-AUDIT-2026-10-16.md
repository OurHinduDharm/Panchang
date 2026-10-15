# Gemini Response Audit — Sūrya-siddhānta Chapters III, VII, IX
Date: 2026-10-16
Branch: research/ss-ch9-diagnostic

## Status
This is a source/text audit, not a validated numerical Asta/Udaya result. Production files remain untouched. Do not merge this research into production.

## High-confidence corrections

### Chapter III verse references are misquoted
The supplied answer attributes a list of sign-wise values (30, 42, 36, 55, 56, etc.) to III.43–44. The Burgess-aligned text at Swaveda instead gives:
- III.43: `svādho adhaḥ pariśodhyātha meṣāllaṅkodayāsavaḥ` — obtain Lanka rising-times from successive sine values for one, two, and three signs.
- III.44: `svadeśacarakhaṇḍonā bhavantīṣṭodayāsavaḥ` — local rising-times are the Lanka values diminished by the applicable local carakhaṇḍa.
- III.45: `utkrameṇa ṣaḍevaite bhavantīṣṭās tulādayaḥ` — the complementary six signs are obtained in reverse order, with their corresponding ascensional corrections.
- III.46–47 give the proportional ascensional equivalents of traversed/remaining sign portions and use them to find lagna/meridian relations.
- III.50 (Burgess numbering) explicitly sums ascensional equivalents to determine time.

Source: https://www.swaveda.com/texts/surya-siddhanta/3/ (especially the displayed text around III.43–50).
Therefore, do not use the Gemini-provided Sanskrit as a verified verbatim quotation or treat its listed numbers as established by those verse references. Re-check the chosen Sanskrit edition and its numbering before coding.

### Chapter VII verses 7–11 are misquoted
The supplied Sanskrit attributed to VII.7–9 does not match the Burgess-aligned text. The chapter's actual sequence begins:
- VII.7: `kṛtvā dinakṣapāmānaṃ tathā vikṣepaliptikāḥ / natonnataṃ sādhayitvā svakāl lagnavaśāt tayoh`
- VII.8: `viṣuvacchāyayāmyas tadvikṣepād dvādaśoddhṛtāt ...`
- VII.9: `labdhaṃ prācyām ṛṇaṃ saumyād vikṣepāt paścime dhanam ...`
- VII.10 applies the declination/latitude-related correction with signs depending on the relative directions.
- VII.11 explicitly says this procedure is remembered for star-planet conjunctions, planetary setting/rising, and the Moon's horns.
Sources:
https://www.vidhyamitra.com/surya-siddhanta/7
https://www.swaveda.com/texts/surya-siddhanta/7/

Do not describe akṣa-dṛkkarma simply as modern parallax. It is a prescribed classical correction to the planet's apparent place for the specified geometric problem. Likewise, do not implement the order from the Gemini paraphrase without mapping each operation to the actual Sanskrit and a vetted edition/commentary.

### Chapter IX numerical thresholds are verses 6–8, not 2–3
Chapter IX.2–3 primarily determine the direction/phase (east/west; rising/setting) according to the planet's relation to the Sun and motion. The visibility limits are in IX.6–8:
- Jupiter 11°, Saturn 15°, Mars 17° (IX.6)
- Venus: west setting/east rising at 8°; east setting/west rising at 10° (IX.7)
- Mercury: 12°/14° depending on motion (IX.8)
Source: https://vidhyamitra.com/surya-siddhanta/9
Thus the Gemini answer's purported Sanskrit for IX.2–3 is not a safe verbatim citation of those verses. Keep direction selection (IX.2–3), event geometry and dr̥kkarma (IX.4–5), visibility limits (IX.6–9), and time estimation (IX.10–11) as separate steps.

## Mathematical claims that need correction or qualification

1. The formula stated as
   `Local Udayāsu = Lanka Udayāsu ± ΔC`
   is only a high-level mnemonic. In the cited III.44 wording, the applicable local carakhaṇḍa is subtracted from the Lanka rising-time; the complementary signs have their own reversed construction under III.45. Implement the sign-dependent rule, not a universal unsigned plus/minus.

2. The proposed expression `ΔC = radius of diurnal circle × sin(latitude) / cos(declination)` is dimensionally and operationally underspecified: it does not state the sine-table radius, whether the result is a sine or arc, units, sign conventions, or the precise classical intermediate quantities. Do not use it as implementation-ready mathematics. Derive the actual sequence from III and the selected commentary.

3. The explanation of akṣa-dṛkkarma as “parallax/deviant shift” is misleading if it implies modern topocentric parallax. Keep the classical dṛkkarma calculation separate from modern apparent/topocentric visibility calculations.

4. The 22° discrepancy does not prove that precession or ayanāṃśa is the historical cause. It shows that the two candidate frame constructions encode different assumptions. A longitude-origin correction and a rotation of a meridian/hour-angle frame are not automatically interchangeable. A classical fixed sidereal zodiac does not, by itself, establish that modern local sidereal time must be rotated by Lahiri ayanāṃśa. The frame mapping remains unresolved pending a source-derived derivation.

5. “Use only classical sine tables” is not yet a reproducible protocol. Specify the edition/table radius, sine interpolation, classical obliquity and epoch/ayanāṃśa model, mean/true planet-place sequence, and the time/longitude conversion. Modern ephemerides may supply a separately labelled planetary input for comparison, but must not be silently mixed into a claimed pure siddhāntic calculation.

6. Chapter IX event times must be calculated with the proper event direction and the prescribed oblique-ascension/lagna-time relation. A multi-day candidate search must recalculate the relevant daily geometry for each candidate date. A one-step estimate or modern heliacal visibility bracket is a comparator, not automatically a pure IX.10–11 result.

## Agreed next test sequence
1. Fix the text edition and record exact Sanskrit/translation/commentary for III.43–50, VII.7–11, IX.2–11.
2. Build an isolated test sheet implementing all 12 Lanka udayāsus, local carakhaṇḍa adjustments, reversed signs, and partial-sign ascensional equivalents. Add unit/sign tests.
3. Separately document the classical planet-place inputs and VII correction order; do not call them modern topocentric corrections.
4. For Pithoragarh (29.5828° N, 80.2182° E, elevation 1650 m), calculate the Venus western setting and eastern rising cases as separate fixtures. Record intermediate values and exact time basis.
5. Compare, without forcing agreement: (a) classical IX estimate, (b) daily geometry/boundary interpolation, (c) modern apparent-visibility result, and (d) Ganesh Martand reference when date, location, time zone, and event definition are aligned.
6. Keep `app.js` and `extra-panchang.js` untouched until the derivation and fixture results are independently reproducible.

## Source links
- Chapter III (Burgess translation): https://www.swaveda.com/texts/surya-siddhanta/3/
- Chapter VII (Burgess translation): https://www.swaveda.com/texts/surya-siddhanta/7/
- Chapter IX (Burgess-aligned text): https://vidhyamitra.com/surya-siddhanta/9
