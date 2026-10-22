# Venus/Jupiter mandocca epoch reconstruction — 22 October 2026

**Status: promising research reconstruction; not yet certified for production.**

## Why this advances the blocker

The missing Venus/Jupiter apsis anchors can be estimated from an explicit chain rather than guessed or copied from the Sun:

1. Sūrya-siddhānta I.41–42 gives mandocca revolutions per kalpa: Sun 387, Venus 535, Jupiter 900.
2. Burgess's 1860 translation/commentary table following I.44 reports the *Siddhānta-derived* 1850 positions, in a vernal-equinox/tropical frame: Sun 95°04′, Venus 97°39′, Jupiter 189°09′. The table distinguishes these from the actual 1850 positions.
3. The solar Kali-epoch candidate 77°07′48″ is reported in secondary literature. Using that candidate, the Sun's source revolution rate, and the 1850 table position infers one common frame offset.
4. Apply that same offset and each body's own source-rate motion to recover Venus/Jupiter candidate epoch longitudes.

Sources:
- Burgess, *Translation of the Sûrya-Siddhânta*, table following I.44: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf
- Sūrya-siddhānta I.41–44 online text: https://www.swaveda.com/texts/surya-siddhanta/1/
- Solar 77°07′48″ candidate provenance is secondary literature (Sewell/Indian Chronography), and remains a dependency, not a primary-verse anchor.
- Historical worked-model cross-check: https://www.rkanetech.com/true-position

## Computed candidates

Using 1850-01-01 JD 2396758.5 and the research epoch local-mean JD 588465.5 gives 1,808,293 elapsed days. The source-ratio motion to that table date is:

- Sun: 0.159660647°
- Venus: 0.220719499°
- Jupiter: 0.371303829°

The inferred common frame offset is **17.777006020°**. This is calibrated from the solar anchor; it is not an independent determination of the historical equinox conversion.

| Body | Burgess 1850 model longitude | Reconstructed Kali-epoch candidate |
|---|---:|---:|
| Venus mandocca | 97°39′ | 79.652274481° |
| Jupiter mandocca | 189°09′ | 171.001690151° |

## Historical model check (not an Asta/Udaya fit)

At the published worked example's ahargana 714403972030, this candidate layer yields:

- Venus mandocca: 79.856773481° versus published 79.85450°; difference ≈ 0.00227° (8.2 arcsec).
- Jupiter mandocca: 171.345707160° versus published 171.34402°; difference ≈ 0.00169° (6.1 arcsec).

This is strong internal corroboration that the table conversion and source-rate arithmetic are coherent. It is **not fully independent proof**, because the common frame offset is calibrated using the secondary solar anchor and the external worked model may share related conventions. No modern Asta/Udaya event date was used to tune these values.

## Implementation and guardrails

Added `ss_chapter1_planetary_mandocca_epoch_candidates.js`. It exposes the derivation, candidate epoch longitudes, provenance and explicit research-only status. The test runner includes checks for the table interval, frame calibration, source revolution counts, historical worked-model comparison and rejection of unestablished anchors for other planets.

Do not silently extend this method to Mars/Mercury/Saturn; their table anchors must be established separately. Do not import this module into production yet. The next step is to feed these Venus/Jupiter candidates through the full Chapter II manda/śīghra chain, compare every intermediate against the published worked model, then return to Chapter IX event-time calculations. Keep PR #22 Draft until that test and independent source review pass.
