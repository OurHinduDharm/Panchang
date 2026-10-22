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


## Critical result from the Chapter II 1860 external-ephemeris comparison

The first raw comparison looked like a ~20.4° error, but the columns are not directly in the same coordinate frame, and the table is an external ephemeris benchmark rather than a source-calculated Śāstrīya output. Burgess's Chapter II table explicitly distinguishes longitude from the “Hindu equinox” and from the “true equinox”; our Kali-epoch mean-longitude layer is in its fixed classical zodiac frame. Crucially, the paragraph introducing that table says the primary-planet positions come from Le Verrier's sidereal revolution data, the Moon from Peirce's tables, and the apsis/node from Hansen—not from running the Sūrya-siddhānta equations. It is therefore an external modern-ephemeris comparison, not a classical worked-example output. The raw 20.4° difference must therefore not be interpreted as an ahargana failure by itself.

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

The common residual of about **−2.65°** is a useful external accuracy diagnostic, but it is not by itself evidence that the Chapter II algorithm is implemented incorrectly. The source-based II.46 correction is now implemented in the research module: at the 1860 fixture it changes Venus by **+0.005941°** and Jupiter by **−0.004676°**. After that correction, the candidate-frame residuals are Venus **−2.642786°** and Jupiter **−2.662416°**. Applying the literal 18°05′08″ alternative gives Venus **−2.334237°** and Jupiter **−2.353866°**. The correction is therefore much too small to explain the multi-degree residual; the remaining issue is the frame/epoch/table convention, not the missing II.46 term. The mean-Sun row remains a gross diagnostic because it compares mean Sun with true Sun.

A second source detail needs direct adjudication before selecting a frame constant: Burgess's prose says the origin of the Hindu sphere is **18°05′08″ east of the vernal equinox on 1 January 1860**. If this literal offset is applied as an alternative diagnostic, the shared residual drops to about **−2.34°** (Sun gross check −2.358°, Venus −2.340°, Jupiter −2.349°). However, this prose phrase must be confirmed to describe the same coordinate transformation as the 1850 mandocca table; do not silently replace the solar-calibrated 17.777006° offset with 18°05′08″. The diagnostic now reports both alternatives and their 0.30855° difference.

Source: Burgess, *Translation of the Sûrya-Siddhânta*, Chapter II, “True Places and Motions of the Planets, Jan. 1st, 1860, midnight, at Washington”:
https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf
The table explicitly distinguishes “from Hindu eq.” from “from true eq.”; the frame transform must be made explicit before claiming agreement.

### Correct next step

1. Verify the solar mandocca epoch anchor and the frame offset against the original printed table/edition, not only a secondary 77°07′48″ anchor.
2. Chapter II.46 is now implemented as a research-only correction; verify its sign and the historical table's exact time/meridian convention before interpreting the remaining residual.
3. Require the historical Sun to agree in the same frame first, then verify Venus/Jupiter true-position intermediates. Only then return to Chapter IX event-time calculations.
4. Keep everything research-only. Do not tune the residual to modern Asta/Udaya dates.

The earlier 8.2/6.1 arcsecond check remains a check of the mandocca-anchor arithmetic at a separate published historical ahargana, not validation of the complete true-position model or the 1860 frame/time conversion.


## Source-reading correction — 22 October 2026

An OCR-style reading of the scanned Burgess introduction was previously misread as **18°58′**. The searchable text of the original translation actually reads **18° 5′ 8″** (18 degrees, 5 minutes, 8 seconds), not 18 degrees 58 minutes. See the source passage in the translation's introduction, “The origin of the Hindu sphere…”:
https://upload.wikimedia.org/wikipedia/commons/2/2b/Translation_of_the_S%C3%BBrya-Siddh%C3%A2nta%2C_A_Text-Book_of_Hindu_Astronomy%3B_With_Notes%2C_and_an_Appendix_%28IA_jstor-592174%29.pdf

