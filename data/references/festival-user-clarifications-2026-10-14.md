# User Clarifications — Festival Migration (2026-10-14)

These clarifications supersede the tentative interpretations in the mapping queue where noted. They do not by themselves certify astronomical dates or source texts.

## festival-009 — Sharadiya Navratri Saptami

User clarification: Ashwin Shukla Saptami falls across 17 and 18 October in the user's paper Panchang and other references for this year, so the title's 18 October note is intentional, not a typo.

Implementation consequence:
- Do not "correct" the title to remove 18 October or assume the row is erroneous.
- Preserve the fact that the tithi spans two civil dates. Store the tithi's start/end instants and a separate observance-date decision when available.
- For display, the user may want a note that Saptami is present on 17 and 18 October; the actual ritual observance date must be derived from the agreed rule/tradition and local Panchang inputs, not by blindly showing both days as the main festival.
- Check that the data model can represent a tithi interval crossing civil dates without confusing that interval with a festival period or puja time.

## festival-054 — Solar eclipse

User clarification: the 1970-01-01 date is a legacy placeholder because the user previously updated eclipse dates manually. The desired behaviour is to connect this display item to the existing `eclipse-panchang.js` module and show it when a public solar eclipse date is present in the module's India-facing results.

Implementation consequence:
- Do not store a fake recurring Gregorian date for the eclipse.
- First inspect the existing module's public API and data semantics. Reuse it; do not create a second eclipse calculator.
- Define eligibility for display from actual eclipse events/dates for India. Distinguish an eclipse occurring globally from one visible in India, and label visibility/sutak only where the existing module provides supported information.
- Test no-eclipse dates, multiple eclipses in a year, and future years. Avoid duplicate cards if the module already renders the event.
- This integration is a future implementation step after reviewing module API; no code has been changed by this clarification.

## festival-117 — Ganesh Jayanti / Ganesh Chaturthi

User clarification: Bhadrapada Shukla Chaturthi is the day referred to by the user as both Ganesh Chaturthi and Ganesh Jayanti. The title/description difference is not by itself evidence of a data error.

Implementation consequence:
- Keep the user-facing naming relationship rather than splitting the record automatically.
- Model the recurring date by Bhadrapada Shukla Chaturthi, with the appropriate observance rule (Madhyahna-vyapini Chaturthi should be evaluated as a candidate rule and independently checked against the user's intended Panchang convention).
- Preserve the existing article URL and source description. If sources distinguish a separate Magha Shukla Chaturthi Ganesh Jayanti, that is a different observance and must not be silently conflated; the current record's context is Bhadrapada Shukla Chaturthi.

## 2025 legacy dates

User clarification: dates were manually maintained in the old widget and are stale for future recurrence. They are expected to become automatically displayed from tithi-based rules once the new engine is implemented.

Implementation consequence:
- Keep 2025 values only as legacy provenance, not as recurring rules.
- Do not bulk-shift 2025 to 2026. Instead, map each record to its recurring rule (tithi/month/paksha, solar ingress, astronomical event, or reviewed manual exception).
- Preserve the original date in migration/audit metadata until the rule and current-year output are independently validated.

## Agreed next steps

1. Update the mapping queue to mark these three records as clarified, not erroneous.
2. Inspect `eclipse-panchang.js` and document its exact public API/data shape before planning integration.
3. Create a rule-mapping inventory for all 122 records. Start with straightforward tithi-based observances, while marking source-dependent exceptions for review.
4. Add tests/invariants before modifying runtime: all 122 legacy IDs and source text preserved; no `1970-01-01` eclipse date used as an event; no stale fixed Gregorian date used as a recurring rule; tithi intervals and observance date decisions remain distinct.
5. Keep PR #33 draft and do not change Blogger until preview and explicit approval.
