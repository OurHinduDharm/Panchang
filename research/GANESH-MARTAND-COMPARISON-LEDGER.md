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
