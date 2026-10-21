# Corrected independent check: Chapter IX Ujjain example — 20 October 2026

**Status:** Research-only arithmetic audit. This version supersedes the initial note. No production code is changed.

## Correction from the commentary

The Burgess translation/commentary reproduced on Wikisource, page 313 of the Sanskrit-with-commentary PDF, explains the converse conversion: degrees of time/visibility are converted to their ecliptic equivalent by the ratio **1800 : the ascensional equivalent of the sign in which the Sun and planet are situated**. Equivalently, the ecliptic-equivalent distance is K × 1800/U, and daily arc motion is converted to time-motion by multiplying it by U/1800.

Source: https://sa.wikisource.org/wiki/पृष्ठम्:Surya_siddhanta_(with_commentary).pdf/३१३ (see explanatory text lines 85–89).

This passage supports the original-sign reading at the level of the supplied worked example; it does not by itself settle how the sign phrase applies after the western six-sign transformation in a complete date-specific solver. The two interpretations must therefore be carried as separate candidates until a worked source example or additional commentary resolves the frame.

## Recalculation using unrounded inputs

The worked example gives:
- Sun longitude: 40°00′ (Taurus 10°)
- Jupiter corrected longitude: 53°45′18″ (Taurus 23°45′18″)
- Western lagnāntara frame after adding 180°: Sun 220°00′ and Jupiter 233°45′18″, both in Scorpio
- Scorpio rising-asus is used for the western lagnāntara difference. The reported arithmetic then uses Taurus U=1554 for IX.11, treating that as the original-sign candidate; this frame choice is not independently adjudicated.
- Jupiter visibility limit: 11°.

First calculate the unrounded lagnāntara:
- Longitude difference = 13°45′18″ = 13.755°
- Lagnāntara = 13.755 × 2036 / 30 = **933.506 asu**
- Current K = 933.506 / 60 = **15.558433333°**
- Difference to Jupiter's limit = (15.558433333 − 11) × 60 = **273.506 time-prāṇas**

IX.11 time-motions using Taurus U=1554:
- Sun: 58 × 1554 / 1800 = **50.073333 time-prāṇas/day**
- Jupiter: 5 × 1554 / 1800 = **4.316667 time-prāṇas/day**
- Relative rate: 50.073333 − 4.316667 = **45.756667 time-prāṇas/day**
- Estimated interval: 273.506 / 45.756667 = **5.977402 days**, or **5.98 days** rounded to two decimal places.

The earlier 5.976834-day value used K rounded prematurely to 15.558°. The unrounded calculation above is the better arithmetic result for the supplied inputs.

## New implementation cross-check (21 October 2026)

When the original-sign U interpretation was made the primary IX.11 conversion in the date-specific browser diagnostic, the Jupiter Asta case (August 2027) differed from the adjacent daily K=C bracket interpolation by about **2.12 days**, exceeding the existing 0.75-day research guard. The prior event-frame candidate had kept the long-range discrepancies within that guard (though this is not proof that it is scripturally correct). This is material counter-evidence to promoting the original-sign interpretation directly into the solver.

The diagnostic now computes and displays both candidates side by side:
- **Event-frame U**: provisional primary for continuity with the existing solver; not certified.
- **Original-sign U**: explicit alternative matching the supplied Ujjain arithmetic; not certified.

Neither candidate is selected as authoritative from modern-date fit alone. The larger original-sign residual is a blocker to finalizing IX.11, not something to hide by loosening the test.

## What remains unverified

This confirms the ratio and arithmetic for this worked example; it does **not** certify an actual Udaya/Asta event date. Still to validate:

1. The dṛkkarma corrections producing Jupiter's 53°45′18″ longitude.
2. Whether U=1554 is the correct historical/table-interpolated Taurus rising-asus for this example.
3. Source-derived daily motions and correct Chapter IX.10 direct/retrograde branch.
4. The changing positions over the interval and a sub-day event-time solution.
5. A complete independent calculation compared with a modern ephemeris as a separate benchmark.

## Decision

- **Withdrawn:** the earlier 4.56-day alternative based on Scorpio U=2036 for the IX.11 converse conversion.
- **Retained as arithmetic only:** 5.977402 days ≈ 5.98 days for the supplied Ujjain inputs; its IX.11 frame interpretation remains unadjudicated.
- **Not yet certified:** which IX.11 rising-asus frame governs the western-event conversion, the complete Chapter IX Udaya/Asta calculation, or any date-specific display.

**Production guard:** no edits to `app.js` or `extra-panchang.js`; PR #22 remains research-only and Draft.


## Source-reference correction and 2.12-day diagnostic — 22 October 2026

A closer reading of Burgess's page 260 / the Wikisource scan changes how the earlier commentary evidence must be described.

The explanatory paragraph on the scan says explicitly that the discussed verse is **verse 16**, and that it belongs after verse 11 in the natural order. It describes an *alternative* procedure: convert the visibility/time-degrees back to their ecliptic equivalent using the ascensional equivalent of the sign occupied by Sun and planet, then solve using their ecliptic daily motions. It is not a direct gloss on the IX.11 rising-asus multiplier. Source: https://sa.wikisource.org/wiki/पृष्ठम्:Surya_siddhanta_(with_commentary).pdf/३१३, especially the editorial explanation at lines 85–89; compare Burgess's English translation: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf.

Therefore the earlier statement that this note gives direct textual support to the original-sign IX.11 candidate was too strong. **Withdraw that inference.** The page documents a separate converse/ecliptic-space method; it does not settle whether the sign-rising-asus used for IX.11 time-motion in a western-event calculation is taken before or after IX.5's six-sign transformation.

### What the 2.12-day residual actually tells us

For a western event, the implemented K calculation deliberately adds 180° to both longitudes before obtaining their sign-table rising equivalents, as required by IX.5. The daily K=C bracket and its local finite-difference rate are consequently measured in that shifted event frame. The event-frame IX.11 candidate uses the rising-asus belonging to those same shifted signs; the original-sign candidate uses different sign rising-asus values while trying to predict the crossing of the shifted-frame K. Thus the two-day-scale difference is a **frame-consistency discrepancy**, not by itself evidence that the original-sign interpretation is scripturally false or that the event-frame interpretation is scripturally proven.

The existing Jupiter Asta diagnostic illustrates this: at the sampled event, the original-sign Sun/planet U values are 2127.835521 / 2074.828297 prāṇas, whereas the six-sign-shifted event-frame values are 1460.022510 / 1262.223547. Substituting the former into a rate meant to predict the latter frame's K naturally changes the estimated interval substantially. This explains the mechanism of the 2.12-day difference; it does not independently adjudicate the textual convention.

### Updated decision

1. Do not cite the IX.16 commentary as direct evidence for IX.11's sign frame.
2. Keep both values visible in research output, but describe original-sign U as a **frame alternative**, not as the commentary-supported choice.
3. Adjudicate IX.11 from its own Sanskrit syntax and the IX.5–IX.11 sequence, ideally with a worked source calculation. Do not use modern-date fit as the deciding authority.
4. Keep production files unchanged. The 19 October Venus Asta and 30 October Venus Udaya results remain research comparisons, not certified classical timings.
