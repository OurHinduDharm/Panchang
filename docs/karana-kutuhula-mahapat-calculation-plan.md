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

- Verse 7 commentary in the 1902 Sumatiharsa edition explicitly glosses **विश्वांशकेन** as **त्रयोदशांशकेन** and prints the numeral 13. The 1991 transcription also gives the 13th-part reading. This correction applies first to the bhogya krānti-khaṇḍa, not as a blanket correction to every khanda. The commentary then applies the shara-khaṇḍas. Same/different sign and same/opposite hemisphere determine addition/subtraction. Keep the exact arithmetic operation as a separate named step until the worked-example row arithmetic is fully reproduced.
- Verse 8's commentary gives an explicit multiplier construction: use the initial desired pāta-arc amount and the difference between the two pāta-arc amounts; where possible use the sixth khanda; form the corresponding 15-part multipliers, then use the remainder to multiply the third-part khanda. The OCR wording is compact and needs line-by-line page-image reading before coding.
- After forming those products, subtract from **15 × lunar śara (in kalā)** as many portions as can be cleared. Divide the remaining quantity by the aśuddha (uncorrected) clear khanda. Add the resulting fractional part to the sum of the already-cleared khanda contributions.
- Verse 9 then multiplies the resulting angular amount by 60 and divides by lunar motion to obtain time. For a past pāta, subtract the interval from the reference instant at which the relevant longitude sum reaches 12 rāśis; for a future pāta, add it.
- The searchable commentary includes a numerical trace with residual **63215**, divisor **32**, quotient shown as **0;12;7;23** (OCR), and lunar motion **47150**, giving a time quotient shown as **0;10;18** (OCR). These values are preserved as a *transcription checkpoint only*, not yet as a test: the printed sexagesimal column headings and glyphs must be checked visually.

Source: 1991 *Karaṇakutūhalam*, Pātādhikāra, verses 7–9 and Sumatiharsa/Sudhākara commentaries; searchable PDF https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf (search extraction ref in research log: `turn624753search0`).

**Implementation decision:** no formula code is added from OCR alone. Next required action is to inspect the actual scanned page for this commentary block, transcribe the sexagesimal column labels and worked arithmetic, then implement each operation as a named pure function with a source-numbered fixture.


## Further verified source extraction: 1902 worked example, verses 7–9

The independent 1902 Sumatiharsa transcription is now accessible continuously around printed pp. 134–146. This avoids relying on the compressed 1991 OCR for the verse 8 arithmetic sequence.

- Printed p. 135 explicitly explains the verse 7 reading: **विश्वांशकेन १३ त्रयोदशांशकेन**. It says to correct the bhogya krānti-khaṇḍa first, then apply the śara-khaṇḍas. The sign rule is explicit: same-sign quantities combine by addition; unlike signs by difference, with the hemisphere/gola rule determining the applicable orientation.
- Printed p. 136 explains the verse 8 multipliers: the first multiplier is the smaller chāpāṃśa; the difference between the two chāpāṃśas supplies the multiplier for the even-position khanda. If the fourth khanda is available, the sixth is also multiplied; the remaining odd-position khanda uses the residual after the relevant 15-part subtraction. The commentary then calls the products *svāṃśaghna* khandas.
- The commentary says to subtract from **15 × lunar śara (in kalā)** as many *svāṃśaghna* khanda portions as can be cleared. Divide the remaining amount by the aśuddha sphuṭa-khaṇḍa (not by the multiplier-adjusted khanda); add this quotient to the sum of the cleared khanda contributions. Multiply the resulting angular amount by 60 and divide by lunar motion to obtain elapsed/remaining days.
- A first worked trace on printed pp. 136–137 reports a remaining quantity OCR'd as **832;15**, aśuddha khanda **392**, quotient **0;27;23**, lunar motion **741;50**, and time **0;10;18**. Preserve these as source transcription checkpoints only; the sexagesimal place values still need a page-image check before treating them as machine fixtures.
- A second worked example on printed pp. 142–143 independently gives aśuddha khanda **184;9**, quotient **3;28;25**, lunar motion **829;35**, time **0;1;15**, and corrected middle **12;49**. It then checks solar krānti against lunar krānti corrected by śara; the printed difference is very small. This provides a second numeric trace for later exact reproduction.
- The 1902 text confirms verse 10's exception: if the bhogya krānti-khaṇḍa is subtracted from the bhogya śara-khaṇḍa in the specified way, the ordinary past/future classification reverses.

