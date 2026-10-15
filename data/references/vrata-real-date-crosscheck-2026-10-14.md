# Real-date Panchang cross-check — Śravaṇa-Dvādaśī candidates (2026)

**Date checked:** 2026-10-14  
**Branch:** `data/festival-json-foundation`  
**Status:** Research note only. These observations are not a certified test fixture and must not be used to change festival dates or runtime behaviour.

## Purpose

The interval helper needs at least two real-date comparisons against a named independent Panchang. Before converting a date into a pass/fail fixture, all compared times must refer to the same place, timezone, tithi/nakshatra convention, and event definition. This initial web review deliberately records discrepancies instead of selecting a preferred result prematurely.

## Candidate A — Śrāvaṇa Śukla Ekādaśī / Dvādaśī, 23–25 August 2026

- Drik Panchang's Pithoragarh Tamil Panchang page for 23 August reports sunrise 05:41, sunset 18:42, Ekādaśī until 04:18 on 24 August, and Mūla nakṣatra until 17:44 on 23 August. It labels the observance Śrāvaṇa Putradā Ekādaśī.
- Drik Panchang's Dvādaśī listing for Sojitra reports Śrāvaṇa Śukla Dvādaśī from 04:18 on 24 August to 06:20 on 25 August, and lists Vaṅjulī Mahādvādaśī / Dāmodara Dvādaśī.
- These two records agree on the 04:18 boundary but are for different places and pages; the Sojitra event is **not** a Pithoragarh fixture. The available Pithoragarh extract does not yet provide the complete Dvādaśī and Śravaṇa-nakṣatra intervals required for the vrata/parāṇa test.

Sources:
- https://www.drikpanchang.com/tamil/tamil-month-panchangam.html?date=23%2F08%2F2026&time-format=24hour
- https://www.drikpanchang.com/dwadashi/dwadashi-dates.html?time-format=24hour&year=2026

**Disposition:** Candidate only; do not assert that a Śravaṇa-Dvādaśī decision or parāṇa result has been validated.

## Candidate B — Bhādrapada Śukla Ekādaśī / Dvādaśī, 22–23 September 2026

This is a useful candidate because Dharmasindhu's Bhādrapada-specific Śravaṇa-Dvādaśī / Viṣṇu-śṛṅkhala discussion is relevant, but the available public calendar extracts do not agree closely enough to make a single exact-time fixture.

Observed reports:
- Hindu Blog gives Ekādaśī until 19:48 on 22 September, Dvādaśī until 21:13 on 23 September, and Śravaṇa nakṣatra until 08:47 on 23 September for its stated broad India region.
- Nitya Deepam gives Ekādaśī until 21:45 on 22 September and Śravaṇa nakṣatra until 07:07 on 22 September. Its displayed sunrise is 06:15, so this is not the same nakṣatra transition as the Hindu Blog report.
- Moneycontrol's local-New-Delhi summary gives Dvādaśī beginning at 21:43 on 22 September and ending at 22:50 on 23 September; Śravaṇa is shown from 07:06 on 22 September to 09:09 on 23 September.
- Apna Panchang's Pithoragarh page for 23 September labels the tithi Śukla Dvādaśī until 17:20, but lists Dhanishṭhā until 05:04. This materially differs from the other displayed nakṣatra timings and requires independent verification before use.

Sources:
- https://www.hindu-blog.com/2026/09/september-22-2026-tithi-panchang-hindu.html
- https://www.nityadeepam.com/en/panchangam/2026-09-22/
- https://www.moneycontrol.com/lifestyle/kalki-dwadashi-2026-on-september-22-puja-timings-vrat-vidhi-and-religious-significance-article-14035166.html
- https://apnapanchang.in/en/panchang/pithoragarh/2026-09-23

**Disposition:** Discrepancy found; not a pass/fail fixture. Do not average or silently choose these times. Obtain a reproducible calculation for Pithoragarh from the project's pinned astronomical library and compare it with the exact named almanac/edition intended for reference.

## Shāstric scope reminder

Dharmasindhu's parāṇa decision says the principal view is to perform parāṇa after both Dvādaśī and Śravaṇa end, with a secondary view allowing the end of one of them. The same passage restricts avoidance of the middle 20 ghaṭikās to the Bhādrapada Śravaṇa-Dvādaśī observance; it must not be generalized to all monthly Śravaṇa-Dvādaśīs.

Source: https://www.transliteral.org/pages/z80503221630/view

