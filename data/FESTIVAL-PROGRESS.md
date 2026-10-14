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

