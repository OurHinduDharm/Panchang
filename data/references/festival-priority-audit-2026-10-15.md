# Festival and Vrat Work Queue — 2026-10-15

**Branch:** `data/festival-json-foundation`  
**Purpose:** Prioritize useful festival work so a single disputed rule does not block the wider Panchang project.  
**Status:** Draft data updated; no live Blogger output changed. Candidate dates remain `needs-review` until local tithi/rule verification.

## Snapshot of the current migration

- `data/festivals.json` contains 122 migrated legacy entries.
- All 122 entries currently have `verificationStatus: "needs-review"`.
- The file explicitly says legacy dates were copied as-is and must not be treated as verified.
- Several entries still carry 2025 dates while the active calendar year in this work is 2026; some compound entries combine more than one festival; some date/title pairs disagree.
- `data/vrat-parichay.txt` is present as a 581,028-character OCR transcription, split into 50 readable chunks. Its table of contents lists many vrata and utsava topics that can be used to find omissions.

## Priority A — finish the live-season audit first

1. **Sharadiya Navaratri, Ashtami/Navami, Vijayadashami (festival-003 to festival-012).**
   - Reconcile the legacy title/date mismatches and duplicated or overlapping Ashtami/Navami entries.
   - Preserve distinct observance conventions rather than forcing one date into every tradition.
   - Confirm the target location and the actual tithi intervals before setting a final date or puja window.
   - The public calendar references currently disagree on the Ashtami/Navami observance mapping; therefore use them as comparison evidence, not as a substitute for the project's tithi calculation and the relevant dharma-nibandha rule.
2. **Sharad Purnima / Kojagari (festival-013).**
   - Check the local full-moon night and the relevant regional observance convention.
3. **Karwa Chauth (festival-015).**
   - Verify Krishna Chaturthi and the local moonrise/puja convention.
4. **Dhanteras through Bhai Dooj (festival-018 to festival-023).**
   - Replace stale legacy year values only after verifying the applicable 2026 tithi and observance rules; do not simply shift the old dates forward.
5. Keep all of the above in the draft data/research track until the date and rule have a reproducible basis.

## Priority B — recurring rule families with high reuse value

After the live-season audit, implement/validate one rule family at a time and then apply it to all matching entries:

- Ekadashi: Dashami-vedha, Harivasara, local sunrise, Smarta/Vaishnava distinction, parana.
- Monthly Chaturthi: paksha/month identity, moonrise and local observance.
- Pradosha: Trayodashi and local sunset/pradosha window.
- Purnima/Amavasya: lunar-month naming convention and any night/day-specific rule.
- Sankranti: exact solar ingress and applicable local punya-kala convention.
- Navaratri: Ghatasthapana, daily Devi sequence, Ashtami/Navami, parana/kalasha visarjana as separate decisions.

A rule-family implementation should not be inferred from a festival title alone. Record the named source and the chosen observance profile.

## Priority C — mine Vrat Parichay for omissions

Use the book's table of contents and chapter text in numeric chunk order to produce a **candidate-only** list of vrata/utsava names. For each candidate, record:
- book/chapter/page reference when readable;
- month and paksha;
- the rule or observance identity stated in the book;
- whether it already exists in `data/festivals.json`;
- whether it is a recurring calendar event, a special yoga, a vrata method, or explanatory material.

Do not auto-create production festival entries from OCR alone. Resolve OCR ambiguities against the page image or reviewed source when needed.

## Work policy to avoid getting stuck

- Keep the Śravaṇa-Dvādaśī source audit running separately; it must not block unrelated festival work.
- If a sub-rule remains disputed, record it as unresolved and continue with independently supported tasks.
- Never average different Panchang timings or silently overwrite a discrepancy.
- Promote an entry from `needs-review` only when its source, rule, date calculation, and observance convention are documented.
- Keep `app.js`, the production festival data, and Blogger output untouched until the draft is reviewed and tests pass.

## Public comparison references reviewed for the current Navaratri queue

- Drik Panchang, Delhi 2026 Navaratri calendar: https://www.drikpanchang.com/navratri/ashwin-shardiya-navratri-dates.html?geoname-id=1273294&year=2026
- AstroSage, 2026 Sharad Navratri calendar: https://panchang.astrosage.com/festival/navratri/sharad-navratri?language=en
- Times of India, Navratri 2026 start/end report: https://timesofindia.indiatimes.com/religion/festivals/navratri-2026-start-end-date-is-ghatasthapana-on-october-10-or-11-check-the-full-tithi-schedule/articleshow/134767429.cms

