# Chapter III.9–12: reduced bhuja, elapsed-cycle arithmetic, and direction

**Status:** source audit / derivation only; not a production specification.  
**Branch:** `research/ss-ch9-diagnostic`  
**Production isolation:** no change to `app.js` or `extra-panchang.js`.

## New finding: “bhuja” is a quadrant-reduced arc, not a sine value

Sūrya-siddhānta II.30 explains how to select the `bhuja` and `koṭi` for an arc in each quadrant. Burgess’s own explanatory note calls this “taking the bhuja of an arc”: the bhuja is the appropriate arc smaller than 90° that determines the sine, while `bhujajyā` is the corresponding sine quantity. Sastri likewise distinguishes bhuja from bhujajyā in the II.30 translation. Sources:

- II.30 text and translation: https://www.siva.sh/surya-siddhanta/2/30
- Burgess’s detailed explanation of the quadrant rule: https://upload.wikimedia.org/wikipedia/commons/2/2b/Translation_of_the_S%C3%BBrya-Siddh%C3%A2nta%2C_A_Text-Book_of_Hindu_Astronomy%3B_With_Notes%2C_and_an_Appendix_%28IA_jstor-592174%29.pdf
- Sastri’s II.30 note defining bhuja as the quadrant-reduced arc: https://en.m.wikisource.org/wiki/Page%3AEnglish_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri%2C_1861.djvu/145

Therefore III.10 must **not** be coded as `0.3 × sin(angle)`, and “bhuja” must not be mistaken for the sine itself. The strongest text-supported working reading is: reduce the residual revolution to the appropriate bhuja arc, then multiply that arc (in degrees) by 3/10 to obtain the ayana magnitude. The relevant reduction is quadrant-aware; it is not simply the unmodified residual angle when that angle exceeds 90°.

For a phase angle `θ` normalized to [0°, 360°), the geometric bhuja magnitude implied by II.30 is:

- 0°–90°: `B = θ`
- 90°–180°: `B = 180° − θ`
- 180°–270°: `B = θ − 180°`
- 270°–360°: `B = 360° − θ`

Then III.10’s candidate magnitude is `|ayana| = (3/10) × B`, giving a range of 0° to 27°. This is an arc reduction, not a modern trigonometric sine calculation. The traditional sine table/interpolation may still matter for other steps, but it is not what the 3/10 factor multiplies under this reading.

## III.9: elapsed-day arithmetic

The Sanskrit states that the result is obtained from the elapsed terrestrial-day count multiplied by the stated 600 revolutions per yuga and divided by the yuga-day count. Structurally, the fractional part of that quotient supplies the residual cycle phase after completed revolutions are discarded.

That does **not** by itself settle a usable modern implementation. The exact day-count epoch, the relationship between the text’s creation-era ahargaṇa and a modern Julian-day epoch, and the convention for turning the fractional cycle into the phase angle must be explicitly specified. A date-only offset tuned to match a current ayanāṃśa is not a valid substitute for deriving those conventions.

The yuga-day count must be taken from the textual system consistently. The commonly cited value in I.37 is 1,577,917,828 terrestrial days; the implementation must still verify the intended day-count convention and epoch before using it.

## III.11–12: do not silently infer direction from magnitude

The translations add a separate direction/phase instruction after the III.9–10 magnitude rule. Burgess says the circle is eastward when the calculated solar longitude is less than the longitude obtained by observation from the shadow, and westward when the calculated longitude is greater. Sastri’s translation similarly says to compare the computed true solar place with the observed longitude. Sources:

- Burgess, III.9–12 and explanatory note: https://www.swaveda.com/texts/surya-siddhanta/3/
- Sastri, III.10–12: https://en.m.wikisource.org/wiki/Page%3AEnglish_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri%2C_1861.djvu/40

This is important: the text’s translated operational direction rule refers to an observational comparison at the equinoctial/solstitial points. Burgess interprets III.9–12 as a 7,200-year libration between 27° limits, but that is his explanatory model of the passage; it should not be silently treated as the only possible implementation of the Sanskrit direction rule. The magnitude computation and the signed correction must remain separate until a direct commentary-level analysis reconciles these descriptions.

## Direct commentary audit: Gūḍhārtha-prakāśaka

A direct online transcription of the Sanskrit text with Ranganātha’s Gūḍhārtha-prakāśaka commentary is now available and has been checked at the relevant passage: https://vishvasa.github.io/jyotiSham/observation/history/hindu/sUrya-siddhAntaH_saTIkaH/ (commentary around printed pages 112–115; web lines 1255–1281).

The commentary materially strengthens the reading above:

