# Ganesh Martand / Rashtriya Panchanga — Asta-Udaya Comparison Ledger

**Status:** research-only evidence ledger; not a production specification.  
**Updated:** 2026-10-15  
**Research branch:** `research/ss-ch9-diagnostic`

## Rules for this comparison

1. Preserve the printed Ganesh Martand Panchang values exactly as printed; do not tune formulas to force a match.
2. Keep the printed time, any Standard Difference correction, and calculated local time in separate fields.
3. Do not compare times until the event label (east/west rising/setting), observer location, elevation, time zone, civil-date convention, and method are identified.
4. Keep three event definitions distinct: (a) Sūrya-siddhānta Chapter IX lagnāntara/K, (b) a fixed apparent ecliptic-longitude threshold, and (c) physical heliacal visibility.
5. This ledger is evidence collection only. Do not modify `app.js` or `extra-panchang.js`.

## Anchor case: Mercury rises in the west, 23 May 2026

| Field | Value | Evidence / status |
|---|---|---|
| Body | Mercury (Budha) | Source labels Mercury |
| Event | Rises in the west | Explicit event label |
| Date | 23 May 2026 | Rashtriya Panchanga |
| Time | 05:24 IST | Rashtriya Panchanga heliacal table |
| Observer | “Central Station of India” | Source's stated scope; exact coordinates are not supplied in the table |
| Ganesh Martand printed time | Not transcribed in this repository note | Must be copied from the original page/image, not inferred |
| Ganesh Martand Standard Difference | Working note says Pithoragarh −00:09:10; sign and application convention still require source-page verification | Provisional |
| Same-location residual | Not yet independently reproducible | Do not claim a numerical match until the original printed time and correction direction are confirmed |

Source: https://packolkata.imd.gov.in/panchang/en/helical

The National Panchanga's time is a valuable independent reference, but it is not automatically a Pithoragarh observation. The event is described as heliacal rising/setting and the page explicitly scopes its table to the central station of India. Therefore the 05:24 value must not be treated as the local answer for Pithoragarh.

## Immediate calculation protocol

For this anchor, record the following without overwriting the original:
- `GM_printed_time`: exact printed time from the 2026–27 Raudra issue.
- `GM_SD_printed`: exact Standard Difference and sign as printed.
- `GM_corrected_time`: arithmetic result with the correction convention written explicitly.
- `RP_central_station_time`: 23 May 2026, 05:24 IST.
- `RP_station_coordinates`: unresolved from the table itself; seek the publication's definition of “Central Station”.
- `Drik_same_location_time`: not yet independently sourced for this exact event and observer.
- `SS_Chapter_IX_result`: retain the independent K/lagnāntara model; do not substitute a fixed angular threshold.
- `heliacal_visibility_result`: keep separate from the classical result.

Only after station coordinates and time-correction conventions are confirmed should a residual in minutes be reported.

## Other useful Rashtriya Panchanga anchors (2026)