Source page references: Jain Quantum transcription of the 1902 Venkatesvara Press edition, printed pp. 134–146, especially pp. 135–137 and 142–143: https://jainqq.org/booktext/Karan_Kutuhalam/034533

Implementation decision: the exact source sequence is now sufficiently clear to design the verse 8 helper API, but the sexagesimal row arithmetic and the complete past/future khanda layout must be reproduced against the two worked examples before the public solver is wired. No public Mahāpāta times are approved.


## Verse 5–6 layout rule now encoded as a tested intermediate

The 1902 Sumatiharsa commentary (printed pp. 133–135) makes the layout rule explicit:

- Divide the sāyana Moon and sapāta Moon longitudes separately by 15°. The quotient identifies the elapsed khanda count; the next khanda is the bhogya khanda.
- Read each side's signed khanda table from the corresponding quotient-derived position. The source example confirms 10th krānti = −299 and 13th śara = +70.
- For the middle construction, the side with the smaller chāpāṃśa uses **two** middle khandas; the side with the larger chāpāṃśa uses **three**. The bhogya khanda is placed singly on the smaller-remainder side; the other khanda placements are doubled as described by the commentary.
- The code now records the source-defined 2-versus-3 middle-khanda count in `selectMahapataBhogyaKhandas()` and tests both possible smaller-side branches. It intentionally does not yet emit a chronological past/future list or apply sign corrections: the exact ordering must be tested against both complete examples.

## Worked-example arithmetic: corrected transcription checkpoints

The 1902 printed p.136 example gives the following trace (OCR transcription, notation preserved):

- Remaining amount: **832;15**
- Aśuddha sphuṭa-khaṇḍa: **392**
- Quotient: **0;27;23**
- Lunar motion: **741;50**
- Converted interval: **0;10;18**

This replaces the earlier 1991 OCR checkpoint **63215 / 32** in the working notes. Do not use the older OCR figures as test data.

The second 1902 example on printed pp.141–143 gives a clearer independent trace:

- Sāyana Moon: **23;5;21;51**; quotient 15, bhogya krānti-khaṇḍa 236, remainder **10;21;51**.
- Sapāta Moon: **3;50;58;29**; quotient 23, bhogya śara-khaṇḍa **−70**, remainder **5;58;29**.
- Since the śara remainder is smaller, śara uses two middle khandas and krānti uses three.
- After the signed krānti/śara corrections, the source reports residual śara **641;0**, aśuddha sphuṭa-khaṇḍa **184;9**, quotient **3;28;25**, ×60 result **208;51**, lunar motion **829;35**, and interval **0;1;15**.
- Corrected middle: **12;49**. The source checks solar krānti against lunar krānti corrected by śara; the difference is only **0;18** (small enough for the commentary's stated acceptance).

The source's sexagesimal columns and unit labels are not sufficiently explicit in this searchable transcription to safely turn the above time-conversion figures into executable numeric fixtures yet. The intermediate quotient and the two-versus-three layout can be tested independently; do not infer the output unit from the printed label alone.

Source: 1902 *Karaṇakutūhalam* with Sumatiharsa commentary, Jain Quantum searchable edition, printed pp.133–143: https://jainqq.org/booktext/Karan_Kutuhalam/034533

## Updated next implementation order

1. Build a source-indexed placement trace for both examples, including 24-position wrap and past/future orientation; verify against the source's explicit 10th/13th and 16th/24th bhogya khanda checkpoints.
2. Implement the hemisphere-aware krānti/śara sign corrections as exact rational arithmetic.
3. Implement verse 8's multiplier and shara-clearing algorithm with the second example as the primary golden trace.
4. Resolve the exact sexagesimal unit for the verse 9 time conversion from the printed column headings; only then encode time conversion.
5. Reproduce both worked middles and check equality of solar krānti and lunar krānti corrected by śara.
6. Compare the resulting events against the user's 2023–24 printed reference table.


## Verse 8–9: exact 1902 commentary wording and arithmetic boundary (15 Nov 2026)

The full 1902 searchable page text is now available continuously at Jain Quantum, printed pp. 134–142 (scan pages 138–146). This allows the formula to be read directly rather than reconstructed from the shorter summary.

### Verse 8 multiplier sequence (printed p. 136)

The commentary reads:

> आद्येच्छापाशांशमितो गुणः स्यादुभयोश्चापांशान्तरेण विचतुर्थे सति सम्भवे षष्ठं खण्डं गुणयेत् ... पञ्चदशायः संशोध्य शेषेण तृतीयपञ्चमखण्डं गुणयेत् ...

Operationally, it states:
1. The first multiplier is the smaller of the two chāpāṃśa remainders.
2. The difference between the two chāpāṃśas supplies the multiplier for the even-position khanda.
3. If the fourth-position khanda is available, multiply the sixth-position khanda as well.
4. Subtract the specified 15-part amount; use the remainder as multiplier for the third/fifth-position khanda.
5. These products are the svāṃśaghna khandas.

Then the commentary explicitly says to clear as many of these products as possible from 15 × lunar śara (kalā), divide the remaining amount by the aśuddha sphuṭa-khaṇḍa (not by a multiplier-adjusted khanda), and add that quotient to the sum of the multipliers belonging to the cleared khandas. Finally multiply by 60 and divide by lunar motion. For a past pāta subtract this interval from the reference epoch; for a future pāta add it.

Source transcription: Jain Quantum, page 140 (printed p. 136), https://jainqq.org/explore/034533/140. The verse and commentary are also reproduced in the 1991 PDF.

### What is now independently confirmed

- Page 139 (printed p. 135) gives the 1/13 correction and explicit sign/hemisphere handling. Same-sign krānti values combine; unlike-sign values take their difference, with the gola rule deciding the orientation. The śara corrections are then applied. Source: https://jainqq.org/explore/034533/139.
- Page 138 (printed p. 134) gives the elapsed/future arrangement and the 2-versus-3 middle-khanda rule, including the first example's chāpāṃśas 14;5;21 and 13;53;30. Source: https://jainqq.org/explore/034533/138.
- Page 145 (printed p. 141) independently confirms the second example's inputs: sāyana Moon quotient 15, bhogya krānti khanda 236, remainder 10;21;51; sapāta Moon quotient 23, bhogya śara khanda −70, remainder 5;58;29. It explicitly says the śara remainder is smaller and places the śara bhogya singly. Source: https://jainqq.org/explore/034533/145.
- Page 146 (printed p. 142) gives the second example's residual 641;0, aśuddha khanda 184;9, quotient 3;28;25, ×60 result 208;51, lunar motion 829;35, and interval 0;1;15. It then checks solar and corrected lunar krānti; their difference is 0;18, accepted as negligible. The same page gives verse-11 sthiti 2203 / 184;9 = 11;57 ghaṭi, midpoint 12;49, sparśa 0;52, mokṣa 24;46. Source: https://jainqq.org/explore/034533/146.

### Remaining precision gate

The prose now fixes the operations, but the exact chronological list of khanda positions and the sexagesimal column/unit interpretation of the verse-9 worked conversion still need a full line-by-line numerical reproduction. In particular, do not assume the 0;1;15 output is a civil-clock format or convert it into minutes without reconciling the printed columns. Do not write a public event solver yet. The next code change should only follow after both worked examples reproduce the intermediate multiplier products, cleared-khanda count, residual quotient, and corrected middle.


## Both printed examples now lock the 24-position indexing (15 Nov 2026)

The source's table orientation is no longer merely an inferred expansion. Printed p.132 explicitly states the four consecutive blocks: six in krama order with positive sign, six in reverse order with negative sign, six again in krama order with positive sign, and six in reverse order with negative sign. Printed p.133 then checks the first example against the table: 10th krānti position = −299 and 13th śara position = +70. Printed p.141 checks the second example: 16th krānti position = +236 and 24th śara position = −70. Thus the existing 24-position expansion and 1-based indexing agree with both independent worked examples. Sources: https://jainqq.org/explore/034533/136 and https://jainqq.org/explore/034533/137 and https://jainqq.org/explore/034533/145.

A new regression test now fixes the second example's 16th/24th positions, its two angular remainders (10;21;51 and 5;58;29), the smaller-śara selection, and the 3-krānti/2-śara middle-khanda count. This complements the first example's existing 10th/13th fixture.

### Important distinction preserved

The printed source establishes the khanda table order and the past/future choice of which elapsed/coming positions are arranged. It does not justify collapsing the sign work into a simple signed-table lookup: the commentary separately applies the 1/13 bhogya-krānti correction and then the gola-aware krānti/śara sign rules. Those steps remain separate and are not yet encoded as a public solver.

### Verse 9 time unit remains blocked

The 1902 text prints the second example's quotient 3;28;25, its multiplication by 60 as 208;51, lunar motion 829;35, and result 0;1;15 (page 146). The arithmetic quotient 208;51 ÷ 829;35, interpreted as ordinary sexagesimal arc-minute quantities, does not by itself explain the printed 0;1;15 notation. Therefore the numerical sequence is preserved verbatim, but its final time unit is not guessed or converted into modern clock minutes. A page-image/column-heading check and reconciliation with the first example are still required before verse 9 is coded.

## Verse 9: time-unit interpretation narrowed by the worked example (15 Nov 2026)

A useful correction to the OCR-based reading is now established. On printed p.142, the text first gives the derived interval in a damaged/OCR-ambiguous form after “दिनादि”, but a few words later explicitly repeats the same interval as **0;15;13**: “अत्र कालात् ० । १५ । १३ एभिर्गतः पातः”. The same page then adds this to the epoch time and obtains the pāta midpoint at 12;49 ghaṭi after sunrise. Thus the intended interval is a day–ghaṭi–pala style quantity, not a civil clock time; the OCR sequence “० । १ । १५” must not be trusted. Source: https://jainqq.org/explore/034533/146.

The first worked example independently supports the day/ghaṭi/pala interpretation. Its printed arithmetic is 832;15 ÷ 392 = 2;7;23 (the OCR can misread the first field), then ×60 ÷ 741;50 = 0;10;18. Interpreting the last result as 0 days, 10 ghaṭi, 18 pala is consistent with the subsequent day-fraction conversion. The printed p.136 passage should therefore be transcribed with care rather than copying the OCR string blindly. Source: https://jainqq.org/explore/034533/140.

### Remaining arithmetic discrepancy—do not code yet

The second example's extracted numbers still do not reproduce each other under straightforward base-60 arithmetic:
- 641;0 ÷ 184;9 gives approximately 3;28;51, not the printed 3;28;25.
- Using the printed 3;28;25, then ×60 ÷ 829;35 gives approximately 0;15;04, not the later explicitly repeated 0;15;13.
- Using the direct quotient from 641;0 ÷ 184;9 gives approximately 0;15;06 after ×60 ÷ 829;35.

This is now a clearly isolated transcription/column-reading issue, not an unknown unit issue alone. The second example's source image/column layout must be inspected before changing any formula. Preserve the printed values as source transcription, and do not silently “correct” any one value to force agreement.
### Internal arithmetic reconstruction of the second example (strong OCR hypothesis)

The second example contains an internal chain that sharply narrows the likely OCR errors:
- 641;0 ÷ 184;9 = 3;28;51 (sexagesimal division, to the printed precision).
- 3;28;51 × 60 = 208;51 exactly.
- 208;51 ÷ 829;35 = approximately 0;15;06 in day–ghaṭi–pala notation.

This makes the OCR-extracted quotient `3;28;25` highly likely to be a misread of `3;28;51`, because only the latter reproduces the next printed intermediate `208;51`. Likewise, the OCR-extracted later interval `0;15;13` may be a misread of `0;15;06`; the latter follows the displayed quotient and lunar motion and still rounds to the printed midpoint 12;49 ghaṭi when added to the epoch. This is an internally consistent reconstruction, **not yet a verified visual transcription**. Preserve both the raw OCR and this derived candidate separately until the original scan is checked.

The first worked example independently checks the same conversion structure: 832;15 ÷ 392 = 2;7;23; multiplying by 60 gives 127;23, and dividing by 741;50 gives approximately 0;10;18. This supports the operation sequence in verse 9.