The owner's visually reviewed Khemraj edition and the existing collation/cross-check reports remain the primary source-audit track. The web calendars are comparison references, not authorities for resolving textual disagreements.

## Next required steps

1. Recalculate exact tithi and nakṣatra boundaries for Pithoragarh with the pinned library and documented settings.
2. Record library version, location coordinates, timezone, ayanāṃśa/settings if relevant, and normalized timestamps.
3. Compare each boundary against one explicitly named almanac for the same place/date; if the almanac differs, preserve both values and investigate.
4. Only after the input dataset is reproducible, turn the case into a real-date regression test.
5. Keep all disputed parāṇa interpretations as separately named profiles; never infer parāṇa from interval overlap alone.

No `app.js`, `data/festivals.json`, legacy dates, or Blogger output was changed.

## Reproducibility detail — pinned library API reviewed on 2026-10-15

The published README for `@ishubhamx/panchangam-js@3.0.0` documents that scalar tithi/nakṣatra fields refer to the element at the civil day's sunrise, while the `tithis` and `nakshatras` arrays contain interval objects with `index`, `name`, `startTime`, and `endTime`. Those arrays cover the current sunrise to the following sunrise, normally one to three intervals. Therefore, a real-date test must **not** treat the scalar fields or only one date's sunrise summary as the full interval record.

Reference documentation:
- https://www.npmjs.com/package/%40ishubhamx/panchangam-js
- https://app.unpkg.com/%40ishubhamx/panchangam-js%403.0.0/files/README.md


### Location decision — keep the vrata audit's chosen point fixed

The repository's `test-astronomy.html` uses a different standard Pithoragarh point (29.5828° N, 80.2182° E, 1650 m) and a separate TKS comparison point (29.5830° N, 80.2090° E, 0 m). These belong to that astronomy validation page and are not interchangeable with this vrata audit's selected point.

For this audit, retain the already documented coordinates **30.1265° N, 80.4817° E, elevation 0 m**, with `timezoneOffset: 330`, as requested. Do not silently copy coordinates from `test-astronomy.html`; location-specific tithi/nakṣatra boundaries and sunrise can shift with the observer. This is a fixed test location for reproducibility, not a claim that the two coordinate sets are identical.

### Required calculation procedure

1. Use the exact pinned import `@ishubhamx/panchangam-js@3.0.0`, observer latitude 30.1265, longitude 80.4817, elevation 0 m, and `timezoneOffset: 330`.
2. Query civil dates spanning at least the day before the first candidate boundary through the day after the last boundary. Collect `tithis` and `nakshatras` entries from each query and deduplicate by exact start/end timestamps; this guards against sunrise-window truncation at the edges.
3. Serialize each boundary as an ISO UTC timestamp and an IST display time (UTC+05:30), preserving the raw ISO values for exact comparisons. Record the query date and the library version.
4. Compare only with a named independent almanac for the same place/date and equivalent convention. Do not mix city-specific times or turn a discrepancy into a passing fixture without explanation.
5. Once independently checked, add a separate real-date test fixture. Keep the existing interval mathematics tests labelled as helper-contract tests; they do not validate astronomical calculations, tithi/nakṣatra selection, or shastric vrata decisions.

### Current execution status

The API contract is now documented, but this research session has not executed the pinned library in a Node/browser runtime and has not obtained a complete same-place independent interval set. The candidate dates therefore remain **research-only**, not pass/fail fixtures. The network-restricted local shell could not retrieve the npm package, and no successful GitHub Actions run is available in the current record. No runtime files or festival dates were changed.



### Strict coordinate-matching rule — clarified 2026-10-15

The user's validation requirement is correct: a comparison source is suitable for an exact-time pass/fail fixture only when its calculation uses the **same observer coordinates** as the project calculation (latitude, longitude, and elevation where supported), the same timezone, and compatible calculation conventions. Matching only the city name, state, or country is not sufficient evidence of coordinate equality.

For every external comparison, record the source's actual location settings and coordinates when available. If a site accepts custom coordinates, enter the project's exact point (30.1265° N, 80.4817° E, elevation 0 m). If it only provides a preset city or its underlying coordinates cannot be established, label the result as contextual evidence only—not an exact-time validation fixture. Do not treat a nearby town, a generic India time, or another Pithoragarh coordinate set as equivalent. If exact coordinate matching is unavailable, use the project's reproducible pinned-library output for the chosen point and seek a source that permits a like-for-like comparison; retain the mismatch explicitly rather than relaxing the rule.

