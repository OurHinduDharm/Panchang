# Dharmasindhu Ekadashi case transcription — research only

Date: 2026-10-14  
Status: **TRANSCRIPTION-BASED / NOT VERIFIED FOR CODE**  
Source pages:
- Smarta Vrat-dina-nirnaya: https://www.transliteral.org/pages/z80422042257/view
- Vaishnava Vrat-dina-nirnaya: https://www.transliteral.org/pages/z80422042154/view
- Ekadashi tithi discussion: https://www.transliteral.org/pages/z80422042052/view

These are online Marathi transcription/commentary pages attributed to Dharmasindhu by Kāśīnāthaśāstrī Upādhyāya (1790–91). The tables below are a faithful working digest of the visible examples, not a critical edition transcription. Preserve the notation as printed; do not assume the numbers are modern elapsed minutes or interpret a “ghati” value without establishing its reference point.

## A. Vaishnava section — four Shuddha subtype examples

The page first separates Arunodaya-vedha and sunrise-vedha. It defines Arunodaya as four ghatis before sunrise. Its explanation ties the 56-ghati wording to the Vaishnava Arunodaya-vedha discussion and the 60-ghati wording to Smarta sunrise-vedha; the counting origin and exact syntactic scope need printed-text verification.

| Case | Tithi-duration pattern as shown in the Marathi transcription | Reported decision in that section | Review note |
|---|---|---|---|
| V-1 Ekadashi-only adhikya | Dashami 55 ghati; Ekadashi 60 ghati 1 pala; Dvadashi stated as kshaya/shortened in the example | Vaishnava: second day; Smarta: first day | Exact notation and the meaning of “Dvadashi kshaya” need to be checked against the printed page. |
| V-2 Dvadashi-only adhikya | Dashami 55 ghati; Ekadashi 58 ghati; Dvadashi 60 ghati 1 pala; Dvadashi kshaya noted in the example | Vaishnava: Dvadashi; Smarta: Ekadashi | Do not convert the text's duration notation into a tithi-at-sunrise predicate until the count origin is known. |
| V-3 Both adhikya | Dashami 55 ghati 1 pala; Ekadashi 60 ghati 1 pala; Dvadashi 5 ghati | Both profiles: second day | Consistent with the separate scan-backed Smarta verse for the both-growth case, but the predicate still needs context validation. |
| V-4 Neither adhikya | Dashami 55 ghati; Ekadashi 57 ghati; Dvadashi 58 ghati | Both profiles: first day | Provisional transcription outcome. |

Important: the source uses “adhikya” in its examples to mean the tithi is present after sunrise on the next day. That definition is reported by the page's Marathi explanation. It does not mean every instance of a long tithi or every duplicate sunrise should be handled with the same rule.

## B. Smarta section — eight examples

| Case | Pattern as transcribed | Reported decision / source nuance | Status |
|---|---|---|---|
| S-1 | Dashami 58 ghati; Ekadashi 60 ghati 1 pala; Dvadashi kshaya | Called Ekadashi-mātrādhikyavatī śuddhā. | Outcome needs full table/source context. |
| S-2 | Dashami 4 ghati; Ekadashi 2 ghati; Dvadashi kshaya | Called Ekadashi-mātrādhikyavatī viddhā. The page says a householder Smarta takes the first day, while several other categories and Vaishnavas take the second; it records a view of fasting both days for some Vishnu-seeking Smartas. | Practitioner-specific; not a single universal output. |
| S-3 | Dashami 58 ghati; Ekadashi 60 ghati 1 pala; Dvadashi 4 ghati | Called Ubhayādhikyavatī. | Both-growth family; exact trigger needs source validation. |
| S-4 | Dashami 2 ghati; Ekadashi 3 ghati; Dvadashi 60 ghati 1 pala | Called Dvadashi-mātrādhikyavatī viddhā. The page reports that both Smarta and Vaishnava take the second remaining Ekadashi/day in the described case. | Wording needs careful parsing. |
| S-5 | Dashami 58 ghati; Ekadashi 59 ghati; Dvadashi 60 ghati 1 pala | Called Dvadashi-mātrādhikyavatī śuddhā. Madhava's view: Smartas fast on Ekadashi; Hemadri's view: everyone takes Dvadashi; the page also records a second-day option for moksha-seeking Smartas. | Explicit authority disagreement. |
| S-6 | Dashami 1 ghati; Ekadashi kshaya at 58 ghati; Dvadashi growth 50 ghati 1 pala | The page says the Ekadashi is viddhā and Smartas should fast on Dvadashi; it further discusses how some viddhā growth cases are handled, with a broader Vaishnava Dvadashi instruction. | Complex case; do not implement from summary. |
| S-7 | Dashami 57 ghati; Ekadashi 58 ghati; Dvadashi 59 ghati | The page calls this Anubhayādhikyavatī śuddhā and first says everyone should fast on Ekadashi, but the following sentence appears to label it viddhā and says Vaishnavas should fast on Dvadashi. | **TRANSLATION/TEXTUAL CONFLICT** — resolve against printed page before use. |
| S-8 | Dashami 2 ghati; Ekadashi kshaya at 56 ghati; Dvadashi 55 ghati | The page says Smartas take Ekadashi and Vaishnavas Dvadashi; it adds practitioner-specific exceptions for the final viddhā case. | Complex case; preserve exceptions. |

The wording of cases S-1/S-2 and S-3/S-4 is compact and can be misread without the original printed table and its column layout. This digest is for research triage only.

## C. Implementation guardrails

1. Do not implement the case labels or numerical values as predicates yet.
2. Verify the printed Sanskrit and table layout, including whether each ghati count is elapsed from tithi start, sunrise, or another reference.
3. Preserve source opinion (e.g. Madhava vs Hemadri), tradition, practitioner qualification and conflict state as fields in the eventual rule data.
4. The Vaishnava section is a Dharmasindhu profile, not proof that all Vaishnava sampradayas use the same rules.
5. No rule in this file is marked VERIFIED RULE; no executable code or Blogger UI is changed.
