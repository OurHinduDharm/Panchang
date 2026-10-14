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
