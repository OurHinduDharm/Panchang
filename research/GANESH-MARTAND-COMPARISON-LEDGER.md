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

## User-transcribed SLBS National Sanskrit University Panchang 2026–27 entries

The user has now visited the official university Panchang page and transcribed its “ग्रहों का उदयास्त” table. This supersedes the earlier note that the 2026–27 table was not yet inspected. The values below are user-transcribed from the page; they have not yet been checked against a page image.

| Printed date | Planet | Printed event | Printed time |
|---|---|---|---|
| 17.04.2026 | Mars | Rise | 25:52 |
| 29.04.2026 | Mercury | Set | 06:54 |
| 22.05.2026 | Mercury | Rise | 29:24 |
| 02.07.2026 | Mercury | Set | 14:33 |
| 22.07.2026 | Mercury | Rise | 09:38 |
| 18.08.2026 | Mercury | Set | 08:45 |
| 13.09.2026 | Mercury | Rise | 26:52 |
| 27.10.2026 | Mercury | Set | 06:49 |
| 09.11.2026 | Mercury | Rise | 24:43 |
| 13.12.2026 | Mercury | Set | 22:20 |
| 18.01.2027 | Mercury | Rise | 10:05 |
| 12.02.2027 | Mercury | Set | 30:48 |
| 24.02.2027 | Mercury | Rise | 19:37 |
| 15.07.2026 | Jupiter | Set | 19:21 |
| 10.08.2026 | Jupiter | Rise | 05:51 |
| 13.10.2026 | Venus | Set | 17:51 |
| 28.10.2026 | Venus | Rise | 30:33 |
| 17.04.2026 | Saturn | Rise | 13:59 |
| 24.03.2027 | Saturn | Set | 23:55 |

### Time convention — critical

The university's 2025–26 published table is explicitly titled “ग्रहोंके वक्रत्व-मार्गत्व एवं उदयास्त (भा. स्टैं.टा.)”, i.e. Indian Standard Time. Its entries include times above 24:00 (e.g. Mercury rise 08.08.2025 at 24:41; Jupiter rise 06.07.2025 at 29:30), so values above 24:00 are best preserved in the printed extended-hour notation and may be normalized for comparison by carrying the excess hours into the next civil date. This is **not** elapsed time from sunrise. Confirm that the 2026–27 edition uses the same convention by inspecting its full heading/notes; do not silently normalize the printed source.

### Preliminary overlaps with Ganesh Martand (not adjudicated)

- Mercury rise: Ganesh Martand 23 May 2026 05:19; SLBS printed 22 May 29:24, which normalizes arithmetically to 23 May 05:24. Residual = SLBS − GM = +5 min. This is a close cross-panchanga agreement, but the SLBS row does not specify east/west event direction; it is not yet a verified same-definition match.
- Jupiter set: GM 15 July 2026 19:09; SLBS 15 July 2026 19:21. Residual +12 min.
- Jupiter rise: GM 10 August 2026 05:40; SLBS 10 August 2026 05:51. Residual +11 min.
- Venus rise: GM 29 October 2026 06:26; SLBS printed 28 October 30:33, arithmetically 29 October 06:33. Residual +7 min.
- Venus set: GM 12 October 2026 17:40; SLBS 13 October 2026 17:51. Printed civil date differs by one day and time differs by 11 minutes; do not call this a close match until date convention and event definition are resolved.

These small residuals on Mercury/Jupiter/Venus-rise cases make the SLBS table a promising independent printed benchmark. They do **not** prove which computational model is used. Before comparing remaining Mercury entries, preserve and inspect the original event directions and standard-difference instruction in the Ganesh Martand image, and confirm the SLBS edition's exact heading/time convention.

### Correction to previous source-status note

The official index listing alone did not expose the table, but the user has now directly transcribed it. The table is available as user-provided evidence; no image-level verification is claimed. Do not state that the 2026–27 table remains unavailable.

## TKS raw-state request audit — 16 October 2026

The published TKS developer documentation was rechecked before using its ephemeris as an input to the Chapter VII/IX audit:

- `/v1/tks/ephemeris` requires a numeric `body` code; documented values are Sun = 10 and Venus = 2.
- `date` and `time` are local civil time in the zone represented by `tz`, in hours east of UTC. Thus 12 October 2026 at 06:30 IST must be sent as `date=2026-10-12`, `time=06:30`, `tz=5.5`; the equivalent UTC instant is 01:00 UTC.
- The expected Julian Date at that instant is approximately JD(UT) 2461325.5416667. The existing research-page tolerance is one second.
- The documentation says successful responses have `success: true`, describes the returned state under `body`, and says Julian-day fields are in UT. It does **not** document a top-level `selected_body` field in the published endpoint description. The current raw-capture helper checks `response_json.selected_body`; if the live payload omits that field, the helper will conservatively report the body selection as unverified even when the request parameter was correct. Inspect the captured JSON before changing the validator; do not infer an incorrect planet solely from that warning.
- The request's numeric body code and timezone are now explicit in the research-page request. The capture still needs to be run against the live response and checked for: HTTP success, `success: true`, distinct Sun/Venus state payloads, the requested UT JD, and explicit returned-body identity if the API supplies it.

