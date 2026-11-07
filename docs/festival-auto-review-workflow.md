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

The workflow now has two deliberately separate layers:

1. `festival-detector.mjs` discovers candidate civil dates by matching the catalogued tithi, paksha and lunar month against the annual scan's sunrise and noon Panchang observations. It supports Hindi/English aliases, distinguishes Adhika month from the regular month, reports missing metadata, flags a recorded date that does not match the scan, and preserves multiple matching days instead of guessing.
2. `festival-auto-review.mjs` remains a separate evidence gate. It can classify a record only when a reviewed, versioned observance rule and all calculation/independent-check evidence are supplied.

The detector is intentionally not a final vrata-date decider. A tithi match is only a candidate: Ekadashi, Pradosh, Shivaratri, Janmashtami, Chaturthi, Jayanti, regional observances and multi-day festivals can require different decision moments or source-specific rules. If two sunrise days match, if the paksha/month is missing, or if the stored date disagrees, the tool must surface that fact and leave the decision for review. It must never turn a candidate into an approved date by itself.

The annual review page now uses the detector when a catalog record is selected. The live monthly page remains static-JSON-first; no visitor-side annual scan or automatic publication has been added. Existing 2026–2030 dates are not automatically changed by this detector.

## Observance-specific candidate profiles (PR #283 follow-up)

`festival-observance-rules.mjs` adds explicit, versioned calculation profiles for five recurring observance families:

- Pradosh: Trayodashi overlap with the first fifth of the local night after sunset.
- Sankashti: Krishna Chaturthi active at local moonrise.
- Masik Shivaratri and Mahashivaratri: separate Krishna Chaturdashi/Nishita profiles, so their labels and review records are not conflated.
- Vinayaka Chaturthi: Shukla Chaturthi overlap with the local Madhyahna interval.

These windows mirror calculation patterns already exercised by the repository's Pithoragarh Panchang tests and muhurta code. They are not a claim that a primary Dharmashastra source has been reviewed. Each profile explicitly reports `pending-primary-source-review`; results remain candidate evidence, always return `finalDate: null` and `autoApproved: false`. Missing decision windows and unknown profiles fail closed; when the engine supplies an index-coded tithi, its index carries paksha, while an explicitly conflicting paksha is rejected.

Ekadashi, Janmashtami, Navratri/Jayanti and other complex observances are deliberately not mapped to generic profiles. They need separately reviewed Smarta rules, including relevant vedha, Arunodaya, Nishita, Rohini, regional and exception handling. No live festival JSON or Blogger output is modified by these profiles.
