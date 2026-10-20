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


## Additional cross-check: public Vidhyamitra day page (retrieved 20 October 2026)

The public page [Pañcāṅga · 8 October 2026](https://www.vidhyamitra.com/day/2026-10-08) is a **different, explicitly sunrise-based snapshot** and must not be conflated with the earlier apparent-noon ledger values above. Its search-indexed contents report:

- Sun longitude: 169.92° (Kanyā)
- Moon longitude: 137.81° (Siṃha)
- elongation: 327.89°, which gives 27.3242 elapsed tithis
- Ahargaṇa from its declared Kali-epoch convention: 1,872,856.25 days

This confirms Kṛṣṇa Trayodaśī for that sunrise snapshot, but it does not validate the earlier rounded apparent-noon values (Sun 170°10′, Moon 141°14′) or the creation-era Ahargaṇa anchor. The two snapshots differ materially in lunar longitude and time reference. The page could not be directly fetched for a full exact-time audit, so these values are a discovery lead, not a frozen fixture.

**New gate:** trace the provenance of the apparent-noon longitude pair and independently pin the exact timestamp and time convention for both records. Compare like with like only. Keep the creation-era Ahargaṇa and Kali-epoch day count in separately labelled fields; do not compare their integer scales without an explicit epoch conversion.
