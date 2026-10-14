# Festival Data — Progress & Continuation Notes

Last updated: 2026-10-14

## Project / safety
- Repo: `OurHinduDharm/Panchang`
- Work branch: `data/festival-json-foundation`
- Draft PR #33: https://github.com/OurHinduDharm/Panchang/pull/33
- Keep PR as **Draft** while auditing. Do not merge or change live Blogger without explicit user approval.
- User works mostly on Android; give clear copy/paste steps and keep progress notes here so a new chat can resume.

## Current files and status
- `data/festivalData-source.txt`: archive of original Blogger festival widget / original `festivalData` source.
- `data/festivals.json`: 122 migrated records. Original titles/descriptions (including HTML links), legacy dates, endDate, statusText and hidePeriod preserved in `sourceText`.
- `data/festival-schema.json`: draft schema.
- `data/README.md`: migration notes (may be stale; update after audit).
- `data/FESTIVAL-PROGRESS.md`: this handover note.
- 90/122 records had an article URL; 32 did not.
- Legacy dates are copied, **not yet verified/recalculated**. All records are `needs-review`.
- Provisional date-rule hints exist, but are not authoritative. Counts noted earlier: 111 tithi, 5 astronomical, 4 solar, 2 manual; audit these classifications.
- Investigate suspicious eclipse date `1970-01-01`; do not treat it as a real eclipse date.
- Chaturmas code exists outside the original festivalData array and still needs separate migration/review.

## User requirements
1. Organize festival data around Hindu month, paksha, tithi and special observance rules, not hard-coded old Gregorian dates alone.
2. Account for festivals with multiple dates/stages and cases where observance can fall on different tithis or days.
3. Ekadashi needs a proper catalog: regular Ekadashis by lunar month and paksha, names, vrat/observance notes, and Adhik Maas cases such as Padmini and Parama. Verify names/rules from reliable granthas and document regional/sampradaya differences rather than assuming one universal rule.
4. If a verified article URL exists, display a link; otherwise show the description. Preserve source content; do not invent shastric claims. If both are absent, add a concise description only after research and mark its source/status.
5. Eclipse records should use existing `eclipse-panchang.js` rather than hard-coded eclipse dates.
6. Add a future festival-Muhurat system grounded in primary texts and documented decision rules.

## Existing eclipse module
- Main: https://github.com/OurHinduDharm/Panchang/blob/main/eclipse-panchang.js
- API: `window.initEclipsePanchang(year?)`; no auto-init.
- Uses shared `window.__ohdPanchangam`, `getGrahana()`, `findTithiTransitions()`; fetches full Panchang only on actual eclipse dates.
- Range 2026–2050; location key `ohdPanchangLocation`; TZ offset 330.
- Do not add duplicate astronomy/date scanning. Keep astronomical event, local visibility and ritual/sutak decision as distinct concepts.

## Festival Muhurat plan
- Aim: compute location-aware festival Muhurats from Panchang/astronomy plus explicit rules researched from granthas—not copy random websites' dates blindly.
- Treat every Muhurat rule as a documented rule record: festival/observance, source grantha, chapter/verse/page if available, original quotation or faithful note, interpretation, required tithi/nakshatra/yoga/weekday/solar or sunrise/sunset condition, time-window formula, location/timezone assumptions, priority/conflict resolution, tradition/region scope, examples/tests, review status.
- Keep **rule research** separate from **calculation code** and from **display text**.
- Support multiple stages/slots for a festival (e.g. festival day, puja period, Nishita/Kaal, Pradosh, Ghatasthapana, Ashtami/Navami, start/end) rather than one date field.
- Muhurat output should show local start/end time, date rollover if relevant, location used, concise explanation, and source/rule citation. If the rule is not yet verified or rules conflict, say so; do not falsely label it definitive.
- Research primary sources first: relevant Muhurat granthas and applicable Dharma-nibandha/paddhati material; compare with reliable traditional calendars and websites only as cross-checks. Record edition/translation because verses and interpretations may vary.
- Do not mix this project with the separate Surya Siddhanta graha-rise/asta research already underway in another chat; coordinate interfaces only when needed.

## Suggested execution order
1. Audit all 122 records and create a review list: missing links/descriptions, suspicious dates, duplicates/combined titles, date-rule classification, eclipse entries, multi-stage festivals.
2. Design schema for `observances[]` / stages, optional `sourceUrl`, fallback `description`, date-rule metadata and Muhurat rules without breaking original content.
3. Build and validate the Ekadashi catalog; explicitly account for Adhik Maas and documented tradition differences.
4. Validate eclipse records against `eclipse-panchang.js`; separate event date, local visibility and ritual guidance.
5. Research and implement festival-specific Muhurat rules in small batches with source notes and test cases.
6. Add missing festivals only after checking the existing archive and avoiding duplicates.
7. Test calculations for multiple locations and edge cases (tithi spans two civil days, tithi skipped/duplicated, sunrise/sunset boundaries, midnight/Nishita, month adhika/kshaya, timezone/date rollover).
8. Update Blogger display only after review, preview tests, and user's explicit approval.

## Known research example / existing article
- OurHinduDharm Sharadiya Navratri article: https://ourhindudharm.blogspot.com/2013/10/About-Sharadiya-Navaratri.html
- Mahashivratri article: https://ourhindudharm.blogspot.com/2014/02/About-Mahashivratri-Vrat.html
- Deepawali article: https://ourhindudharm.blogspot.com/2013/11/About-Deepawali.html (previous retrieval had anti-bot issue).

## Next concrete task
Start with an audit of `data/festivals.json` and `data/festivalData-source.txt`; publish a concise issue list in this folder. Do not present provisional rules as verified. Keep all edits on the draft branch until user reviews.


## Audit snapshot (2026-10-14)
A programmatic first-pass scan of the migrated JSON found:
- 122 records total; 32 have neither an extracted article URL nor an HTML link in the description; 2 descriptions are empty.
- Only 6 records mention Ekadashi (including mixed festivals); this is not a complete Ekadashi catalog.
- 4 records match eclipse-related text, but one is a Navratri entry mentioning another event; the real eclipse records need careful review.
- 22 records preserve an original `endDate`; these include observance periods, but the old field should not be interpreted automatically as a multi-stage ritual schedule.
- 18 records have dates in 2025 or the placeholder `1970-01-01`; these are priority review items, not automatic corrections.
- Some entries clearly combine distinct observances (e.g. Dattatreya Jayanti and Tripura Bhairavi/Sri Vidya/Annapurna Jayanti; Diwali/Lakshmi Puja; Mokshada Ekadashi/Gita Jayanti). Decide whether to represent as linked observances or separate records while preserving source text.
- Existing Navratri records demonstrate why a single date field is insufficient: start, each day/deity, Ashtami, Navami, Havan, Sandhi Puja, Parana and Kalash immersion may require separate rule-based stages. Legacy times in descriptions are not automatically valid for every city/year.
- The first pass is a triage scan only; no dates or ritual rules have been certified by this scan.

