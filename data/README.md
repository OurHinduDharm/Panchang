# Festival data migration

This folder is the isolated starting point for moving the existing OurHinduDharm Blogger `festivalData` into structured JSON.

## Files

- `festivals.json` — 122 migrated legacy festival records with provisional 2026 date candidates and structured related-article links for selected major festivals.
- `festival-schema.json` — draft shape for the migrated records.

## Migration rules

1. Copy every existing festival entry from Blogger before adding calculation logic.
2. Preserve the original Hindi names, descriptions, article URLs, duration text, status text, special muhurat details, and existing dates.
3. Do not silently correct, remove, or merge entries during migration. Record possible duplicates or date conflicts for review.
4. Keep the original date as legacy data until its date rule is independently checked.
5. Later, classify date logic as tithi-based, solar, astronomical, event/duration-based, or fixed/manual. Add tradition-specific rules where needed.
6. Do not connect this draft JSON to the live Panchang UI until the migrated data and date rules have been reviewed and tested.

## Current status

**Draft migration in progress.** All 122 legacy entries are retained in `festivals.json`; `sourceText` preserves legacy names, descriptions, dates, end dates and status text for audit. Date candidates and rules are not certified: entries remain `needs-review` until local tithi/astronomical calculations and observance conventions are documented. The JSON-backed widget is isolated on the draft branch and must not be connected to live Blogger until review, tests and explicit approval.


## Navratri sadhana links (draft rule)

When any one of the four principal Navratri period records is active — Ashwin, Chaitra, Magha Gupt or Ashadha Gupt — the JSON widget renders a separate sadhana section with the complete Pratipada-to-Navami article links together, plus a separately labeled Dashami immersion link. This intentionally keeps earlier-day sadhana articles available when someone falls one or two days behind. The rule only controls link visibility; it does not prescribe a catch-up ritual, decide observance dates, or modify the Panchang page's independent "today's festival" logic. The dates in the four period records must be maintained/verified for each year before the display rule can activate reliably.


## Pitri Paksha article links (draft rule)

While either configured Pitri Paksha boundary record is active, the widget shows the two shared reference links together: **महालय श्राद्धों का महत्व** and **तर्पण विधि**. The active range includes Pratipada through Pitri Visarjani Amavasya, inclusive. Existing article URLs from the archived Blogger source are reused; no new URLs are invented. The rule only controls visibility and does not determine individual shraddha dates or ritual timings. The start/end records must be verified and maintained each year.
