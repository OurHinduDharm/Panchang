# Sūrya-siddhānta Chapter IX — source-anchored Asta/Udaya data ledger
**Date:** 2026-10-29  
**Status:** research-only source ledger; not a production specification and not a claim that event dates are certified.

## Purpose

Keep the explicit source data separate from modern diagnostics and unresolved interpretation. Do not wire a candidate formula into `app.js` or `extra-panchang.js` merely because unit tests pass or because a result resembles a modern Panchang.

## Primary text anchors

- Received vulgate text, Chapter IX, verses 9.1–9.11: https://karmasakha.com/texts/surya-siddhanta
- Independent English translation scan: https://upload.wikimedia.org/wikipedia/commons/7/7d/Translation_of_the_Surya_Siddhanta_%28IA_pli.kerala.rare.11437%29.pdf
- Chapter III, verses 3.43–3.45 (Lanka rising-asus and place correction): same text, Chapter III.
- India Meteorological Department Rashtriya Panchang is a modern, scientifically computed calendar reference, not a substitute for the classical Chapter IX algorithm: https://mausam.imd.gov.in/responsive/rashtriyPanchang.php
- IMD's 2026–27 bīja-correction table is a distinct modernized mean-longitude dataset; do not mix its values silently with an uncorrected classical ephemeris: https://packolkata.imd.gov.in/panchang/en/bija_corrections

## Source-explicit event classification (IX.2–IX.3)

The rule is not one universal longitude-difference rule. The sign of the Sun-relative longitude must be interpreted together with the planet's motion branch.

| Planet class / branch | Sun-relative position | Event direction stated in IX.2–IX.3 |
|---|---|---|
| Jupiter, Mars, Saturn (superior planets) | planet longitude greater than Sun | west setting (Asta) |
| Jupiter, Mars, Saturn (superior planets) | planet longitude less than Sun | east rising (Udaya) |
| Venus or Mercury, retrograde branch in IX.2 | greater than Sun | west setting (Asta) |
| Venus or Mercury, retrograde branch in IX.2 | less than Sun | east rising (Udaya) |
| Moon, Mercury, Venus, swift-moving/direct branch in IX.3 | less than Sun | east setting (Asta) |
| Moon, Mercury, Venus, swift-moving/direct branch in IX.3 | greater than Sun | west rising (Udaya) |

**Implementation guard:** classify the branch from signed relative longitude and signed daily motion, and reject ambiguous/stationary states instead of guessing. The table above records the source's event-direction distinction; it does not itself solve the time of the event.

## Source-explicit time-degree thresholds (IX.6–IX.8)

These are the text's `kālāṃśa` thresholds in the Chapter IX procedure. They must not be relabelled as modern geocentric ecliptic-longitude separation without a proof that the quantities are equivalent.

| Planet | Event branch | Threshold | Source |
|---|---|---:|---|
| Jupiter (Guru) | Asta/Udaya rule under IX.2 | 11° | IX.6 |
| Saturn (Śani) | Asta/Udaya rule under IX.2 | 15° | IX.6 |
| Mars (Maṅgala) | Asta/Udaya rule under IX.2 | 17° | IX.6 |
| Venus (Śukra) | west setting / east rising, described as greater apparent size | 8° | IX.7 |
| Venus (Śukra) | east setting / west rising, described as smaller apparent size | 10° | IX.7 |
| Mercury (Budha) | retrograde branch | 12° | IX.8 |
| Mercury (Budha) | swift-motion branch | 14° | IX.8 |

IX.9 says the bodies are visible when the time-degree exceeds the applicable limit and invisible when it is below the limit. Equality and transition-boundary handling should be made explicit in code and tests rather than left to floating-point accident.

## Required computation sequence from the text

1. **IX.4 — event-time positions:** for a western phenomenon use the Sun and planet positions at sunset; for an eastern phenomenon use them at sunrise. Compute both bodies for the civil day and then apply the planet's `dṛkkarma` (visible-position correction).
2. **IX.5 — lagnāntara:** obtain the difference between the two rising points (`lagna`). Divide the corresponding prāṇa/asu difference by 60 to obtain time-degrees (`kālāṃśa`). For a western phenomenon, add six signs (180°) to both relevant lagnas before obtaining their difference.
3. **IX.6–IX.8 — threshold:** choose the planet- and event-specific threshold from the table above.
4. **IX.9 — visibility decision:** compare the calculated time-degree with that threshold.
5. **IX.10 — elapsed/future interval:** the verse uses the remaining difference in time-degrees and the two daily motions. For direct motion it specifies their difference; for the retrograde case it specifies their sum.
6. **IX.11 — time-motion conversion:** multiply the two daily motions by the lagnāntara asus and divide by 1800 to obtain the corresponding time-motion quantities; use these to determine elapsed and future intervals.

## Dependencies that must be resolved before production use

- **Chapter I (ahargaṇa and epoch):** exact traditional epoch, elapsed-day convention, civil-date-to-traditional-time bridge, and fractional-day handling must be sourced and tested. A Gregorian date converted by a generic Julian-day helper is not automatically the Chapter I ahargaṇa.
- **Chapter III (rising-asus / local geometry):** source values for Lanka rising-asus, the exact latitude/declination correction, units, signs and the selected recension must be reconciled. Location must affect this calculation.
- **Chapter VII (dṛkkarma):** derive the ordered correction required by IX.4 from the chosen source tradition. A modern apparent position or a 3-D vector transform is a diagnostic until equivalence to the source construction is demonstrated.
- **Coordinate frame:** keep sidereal longitude, tropical longitude, latitude, ayanāṃśa and the classical meridian/time convention explicit. Do not mix ecliptic-longitude separation, spherical 3-D elongation, and lagnāntara K/C as if they were the same measure.
- **Daily motion:** preserve signed motion and the source's difference-versus-sum branch. A stationary/ambiguous case must return an explicit unresolved result.
- **Worked examples:** transcribe at least two source-derived numerical examples from a named edition, with the page/table, inputs, intermediate lagnas, lagnāntara asus, kālāṃśa, motion terms and final time. Synthetic arithmetic fixtures validate code mechanics only; they are not source-derived examples.
- **Bīja tradition:** keep uncorrected Surya-siddhanta, Burgess bīja and Makaranda/TKS variants separate until epoch, parameter signs, units and kṣepaka are reconciled. The known Mercury-sign discrepancy in secondary reconstructions must remain open; do not choose a sign by matching modern dates.

## Current diagnostic values — explicitly not certified

The research branch has recorded these competing candidates:

| Event | Chapter IX K candidate | Modern apparent-angle candidate |
|---|---|---|
| Venus Asta 2026 | 11–12 Oct | 18–19 Oct |
| Venus Udaya 2026 | 28–29 Oct | 29–30 Oct |
| Jupiter Asta 2027 | 12–13 Aug | 16–17 Aug |
| Jupiter Udaya 2027 | 12–13 Sep | 14–15 Sep |

These discrepancies are evidence that the methods are not yet reconciled; they are not permission to tune parameters to a desired date. The reported ~0.2949-day Venus-Udaya difference between two Chapter IX candidates is unresolved. A 0.75-day automated-test ceiling is only a guardrail, not a precision claim.

## Production gate

Do not change the live Panchang's overall Drik Siddhānta calculation path. Do not label modern angular estimates as “शास्त्रीय उदय/अस्त”. Production integration requires: source-backed parameter ledger; source-derived worked examples; explicit location/frame/time convention; regression comparisons for all five planets and both event directions; and a documented decision about which classical recension/tradition is implemented. Until then, show the result as a clearly marked estimate or omit it.
