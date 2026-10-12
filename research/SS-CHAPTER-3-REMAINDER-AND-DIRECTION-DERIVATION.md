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
- Its further derivation describes the direction/reversal by whether the residual position lies within or outside the six-sign and three-sign divisions, and explains the 90° : 27° proportion (web line 1273). Thus the phase/direction is not an arbitrary sign to be tuned against a modern ayanāṃśa.
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
