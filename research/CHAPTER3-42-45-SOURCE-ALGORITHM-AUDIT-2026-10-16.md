# Chapter III.42–45: source-driven rising-asus algorithm audit
Date: 2026-10-16
Branch: research/ss-ch9-diagnostic
Status: source audit and implementation specification; no production integration.

## Primary text
- Burgess translation, Chapter III: https://www.swaveda.com/texts/surya-siddhanta/3/
- Sanskrit and alternate numbering/translation: https://www.siva.sh/surya-siddhanta/3/43
- Scan of Burgess's printed translation: https://upload.wikimedia.org/wikipedia/commons/2/2b/Translation_of_the_S%C3%BBrya-Siddh%C3%A2nta%2C_A_Text-Book_of_Hindu_Astronomy%3B_With_Notes%2C_and_an_Appendix_%28IA_jstor-592174%29.pdf?0ZjjIB7T=YSNGIt

## Correct algorithm from the source
1. Chapter III.42 constructs the day-radii for 1, 2, and 3 signs from the sine geometry; the Burgess commentary reports 3366, 3216, and 3140 (with obliquity assumed 24°).
2. Chapter III.43 multiplies each corresponding sign-sine by the sine of the three-sign day-radius (1397 in the cited table), divides by its own day-radius, converts each quotient to an arc, and forms successive differences. The resulting equatorial rising-asus are 1670, 1795, and 1935 prāṇas for Aries, Taurus, and Gemini.
3. Chapter III.44 says to subtract the local carakhaṇḍas from those three equatorial values.
4. Chapter III.45 constructs the Cancer group by reversing the three base values and combining them with the corresponding reversed carakhaṇḍas; the six values are then mirrored in reverse order for Libra onward.
5. The source's local carakhaṇḍa is not simply an arbitrary difference between exact modern analytical oblique ascension and right ascension. The text points back to the Chapter II construction (especially the source's rules around II.61–62). That calculation must be implemented and audited separately before claiming literal fidelity.

## A critical correction to the previous diagnostic
The earlier report `CHAPTER3-TABLE-CONSTANT-CARAKHANDA-CROSSCHECK-2026-10-16.md` deliberately used analytical oblique ascension to estimate carakhaṇḍa. Its table is a hybrid comparator only. It is not the source's actual Chapter III/II algorithm and must not be used as the final classical table. The exact analytical baseline is still useful as an independent comparison.

## Numerical checks available from the source
The printed commentary gives these intermediate values under its stated 24° obliquity:
- Day-radii for 1, 2, 3 signs: 3366, 3216, 3140.
- Sine of three-sign day-radius: 1397.
- Resulting arc values before successive differences: 1670, 3465, 5400 prāṇas.
- Successive differences: Aries 1670; Taurus 3465 − 1670 = 1795; Gemini 5400 − 3465 = 1935.
- Sum of the three sign values is 5400 prāṇas, one quadrant of the 21600-prāṇa circle.

These intermediate numbers should be retained as golden reference fixtures for a future literal implementation. They are rounded table outputs, so a new implementation must compare at the precision supported by the printed sine table rather than demand modern floating-point equality.

## Implementation gate
Do not code a pretend “literal” carakhaṇḍa using the analytical OA formula. Before implementing the local table:
- Transcribe the actual Chapter II sine-table and carakhaṇḍa rules into named, tested helper functions.
- Establish the source's exact table radius, interpolation, arc-conversion convention, and rounding at each intermediate step.
- Reproduce the Burgess 24° example (including the Washington example in the commentary, where the reported carakhaṇḍas are 578, 1061, and 1263 prāṇas) as golden tests.
- Then test Pithoragarh latitude 29.5828° N against an independently computed analytical comparator.
- Keep the modern tropical/ayanāṃśa frame choice as a separate, explicitly named research hypothesis; the rising-asus algorithm alone does not resolve the frame-origin question.

## Safety boundary
No changes to `app.js`, `extra-panchang.js`, or the live Panchang. This file is research-only. It does not provide final Venus/Jupiter Asta/Udaya dates.
