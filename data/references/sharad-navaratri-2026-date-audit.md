# Śāradīya Navarātri 2026 — date-label audit (draft)

**Date reviewed:** 2026-10-15  
**Branch:** `data/festival-json-foundation`  
**Status:** Draft data updated; final local rule verification remains open.

## Why this is first priority

The migrated legacy data contains a clear title/date conflict and a convention-sensitive Ashtami/Navami mapping during the current festival period. We should resolve the applicable local observance before editing these records.

## Current draft entries

| ID | Current title | Stored date | Audit note |
|---|---|---:|---|
| festival-003 | शारदीय नवरात्र प्रारम्भ | 2026-10-11 | Start date agrees with several 2026 calendar references; legacy description still contains old muhurta values and must not be reused as 2026 timing. |
| festival-007 | शारदीय नवरात्र पंचमी - स्कन्दमाता | 2026-10-15 | Matches the current date label in the reviewed Delhi calendar reference. |
| festival-009 | एवं १८ अक्टूबर को = शारदीय नवरात्र सप्तमी - कालरात्रि | 2026-10-17 | Title itself mentions 18 October while stored date is 17 October. Description also discusses both 17 and 18 October; the record must be clarified rather than blindly shifted. |
| festival-010 | शारदीय नवरात्र महाष्टमी - महागौरी | 2026-10-19 | One reviewed calendar assigns Ashtami to 19 October; another assigns Ashtami to 18 October. |
| festival-011 | शारदीय नवरात्र महानवमी - सिद्धिदात्री | 2026-10-19 | Shares a date with festival-010; this may reflect tithi/observance overlap, but the rule and the intended vrat observance need explicit documentation. |
| festival-012 | दशहरा / विजयादशमी | 2026-10-20 | Reviewed Drik Panchang Delhi page assigns Vijayadashami to 20 October; another calendar reference labels Vijayadashami on 19 October. |

## Comparison evidence reviewed

1. **Drik Panchang — Delhi 2026 Navaratri calendar**  
   https://www.drikpanchang.com/navratri/ashwin-shardiya-navratri-dates.html?geoname-id=1273294&year=2026  
   Lists the start on 11 October, the ninth Navaratri day on 19 October with Ashtami / Durga Ashtami and Maha Navami labels, and Vijayadashami on 20 October. The page notes that timings are local to Delhi and that the Panchang day begins at sunrise.

2. **AstroSage — Sharad Navratri 2026, New Delhi**  
   https://panchang.astrosage.com/festival/navratri/sharad-navratri?language=en  
   Its extracted summary places Ashtami on 18 October and Navami / Vijay Dashmi on 19 October, with Dashami on 20 October. This differs from the Drik page's observance labels.

3. **Times of India — Navratri 2026 start/end report**  
   https://timesofindia.indiatimes.com/religion/festivals/navratri-2026-start-end-date-is-ghatasthapana-on-october-10-or-11-check-the-full-tithi-schedule/articleshow/134767429.cms  
   Reports Ghatasthapana on 11 October and Vijayadashami on 20 October.

These are useful comparison sources, but they do not by themselves settle the shastric decision. Do not average them, and do not silently pick the majority result.

## Required decision process

1. Calculate the local tithi boundaries and sunrise for the selected project location from the pinned Panchang library.
2. Record the exact tithi interval, sunrise-day relation, and the rule used to assign the festival observance.
3. Separate the **tithi's civil-date span** from the **observance date**. They are not necessarily the same.
4. Check the relevant source/observance convention for Ashtami, Navami, Navaratri parana, and Vijayadashami. If two legitimate profiles remain, preserve both as explicitly named variants instead of merging them.
5. Audit the original OurHinduDharm articles linked by festival-009 to festival-012. In particular, the description's references to 17 and 18 October and its legacy Sandhi Puja times must be checked against 2026 calculations.
6. Once the source and calculation agree for the chosen location, update only the draft records and add regression tests. Keep the live Blogger widget unchanged until review.

## Initial disposition

- **Confirmed for continued investigation:** Navaratri starts 11 October in the reviewed references.
- **Needs explicit local calculation and rule review:** festival-009, festival-010, festival-011, festival-012.
- **Not approved:** copying old puja/muhurta clock times from the description into 2026, or marking these entries verified solely because a calendar website displays a date.
- **Next:** finish this compact Navaratri review, then move to Sharad Purnima/Kojagari and the Diwali sequence. Śravaṇa-Dvādaśī research remains separate and must not block this work.


## Draft data update (2026-10-15)

The draft data now uses these candidate observance dates:

- कालरात्रि / सप्तमी — 17 October
- महाष्टमी — 19 October
- महानवमी — 20 October (with 19 October noted as a regional alternative requiring explicit convention)
- विजयादशमी — 20 October
- कोजागरी / शरद पूर्णिमा — 25 October
- धनतेरस — 6 November
- नरक चतुर्दशी and दीपावली — 8 November
- गोवर्धन पूजा — 10 November
- भ्रातृ द्वितीया — 11 November

These are candidate dates cross-checked against the cited public calendars, not a substitute for local tithi calculation. The data records remain `needs-review`; the old source descriptions are retained for audit, while known stale clock times have been removed from the draft display descriptions. A new regression test file checks the candidate dates, retained source text, and verification status.


## User clarification and widget display-range audit (2026-10-15)

The user clarified that the legacy title's **18 October** note for festival-009 is intentional: Ashwin Shukla Saptami is described in the user's paper Panchang/references as spanning the civil dates 17–18 October. Do not remove that note as a typo. The displayed title has been restored to preserve it. The current record stores a provisional civil-date span through 18 October, but **does not yet store exact tithi start/end instants**; the 17 October observance date remains a candidate pending local calculation and the selected observance rule.

The widget audit also found that the legacy parent-period end date (20 October) had been copied to each individual Navaratri-day record. The draft now retains 11–20 October only on the parent Navaratri record, clears inherited display ends for individual daily records, and gives festival-009 its separate provisional 17–18 October civil-date span. This is a display/data-model correction, not certification of the observance dates.