This rule applies to both previously listed candidates. Their existing public-source timings remain observations only until coordinate/location equivalence and convention equivalence are documented. No dates should be marked as passing based solely on the current mixed-location comparison.


### External calculators that expose custom coordinates — reviewed 2026-10-15

Two candidate sources expose manual latitude/longitude and timezone controls, and their published pages describe interval/range output:

1. **Astroica Tithi calculator** — https://www.astroica.com/vedic-astrology/tithi-calculator.php. Its page advertises a date range, manual coordinates, timezone and ayanāṃśa options, and lists tithi start/end times. It is a candidate for the tithi interval side only; the exact selected settings and output for this audit have not yet been submitted or captured.
2. **Astroica Nakshatra calculator** — https://www.astroica.com/vedic-astrology/nakshatra-calculator.php. Its page advertises date-range calculation, manual coordinates, timezone and ayanāṃśa options, and lists nakṣatra start/end times. It is a candidate for the nakṣatra interval side only; the exact selected settings and output for this audit have not yet been submitted or captured.

The pages currently show example output for Ujjain, so those displayed times are **not** evidence for the selected audit coordinates. Before treating either result as an independent comparison, enter latitude 30.1265° N, longitude 80.4817° E, timezone Asia/Kolkata / UTC+05:30, and record the ayanāṃśa selected by the source. Then compare the source's selected ayanāṃśa and calculation conventions with the project's pinned library. If the source does not expose a compatible setting or does not return the required intervals, mark that dimension unverified rather than calling it a match.

Web documentation reviewed:
- Tithi custom-location and range controls: https://www.astroica.com/vedic-astrology/tithi-calculator.php
- Nakṣatra custom-location and range controls: https://www.astroica.com/vedic-astrology/nakshatra-calculator.php
- Alternative daily Panchang forms also expose latitude/longitude fields, but a daily snapshot is not sufficient by itself to validate exact transition intervals: https://www.onlinejyotish.com/ojmob/panchanga.php and https://www.astrobookonline.com/panchang/today-panchang

**Status:** Candidate calculators identified; exact-coordinate results not yet run/captured, so no real-date fixture is certified by this addition.


### Next-step execution protocol — 2026-10-15

The next comparison run must capture the external calculator's actual submitted result, not its default example. The public Astroica pages expose custom coordinate inputs but the currently indexed/default results are for Ujjain; those default values must never be copied into this audit.

**Enter these inputs in BOTH calculators:**
- Location mode: Advanced options / Custom Location / enter coordinates manually.
- Latitude: 30 degrees, 7 minutes, 35.4 seconds North (decimal 30.1265° N).
- Longitude: 80 degrees, 28 minutes, 54.1 seconds East (decimal 80.4817° E).
- Time zone: Asia/Kolkata, UTC+05:30.
- Elevation: 0 m where an elevation field is offered; if the calculator does not accept elevation, record that limitation.
- Ayanāṃśa: record the exact selected label. Do not assume it matches the project's setting just because the place and timezone match.
- Date range: 2026-08-22 through 2026-08-26, then 2026-09-21 through 2026-09-24. Keep the two windows separate for clear evidence.

**Evidence to record for each result:** calculator URL; selected coordinates and timezone shown in output; ayanāṃśa/convention; each tithi/nakṣatra name and its displayed start/end time; screenshot or saved text; capture date. Normalize displayed IST times to ISO UTC only after retaining the original display strings.

**Important limitation:** this session identified the forms and their fields through published page content but did not submit the interactive forms or capture custom-coordinate results. It also has no successful GitHub Actions run to inspect yet. Therefore this protocol is ready, but the external comparison and actual library diagnostic remain unexecuted; do not claim a match or create a passing real-date fixture yet. If the form cannot be submitted through the available environment, the next required input is a result capture from the same-coordinate calculator—not a new book or dataset from the user.


## Astroica manual-location results supplied on 2026-10-15

The user copied the following displayed results from Astroica's Tithi and Nakshatra calculators. These are transcribed as supplied; original IST display strings are retained. The calculator output reports **30.2° N, 80.8° E**, timezone **Asia/Kolkata**, and “Manual location”. The input UI allows only two decimal places.

### Coordinate precision note

