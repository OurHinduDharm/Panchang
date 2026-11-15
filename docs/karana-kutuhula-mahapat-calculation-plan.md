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
6. **Verses 8–9 / middle (verified against printed pp. 108 and 192–193):** after the krānti/śara corrections, construct the remaining angular difference. The p.108 commentary explicitly describes dividing the remaining angular amount by the aśuddha-khaṇḍa to obtain the residual angular part, then converting the corrected angular amount to time by proportion against the Moon's motion (60 ghaṭikās for one full 360° revolution; in the commentary's notation the time conversion is expressed as angular minutes/seconds divided by lunar motion). Apply the elapsed/future sign from the earlier past/future decision to the reference epoch when the Sun–Moon sāyana longitude sum reaches the relevant 12-rāśi/6-rāśi boundary. The worked example on printed pp. 192–193 supplies a full numerical trace: the middle is then checked by recomputing solar krānti and lunar krānti corrected by śara; the commentary reports the two krāntis as equal to within a very small residual. This is the acceptance fixture; do not replace this sequence with a generic declination root solver.
7. **Verse 10:** apply the stated exception that reverses the ordinary past/future decision in the specified krānti/śara remainder case.
8. **Verse 11 / half-duration:** Sumatiharsa explicitly calls the quotient a time in ghaṭi etc. The formula is 2203 divided by the aśuddha-khaṇḍa; this is the half-duration on either side of the corrected middle. Keep this separate from the alternative verse 14 method.

## Independently checked 1902 printed commentary: verses 5–9

The Jain Quantum searchable transcription of the 1902 Venkatesvara Press edition exposes the pātādhikāra commentary around printed pp. 132–139 (book pages 134–143 in the scan). This is a second edition cross-check, not a replacement for the 1991 working edition.

- Printed p. 132 / scan page 136: the commentary explicitly numbers the 24 signed positions in four six-position blocks: six forward positive, six reverse negative, six forward positive, six reverse negative. It then divides the sāyana Moon and sapāta Moon longitudes separately by 15°.
- Same example: sāyana Moon 4;29;5;21 = 149°;5;21 gives quotient 9 and remainder 14;5;21; sapāta Moon 6;11;53;30 = 191°;53;30 gives quotient 12 and remainder 11;53;30. Thus the 10th krānti position is -299 and the 13th śara position is +70.
- Printed pp. 134–135 / scan pages 138–139: verses 5–7 direct the past/future arrangement of elapsed/coming khanda positions. The side with the smaller angular remainder gets its bhogya khanda placed singly; the other side's positions are placed in two positions. The commentary explicitly applies the 13th-part correction to the bhogya krānti-khaṇḍa first, then applies śara-khaṇḍa corrections. Same-sign values are added and opposite-sign values subtracted; the commentary further distinguishes same/different celestial hemispheres.
- Printed pp. 135–136 / scan pages 139–140: verse 8 constructs multipliers from the smaller arc-remainder, the difference between the two arc-remainders, and (where applicable) the fourth/sixth khanda positions. These multipliers are applied to the khanda values; the source then subtracts the portions that can be cleared from 15 × lunar śara, divides the remaining amount by the uncorrected/ashuddha khanda, and adds the resulting fractional part to the sum of the cleared khanda contributions.
- Verse 9 converts the resulting arc amount to time by multiplying by 60 and dividing by the Moon's motion. The earlier past/future classification determines whether this interval is subtracted from or added to the reference epoch.
- Printed pp. 142–143 / scan pages 146–147 give a second worked example and explicitly check the middle by comparing solar krānti with lunar krānti corrected by śara.

Implementation status after this cross-check:
- Verse 4 dual-longitude extraction is implemented.
- Source-explicit 1-based signed-table lookup is implemented.
- Source-explicit smaller-remainder bhogya-side selection is implemented.
- The actual two/three-position past/future layout, hemisphere-aware sign corrections, verse 8 multiplier arithmetic, and verse 9 time conversion are still NOT implemented. Do not imply that the current helper functions complete verses 5–9.

## Newly verified worked-example checkpoints (1991 edition, printed pp. 192–193)

The p.192 worked example starts from the stated epoch/date and gives these intermediate items in the OCR/transcription: sāyana Moon longitude `23;5;12;1` (sexagesimal rāśi/degree/minute/second notation in the printed layout), quotient 15 → krānti khanda index 15 with bhogya khanda 2 and remainder `10;12;15;19`; sapāta Moon longitude `3;50;58;29`, quotient 15 → śara khanda index 3 with two elapsed khanda and third bhogya, base śara-khaṇḍa 70, remainder `5;58;29`. The text then combines the signed krānti/śara contributions according to the past-pāta case. OCR digits in several later intermediate rows are compressed and must be checked against the page image before being used as exact numeric fixtures. The p.193 continuation reports the middle and tests equality of Sun's krānti with Moon's krānti corrected by śara. Use the qualitative sequence and clear checkpoint fields now; do not hard-code ambiguous OCR numerals.