## Immediate next steps after this scan
1. Create a review ledger by record ID: priority, issue, evidence/source, required action, status.
2. Inspect all Ekadashi entries and design a separate canonical list of the 24 regular observances plus Adhik Maas cases, with regional/sampradaya variants noted rather than flattened.
3. Audit the eclipse records against `eclipse-panchang.js` and current astronomical output; keep visibility and ritual/sutak policy separate.
4. Design a reusable Muhurat rule catalog and event-stage schema before changing the Blogger UI.


## Initial Muhurat / tithi-decision research references (not yet accepted as engine rules)
- Nirnaya Sindhu, Tithi Nirnaya: https://www.transliteral.org/pages/z130511025312/view
- Dharma Sindhu, Tithi Vrata Nirnayas (condensed English presentation): https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=5
- Narada Purana, Chapter 29, tithi and Ekadashi observance decisions: https://www.wisdomlib.org/hinduism/book/narada-purana-english/d/doc1501993.html
- These are initial research leads, not proof that one rule applies to every sampradaya or region. Before coding, capture edition/translation, exact locator, original text where available, interpretation, tradition scope and test cases. Cross-check translations and do not derive a definitive rule from a search snippet alone.


## Ekadashi research — continuation update (2026-10-14)

- Created `data/references/ekadashi-review-ledger.md` on `data/festival-json-foundation`.
- Ran an initial keyword scan over all 50 `vrat-parichay-chunks/part-*.txt` files. The ledger now links the most relevant found chunks and records initial OCR evidence.
- The book's part 007 explicitly reports multiple views on Shuddha/Viddha Ekadashi, Dashami-vedha, Kshaya Ekadashi and Vaishnava vedha thresholds. Treat these as source leads, not as a single universally applicable rule. Verify the cited grantha and historical ghati notation before converting to modern time thresholds.
- Several regular Ekadashi descriptions are located in parts 010–028. The scan is preliminary and may miss OCR-corrupted spellings or indirect references.
- External comparison leads are recorded in the ledger: Dharma Sindhu chapter 3 and 5, Narada Purana, and a modern methodology page. These are research leads, not accepted rules.
- Next: inspect the full Ekadashi rule section in parts 007–008, transcribe its rule categories faithfully, resolve source citations and tradition scope, then create a separate explicit decision table for Smarta/Vaishnava day selection and Parana. Do not implement dates until that table is reviewed.
- No production Blogger changes. Draft PR #33 remains unmerged.

- Added `data/references/ekadashi-decision-rules-draft.md`: layered engine design (astronomical tithi boundaries, sunrise mapping, tradition policy, exceptional Mahadwadashi cases, Parana, UI) and unresolved research questions. It explicitly marks all rules as not approved for coding.


## Smarta and Vaishnava requirement (2026-10-14)

The user confirmed separate Smarta and Vaishnava Ekadashi decision profiles. If both profiles select the same local date, show one date/card labelled for both traditions. If their selected dates differ, show separate labelled observances on the respective dates. Use shared local astronomical inputs but apply each tradition's reviewed decision rules separately. Dashami-vedha/Arunodaya, Kshaya/Vriddhi, Mahadwadashi/Trisprisha and Parana still require source-verified rule sequences. This is a confirmed product requirement, not approval of unverified shastric rules or production code. See `data/references/ekadashi-decision-rules-draft.md`, section 6. Draft PR #33 remains unmerged; Blogger production is unchanged.


### Ekadashi source-comparison research (2026-10-14)

- Added `data/references/ekadashi-source-comparison.md` with a claim-by-claim comparison of the OCR book section (part 007, pp. 49–52), an online Nirnaya Sindhu Sanskrit/Marathi transcription, Dharma Sindhu condensed English pages, Narada Purana translations, and a modern methodology page used only as a cross-check.
- Important finding: the sources do not justify a simplistic universal rule such as “Smarta always fasts on the sunrise Ekadashi” and “Vaishnava always fasts the next day.” Nirnaya Sindhu's online transcription includes separate Arunodaya-vedha and Suryodaya-vedha handling, growth/overlap cases, and even householder vs yati/widow distinctions in some situations.
- The OCR book mentions 45/55-ghati views; the condensed Dharma Sindhu English translation has an ambiguous 57/60-ghati phrase. These figures must not be merged into a single threshold until the original printed/source passage and its reference point are verified.
- The Narada Purana online commentary and translated passage should be kept at different evidence levels (editorial note vs translated text). Mahadwadashi name lists also vary across texts/translations (the OCR has Papanashini; one Narada Purana translation list includes Aparajita), so names and triggers require individual verification.
- No code rules promoted to `verified-rule`; no production Blogger changes. Draft PR #33 remains unmerged.

- Added `data/references/ekadashi-rule-matrix-draft.md`: a preliminary case matrix for normal tithi, Arunodaya-vedha, Suryodaya-vedha, Ekadashi/Dwadashi vriddhi, kshaya, Mahadwadashi and Parana. Every row remains research-only until source-reviewed; it is not executable logic.


### Additional Ekadashi research (2026-10-14)

- Extended `data/references/ekadashi-source-comparison.md` with Hari-bhakti-vilasa, Vilasa 12 (sections 12.325-338) and Narada Purana Uttara-bhaga 37.5 / Chapter 121.
- Hari-bhakti-vilasa provides Sanskrit citations for Arunodaya and Dashami-vedha in a Vaishnava framework. Its displayed English translations of 12.336 and 12.337 appear contradictory, so the Sanskrit and another edition must be checked before interpreting or coding the rule.
- Narada Purana Chapter 121 gives descriptions of Trisprisha and Unmilini; the wording needs comparison with a reliable printed Sanskrit edition before conversion to code conditions.
- A list discrepancy is recorded: Vrat-Parichay OCR lists Papanashini, one Narada Purana translation lists Aparajita, and some modern ISKCON-specific calendars list Papanashini. Do not flatten this into one list before source review.
- GPT/AI can help translate, identify contradictions, and propose test cases, but its output is not scriptural evidence by itself. Each rule needs a reliable source passage, defined tradition scope, and a reviewed worked example before being marked verified.
- No rules have been marked verified; no live Blogger code changed; draft PR #33 remains unmerged.