The project's chosen audit observer is 30.1265° N, 80.4817° E, elevation 0 m, timezone offset +330 minutes. Astroica's rounded point (30.2, 80.8) is roughly 32 km from that observer, so this is **not an exact coordinate match**. For geocentric tithi/nakshatra transitions, geographic coordinates ordinarily affect the local time-zone conversion rather than the celestial longitude crossing itself; nevertheless, keep the reported coordinates as provenance and do not label this an exact same-coordinate validation. Elevation and selected ayanāṃśa/convention were not reported in the copied output.

### Astroica Tithi — 22–26 August 2026

| Tithi | Start (IST) | End (IST) |
|---|---|---|
| Shukla Dashami | Fri, 21 Aug 2026, 11:36 PM | Sun, 23 Aug 2026, 02:00 AM |
| Shukla Ekadashi | Sun, 23 Aug 2026, 02:00 AM | Mon, 24 Aug 2026, 04:19 AM |
| Shukla Dwadashi | Mon, 24 Aug 2026, 04:19 AM | Tue, 25 Aug 2026, 06:21 AM |
| Shukla Trayodashi | Tue, 25 Aug 2026, 06:21 AM | Wed, 26 Aug 2026, 07:59 AM |

Reported location: 30.2, 80.8; timezone: Asia/Kolkata.

### Astroica Tithi — 21–24 September 2026

| Tithi | Start (IST) | End (IST) |
|---|---|---|
| Shukla Dashami | Sun, 20 Sep 2026, 05:52 PM | Mon, 21 Sep 2026, 08:01 PM |
| Shukla Ekadashi | Mon, 21 Sep 2026, 08:01 PM | Tue, 22 Sep 2026, 09:43 PM |
| Shukla Dwadashi | Tue, 22 Sep 2026, 09:43 PM | Wed, 23 Sep 2026, 10:51 PM |
| Shukla Trayodashi | Wed, 23 Sep 2026, 10:51 PM | Thu, 24 Sep 2026, 11:18 PM |

Reported location: 30.2, 80.8; timezone: Asia/Kolkata.

### Astroica Nakshatra — 22–26 August 2026

| Nakshatra | Start (IST) | End (IST) |
|---|---|---|
| Jyeshta | Fri, 21 Aug 2026, 11:52 AM | Sat, 22 Aug 2026, 02:49 PM |
| Moola | Sat, 22 Aug 2026, 02:49 PM | Sun, 23 Aug 2026, 05:44 PM |
| Purva Ashadha | Sun, 23 Aug 2026, 05:44 PM | Mon, 24 Aug 2026, 08:28 PM |
| Uttara Ashadha | Mon, 24 Aug 2026, 08:28 PM | Tue, 25 Aug 2026, 10:51 PM |
| Shravana | Tue, 25 Aug 2026, 10:51 PM | Thu, 27 Aug 2026, 12:47 AM |

Reported location: 30.2, 80.8; timezone: Asia/Kolkata.

### Astroica Nakshatra — 21–24 September 2026

| Nakshatra | Start (IST) | End (IST) |
|---|---|---|
| Purva Ashadha | Sun, 20 Sep 2026, 01:42 AM | Mon, 21 Sep 2026, 04:34 AM |
| Uttara Ashadha | Mon, 21 Sep 2026, 04:34 AM | Tue, 22 Sep 2026, 07:06 AM |
| Shravana | Tue, 22 Sep 2026, 07:06 AM | Wed, 23 Sep 2026, 09:09 AM |
| Dhanishta | Wed, 23 Sep 2026, 09:09 AM | Thu, 24 Sep 2026, 10:35 AM |

Reported location: 30.2, 80.8; timezone: Asia/Kolkata.

### How this evidence may be used

- Treat these values as an external reference transcription, not a project test pass.
- The September sequence is useful for examining the Ekadashi/Dwadashi decision: the copied Astroica result places Ekadashi end at 21:43 IST on 22 September, Dwadashi end at 22:51 IST on 23 September, and Shravana end at 09:09 IST on 23 September.
- Preserve the exact displayed minutes. The values are rounded to minutes by the source, so any comparison must use an explicit tolerance and must not silently claim second-level agreement.
- Next, run the pinned project library diagnostic and compare its returned transitions to these intervals. Record discrepancies before deciding whether they arise from source conventions, time rounding, or implementation. Do not change production code or create a correctness fixture from this source alone.


## Independent public-source comparison added on 2026-10-15

### September 2026: Astroica cross-checked against Prokerala and Drik Panchang

