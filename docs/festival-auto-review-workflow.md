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

`festival-observance-rules.mjs` exposes explicit, versioned candidate-evidence profiles. The annual review UI requires the reviewer to select a rule; festival names are never guessed into a rule.

- **Smarta Ekadashi:** Ekadashi active at local sunrise; when the same Ekadashi spans two sunrises, the first sunrise is retained as the candidate. Dashami at sunrise does not count as Ekadashi at sunrise. The Dharmasindhu digest distinguishes Smarta sunrise-Dashami vedha from Vaishnava Arunodaya vedha. Mahadvadashi and parana exceptions remain manual-review.
- **Smarta Janmashtami:** Krishna Ashtami at Nishita, with Rohini-at-Nishita reported as supporting evidence. This profile reports each night's evidence only; it does not yet resolve the full two-night Dharmasindhu tie-break. If Ashtami is Nishita-vyapini on both nights, or neither night, the reviewer must apply the Rohini/second-night decision from the text. The profile is restricted to Bhadrapada in the project's Purnimanta calendar.
- **Navratri day-count:** Shukla Pratipada through Saptami at sunrise, restricted to Chaitra/Ashwin. Repeated tithis retain the first sunrise.
- **Navratri Maha Ashtami:** a separate sunrise profile for Shukla Ashtami. The Dharmasindhu text includes Saptami-vedha and short/long Ashtami exceptions; those complex edge cases are not silently auto-decided.
- **Navratri Maha Navami:** two explicit candidate profiles: Ashtami at sunrise with Navami continuing for at least six ghatis after local sunset, and a next-day Navami-at-sunrise fallback. The six-ghati rule is drawn from the Dharmasindhu Maha-Ashtami/Navaमी decision section; special edge cases remain review-only.
- **Navratri Sandhi Puja:** requires adjacent Shukla Ashtami and Navami intervals and reports the transition estimate; when the Panchang engine rounds the two interval boundaries apart by up to 90 seconds, their midpoint is used. It is explicitly restricted to Chaitra/Ashwin Navratri and is not a generic monthly Durga Ashtami rule. The engine no longer invents a fixed 48-minute window where the reviewed text only identifies the tithi junction.
- **Pradosh:** Trayodashi overlap with three night-muhurtas after local sunset; the night is divided into fifteen muhurtas, so the duration varies with local night length.
- **Sankashti:** Krishna Chaturthi active at local moonrise.
- **Masik Shivaratri and Mahashivaratri:** separate Krishna Chaturdashi/Nishita profiles; Mahashivaratri is restricted to Phalguna in the project Purnimanta calendar; Dharmasindhu names Magha Krishna Chaturdashi in its Amanta month convention, which maps to Phalguna in Purnimanta.
- **Vinayaka Chaturthi:** Shukla Chaturthi overlap with the local Madhyahna interval.

Primary text and source cross-checks now consulted:
- Dharmasindhu, Janmashtami-vrata and Rohini-yoga sections: https://www.transliteral.org/pages/z80422113144/view and https://www.transliteral.org/pages/z80421221115/view
- Dharmasindhu, Maha-Ashtami decision (including Ashtami-viddha Navami and Sandhi): https://www.transliteral.org/pages/z80504211648/view\n- Dharmasindhu, Mahashivaratri-vrata (Magha Krishna Chaturdashi and Nishita rule): https://www.transliteral.org/pages/z80505114958/view
- Dharmasindhu tithi-vrata digest, including Smarta/Vaishnava Ekadashi distinction, Sankashti and Pradosh: https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=5
- Night-length-aware Pradosh methodology cross-check: https://panchangtime.com/methodology/pradosh-vrat
- Drik Panchang 2026 Janmashtami tithi/timing cross-check: https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html?geoname-id=1275004&year=2026
- Drik Panchang 2026 Sharad Navratri date cross-check: https://www.drikpanchang.com/navratri/ashwin-shardiya-navratri-dates.html?geoname-id=1273294&year=2026

A source page or digest translation is not the same as a completed critical edition review. Every profile remains candidate-only, and all relevant exceptions must be checked before any public date is approved. All results retain `finalDate: null` and `autoApproved: false`. Missing decision windows, unknown profiles, wrong lunar months and incomplete tithi transitions fail closed. No live festival JSON or Blogger output is modified by these profiles.