- At III.9 it explicitly interprets the 30-times-20 count as 600, and explains that the bhacakra does not make a normal complete revolution in one direction. It moves westward by a number of degrees, reverses to its original position, then moves eastward by the same amount, and reverses again; that full to-and-fro sequence is the “distinctive revolution” (web lines 1263–1264).
- At III.10 it explicitly says to multiply the ahargaṇa by 600, divide by the yuga’s terrestrial solar sāyana days, discard completed revolutions, form the bhuja from the remaining rāśi/degree amount, and then multiply that bhuja by 3/10 (web lines 1266–1267).
- Its further derivation describes the direction/reversal by whether the residual position lies within or outside the six-sign and three-sign divisions, and explains the 90° : 27° proportion (web line 1273). This yields the following cycle-phase interpretation for a normalized 0°–360° residual phase: 0°–90° = westward, magnitude increasing; 90°–180° = westward, magnitude decreasing back to the reference; 180°–270° = eastward, magnitude increasing; 270°–360° = eastward, magnitude decreasing back to the reference. The magnitude in each segment is still 3/10 of its II.30 bhuja. Thus the phase/direction is not an arbitrary sign to be tuned against a modern ayanāṃśa.
- At III.11 it then gives the observational check: compare the computed Sun with the Sun derived from the shadow; the longitude difference identifies the direction and amount of the circle’s displacement (web lines 1278–1281).

This is a significant advance over the earlier translation-only review. The Gūḍhārtha-prakāśaka reading supports a deterministic cycle-phase model from the elapsed-day count, with III.11’s shadow comparison serving as an observational check of the inferred displacement. It is no longer accurate to say that the direction logic is wholly unavailable. However, this does **not** finish a runnable modern implementation: the exact epoch/ahargaṇa for the selected civil date, the day-count conversion, and the text’s full computational conventions still need to be derived and tested. Sudhākara Dvivedī’s separate commentary has not yet been independently cross-checked.

TextGrid/GRETIL identifies Hall’s 1854 edition with the Gūḍhārtha-prakāśaka, the 1987 Kāśī edition, and Sudhākara Dvivedī’s 1987 commentary edition as the source editions. Source: https://www.textgridrep.org/browse/49kc2.0

## Implementation gate

Before writing a Chapter III ayana function, separately specify and test:

1. Derive the selected date’s ahargaṇa from the Siddhānta’s own epoch/day-count rules, without tuning a modern ayanāṃśa.
2. Verify the yuga-day denominator and conversion from the residual revolution to rāśi/degrees.
3. Encode the Gūḍhārtha-prakāśaka’s six-sign/three-sign phase and reversal logic explicitly, then test its boundaries.
4. Apply the II.30 bhuja reduction and III.10 3/10 scale in arc units, with no sine substitution.
5. Use the III.11 shadow-derived solar longitude as an independent direction/amount check when a valid observation-equivalent calculation is available.
6. Cross-check the same passage against Sudhākara Dvivedī’s separate commentary before calling the interpretation fully cross-commentarial.

Until these decisions are justified, do not replace `ayanamshaDeg = 24.217` in the Chapter VII diagnostic with this candidate. That value remains a modern comparison bridge only. Chapter VII Āyana dṛkkarma is also a separate correction and must not be confused with Chapter III’s ayana model.

**Decision: research only; no production patch, no merge, and no claim that the Jupiter/Venus event dates are validated.**


## Isolated executable diagnostic added

`ss_chapter3_ayana_math_test.js` now tests the II.30 quadrant reduction and III.10 3/10 scale, and exposes a separate cycle-state diagnostic that accepts an already-derived `ahargana` plus `yugaDays`. It reports the completed-revolution count, residual phase, bhuja, ayana magnitude, circle-motion direction, and whether the magnitude is increasing or decreasing. Synthetic quarter-cycle fixtures test the segment boundaries.

This deliberately does **not** invent the epoch or calculate ahargana for a modern civil date, and it does not turn circle-motion direction into a signed planetary-longitude correction. Those are separate derivation gates. CI checks this diagnostic; passing the tests proves only that the documented arithmetic is implemented consistently, not that the selected modern-date epoch is correct.


## Independent numerical cross-check against a published Siddhānta calculation

Vidhyamitra’s public Sūrya-siddhānta page gives, for **2026-10-08 at apparent noon in Ujjayinī**, `ahargana = 714,404,169,483.5` and `ayanaṃśa = 22.9122°` (the page says it uses Burgess’s text without bīja and the Sūrya-siddhānta’s own rules): https://www.vidhyamitra.com/surya-siddhanta

Using that published ahargana and the Chapter I yuga-day count `1,577,917,828`, the cycle calculation gives:

- completed revolutions: `271650`
- residual phase: `256.3739358422°`
- II.30 bhuja: `76.3739358422°`
- III.10 ayana magnitude: `22.9121807527°`
- cycle direction: eastward; magnitude increasing

