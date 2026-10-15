# Festival Period & Article-Visibility Review Ledger

Last updated: 2026-10-15  
Repository: `OurHinduDharm/Panchang`  
Working branch: `data/festival-json-foundation`  
Status: draft audit; no production/Blogger changes.

## How to use this ledger

This file separates four different things that must not be conflated:

1. **Intentional editorial/display window** — how long a useful card or link should remain visible.
2. **Ritual observance period** — the religious period or vrata itself.
3. **Astronomical/tithi calculation** — the actual local date/time result for a particular year and location.
4. **Legacy text** — what the older Blogger widget said; preserve it as evidence until copy is deliberately revised.

A multi-day `date.end` is not automatically an error. Do not “correct” a period merely because the title names its first day. When the reason is unknown, record a question and ask the site owner before changing dates or rules.

## Owner-confirmed decision: Harishayani Ekadashi / Chaturmas

Record: `festival-101` — `हरिशयनी एकादशी एवं चातुर्मास प्रारंभ`

- **Start: 2026-07-25** — Harishayani Ekadashi; the linked article gives users the Chaturmas vrata sankalpa.
- **Display end: 2026-07-30, inclusive** — the owner intentionally leaves the option visible through Purnima for users who could not take the sankalpa on Ekadashi.
- **Meaning:** this is the period for which the article/card should remain available. It does **not** mean that Chaturmas itself lasts only six days.
- **Do not change this window without explicit owner approval.** A regression test protects the dates and the reason.
- **Copy discrepancy to revisit:** the archived legacy description says `आषाढ़पूर्णिमा - २९ जुलाई तक`, while the owner has clarified that the display window should end on 30 July. The original `sourceText` is intentionally preserved. Before changing public-facing wording, verify the 2026 Purnima date and ask whether the article text should be updated; do not silently rewrite the archive.

The date remains `needs-review` for calendar/tithi verification. Owner-confirmed editorial intent is recorded separately from astronomical certification.

## Existing article-visibility rules

| Rule | Config / record IDs | Intended behavior | Guardrail |
|---|---|---|---|
| Navratri sadhana links | `navratriSadhana`; `festival-003`, `festival-059`, `festival-040`, `festival-088` | While any configured Navratri period is active, show Pratipada–Navami links together; keep Dashami/kalash immersion separate. | Links remain available if a user missed an earlier day. Does not prescribe catch-up ritual. Verify yearly dates and regional observance. |
| Pitri Paksha reference links | `pitriPakshaArticles`; `festival-001`, `festival-002` | Show “महालय श्राद्धों का महत्व” and “तर्पण विधि” from Pratipada through Pitri Visarjani Amavasya, inclusive. | Reuse existing OurHinduDharm URLs. This only controls link visibility; it does not assign each ancestor's shraddha date or muhurta. Verify yearly dates. |
| Chaturmas sankalpa opportunity | `festival-101` | Keep the Harishayani Ekadashi article/card visible through the owner-confirmed Purnima window. | Separate from the full four-month Chaturmas observance and separate from the two rules above. |

## Multi-day records requiring deliberate review

The dates below are carried over/provisional values in the draft data. This is a triage list, **not** a declaration that each record is wrong.

