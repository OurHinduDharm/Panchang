# Festival auto-review workflow

This is an isolated review aid. It does not change the live Blogger page, the monthly calendar data, festival dates, or the existing muhurta engine.

## Three outcomes

- `auto-approved`: only for a routine observance with a reviewed, versioned rule; completed Panchang calculation; passing calculation tests; matching expected/computed tithi and date; no known conflict or exception; and a passing independent check.
- `needs-review`: default for missing evidence, unknown rules, date/tithi mismatch, known conflicts, exceptions, or failed checks.
- `manual-review`: explicitly disputed or tradition-dependent rules that require a human decision.
- `manual-confirmed`: a decision already confirmed by the user's hard-copy Panchang. This is not silently overwritten by automation.

## Safety boundaries

1. A festival title or old date alone is never sufficient to auto-approve.
2. Passing unit tests proves the code behaves as designed; it does not by itself prove the shastriya rule or the astronomical date.
3. Dates must be calculated afresh for each year. Do not copy a prior year's civil date as the next year's answer.
4. When local tithi spans, Smarta/Vaishnava choices, Dashami-vedha, Mahadvadashi, or a regional convention can change observance, send it to manual review until the relevant rule is documented and validated.
5. Preserve event descriptions and article URLs during review. Review metadata must not contain public source citations or private notes.
6. Keep muhurta calculation separate. This review gate must not alter existing muhurta rules, times, or rendering.
7. The monthly page should continue to render static JSON first. Any batch calculation belongs in CI/build-time tooling, not in the visitor's initial page load.

## Current implementation status

The pure classifier and tests are the first safe layer. They require the future calculation adapter to supply explicit evidence and a reviewed rule profile. They do not yet recalculate festival dates or auto-approve the existing 2026–2028 data. Until the adapter and rule registry are implemented and checked against the user's approved hard-copy decisions, current candidate dates remain provisional.
