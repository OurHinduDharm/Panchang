# Chapter IX.5–11: antecedent and frame ruling — 22 October 2026

**Status: source-sequence ruling, provisional; research only.** No production code changed.

## Primary text checked

The Sanskrit sequence in the received vulgate text is:

- **IX.5:** `pratīcyāṃ ṣaḍbhayutayos tadval lagnāntarāsavaḥ` — for the western phenomenon, the two longitudes/lagna inputs are increased by six signs and the lagna-difference asus are found in the same way.
- **IX.10:** the difference between the current time-degrees and the limiting time-degrees is divided by the difference of the two daily motions (or their sum for the retrograde case).
- **IX.11:** `tallagnāsuhate bhuktī aṣṭādaśaśatoddhṛte` — the two daily motions, multiplied by *tat-lagna-asu*, divided by 1800, yield the time-motions used to obtain elapsed/remaining days.

Primary text with Sanskrit, translation, and sequential verses: https://karmasakha.com/texts/surya-siddhanta (IX.5–11; lines 3005–3077 in the captured text).

## Grammar/context decision

The most immediate explicit antecedent for **tat-lagna-asu** in IX.11 is the **lagnāntarāsavaḥ** just introduced in IX.5. For a western event IX.5 expressly forms that lagna-difference after adding six signs to both inputs. Reading IX.11's demonstrative as carrying forward those asus therefore supports using the **same shifted event frame** for its time-motion conversion.

This is stronger textual-sequence support for the event-frame candidate than the earlier argument based only on numerical agreement. It is not a claim that the Sanskrit contains a modern phrase such as “same coordinate frame”; that is the mathematical implication of the antecedent and the procedure stated in IX.5.

## Limits of this ruling

1. Burgess's explanatory note on the separate alternative at **IX.16** is not evidence for the IX.11 antecedent; that earlier overreach remains withdrawn.
2. This reading does not validate every input to the solver: ahargaṇa epoch/time-of-day mapping, source-derived daily motions, dṛkkarma, rising-asus tables/interpolation, and the civil-meridian convention still require independent checks.
3. Keep original-sign U visible as a comparison candidate in diagnostics. Do not silently remove it or tune tolerances to modern event dates.
4. The Ujjain worked example's use of original-sign Taurus U=1554 is an example-input choice, not by itself proof that the same choice governs a western event after IX.5's explicit six-sign shift.

## Decision

- **Preferred working reading:** event-frame U for western events, because IX.11's *tat* most naturally refers back to IX.5's shifted lagnāntara asus.
- **Confidence:** moderate, not final certification; obtain a commentary/edition-specific gloss on IX.11 if available.
- **Production:** keep `app.js` and `extra-panchang.js` unchanged. PR #22 stays Draft and unmerged until the remaining numerical inputs and event dates pass independent validation.