- Added source-evidence notes to `data/references/ekadashi-rule-matrix-draft.md`: Hari-bhakti-vilasa 12.334-337 and Narada Purana Chapter 121 verse 98 converge on a Vaishnava Arunodaya-Dashami case, but translation inconsistency means it remains promising, not verified. Trisprisha is documented as a distinct three-tithi sequence requiring a special-case detector.


## Ekadashi research workflow decisions (2026-10-14)

The following process improvements are accepted for the research workflow; they do **not** certify any religious rule:

- Mark Sanskrit/translation disagreements explicitly as `UNVERIFIED / TRANSLATION CONFLICT`; keep the rule in draft until the passage, edition and context are checked.
- Expand the rule matrix with prerequisites, tithi/sunrise/Arunodaya state, tradition scope, decision, Parana consequence, source locator, confidence/status and worked test case.
- Maintain a decision log separating accepted project/UI decisions from accepted scriptural rules. A UI decision can be accepted while the underlying religious rule remains unverified.
- Build a historical test set only from dates whose location, tradition/calendar convention and published observance are recorded. Use historical calendars as cross-checks, not as proof of a rule by themselves.
- Use AI for padaccheda/anvaya drafts, translation comparison and candidate test cases; verify all outputs against the actual Sanskrit passage and a reliable edition.

### Important limits on Gemini's suggestions

- Do not hard-code 45/55/57/60 ghati thresholds until the original passage, counting reference point and tradition scope are verified.
- Hari Vasara's first-quarter rule, Dvadashi end, and post-sunrise Parana are research constraints to source-check by tradition and exception. Do not yet assume they are three universal hard constraints with one generic fallback.
- Do not add Smarta householder/yati or Nimbarka/Gaudiya/ISKCON as fully implemented profiles just because the matrix has a tradition column. First collect the relevant rules and examples. The initial user-confirmed UI profiles remain Smarta and Vaishnava; the Vaishnava profile must not silently mean ISKCON.
- Do not select a fallback such as water/Tulasi Parana for a conflict unless a source explicitly supports it for that case.

No executable Ekadashi rule is approved by this workflow note. Draft PR #33 remains unmerged; production Blogger code remains unchanged.


## Historical Ekadashi test-case queue added (2026-10-14)

- Added `data/references/ekadashi-historical-test-cases.md`.
- Recorded candidate cross-checks for Kolkata Parivartini Ekadashi (September 2022), plus Gaudiya-calendar examples of Vyanjuli, Trisprisha and Paksha-varddhini Mahadvadashi in 2023.
- These are explicitly **candidate cases**, not verified expected outputs or shastric proof. Location-specific tithi transitions, sunrise/Arunodaya, primary citations and tradition scope must be reviewed before converting them to automated tests.
- Research cross-checks: https://www.onlinejyotish.com/ekadashi-days.php?loc=kolkata&m=9&y=2022 and https://vaishnavacalendar.org/delhi/538/en/
- Next: inspect the original Sanskrit passages in Nirnaya Sindhu/Dharma Sindhu for the normal case and Parana sequence; then select one historical case and reconstruct its tithi/sunrise timeline before writing an expected-result test.



## Dharma Sindhu translation audit note (2026-10-14)

- Reviewed the online Chapter 5 summary at https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=5.
- It is explicitly a condensed English translation. It distinguishes Arunodaya and Suryodaya Dashami-vedha, mentions 57/60-ghati counts and says Parana should precede Dvadashi tithi-end, but does not provide enough original-language context to freeze exact thresholds or exceptions.
- Its Mahadvadashi name/transliteration renderings differ from other online sources. This is recorded as a source-review issue, not declared an error.
- Updated `ekadashi-source-comparison.md` and `ekadashi-decision-log.md`. No religious rule promoted to verified; no code changed.


## Nirnaya Sindhu source audit (2026-10-14)

- Added `data/references/ekadashi-primary-source-audit-2026-10-14.md` with an audit of the TransLiteral Nirnayasindhu pages on Vedha, Ekadashi vrata and the eight Mahadvadashis.
- Key distinction: Nirnayasindhu explicitly treats Arunodaya-vedha and Suryodaya-vedha as separate categories. The cited passage describes Arunodaya as four ghatis before sunrise, but also discusses other textual formulations and harmonisation; therefore the definition must be a sourced policy, not a hidden universal constant.
- Important Parana nuance: the Mahadvadashi commentary records different views on passing Hari-vasara, morning Parana when Dvadashi is long, and Aparahna Parana; short-Dvadashi and crisis cases are separately discussed. No single formula/fallback should be hard-coded yet.
- The eight Mahadvadashi descriptions imply separate triggers (tithi-growth patterns or nakshatra conjunctions); names alone are insufficient for detection.
- Updated the decision log with SOURCE-02/03, PARANA-01, MAHA-01 and NORMAL-01. These are source-audit decisions, not verified observance rules.
- Sources: https://www.transliteral.org/pages/z130515050414/view ; https://www.transliteral.org/pages/z130515050924/view ; https://www.transliteral.org/pages/z130515051434/view ; https://vedicpupil.in/library/books/nirnayasindhu/chapter-1
- Next: compare the exact Sanskrit from a reliable printed scan/edition for Nirnayasindhu Pariccheda 1, Ekadashi Nirnaya and Arunodaya-vedha, then reconstruct one historical local-time timeline. No executable rule has been added.


## Scan-backed Smarta double-growth rule located (2026-10-14)

- Found a source-registry record reporting direct reading from printed scans of both Dharmasindhu (1888, p. 17, leaf n39) and Nirnayasindhu (1901, p. 30, leaf n57), with the same verse:
  `एकादशी द्वादशी चेत्युभयं वर्धते यदा । तदा पूर्वदिनं त्याज्यं स्मार्तैर्ग्राह्यं परं दिनम् ॥`
- Narrow meaning: when both Ekadashi and Dvadashi “increase” in the passage's precise sense, the **Smarta** decision rejects the earlier day and takes the later day. Do not infer a Vaishnava result from this verse.
- Recorded as `SM-ED-VRIDDHI-BOTH-01`, status `SOURCE-SUPPORTED / IMPLEMENTATION-PENDING`: the trigger semantics still need context review, plus a local-time worked example before regression testing.
- Updated the source audit, decision log and rule matrix. This is the first narrow case with matching scan-backed Sanskrit references; the overall engine and normal case remain unverified.
- Registry locator: https://acharane.com/sources/ (entries `ds-p17-ekadashi-vriddhi` and `ns-p30-ekadashi-vriddhi`).


