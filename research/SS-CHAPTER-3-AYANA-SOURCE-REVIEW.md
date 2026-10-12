# Chapter III.9–12 source review: ayana calculation and coordinate-frame consequences

**Status:** research finding; not a production algorithm.  
**Branch:** `research/ss-ch9-diagnostic`  
**Scope:** resolve a translation ambiguity before implementing any Sūrya-siddhānta Chapter III ayana model.

## Primary textual witness

The Sanskrit text in the TextGrid/GRETIL transcription gives:

- III.9: `triṃśatkṛtyo yuge bhānāṃ cakraṃ prāk parilambate / tadguṇād bhūdinair bhaktād dyugaṇād yad avāpyate`
- III.10: `taddoḥ trighnā daśāptāṃśā vijñeyā ayanābhidhāḥ / tatsaṃskṛtād grahāt krānticchāyācaradalādikam`

TextGrid identifies the underlying editions as the 1854 Hall edition of the *Sūrya-siddhānta with the Gūḍhārtha-prakāśaka* and editions from Kāśī and Sudhākara Dvivedī. This makes it a useful textual witness, but the web transcription itself does not display the full commentary at this verse. Source: https://www.textgridrep.org/browse/49kc2.0 (III.9–12).

## The important translation difference

The available translations do not phrase III.10 identically:

1. **Burgess (1860):** “Take the part which determines the sine, multiply it by three, and divide by ten.” His accompanying discussion interprets III.9–12 as an oscillation/libration model, reaching 27° either side of a fixed reference. Source: https://www.swaveda.com/texts/surya-siddhanta/3/ and https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf.
2. **Sastri's English translation (1861), reproduced by Wikisource and Siva.sh:** after removing completed revolutions, find the *bhuja* of the remainder (explained there as signs/degrees etc.); multiply that *bhuja* by 3 and divide by 10 to obtain the ayana degrees. The translator's footnote gives the scale as 27° : 90°. Sources: https://en.wikisource.org/wiki/Page%3AEnglish_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri%2C_1861.djvu/39 and https://www.siva.sh/surya-siddhanta/3/10.
3. **Karma Sakha's modern transcription/annotation:** explicitly reads the input as the *bhuja* in degrees, so a 90° maximum gives 27° after multiplication by 3/10. Source: https://karmasakha.com/texts/surya-siddhanta.

These sources support treating “the remainder's bhuja/arc” as the stronger working reading for a future diagnostic. They do **not** yet justify declaring every interpretive question closed: the exact Sanskrit grammatical referent, the relevant commentary's explanation, and the direction/phase logic across III.9–12 still need a direct commentary-level audit. In particular, Burgess's “part which determines the sine” should not be silently rephrased as “take the modern sine ratio and multiply by 0.3”; that is not what Sastri's explicit *bhuja* rendering says.

## Working numerical interpretation

For a remainder arc (B) in the first quadrant, the Sastri/Karma Sakha reading is:

`ayana = (3/10) × B`

where `B` is an arc in degrees, bounded by 0° and 90° under the quadrant convention. This yields 0° to 27°. It is **not**:

`ayana = (3/10) × sin(B)`

with a unitless modern sine, nor is it the modern astronomical ayanāṃśa value.

A robust implementation must first reproduce III.9's elapsed-revolution remainder and its quadrant/arc reduction, then apply III.10's 3/10 rule, and then apply III.11–12's direction and observed-sun comparison. Simply setting a constant `ayanamshaDeg` cannot represent this algorithm.

## Consequence for current research code

The current `ss_chapter3_lagnantara.js` helper calculates a candidate oblique-ascension/sign-table interpolation with a modern fixed obliquity and a configurable `ayanamshaDeg` bridge. It does **not** calculate the elapsed-day ayana model of III.9–12. It must remain labelled a diagnostic candidate; do not use it as evidence that the classical Chapter III frame has been implemented.

The current `ss_chapter7_drikkarma.js` candidate likewise uses `ayanamshaDeg = 24.217` as a frame bridge. This note does not authorize replacing that bridge with an unverified oscillation formula or modifying production code.

## Required next checks

1. Read III.9–12 in at least one named Sanskrit commentary directly, preferably the Gūḍhārtha-prakāśaka and/or Sudhākara Dvivedī edition listed by TextGrid.
2. Derive the elapsed-day remainder from the text's stated revolution count and yuga-day denominator, with a transparent epoch choice and modular/quadrant reduction.
3. Compare the `bhuja × 3/10` interpretation to Burgess's translation, documenting why the two descriptions may or may not be mathematically equivalent in context.
4. Derive the sign/direction selection in III.11–12 from the text, not by tuning against a contemporary ayanāṃśa.
5. Only then make a separate Chapter III model and test it against independently sourced historical/astronomical examples. Keep the current fixed-offset bridge as a separately labelled baseline.

## Decision

**No production change.** The strongest available cross-translation evidence favours “reduced bhuja/arc × 3/10” as the next model to investigate, while the phase/direction and exact commentary interpretation remain open. The present event-date research must continue to carry the Chapter III coordinate-frame blocker.


## Addendum — direct commentary check completed after this note

A subsequent direct check of the online Sanskrit transcription of Ranganātha’s **Gūḍhārtha-prakāśaka** found the commentary for III.9–12 at https://vishvasa.github.io/jyotiSham/observation/history/hindu/sUrya-siddhAntaH_saTIkaH/ (web lines 1255–1281). The commentary explicitly explains the 600-cycle count, the to-and-fro motion, the ahargaṇa × 600 / yuga-day calculation, the removal of complete revolutions, the bhuja × 3/10 rule, the six-sign/three-sign phase reversals, and the III.11 shadow-based observational check.

This narrows the unresolved work: the **Gūḍhārtha-prakāśaka** reading is no longer merely an inference from translations. The remaining research is to derive the civil-date ahargaṇa and epoch/day-count conventions reproducibly, implement and boundary-test the commentary’s phase/reversal rules in an isolated research helper, and cross-check Sudhākara Dvivedī’s separate commentary. See the more detailed derivation in [SS-CHAPTER-3-REMAINDER-AND-DIRECTION-DERIVATION.md](SS-CHAPTER-3-REMAINDER-AND-DIRECTION-DERIVATION.md).

No production code is changed, and this still does not validate any Jupiter/Venus event date.
