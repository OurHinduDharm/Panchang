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


## Critical result from the Chapter II 1860 worked-table comparison

The first raw comparison looked like a ~20.4° error, but the columns are not directly in the same coordinate frame. Burgess's Chapter II table explicitly distinguishes longitude from the “Hindu equinox” and from the “true equinox”; our Kali-epoch mean-longitude layer is in its fixed classical zodiac frame. The raw 20.4° difference must therefore not be interpreted as an ahargana failure by itself.

Burgess's 1 January 1860 Washington table gives these Sūrya-siddhānta longitudes from the Hindu equinox: Sun 278°40′, Venus 305°00′, Jupiter 114°36′. The local-mean-time bridge currently produces ahargana 714404108572.4244 for that instant. The model's raw Kali-fixed-frame values were:

- mean Sun: 258.220296829°
- Venus true-longitude candidate: 284.574266805°
- Jupiter true-longitude candidate: 94.165254220°

Applying the *candidate* common frame offset calibrated from the Sun's mandocca (17.777006020°) gives the following diagnostic comparison in Burgess's equinox frame:

| Body | After candidate frame transform | Burgess table | Residual |
|---|---:|---:|---:|
| Mean Sun (gross check against true Sun) | 275.997303° | 278.666667° true Sun | −2.669364° |
| Venus | 302.351273° | 305.000000° | −2.648727° |
| Jupiter | 111.942260° | 114.600000° | −2.657740° |

The common residual of about **−2.65°** is now the useful clue. It is much smaller than the raw 20.4° and is consistent across the three bodies, but it is not yet explained. It may reflect the secondary solar mandocca anchor, the exact source-frame transformation, the historical table's time convention, or the Chapter II.46 correction. The mean-Sun row is only a gross diagnostic because it compares mean Sun with true Sun; its solar manda correction is too small to explain a multi-degree residual.

A second source detail needs direct adjudication before selecting a frame constant: Burgess's prose says the origin of the Hindu sphere is **18°58′ east of the vernal equinox on 1 January 1860**. If this literal offset is applied as an alternative diagnostic, the shared residual drops to about **−1.47°** (Sun gross check −1.480°, Venus −1.459°, Jupiter −1.468°). However, this prose phrase must be confirmed to describe the same coordinate transformation as the 1850 mandocca table; do not silently replace the solar-calibrated 17.777006° offset with 18°58′. The diagnostic now reports both alternatives and their 1.18966° difference.

Source: Burgess, *Translation of the Sûrya-Siddhânta*, Chapter II, “True Places and Motions of the Planets, Jan. 1st, 1860, midnight, at Washington”:
https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf
The table explicitly distinguishes “from Hindu eq.” from “from true eq.”; the frame transform must be made explicit before claiming agreement.

### Correct next step

1. Verify the solar mandocca epoch anchor and the frame offset against the original printed table/edition, not only a secondary 77°07′48″ anchor.
2. Audit the exact table time/meridian convention and implement Chapter II.46 before interpreting the remaining residual.
3. Require the historical Sun to agree in the same frame first, then verify Venus/Jupiter true-position intermediates. Only then return to Chapter IX event-time calculations.
4. Keep everything research-only. Do not tune the residual to modern Asta/Udaya dates.

The earlier 8.2/6.1 arcsecond check remains a check of the mandocca-anchor arithmetic at a separate published historical ahargana, not validation of the complete true-position model or the 1860 frame/time conversion.