### Ekadashi source follow-up — Smarta two-sunrise case (2026-10-14)

- Refined `SM-ED-VRIDDHI-BOTH-01` using the source registry's explicit classification as a two-sunrise Ekadashi case. Matching scan-backed Sanskrit is reported for Dharmasindhu (1888, p. 17) and Nirnayasindhu (1901, p. 30).
- The source names the Smarta scope and says to reject the earlier day in favour of the later day when both tithis “increase.”
- The possible sunrise-state predicate is still provisional: surrounding paragraph context must define “वर्धते” precisely. No Vaishnava outcome inferred; no executable rule or regression test added.
- Next research action: inspect surrounding printed text, then reconstruct a real local-time two-sunrise example using independently checked tithi transitions and sunrise times.


### Dharmasindhu Ekadashi profile taxonomy located (2026-10-14)

- Located separate TransLiteral topic pages for Dharmasindhu's Smarta and Vaishnava Vrat-dina-nirnaya and the Ekadashi tithi discussion.
- The transcription contains a concrete case taxonomy: the Vaishnava section distinguishes Ekadashi-only growth, Dvadashi-only growth, both growth and neither growth; the Smarta section gives eight examples and records disagreement among authorities in some cases.
- It also distinguishes Vaishnava Arunodaya-vedha (four ghatis before sunrise; a 56-ghati phrase in the transcription) from Smarta sunrise-vedha (a 60-ghati phrase). These figures are context-specific leads, not approved universal thresholds.
- Research documents updated. Next: transcribe every numbered case faithfully, inspect the printed Sanskrit/edition and counting origin, then create a worked local-time test. No executable Ekadashi rules added; PR #33 remains unmerged and Blogger production unchanged.


### Dharmasindhu case digest added (2026-10-14)

- Added `data/references/ekadashi-dharmasindhu-case-transcription.md`, a structured research digest of four Vaishnava subtype examples and eight Smarta examples from the TransLiteral Dharmasindhu pages.
- Important quality finding: the Smarta page's case 7 appears internally contradictory in its Marathi transcription (first “Shuddha”/everyone Ekadashi, then apparently “Viddha”/Vaishnava Dvadashi). It is explicitly blocked pending printed-page verification.
- Several rows also preserve Madhava/Hemadri differences and practitioner-specific distinctions. These must become explicit policy/source fields, not be flattened.
- No executable rule added. Next: compare the source table against a printed scan/edition and establish the ghati counting origin before creating any automated test.


### Historical and future Panchang cross-check policy (2026-10-14)

The user approved using both past and future Panchang decisions as cross-check data for the Smarta and Vaishnava Ekadashi profiles. This is a validation requirement, not permission to copy published dates blindly or treat a calendar as scriptural proof.

For each test case, record:
- Gregorian date(s), location, latitude/longitude if known, timezone and the published Panchang/calendar name or URL.
- Tradition/profile explicitly stated by the source (Smarta, Vaishnava, or a named lineage); never infer lineage from a generic “Vaishnava” label.
- Published fasting date, Parana date and start/end time if available, Mahadvadashi label if any, and the source's stated reason when available.
- Independently computed local tithi start/end, local sunrise for each relevant date, Arunodaya window under the candidate source policy, and tithi state at each boundary.
- Our engine's result, published result, match/mismatch, and a brief diagnosis. Do not adjust the rule merely to force a match; first check location, timezone, calendar convention, lineage, source transcription and astronomy.
- Evidence/status: candidate, reconstructed, cross-checked, or source-verified. A date from a modern calendar is a comparison datum, not by itself proof of the shastric rule.

Test-set balance:
1. Past dates: start with the existing candidate examples (Kolkata Parivartini Ekadashi, September 2022; Gaudiya Mahadvadashi examples from 2023), and only promote them after reconstructing local tithi/sunrise data and confirming the tradition label.
2. Future dates: calculate the next available Ekadashi cycles for the chosen reference location, compare against at least one clearly identified published Panchang for each profile, and preserve disagreements for review instead of silently choosing one.
3. Edge cases: normal single-day observance, Dashami-vedha/Arunodaya, Ekadashi and Dvadashi spanning two sunrises, kshaya/vriddhi, each Mahadvadashi subtype, long/short Dvadashi Parana and date rollover.
4. Avoid circular validation: published calendars are external expected-output candidates; independently recompute the astronomy and separately verify the rule text. Where possible, compare more than one independent calendar, while recording when calendars may share the same source.

Implementation gate: no rule becomes executable solely because it matches a published date. Require a source passage with scope, a defined predicate, one worked local-time example, and regression tests. Keep the test corpus and source ledger in the draft branch; do not change live Blogger output before review and explicit approval.


## Festival stage-model design proposal added (2026-10-14)

- Added `data/references/festival-stage-model-draft.md` (commit `5c1d92357746f2dc452e1ac1480b71da3cbe85bd`).
- The proposal separates festival groups, individual observances, independently timed stages, reviewed date/time rules, and source records.
- It flags a data-loss risk: some descriptions contain multiple article links, while the normalized record currently exposes only one `sourceUrl`. Original HTML/sourceText must remain intact and multiple links should be represented without dropping any.
- It explicitly prevents interpreting legacy `endDate` as a ritual stage/time without evidence.
- No schema version was changed and no existing festival records were rewritten. This is a design document pending review, not a new runtime contract.
- Next: use the proposal to build a legacy-ID-to-observance mapping report for combined titles and multi-stage groups; leave ambiguous mappings marked for review. Then validate source-link preservation and date-field invariants before changing the schema.


## Legacy-to-observance mapping queue added (2026-10-14)

- Added `data/references/legacy-observance-mapping-queue.md` (commit `55c5539dbc135156e26622f9a0dd786334b715ee`).
- Reviewed all 122 normalized record names and dates for combined titles, multi-stage festival groups, suspicious legacy dates, and potential source-link loss.
- Recorded candidate—not final—interpretations for Diwali/Lakshmi Puja, Devotthani Ekadashi/Chaturmas, Gita Jayanti/Mokshada Ekadashi, multi-Jayanti rows, tradition-specific Janmashtami/Ram Navami, Navratri stages, and other combined records.
- Explicitly flagged `festival-009` (title mentions 18 October but normalized start is 2026-10-17), `festival-054` (eclipse placeholder 1970-01-01), `festival-117` (Ganesh Jayanti title vs Ganesh Chaturthi-linked description and long endDate), and the 2025 date block for source review.
- This is a mapping queue only. No event was split, no date corrected, and no source rule certified.
- Next: verify candidate rows against the original descriptions/articles, preserve every embedded URL, and record each decision as alias / linked observances / unresolved before changing the data model.


