# Civil-date / ahargana bridge — discrepancy gate (20 October 2026)

**Status:** BLOCKER for date-specific Sūrya-siddhānta Asta/Udaya. Research-only. No production files changed.

## What the green CI does and does not mean

The Chapter IX diagnostic workflow passed on branch `research/ss-ch9-diagnostic`, commit `76d51cf704392a5edd2e4034cc59276ff0836daa`, run 39371170696. The workflow validates helper arithmetic, HTML wiring, browser rendering, and the guard that production `app.js` and `extra-panchang.js` remain unchanged. It does not certify the epoch/day-count convention or any published event date.

## Concrete input inconsistency

The 8 October 2026 Vidhyamitra reference ledger is labelled Kṛṣṇa Trayodaśī and gives rounded longitudes Sun = Kanyā 20°10′ and Moon = Siṃha 21°14′.

1. Convert the signs to absolute zodiacal longitude: Sun Kanyā 20°10′ = `170°10′`; Moon Siṃha 21°14′ = `141°14′`. The normalized Moon–Sun elongation is `(141°14′ − 170°10′) mod 360° = 331°04′`, i.e. about `331.0667° / 12° = 27.5889` elapsed tithis from Śukla Pratipadā.
2. Kṛṣṇa Trayodaśī has ordinal interval `[27, 28)`. The previously used `26.5` synthetic input is outside that interval and must not be used as a date-specific input.
3. The civil-time bridge's chosen 2026-10-08 local-mean-noon fixture returns ahargana `714404169483.5`. Feeding the rounded-longitude candidate `27.5889` into the current Chapter I arithmetic produces approximately `714404169484.5889`, about `1.0889` days higher.
4. This is **not yet proof that the source ledger is wrong**. The source labels the instant apparent noon, while the bridge fixture is local-mean noon; the exact meridian, day boundary, tithi fraction convention, and ahargana epoch/counting convention have not been reconciled. Rounded longitudes also limit the tithi-fraction precision.

## Required resolution before planetary predictions

Do not patch the result by subtracting one day or changing the epoch offset to force a match. Establish one source-defined worked example with all of the following recorded independently:

- exact instant and time convention (apparent vs local-mean time);
- named reference meridian and longitude;
- exact, unrounded Sun and Moon positions or the source's own tithi fraction;
- the source's definition of elapsed tithi / elapsed day at that instant;
- the exact Chapter I.45–51 ahargana calculation and whether its day count is midnight- or noon-based;
- independent reproduction of the reference value from the printed rule, not from a fitted offset.

Then freeze that fixture and test adjacent instants on both sides of the source's day boundary. Only after it passes should the civil-date bridge feed the Chapter II source-motion calculation and Chapter IX.10–11 time estimate.

## Decision

The current modules remain research-only. Do not compute or display a date-specific classical Venus Asta/Udaya time from this bridge yet. Keep the display in “सत्यापनाधीन” state. The next work item is a narrow source-convention reconciliation, not another threshold or UI change.
