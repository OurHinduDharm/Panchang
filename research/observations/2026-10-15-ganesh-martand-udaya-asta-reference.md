# Ganesh Martand Panchang — Udaya/Asta reference ledger (2026–27)

**Status:** Primary traditional reference supplied by the project owner; transcribed from the 2026–27 Raudra Samvatsara issue. Preserve as a source record, not as a derived calculation.

## Provenance and interpretation

- Source title: **Ganesh Martand Panchang**, issue for **2026–2027, Raudra Samvatsara**.
- Publisher history: the project owner reports that it has been printed for 121 years.
- The project owner has bought this Panchang for many years and identifies it as a principal reference for their own Panchang work.
- Source image path in the repository: `data/ganesh martand panchang udaya asta.jpg`.
- The entries below are transcribed from the owner's message. The source page image should be visually checked before treating every character as independently verified; GitHub's file connector confirmed the path exists but cannot render binary image content.
- Time notation is `घं.मि.` (hours and minutes). Per the owner’s clarification, the printed Udaya/Asta times are **standard times** and must be adjusted by the location-specific Standard Difference before comparing with local-location results. Preserve the printed date/time unchanged as the source record; store the adjusted value in a separate column. The Panchang's sunrise-to-next-sunrise day convention may affect the assigned Panchang date, but the printed clock time is not a duration elapsed since sunrise.
- Reference location from the Panchang table: latitude `29.35` and longitude `80.13`, interpreted as degrees/minutes (`29°35′ N`, `80°13′ E`) subject to checking the page image. Its Standard Difference is `−00:09:08`. Target research coordinates: `29.5830° N, 80.2090° E`. Using the longitude relation to IST meridian `82°30′ E`, the target Standard Difference is `(82.5 − 80.2090) × 240 = 549.84 seconds`, rounded to **−00:09:10**. For the first-pass adjusted column below, subtract `00:09:10` from each printed time. This is a derived working correction and should be revisited if the original page defines a different sign convention.
- The listed entries are **not automatically interchangeable** with modern apparent elongation thresholds or Swiss heliacal visibility. Keep the traditional source event, Drik result, TKS result, independent Chapter IX reconstruction, and scientific visibility result in separate columns.

## Transcribed entries

| Printed year | Month | Day | Body | Event/direction as supplied | Printed standard time (HH:MM) | Adjusted at 29.5830°N, 80.2090°E (HH:MM:SS) |
|---:|---:|---:|---|---|---:|
| 2026 | 4 | 17 | Mars (भौम) | Rise | 05:45 | 05:35:50 |
| 2026 | 4 | 29 | Mercury (बुध) | Eastern setting (पूर्व अस्त) | 18:43 | 18:33:50 |
| 2026 | 5 | 23 | Mercury (बुध) | Western rising (पश्चिम उदय) | 05:19 | 05:09:50 |
| 2026 | 7 | 2 | Mercury (बुध) | Western setting (पश्चिम अस्त) | 19:11 | 19:01:50 |
| 2026 | 7 | 22 | Mercury (बुध) | Eastern rising (पूर्व उदय) | 05:30 | 05:20:50 |
| 2026 | 8 | 18 | Mercury (बुध) | Eastern setting (पूर्व अस्त) | 18:45 | 18:35:50 |
| 2026 | 9 | 13 | Mercury (बुध) | Western rising (पश्चिम उदय) | 05:59 | 05:49:50 |
| 2026 | 10 | 27 | Mercury (बुध) | Western setting (पश्चिम अस्त) | 17:25 | 17:15:50 |
| 2026 | 11 | 10 | Mercury (बुध) | Eastern rising (पूर्व उदय) | 06:36 | 06:26:50 |
| 2026 | 12 | 13 | Mercury (बुध) | Eastern setting (पूर्व अस्त) | 17:09 | 16:59:50 |
| 2027 | 1 | 18 | Mercury (बुध) | Western rising (पश्चिम उदय) | 07:11 | 07:01:50 |
| 2027 | 2 | 13 | Mercury (बुध) | Western setting (पश्चिम अस्त) | 17:55 | 17:45:50 |
| 2027 | 2 | 24 | Mercury (बुध) | Eastern rising (पूर्व उदय) | 06:46 | 06:36:50 |
| 2026 | 7 | 15 | Jupiter (गुरु) | Setting (अस्त; direction not specified in supplied transcription) | 19:09 | 18:59:50 |
| 2026 | 8 | 10 | Jupiter (गुरु) | Rising (उदय; direction not specified in supplied transcription) | 05:40 | 05:30:50 |
| 2026 | 10 | 12 | Venus (शुक्र) | Eastern setting (पूर्व अस्त) | 17:40 | 17:30:50 |
| 2026 | 10 | 29 | Venus (शुक्र) | Western rising (पश्चिम उदय) | 06:26 | 06:16:50 |
| 2026 | 4 | 17 | Saturn (शनि) | Rising (उदय; direction not specified in supplied transcription) | 05:47 | 05:37:50 |
| 2027 | 3 | 24 | Saturn (शनि) | Setting (अस्त; direction not specified in supplied transcription) | 18:21 | 18:11:50 |

**Transcription note:** Original list places the 2027 January/February Mercury entries before the 2026 July/August Jupiter entries; this ledger sorts records by body/date for easier comparison while retaining every supplied date and time. The supplied text does not specify eastern/western direction for Jupiter and Saturn; do not infer it without checking the printed page.

## Priority comparison targets

1. **Venus:** eastern setting 12 Oct 2026 17:40; western rising 29 Oct 2026 06:26.
2. **Jupiter:** setting 15 Jul 2026 19:09; rising 10 Aug 2026 05:40.
3. **Mercury:** use the complete repeated cycle to check whether the time convention and event-direction labels have been interpreted consistently.
4. **Mars and Saturn:** additional cross-checks, not yet enough to determine the general method on their own.

## Comparison protocol

For each matching event, record:
- Ganesh Martand printed date/time and exact printed label;
- source issue/year and source image/page;
- Drik Panchang result, with location and event convention;
- TKS result, with the exact mode/configuration and capture provenance;
- independent Sūrya-siddhānta Chapter IX reconstruction;
- apparent elongation/modern threshold result;
- Swiss/heliacal visibility result, separately labelled;
- difference in date and clock time, without silently converting one event definition into another.

A matching date/time is useful corroboration for that specific event and setup, not proof that every source's method is identical. A mismatch triggers investigation; it is not a reason to overwrite the traditional record. No production code changes are authorized by this ledger.


## Standard Difference correction log (2026-10-15)

- Working rule: corrected target-local time = printed standard time − `00:09:10`.
- The original printed values remain authoritative transcription; corrected values are derived values for the target coordinates, not new source facts.
- A time such as `27:25` in a Panchang table, if present, must first be interpreted under that table's `24+`/Panchang-day convention; subtract the correction while preserving the date-label convention, then normalize to civil time only in a separate field.
- The source image `data/standard difference.jpg` should be visually checked when available to confirm whether `29.35` / `80.13` are indeed degree-minute notation and to capture the printed wording/sign rule.