## User clarifications and next-step inventory (2026-10-14)

- Recorded the user's clarification in `data/references/festival-user-clarifications-2026-10-14.md` (commit `3e35434aeebfcd500d988baebd38495a8179668c`):
  - `festival-009`: Ashwin Shukla Saptami spans 17–18 October in the paper Panchang/reference; the 18 October title note is intentional. Model the tithi interval separately from observance-date selection.
  - `festival-054`: 1970-01-01 was a manual-update placeholder. The desired direction is to use the existing `eclipse-panchang.js` module's India-relevant event results, not static dates or a second calculator.
  - `festival-117`: the user uses Bhadrapada Shukla Chaturthi as Ganesh Chaturthi/Ganesh Jayanti; do not split it merely because the title and linked article use different names.
  - Old 2025 dates are stale manually maintained display values; replace them with reviewed recurring rules rather than shifting the year by hand.
- Updated `data/references/legacy-observance-mapping-queue.md` to reflect these clarifications (commit `c323efda0a371e2c980abcfe8f9f1c7b0514c940`).
- Inspected `eclipse-panchang.js`: the documented public API is currently `window.initEclipsePanchang(year?)`, which initializes the UI. It does not yet expose a documented normalized event-data API for the festival widget. See `data/references/eclipse-festival-display-integration-draft.md` (commit `07013b2b6536a041afef39bb4d142608e0f7f9c9`). The safe next implementation is to extract/reuse the existing discovery logic behind a tested read-only data API, not scrape its HTML or duplicate the astronomy.
- Added `data/references/festival-rule-mapping-inventory.md` (commit `ac5ccc70053e35e36f514337a04476b9189f09b1`), a first-pass rule-family triage for all 122 legacy records. Classifications are candidates only, not approved rules.
- No `festivals.json` record, legacy date, schema version, runtime module, or Blogger page was changed. PR #33 remains draft.
- Next: review and implement the shared eclipse data API with tests; in parallel, source-review simple tithi festivals and record their exact recurring predicates. Keep Ekadashi, multi-stage festivals, and tradition-specific cases behind their existing research gates.


## Vrat-Parichay missing-observance audit started (2026-10-14)

- Added `data/references/vrat-parichay-gap-audit-draft.md` (commit `6eb44408fb96de2b1f5fd28c91cf4ab9b05b8da6`).
- Used the existing Gita Press *Vrat-Parichay* OCR reader/chunks in the repository; no need to upload the text again. The chunk index reports 50 readable parts from the original OCR source.
- First pass reviews contents entries in `part-001.txt` and `part-002.txt`, covering monthly observances from Chaitra through Kartik and listing possible gaps, alias checks, printed page references, and next actions.
- This is intentionally a candidate queue, not a final list: the book contains recurring vrata rules, puja stages, regional practices, and specialised vows. Some items already exist in the 122 records or belong in the separate Ekadashi/monthly-observance catalog.
- Explicit guardrail: do not change legacy dates or add candidates to runtime merely because a name appears in the contents. Confirm aliases, inspect the relevant body text, record the page/source and timing predicate, and test the rule first.
- Next: expand the book contents audit into the remaining months/appendices, then compare aliases against both normalized names and original source titles/descriptions. Keep confirmed gaps separate from already-covered observances and unresolved tradition-specific items.

## Vrat-Parichay audit expanded and alias mapping started (2026-10-14)

- Expanded `data/references/vrat-parichay-gap-audit-draft.md` beyond the initial Chaitra–Kartik pass to cover Margashirsha, Pausha, Magha, Phalguna and the contents-listed appendices (Adhimas, Sankranti, Ayana/Paksha, weekday/Panchanga-factor, miscellaneous and prayashchitta vows). Sampled the separate disease/affliction-vow contents in OCR chunk `part-003.txt` and explicitly kept those outside the main festival feed.
- Added `data/references/vrat-parichay-alias-match-draft.md`, a manual first-pass mapping to the current 122 `festivals.json` IDs. It separates strong name matches, related-but-not-equivalent items, recurring-rule-family gaps, and likely specialist-vrata exclusions.
- Important distinctions recorded: one named Ekadashi does not implement all Ekadashis; Maha Shivaratri does not cover Masik Shivaratri; Skandamata does not prove Skanda Shashthi coverage; related Ganga/Yama/Vyasa observances must not be merged without reading their source passages.
- No changes made to `festivals.json`, existing dates, linked article URLs, eclipse calculations or live Blogger output. PR remains draft.
- Next: inspect body text for the highest-priority candidates (especially Vata Savitri, Nirjala Ekadashi, monthly Sankashti/Pradosh/Masik Shivaratri, Adhimas, and ambiguous ritual aliases), record exact printed page + OCR chunk, and only then propose rule definitions/tests.


## Priority body-text checks added (2026-10-14)

- Read OCR body excerpts in `part-006.txt`, `part-007.txt`, `part-010.txt`–`part-017.txt` and selected later monthly sections to verify that priority candidates are recurring/duration-based rules, not just contents titles.
- Added evidence notes to `data/references/vrat-parichay-alias-match-draft.md`: Sankashti Chaturthi is described with a monthly Krishna Chaturthi + moonrise condition; Pradosh is described on both paksha Trayodashis; Vata Savitri notes different source traditions (Purnima vs Amavasya); Nirjala Ekadashi is Jyeshtha Shukla Ekadashi; Ashunya Shayan spans Shravan Krishna Dwitiya to Margashirsha Krishna Dwitiya; Mangala Gauri includes a multi-year sankalpa.
- These are OCR-based spot checks, not complete page-image verification or a final shastric ruling. No executable rules or runtime records have been added. Next: transcribe the complete relevant passages with verified printed pages and define rule profiles/tests.



## Priority rule-spec queue drafted (2026-10-14)

- Added `data/references/vrat-parichay-priority-rule-spec-draft.md` for Sankashti Chaturthi, Pradosh, Vata Savitri, Nirjala Ekadashi, Ashunya Shayan, Mangala Gauri, Adhimas, Masik Shivaratri and Vaikuntha Chaturdashi.
- Captured important rule distinctions from OCR: Sankashti sections contain different two-day tie-break wording; Pradosh depends on local evening timing, not just Trayodashi; Vata Savitri explicitly records Amavasya and Purnima traditions; Ashunya Shayan is a multi-month observance; Mangala Gauri is described with a five-year sankalpa.
- Added minimum regression-test scenarios and a required source/rule record shape. No executable rules, runtime data, old dates, article links, eclipse logic or Blogger output were changed.
- Next gate: verify the complete passages against the printed page images/edition and reconcile conflicting authority statements before writing code. Coordinate Ekadashi items with the separate Smarta/Vaishnava rule track.


