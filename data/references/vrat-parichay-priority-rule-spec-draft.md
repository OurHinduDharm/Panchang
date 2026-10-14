# Vrat-Parichay priority rule-spec queue (draft)

Date: 2026-10-14  
Status: **Research specification only — not executable code**

This file converts a few body-text observations from the repository's OCR into a controlled next-step queue. It deliberately does not assign Gregorian dates, calculate tithis, or choose a single regional tradition. Chunk references point to `data/vrat-parichay-chunks/`; OCR text must be checked against the printed edition/page before a rule is approved.

## 1. Priority queue

| ID | Candidate | OCR source | Proposed model family | Confidence at this stage | Blocking verification |
|---|---|---|---|---|---|
| VR-01 | Sankashti Chaturthi | `part-006.txt`, `part-010.txt`, monthly repetitions including `part-012.txt` | Monthly observance rule: Krishna Chaturthi + moonrise tithi predicate | High that it is recurring; exact predicate needs reconciliation | The text differs in tie-break wording: part 006 says if moonrise-vyapini on two days, observe first day; part 010 cites “मातृविद्धा प्रशस्यते” and a tṛtīyā overlap. Determine whether these are distinct cited authorities/sections and preserve provenance rather than flattening them. |
| VR-02 | Pradosh Vrat | `part-007.txt`, `part-010.txt`, `part-011.txt`, `part-012.txt` | Monthly observance rule: both pakshas' Trayodashi + evening Pradosh-kala | High that it is recurring | Part 007 states sunset through two ghatis of night; other sections refer to Pradosh-vyapini Trayodashi. Define exact local-time overlap and authority profile; do not infer from tithi label alone. |
| VR-03 | Vata Savitri | `part-012.txt` | Tradition-specific annual observance profiles | High that two traditions are explicitly noted | Source says Jyeshtha Shukla Purnima per Skanda/Bhavishyottara and Amavasya per Nirnayamrita etc., adding that Amavasya is common in the book's described region. Need edition/page scan and a user-facing tradition choice before public date display. |
| VR-04 | Nirjala Ekadashi | `part-013.txt` | Named Ekadashi alias linked to Jyeshtha Shukla Ekadashi; decision delegated to Ekadashi engine | High for name/month/paksha | Coordinate with the separate Smarta/Vaishnava Ekadashi research track; record fasting/parana guidance as text separately from the date-decision algorithm. |
| VR-05 | Ashunya Shayan Vrat | `part-014.txt` | Duration-based vow with start/end observance instances | High that it spans a period | OCR says Shravan Krishna Dwitiya through Margashirsha Krishna Dwitiya and describes a tithi-selection rule. Verify whether endpoints are inclusive and how the source's Purvaviddha/Paraviddha fallback is applied at both ends. |
| VR-06 | Mangala Gauri Vrat | `part-015.txt` | Weekday-in-month series with a five-year sankalpa context | High for the described book's form | OCR says every Tuesday of Shravan for five years after marriage, with first Shravan at natal home. This is a practice profile, not automatically a universal calendar rule; verify regional scope and whether every Tuesday should be displayed. |
| VR-07 | Adhimas / Purushottam Maas Vrat | contents in `part-002.txt`; body passage not yet fully verified | Intercalary lunar-month rule family | Medium / contents-only | Need full body text and a reliable adhika-masa calculation definition; never hard-code a Gregorian interval. |
| VR-08 | Monthly Masik Shivaratri | monthly contents / body sections to locate fully | Monthly Chaturdashi-based observance rule | Medium | Separate from Maha Shivaratri (festival-050); verify exact Krishna Chaturdashi predicate and local-time condition from the source passage. |
| VR-09 | Vaikuntha Chaturdashi | contents in `part-002.txt` | Possible annual observance, identity unresolved | Low / contents-only | Do not equate with Dev Deepawali or Mokshada Ekadashi based on proximity/name. Find and inspect full passage plus legacy linked article. |

## 2. Required record shape before implementation

Each approved observance should have a source-backed rule note with these fields:

- `ruleId`, display name, aliases, and observance family.
- Source title/author/edition, named authority cited in the passage, exact printed page verified from the scan, OCR chunk and a short passage transcription.
- Calendar profile (e.g. lunar month + paksha + tithi; local sunrise/sunset/moonrise; weekday/month; or an intercalary-month condition).
- Decision predicate written in plain language before code.
- Tie-break/exception policy with each cited authority kept distinct.
- Whether the output is a date, a multi-day range, a tithi interval, or a ritual-time window. These are not interchangeable.
- Geographic/tradition scope and a note where the source reports regional differences.
- One worked local-time example and regression tests for boundary cases.
- User-facing description/source link kept separate from computed date fields.

## 3. Minimum regression cases

### Sankashti Chaturthi
1. Chaturthi overlaps local moonrise on only one civil date.
2. Chaturthi overlaps moonrise on two consecutive civil dates.
3. Tithi changes near moonrise; ensure the local location and timezone are used.
4. Compare the different tie-break instructions in the cited passages; do not silently choose one without recording the authority profile.

### Pradosh
1. Trayodashi overlaps the evening Pradosh window.
2. Trayodashi ends before the evening window.
3. Trayodashi spans two evenings.
4. Local sunset differs by location; ensure no fixed clock time is reused.

### Vata Savitri
1. Amavasya profile.
2. Purnima profile.
3. Confirm the selected profile affects the observance record without changing the underlying tithi calculation.
4. Default must not pretend both profiles are one universal date.

### Nirjala Ekadashi
1. Smarta and Vaishnava decision profiles are evaluated separately.
2. Tithi spans sunrise on one date versus two dates.
3. Parana interval is a separate output from the observance date.
4. No rule silently equates a general Vaishnava profile with ISKCON/GCAL.

### Ashunya Shayan
1. Calculate and display start and end as separate observance decisions.
2. Verify Purvaviddha/Paraviddha fallback from the complete passage.
3. Check leap/intercalary month and tithi-boundary cases.
4. UI must describe the duration rather than imply it is a single-day festival.

### Mangala Gauri
1. Identify Tuesdays within the selected Shravan-month profile.
2. Preserve the five-year sankalpa as practice guidance rather than deriving it from a single annual event.
3. If tradition/region is not selected, avoid claiming universality.

## 4. Current implementation decision

**Do not implement these as date rules yet.** The OCR gives enough evidence to prioritize research, but not enough to certify a shastric decision algorithm. First verify printed pages and full passages; then write rule fixtures and tests in a separate branch. Keep the 122 legacy `festivals.json` records, existing article URLs and live Blogger output unchanged until the review is approved.
