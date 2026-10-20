# Corrected independent check: Chapter IX Ujjain example — 20 October 2026

**Status:** research-only arithmetic audit. This correction supersedes the initial version of this note, which incorrectly assumed that the six-sign shift in IX.5 must also be used for the IX.11 daily-motion conversion. No production code is changed.

## Correction from the commentary

The Burgess translation/commentary reproduced on Wikisource, page 313 of the Sanskrit-with-commentary PDF, explains the converse conversion: the degrees of time/visibility are converted to their ecliptic equivalent by the ratio **1800 : the ascensional equivalent of the sign in which the Sun and planet are situated**. In other words, if (K) is the time-angle and (U) is the rising-asus measure for the sign occupied by the bodies, the ecliptic-equivalent distance is (K\times1800/U). This is equivalent to converting each daily arc motion to time-space by multiplying it by (U/1800).

Source passage (especially lines 85–89 in the web transcription):  
https://sa.wikisource.org/wiki/पृष्ठम्:Surya_siddhanta_(with_commentary).pdf/३१३

This passage distinguishes the ecliptic positions' conversion from the six-sign rising-equivalent used to form the western lagnāntara. Therefore the previous note's claim that IX.11 necessarily uses the shifted Scorpio rising-asus was not justified. **The 4.56-day result from that assumption is withdrawn.**

## Recalculation using the submitted example's original sign

The submitted worked example has both bodies in Taurus before the western six-sign shift:

- Sun longitude: 40°00′ (Taurus 10°)
- Jupiter corrected longitude: 53°45′18″ (Taurus 23°45′18″)
- Western lagnāntara construction: add 180° to both positions, giving 220°00′ and 233°45′18″, both in Scorpio.
- For the IX.11 converse conversion, use the ascensional equivalent for the sign occupied by the bodies before that shifted rising-equivalent construction: the example's Taurus value (U=1554) asu.
- Provisional time-angle: (K=15.558°); Jupiter visibility limit (=11°).

Then:

[
\Delta K=(15.558-11)\times60=273.48
]

[
v'_{\odot}=\frac{58\times1554}{1800}=50.073333\text{ time-prāṇas/day}
]

[
v'_J=\frac{5\times1554}{1800}=4.316667\text{ time-prāṇas/day}
]

[
T=\frac{273.48}{50.073333-4.316667}
 =5.976834\text{ days}
]

Rounded to two decimal places, this is **5.98 days**. Thus the submitted arithmetic is internally consistent with the commentary's converse-conversion explanation, provided the provisional (K), corrected longitude, rising-asus table value and daily motions are themselves valid.

## What remains unverified

This audit confirms only the ratio and arithmetic for the worked example; it does not certify an actual Udaya/Asta event date. The following still require independent source/test validation:

1. The dṛkkarma corrections producing Jupiter's (53°45′18″) longitude.
2. Whether the chosen local rising-asus table value (U=1554) is the correct historical table/interpolation for this example.
3. Source-derived daily motions and whether the Chapter IX.10 retrograde/direct branch is selected correctly.
4. The day-by-day changing longitude and the exact event-time solution, rather than treating the daily motions as constant.
5. A test against a separately derived classical calculation and a modern ephemeris comparison kept as a distinct benchmark.

## Decision

- **Withdrawn:** the earlier 4.56-day “correction” based on Scorpio (U=2036).
- **Retained as provisional arithmetic:** 5.976834 days, approximately 5.98 days.
- **Not yet certified:** the complete Udaya/Asta algorithm or any date-specific output.

**Production guard:** no edits to `app.js` or `extra-panchang.js`; PR #22 remains research-only and Draft.
