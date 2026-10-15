# Standard Difference correction + online Udaya/Asta cross-check (2026–27)

**Recorded:** 2026-10-15  
**Status:** Working research note; not a production calculation and not a declaration of final validation.

## 1. Source and coordinate interpretation

Primary traditional source: *Ganesh Martand Panchang*, 2026–27 Raudra Samvatsara issue. The owner reports the location table as latitude `29.35`, longitude `80.13`, Standard Difference `−00:09:08`.

Working interpretation (verify against the page image): latitude `29.35` means `29°35′ N`; longitude `80.13` means `80°13′ E`. These are degree-minute values, not decimal degrees.

Target coordinates for OurHinduDharm research:
- Latitude: `29.5830° N`
- Longitude: `80.2090° E`

Using IST standard meridian `82°30′ E`, the target longitude gives:

```
(82.5 − 80.2090) × 240 seconds/degree
= 549.84 seconds
≈ 00:09:10
```

Therefore the working target correction is **−00:09:10**. Apply it by subtracting 9 minutes 10 seconds from the printed standard time, while retaining the printed value and date separately. This agrees closely with the source location's stated `−00:09:08`.

**Caution:** This is the first-pass longitude-based correction. Verify the source page's exact sign convention and whether any other local-time correction is prescribed before using it in production.

## 2. Corrected Ganesh Martand entries

Original times below are preserved as transcribed. “Adjusted” is the derived value after subtracting `00:09:10` for `29.5830°N, 80.2090°E`. The source did not supply seconds, so the input is treated as `HH:MM:00` for this arithmetic.

| Date | Planet | Printed event | Printed time | Adjusted time |
|---|---|---|---:|---:|
| 2026-04-17 | Mars | Rise | 05:45 | 05:35:50 |
| 2026-04-29 | Mercury | Eastern setting (पूर्व अस्त) | 18:43 | 18:33:50 |
| 2026-05-23 | Mercury | Western rising (पश्चिम उदय) | 05:19 | 05:09:50 |
| 2026-07-02 | Mercury | Western setting (पश्चिम अस्त) | 19:11 | 19:01:50 |
| 2026-07-22 | Mercury | Eastern rising (पूर्व उदय) | 05:30 | 05:20:50 |
| 2026-08-18 | Mercury | Eastern setting (पूर्व अस्त) | 18:45 | 18:35:50 |
| 2026-09-13 | Mercury | Western rising (पश्चिम उदय) | 05:59 | 05:49:50 |
| 2026-10-27 | Mercury | Western setting (पश्चिम अस्त) | 17:25 | 17:15:50 |
| 2026-11-10 | Mercury | Eastern rising (पूर्व उदय) | 06:36 | 06:26:50 |
| 2026-12-13 | Mercury | Eastern setting (पूर्व अस्त) | 17:09 | 16:59:50 |
| 2027-01-18 | Mercury | Western rising (पश्चिम उदय) | 07:11 | 07:01:50 |
| 2027-02-13 | Mercury | Western setting (पश्चिम अस्त) | 17:55 | 17:45:50 |
| 2027-02-24 | Mercury | Eastern rising (पूर्व उदय) | 06:46 | 06:36:50 |
| 2026-07-15 | Jupiter | Setting (direction not yet verified from image) | 19:09 | 18:59:50 |
| 2026-08-10 | Jupiter | Rising (direction not yet verified from image) | 05:40 | 05:30:50 |
| 2026-10-12 | Venus | Eastern setting (पूर्व अस्त) | 17:40 | 17:30:50 |
| 2026-10-29 | Venus | Western rising (पश्चिम उदय) | 06:26 | 06:16:50 |
| 2026-04-17 | Saturn | Rising (direction not yet verified from image) | 05:47 | 05:37:50 |
| 2027-03-24 | Saturn | Setting (direction not yet verified from image) | 18:21 | 18:11:50 |

## 3. What matches online sources so far?

### A. IMD / Positional Astronomy Centre — Rashtriya Panchanga heliacal table

Official page: https://packolkata.imd.gov.in/panchang/en/helical