- **Prokerala, 22 September 2026 (Ujjain; page identifies Lahiri ayanāṃśa):** Ekadashi 21 Sep 20:01–22 Sep 21:43 IST; Dwadashi 22 Sep 21:43–23 Sep 22:50 IST; Uttara Ashadha ends 22 Sep 07:06; Shravana runs 22 Sep 07:06–23 Sep 09:09. This matches the user's Astroica transcription except Astroica reports Dwadashi end at 22:51, a one-minute difference likely attributable to displayed rounding or calculation details. Source: https://www.prokerala.com/astrology/panchang/2026-september-22.html
- **Drik Panchang, 23 September 2026:** a result for Anta, Rajasthan reports Dwadashi until 22:50 and Shravana until 09:09 IST. Source: https://www.drikpanchang.com/panchang/day-panchang.html?date=23%2F09%2F2026&time-format=12hour
- **Drik Panchang, 22 September 2026 (Gurgaon):** Ekadashi until 21:43 and Uttara Ashadha until 07:06. Source: https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=1270642
- **Hindu Blog** gives materially different values (Ekadashi until 19:48, Dwadashi until 21:13 next day, Shravana until 08:47). Source: https://www.hindu-blog.com/2026/09/september-22-2026-tithi-panchang-hindu.html This disagreement is now recorded as a source discrepancy; do not average the times or pick a winner without checking calculation conventions.

### August 2026: independent Ekadashi confirmation

- **Prokerala Ekadashi calendar** reports Shukla Paksha Ekadashi (Sravana Putrada Ekadashi) from 23 August 2026 02:00 to 24 August 2026 04:19 IST, matching the user's Astroica interval to the displayed minute. Source: https://www.prokerala.com/astrology/tithi/ekadashi-2026.html
- Prokerala's August calendar also places Moola on 23 August and the transition to Purva Ashadha later that day, broadly consistent with the supplied Astroica sequence; use the exact intervals in the user's transcription for minute-level comparisons.

### Interim finding and limits

The independent sources strongly corroborate the Astroica September Ekadashi start/end, Uttara Ashadha end, and Shravana end; the Dwadashi end differs by one displayed minute (22:50 vs 22:51). The August Ekadashi interval also matches Prokerala exactly at minute precision. These are external cross-checks, not yet a comparison against the pinned @ishubhamx/panchangam-js@3.0.0 diagnostic: GitHub Actions currently returned no workflow runs for the latest workflow commit, so no generated JSON output is available to inspect. Keep the diagnostic-only status and do not make production changes based solely on these references.


## Mumbai city cross-check — 2026-10-15

The user suggested using a major city because public Panchang data is easier to find. Mumbai results are now collected from several city-specific pages. These are useful independent references, but Mumbai's coordinates differ from the audit's chosen manual coordinates (30.2, 80.8), so they are a separate location cross-check rather than an exact-location fixture.

### 22 September 2026 — Mumbai

| Transition | Astroica manual location (30.2, 80.8) | Mumbai public pages |
|---|---:|---|
| Ekadashi ends | 21:43 IST | 21:43 on VedPanchang, VedicSpace, DevPanchang and LordShiva; 21:44 on Daily Astro / AstroLeaf |
| Uttara Ashadha ends | 07:06 IST | 07:06 on VedPanchang / LordShiva; 07:07–07:08 on several other pages |
| Shravana ends | 09:09 IST | 09:08 on Panchang Calendar / LordShiva; 09:09 on Daily Astro |
| Dwadashi ends | 23 Sep 22:51 IST | 23 Sep 22:50 on LordShiva; 22:51 on Daily Astro / AstroLeaf |

Sources:
- Daily Astro, Mumbai: https://daily-astro.com/panchang/mumbai-mh-in/2026-sep-22
- VedPanchang, Mumbai: https://vedpanchang.com/hi/panchang/mumbai/2026-09-22
- AstroLeaf, Mumbai: https://astroleaf.in/panchang/mumbai-maharashtra-india/2026-09-22/
- VedicSpace, Mumbai: https://vedicspace.com/panchang/mumbai/2026-09-22/
- Dev Panchang, Mumbai: https://devpanchang.in/en/panchang/mumbai/2026-09-22
- Panchang Calendar, Mumbai: https://panchangcalendar.com/panchang/mumbai/2026/09/22/
- LordShiva, Mumbai: https://www.lordshiva.co.in/panchang/2026-09-22/mumbai

### 23 August 2026 — Mumbai

