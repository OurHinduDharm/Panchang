# Vrata Decision Test Matrix (Research Draft)

**Branch:** `data/festival-json-foundation`  
**Status:** Research/test specification only. Not a runtime implementation and not approval to change festival dates.

## Purpose

Turn the source-audit findings into reproducible cases before any festival-date logic is implemented. These cases are synthetic boundary scenarios, not claims about the date of any real observance. A test passes only when the selected observance profile, source rule, input intervals, expected result, and rationale are all explicit.

## Required input model

Represent all astronomical events as location-specific timestamps in one timezone-aware timeline. Represent each tithi as a half-open interval `[start, end)`; do not infer presence from a civil-date label alone.

- observance profile / lineage: e.g. Smarta Ekadashi, Vaishnava Ekadashi, Sankashti Chaturthi, Masik Shivaratri, Maha Shivaratri, Pradosha
- local sunrise and sunset for each candidate civil date
- tithi start and end timestamps
- Arunodaya interval, if the selected source defines it
- local moonrise for Chaturthi observances
- Nishitha and Pradosha intervals for Shivaratri / Pradosha, only as defined by the chosen authority
- location, timezone, source edition/transcription, and rule citation
- expected selected date, excluded date(s), decision reason, and unresolved disagreements

Missing or uncertain event times must produce an explicit unresolved result; do not silently substitute another location's values.

## A. Ekadashi — source-specific profiles

Dharmasindhu's online transcription distinguishes Arunodaya-vedha for Vaishnavas from sunrise-vedha for Smartas, and gives multiple tithi-duration configurations. It also notes lineage/tradition as relevant to the Smarta/Vaishnava classification. These are not safely represented by one universal boolean rule.

