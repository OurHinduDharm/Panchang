## Compact handoff checkpoint — 27 October 2026

**Purpose:** keep the next chat focused; this is a status note in the existing audit, not a new research file.

- PR #22 is still Draft/unmerged; 630 commits, 76 files. Production `app.js` and `extra-panchang.js` remain unchanged. Do not merge the research branch wholesale.
- Primary-text cross-check: Burgess/Sastri I.48–51 explicitly computes elapsed terrestrial days to **midnight at Laṅkā**; I.67 separately advances mean planetary place from the midnight epoch to a requested time; II.46 describes the distinct bhujāntara correction to true midnight. Source: https://en.wikisource.org/wiki/Page%3AEnglish_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri,_1861.djvu/18 and https://en.wikisource.org/wiki/Page%3AEnglish_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri,_1861.djvu/30
- Therefore the continuous-JD `ss_chapter1_ahargana_anchor.js` is only a control/interpolation, not the authoritative source-faithful date bridge. The source-derived `ss_chapter1_ahargana_calendar.js` arithmetic accepts traditional date fields, but the conversion from a civil instant into the correct traditional fields and midnight Ahargaṇa is still not independently established.
- Do **not** reuse the synthetic 26.5 elapsed-tithi input for 8 Oct 2026 Kṛṣṇa Trayodaśī; its ordinal interval is [27, 28). Do not force the apparent-noon longitude pair to equal a midnight Ahargaṇa.
- Next bounded gate: establish one exact, independently reproducible Chapter I example with named meridian, midnight boundary, traditional year/month/tithi fields, adhika-month decision and source Ahargaṇa; then advance from midnight to the same instant using I.67/II.46 as applicable. Freeze this as a fixture before using the Chapter II planetary-motion candidate.
- Current astronomical output remains diagnostic only. Venus event-date candidates are not certified; do not publish them or tune constants to modern event dates. First validate the time/epoch bridge, then the Venus source-rate ledger, then Chapter IX event timing. Keep commits limited to real code/source-validation changes.

---

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

## Primary-text clarification — retire the 1.0889-day comparison as a false like-for-like test

The primary translation of Sūrya-siddhānta I.48–51 (Burgess/Sastri text) explicitly describes the result as the elapsed terrestrial-day count **at midnight on the meridian of Laṅkā**. The verse-1.50 commentary likewise defines Ahargaṇa as elapsed civil days at Laṅkā midnight. This is not the same quantity as a continuous research adapter's interpolated value at local-mean noon, nor does an apparent-noon tithi fraction automatically become the tithi input for that midnight count. See [Burgess/Sastri translation, I.48–51](https://en.wikisource.org/wiki/Page%3AEnglish_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri%2C_1861.djvu/18) and [Sri Jagannāth Center's worked Ahargaṇa explanation](https://srijagannath.org/jyoti%E1%B9%A3a/aharga%E1%B9%87a-calculations/).

**Correction to the earlier gate:** the calculated 1.0889-day difference between the apparent-noon longitude-derived tithi fraction and the local-mean-noon interpolated Ahargaṇa is a comparison of unlike time conventions/quantities. It must **not** be treated as an established discrepancy in the source formula or as evidence that either source is wrong. Retain it only as a warning that the fixtures are not aligned; do not spend more work trying to force those two values to match.

The actual unresolved task is narrower and more actionable: construct a source-faithful midnight Ahargaṇa fixture from independently verified traditional date fields, then separately advance the resulting day-count phase to the requested instant using an explicitly stated time coordinate. Keep the research-only continuous-JD adapter labelled as an interpolation/control until that linkage is independently verified.

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


## Implementation progress — source-ratio mean planetary layer (20 October 2026)

Added research-only module [ss_chapter1_mean_planetary_positions.js](../ss_chapter1_mean_planetary_positions.js) and wired its syntax/unit tests into the Chapter IX diagnostic workflow. This fills a real gap: the existing Chapter I mean-longitude helper covered the Sun only.

The new layer exposes separate **mean longitude** and **śīghrocca longitude** using the Chapter I revolution counts:
- Mercury mean place and Venus mean place use the Sun's 4,320,000-revolution count; their śīghrocca counts are 17,937,060 and 7,022,376 per yuga.
- Mars, Jupiter and Saturn mean counts are 2,296,832, 364,220 and 146,568; their śīghrocca phase follows the Sun's 4,320,000 count.
- Fractional-day phase is preserved with integer modulo arithmetic, avoiding a floating-point multiplication of the very large creation-era Ahargaṇa.

The new dedicated tests passed in GitHub Actions run [39405398426](https://github.com/OurHinduDharm/Panchang/actions/runs/39405398426); the feature-validation workflow also passed on commit `74f0f8ea81857df4af4adf20c6d254fb35a81c40`. These tests establish the count arithmetic and declared mean-phase convention only. They do **not** validate the planetary apsis anchors, true longitude, true daily motion, or any Asta/Udaya time.

**Next real calculation gate:** source-verify the relevant planetary mandocca/śīghrocca epoch anchors, then run one Venus and one Jupiter case through the complete Chapter II correction chain. Do not substitute the existing Sun-only manda candidate or the modern ephemeris derivative for source-derived planetary motion.


## Chapter I.41–44 apsis-rate source check — Venus count

A source check found one misleading outlier that should not be treated as a settled textual variant. The Wikisource OCR transcription of the 1861 Sastri/Burgess page renders Venus's apsis count as **635** revolutions per Kalpa, but the Sanskrit text/numbering in VedaSeek gives **535**, the Burgess PDF's extracted table gives **535**, and a 2023 *Indian Journal of History of Science* article's Sūrya-Siddhānta apsidal-motion table also gives **535**. References: [Sanskrit verse I.41–42 at Siva](https://www.siva.sh/surya-siddhanta/1/41-45), [Burgess's apsis table](https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf), [2023 journal article](https://insa.nic.in/writereaddata/UpLoadedFiles/IJHS/IJHS_58_2_1.pdf).

**Working reading: 535 per Kalpa**, with the isolated 635 treated as a likely OCR/transcription error, not a proven recension variant. Do not spend another cycle debating the revolution count unless an image of the printed page or a critical apparatus shows an actual variant. The missing item for a full Venus/Jupiter source model is the independently verified **epoch longitude of each planetary mandocca** (not its revolution rate alone). The existing solar-mandocca anchor is not a substitute for Venus's or Jupiter's anchor.
