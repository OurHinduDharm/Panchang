# Dharmasindhu p. 17 — Ekadashi pāraṇa and Dvādaśī decision notes

**Project:** OurHinduDharm Panchang  
**Research date:** 2026-10-14  
**Branch:** `data/festival-json-foundation`  
**Status:** Source locator confirmed; relevant Khemraj images (printed pp. 31–33) and Rajvaidya images (printed pp. 32–33) were visually inspected on 2026-10-14. Some rule semantics remain unresolved.

## Primary scan supplied by project owner

Kāśīnātha Upādhyāya, *Dharmasindhu*, 1907 Sanskrit edition, Khemraj Shrikrishnadas, Bombay, printed p. 17.

- [Internet Archive BookReader, page 17](https://archive.org/details/kict-dharmasindhu-by-kashinath-upadhyay-sanskrit-dharma/page/%28%E0%A5%A7%E0%A5%AD%29/mode/1up)
- Repository images are now available under `data/references/`. See [Dharmasindhu image collation (2026-10-14)](dharmasindhu-image-collation-2026-10-14.md) for inspected files, working transcriptions, and remaining interpretation questions.

## Clauses in the owner-supplied transcription

The pasted OCR excerpt appears to include these distinct topics:

1. Pāraṇa for Pradoṣa-related vows.
2. When Dvādaśī is extended: pāraṇa after crossing the Hari-vāsara interval.
3. When not even a kalā of Dvādaśī remains: pāraṇa on Trayodaśī.
4. When Dvādaśī is present at midday: one view allows pāraṇa within the first three morning muhūrtas and not after midday; another view prefers the afternoon because multiple ritual timings may otherwise conflict.
5. Śravaṇa-Dvādaśī, including a special case involving Viṣṇu-śṛṅkhala.
6. Dvādaśī restrictions and distinctions between optional/desire-based and regular observances.
7. Eight Mahādvādaśī names and associated tithi/nakṣatra combinations.

This is a research outline, not a certified diplomatic transcription. OCR visibly corrupts several Sanskrit words. Do not silently repair uncertain readings.

## Rules for implementation research

- Keep the decision of the fasting day separate from pāraṇa timing.
- Preserve competing views explicitly where the text says “बहवः” and “केचित्”; do not flatten them into a single universal rule.
- Śravaṇa-Dvādaśī, Viṣṇu-śṛṅkhala, and each Mahādvādaśī condition require separate test profiles.
- Do not infer executable rules from a partial OCR excerpt alone. Verify surrounding context and exact printed wording first.
- Do not conflate this 1907 edition with the separate 1888 Nirṇaya Sāgara edition/page locator previously recorded in the source audit.

## Synthetic test cases to add

| Case | Fixture | Expected research behaviour |
|---|---|---|
| P1 | Dvādaśī interval ends before the relevant pāraṇa window | Evaluate the explicitly sourced fallback; do not assume without source confirmation |
| P2 | Dvādaśī interval extends; Hari-vāsara still active | Pāraṇa must respect the sourced Hari-vāsara rule |
| P3 | No Dvādaśī interval exists on the following civil day | Evaluate the text's Trayodaśī pāraṇa clause |
| P4 | Dvādaśī extends into midday | Preserve both source-attributed views as separate profiles/options |
| P5 | Śravaṇa yoga occurs on Dvādaśī | Evaluate the special Śravaṇa-Dvādaśī profile |
| P6 | Viṣṇu-śṛṅkhala condition is met | Evaluate the special clause independently; verify the exact combination first |
| P7 | Each of the eight Mahādvādaśī combinations | Test each tithi/nakṣatra condition independently |
| P8 | Required event time is missing or exactly on a boundary | Return a transparent unresolved result or apply a documented boundary rule; never invent a time |

These are synthetic fixtures, not real festival dates. Expected outcomes remain provisional until the source text is visually checked and the exact time definitions are documented.

## Next research gate

1. The uploaded pages have been visually inspected; consult [the image-collation note](dharmasindhu-image-collation-2026-10-14.md) for the current working reading.
2. Still check the precise anchor for the three morning muhūrtas and the context of the Trayodaśī fallback.
3. Resolve the grammar/scope of the conjunction-end pāraṇa sentence and the operational meaning of `दिनवृद्धि`.
4. Check the cross-referenced Bhādrapada Śravaṇa-Dvādaśī / Viṣṇu-śṛṅkhala section.
5. Compare selected real dates against a named independent almanac before proposing any runtime change.

**Safety boundary:** documentation-only research. No changes to `data/festivals.json`, runtime JavaScript, legacy dates, Blogger output, or PR merge state.


## Working decoding for rule design (from the supplied Sanskrit text)

This section moves from topic listing to an operational interpretation. It is a working decoding of the owner's transcription, not a claim that every OCR character has been visually certified.

### 1. Hari-vāsara and pāraṇa

Transcribed clause:
> द्वादशीभूयस्त्वे द्वादशीप्रथमपादं हरिवासरसंज्ञकमुल्लंघ्य पारणं कार्यम् ॥

**Working meaning:** in the stated Dvādaśī-adhikya situation, the first quarter of Dvādaśī is called Hari-vāsara; pāraṇa is to be performed after crossing/passing that interval.

**Rule-design consequence:** the system needs the Dvādaśī start and end timestamps, plus the exact source-defined meaning of “first quarter” for this rule. It must not use a fixed clock time or simply equate Hari-vāsara to an arbitrary fraction of the civil day. The exact anchor and duration should be confirmed from the surrounding passage / source definition before coding. Until then, output a pending rule result rather than a fabricated time.

### 2. No Dvādaśī even for one kalā

Transcribed clause:
> कलामात्राया अपि द्वादश्या अभावे त्रयोदश्यां पारणम् ॥

**Working meaning:** when even a kalā-long presence of Dvādaśī is absent in the case under discussion, pāraṇa is performed on Trayodaśī.

**Rule-design consequence:** this is a fallback for a defined tithi configuration, not permission to move every late pāraṇa to Trayodaśī. The decision needs the exact relevant day and tithi interval, and the meaning of “kalā” in this context. Do not hard-code “kalā” as a duration until its contextual definition is established.

### 3. Dvādaśī present at midday — two attributed views

Transcribed clause:
> द्वादश्या मध्याह्ने सत्त्वे प्रातर्मुहूर्तत्रयमध्य एव पारणं न मध्यादूर्ध्वम् इति बहवः ।
> बहूनां कर्मकालानां बाधापत्तेरपराह्ण एव इति केचित् ॥

**Working meaning:** when Dvādaśī is present at midday, the majority view (“बहवः”) places pāraṇa within the first three morning muhūrtas and not after midday. Another view (“केचित्”) places it in the afternoon, reasoning that many other ritual times would otherwise be obstructed.

**Rule-design consequence:** keep these as two named rule opinions, not one merged condition. The source's “morning three muhūrtas” anchor must be established before calculating a window; a muhūrta is conventionally 48 minutes, but that alone does not tell us the rule's precise start point. The selected profile should state which view it follows, or expose the disagreement if no profile has been selected.

### 4. Śravaṇa-Dvādaśī

The transcribed passage describes a Dvādaśī coinciding with Śravaṇa nakṣatra and distinguishes ability-based practice: a capable observer may fast on both Ekādaśī and Dvādaśī; a person unable to do so may use the stated fruit-only alternative on Ekādaśī and fast on Śravaṇa-Dvādaśī. A separate Viṣṇu-śṛṅkhala clause instructs fasting on Ekādaśī for the Śravaṇa-Dvādaśī observance and pāraṇa on Dvādaśī when Śravaṇa no longer coincides. It also says that if Śravaṇa's duration is shorter than Dvādaśī, pāraṇa is on Dvādaśī while Śravaṇa is still joined, citing the fault of crossing Dvādaśī.

**Rule-design consequence:** this is not just a festival label. Evaluate the overlap intervals of Dvādaśī and Śravaṇa, plus the special Viṣṇu-śṛṅkhala condition. Do not implement the ability-based alternatives as automatic astronomical choices; they are observance choices. Exact yoga construction and the OCR reading around these clauses need confirmation before executable logic.

### 5. Eight Mahādvādaśīs — initial decoding

The supplied text names these combinations:

1. **Unmīlanī:** a Dvādaśī joined with a pure/extended Ekādaśī condition (the OCR wording around “śuddhādhikāikādaśī-yuktā” needs exact reading).
2. **Vañjulī:** Dvādaśī itself is pure and extended.
3. **Trispr̥śā:** sunrise on one day with Ekādaśī, a waning/ending Dvādaśī, and Trayodaśī at the second sunrise, with three tithis touching a single ahorātra (exact compound is OCR-corrupt).
4. **Pakṣavardhinī:** a day increase associated with Amāvāsyā or Pūrṇimā.
5. **Jayā:** Dvādaśī joined with Puṣya nakṣatra.
6. **Vijayā:** Dvādaśī joined with Śravaṇa nakṣatra.
7. **Jayantī:** Dvādaśī joined with Punarvasu nakṣatra.
8. **Pāpanāśinī:** Dvādaśī joined with Rohiṇī nakṣatra.

The passage says these are observed by those seeking destruction of sin and liberation; Śravaṇa-yuta is described as obligatory/regular like Ekādaśī in the supplied OCR. The first three tithi-duration definitions are not safe to implement from the OCR paraphrase alone; retain them as distinct named profiles pending exact text. The four nakṣatra-linked combinations can be tested as separate overlap conditions once the tithi/day-selection details are fixed.

### 6. Minimum inputs and safe outputs

For any future implementation of these clauses, the decision function must receive:
- local sunrise for each relevant civil date;
- exact start/end instants for Ekādaśī, Dvādaśī, and Trayodaśī;
- Śravaṇa (or other named nakṣatra) start/end instants;
- the chosen observance profile and, for the midday pāraṇa clause, the selected textual view;
- the source rule identifier and timezone/location.

It should return the chosen observance/pāraṇa date, the valid time window if determinable, a human-readable reason, the rule/source identifier, and an explicit unresolved state when a required definition or timestamp is missing. Date selection, fasting choice, and pāraṇa timing remain separate outputs.

### Immediate next step

Turn the decoded clauses above into exact synthetic test fixtures, including just-before / exactly-at / just-after boundaries. Then verify the uncertain compounds and time anchors from the supplied PDF text as needed. Do not block the clear rule extraction on edition comparison, and do not modify production dates or runtime code until these cases have expected results.