Source: https://tksephemeris.com/tks-api (Ephemeris endpoint and “Dates & time zones” / “Reading the answers” documentation).

**Status:** request parameters and expected time are independently checked against the published API contract; live response/body identity remains unverified. No ephemeris values are inferred from the request URL. This does not validate TKS as the final classical method and does not authorize production changes.

### Raw-capture validator refinement (16 October 2026)

Research-only `test-astronomy.html` was updated in two commits:
- `c25599f7029e5a07363d99f4ac7a6c7140bba722`: require the API's documented `success: true` signal and make missing body identity distinct from an explicit wrong-body response.
- `c3703784c4d5ae0933c7d0ffcf041d4d8eb3676c`: recognize several possible explicit body-identity fields (including the documented `body` object/name variants) and retain the exact field/value used as evidence. Numeric codes other than Sun=10 or Venus=2 now count as an explicit mismatch instead of being silently treated as “not found”.

This is a diagnostic improvement, not a new astronomical result. The live capture still needs to be run in a browser; no TKS position values or Chapter IX event dates were inferred from the API documentation. Production files remain untouched.


## Live TKS raw Sun/Venus capture received — 16 October 2026

The project owner supplied the full browser capture for both documented API body codes at 2026-10-12 06:30 IST, Pithoragarh comparison coordinates 29.5830° N, 80.2090° E (elevation not sent to this endpoint). A compact, reproducible research fixture is stored at `research/fixtures/tks-raw-ephemeris-2026-10-12-0630-ist.json`.

### Request/time/identity checks

- Both requests returned HTTP 200 and `success: true`.
- The returned top-level `selected_body` is 10 for the Sun request and 2 for Venus; each matches the requested code.
- Returned `jd_utc` and `jd_ut1` are 2461325.541666667. Against expected JD 2461325.5416667, the difference is about 0.0029 seconds, well inside the one-second acceptance window.
- The request time is 06:30 IST = 01:00 UTC. The response's `jd_tt` differs from `jd_utc` by about 69.23 seconds, consistent with its returned `delta_t_s` field to rounding.

### State values captured (not corrected)

| Field | Sun | Venus |
|---|---:|---:|
| Apparent ecliptic longitude (deg) | 198.7274304508 | 216.9861995828 |
| Ecliptic latitude (deg) | -0.0001152825 | -7.5757395814 |
| `ra_deg` (deg) | 196.9274209273 | 211.6227468734 |
| `ra_of_date_deg` (deg) | 197.2778999689 | 211.9973637543 |
| `dec_deg` (deg) | -7.1932016355 | -20.8592321148 |
| `dec_of_date_deg` (deg) | -7.3371921932 | -20.9878590794 |
| Lahiri nirayana longitude (deg) | 174.4937879405 | 192.7525570724 |

The longitude difference from the returned apparent ecliptic longitudes is 18.2587691319°. Subtracting the returned Lahiri ayanāṃśa (24.2336425104°) from each ecliptic longitude reproduces the corresponding Lahiri nirayana longitude to rounding. This is an internal consistency check on the returned fields, not an independent check of the engine against another ephemeris.

### Interpretation limits and next calculation

1. The capture instant is a **state sample**, not the sunrise/sunset event used by IX.4. It supplies a concrete real-state fixture for later geometry tests, but it cannot by itself determine an Asta/Udaya time.
2. Keep `ra_deg`/ `dec_deg` distinct from `ra_of_date_deg`/ `dec_of_date_deg` until the API's exact frame definitions are confirmed. Do not combine a value from one pair with the other pair in an hour-angle calculation.
3. The response reports both Lahiri and Sūrya-siddhānta ayanāṃśa fields, with a note that Sūrya-siddhānta graha longitudes are already nirayana. Do not subtract the Sūrya-siddhānta ayanāṃśa from a longitude that the API already identifies as nirayana.
4. Next, query the same API at the actual selected local sunrise and sunset instants for the candidate Venus events, then independently recompute Chapter VII correction components with a single, explicitly documented coordinate frame. Keep Chapter IX lagnāntara/K and modern physical heliacal visibility as separate result columns. Do not change production files.

**Status:** live request, body identity, and timestamp checks passed for this capture. Classical method and event-date validation remain open.
