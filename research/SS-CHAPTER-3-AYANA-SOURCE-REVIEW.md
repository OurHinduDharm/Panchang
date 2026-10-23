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

At the time this note was first drafted, the cross-translations favoured “the remainder's bhuja/arc” but the direct commentary audit was still outstanding. The later direct reading of Ranganātha's Gūḍhārtha-prakāśaka, documented in the addendum below and in [SS-CHAPTER-3-REMAINDER-AND-DIRECTION-DERIVATION.md](SS-CHAPTER-3-REMAINDER-AND-DIRECTION-DERIVATION.md), now explicitly supports forming bhuja from the residual rāśi/degree amount, reducing it according to the cycle's phase/reversal, and multiplying that arc by 3/10. This still must not be rewritten as “take the modern sine ratio and multiply by 0.3.”

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

1. **Completed for Gūḍhārtha-prakāśaka:** direct commentary read for III.9–12; cross-check Sudhākara Dvivedī's separate commentary remains open.
2. Derive the civil-date ahargana from the text's Chapter I.45–51 day-count method, with the epoch and fractional-day convention documented.
3. Keep the III.9 residual-cycle arithmetic and the II.30 quadrant-reduced bhuja as separately testable operations; preserve the published Vidhyamitra 2026-10-08 value as an external numerical fixture.
4. Test the cycle's six-sign/three-sign direction and reversal boundaries, then use III.11's shadow-derived solar longitude as an independent observational check where the required calculation is available.
5. Only then connect the Chapter III result to a complete coordinate-frame model for Chapter VII and Chapter IX. Keep the current fixed-offset bridge as a separately labelled baseline.

## Decision

**No production change.** The direct Gūḍhārtha-prakāśaka reading and an external numerical fixture now support the reduced-bhuja × 3/10 cycle model. Civil-date ahargana derivation, cross-check against Sudhākara Dvivedī, and integration with the Chapter VII coordinate frame remain open. The present event-date research must continue to carry the coordinate-frame blocker.


## Addendum — direct commentary check completed after this note

A subsequent direct check of the online Sanskrit transcription of Ranganātha’s **Gūḍhārtha-prakāśaka** found the commentary for III.9–12 at https://vishvasa.github.io/jyotiSham/observation/history/hindu/sUrya-siddhAntaH_saTIkaH/ (web lines 1255–1281). The commentary explicitly explains the 600-cycle count, the to-and-fro motion, the ahargaṇa × 600 / yuga-day calculation, the removal of complete revolutions, the bhuja × 3/10 rule, the six-sign/three-sign phase reversals, and the III.11 shadow-based observational check.

This narrows the unresolved work: the **Gūḍhārtha-prakāśaka** reading is no longer merely an inference from translations. The remaining research is to derive the civil-date ahargaṇa and epoch/day-count conventions reproducibly, implement and boundary-test the commentary’s phase/reversal rules in an isolated research helper, and cross-check Sudhākara Dvivedī’s separate commentary. See the more detailed derivation in [SS-CHAPTER-3-REMAINDER-AND-DIRECTION-DERIVATION.md](SS-CHAPTER-3-REMAINDER-AND-DIRECTION-DERIVATION.md).

No production code is changed, and this still does not validate any Jupiter/Venus event date.


## Addendum — Chapter I ahargana work now has a direct arithmetic helper

The research branch now includes `ss_chapter1_ahargana_calendar.js`, which follows the Gūḍhārtha-prakāśaka's I.45–51 sequence using the source constants: 1,953,720,000 solar years to the end of Kṛta; 1,593,336 intercalary months per 51,840,000 solar months; 1,603,000,080 lunar tithis and 25,082,252 omitted tithes per yuga. It uses exact integer arithmetic for the large quotient operations.