## Source evidence ledger added (2026-10-14)

- Added `data/references/vrat-parichay-source-evidence-draft.md` with source-by-source notes, visible printed-page labels, OCR chunk references, unresolved conflicts, and secondary cross-check links.
- Sankashti: recurring moonrise predicate is clear, but the source OCR gives inconsistent two-day/no-day tie-breaks across pp. 44, 79, 108 and 118. No universal tie-break selected.
- Pradosh: the source gives both two-ghati and three-ghati post-sunset definitions under different authorities (printed p. 54); ordinary Pradosh is kept separate from weekday-specific kāmya vows.
- Vata Savitri: the source explicitly distinguishes Jyeshtha Purnima and Amavasya traditions (pp. 92–93); keep profiles separate.
- Nirjala: Jyeshtha Shukla Ekadashi identified (p. 97); date/parana remain with the separate Ekadashi decision engine.
- Ashunya Shayan: OCR describes a recurring series from Shravan Krishna Dwitiya through Margashirsha Krishna Dwitiya, with closure on Margashirsha Krishna Tritiya (pp. 106–107); endpoint and tithi-selection wording still need scan verification.
- Mangala Gauri: the source describes every Shravan Tuesday for five years after marriage (pp. 115–116); this is a life-stage practice profile, not a universal festival for every user.
- Adhimas/Purushottama Maas, Masik Shivaratri and Vaikuntha Chaturdashi remain contents-only/body-text research items.
- Important limitation: these page numbers are visible OCR page labels, not yet independently verified against page images; edition metadata is also not yet verified. The ledger explicitly preserves that limitation.
- Updated `data/references/vrat-parichay-priority-rule-spec-draft.md` to link the ledger and carry forward the unresolved conflicts.
- No changes to `festivals.json`, executable date logic, article links, eclipse logic, or live Blogger output.


## Follow-up body-text verification (2026-10-14)

- Extended the source-evidence ledger with body passages for Adhika Masa/Purushottama Masa (`part-029.txt`, printed pp. 230–233; `part-030.txt`, p. 234) and Vaikuntha Chaturdashi (`part-022.txt`, p. 174).
- Adhika Masa: the book states the month has no solar saṅkrānti (and a kṣaya month has two), but its quoted average interval is historical/source prose, not an algorithm. Multiple separate vrata/archana practices exist; keep them distinct from the computed intercalary month.
- Vaikuntha Chaturdashi: body passage attributes it to Sanatkumara Samhita and describes Kartika Shukla Arunodaya-vyapini Chaturdashi, Manikarnika bathing at Brahma Muhurta, and worship of Vishveshvari/Vishveshvara. Check the legacy article and edition before deciding whether a general or Kashi-specific display is appropriate.
- Important correction: the printed p. 189 “Shivachaturdashi Vrat” passage in `part-024.txt` is a Margashirsha Shukla Trayodashi/Chaturdashi practice, not evidence for monthly Masik Shivaratri. Monthly Masik Shivaratri remains unverified.
- Updated the priority rule queue accordingly. OCR page labels remain unverified against page images; no runtime data or date logic changed.


## Edition identity and external source cross-check (2026-10-14)

- External catalogue research confirms *Vrat-Parichay* listings vary by edition/extent: one lists a 2006, 381-page edition (ISBN 81-293-0160-1), another lists a 38th edition at 415 pages, and another lists a 474-page copy. The OCR's exact edition therefore remains unidentified; do not treat printed page labels as verified until the title/edition page and page images are checked. Sources: https://www.pustak.org/index.php/books/bookdetails/1173 ; https://bharatiyavidya.com/product/vrat-parichay/ ; https://vikasbookdepo.com/products/gita-press-vrat-parichay-book-code-610
- Added the edition uncertainty and source link list to `vrat-parichay-source-evidence-draft.md`.
- Vaikuntha Chaturdashi's Manikarnika/lotus-worship theme also has a separate Skanda Purana chapter 35 translation cross-check: https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371677.html . This is corroborative context, not a substitute for matching the exact passage and edition cited in the OCR.


## Independent source comparison follow-up (2026-10-14)

- Sankashti: found a separate page-image-based reference identifying *Dharmasindhu*, pariccheda 2, “atha saṅkaṭacaturthīnirṇayaḥ”, p. 56 / leaf 76, and confirming the local moonrise anchor: https://shastrapanchangam.com/en/sankashti/ . Another methodology page describes first qualifying moonrise when Chaturthi spans two moonrises and sunrise fallback when it reaches no moonrise: https://panchangtime.com/methodology/sankashti-chaturthi . This is a strong candidate rule, but the primary scan must be read directly before resolving the *Vrat-Parichay* wording differences.
- Pradosha: checked the English translation of *Skanda Purana*, Brahmottara-khanda, chapter 7, verses 2 and 71: https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc423670.html . The three-ghati reference at verse 2 is a pre-sunset bath instruction; it does not settle a two- versus three-ghati post-sunset Pradoṣa duration. That distinction is now explicitly recorded.
- Ashunya Shayana: cross-checked public Hindi Bhavishya Purana chapter “Phala-Dvitiya (Ashunyashayana Vrat)” and Matsya Purana chapter 71; both identify the Shravan Krishna Dwitiya form. The full multi-month series in *Vrat-Parichay* is not independently confirmed by those passages and remains a potentially distinct textual prescription pending edition/source comparison.
- Bibliography: located a CiNii record for a 1969 fourth edition of *Vrat-Parichay* published by Gita Press: https://cir.nii.ac.jp/crid/2120307889746109824 . It is a candidate for comparison only; the user's OCR edition has not been identified.
- Updated `vrat-parichay-source-evidence-draft.md`. Runtime code, `festivals.json`, article URLs, and live Blogger output remain untouched.


- Additional Pradosha cross-check: Drik Panchang's 2026 methodology says date selection is Trayodashi overlapping local post-sunset Pradosh Kaal and notes city-based differences: https://www.drikpanchang.com/vrats/pradoshdates.html . This corroborates a current calendar convention only; it does not settle the textual two-ghati/three-ghati ritual-duration difference. Updated the evidence ledger to keep date predicate, puja window, and ghati definition separate.


