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


## Official National Panchang cross-check — 15 October 2026

**Source:** India Meteorological Department / Positional Astronomy Centre, Rashtriya Panchanga, “Heliacal Rising and setting of planets (For the Central Station of India)”: https://packolkata.imd.gov.in/panchang/en/helical

The published table gives Venus setting in the west on **13 October 2026 at 24:18 IST** (normalize to 14 October 00:18 IST if interpreted as civil clock time) and Venus rising in the east on **28 October 2026 at 07:36 IST**. This is an official Indian astronomical almanac reference, and it is important evidence against treating TKS's 1 November display as a settled date. However, it is explicitly a heliacal rise/set table for the Central Station of India, not a direct statement that it implements the same Chapter IX K>C Shāstrīya verdict as TKS. Preserve the source's notation and event definition; do not silently reinterpret the 24:18 entry.

## Cross-source audit policy and provisional synthesis

This audit will include, at minimum:
1. **Official almanac/reference:** Rashtriya Panchanga (IMD/Positional Astronomy Centre), including its stated station and event type.
2. **Established online Panchāṅga:** Drik Panchang, with exact city, timezone, date/time, and its explicit note that modern algorithms are used.
3. **Other published Indian Panchāṅga/Jyotiṣa calendars:** only as secondary evidence, tagged as potentially derivative/repeating a shared calendar source.
4. **TKS:** retain separate captures, page mode, date, location, threshold/K/C values, and UI state; do not merge the 900-day and separate Panchāṅga snapshots.
5. **Independent calculation:** once source-faithful Chapter IX event reconstruction is ready, compare exact instants and event boundaries, rather than merely voting among printed dates.

### Current Venus finding
- TKS 900-day table: next Shāstrīya Udaya **1 Nov 2026**.
- IMD Rashtriya Panchanga heliacal table: Venus rises in the east **28 Oct 2026, 07:36 IST**, for the Central Station of India.
- Drik Panchang, Deoranian: Asta ends **29 Oct 2026, 05:51**; its page states that the dates use modern algorithms.
- Multiple secondary calendars place Udaya around 28–29 October, but they are not all independent calculation engines.

**Provisional practical conclusion:** the online published-date majority and the official IMD heliacal table cluster around **28–29 October 2026**, not 1 November. This is a strong investigation priority and a practical reference cluster, but **not yet a certified Shāstrīya Chapter IX date**. Do not simply replace the classical output with 28/29 October until the event definitions and classical reconstruction are checked. If the user-facing product needs a value before that research gate is cleared, label the method and confidence explicitly rather than presenting the date as certain.

### Data model required for the final audit
Each source/event record should carry: planet; event (Asta-start/Udaya/end); source name and URL; retrieval date; source category (official/online Panchāṅga/secondary/TKS/independent calculation); event method (classical threshold/modern computed combustion/heliacal visibility/unclear); displayed local date/time exactly as printed; normalized local civil timestamp where unambiguous; location/station and elevation if supplied; timezone; stated angular criterion; motion direction if relevant; screenshot/capture reference; confidence and caveats.

### Guardrails
- “Maximum agreement” means maximum agreement among **comparable methods**, not a raw majority of all web pages.
- Do not count multiple articles repeating one calendar as multiple independent votes.
- Keep civil midnight, 24+ hour notation, sunrise-based Panchāṅga day, and exact crossing instant separate.
- Do not modify production `app.js` or `extra-panchang.js`; PR #22 remains research-only and Draft.


## Expanded Jupiter location-sensitivity audit — 15 October 2026

Additional Drik Panchang 2027 Jupiter Asta pages were checked for multiple Indian locations. They do **not** all show the same local boundary:

| Drik location | Asta starts (local time) | Asta ends (local time) | Source |
|---|---|---|---|
| Kulgam, Jammu & Kashmir | 15 Aug 2027, 19:53 | 13 Sep 2027, 05:26 | https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=5835 |
| Gaya, Bihar | 18 Aug 2027, 18:54 | 13 Sep 2027, 04:54 | https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?lang=hi&year=9096 |
| Khapa, Maharashtra | 18 Aug 2027, 19:15 | 13 Sep 2027, 05:20 (24+ notation: source displays 12 Sep 29:20+) | https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?lang=hi&year=2027 |
| Bhatkal, Karnataka | 19 Aug 2027, 19:23 | 13 Sep 2027, 05:43 (source displays 12 Sep 29:43+) | https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2084 |
| New Delhi, NCR | 17 Aug 2027, 19:32 | 13 Sep 2027, 05:22 | https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=2794 |

This wide start-date spread within one publisher is a warning not to take a single city's page as a universal geocentric angular-threshold date. It may reflect location-specific event/visibility conventions, differing stored city settings, or a page/configuration issue; the cause is not established here. End dates converge on **13 September 2027** once 24+ hour notation is normalized. TKS's 20 August Asta start is near the later part of the Drik spread, while its 13 September Udaya date agrees at civil-date level with the normalized Drik end boundary. This remains a cross-source date comparison, not validation of a shared method.

A further relevant calendar reference is Vedic Studies' 13 September 2027 India Panchāṅga page, which says it is based on the printed Sri Uttaradi Matha Surya Siddhanta Panchāṅga (Kannada edition, 2026–27): https://vedicstudies.org/panchanga/2027-09-13. This verifies provenance for the daily Panchāṅga date, **not** the Guru Udaya/Asta boundary itself; do not count it as evidence for the planet event until the underlying printed almanac entry is inspected.

### Updated interim decision rule
For the present data, report:
- **Venus:** published modern/heliacal sources cluster around 28–29 Oct 2026; TKS Shāstrīya 1 Nov is an unresolved outlier. The 12 Oct Asta-start civil date is broadly shared, although exact instants differ.
- **Jupiter:** the ending/Udaya civil date clusters on 13 Sep 2027 after normalization; Asta-start times vary substantially across Drik locations and need a same-location, same-event-definition comparison before any “majority date” is selected.
- **Production:** no dates should be hard-coded from this tally. The final site record must identify the chosen method and preserve an alternate/reference date when the classical and modern/heliacal methods differ.
