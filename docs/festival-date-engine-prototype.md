# City-specific festival-date engine — prototype

**Status: experimental; not wired into the public monthly page or live Panchang.**

This prototype separates observance-date rules from the existing `festival-muhurta.js` module. It accepts local Panchang intervals as input and evaluates four pilot rules:

- Krishna Janmashtami: Ashtami present at local Nishita.
- Rama Navami: Navami present at local Madhyahna.
- Maha Shivaratri: Chaturdashi present at local Nishita.
- Masik Kalashtami: Krishna Paksha Ashtami present at local Nishita (experimental rule; compare city-wise with reviewed Panchangs).

Ekadashi is listed in the test page but intentionally remains `rule-pending`: Smarta/Vaishnava observance needs dedicated handling for sunrise, Dashami-vedha and Mahadvadashi instead of a simplistic single-anchor rule.

## Safety behaviour

- Existing reviewed/static JSON date is passed as `fallbackDate`.
- A unique match is returned as `candidate`, not auto-approved.
- Multiple matching dates return `ambiguous` and preserve the static fallback.
- Missing/invalid data, no match, or an unknown rule never creates a replacement date.
- This module does not fetch location, call a Panchang library, or alter any public data.

## Required next step before integration

Build and test a dedicated adapter for `@ishubhamx/panchangam-js@3.0.0` that emits exact local tithi start/end intervals and location-specific ritual anchors. Do not infer the interval from a single noon Panchang snapshot. Then compare multiple Indian locations and years against the user's reviewed Panchang before enabling the engine in the draft page.

## Tests

Run with a modern Node.js runtime supporting ES modules:

```sh
node --test tests/festival-date-engine.test.mjs
```

The tests use synthetic, timezone-offset-aware intervals to verify rule selection and fallback behaviour. They are unit tests, **not astronomical validation**.