## Vrat-Parichay edition comparison access check — 2026-10-14
- Located a CiNii bibliographic record for a candidate 1969 fourth edition of *Vrat-Parichay*, published by Gita Press and described as Hindi with Sanskrit quotations: https://cir.nii.ac.jp/crid/2120307889746109824 .
- Attempted to open the linked TUFS repository record and likely PDF/Handle endpoints. The web reader showed JavaScript/anti-bot verification for CiNii and HTTP 429 for the TUFS record; no PDF URL or page images were verified in this pass. This is a retrieval-route limitation, not proof that the file is unavailable publicly.
- Added `data/references/vrat-parichay-edition-comparison-status-draft.md` with the bibliographic metadata, exact access obstacle, safe browser-based retrieval route, and pages/sections to compare if the file is obtained.
- The 1969 edition remains a comparison candidate only; the user's OCR edition is still unidentified. No claims of page-image verification were added, and no executable rules, `festivals.json`, runtime code, or Blogger output were changed.


### Vrat-Parichay edition search — additional discovery leads (2026-10-14)
- Broader search surfaced secondary hosting pages titled *Vrat Parichay* on Scribd (viewer reports 203 pages) and a Dokumen.pub listing. These are leads only; neither has been identified as the user's OCR edition or as the 1969 fourth edition. No text from them was used to settle a rule.
- CiNii metadata still identifies a 1969 fourth-edition Gita Press PDF at TUFS, but the current web retrieval route hit access/rate-limit errors and no verified direct PDF URL or page images were obtained.
- Updated `data/references/vrat-parichay-edition-comparison-status-draft.md` with provenance cautions and a four-point comparison gate: title/imprint, printed-page-to-image mapping, distinctive passage identity, and page-image transcription.
- No changes to runtime code, `data/festivals.json`, legacy dates, or Blogger output. Keep PR #33 Draft/unmerged. Executable vrata-date rules remain blocked pending source/page verification.


### User-provided Internet Archive copies — source breakthrough (2026-10-14)
- User pointed out `https://archive.org/details/610-vrat-parichay` and `https://archive.org/details/vrata-parichaya`. The latter opens and exposes PDF download plus full OCR transcript: https://archive.org/stream/vrata-parichaya/Vrata%20Parichaya_djvu.txt . The former returned DisabledError in this web-reader pass and needs separate inspection.
- Archive OCR front matter identifies this accessible copy as संवत् २०७०, चौबीसवाँ पुनर्मुद्रण, पं० हनूमान शर्मा, गीताप्रेस गोरखपुर. Do not call it the 1969 fourth edition; editions are distinct.
- Text-level checks: Vata Savitri passage explicitly records both Purnima and Amavasya traditions and says Amavasya is common in the author's region; Ashunya Shayana passage specifies Shravan Krishna Dwitiya through Margashirsha Krishna Dwitiya, pūrvaviddhā selection, and a paraviddhā tie-break if both/neither days are pūrvaviddhā. Archive OCR TOC also locates priority topics, but OCR page digits require image checking.
- Updated `data/references/vrat-parichay-edition-comparison-status-draft.md`. Next: compare priority passages against page images and the user's OCR chunks, and separately inspect the second IA item for edition differences.
- No runtime code, `data/festivals.json`, legacy dates, or Blogger output changed. PR #33 remains Draft/unmerged.


### Clear 1956 Vrat-Parichay scan lead supplied by user (2026-10-14)
- User supplied https://archive.org/details/fkvt_vrat-parichay-by-pandit-hanuman-sharma-hindi-hindu-rituals-1956-gorakhpur-gita-press and describes it as a clean, clear copy. The Archive.org page could not be opened by the current web reader (`DisabledError`), so its file list, imprint page, OCR, and scans are not yet independently verified.
- Treat 1956 as a metadata/title claim pending inspection of the actual imprint. Do not conflate this candidate with the संवत् २०७०, चौबीसवाँ पुनर्मुद्रण copy at `https://archive.org/details/vrata-parichaya`.
- Added the lead and verification checklist to `data/references/vrat-parichay-edition-comparison-status-draft.md`. Priority next step: inspect metadata/file identifiers and title/imprint page, then map printed pages to scan indices and compare key vrata passages.
- No runtime code, `data/festivals.json`, legacy dates, or Blogger output changed. PR #33 remains Draft/unmerged.


### TransLiteral source added (2026-10-14)
- User supplied https://www.transliteral.org/pages/i071211194552/view. Inspected the index and opened linked pages: `व्रत परिचय तथा नियम`, `मासिक व्रत परिचय`, `धर्मशास्त्रानुसार विशेष बातें`, plus Dharmasindhu's Smarta and Vaishnava vrata-day decision pages, Ekadashi decision, Purnima/Amavasya decision, and concise vrata-day decision.
- The index is a discovery map, not a single primary source. The general rules page includes vrata classifications and a general two-ghati-after-sunset Pradosha statement; keep this distinct from specific vrata-date selection rules.
- Added `data/references/transliteral-vrat-source-audit-draft.md` with links, initial observations, and source-verification workflow. Preserve Smarta/Vaishnava separation; do not equate general Vaishnava with ISKCON/GCAL.
- Research notes only; no runtime code, `data/festivals.json`, legacy dates, or Blogger output changed. PR #33 remains Draft/unmerged.


### Monthly vrata index follow-up (2026-10-14)
- Reopened the user's TransLiteral monthly index https://www.transliteral.org/pages/i090114020125/view. It links all 12 lunar months, with separate Krishna-paksha and Shukla-paksha sub-indexes for each month. Opened Chaitra, Vaishakha, Jyeshtha, Shravan and Kartik month index pages; these are mainly navigation indexes leading to the paksha sub-indexes rather than the full vrat rules themselves.
- The index last-updated date is January 22, 2014, so do not assume completeness. Continue down both paksha branches for each month and inspect individual observance pages, then compare against `festivals.json` and Vrat-Parichay.
- Updated `data/references/transliteral-vrat-source-audit-draft.md`. No runtime code or festival data changed; PR #33 remains Draft/unmerged.


### Complete TransLiteral monthly paksha URL register (2026-10-14)
- Completed the 24-link register for Krishna/Shukla paksha indexes across all 12 lunar months. The four missing month pairs were obtained from the monthly index: Margashirsha https://www.transliteral.org/pages/i090122034921/view and https://www.transliteral.org/pages/i090122040402/view; Pausha https://www.transliteral.org/pages/i020101012608/view and https://www.transliteral.org/pages/i020101013209/view; Magha https://www.transliteral.org/pages/i020101014607/view and https://www.transliteral.org/pages/i020101015847/view; Phalguna https://www.transliteral.org/pages/i020101051909/view and https://www.transliteral.org/pages/i020101054305/view.
- Added the complete 24-link table and first-pass name inventory for selected opened indexes to data/references/transliteral-vrat-source-audit-draft.md. The audit flags duplicate titles and a possible month-label/cross-link anomaly on the Margashirsha Shukla index; those entries must not be assigned to a month without checking the child page.
- This is a discovery inventory, not a final missing-festival list. Next: extract all remaining paksha headings, open candidate child pages for actual rules, then compare normalized names with the 122 existing festival records and the Vrat-Parichay audit. No runtime code, data/festivals.json, legacy dates, or Blogger output changed. PR #33 remains Draft/unmerged.


