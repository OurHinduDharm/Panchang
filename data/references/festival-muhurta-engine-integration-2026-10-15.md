# Festival muhurta engine integration notes — 15 October 2026

## Purpose

Replace copied, city-specific festival clock times with calculations from the OurHinduDharm Panchang engine for the selected place. The immediate target is Ghatasthapana; the same design can later support Ekadashi parana, Sharad Purnima moonlight, Dhanteras and Diwali puja windows.

## Code added on `data/festival-json-foundation`

- `festival-muhurta-rules.js`: interval intersections and festival rule profiles. It does not calculate astronomy.
- `festival-muhurta-engine.js`: dependency-injected adapter that asks the pinned `@ishubhamx/panchangam-js@3.0.0` engine for a location-specific Panchang snapshot and passes the local sunrise/sunset, Pratipada, Chitra and Vaidhriti intervals into the rule helper.
- `tests/festival-muhurta-engine.test.js`: tests the location handoff, local-noon query, daylight-third boundary and missing-Pratipada fail-closed behaviour.
- `tests/festival-muhurta-rules.test.js`: isolated interval-rule tests.
- `data/festivals.json` and `data/festivalData-source.txt`: the copied Delhi Ghatasthapana clock range has been removed from visible/source-snapshot descriptions; source history remains available in JSON provenance fields.

## Calculation profile

1. Query the Panchang engine at local noon for the requested civil date and timezone offset.
2. Use that location's calculated sunrise and sunset.
3. Select the local Pratipada interval (tithi index 0) that overlaps daylight.
4. Primary candidate: intersection of daylight, Pratipada and the first third of daytime.
5. Fallback candidate: intersection of daylight, Pratipada and the eighth of fifteen daytime muhurtas (Abhijit).
6. Report Chitra/Vaidhriti overlap as a review warning, not as a blanket prohibition. Do not invent a time if required inputs are absent.

## Important limitations — not yet production/live

- The complete GitHub Actions interval-regression workflow passed for code commit `c73ee3629f38779f9f65026a32a16ce2e486727e` (the subsequent change was documentation-only).
- The real-library diagnostic confirms `p.tithis`, `p.nakshatras`, `p.yogas`, and `p.abhijitMuhurta` provide the expected interval fields. For 11 October 2026 at the project Pithoragarh reference coordinates, the adapter emits a **diagnostic candidate** of approximately 06:07–10:28 IST and warns that both Chitra and Vaidhriti overlap that window. This is not a published/approved muhurta; independent local-time comparison is still required.
- The adapter is not yet connected to the Blogger festival-card renderer or the live Panchang page. Updating this repository does not by itself update the Blogger template.
- Do not publish a calculated Ghatasthapana time until the real-library diagnostic is inspected and the result is cross-checked against at least one independent Panchang for the same city/date.
- A city-level coordinate/elevation source and a clear UI for selecting location are required. Never silently reuse Pithoragarh or Delhi for another visitor.

## Verification status

`needs-calculation` / `needs-review`. This document describes implementation progress, not a claim of verified religious timings.