The diagnostic has been corrected to use 18 + 5/60 + 8/3600 degrees for this *alternative candidate only*. It differs from the 17.777006020° solar-calibrated candidate by about 0.30855°, not 1.18966°. After applying 18°05′08″, the historical residuals are still about −2.34° for Venus and Jupiter; therefore this correction does not resolve the model. The prior statement that the 18°58′ candidate reduced the residual to −1.47° is withdrawn. The source-frame definition still requires verification, and the production code remains untouched.


## Chapter II.46 implementation result — 22 October 2026

The candidate module now applies the verse II.46 bhujāntara correction using the Sun's first (manda) equation's base-sine result, the planet's source-ratio mean daily motion, and division by 21,600 arcminutes per circle. It keeps both the pre-correction four-pass result and the corrected longitude visible. This is only the correction to true midnight at Laṅkā; it is not a replacement for the later local udayāntara, deśāntara, and cara corrections discussed in Burgess's commentary.

For the 1 January 1860 Washington comparison, the correction is +0.005940700° for Venus and −0.004676250° for Jupiter. The residual changes by only a few thousandths of a degree, so II.46 is not the cause of the approximately 2.65° shared mismatch. The code has an explicit guard preventing the Sun from being passed into the five-planet four-pass equation path; the Sun is only used to calculate its own manda equation for II.46.

Source: Burgess translation, Chapter II.34 (solar epicycle 14° with 20′ reduction at odd quadrants) and II.46:
https://www.swaveda.com/texts/surya-siddhanta/2/
The exact historical frame and the 1860 table's time convention remain to be cross-checked. Since the table is built from modern ephemeris data, its residual cannot substitute for checking the algorithm against a true classical worked example. No production file has been changed.


## Source classification correction — 22 October 2026

The 1860 table should not be called a “Sūrya-siddhānta worked example.” Burgess's introduction explicitly says its primary-planet positions were obtained from Le Verrier's sidereal revolution data, the Moon from Peirce's tables, and lunar apsis/node from Hansen. Those are modern comparison positions transformed into the Hindu-sphere frame. The table is valuable as an **external accuracy benchmark**, but a residual against it does not by itself show that our implementation of the classical equations is wrong.

The correct next validation gate is to compare the intermediate Chapter II equations against an actual classical worked calculation or commentary example, then keep the Burgess/Le Verrier table as a separate external-accuracy check. Do not fit the equations to its residual and do not use modern Asta/Udaya dates as tuning targets.

The printed frame-origin figures also cross-check arithmetically: 18°05′08″ east of the 1860 vernal equinox plus 50°22′29″ west of the 3102 BCE vernal equinox equals the stated 68°27′37″ precession interval. This strongly supports reading the scanned “18°58′” OCR as a misreading, not the intended value.


## Chapter II four-pass worked-example regression — 22 October 2026

A real numerical regression fixture is now wired into `ss_chapter2_planetary_true_position_candidate.js`, using the published inputs and outputs from R. Kane Tech's Sūrya-siddhānta true-position walkthrough:
https://rkanetech.com/true-position

At ahargaṇa **714403972030**, the fixture uses the published mean longitude, mandocca, and śīghrocca for Venus and Jupiter without adjusting any input to fit an Asta/Udaya event:

| Body | Our four-pass result | Published result | Difference |
|---|---:|---:|---:|
| Venus | 7.292914268° | 7.292850000° | +0.000064268° (about 0.23 arcsec) |
| Jupiter | 264.422354715° | 264.436320000° | −0.013965285° (about 50.3 arcsec) |

Both are inside the explicitly declared 0.05° tolerance; the source-table interpolation accounts for small numerical differences. The candidate module's full set of **11/11 planetary true-position tests passed** in the current Actions log. The broader browser/production-isolation job is still running, so this is not yet a claim that the complete workflow is finished.

This is the appropriate Chapter II implementation check; the 1860 Burgess/Le Verrier table remains a separate external-accuracy benchmark, not a classical worked example. Chapter II.46 remains separately visible as a small correction (+0.005940700° Venus, −0.004676250° Jupiter in the 1860 fixture). Production `app.js` and `extra-panchang.js` remain unchanged.
