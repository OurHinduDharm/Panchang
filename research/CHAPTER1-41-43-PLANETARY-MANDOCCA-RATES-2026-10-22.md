# Chapter I.41–43: planetary mandocca rates — 22 October 2026

**Status:** source-count helper added; research-only. No production files changed.

## Primary-text counts

The received Sūrya-siddhānta text gives these eastward mandocca revolution counts per kalpa:

| Body | Revolutions per kalpa | Mean angular rate (degrees/day) |
|---|---:|---:|
| Sun | 387 | 387 × 360 / (1000 × 1,577,917,828) |
| Mars | 204 | 204 × 360 / (1000 × 1,577,917,828) |
| Mercury | 368 | 368 × 360 / (1000 × 1,577,917,828) |
| Jupiter | 900 | 900 × 360 / (1000 × 1,577,917,828) |
| Venus | 535 | 535 × 360 / (1000 × 1,577,917,828) |
| Saturn | 39 | 39 × 360 / (1000 × 1,577,917,828) |

Primary text: https://karmasakha.com/texts/surya-siddhanta — I.41 at the source lines around 458–467, I.42 around 468–478. The source explains the encoded counts as Sun 387, Mars 204, Mercury 368, Jupiter 900, Venus 535 and Saturn 39.

## Implementation

Added `ss_chapter1_mean_planetary_mandocca.js`, a shared research-only helper. It:
- uses the source revolution counts and savana-day denominator;
- preserves fractional-day phase and wraps angles safely;
- accepts an explicit epoch longitude for the requested body;
- refuses to silently reuse the Sun's candidate epoch longitude for another planet;
- includes tests for all six source counts, epoch anchor handling, one-yuga and one-kalpa cycles, fractional-day motion, negative elapsed days and invalid bodies.

The test runner `ss_classical_frame_test.js` now runs this helper's arithmetic tests, and the Chapter IX workflow includes its syntax check.

## Important limitation

I.41–43 supplies revolution counts, not by itself a verified epoch longitude for each body's mandocca. The helper intentionally requires that longitude as input. It does not create a complete planetary ephemeris, validate the civil-date-to-ahargana bridge, or predict a date-specific Asta/Udaya event.

The separate Sun candidate `77°07′48″` remains labelled as a secondary-literature value pending direct source-image/epoch-frame verification. Do not copy it to Venus or Jupiter. The next source gate is to establish the correct epoch longitude and coordinate frame for Venus and Jupiter from a named edition/worked example, then combine these rates with the Chapter II manda/śīghra sequence.

## Production guard

No changes to `app.js` or `extra-panchang.js`. Keep PR #22 Draft and unmerged; modern ephemeris dates remain external comparisons, not tuning targets.
