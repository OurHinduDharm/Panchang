# Festival data migration

This folder is the isolated starting point for moving the existing OurHinduDharm Blogger `festivalData` into structured JSON.

## Files

- `festivals.json` — 130 legacy-migrated/added festival records with provisional date candidates and structured related-article links for selected major festivals.
- `festival-schema.json` — draft shape for the migrated records.
- `festival-overrides.json` — year-specific, reference-only exception records. Current entries do not affect rendering because `policy.autoApply` is `false` and the renderer has not been wired to this file.
- `festival-overrides.schema.json` — schema for override records and their evidence/status.
- `festival-date-resolver.js` — pure draft resolver for local-Panchang tithi matches, inclusive tithi windows, ephemeris-supplied solar events, source-only suppression, and strictly approved overrides. It is not wired to the Blogger renderer.
- `festival-muhurta-rules.js` / `festival-muhurta-engine.js` — interval rules and injected-Panchang adapters for Ghatasthapana, Sharad Purnima moonlight-kheer timing, tradition-rule-constrained Ekadashi parana, and supplied local puja windows. Candidate times are not final muhurta until the required source/profile is validated.

## Migration rules

1. Copy every existing festival entry from Blogger before adding calculation logic.
2. Preserve the original Hindi names, descriptions, article URLs, duration text, status text, special muhurat details, and existing dates.
3. Do not silently correct, remove, or merge entries during migration. Record possible duplicates or date conflicts for review.
4. Keep the original date as legacy data until its date rule is independently checked.
5. Later, classify date logic as tithi-based, solar, astronomical, event/duration-based, or fixed/manual. Add tradition-specific rules where needed.
6. Do not connect this draft JSON to the live Panchang UI until the migrated data and date rules have been reviewed and tested.

## Current status

**Draft migration in progress.** The 122 legacy IDs remain in `festivals.json`; `sourceText` preserves legacy names, descriptions, dates, end dates and status text for audit. Records now use explicit review states (`needs-review`, `owner-reference-checked`, `superseded`) as appropriate. Owner-checked dates do not certify every tithi boundary or muhurta. The JSON-backed widget and new resolver remain isolated on the draft branch and must not be connected to live Blogger until data/rules are reviewed, tests pass, and the owner explicitly approves.


## Navratri sadhana links (draft rule)

When any one of the four principal Navratri period records is active — Ashwin, Chaitra, Magha Gupt or Ashadha Gupt — the JSON widget renders a separate sadhana section with the complete Pratipada-to-Navami article links together, plus a separately labeled Dashami immersion link. This intentionally keeps earlier-day sadhana articles available when someone falls one or two days behind. The rule only controls link visibility; it does not prescribe a catch-up ritual, decide observance dates, or modify the Panchang page's independent "today's festival" logic. The dates in the four period records must be maintained/verified for each year before the display rule can activate reliably.


## Pitri Paksha article links (draft rule)

While either configured Pitri Paksha boundary record is active, the widget shows the two shared reference links together: **महालय श्राद्धों का महत्व** and **तर्पण विधि**. The active range includes Pratipada through Pitri Visarjani Amavasya, inclusive. Existing article URLs from the archived Blogger source are reused; no new URLs are invented. The rule only controls visibility and does not determine individual shraddha dates or ritual timings. The start/end records must be verified and maintained each year.

## Festival period review ledger

See [the period and article-visibility audit](references/festival-period-and-link-visibility-audit-2026-10-15.md) for the organized review list of multi-day records, possible date/text discrepancies, candidate month-long article cards, and release guardrails.

**Owner-confirmed Chaturmas display decision:** `festival-101` intentionally spans 2026-07-25 through 2026-07-30 inclusive. The Harishayani Ekadashi article offers the sankalpa on July 25; the card remains available through Purnima for users who missed that day. This is an editorial visibility window, not the full four-month duration of Chaturmas. The archived description's “29 July” wording is retained and flagged for separate copy/date review. A regression test protects the configured span.


## Festival override policy (new, draft only)

The printed **Ganesh Martand Panchang** is the owner's primary comparison reference. Drik Panchang is a secondary cross-check when it agrees; a disagreement must not be automatically resolved in Drik's favor. When the owner finds a mismatch, record the festival ID, year, printed date, source/page if available, reason, and review status in `festival-overrides.json`. Keep the calculated date visible in the audit trail.

The current override entries are **reference-only**. They do not change festival display until a resolver is implemented, schema/data validation and regression tests pass, and an entry's status is explicitly changed to `approved-for-application`. Unmapped records must be resolved against the catalog before creating new display cards, to prevent duplicates. Keep PR #33 Draft and do not merge or change live Blogger without explicit approval.


## 2026-10-15 reference-record update

- The catalog now contains 130 records: the 122 original legacy IDs are retained, with additional explicit records added during this draft series.
- `festival-128` Papankusha Ekadashi (22 Oct 2026) and `festival-129` Pradosha (23 Oct 2026) carry owner-reported Ganesh Martand dates, but use `renderMode: manual` until tradition-aware Ekadashi/Pradosha date logic is ready.
- `festival-130` Ashwini Purnima (26 Oct 2026) is recorded separately as requested, but remains `needs-review` because its calendrical distinction from Sharad/Kojaagari Purnima needs clarification.
- `festival-011` Mahanavami displays only on 19 Oct 2026. The legacy `sourceText.endDate` of 20 Oct is preserved for provenance, not used as a second display day.
- The schema now accepts the catalog's actual workflow statuses (`owner-reference-checked` and `superseded`) in addition to `needs-review`.


## Resolver and automated checks

- `tests/festival-date-resolver.test.js` covers tithi normalization, multiple observance traditions, inclusive tithi windows, solar ingress/egress boundaries, year scoping, and override approval gates.
- `.github/workflows/festival-draft-tests.yml` runs the catalog, widget, muhurta, and resolver regression tests on the draft branch and pull requests.
- The resolver deliberately consumes externally calculated Panchang days and solar-event instants. It does not independently calculate astronomy, choose a vrata date for Ekadashi/Pradosha, or replace a temple reopening notice with an astronomical boundary.
- The resolver remains a tested foundation only. The review HTML form/dashboard and live Blogger integration are deferred until the festival engine and seasonal data pass review.


## Muhrta adapter coverage

- The injected adapter has regression tests for local moonrise/Purnima intersection, Dvadashi parana constrained by a supplied tradition rule, and puja-window intersections using caller-supplied local intervals.
- It deliberately does not guess a universal Pradosha duration, synthesize a Parana rule, or treat a solar boundary as a temple reopening time. If required inputs are missing, it returns an unavailable/review status instead of inventing a time.
