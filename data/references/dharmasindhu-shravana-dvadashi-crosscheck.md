# Śravaṇa-Dvādaśī and Viṣṇu-śṛṅkhala — textual cross-check

**Research date:** 2026-10-14  
**Status:** Source cross-check, not a universalized rule or runtime implementation. The repository's uploaded Khemraj images (printed pp. 31–33) have been visually inspected. Online TransLiteral pages provide a useful additional presentation of Dharmasindhu / Nirṇayasindhu discussions, but their translated wording must be kept distinct from the uploaded printed witnesses.

## Sources

1. [Dharmasindhu — Śravaṇa-Dvādaśī vrata (TransLiteral)](https://www.transliteral.org/pages/z80503221524/view) — Marathi translation of the general vrata discussion, including disagreements about Viṣṇu-śṛṅkhala.
2. [Dharmasindhu — pāraṇa decision (TransLiteral)](https://www.transliteral.org/pages/z80503221630/view) — Marathi translation of the detailed pāraṇa discussion.
3. [Nirṇayasindhu — Śravaṇa-Dvādaśī, Sanskrit and Marathi translation (TransLiteral)](https://www.transliteral.org/pages/z130529004258/view) — records alternate textual authorities and a dispute over the scope of the pāraṇa exception.
4. [Nirṇayasindhu — Bhādrapada Śukla Dvādaśī (TransLiteral)](https://www.transliteral.org/pages/z130529004042/view) — special discussion of the Śravaṇa middle segment and its scope.

## Findings

### 1. Viṣṇu-śṛṅkhala is a defined conjunction, but the definition has variants

The Dharmasindhu translation describes the main pattern as a previous day with Ekādaśī-vedha Dvādaśī and Śravaṇa conjunction extending across both candidate days; it calls the previous day the observance day when the three-way relation is present. It gives examples where the Śravaṇa contact on Ekādaśī differs, and states that one interpretation accepts the mere contact of Śravaṇa-conjoined Dvādaśī with Ekādaśī as Viṣṇu-śṛṅkhala.

The Nirṇayasindhu discussion explicitly records a textual disagreement:
- one reading requires Śravaṇa to join both Ekādaśī and Dvādaśī;
- another reading accepts Dvādaśī joined with Śravaṇa touching Ekādaśī, even if Śravaṇa does not join Ekādaśī itself.

It also records disagreement over when a night-time conjunction is valid: one view accepts daytime only; another accepts a conjunction after midnight; other authorities restrict it to the first prahara. Do not reduce this to one universal Boolean condition. The profile must identify which authority/reading is being followed.

### 2. General Śravaṇa-Dvādaśī pāraṇa rule: both endpoints versus either endpoint

The Dharmasindhu pāraṇa translation states:
- **principal view:** pāraṇa after both Dvādaśī and Śravaṇa have ended;
- **secondary view:** pāraṇa after one of the two ends.

But the detailed discussion warns against interpreting “either endpoint” as automatically allowing pāraṇa immediately when Śravaṇa ends while Dvādaśī remains. It cites a prohibition for Śravaṇa-Dvādaśī against pāraṇa solely at Śravaṇa-end with Dvādaśī still present.

The text then discusses two duration cases:
- if Dvādaśī is the longer interval and Śravaṇa ends first, pāraṇa is described after Śravaṇa ends while Dvādaśī is still present;
- if Śravaṇa is the longer interval and Dvādaśī ends first, pāraṇa is described after Dvādaśī ends, on Trayodaśī, without a fault.

However, the discussion itself records a scope dispute: one authority says this particular duration rule concerns Vijayā-Ekādaśī joined with Śravaṇa, not the Śravaṇa-Dvādaśī vrata; another view applies it to Śravaṇa-Dvādaśī. Therefore these are separate rule profiles until the primary Sanskrit context resolves the scope.

### 3. Bhādrapada special middle-Shravana avoidance is not universal

The pāraṇa decision states that avoiding Śravaṇa's middle 20 ghaṭikās is specifically for the Bhādrapada Śravaṇa-Dvādaśī observance. It explicitly says not to transfer that restriction to Māgha/Fālguna Krishna-pakṣa Śravaṇa-Dvādaśī, because the cited Viṣṇu-parivartana significance does not apply in those months. If the middle segment cannot be avoided without violating Dvādaśī, the text gives fallback timing options; these remain authority/context-sensitive.

The Nirṇayasindhu Bhādrapada passage itself acknowledges that the underlying source for some middle-segment prohibitions is uncertain (“मूलं चिन्त्यम्” in the transcription). Record this as a known textual uncertainty, not a universally established astronomical rule.

### 4. Capacity and observance are separate from astronomical classification

The Dharmasindhu translation says that when Ekādaśī and Śravaṇa-Dvādaśī fasts occur consecutively, a capable person may perform both; a person who knows before the Ekādaśī vow that they cannot perform both may take fruit etc. on Ekādaśī and fast on Dvādaśī. It also notes that the Śravaṇa-Dvādaśī fast may yield the merit associated with Ekādaśī in the cited authorities. These are ritual-observance accommodations, not inputs to tithi/nakṣatra interval classification.

## Implementation/test implications

Add or preserve these separate profile keys/cases; do not implement them yet:

- `VSH-DHARMASINDHU-TRIPLE-CONJUNCTION`: the stricter three-way reading.
- `VSH-DHARMASINDHU-DVADASHI-TOUCH`: alternate reading allowing Śravaṇa-yukta Dvādaśī to touch Ekādaśī.
- `VSH-NIGHT-TIME-PROFILE`: daytime / after-midnight / first-prahara variants must remain explicit.
- `PAR-SHRAVANA-BOTH-ENDS`: principal both-endpoints view.
- `PAR-SHRAVANA-EITHER-END-SCOPE`: secondary view, with explicit protection against the unsupported generic rule “parana at nakṣatra end while Dvādaśī remains” unless the selected authority supports it.
- `PAR-BHADRAPADA-MIDDLE-20-GHATIS`: Bhādrapada-specific avoidance only; never apply automatically to all months.
- `PAR-LONGER-TITHI-NAKSHATRA`: separate cases for Dvādaśī longer than Śravaṇa and Śravaṇa longer than Dvādaśī, with the authority-scope dispute attached.

For all cases, require continuous local-time intervals, local sunrise, exact tithi/nakṣatra endpoints, month/pakṣa, source profile, and an explanatory rule ID. If the authority profile is missing or the required endpoint is unknown, return `unresolved`.

## Boundary of this research

This cross-check narrows the unresolved questions but does not authorize runtime changes. Do not edit `data/festivals.json`, runtime JavaScript, legacy festival dates, Blogger output, or merge PR #33 based on this note alone.