### TransLiteral first-pass rule evidence and gap comparison (2026-10-14)
- Opened the full set of 24 month/paksha index pages and followed priority child pages for Sankashti Chaturthi, Sheetala Ashtami, Santan Ashtami, Varuni Yoga, Vata Savitri, Skanda Shashthi, Bhairava Jayanti, Rukmini Ashtami and Mas Shivaratri.
- Added a source-backed shortlist and preliminary comparison against the current 122 records to `data/references/transliteral-vrat-source-audit-draft.md`.
- Strong candidates for further review: recurring monthly Sankashti Chaturthi, Masik Shivaratri, Pradosha vrata, monthly Ekadashi rule profiles, Vata Savitri (Purnima and Amavasya traditions kept distinct), Sheetala Ashtami, Santan Ashtami, Varuni Yoga, Rukmini Ashtami and possibly Skanda Shashthi. These are candidates only, not approved additions.
- Important evidence: TransLiteral's Sankashti page labels its account Bhavishya Purana and states Krishna Chaturthi across months with Chandrodaya-vyapini selection; its Mas Shivaratri page labels the account Madanaratna and describes monthly Krishna Chaturdashi; Vata Savitri page explicitly preserves Purnima and Amavasya traditions and names different authorities; Sheetala Ashtami page labels its account Skanda Purana and distinguishes common Chaitra Krishna Ashtami from a Chaitra–Ashadha four-month observance; Santan Ashtami page labels Vishnudharmottara; Varuni Yoga page names Vachaspati-nibandha and quotes Tristhalisetu. Each page footer nevertheless says “References: N/A”, so primary-edition verification remains required.
- Matched likely overlaps to existing records (e.g. Rama Navami, Akshaya Tritiya, Ratha Yatra, Harishayani Ekadashi, Nag Panchami, Rishi Panchami, Radhashtami, Sharad Purnima/Kojagari, Govardhan Puja, Yamadvitiya, Bhairava Jayanti) and flagged aliases/duplicates. Explicitly do not equate Skanda Shashthi with Skandamata; Mahashivaratri does not cover Masik Shivaratri; named Ekadashis do not cover all monthly Ekadashis; and the Vata Savitri traditions must not be collapsed into one date.
- TransLiteral declares CC BY-NC-SA 4.0; use concise paraphrase and source links, and check license/attribution before reusing any text. No runtime code, `data/festivals.json`, legacy dates, or Blogger output changed. PR #33 remains Draft/unmerged.


### TransLiteral follow-up: prioritized rule-verification queue (2026-10-14)
- Added a prioritized implementation-readiness queue to `data/references/transliteral-vrat-source-audit-draft.md`. P0 families: separate Smarta/Vaishnava Ekadashi profiles, Pradosha date selection vs puja window, monthly Sankashti Chaturthi using local moonrise, and Masik Shivaratri vs annual Maha Shivaratri.
- P1/P2 queue includes distinct Vata Savitri Purnima/Amavasya traditions, Sheetala Saptami vs Ashtami, Santan Ashtami, Varuni Yoga conjunctions, Rukmini Ashtami, Skanda Shashthi, Ashunya Shayana, Mangala Gauri, Nirjala Ekadashi, Adhimas/Purushottama Maas and Magha-snana.
- Added targeted evidence links for the TransLiteral Magha-snana page and Nirnayasindhu Shivaratri decision chapter. The latter records disagreement between authorities about Pradosha- and Nishitha-vyapini selection, so a generic “monthly Krishna Chaturdashi” predicate is insufficient.
- Defined a safe implementation gate: source/edition evidence, alias matching against 122 legacy records, explicit date-selection predicate and tie-breaks, worked local-time example + regression test, preservation of legacy text/links, and explicit approval before runtime/live changes.
- This is documentation-only. `data/festivals.json`, its 122 legacy records, dates, runtime code, and Blogger output remain unchanged; PR #33 remains Draft/unmerged.


### Legacy JSON candidate cross-check (2026-10-14)
- Parsed `data/festivals.json` (122 records) and performed a title/description substring triage for the prioritized TransLiteral candidates.
- No direct candidate-name hit found for Sankashti Chaturthi, Sheetala, Santan Ashtami, Varuni Yoga, Rukmini Ashtami, Skanda Shashthi, Ashunya Shayana, Mangala Gauri, Nirjala Ekadashi, Purushottama Maas or Magha-snana. These remain candidate gaps, not approved additions; generic/alias entries still need manual review.
- Masik Shivaratri has only an annual Mahashivaratri title match; Pradosha appears only as incidental description substrings; existing named Ekadashi records do not constitute a complete monthly decision profile.
- Vata Savitri only substring-matches an incidental mention inside the Shani Jayanti description, not a dedicated record. Two records (`festival-049`, `festival-074`) are both titled मासिक कालाष्टमी and require a separate duplicate review.
- Updated the TransLiteral audit with the cross-check table. No data or runtime changes were made; 122 legacy records and their source text remain untouched, and PR #33 remains Draft/unmerged.


### Added Wikisource Sanskrit-text layer (2026-10-14)
- User requested using additional Sanskrit texts available on Wikisource. Added a structured source-lead table to the TransLiteral audit for Angirasa Smriti (Chaturthi decision / Chandrodaya-vyapini Sankashti), Viramitrodaya-Samayaprakasha (Ekadashi kshaya and vrata decision), Paramapurusha Samhita chapter 10, Vaikhanasa Grihya Sutra scan pages, Skanda Purana Ambikakhanda chapters, Skanda Purana Kartika-mahatmya cross-reference note, and Narada Samhita.
- Added a source hierarchy separating vrata-day decision texts, observance/narrative texts, secondary discovery indexes, and independent astronomy/calendar computation.
- Important limitation: Wikisource pages may be unproofread or OCR-derived; every claim needs work/chapter/verse or scan-page metadata and a contextual check. A Purana's vrata-mahatmya passage does not alone define the calendar date-selection algorithm.
- No runtime rules or festival records were changed. The 122-record `data/festivals.json` remains unchanged; PR #33 remains Draft/unmerged.