Sources:
- [Dharmasindhu: Vaishnava decision](https://www.transliteral.org/pages/z80422042154/view)
- [Dharmasindhu: Smarta decision](https://www.transliteral.org/pages/z80422042257/view)
- [Dharmasindhu: concise decision](https://www.transliteral.org/pages/z80422042403/view)
- [Dharmasindhu: detailed Ekadashi decision](https://www.transliteral.org/pages/z80422042052/view)

| ID | Synthetic condition | Expected test behaviour | Status |
|---|---|---|---|
| EKA-01 | Dashami overlaps the source-defined Arunodaya, but not sunrise | Evaluate against Vaishnava profile separately from Smarta profile; never share a single result without rule evaluation | Required |
| EKA-02 | Dashami persists at sunrise, but not at Arunodaya | Evaluate the sunrise-vedha rule for Smarta profile and Arunodaya rule for Vaishnava profile separately | Required |
| EKA-03 | Ekadashi tithi continues after the following sunrise | Route through the applicable duration/vriddhi case; do not decide from Ekadashi's mere presence at sunrise alone | Required |
| EKA-04 | Dvadashi tithi is extended past the following sunrise | Apply the selected authority/profile's specific Dvadashi-adhikya rule; preserve conflicting views in the evidence record | Required |
| EKA-05 | Both Ekadashi and Dvadashi have extended duration across relevant sunrise boundaries | Evaluate the exact case and tradition; no generic “take next day” shortcut | Required |
| EKA-06 | Tithi boundaries are within numerical tolerance of Arunodaya or sunrise | Use documented precision/tolerance and half-open interval semantics; add tests immediately before, exactly at, and immediately after the boundary | Required |
| EKA-07 | Source/tradition classification is absent or disputed | Return “profile required / unresolved”; do not guess Smarta or Vaishnava | Required |
| EKA-08 | Fasting date is selected but Parana window has not been calculated | Keep Parana unresolved; selecting the vrata date must not imply Parana is correct | Required |

**Caution:** The transcription is valuable for locating rules but does not replace checking a specific print edition/page image. Detailed edge cases and Parana rules remain pending primary-edition verification.

## B. Sankashti Chaturthi — local moonrise

A source transcription attributed in its page title to Angirasa Smriti has body text opening as Viramitrodaya's Samayaprakasha; do not treat that page title alone as proof of textual provenance. The quoted rule “सङ्कष्टचतुर्थी तु चन्द्रोदयव्यापिनी ग्राह्या” points to moonrise-vyapini evaluation, but competing edge-case opinions require source-level review.

Sources:
- [Wikisource page with provenance mismatch to review](https://sa.wikisource.org/wiki/आङ्गिरसस्मृतिः)
- [Vachaspatiyam entry containing a disputed two-day case](https://sa.wikisource.org/wiki/वाचस्पत्यम्/तान)

| ID | Synthetic condition | Expected test behaviour | Status |
|---|---|---|---|
| SAN-01 | Chaturthi overlaps local moonrise on the first candidate date only | Select/evaluate that date under the adopted, cited profile | Required |
| SAN-02 | Chaturthi overlaps local moonrise on the second candidate date only | Select/evaluate that date under the adopted, cited profile | Required |
| SAN-03 | Chaturthi overlaps moonrise on both candidate dates | Do not apply an unreferenced tie-break; invoke a separately sourced two-day decision | Required |
| SAN-04 | Chaturthi overlaps moonrise on neither candidate date | Mark as a special edge case; do not invent a fallback | Required |
| SAN-05 | Moonrise is missing or unavailable for the selected location | Return unresolved; do not substitute a distant city's moonrise silently | Required |
| SAN-06 | Tithi ends exactly at moonrise | Test interval-boundary semantics against the selected source's definition of “vyapini” | Required |

Keep Sankashti distinct from Vinayaka/Gauri Chaturthi; a shared tithi name does not establish a shared observance algorithm.

## C. Shivaratri — separate Masik and Maha profiles

Nirnayasindhu's online transcription discusses both Pradosha- and Nishitha-related opinions and multi-night cases. Another reference summarizes a decision that selects a day when both Pradosha and Nishitha are covered, but this summary must not erase the broader source discussion. Masik Shivaratri and Maha Shivaratri must be separate profiles even if some rules overlap.

Sources:
- [Nirnayasindhu: Shivaratri decision (TransLiteral)](https://www.transliteral.org/pages/z130621065953/view)
- [Wikisource: Shivadriya/Shivapriya passage with multi-night cases](https://sa.wikisource.org/wiki/शब्दकल्पद्रुमः/शिवप्रिया)
- [SanskritDocuments festival rules](https://sanskritdocuments.org/incoming/ajit/panchanga/festival_rules.html)

| ID | Synthetic condition | Expected test behaviour | Status |
|---|---|---|---|
| SHI-01 | Chaturdashi covers both Pradosha and Nishitha on one night | Evaluate under the selected Masik or Maha profile and cited authority | Required |
| SHI-02 | First night has Nishitha coverage; second night has Pradosha coverage | Preserve authority-specific priority/tie-break; never merge both nights into a generic “overlap” flag | Required |
| SHI-03 | Both nights cover Nishitha | Apply only a sourced multi-night decision; otherwise unresolved | Required |
| SHI-04 | Both nights cover Pradosha but neither covers Nishitha | Apply only a sourced multi-night decision; otherwise unresolved | Required |
| SHI-05 | Neither night has Nishitha coverage, but one has Pradosha coverage | Evaluate the explicit exception/rule in the chosen source; do not assume Nishitha is universally mandatory | Required |
| SHI-06 | Tithi boundary falls exactly at start/end of a ritual interval | Test just-before, exact, and just-after timestamps; document interval semantics | Required |
| SHI-07 | User-facing label says “Masik Shivaratri” versus “Maha Shivaratri” | Ensure the correct observance profile is selected; no accidental reuse of annual Mahashivaratri logic for all months | Required |

**Unit warning:** One ghati is 24 minutes; three ghatis are 72 minutes. One muhurta is 48 minutes; three muhurtas are 144 minutes. A source's actual unit and context must be transcribed before any duration is coded.

## D. Pradosha — keep observance selection separate from ritual timing

| ID | Synthetic condition | Expected test behaviour | Status |
|---|---|---|---|
| PRA-01 | Trayodashi overlaps the locally calculated evening Pradosha interval | Evaluate date selection and ritual window as separate outputs | Required |
| PRA-02 | Trayodashi overlaps Pradosha on both candidate dates | Apply an explicitly cited tie-break; otherwise unresolved | Required |
| PRA-03 | Tithi is present on the civil date but does not overlap the defined Pradosha interval | Do not infer Pradosha-vyapini from date label alone | Required |
| PRA-04 | Local sunset / ritual interval inputs are unavailable | Return unresolved rather than use a generic fixed clock time | Required |
| PRA-05 | Source defines a duration in ghatis or muhurtas | Preserve the source's unit and conversion; reject silent unit substitution | Required |

## E. Cross-cutting correctness requirements

1. **Authority and tradition are data, not comments.** Each rule must identify source, edition/transcription, section/page, tradition/profile, and known dissenting views.
2. **Use local astronomical events.** Sunrise, sunset, Arunodaya, and moonrise must be calculated for the chosen location and date.
3. **Separate date selection from ritual timing.** A selected vrata date does not by itself establish Puja Muhurta or Parana.
4. **Boundary tests are mandatory.** For every interval, test just before, exactly at, and just after each boundary.
5. **No false precision.** If the source's meaning or unit is uncertain, mark it pending; do not translate a prose rule into an algorithm prematurely.
6. **Independent almanac comparison is a validation check, not the authority that resolves a textual disagreement.** Record almanac, location, year, and observed difference.
7. **No production changes from this draft.** This file does not authorize editing `data/festivals.json`, runtime JavaScript, Blogger output, or merging PR #33.

## Exit criteria before implementation

- [ ] Verify relevant Dharmasindhu and Nirnayasindhu print-edition page images and bibliographic identity.
- [ ] Record exact Sanskrit passage and page/section for each rule that will be implemented.
- [ ] Resolve or explicitly expose tradition-specific disagreement; never silently collapse it.
- [ ] Populate each synthetic case with precise timestamps and a reasoned expected output.
- [ ] Compare selected real-world examples with at least one independent almanac for the same location/year.
- [ ] Review proposed implementation and data migration separately before production-facing changes.


## F. Dharmasindhu p. 17 — pāraṇa and Mahādvādaśī follow-up fixtures (provisional)

These cases are based on the project owner's OCR transcription of the 1907 Dharmasindhu p. 17. The Archive.org scan locator is recorded in `dharmasindhu-p17-parana-research.md`, but the image could not be independently visually collated in this session. Therefore, these are test scenarios to guide source review; precise expected outputs remain provisional.

| ID | Synthetic condition | Expected test behaviour | Status |
|---|---|---|---|
| PAR-01 | Dvādaśī is extended and the candidate pāraṇa time falls inside Hari-vāsara | Block/shift pāraṇa only according to the verified source definition of Hari-vāsara; show the reason | Pending source collation |
| PAR-02 | No part (not even one kalā) of Dvādaśī is available in the relevant following-day case | Evaluate the transcribed Trayodaśī-pāraṇa clause after confirming its context | Pending source collation |
| PAR-03 | Dvādaśī remains present through midday | Preserve the text's attributed majority view and alternative view as separate profiles/options; do not silently select one | Pending source collation |
| PAR-04 | Several other ritual timings conflict with morning pāraṇa | Evaluate the alternative attributed to “केचित्” only within its sourced scope | Pending source collation |
| PAR-05 | Śravaṇa nakṣatra is joined with Dvādaśī | Apply a separate Śravaṇa-Dvādaśī profile after verifying the full conditions | Pending source collation |
| PAR-06 | The stated Viṣṇu-śṛṅkhala condition occurs | Evaluate the special Ekādaśī-fast / Dvādaśī-pāraṇa clause only after its yoga definition is verified | Pending source collation |
| MDV-01 | Each named Mahādvādaśī tithi/nakṣatra combination is present | Test each of the eight combinations separately; do not implement a single broad Mahādvādaśī boolean | Pending source collation |
| PAR-07 | Pāraṇa interval begins/ends exactly at a tithi or Hari-vāsara boundary | Test immediately before, exactly at, and immediately after; boundary inclusivity must be documented | Required |
| PAR-08 | Required local event or tithi endpoint is unavailable | Return unresolved with a reason; do not invent a pāraṇa clock time | Required |

**Unit/transcription gate:** the terms “kalā”, “muhūrta-traya”, “Hari-vāsara”, and “Viṣṇu-śṛṅkhala” must be checked in context before conversion into durations or Boolean conditions. The supplied OCR is not a final critical transcription.

**No implementation authorization:** these fixtures do not change `data/festivals.json`, runtime JavaScript, legacy festival dates, Blogger output, or PR merge state.


## G. Executable-shape fixtures from Dharmasindhu p. 17

These fixtures make the rule behaviour concrete while keeping uncertain Sanskrit definitions configurable. Times below are **synthetic UTC-like minutes on one continuous local timeline**, not real dates or calendar recommendations. Use a half-open interval `[start, end)` for tithi/nakshatra presence.

### G1. Hari-vāsara pāraṇa boundary

Assume, only for this test, Dvādaśī is `[1000, 1600)`. If Hari-vāsara is confirmed as the first quarter of the Dvādaśī interval, its end is minute `1150`.

| Test | Candidate pāraṇa instant | Expected result under the first-quarter profile |
|---|---:|---|
| HV-01 | 1149 | Block: still within Hari-vāsara |
| HV-02 | 1150 | Allow by interval convention `[start, end)`, subject to source confirmation of endpoint convention |
| HV-03 | 1151 | Do not block on Hari-vāsara alone |
| HV-04 | Dvādaśī end is missing | Unresolved; do not estimate Hari-vāsara end |
| HV-05 | Dvādaśī duration changes but a fixed clock-time Hari-vāsara is supplied | Fail: Hari-vāsara must derive from the selected source rule and actual tithi interval, not a hard-coded clock time |

**Important:** the 25% calculation is an explicit test profile based on the commonly published “first quarter” explanation; the exact rule definition and its anchor must be confirmed against the supplied Dharmasindhu passage before this becomes production logic.

### G2. Midday pāraṇa — preserve both readings

Use local sunrise `S`, midday boundary `M`, and the source-defined morning-muhūrta window `W`. Do not assume `W` until its anchor is confirmed.

| Test | Condition | Expected result |
|---|---|---|
| MID-01 | Dvādaśī is present at `M`; candidate time lies within verified `W) | Majority-view profile (“बहवः”) may accept it |
| MID-02 | Dvādaśī is present at `M`; candidate time is after `M) | Majority-view profile rejects it |
| MID-03 | Same inputs, alternate “केचित्” profile | Evaluate the stated afternoon preference separately |
| MID-04 | No profile/tradition selected | Return both opinions or “profile required”; do not silently choose |
| MID-05 | `S`, `M`, or required ritual window unavailable | Unresolved |

### G3. Śravaṇa-Dvādaśī and Viṣṇu-śṛṅkhala

| Test | Synthetic condition | Expected result |
|---|---|---|
| SHR-01 | Dvādaśī and Śravaṇa intervals overlap | Identify Śravaṇa-Dvādaśī candidate; then evaluate the observance rule separately |
| SHR-02 | Śravaṇa ends before Dvādaśī | Evaluate the transcribed instruction to pāraṇa while Dvādaśī is still joined with Śravaṇa, after exact wording is confirmed |
| SHR-03 | Viṣṇu-śṛṅkhala flag absent or not calculated | Do not activate the special clause |
| SHR-04 | Viṣṇu-śṛṅkhala condition is confirmed; Śravaṇa does not remain on Dvādaśī | Evaluate the special Ekādaśī fast / Dvādaśī pāraṇa clause as a distinct rule |
| SHR-05 | Only one of the required nakṣatra/tithi event endpoints is available | Unresolved; do not infer the overlap |

### G4. Eight Mahādvādaśī identities are separate tests

Use the exact labels and pairings in the supplied Dharmasindhu transcription as the initial source profile. Do not import alternate name-pairings from a different Vaishnava calendar profile.

| ID | Dharmasindhu p. 17 working label | Condition to verify from full passage |
|---|---|---|
| MDV-01 | Unmīlanī | Exact Ekādaśī/Dvādaśī duration condition; OCR wording needs confirmation |
| MDV-02 | Vañjulī | Pure/extended Dvādaśī condition; exact meaning of “śuddhādhikā” needs context |
| MDV-03 | Trispr̥śā | Three-tithi contact across the specified ahorātra/sunrise boundaries; exact compound needs confirmation |
| MDV-04 | Pakṣavardhinī | Amāvāsyā or Pūrṇimā with the stated day-increase condition |
| MDV-05 | Jayā | Puṣya nakṣatra joined with Dvādaśī |
| MDV-06 | Vijayā | Śravaṇa nakṣatra joined with Dvādaśī |
| MDV-07 | Jayantī | Punarvasu nakṣatra joined with Dvādaśī |
| MDV-08 | Pāpanāśinī | Rohiṇī nakṣatra joined with Dvādaśī |

For MDV-05–08, test overlap start, overlap end, exact-boundary contact, and no-overlap. For MDV-01–04, do not mark a case passing until the relevant Sanskrit condition is transcribed clearly enough to express as an unambiguous predicate.

### G5. Implementation gate

- Keep the rule profiles source-specific: `dharmasindhu-1907-p17-working` must not silently inherit a different profile's name-pairings or time rules.
- Keep three outputs separate: fasting-day selection, observance type (including Mahādvādaśī), and pāraṇa window.
- Store the reason and rule ID with every result so the UI can explain why a date/time was chosen.
- Treat an unknown condition as unresolved, not false and not a guessed default.
- These fixtures remain research-only until the exact text is confirmed; no live festival date or runtime code is changed by this section.