The same official table lists:
- Mercury sets in the west: 28 October 2026, 06:32 IST.
- Venus sets in the west: 13 October 2026, 24:18 IST (equivalent to 14 October, 00:18 IST in ordinary civil clock notation; preserve the source's printed convention when transcribing).
- Venus rises in the east: 28 October 2026, 07:36 IST.
- Jupiter sets in the west: 15 July 2026, 11:10 IST.
- Jupiter rises in the east: 10 August 2026, 07:53 IST.

These are central-station heliacal reference entries, not verified Ganesh Martand matches and not automatically same-location benchmarks.

## Current Chapter IX lab status

The current audit already records that the four working K fixtures are not provenance-verified gold standards. At the research coordinates 29.5830° N, 80.2090° E, 0 m (external reference elevation unspecified), the current diagnostic daily K brackets are:
- Venus Asta: 11–12 October 2026.
- Venus Udaya: 28–29 October 2026.
- Jupiter Asta: 12–13 August 2027.
- Jupiter Udaya: 12–13 September 2027.

These are outputs of the current candidate implementation, not adjudicated correct dates. In particular, the large Venus Asta difference between the K candidate and the apparent-angle candidate is a prompt to audit the dṛkkarma inputs/signs and benchmark provenance, not permission to alter thresholds.

## Next required work

1. Transcribe the exact Ganesh Martand printed entries and Standard Difference instruction from the original page images.
2. Identify the Rashtriya Panchanga “Central Station” coordinates and convention for times beyond 24:00.
3. Recompute the 23 May Mercury case at a common observer/time convention; show every correction as a separate line.
4. Independently check the Chapter VII.8–10 Akṣa/Āyana correction signs and intermediate values.
5. Add Venus (October 2026) and Jupiter cases only after the anchor-case protocol is reproducible.
6. Do not merge this research branch or alter production files until the full chain and manual browser output are reviewed.

## Additional independent source leads (checked 2026-10-15)

### A. Lal Bahadur Shastri National Sanskrit University Panchanga, Vikrama Samvat 2082 (2025–26)

Published PDF: https://www.slbsrsv.ac.in/sites/default/files/Panchang_2025-26.pdf

The indexed PDF has a dedicated section on page 56 titled “ग्रहों के वक्रत्व-मार्गत्व एवं उदयास्त (भा. स्टैं.टा.)”. It prints dated planetary rising/setting entries and explicitly labels the times as “भारतीय स्टैंडर्ड टाइम” (standard time). Examples in the indexed text include Mercury setting on 1 March 2026 at 14:49 and rising on 14 March 2026 at 14:41; Jupiter setting 11 June 2025 at 19:14 and rising 6 July 2025 at 29:30; Venus setting 13 December 2025 at 29:15 and rising 31 January 2026 at 17:57. Preserve values above as transcription from the search-indexed PDF; inspect the page image before treating ambiguous dates/notations as verified.

Use: a useful second printed panchanga source for checking publication conventions and table structure. It is **not yet a same-event benchmark** for the Ganesh Martand 2026–27 entries, because it covers a different annual span and its local calculation/station details still need to be confirmed. Search did not locate a verified 2026–27 edition yet.

### B. Drik Panchang event pages

Example source: https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?lang=hi&year=2027

Use only as a separate modern/Drik-Ganita comparison. Do not treat it as a source for the complete Sūrya-siddhānta VII/IX method, and do not compare times until event definition, location, elevation, and clock convention match.

### C. Sūrya-siddhānta text and method references

- Chapter IX Sanskrit/verse-by-verse computational reference: https://vidhyamitra.com/surya-siddhanta/9
- Chapter IX Sanskrit with English translation: https://www.siva.sh/surya-siddhanta/9
- Chapter VII dṛkkarma translation: https://www.swaveda.com/texts/surya-siddhanta/7/
- Sanskrit edition with Ranganātha commentary, Calcutta 1859, digitized: https://www.e-rara.ch/zut/content/pagetext/25254718

Chapter IX 9.4–5 expressly makes dṛkkarma and lagnāntara part of the procedure; verses 9.6–9 specify the planet-dependent kalāṃśa visibility limits. Therefore a table based only on an elongation threshold or a modern physical-visibility model is a comparison column, not a substitute for the classical computation.

## Updated source strategy

1. Keep Ganesh Martand as the primary traditional benchmark.
2. Seek a 2026–27 printed table from another traditional panchanga or Sanskrit university; the 2025–26 LBS National Sanskrit University panchanga is a useful lead but not a substitute for same-year data.
3. Keep Drik Panchang and physical heliacal-visibility calculations in separate columns.
4. Continue independent Sūrya-siddhānta VII/IX auditing without changing production files.

### D. New lead found: SLBS National Sanskrit University Panchang 2026–27

The university's official Panchang index explicitly lists “Panchang 2026–27 (Samvad-2083)” alongside 2025–26 and earlier editions:
https://www.slbsrsv.ac.in/taxonomy/term/2445

The page's exposed link currently resolves to a cover thumbnail, not the actual searchable PDF or page images. Therefore this is a promising same-year alternate source, but its Asta/Udaya table has **not yet been inspected or transcribed**. Next retrieval step is to open the edition's flipbook/full-page images or locate its PDF asset; do not infer table values from the cover/index alone.