Panchang Calendar's Mumbai page reports Ekadashi until 04:19 on 24 August, Dwadashi until 06:21 on 25 August, Moola until 17:43 on 23 August, and Purva Ashadha until 20:27 on 24 August. These align with the Astroica transcription to within one minute for the two nakshatra transitions (Astroica: 17:44 and 20:28) and exactly to the displayed minute for the tithi transitions.
Source: https://panchangcalendar.com/hi/panchang/mumbai/2026/08/23/

### Interim assessment

- Multiple Mumbai pages corroborate the September Ekadashi end at 21:43/21:44 and the Shravana end at 09:08/09:09. This is a consistent one-minute display spread, not evidence of a large astronomical error.
- The supplied Astroica manual location's Dwadashi end at 22:51 is supported by some Mumbai pages; other pages show 22:50.
- Minute-level differences should be retained as source-reported values, not averaged. For a strict fixture, compare calculations using the same exact coordinates, timezone, ayanamsa and calculation convention.
- These public city pages do not yet replace running the pinned project library diagnostic. No production code change or correctness assertion is justified from these pages alone.


## Validation order clarified — 2026-10-15

User-approved order: validate the project's tithi/nakshatra calculations against published Panchang data for major cities first, then repeat the process for the user's own city/location. Do not mix the two stages into one fixture.

### Stage 1: Major-city reference set
Start with Mumbai because several city-specific sources are available. Add at least one other major city (Delhi) using source pages that explicitly identify the city. For each date/transition record:
- city and source URL;
- displayed time and timezone;
- source-reported tithi/nakshatra;
- ayanamsa or calculation convention when stated;
- whether coordinates are explicit or only a named city;
- observed spread across sources.

Use the August 2026 Ekadashi/Dwadashi intervals and September 2026 Ekadashi/Dwadashi/Shravana intervals already transcribed in this report. Keep one-minute source differences as reported; don't average them.

### Stage 2: User's own city/location
Only after Stage 1, repeat the same comparison for Pithoragarh / the project's chosen observer coordinates. Keep the existing audit coordinates (30.1265 N, 80.4817 E, elevation 0 m, Asia/Kolkata) separate from the mini-widget/test-astronomy coordinates (29.5828 N, 80.2182 E, elevation 1650 m).

### Safety against false conclusions
Major-city web calendars often display city names without exposing exact coordinates or calculation conventions. Such results are independent contextual checks, not exact-coordinate astronomy fixtures. A source can be promoted to a correctness fixture only when its relevant inputs and conventions are adequately matched and the pinned library's actual output has been captured. No production code changes based on source-to-source comparison alone.


### Delhi cross-check added — 2026-10-15

The validation sequence is explicitly major cities first, then Pithoragarh.

For 22 September 2026, city-specific Delhi pages report:
- **Panchang Calendar, Delhi:** Ekadashi until 21:44; Dwadashi until 22:51 on 23 September; Uttara Ashadha until 07:06; Shravana until 09:08 on 23 September. https://panchangcalendar.com/en/panchang/delhi/2026/09/22/
- **Daily Astro, Delhi:** Ekadashi until 21:44; Dwadashi until 22:51; Uttara Ashadha until 07:07; Shravana until 09:09. https://daily-astro.com/panchang/delhi-dl-in/2026-sep-22
- **Sanatan Bhumi, New Delhi:** Ekadashi until 21:43; Dwadashi until 22:50 on 23 September; Uttara Ashadha until 07:07; Shravana until 09:09. https://www.sanatanbhumi.org/en/panchang/2026-09-22/

Mumbai and Delhi results show the same general pattern, with most public-source differences confined to about one minute for these transitions. This strengthens the city-level cross-check, but because source pages do not all disclose precise coordinates and calculation conventions, it is not yet an exact-coordinate fixture.

Stage 1 city-level source gathering now includes Mumbai and Delhi. Next technical task remains obtaining and capturing the pinned project library's actual output for the same dates. Stage 2 (Pithoragarh) follows only after Stage 1 comparison is complete.


## Pinned-library diagnostic captured — 2026-10-15

GitHub Actions run 38673693621 successfully completed the diagnostic emission and artifact upload for commit `fd8109c20c8972c2b750863514d031f0b91f5820`. The overall workflow is marked failed because the pre-existing compact UI/night Prahar regression step failed; the diagnostic step itself and its upload step both succeeded. Artifact: `vrata-real-date-diagnostic.json` (artifact ID 11945635143).

The pinned `@ishubhamx/panchangam-js@3.0.0` scalar sunrise-element fields provide the following complete transition boundaries (library UTC timestamps converted to IST below). These are compared with the user's Astroica transcription (30.2° N, 80.8° E; Asia/Kolkata); that point is approximate and not identical to the audit point (30.1265° N, 80.4817° E).

