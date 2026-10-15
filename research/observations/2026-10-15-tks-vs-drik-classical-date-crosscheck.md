# TKS Shāstrīya Asta/Udaya vs Drik Panchang cross-check — 15 October 2026

**Purpose:** Check whether the dates shown in TKS's Shāstrīya Sūrya-siddhānta Chapter 9 layer are also reflected in another Panchāṅga, and preserve a reproducible comparison dataset.

**Status:** First-pass date-level cross-check. This is not a formula validation and does not certify our implementation.

## Source records

### TKS — user-supplied capture

From the preserved 12 October 2026 TKS Udaya-Asta page capture (900-day table; Pithoragarh label, 29.5830° N, 80.2090° E, UTC+05:30; page did not expose elevation control):

| Planet | TKS Shāstrīya event | TKS date/time or date shown | Provenance |
|---|---|---|---|
| Venus | Current state Asta; K=7.698°, C=8° | Asta shown as beginning 12 Oct 2026 10:20:24; next Udaya 1 Nov 2026 | User-supplied capture, preserved in `2026-10-13-tks-udaya-asta-page-capture.md` |
| Venus | Following event | Asta 13 Jul 2027 | Same TKS 900-day capture |
| Jupiter | Following event | Asta 20 Aug 2027; Udaya 13 Sep 2027 | Same TKS 900-day capture |
| Jupiter | Separate Panchāṅga snapshot | Asta 20 Aug 2027 00:48:11; Udaya 12 Sep 2027 23:14:23 | Distinct TKS Panchāṅga page capture; do not silently merge with the 900-day table |

TKS labels the Shāstrīya verdict as the Chapter 9 K>C layer and separates it from modern elongation-orb/heliacal visibility calculations. The two TKS snapshots themselves have slightly different displayed end timestamps; this must remain explicit in comparisons.

### Drik Panchang — published location-specific dates

1. **Venus, Deoranian, Uttar Pradesh:** https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2026  
   The page reports Venus Tara Asta starts **12 Oct 2026, 18:10** and ends **29 Oct 2026, 05:51** local time. It explicitly says the dates are calculated with modern algorithms and describes the Sūrya-siddhānta approximate angular criteria as 10° in direct motion and 8° in retrograde motion.

2. **Jupiter, Bhatkal, Karnataka:** https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2084  
   The page reports Jupiter Tara Asta starts **19 Aug 2027, 19:23** and ends **12 Sep 2027, 29:43+**. Drik's 24+ hour notation means 29:43 on 12 September is 05:43 on **13 Sep 2027**. The page states that the Sūrya-siddhānta approximate Jupiter Lope limit is 11°, while its published dates use modern algorithms and observer location.

## Date-level comparison

| Planet/event | TKS Shāstrīya | Drik Panchang | First-pass result |
|---|---|---|---|
| Venus Asta begins | 12 Oct 2026 | 12 Oct 2026 | Same civil date; timestamps and event algorithms differ |
| Venus Udaya / Asta ends | Udaya 1 Nov 2026 | Asta ends 29 Oct 2026 05:51 | Not an exact match: approximately 2–3 calendar days depending on TKS event timestamp/date convention |
| Jupiter Asta begins | 20 Aug 2027 | 19 Aug 2027 19:23 | About one civil day apart |
| Jupiter Udaya / Asta ends | Udaya 13 Sep 2027 (one TKS capture shows 12 Sep 23:14:23) | Ends 12 Sep 29:43+ = 13 Sep 05:43 | Same civil date after normalizing Drik's 24+ hour notation; exact time still needs same-instant verification |

## Interpretation

- **Preliminary answer: the broad event windows are partly corroborated by Drik Panchang, but not all dates match exactly.** Venus's Asta-start civil date matches in the supplied TKS/Drik records; Venus's ending/Udaya date differs by roughly 2–3 days. Jupiter's start differs by about one day, while the end falls on 13 September after correctly normalizing Drik's 24+ notation.
- This is a useful independent **published-date comparison**, not proof that the two sites implement the same algorithm. Drik explicitly says its displayed event times use modern algorithms; TKS presents a separate Shāstrīya K>C verdict layer and also offers modern visibility models.
- The city/timezone/elevation settings and exact threshold-crossing instants must be normalized before judging sub-day differences. For an angular K comparison, use a single geocentric instant and the same declared coordinate definition; observer location should not be treated as changing geocentric planetary longitudes.
- Do not train or tune the classical formula to these date labels alone. Store them as reference fixtures with source URL, retrieval date, location, event definition, and known limitations. Keep the Drik modern date and TKS Shāstrīya date as separate fields.
- No claim is made here that all Hindu Panchāṅgas agree. This first pass covers one independent published source per planet; more sources should be added only with clear provenance and comparable definitions.

## Research-data policy

Use this note as a source ledger for the next diagnostic. Do not change `app.js` or `extra-panchang.js`, do not merge PR #22, and do not publish a date as certified until the source-faithful Chapter 9 reconstruction and same-instant tests are independently validated.


## Additional published Panchāṅga / Jyotiṣa cross-checks

These are date-level reports, not independent ephemeris-grade measurements; editorial articles may repeat a common almanac/calendar source, so they should not be counted as fully independent astronomical engines.

- **Times Now Navbharat:** reports Venus Asta on 12 October 2026 and Udaya on 29 October 2026: https://www.timesnowhindi.com/spirituality/shukra-asta-2026-12-october-to-29-october-shubh-karya-vivah-griha-pravesh-rules-article-156328193
- **AstroSage Hindi:** identifies Venus Udaya in Libra on 29 October 2026: https://hindi.astrosage.com/gochar/shukra-tula-uday.asp
- **Jyotish Sansar:** reports 12 October 2026 18:19 to 29 October 2026 06:00: https://www.jyotishsansar.com/
- **NakshtraTak:** its 2026 Muhurat calendar treats 12–28 October as Venus Asta and 29–31 October as post-rise infancy (bālyatva): https://nakshtratak.com/muhurat/vivah/2026

### Stronger practical date consensus for Venus

Across these published Indian Jyotiṣa calendars, Venus Asta begins on **12 October 2026** and the return-to-Udaya boundary is generally placed on **29 October 2026** (some secondary sources describe it as 30 October, likely because of time/observance conventions). The supplied TKS Shāstrīya table's **1 November 2026** next-Udaya date is therefore a notable outlier by roughly 2–3 days. That is the key date discrepancy to investigate next, not a reason to force our formula to 29 October.

Possible causes to test separately:
1. TKS's Chapter IX event-selection or threshold-crossing implementation;
2. the displayed date versus the exact crossing instant and local civil/Pañcāṅga-day convention;
3. a difference between TKS's K/C verdict and the modern/observational date used by other calendars;
4. a stale or different TKS page state/configuration.

For Jupiter, the current source set only supports a broad alignment of the end boundary around 13 September 2027 and a start around 19–20 August. Add more sources before calling this a consensus. Do not infer that the other sites use the TKS Shāstrīya method.