The result rounds to **22.9122°**, matching Vidhyamitra’s displayed value. The diagnostic test now preserves this as an external arithmetic fixture. Sources for the displayed ahargana/ayana are https://www.vidhyamitra.com/surya-siddhanta and its chapter III ledger at https://www.vidhyamitra.com/surya-siddhanta/3; the yuga-day count is stated in the Sūrya-siddhānta text (I.37), available at https://www.textgridrep.org/browse/49kc2.0.

**What this validates:** the elapsed-day × 600 / yuga-day remainder, quadrant-reduced bhuja, and 3/10 scaling are consistent with this independently published example to the displayed precision.

**What it does not validate:** our own derivation of the ahargana for an arbitrary civil date, the correctness of every calendar/time-zone conversion needed to get that ahargana, or the separate Chapter VII dṛkkarma coordinate-frame transformation. The fixture is a strong cross-check, not a license to skip those gates.


## Ahargana gate: Chapter I.48–51 must be respected

The Gūḍhārtha-prakāśaka commentary for I.48–51 confirms that the creation-era day count is built from the elapsed years after the creation baseline, converted into months, plus elapsed lunar months; the procedure then adds the intercalary-month correction, converts months to days, adds elapsed tithis, and subtracts the omitted-tithi correction to obtain the savana-day count at midnight on Lanka’s meridian. This is not the same operation as multiplying all elapsed cosmic years by a modern mean year length.

For OurHinduDharm, the ahargana input to the III.9 diagnostic must therefore be obtained by one of two documented paths:

1. Implement and test the Chapter I.45–51 count, including the relevant source-defined month/tithi corrections; or
2. Use a separately established reference ahargana and advance it by a verified integer/fractional savana-day difference, with the epoch and time-of-day convention documented and independently checked.

Do not derive a creation-era ahargana by `(Gregorian JD − guessed epoch) × 365.2422` and call it source-faithful. Chapter I.56 allows mean planetary calculations from a chosen epoch, but that does not automatically authorize shifting the III.9 libration phase without preserving the source epoch’s phase.

The relevant commentary is visible in the same Gūḍhārtha-prakāśaka transcription around web lines 538–550: https://vishvasa.github.io/jyotiSham/observation/history/hindu/sUrya-siddhAntaH_saTIkaH/. Burgess’s translation of I.48–51 also explains the intercalary-month and omitted-lunar-day corrections: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf.


## New milestone: a reproducible, explicitly provisional ahargana bridge

The direct Gūḍhārtha-prakāśaka commentary for I.45–51 has now been read at https://vishvasa.github.io/jyotiSham/observation/history/hindu/sUrya-siddhAntaH_saTIkaH/ (web lines 520–560). It specifies the sequence: derive elapsed solar years to the end of Kṛta; add years elapsed after that; convert years to months; add elapsed months from Caitra-śukla; estimate and correct intercalary months; convert to days and add elapsed tithis; then subtract the omitted-tithi correction to obtain the sāvana-day count at midnight on the Lanka/prime meridian. The commentary also warns that the intercalary-month quotient may need a ±1 adjustment when the obvious quotient misses the intercalary month that actually applies.

An independent published reference is available on Vidhyamitra's Sūrya-siddhānta ledger: for 2026-10-08, “apparent noon at Ujjayinī,” it displays creation-era days `714,404,169,483.5` and days since the Kali age began `1,872,856`, with Chapter III ayana `22.9122°`: https://www.vidhyamitra.com/surya-siddhanta. The epoch convention described by Vidhyamitra is 18 February 3102 BCE in the Julian calendar. The Julian-calendar day difference from that date to 2026-10-08 is `1,872,856` whole days; at nominal meridian noon it is `1,872,856.5` days.

Subtracting that reference elapsed-day count from the published creation-era count yields a **provisional anchored offset** of `714,402,296,627.0` sāvana days at the Kali-epoch midnight. A research-only helper, `ss_chapter1_ahargana_anchor.js`, now uses this offset to advance by elapsed days and then computes the Chapter III residual cycle. It reproduces the published reference value and ayana to four decimals, and tests the one-day increment.

### Critical limitation

This is an **anchored continuation**, not yet an independent derivation of the huge epoch offset from all Chapter I.45–51 constants. There is also a time-scale question to resolve: the published ledger says “apparent noon,” while the helper's reference JD is nominal local-mean noon at the prime meridian. The conversion from arbitrary UTC/user-local timestamps to the text's meridian time must be fixed and tested explicitly. Therefore, do not use this helper as a production Panchāṅga calculation or claim that the full ahargana derivation is closed.

Next, reconstruct the same epoch offset independently from the Chapter I.45–51 constants and their precise commentary arithmetic, compare it with `714,402,296,627.0`, resolve apparent/mean-time semantics, and only then promote the date bridge from provisional to validated.
