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