### August candidate — scalar transition fields

| Event | Library output (IST) | Astroica transcription (IST) | Difference at displayed-minute precision |
|---|---|---|---|
| Shukla Dashami starts | 21 Aug 23:36:34 | 21 Aug 23:36 | about 34 s |
| Dashami ends / Ekadashi starts | 23 Aug 02:00:43 | 23 Aug 02:00 | about 43 s |
| Ekadashi ends / Dwadashi starts | 24 Aug 04:19:04 | 24 Aug 04:19 | about 4 s |
| Dwadashi ends / Trayodashi starts | 25 Aug 06:21:13 | 25 Aug 06:21 | about 13 s |
| Trayodashi ends | 26 Aug 07:59:29 | 26 Aug 07:59 | about 29 s |

### August nakshatra transitions

| Event | Library output (IST) | Astroica transcription (IST) |
|---|---|---|
| Jyeshtha ends / Moola starts | 22 Aug 14:49:01 | 22 Aug 14:49 |
| Moola ends / Purva Ashadha starts | 23 Aug 17:44:27 | 23 Aug 17:44 |
| Purva Ashadha ends / Uttara Ashadha starts | 24 Aug 20:28:02 | 24 Aug 20:28 |
| Uttara Ashadha ends / Shravana starts | 25 Aug 22:51:05 | 25 Aug 22:51 |
| Shravana ends | 27 Aug 00:47:50 | 27 Aug 00:47 |

### September candidate — scalar transition fields

| Event | Library output (IST) | Astroica transcription (IST) | Public-source context |
|---|---|---|---|
| Dashami ends / Ekadashi starts | 21 Sep 20:01:13 | 21 Sep 20:01 | Prokerala reports 20:01 |
| Ekadashi ends / Dwadashi starts | 22 Sep 21:43:37 | 22 Sep 21:43 | Prokerala/Drik generally 21:43–21:44 |
| Dwadashi ends / Trayodashi starts | 23 Sep 22:50:50 | 23 Sep 22:51 | Prokerala/Drik generally 22:50; Astroica 22:51 |
| Uttara Ashadha ends / Shravana starts | 22 Sep 07:06:36 | 22 Sep 07:06 | Public sources generally 07:06–07:08 |
| Shravana ends / Dhanishtha starts | 23 Sep 09:08:56 | 23 Sep 09:09 | Public sources generally 09:08–09:09 |
| Dhanishtha ends | 24 Sep 10:34:58 | 24 Sep 10:35 | Matches displayed minute |

### Interpretation and limitations

1. The scalar fields reproduce the supplied transition sequence to within the displayed-minute rounding for these selected dates. This is a strong positive cross-check, not a proof of the library's correctness for all dates, all tithis/nakshatras, or every observer.
2. Astroica's custom coordinate UI is limited to two decimal places, and the copied result does not record elevation or selected ayanāṃśa. Therefore, it is not an exact same-coordinate / fully convention-matched fixture. Keep it as contextual comparison evidence.
3. Do not treat the `tithis`/`nakshatras` daily arrays as a single continuous astronomical interval source without inspecting their semantics: the API describes them as sunrise-to-next-sunrise segments and some entries are clipped at sunrise. For the full sunrise element, the diagnostic records the scalar `tithiStartTime`, `tithiEndTime`, `nakshatraStartTime`, and `nakshatraEndTime` fields separately.
4. The diagnostic also emitted Mumbai and Delhi representative-coordinate interval sets. They are useful for city-level checks but the array segmentation means these should not be promoted to exact astronomical transition fixtures without normalizing/deduplicating across adjacent sunrise queries and comparing the scalar boundaries or another well-defined continuous interval source.
5. The workflow overall remains failed because the compact UI/night Prahar regression test failed; do not describe the complete test suite as passing. The diagnostic emission and artifact upload did succeed.

### Next step

Before any vrata/parāṇa runtime change, inspect and resolve the unrelated compact UI/night Prahar test failure on its own terms, then define a dedicated test that consumes continuous, deduplicated transition boundaries and checks a named vrata decision profile against the documented Dharmasindhu rule. Preserve the Bhādrapada-specific 20-ghaṭikā caveat; do not apply it to every Śravaṇa-Dvādaśī. No production `app.js`, festival JSON, legacy dates, or Blogger output was changed by this diagnostic.