The helper requires a traditional elapsed-year/month/tithi input and an explicit -1/0/+1 intercalary-month correction. It does not yet map Gregorian date/time to those traditional fields. The published Vidhyamitra value for 2026-10-08 is an external comparison point, but its public display labels the tithi Kṛṣṇa Trayodaśī without exposing all intermediate inputs. The matching 26.5-tithi fixture is synthetic; a 27.5-tithi alternative shifts the computed Ahargana by one day. The same source display gives rounded true longitudes Sun Kanyā 20°10′ and Moon Siṃha 21°14′, implying roughly 331.07° elongation (about 27.59 elapsed tithis) at apparent noon. Since I.50 specifies Ahargana at Lanka midnight, that apparent-noon elongation cannot be substituted blindly for the formula's tithi input; the midnight boundary still needs reconstruction. This ordinal/time mismatch is now recorded as an unresolved diagnostic, not explained away as a verified convention.

The separate `ss_chapter1_ahargana_anchor.js` remains only a provisional reference-anchored continuation. Neither helper is connected to production code.


## Addendum — civil-day epoch cross-check, not a replacement for I.45–51 — 13 October 2026

A further source check confirms the boundary convention that the date bridge must respect: Sūrya Siddhānta I.48–51 gives the Ahargaṇa through the **present midnight at Laṅkā**, not the observer's local midnight or apparent noon. Bāpū Deva Śāstrī's 1861 translation states this explicitly in the I.48–51 explanation: https://en.wikisource.org/wiki/Page:English_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri,_1861.djvu/18 (lines 100–108). A modern technical reconstruction independently describes the epoch as Julian Day 588465.5 and the relation Ahargaṇa = JD − 588465 for this midnight-based convention: https://bhagol.in/blog/computed-sky/counting-days-since-the-beginning/ (lines 19–23, 51–54).

This provides a **separate epoch/day-boundary cross-check** for a future Gregorian-to-Ahargana adapter. It does not license replacing the prescribed I.45–51 elapsed-years/months/tithis algorithm with a Julian-Day subtraction and calling that the classical calculation. The direct formula and an epoch-based civil-day adapter must be implemented and tested as separate paths, with their time scale, meridian, calendar convention, and inclusive/exclusive day label made explicit.

The independent historical benchmark remains useful: Sri Jagannāth Center reports 2 May 1827 (Vaiśākha Śukla Ṣaṣṭhī) with Ahargaṇa 714,404,096,641 and says the date is included: https://srijagannath.org/jyoti%E1%B9%A3a/aharga%E1%B9%87a-calculations/ . This checks the integer quotient arithmetic when the stated traditional inputs are supplied; it does not independently establish the fractional-day input for the modern 2026 ledger.

**Next test gate:** implement a research-only epoch adapter that returns (a) the exact Lanka-midnight civil-day label, (b) the elapsed fractional day at a requested instant relative to that boundary, and (c) the traditional I.45–51 result separately. Test the epoch weekday and the 2 May 1827 benchmark, then investigate the unresolved input/boundary mismatch against the 2026-10-08 published ledger. Do not call it a one-day discrepancy unless a reproducible comparison establishes that the two paths are using the same instant, meridian, calendar convention, and elapsed-tithi input; do not tune either path to force a match. Do not connect this bridge to the Chapter III ayana or production code until these tests agree or the remaining textual convention is explicitly documented.


## Addendum — isolated civil-instant epoch bridge, 13 October 2026

A separate research-only module, `ss_chapter1_epoch_bridge.js`, now converts a standard UTC Julian Day into local-mean-time coordinates at a configurable reference meridian (default 75.768° E for the modern Ujjayinī/Avanti diagnostic point). It reports the elapsed local-mean day index from the epoch, the fractional day within that midnight-to-midnight interval, the weekday, the corresponding UTC instant of the current mean-midnight boundary, and a source-anchored Ahargana continuation.

This module is intentionally **not** the I.45–51 traditional-calendar algorithm and does not derive Hindu lunar month, adhika-māsa, or tithi inputs. Its modern 2026 fixture reproduces the existing reference-anchored arithmetic only; it is not an independent verification of the published apparent-noon Ahargana. The meridian value is a configurable modern reference choice, not a longitude specified by the Sanskrit text.

CI now checks the epoch boundary, Friday epoch weekday from the Julian-day-number convention, fractional-day continuity, one-day rollover, input validation, and the existing 2026 anchor fixture. Passing these tests will validate the adapter's arithmetic, **not** settle the traditional input convention or authorize production integration.
