# Festival Widget UX & Visual Design Review

Review date: 2026-10-15
Repository: `OurHinduDharm/Panchang`
Working branch: `data/festival-json-foundation`
Status: review plan; preview-only until approved and tested.

## Goals
- Help readers find the right festival article without needing to search through unrelated cards.
- Keep date/observance information distinct from the period during which supporting articles are displayed.
- Keep mobile rendering readable, compact, accessible, and visually consistent with the existing Panchang.
- Preserve the legacy Blogger widget and its original source archive until the draft is validated.

## Current UI areas reviewed
- `festival-json-widget.js` renders the Navratri sadhana section and the Pitri Paksha article section before the upcoming-festival cards.
- `festival-preview.html` contains separate visual treatments: warm cream/ochre for Navratri and cool slate/blue for Pitri Paksha.
- Both sections use semantic section/list elements, and links can wrap long text. These are good foundations.
- The styles currently use different accent colours and border treatments for the two special sections. Keep the distinction meaningful, but avoid increasing visual weight until mobile preview has been checked on a real device.

## Design decisions
1. **Do not merge Chaturmas into the Navratri/Pitri Paksha link-display component.** Chaturmas is a separate card/rule with a specific user-confirmed reason for the 25–30 July window: the Harishayani Ekadashi article explains the sankalpa, and readers who could not take it on Ekadashi may do so by Purnima. Preserve this explanation and flag conflicting legacy wording for review rather than silently editing dates.
2. **Show Navratri day 1–9 links together during each configured Navratri period.** Keep Dashami/kalash immersion as a clearly separate item. Do not let the individual daily cards inherit the parent period's end date.
3. **Show the two configured Pitri Paksha help articles for the configured period, including the Amavasya end date.** Remove the section after the period; do not leave stale content in the container.
4. **Keep article display duration separate from observance dates.** A section may stay available for user convenience without claiming that the linked ritual is valid on every date in the display period.
5. **No made-up URLs.** If a related article is not written or its URL is not verified, display a plain-text topic placeholder and mark it for follow-up.
6. **No live integration from this branch yet.** Keep PR #33 Draft until data, logic, tests, and preview review are complete.

## Mobile and visual QA checklist
- At 320px, 360px, and  Android common widths: no horizontal overflow; long Hindi titles and URLs wrap cleanly.
- Card titles, dates, period notes, and links have a clear hierarchy; body text remains comfortably readable.
- Link targets have adequate tap spacing; focus/hover styles do not rely on colour alone.
- Special article sections are visually distinct from ordinary festival cards but do not dominate the page.
- Empty/upcoming-list states do not leave stale content or unexplained blank gaps.
- Validate light/dark surroundings where applicable and ensure text/background contrast remains strong.
- Check repeated rendering and date boundaries: first day, intermediate day, final day inclusive, and the first day after the period.
- Check the preview against the archived source before any production migration; the archive remains the traceable reference.

## Open questions / do not auto-correct
- Chaturmas legacy description says 29 July while the user confirmed the intended display window through Purnima, 30 July. Confirm the wording/source and then align the description if appropriate; do not change the rule silently.
- Records with multi-day spans may represent article visibility, a month, a festival sequence, a combined title, or an unverified legacy date. Review each record's intent before changing it.
- `festival-117` display intent is now owner-confirmed: Ganesh Chaturthi/Jayanti together on Bhadrapada Shukla Chaturthi, followed by a ten-tithi-day Ganesh Utsav period ending on Anant Chaturdashi (visarjan). Its Panchang-driven renderer is still pending; do not fall back to the old static Gregorian dates. `festival-087` (Gayatri Jayanti/associated period) and older Tulsi Vivah, Pausha, Shakambhari and Shravana records still require source-level review before date or display changes.

## Completion criteria before merge
- Automated tests pass on the latest PR head.
- JSON/schema references and source links validate.
- Preview is checked at narrow mobile width and desktop width.
- All intentional date/display rules have a reason recorded in project notes.
- User-approved decisions are reflected without changing unrelated Panchang, Muhurat, or Chaturmas behavior.
- PR stays Draft and Blogger remains untouched until these checks are complete.