## Shravana-Dvadashi parana rule: source nuance preserved — 2026-10-15

A closer re-reading of the cited Dharmasindhu page shows that the short summary “parana after both Dvadashi and Shravana end” is not a complete executable rule. The source text (TransLiteral page headed “पारणेचा निर्णय”, lines 162–165) gives conditional branches:

- Main view: parana after the end of both Dvadashi and Shravana; a secondary view permits parana at the end of either one.
- If Vishnu-shrinkhala yoga is absent, the page says to perform parana on Trayodashi after both have ended.
- If Vishnu-shrinkhala yoga is present and the observer has undertaken the two-fast observance by the prior-tantra method, the decision depends on which remains longer on the parana day:
  - If Dvadashi lasts longer than Shravana, parana at Shravana's end while Dvadashi remains.
  - If Shravana lasts longer than Dvadashi, parana within Dvadashi, because crossing Dvadashi's end is objectionable for Ekadashi parana.
- The text says the middle 20 ghaṭikās of Shravana may be avoided if feasible. If avoiding that middle would force Dvadashi to be crossed, it describes alternate timing (including Sangava up to six ghaṭikās or the seventh muhūrta) rather than violating Dvadashi.
- The middle-20-ghaṭikā avoidance is specific to Bhādrapada Śravaṇa-Dvādaśī; the text explicitly says not to generalize it to Māgha/Fālguna Krishna-paksha Śravaṇa-Dvādaśī.

Source: https://www.transliteral.org/pages/z80503221630/view (Dharmasindhu, “पारणेचा निर्णय”; displayed Marathi translation). This is a useful searchable transcription, but the final implementation should be checked against the user's reviewed Khemraj edition / source-page image and the Sanskrit passage before treating wording as a final shastric rule.

**Implementation consequence:** do not write a generic “wait until both end” algorithm or apply the 20-ghaṭikā exclusion to every Śravaṇa-Dvādaśī. A future decision helper must accept explicit observance/profile inputs (including whether Vishnu-shrinkhala yoga and the prior-tantra two-fast condition apply), compare Dvādaśī and Śravaṇa end times, preserve Dvādaśī as a hard boundary where the source says so, and label unresolved textual variants instead of guessing. The 2026 September candidate is not yet proof that this special observance/profile applies; establish the vrata identity and yoga conditions first.


## Rule-profile guardrails added — 2026-10-15

The separate Dharmasindhu pages were reviewed together, rather than treating the vrata-selection page and the parana-decision page as interchangeable:

- **Vrata identity / Vishnu-shṛṅkhalā conditions:** https://www.transliteral.org/pages/z80503221524/view, “श्रवणद्वादशीव्रत”, especially the displayed Marathi translation around lines 162–169. It describes the Bhādrapada Śukla Dvādaśī–Śravaṇa conjunction, the special Vishnu-shṛṅkhalā case, and observance choices when two consecutive fasts are involved.
- **Pāraṇa branch:** https://www.transliteral.org/pages/z80503221630/view, “पारणेचा निर्णय”, especially the displayed Marathi translation around lines 164–167. It gives the principal view (after both Dvādaśī and Śravaṇa end), a secondary one-end view, the conditional prior-tantra two-fast branch when Vishnu-shṛṅkhalā applies, and the special middle-20-ghaṭikā discussion.

### Guardrails now covered by a test-only contract file

Added `tests/shravana-dvadashi-rule-profile.test.js` and a workflow step that runs it with `if: always()`, so this isolated guardrail test still executes even if an earlier unrelated regression step fails. The tests verify that:
- unknown observance identity or unknown Vishnu-shṛṅkhalā status returns “unresolved”, not a guessed answer;
- the principal and secondary views are kept distinct when Vishnu-shṛṅkhalā is absent;
- the conditional yoga branch requires an explicit prior-tantra two-fast condition and a duration comparison;
- if that required condition is not established, the result remains unresolved;
- the middle-20-ghaṭikā exclusion is not applied to Māgha/Fālguna Krishna-pakṣa Śravaṇa-Dvādaśī; and
- a non-Śravaṇa-Dvādaśī observance is not processed by this special rule.

These are **rule-selection guardrail tests only**, not a final pāraṇa-time algorithm and not a claim that the 2026 candidate meets the special observance conditions. They do not import or change `app.js`, festival data, or Blogger output. The original Khemraj edition / reviewed source images should still be checked before converting the transcription into user-facing shastric advice or runtime logic.