The published table lists these nearby/same calendar-date events:
- Mars rises in the east: **17 April 2026** — same date as Ganesh Martand Mars rise.
- Saturn rises in the east: **17 April 2026** — same date as Ganesh Martand Saturn rise.
- Jupiter sets in the west: **15 July 2026** — same date as Ganesh Martand Jupiter setting.
- Jupiter rises in the east: **10 August 2026** — same date as Ganesh Martand Jupiter rise.
- Venus sets in the west: **13 October 2026**, while Ganesh Martand lists Venus eastern setting on **12 October** — adjacent dates, not an exact date match.
- Venus rises in the east: **28 October 2026**, while Ganesh Martand lists Venus western rising on **29 October** — adjacent dates, not an exact date match.
- Mercury sets in the east: **13 December 2026** — same date as Ganesh Martand's Mercury eastern setting.
- Mercury rises in the west: **18 January 2027** — same date as Ganesh Martand's Mercury western rising.
- Mercury sets in the west: **13 February 2027** — same date as Ganesh Martand's Mercury western setting.
- Mercury rises in the east: **23 February 2027**, while Ganesh Martand lists **24 February** — one-day difference.

**Interpretation:** This is useful independent, official **date-level corroboration**, especially for Mars, Saturn, Jupiter, and several Mercury entries. It is not yet an exact-time validation: the IMD table is explicitly a *heliacal* table, and its displayed time notation must be interpreted from the page legend before comparing clock times. Do not compare its displayed numbers directly with the adjusted Ganesh times until that notation and event definition are verified.

### B. Drik Panchang — Venus, 2026

Page: https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2026

For Deoranian, Uttar Pradesh, Drik reports:
- Venus Asta starts **12 October 2026, 18:10**.
- Venus Asta ends **29 October 2026, 05:51**.

Ganesh Martand at the target coordinates, after the current correction:
- Venus eastern setting: **12 October, 17:30:50**.
- Venus western rising: **29 October, 06:16:50**.

The dates match exactly; adjusted Ganesh times are about **39 minutes earlier** for the first boundary and **26 minutes later** for the second. However, the Drik location is Deoranian, not the target Pithoragarh coordinates, and Drik says it uses modern location-based algorithms. This is **date-level corroboration with a useful time comparison**, not a same-location exact match.

### C. Drik Panchang — Mercury cycle, 2026–27

A Drik Mercury page is available at https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html. Drik explicitly says its combustion timings are modern, location-based calculations and describes approximate Sūrya-siddhānta angular limits separately. A prior first-pass comparison recorded several adjacent or matching cycle dates, but those comparisons used other locations and event-boundary mapping is not yet fully proven. Treat them as **cycle-window clues**, not exact matches. Re-run at a common location after the printed east/west event labels are verified from the source image.

## 4. Immediate research plan

1. Verify the source page image: exact latitude/longitude notation, Standard Difference sign, and the printed directions for Jupiter and Saturn.
2. Keep both original printed times and adjusted target-local times in every table.
3. Capture same-location Drik results for Pithoragarh (or the closest available named location) and record the exact location displayed by the page.
4. For each planet, map “पूर्व अस्त / पश्चिम उदय / पश्चिम अस्त / पूर्व उदय” to the corresponding event boundary explicitly; do not assume “Asta starts/ends” always maps to a printed directional label.
5. Decode the IMD heliacal table's time format and compare exact times only after confirming the convention.
6. Compare these traditional reference events against the independent Chapter IX diagnostic, TKS mode-specific results, and modern heliacal visibility as separate methods.
7. Keep all changes research-only. Do not change `app.js` or `extra-panchang.js` until the method passes documented checks.

## 5. Sources

- Ganesh Martand Panchang 2026–27, Raudra Samvatsara issue; owner's transcription and repository image path: `data/ganesh martand panchang udaya asta.jpg`, plus location table image `data/standard difference.jpg`.
- IMD / Positional Astronomy Centre, Rashtriya Panchanga heliacal table: https://packolkata.imd.gov.in/panchang/en/helical
- Drik Panchang, Venus Asta/Udaya 2026 (Deoranian): https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2026
- Drik Panchang, Mercury Asta/Udaya 2026: https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html
