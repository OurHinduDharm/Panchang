# Dharmasindhu p. 17 — Ekadashi pāraṇa and Dvādaśī decision notes

**Project:** OurHinduDharm Panchang  
**Research date:** 2026-10-14  
**Branch:** `data/festival-json-foundation`  
**Status:** Source locator confirmed by project owner; visual collation still pending.

## Primary scan supplied by project owner

Kāśīnātha Upādhyāya, *Dharmasindhu*, 1907 Sanskrit edition, Khemraj Shrikrishnadas, Bombay, printed p. 17.

- [Internet Archive BookReader, page 17](https://archive.org/details/kict-dharmasindhu-by-kashinath-upadhyay-sanskrit-dharma/page/%28%E0%A5%A7%E0%A5%AD%29/mode/1up)
- The owner supplied a direct BookReader page-image endpoint in the conversation. It could not be independently loaded in this session, so this note does **not** claim visual collation of the scan.

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

1. Obtain independent visual access to the supplied scan and collate the whole printed page, not just a single line.
2. Transcribe the relevant Sanskrit clauses with uncertain characters marked.
3. Check the cited Hari-vāsara, muhūrta, and kalā definitions in the surrounding text and parallel source passages.
4. Update `data/references/vrata-decision-test-matrix.md` only after these readings are settled.
5. Compare selected real dates against a named independent almanac before proposing any runtime change.

**Safety boundary:** documentation-only research. No changes to `data/festivals.json`, runtime JavaScript, legacy dates, Blogger output, or PR merge state.