| Record | Current stored span | Review finding | Next action |
|---|---|---|---|
| `festival-001` Pitri Paksha start | 2026-09-27 – 2026-10-10 | A period record ending on Amavasya is intentional in concept; the actual 2026 tithi/civil-date mapping is still marked for review. | Verify local tithi and confirm `festival-002` is the matching terminal record. |
| `festival-003` Sharadiya Navratri | 2026-10-11 – 2026-10-20 | The overall period is used to keep all nine sadhana links visible. Do not infer the date range solely from the word “प्रारम्भ”. | Verify the period boundaries and regional convention for the year. |
| `festival-009` Saptami / Kalaratri | 2026-10-17 – 2026-10-18 | Title retains the owner-requested October 18 note; two civil dates may reflect a tithi span, not necessarily two puja days. | Preserve title for now; resolve exact tithi instants and observance decision separately. |
| `festival-025` Tulsi Vivah | 2025-11-02 – 2025-11-05 | Stale 2025 dates; description intentionally speaks of a period through Purnima, but regional observance may vary. | Recalculate for target year and confirm whether this is a ritual window or only link-visibility window. |
| `festival-032` Paush month | 2025-12-05 – 2026-01-03 | Old-year start; lunar-month naming depends on Amanta/Purnimanta convention. | Recalculate and identify the convention before updating. |
| `festival-034` Shakambhari Navratri | 2025-12-28 – 2026-01-03 | Stale 2025 start; stored rule itself says tradition/period needs verification. | Research the site's intended tradition and recalculate before making it a link-visibility rule. |
| `festival-037` Magha month | 2026-01-04 – 2026-02-01 | Full lunar-month span; convention not recorded yet. | Verify month system and tithi boundaries. |
| `festival-040` Magha Gupt Navratri | 2026-01-19 – 2026-01-27 | Nine-day span is plausible as a period record, but still unverified. | Verify tithis and preserve all day links if the parent period rule is intended. |
| `festival-059` Chaitra Navratri | 2026-03-19 – 2026-03-27 | Used by the all-days sadhana rule. | Verify yearly dates and Ghatasthapana separately. |
| `festival-087` Gayatri Jayanti | 2026-06-25 – 2026-06-26 | Description also discusses Ambubachi Yoga from June 22 to June 26; that may be a different event window from Jayanti itself. | Separate the Jayanti date from the Ambubachi interval if both need display; do not merge their meanings. |
| `festival-088` Ashadha Gupt Navratri | 2026-07-15 – 2026-07-23 | Used by the all-days sadhana rule. | Verify yearly dates and preserve links throughout the parent period. |
| `festival-101` Harishayani Ekadashi / Chaturmas | 2026-07-25 – 2026-07-30 | **Owner-confirmed intentional display window** through Purnima; legacy description has a July 29 wording mismatch. | Keep dates; verify calendar and resolve public-copy wording later. |
| `festival-103` Shravan month | 2026-07-30 – 2026-08-28 | Long month card; no dedicated article URL is currently extracted, and month convention is not explicit. Its start sharing July 30 with the Chaturmas window is not by itself a conflict. | Confirm month system and article/link target before proposing all-month link display. |
| `festival-117` Ganesh Chaturthi-related record | 2026-09-14 – 2026-09-25 | The title says “Ganesh Ji ki Jayanti” but description points to Ganesh Chaturthi / Bhadrapada Shukla Chaturthi; 12-day span looks suspicious for a single-day observance. | High priority: inspect legacy intent and correct title/span only after confirmation. Do not interpret as a 12-day festival automatically. |

## Long-period article visibility: candidates, not yet implemented

These should be considered only when the existing article and owner intent support it.

- **Shravan month (`festival-103`)** — possible month-long information card, but the current record has no dedicated article URL. First locate/confirm the article and month convention.
- **Paush month (`festival-032`)** — existing Paush Mahatmya link; dates need a current-year recalculation and month-system decision before activation.
- **Magha month (`festival-037`)** — existing Magha Mahatmya link; dates need recalculation and month-system decision.
- **Tulsi Vivah (`festival-025`)** — existing article describes a multi-day opportunity through Purnima. Confirm whether the site's desired display should cover that whole interval in the target year.
- **Shakambhari Navratri (`festival-034`)** — existing sadhana link; confirm intended tradition, dates and whether users should see it throughout the full observance.
- **Ambubachi Yoga / Gayatri Jayanti (`festival-087`)** — likely needs two separate date concepts if both intervals are to be shown.

Do not add any of these to runtime visibility rules until its intent and dates are confirmed. A link being available in the archive does not automatically mean it should be shown for every day of a long span.

## High-priority follow-up list

1. **`festival-117`** — clarify the “Ganesh Jayanti” title vs Ganesh Chaturthi description and the 12-day span.
2. **`festival-101`** — retain July 25–30; verify the Purnima date and decide whether the public article's “29 July” wording should be updated. Never change the archived `sourceText`.
3. **`festival-087`** — distinguish Gayatri Jayanti from the Ambubachi Yoga interval.
4. **`festival-025`, `festival-032`, `festival-034`** — replace stale 2025 spans only after target-year rule review.
5. **`festival-103`, `festival-037`** — record the intended lunar-month convention and confirm article URLs.
6. Re-check Navratri and Pitri Paksha active-period IDs each year before the season begins.

## Safety / release policy

- Keep PR #33 as **Draft** and do not merge or change Blogger production integration without explicit owner approval.
- Never silently overwrite a legacy date, title, URL or source description. Record source text and explain each proposed correction.
- Keep editorial intent, calculated tithi intervals, ritual observance decisions and article visibility as separate fields/decisions.
- If an inconsistency has more than one reasonable explanation, ask the owner rather than guess.
- Run the relevant automated tests after any change to period configuration or link visibility.
