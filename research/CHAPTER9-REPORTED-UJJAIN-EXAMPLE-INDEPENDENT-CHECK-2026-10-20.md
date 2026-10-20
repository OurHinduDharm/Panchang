# Corrected independent check: Chapter IX Ujjain example — 20 October 2026

**Status:** Research-only arithmetic audit. This version supersedes the initial note. No production code is changed.

## Correction from the commentary

The Burgess translation/commentary reproduced on Wikisource, page 313 of the Sanskrit-with-commentary PDF, explains the converse conversion: degrees of time/visibility are converted to their ecliptic equivalent by the ratio **1800 : the ascensional equivalent of the sign in which the Sun and planet are situated**. Equivalently, the ecliptic-equivalent distance is K × 1800/U, and daily arc motion is converted to time-motion by multiplying it by U/1800.

Source: https://sa.wikisource.org/wiki/पृष्ठम्:Surya_siddhanta_(with_commentary).pdf/३१३ (see explanatory text lines 85–89).

This supports using the bodies' original occupied-sign rising-asus for the IX.11 converse conversion; the six-sign shift in IX.5 constructs the western rising-equivalent used for lagnāntara. My earlier concern that Scorpio U=2036 must replace Taurus U=1554 was mistaken. **The 4.56-day alternative is withdrawn.**

## Recalculation using unrounded inputs

The worked example gives:
- Sun longitude: 40°00′ (Taurus 10°)
- Jupiter corrected longitude: 53°45′18″ (Taurus 23°45′18″)
- Western lagnāntara frame after adding 180°: Sun 220°00′ and Jupiter 233°45′18″, both in Scorpio
- Scorpio rising-asus is used for the western lagnāntara difference; Taurus U=1554 asu is used for the IX.11 converse ecliptic-motion conversion because the bodies themselves occupy Taurus.
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

## What remains unverified

This confirms the ratio and arithmetic for this worked example; it does **not** certify an actual Udaya/Asta event date. Still to validate:

1. The dṛkkarma corrections producing Jupiter's 53°45′18″ longitude.
2. Whether U=1554 is the correct historical/table-interpolated Taurus rising-asus for this example.
3. Source-derived daily motions and correct Chapter IX.10 direct/retrograde branch.
4. The changing positions over the interval and a sub-day event-time solution.
5. A complete independent calculation compared with a modern ephemeris as a separate benchmark.

## Decision

- **Withdrawn:** the earlier 4.56-day alternative based on Scorpio U=2036 for the IX.11 converse conversion.
- **Retained as provisional arithmetic:** 5.977402 days ≈ 5.98 days.
- **Not yet certified:** complete Chapter IX Udaya/Asta calculation or any date-specific display.

**Production guard:** no edits to `app.js` or `extra-panchang.js`; PR #22 remains research-only and Draft.