The p.108 verse 11 worked example is also important: OCR gives `2203 / 329 = 5;37`, which is arithmetically inconsistent. The user has confirmed the original printed text says 329, not that the arithmetic is correct. Keep the first example quarantined; do not silently alter 329 to 392. The separate second example on p.109 gives aśuddha-khaṇḍa 184;9, midpoint 12;49, sthiti 11;57, sparśa 0;52 and mokṣa 24;46, and remains the clean verse-11 golden test.

## Critical implementation guardrails

- Keep all angular quantities in a single documented unit (prefer arcseconds internally); keep time as integer seconds or exact rational values.
- Keep quotient/remainder extraction separate from ghati/pala conversion.
- Keep past/future, quadrant, hemisphere, and sign decisions explicit; do not hide them in numeric absolute values.
- Do not assume the 24-khanda table orientation solely from a prose summary; verify against the source's worked example.
- Do not round intermediate khanda corrections. Round/truncate only where the source's worked example demonstrates.
- The modern independent check is equality of geocentric apparent declinations at the candidate middle, using the same apparent/equinox convention. It is a validation check, not a replacement for the classical khanda algorithm.
- The printed 2023–24 Tara Prasad Divya Panchang reference values are stored separately in `data/reviews/mahapat-2023-2024-reference.json`. Raw printed time strings are preserved exactly. The user confirmed that the Panchang intentionally writes continuous hours as 23:00, 24:00, 25:00 and onward. Therefore HH:MM is elapsed clock time from 00:00 on the printed date; 25:41 means 01:41 on the following civil date in IST. The JSON stores both the raw printed value and the derived Asia/Kolkata ISO instant.

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


## Fresh source extraction: verses 7–9 (1991 searchable PDF transcription)

A fresh search of the 1991 PDF surfaced the complete Sanskrit commentary block for verses 7–9. This materially clarifies the sequence, but the OCR's compressed sexagesimal numerals still require page-image verification before becoming numeric fixtures.

- Verse 7 commentary explicitly says to correct the bhogya krānti-khaṇḍa by its *viṃśāṃśa?* No: the printed/OCR phrase is **त्रयोदशांशकेन (13th part)**. Sudhākara's explanation below independently writes the proportion **15/13**. Therefore the correction is tied to the 15-degree division and the 13-part relation; do not implement it as an arbitrary blanket multiplication of every khanda by 13/15. The bhogya krānti-khaṇḍa is corrected first, then the shara-khaṇḍas are applied. Same/different sign and same/opposite hemisphere determine addition/subtraction.
- Verse 8's commentary gives an explicit multiplier construction: use the initial desired pāta-arc amount and the difference between the two pāta-arc amounts; where possible use the sixth khanda; form the corresponding 15-part multipliers, then use the remainder to multiply the third-part khanda. The OCR wording is compact and needs line-by-line page-image reading before coding.
- After forming those products, subtract from **15 × lunar śara (in kalā)** as many portions as can be cleared. Divide the remaining quantity by the aśuddha (uncorrected) clear khanda. Add the resulting fractional part to the sum of the already-cleared khanda contributions.
- Verse 9 then multiplies the resulting angular amount by 60 and divides by lunar motion to obtain time. For a past pāta, subtract the interval from the reference instant at which the relevant longitude sum reaches 12 rāśis; for a future pāta, add it.
- The searchable commentary includes a numerical trace with residual **63215**, divisor **32**, quotient shown as **0;12;7;23** (OCR), and lunar motion **47150**, giving a time quotient shown as **0;10;18** (OCR). These values are preserved as a *transcription checkpoint only*, not yet as a test: the printed sexagesimal column headings and glyphs must be checked visually.

Source: 1991 *Karaṇakutūhalam*, Pātādhikāra, verses 7–9 and Sumatiharsa/Sudhākara commentaries; searchable PDF https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf (search extraction ref in research log: `turn624753search0`).

**Implementation decision:** no formula code is added from OCR alone. Next required action is to inspect the actual scanned page for this commentary block, transcribe the sexagesimal column labels and worked arithmetic, then implement each operation as a named pure function with a source-numbered fixture.