These sources do not agree on every day label/observance mapping. Their role here is to flag the question for local calculation and rule review, not to declare a final shastric result.


## Newly identified conflict — Govardhan Puja (festival-022)

**Do not mark 10 November 2026 as universally verified.** The reviewed comparison sources disagree:

- IMD Rashtriya Panchanga lists Govardhan Puja on **9 November 2026**.
- Drik Panchang's Delhi calendar and AstroSage's New Delhi calendar list **10 November 2026**; other city calendars can differ.
- This is an observance-rule question, not a reason to arbitrarily choose the majority date. The project's decision needs the Pithoragarh local tithi interval (Kartika Shukla Pratipada), sunrise/sunset context, and a documented Govardhan/Annakut rule.
- Until that is calculated and reviewed, keep `festival-022` at `verificationStatus: "needs-review"`; 10 November is only a comparison candidate.

The data-guardrail test now asserts that the record remains unresolved and retains this warning. It does **not** validate the astronomical interval itself.

## Immediate next action

Create a compact, source-backed review table for Priority A with one row per festival, separating:
1. legacy title/date,
2. calculated local tithi interval,
3. observance rule/profile,
4. independent comparison,
5. decision/status.

Start with Navaratri/Ashtami/Navami/Vijayadashami; continue to Sharad Purnima and the Diwali sequence without waiting for Śravaṇa-Dvādaśī to be fully settled.


## Draft changes now made

- Updated the provisional observance dates for festival-009 to festival-013 and festival-020 to festival-023 in `data/festivals.json`.
- User clarification supersedes the earlier title edit: the “18 October” note in festival-009 is intentional because the tithi spans 17–18 October in the user's paper Panchang/references. The display title has been restored to preserve that note; exact tithi instants and observance decision remain unverified.
- Moved Navami's provisional observance date to 20 October while documenting the 19 October regional alternative instead of pretending all calendars agree.
- Set the current candidate dates for Naraka Chaturdashi and Diwali both to 8 November, Govardhan Puja to 10 November, and Bhai Dooj to 11 November.
- Replaced legacy Dhanteras, Sandhi Puja, and Diwali clock-time strings in the draft display descriptions with warnings that 2026 timings must be recalculated. Original source text is retained.
- Added `tests/festival-season-2026.test.js` and wired it into the GitHub Actions workflow.
- These are still **draft candidates**, not a claim that every local observance is fully verified. The test suite checks data consistency and stale-muhurta guardrails; it does not itself calculate tithis.


## Muhurta feature implementation update

- Added `festival-muhurta-rules.js`, a browser-global/CommonJS-compatible helper for intersecting local astronomical intervals and generating candidate windows for Ghatasthapana, Sharad Purnima moonlight/kheer, Ekadashi parana, and Pradosh/Vrishabha/Nishita puja windows.
- Added `tests/festival-muhurta-rules.test.js` covering first-third-of-day Ghatasthapana, Abhijit fallback, missing inputs, moonlight/tithi overlap, tradition-constrained parana, and puja-window intersections.
- Added structured `muhurtaPlan` metadata to festival records 003, 013, 016, 018, and 021.
- Removed the manually copied Delhi Ghatasthapana clock ranges from the current displayed draft description. The source text remains preserved as provenance.
- Added guardrails that keep these plans marked `needs-calculation`. The helper combines supplied intervals; it does **not** calculate sunrise, moonrise, tithi, lagna, or muhurta astronomy itself.
- **Not live yet:** no Blogger renderer currently consumes these `muhurtaPlan` fields, and no city-specific computed times have been certified. The next integration task is to connect the helper to the actual Blogger festival display and supply verified intervals from the Panchang calculation engine. Until then, the draft must not claim these times are calculated or verified.
- GitHub Actions result is still unavailable from the connected status/run queries; test success is not asserted.


## Widget audit follow-up (2026-10-15)

- Renderer now uses a strict 14-calendar-date window (today through day 13), not today plus 14 additional days.
- Invalid rollover dates such as 31 February are rejected rather than normalized by JavaScript.
- Navaratri's parent event keeps its full period, while individual daily observance records no longer inherit the parent end date. Festival-009 preserves the intentional 18 October title note and has a provisional 17–18 October civil-date span; exact tithi instants remain pending.
- JSON rendering now preserves legacy-style status labels (today/tomorrow/days remaining/ongoing status) and duration labels where the source did not hide the period.
- The renderer has behavioral tests for the 14-day boundary, ongoing events, expired daily events, invalid dates, safe URL schemes, and title-only placeholders. Check the latest GitHub Actions result before treating these changes as validated.
