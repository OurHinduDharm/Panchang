# Chapter III ascensional-equivalent audit — 2026-10-16

**Status:** research-only source finding; no production code changed.  
**Branch:** `research/ss-ch9-diagnostic`

## Source examined

Ebenezer Burgess translation of the Sūrya-siddhānta, Chapter III, verses 43–50:
https://www.swaveda.com/texts/surya-siddhanta/3/

Relevant passage mapping on the source page:
- III.43–45: derives sign rising-times (`udayāsavas`) from sine arcs and local `carakhaṇḍa` corrections; the six opposite signs are obtained by reversal.
- III.46: the ascensional equivalents of the traversed and remaining parts of a sign are proportional to degrees traversed/remaining times the sign's `udayāsavas`, divided by 30.
- III.47: uses these equivalents to derive the meridian-lagna from the Sun's east/west hour-angle.
- III.50: `sampīṇḍyāntaralagnāsūnevaṃ syātkālasādhanam`; Burgess renders the rule as adding the ascensional equivalents of the relevant partial signs and intervening signs to determine elapsed time.
- III.48–49 discuss the horizon-lagna and its relation to the Sun's longitude and local time.

## What this establishes for Chapter IX

1. Chapter IX's `lagnāntara` → time conversion should use the treatise's sign-specific ascensional equivalents, not a uniform modern 15°-per-hour shortcut, when the required sign/time branch is known.
2. The rising-asus are not just generic constants: III.43–45 explicitly derives them from the equatorial sign arcs and local ascensional-difference correction. The sign order and opposite-sign reversal are part of the method.
3. III.46–50 support a piecewise accumulation of partial-sign ascensional equivalents for the time interval. They do not by themselves validate the current JavaScript's branch selection, event-specific longitude shift, or treatment of a candidate event date.
4. These verses describe the classical lagna/ascensional-equivalent construction. They do **not** directly specify how a modern apparent Greenwich sidereal-time value must be transformed into a classical equatorial frame. Therefore this source narrows the Chapter IX time-conversion audit but does not adjudicate the competing local-meridian frame hypotheses.

## Implementation audit required next

Before changing the estimator, compare the research helper against a small independent reference implementation that:
- computes equatorial sign ascensional arcs from the explicitly selected classical obliquity;
- applies the location's classical ascensional-difference correction as described in III.43–45;
- derives all 12 sign rising-asus, including opposite-sign reversal and total-quadrant checks;
- computes the partial-sign and intervening-sign sums from III.46 and III.50 with explicit longitude ordering and wrap handling;
- tests the result against the existing helper for east- and west-side Chapter IX cases.

Then validate the *event geometry* separately: every candidate civil date must recompute that date's actual sunrise/sunset and dṛkkarma. A multi-day estimate must not repeatedly reuse the original date's horizon sample. Preserve a daily bracket/interpolation trace as an independent comparator; do not label interpolation output as a pure IX.10–11 estimate.

## Production isolation

No changes to `app.js` or `extra-panchang.js`. This note is diagnostic research, not authorization to merge PR #22 or draft PR #35.
