# Karaṇa-kutūhala Mahāpāta calculation: implementation notes

Status: research/implementation specification; no public times approved.

## Source boundary

Primary working source: Bhāskarācārya, *Karaṇa-kutūhala*, Pātādhikāra (chapter 9 in the 1991 Krishnadas Sanskrit Series 129 edition), with Sumatiharsa's *Gaṇakakumudakaumudī* commentary and Sudhākara Dvivedi's *Vāsanāvibhūṣaṇa* commentary. Cross-check against the 1902 edition where available.

The 1991 source's own worked example must control over a modern paraphrase. Do not silently replace its khanda method with a generic declination root solver.

## What the source actually prescribes

1. **Pāta family / approximate epoch (verse 1):** use ayanāṃśa-corrected (sāyana) Sun and Moon longitudes. A sum near 6 rāśis (180°) is the Vyatipāta reference; a sum near 12 rāśis (360°) is the Vaidhṛti reference. The excess/deficit in arcminutes is converted to elapsed/remaining time using the sum of the Sun's and Moon's motions. This gives an initial epoch, not yet the final corrected middle.
2. **Past/future decision (verses 2–3):** compute the contemporaneous Sun, Moon, and lunar-pāta correction; derive the śara and use the Moon's quadrant/pada and hemisphere relationship to decide whether the pāta is past or forthcoming. Do not decide this from longitude sum alone.
3. **Khanda tables:** the commentary defines 24 signed positions for both krānti-khaṇḍas and śara-khaṇḍas. The six-value base tables in `karana-kutuhula-khanda-tables.mjs` are retained as source transcriptions, but the orientation/indexing must be validated against the printed worked example before use.
4. **Verse 4 / khanda extraction:** divide the sāyana Moon and sapāta Moon longitudes separately by 15°. The quotient is the khanda index and the angular remainder is the within-khanda remainder. The remainder is not time. The commentary gives a worked example for both longitudes.
5. **Verses 5–7 / corrections:** arrange past and future khanda sequences separately, according to the pāta direction; place the smaller of the relevant krānti/śara remainders as the bhogya khanda; apply the 1/13 correction to the bhogya krānti-khaṇḍa and then apply the corresponding śara-khaṇḍa correction. Same-sign and opposite-sign cases require distinct addition/subtraction.
6. **Verses 8–9 / middle:** combine the corrected khanda contributions, remove the completed 15-part blocks, divide the remaining amount by the appropriate uncorrected (aśuddha) khanda, and convert the resulting angular/time fraction using the Moon's motion. The commentary's worked numerical example is the acceptance fixture for this step. Re-evaluate Sun and Moon at the resulting middle and check equality of their corrected declinations; if not equal, the middle is not accepted.
7. **Verse 10:** apply the stated exception that reverses the ordinary past/future decision in the specified krānti/śara remainder case.
8. **Verse 11 / half-duration:** Sumatiharsa explicitly calls the quotient a time in ghaṭi etc. The formula is 2203 divided by the aśuddha-khaṇḍa; this is the half-duration on either side of the corrected middle. Keep this separate from the alternative verse 14 method.

## Critical implementation guardrails

- Keep all angular quantities in a single documented unit (prefer arcseconds internally); keep time as integer seconds or exact rational values.
- Keep quotient/remainder extraction separate from ghati/pala conversion.
- Keep past/future, quadrant, hemisphere, and sign decisions explicit; do not hide them in numeric absolute values.
- Do not assume the 24-khanda table orientation solely from a prose summary; verify against the source's worked example.
- Do not round intermediate khanda corrections. Round/truncate only where the source's worked example demonstrates.
- The modern independent check is equality of geocentric apparent declinations at the candidate middle, using the same apparent/equinox convention. It is a validation check, not a replacement for the classical khanda algorithm.
- The printed 2023–24 Tara Prasad Divya Panchang reference values are stored separately in `data/reviews/mahapat-2023-2024-reference.json`. Raw printed time strings are preserved exactly; values greater than 24:00 must not be normalized until the table's time notation is confirmed.

## Immediate implementation order

1. Lock verse 4 quotient/remainder and 24-table indexing to the worked example.
2. Implement verses 5–7 as pure functions with signed fixtures.
3. Reproduce the verse 8–9 worked middle calculation exactly.
4. Implement verse 11 half-duration and calculate contact interval.
5. Compare the same events against the 2023–24 printed reference table.
6. Only then test the modern declination-equality check and explain any convention differences.

## Source references

- 1991 edition, Pātādhikāra: printed pages 103–109; especially Sumatiharsa commentary around the khanda layout, verse 4–10, and the verse 11 worked sthiti example.
- Searchable PDF: https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf
- Independent conceptual cross-check: *Indian Astronomy: A Source Book*, chapter 11, section on Vyatipāta and Vaidhṛta. This describes the longitude-sum approximation, declination equality, and iterative correction, but does not override Karaṇa-kutūhala's own procedure.
