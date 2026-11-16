# Audit of the proposed Śaka 1290 reconstruction

Status: independent arithmetic audit of a third-party model response; **not** a source-approved worked example and **not** an implementation fixture.

## Why this note exists

A proposed reconstruction of a Śaka 1290 example was supplied by an external model. It contains potentially useful readings, but it mixes several incompatible values and does not show the scale conversions needed to reproduce its khanda products. Preserve it as a hypothesis only. Do not use its derived values as production data or as proof of the Sanskrit rule.

## Primary-source rule confirmed independently

The 1902 Sumatiharsa commentary gives the following sequence:

- Printed p. 134 (scan page 138): arrange elapsed/coming krānti and śara khandas according to past/future pāta; the side with the smaller chāpāṃśa has its bhogya khanda placed singly, while the other side's positions are doubled. It explicitly says the smaller-śara case has two middle śara khandas and three middle krānti khandas.
- Printed p. 135 (scan page 139): apply the 1/13 correction to the bhogya krānti-khaṇḍa first, then apply śara-khaṇḍa corrections. Same-sign terms are added and unlike-sign terms differenced, with the hemisphere/gola rule determining the orientation.
- Printed p. 136 (scan page 140): verse 8 constructs products from the smaller chāpāṃśa and the difference between the two chāpāṃśas, with additional even/odd khanda steps where available. The resulting products are subtracted, as far as possible, from 15 times the lunar śara amount. The residual is divided by the aśuddha sphuṭa-khaṇḍa; the quotient is added to the sum of the multipliers belonging to the cleared khandas. Verse 9 then converts the resulting angular amount to time using lunar motion.

Sources:
- https://jainqq.org/explore/034533/138
- https://jainqq.org/explore/034533/139
- https://jainqq.org/explore/034533/140

## Arithmetic issues in the proposed reconstruction

### 1. Epoch calculation

The proposal gives:
- Sāyana Sun: 7 rāśi 18°23′53″
- Sāyana Moon: 4 rāśi 4°54′17″
- Longitude-sum remainder to 12 rāśis: 6°41′50″
- Sum of daily motions: 786′15″

Those values give approximately 30;39;52 ghaṭi, which rounds to 30;40. That chain is internally consistent.

However, the same response then proposes changing the Sun to 7 rāśi 18°24′33″. With that corrected Sun, the sum becomes 11 rāśi 23°18′50″, the remainder becomes 6°41′10″, and the epoch becomes approximately 30;36;49 ghaṭi—not 30;40. The correction and the claimed matching result cannot both be retained.

### 2. The 1/13 correction does not establish 253

If the correction is applied directly to a khanda value of 236:

- 236 / 13 = 18;9;13;50… in sexagesimal fractional notation.
- It is not 17.
- Therefore 236 + 17 = 253 is not derived by the displayed division.

The commentary's exact object and operation must be followed carefully; the model response has not demonstrated why 17 is the applicable correction. Do not accept 253 until the Sanskrit instruction and worked arithmetic jointly establish it.

### 3. Claimed khanda products omit a scale operation

The response claims:
- 197 × 54′12″ = 775′3″
- 61 × 1°53′45″ = 492′3″27
- 274 × 13°6′53″ ≈ 3593′

As ordinary angle multiplication, these are not the displayed results:

- 197 × 54′12″ = 177°57′24″
- 61 × 1°53′45″ = 115°38′45″
- 274 × 13°6′53″ = 3593°26′02″

This does not prove that the printed products are wrong: verse 8 may require a normalization or scale conversion tied to the khanda units. It proves only that the model response has omitted that operation and cannot claim these products have been verified. Its 3593 is especially ambiguous because the direct product is about 3593 degrees, not 3593 arcminutes.

### 4. Chāpāṃśa readings are mutually inconsistent

The response uses multiple incompatible values for the same quantities:

- Sāyana Moon appears as both 131°5′48″ and 131°5′58″.
- The krānti remainder is alternately 11°5′8″, 11°5′48″, and 11°5′58″.
- Corresponding bhogya krānti arcs are given as 3°54′52″, 3°54′12″, and an earlier printed reading 3°50′52″.
- The śara bhogya arc appears as both 5°47′59″ and 5°47′57″.

For example:
- 15° − 11°5′48″ = 3°54′12″.
- 15° − 9°12′1″ = 5°47′59″.
- 5°47′59″ − 3°54′12″ = 1°53′47″, not 1°53′45″.

The response obtains 1°53′45″ only by using 5°47′57″ with 3°54′12″. The two-second change must be sourced, not selected to make the difference fit.

### 5. Final arc-to-time conversion

The response writes 10°26′47″ = 627′47″. Correct conversion is:

10°26′47″ = 626′47″.

Using the stated lunar motion 725′35″:
- 626′47″ / 725′35″ × 60 gives about 51;49;48 ghaṭi, which truncates/rounds to 51;50.
- 627′47″ / 725′35″ × 60 gives about 51;54;46 ghaṭi, not 51;50.

Thus the claimed 51;50 agrees with 626;47, not the written 627;47.

## Current disposition

| Item | Disposition |
|---|---|
| 30;40 epoch from the uncorrected Sun value | Arithmetic checks; source reading still needs confirmation |
| Corrected Sun 18°24′33″ while retaining 30;40 | Contradictory |
| 236/13 yielding +17 and corrected value 253 | Not demonstrated |
| Products 775;3, 492;3;27, 3593 | Not reproducible from the displayed multiplications; missing scale operation |
| Chāpāṃśa values | Conflicting; source readings must be separated |
| 626;47 leading to 51;50 | Arithmetic checks |
| Complete Śaka 1290 reconstruction | Not yet established |

## Next research step

Reconstruct the verse-8 product units and scale conversion directly from the original Sanskrit commentary and the user's already proofread transcription. Keep raw readings, normalized values, and derived arithmetic in separate fields. Do not ask the user to repeat material already supplied; request a specific reading only if a particular character or column remains genuinely ambiguous.


## Separate record of the user's already-proofread Śaka 1290 checkpoints

Do not ask the user to repeat these readings. The following checkpoints were preserved from the user's earlier proofread transcription and the prior calculation log; they are not all yet explained by the source's unit conventions:

- Sāyana Moon: 131;5;58 (one earlier derived line used 131;5;48); sapāta Moon: 39;12;1.
- Bhogya khanda readings: krānti −236; śara +56.
- Chāpāṃśa readings in the transcription: krānti 3;50;52 and śara 5;4;47. Later calculation lines use 3;54;12 and 5;47;57; retain both layers rather than silently harmonizing them.
- Corrected khanda checkpoints: 197, 61, 274.
- Product/residual checkpoints: 775;3, 492;3;27, residual 1273;9.
- Final quotient: 4;38;48; additional arc amount 3;4;52; combined amount 10;26;47.
- The printed conversion line is recorded as 627;47; the direct conversion of 10°26′47″ is 626;47. Preserve the printed and derived values separately.
- Final time is recorded as 51;50.

An earlier assistant calculation log also records the operations as 54;12 × 15 → 775;3, 1;53;45 × 274 → 492;3;27, and 15° − 1;53;7 → 13;6;53. Ordinary base-60 multiplication does not reproduce the first two displayed products: 54;12 × 15 = 813;0, and 1;53;45 × 274 = 519;27;30. The third line is a subtraction/complement, not a multiplication. These are therefore **transcribed operation/result pairs whose scale or operands remain unresolved**, not arithmetic identities to encode.

The model response changed the first operation into 197 × 54′12″ and the second into 61 × 1°53′45″, which is not the same as the earlier transcription log. Keep the model's restatement separate from the user's original readings. The next calculation pass must recover the exact operand sequence and the unit attached to each value from the source commentary before trying to fit products.


## New clue: the +17 may come from the bhogya chāpāṃśa, not from 236

The 1902 commentary on printed p. 135 (scan page 139) phrases the correction as applying a thirteenth part to the **apakrama / bhogya krānti portion**, before the krānti-khaṇḍas are corrected. This wording should not be paraphrased as simply “divide the table value 236 by 13” without checking the grammatical object.

A numerical test gives a strong lead:

- If the bhogya krānti arc is the earlier transcribed 3°50′52″, its 1/13 is 17′45.538″ (approximately 17 whole arcminutes if the khanda correction is retained at whole-kalā precision).
- Adding those 17 whole kalā to the table value 236 gives 253, exactly the proposed first corrected khanda.
- If instead the later arc 3°54′12″ is used, its 1/13 is 18′00.923″, which would give 254, not 253, at whole-kalā precision.
- By contrast, 236/13 is 18;9;13… in the table-value units and does not explain +17.

This is **a strong, source-aligned hypothesis**, not yet a final rule: it depends on the original bhogya arc being 3°50′52″ and on the text's precision/truncation convention. It does, however, explain why the earlier 3°50′52″ reading must not be discarded in favour of the later 3°54′12″ line merely because that later line appears elsewhere in the calculation.

Next, test the same operation against the second and third krānti-khaṇḍa corrections (the proposed 150 → 139 and 52 → 48). If their corrections are the whole-kalā parts of the corresponding 1/13 bhogya-arc terms, the pattern should reproduce without special pleading. Until that test succeeds, do not encode the correction function.


## Follow-up source check: keep the 1/13 object unresolved

A fresh direct read of the 1902 commentary has narrowed, but not settled, the grammatical object of the 1/13 correction.

- Printed p.135 (Jain Quantum page 139) reads: **“अपक्रमस्य ... भोग्यखण्डस्य विश्वांशकेन १३ त्रयोदशांशकेन भोग्यादीनि क्रान्तिखण्डानि पूर्व संस्कृत्य”**. The commentary explicitly names the thirteenth part and says the bhogya and following krānti-khandas are corrected first.
- The same page then says the śara-khandas are applied after the krānti correction, with sign and gola rules.
- Printed p.141 (Jain Quantum page 145), in the worked example with sāyana Moon 235;21;51 and sapāta Moon 350;58;29, identifies the bhogya krānti-khanda as 236 and says the 13th-part correction is positive in that case.
- This makes it unsafe to state that the 1/13 is definitively taken from the angular remainder 3°50′52″. That interpretation is numerically attractive because its 13th part is 17′45.5″, but the Sanskrit phrase may instead refer to the bhogya krānti-khanda itself. If 236 is the operand, 236/13 = 18;9;13;50… in sexagesimal notation, which does not explain a whole-unit correction of +17.
- Therefore the earlier note “+17 may come from bhogya chāpāṃśa” remains a hypothesis only. Neither +17 nor +18 is approved until the user's exact Śaka 1290 line and the commentary's grammatical referent are aligned.

The verse-8 commentary on printed p.136 (Jain Quantum page 140) is now directly rechecked. It specifies: (a) first multiplier = smaller chāpāṃśa; (b) difference of the two chāpāṃśas for the even-position khanda; (c) if the fourth khanda exists, also use the sixth; (d) subtract the corresponding 15-part contributions from 15 × lunar śara (in kalā) as far as they clear; (e) divide the residual by the aśuddha sphuṭa-khanda, not the multiplier-adjusted khanda; (f) add the quotient to the sum of the multipliers belonging to the cleared khandas; (g) multiply the resulting angular amount by 60 and divide by lunar motion.

This confirms the structural sequence, but it still does not validate the proposed Śaka 1290 products 775;3 and 492;3;27. The actual operands, khanda order, and scale of the printed product columns must be recovered before implementation.

Sources:
- https://jainqq.org/explore/034533/139
- https://jainqq.org/explore/034533/140
- https://jainqq.org/explore/034533/145

## Direct recovery of the Śaka 1290 worked example from printed pp. 143–146

The searchable full-book transcription now exposes the complete passage continuously. This is a major source recovery; it supersedes the earlier assumption that the user-provided Śaka 1290 transcription was the only available witness. Source pages:
- https://jainqq.org/explore/034533/147 (printed p.143)
- https://jainqq.org/explore/034533/148 (printed p.144)
- https://jainqq.org/explore/034533/149 (printed p.145)
- https://jainqq.org/explore/034533/150 (printed p.146)

### Raw source checkpoints now visible

Printed p.144 (scan/page 148) gives:
- Epoch: sunrise, Śaka 1290, Kārtika śukla 7, Thursday; ahargaṇa 67823.
- Mean Sun 7;5;42;58, mean Moon 3;29;4;17, node 9;12;0;16.
- True Sun 7;4;18;53; solar motion 60;40.
- True Moon is printed in the searchable text as 3;20;45;17; lunar motion 725;35. Preserve this exact OCR reading pending page-image verification.
- Ayanāṃśa 14;5;40; sāyana Sun 7;18;23;53; sāyana Moon 4;4;54;17.
- Sum 11;23;18;10; deficit to 12 rāśis 6;41;50; gaty-aikya 786;15; epoch 0;30;40.
- At that epoch: true Sun 7;4;49;57; Moon 3;27;0;8; node 9;12;11;15; lunar śara 169;21; sāyana Moon 4;12;5;58; sapāta Moon 1;9;12;1.
- Sāyana Moon total is printed in the following calculation as 130;5;58 (not 131;5;58); quotient by 15 gives 8, remainder 11;5;8.
- Sapāta Moon 39;12;1; quotient 2, remainder 9;21;1.
- Bhogya krānti khanda −236; bhogya śara khanda +56.
- Printed chāpāṃśas: krānti 3;50;52; śara 5;4;47.

Printed p.145 (page 149) continues:
- Pāta is future; the khanda positions are arranged with the bhogya khanda and doubled positions according to the smaller krānti arc.
- The commentary describes the 1/13 correction as applying to the bhogya krānti-khanda 236 and explicitly says the correction is positive in this example. This is strong evidence that the correction is associated with the bhogya krānti-khanda, not automatically the arc remainder. The actual arithmetic unit/precision of the thirteenth-part correction still needs to be recovered.
- Corrected first sphuṭa khanda: 197.
- First multiplier: 54;12; printed resulting amount: 775;3.
- Initial 15 × lunar śara: 25;40;15; subtracting the first amount leaves 1765;12.
- Second sphuṭa khanda: 61.
- Its two chāpāṃśas are 3;54;12 and 5;47;57; difference 1;53;45; printed product 492;3;27.
- Subtracting this from 1765;12 leaves 1273;9.
- Third odd khanda: 274; multiplier 1;53;7; complement to 15 is 13;6;53; printed product 3593. It does not clear the residual.
- Residual 1273;9 divided by aśuddha sphuṭa khanda 274 gives 4;38;48.
- Cleared khanda-angle contribution 3;4;52; sum 10;26;47.
- Source prints the ×60 result as 627;47, then lunar motion 725;35, yielding 0;51;50.
- Add to epoch 30;40 → next sunrise-day 1;22;30, i.e. Kārtika kṛṣṇa 8, Friday, 22;30 after sunrise.
- Printed p.146 final check gives solar krānti 871;44, lunar śara 205;57, and printed lunar corrected krānti 777;44; the commentary nevertheless says the krāntis are equal. This is an internal discrepancy; do not silently change either value.

### Important arithmetic distinction

The printed first cleared amount 775;3 is also exactly the difference:
2540;15 − 1765;12 = 775;3,
where 2540;15 is the 15-fold initial lunar-śara amount. Similarly, the second cleared amount is the difference between the preceding residual and the next residual, but its exact sexagesimal column scale must be audited before treating the subtraction as a direct identity.

The displayed 775;3 and 492;3;27 are successive cleared portions of the 15-fold śara budget. This does not yet prove how each is generated by the khanda × multiplier operation. Do not conflate the cleared amount with the raw multiplication before the scale factor is established.

### Revised next calculation tasks

1. Recover the unit scale for the verse-8 svāṃśaghna products. Use the exact source words and all three pairs: (197, 54;12) → 775;3; (61, 1;53;45) → 492;3;27; (274, 13;6;53) → 3593.
2. Reconcile printed chāpāṃśas 3;50;52 and 5;4;47 with later multiplier values 3;54;12, 5;47;57, and 1;53;45. Keep them as separate raw and derived layers.
3. Resolve the 1/13 correction's unit and rounding from the phrase that names the bhogya krānti-khanda 236.
4. Reconstruct final krānti-sāmya: printed 871;44 vs 777;44 is not equal, so test whether the printed lunar krānti or śara correction has a reading/column error.
5. Preserve printed 627;47 and mathematically derived 626;47 separately; only the latter converts 10;26;47 to the printed 51;50 under the stated motion.


## User-confirmed editorial policy: preserve the book reading first

The user has explicitly confirmed that the numeric readings they supplied were checked directly against the printed book, not guessed from OCR. Treat those readings as the primary human-verified transcription witness.

Working method for all remaining reconstruction:

1. Preserve the user's book-checked reading verbatim as **मूल-पाठ / verified print reading**.
2. Preserve searchable OCR/transcription readings separately; never silently substitute them for the user's reading.
3. Calculate from each reading independently and record the result as **गणितीय परीक्षण**.
4. Where the calculation strongly indicates a different digit or value, record it as **संभावित मुद्रण-दोष / शोध-सुधार**. Do not rewrite the source reading.
5. Treat a printer/transcription error as a working hypothesis where it explains the author's internally consistent method, but do not label it proven until the scan, grammar, parallel example, and arithmetic support it.
6. Continue by fitting the method to the worked results, while keeping every adjustment auditable. Do not force an adjustment merely to make a desired result fit.

Specific priority: retain the user's Śaka 1290 sāyana-Moon reading **131;5;58** as the book-checked reading. Keep searchable text's **130;5;58** as a conflicting OCR witness pending image-level verification. Neither value may overwrite the other in the audit.


## Independent second edition located: Krishnadas Sanskrit Series, 1991

A second published edition is now available online: *Karaṇakutūhalam* with Sumatiharsa's **Gaṇaka-kumuda-kaumudī**, Sudhākara Dvivedī's **Vāsanā-vibhūṣaṇa**, and Dr. Satyendra Mishra's Hindi **Śivamatī** translation (Krishnadas Academy, first edition 1991). This is an independent editorial witness and, importantly, contains a second Sanskrit explanation of the pāta calculation plus a Hindi procedural summary.

Source PDF:
https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf

Useful searchable locations:
- Printed p.107–108 / PDF text lines 2738–2764: Sumatiharsa's verse 7–9 commentary and Sudhākara's mathematical upapatti.
- Printed p.192–193 / PDF text lines 2810–2815: Śaka 1290 worked example and final check.
- Printed p.184–185 / PDF text lines 3642–3654: Dr. Mishra's Hindi procedural summary.

### New evidence on the 1/13 correction

The 1991 Hindi summary of verses 5–7 says to combine the krānti and śara numbers according to sign/gola and then apply **one thirteenth of the bhogya amount** (printed p.185, PDF lines 3642–3646). Sudhākara's Sanskrit upapatti (PDF lines 2758–2764) independently derives a 15/13 relation and explains the bhogya-khaṇḍa correction in terms of the thirteenth part.

This supports the earlier numerical reconstruction for Śaka 1290:
- Book-checked bhogya krānti chāpāṃśa: 3;50;52.
- In arc-kalā: 230;52.
- One thirteenth: 17;45;32 (sexagesimal kalā-vikalā form; equivalently 17 arcminutes 45.538… arcseconds).
- At whole-kalā precision this gives 17.
- 236 corrected by +17, then combined with the opposing śara correction 56, gives 197.

This is now a **strongly supported working reconstruction**, not merely a numerical coincidence: the Hindi procedural translation explicitly identifies the bhogya amount as the operand, and Sudhākara supplies a separate theoretical derivation. Still preserve the source values and the derived +17 separately; do not overwrite the printed line.

### What the 1991 edition does and does not resolve about verse 8

The Sanskrit commentary (PDF lines 2746–2748) repeats the sequence: construct the svāṃśa-ghna terms using the smaller chāpāṃśa and the difference of chāpāṃśas; subtract the terms that clear from 15 times the lunar-śara kalā; divide the residual by the aśuddha sphuṭa-khaṇḍa; add the quotient to the multipliers belonging to cleared khandas; then convert the resulting angle to time.

The Hindi summary (printed p.185, PDF lines 3647–3651) gives a compressed procedural description: multiply lunar śara by 15, subtract the applicable śara-khaṇḍa contributions, then use the residual and bhogya/uncleared khanda to obtain the time. It does **not** explain the numerical scale of the svāṃśa-ghna product column.

The 1991 OCR extraction of the Śaka 1290 worked example (PDF lines 2810–2811) is heavily concatenated and has several readings that conflict with both the 1902 text and the user's checked transcription. Examples include a sāyana-Moon digit string १३११९१४८, a krānti bhogya-khaṇḍa string २३९, and product strings that cannot safely be segmented without the page image. Do not normalize these OCR strings into numbers or use them to overwrite either witness.

### Product-scale audit remains open

The source structure is independently corroborated, but the three Śaka 1290 product pairs still do not follow ordinary multiplication if interpreted as:
- 197 × 54;12 → 775;3
- 61 × 1;53;45 → 492;3;27
- 274 × 13;6;53 → 3593

The third pair does reproduce ordinary sexagesimal multiplication to whole-kalā truncation: 274 × 13;6;53 = 3593;26;02 (exact sexagesimal product; the printed result 3593 is consistent with truncation to whole units). The first two do not. Therefore the remaining issue is likely not the general idea of multiplication, but the precise operands, normalization, or column scale for the first/even-position terms. Keep all three raw source pairs unchanged while deriving that operation.

### Revised status

- The 1/13 correction's operand is now strongly supported as the **bhogya amount/chāpāṃśa**, not the table value 236 divided by 13.
- The +17 whole-kalā reconstruction (3;50;52 ÷ 13) is strongly supported for the first corrected khanda, with whole-kalā truncation.
- The Sanskrit verse-8 procedure is corroborated by a second edition and a second commentary.
- The scale/operand interpretation of the first two svāṃśa-ghna products is still unresolved.
- The 1991 OCR number strings are a third witness only in raw form until the page image is checked.
- No public solver or event implementation is authorized by this research result.


## Independent audit of Gemini's proposed three-product reconstruction (2026-11-15)

Gemini's three raw Base-60 multiplications are arithmetically correct **for the altered operands it selected**:

- 198 × 3;54;52 = 775;3;36
- 261 × 1;53;7 = 492;3;27
- 274 × 13;6;53 = 3593;26;2

The first product truncates to 775;3, the second matches exactly, and the third truncates to 3593. This verifies the multiplications only; it does not verify the source readings or the khanda sequence.

### Source table contradicts Gemini's krānti constants

Gemini uses the six krānti values [365, 341, 294, 236, 149, 55]. The 1902 printed source's table passage explicitly gives:
**362, 341, 299, 236, 150, 52**.
The six source values sum to 1440. The alternate Gemini sequence also sums to 1440, but that sum alone does not make it the source table. The source table must prevail unless an independent edition demonstrably prints a variant. See the 1902 searchable book text, verse 14 table passage (search result excerpt around printed p.94): https://jainqq.org/booktext/Karan_Kutuhalam/034533

This is a decisive flaw in Gemini's reconstruction:
- Its 294 is not the source's 299.
- Its derived 317 = 294 + 23 is therefore not source-supported.
- With source value 299 and whole-unit 1/13 correction 23, the corresponding corrected value would be 322, not 317.
- Therefore its 261 and subsequent 274 chain cannot be accepted as proven from the source table. It must be re-derived with the correct table and actual signed khanda positions.

### The 1/13 correction: correct object, but do not skip the one-unit discrepancy

The 1902 commentary on printed p.145 explicitly names the bhogya krānti-khaṇḍa 236 and its 1/13 part as the correction applied to the krānti khandas. This supports applying the correction to 236, not to the angular remainder 3;50;52. The earlier hypothesis that 3;50;52 / 13 gives +17 should therefore be downgraded; it is not supported by this explicit commentary wording.

Numerically:
- 236 / 13 = 18.153846...
- At whole-kalā truncation, the correction is +18.
- 236 + 18 = 254.
- 254 − 56 = 198, whereas the printed first sphuṭa khanda is 197.

So Gemini's first khanda 198 is the direct arithmetic result under this interpretation, but the printed 197 remains a one-unit discrepancy. Do not label it a proven typo until the exact precision/rounding convention and signs are checked against the Sanskrit and parallel example.

### Gemini's remapping of the later chāpāṃśas is not established

The 1902 printed p.144 OCR witness gives:
- sāyana Moon total as a concatenated reading around 130;5;58 (the user separately book-checked a different reading; preserve both witnesses);
- quotient 8 and remainder 11;5;8;
- sapāta Moon 39;12;1, quotient 2, remainder 9;21;1;
- printed chāpāṃśas 3;50;52 and 5;4;47.

The p.145 worked calculation then prints:
- first multiplier 54;12;
- second-khanda chāpāṃśas 3;54;12 and 5;47;57;
- their difference 1;53;45;
- third-khanda multiplier 1;53;7 and complement 13;6;53.

Gemini substitutes:
- 3;54;52 for the first angular amount;
- 5;47;59 for the second;
- 1;53;7 for their difference.

These substitutions make a clean arithmetic chain from 11;5;8 and 9;12;1, but they do not reproduce the p.145 printed intermediate readings 3;54;12, 5;47;57, and 1;53;45. The p.144 OCR and p.145 calculation also conflict internally. This is evidence of a source/transcription inconsistency, not proof that all three p.145 values are printer's errors.

There is an additional remainder issue: 39;12;1 − 30 = 9;12;1, not 9;21;1. The p.144 printed/searchable remainder 9;21;1 is arithmetically inconsistent and is a strong candidate for a transposition/printing/OCR error. Keep raw 9;21;1 and derived 9;12;1 separately.

Likewise, the sāyana-Moon quotient/remainder must be checked against the exact book-verified total. Do not derive 11;5;8 from 131;5;58: modulo 15 that value leaves 11;5;58, not 11;5;8. The OCR total 130;5;58 would leave 10;5;58, not 11;5;8. At least one of those three figures is wrong or differently segmented.

### Unit claim: numerically promising, dimensional interpretation still needs proof

The three multiplications can be performed as Base-60 products by treating the angular multiplier's degrees/minutes/seconds as a sexagesimal number and reporting the result in the source's kala-based product column. But Gemini's prose explanation that the units automatically work because the initial lunar śara has already been multiplied by 15 is not yet a derivation from the commentary. The numerical identity is verified; the dimensional interpretation and why the products are comparable with the 15-fold śara budget still require explicit textual support.

### Current verdict on Gemini

**Accepted:**
- Its three displayed Base-60 multiplication calculations, as arithmetic identities for its chosen operands.
- The 1/13 correction is applied to the bhogya krānti-khaṇḍa 236, in light of the explicit p.145 commentary.
- 39;12;1 − 30 = 9;12;1.

**Rejected / not established:**
- Its alternate krānti table [365,341,294,236,149,55]; source table is [362,341,299,236,150,52].
- Its assertion that all six source discrepancies are thereby proven printing errors.
- Its second khanda 261 and third khanda 274 derivation using 294.
- Its replacement of p.145's printed chāpāṃśas/multipliers by 3;54;52, 5;47;59, and 1;53;7 without a source-level explanation.
- Its claim that the full Śaka 1290 example is now completely solved.

Next task: reconstruct the exact signed krānti/shara khanda positions from the source table and the verse 5–7 arrangement, using the correct source krānti values; then test whether the p.145 printed 197, 61, 274 can be reproduced without changing table values.


## 2026-11-15: independent 1991 edition resolves the 24-position direction sequence

The 1991 edition has now been opened and checked directly, including Sumatiharsa's commentary and Dr. Satyendra Mishra's Hindi procedural summary. This corrects an important error in the latest proposed reconstruction.

### 1. The 24-position arrangement and the next krānti-khaṇḍa

The 1991 Hindi summary (printed p.184; PDF text lines 3634–3641) states:
- Krānti-khaṇḍas are arranged in four six-khaṇḍa groups, with signs: first six positive, second six negative, third six positive, fourth six negative.
- Śara-khaṇḍas follow the same four-group sign pattern.
- Each group is arranged by the prescribed krama/utkrama order.

The 1902 worked example on printed p.133 (scan page 137) independently states that, after nine krānti-khaṇḍas have elapsed, the tenth khanda is 299 and negative. In the Śaka 1290 example, eight khandas have elapsed and the ninth bhogya khanda is 236 negative. Therefore the next krānti-khaṇḍa in the prescribed reverse run is **299 negative**, followed by 341 negative—not 150.

This specifically corrects the recent proposed explanation that 236 is followed by 150. That proposal reverses the table sequence incorrectly. Preserve the table [362, 341, 299, 236, 150, 52] unchanged; its reverse run after the first six is [52, 150, 236, 299, 341, 362], with negative signs. Sources:
- 1991 PDF lines 2718–2725: https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf
- 1991 Hindi summary lines 3634–3641: same PDF
- 1902 printed p.133: https://jainqq.org/explore/034533/137

### 2. The 1991 Hindi summary confirms the actual sign and correction workflow

The 1991 Hindi summary of verses 5–7 (printed p.184; PDF lines 3642–3646) says, in substance:
- choose past or following khandas according to whether the pāta is past or future and the relevant lunar pada;
- use the krānti value in the direction of the sāyana Moon's ayana, and the śara value in the direction of the sapāta Moon's śara;
- combine krānti and śara values by addition when their directions agree and subtraction when they differ;
- then apply the thirteenth-part correction of the bhogya amount.

This is a second-edition procedural witness. It supports the bhogya-based 1/13 correction but does not justify inventing a new direction rule such as “northward krānti decreasing is always positive.” Signs must be read from the 24-position arrangement and the actual ayana/śara directions.

Source: https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf (printed p.184; PDF text lines 3634–3646).

### 3. Exact arithmetic checks on the three proposed product identities

Using ordinary sexagesimal multiplication:
- 198 × 3;54;52 = 775;3;36, which truncates to 775;3.
- 261 × 1;53;7 = 492;3;27, exactly.
- 274 × 13;6;53 = 3593;26;2, which truncates to 3593.

These are valid arithmetic identities. They make the alternative operands 198 and 261 numerically interesting, but do not prove that the source's printed sphuṭa-khaṇḍas 197 and 61 should be emended. In particular:
- 198 is the one-unit-near result that follows if the first corrected krānti amount is 236 + 18 and the opposing śara amount is 56.
- 261 × 1;53;7 reproduces the second printed product, but the derivation of 261 from the actual signed khanda sequence and the printed second khanda reading 61 remains unproven.
- The third product is fully consistent with the printed 274 and 13;6;53.

The user's recent proposed route 150 → 61 is not supported, because 150 is not the next khanda after 236 in this example. Gemini's earlier use of 294 is also still rejected: the source table gives 299. A corrected reconstruction must now use the next sequence values 299 and 341, the source's actual shara table values, and the signed-position rules; no arithmetic fit alone can replace that derivation.

### 4. 1991 worked example remains a noisy independent witness

The 1991 PDF's Śaka 1290 example (printed p.192; PDF lines 2806–2810) has OCR strings that are concatenated and not reliably segmented. It appears to preserve the same sequence 197, 61, 274 and the later product values, but some digits conflict with the 1902 searchable transcription and the user's proofread readings. Do not use those OCR strings as a corrected edition reading until the page image is inspected.

### Current disposition after this check

- **Established:** 9th krānti-khaṇḍa = 236 negative; next 10th = 299 negative; next 11th = 341 negative.
- **Established:** the 24-position sign pattern is + six, − six, + six, − six, with krama/utkrama order within the groups.
- **Established:** directions determine whether krānti and śara contributions are added or differenced; apply the bhogya 1/13 correction in the prescribed sequence.
- **Rejected:** 236 followed by 150 in the Śaka 1290 example.
- **Still open:** exact shara table witness and the signed khanda-by-khanda derivation of 197, 61, 274; whether the first two printed khanda/product operands contain a transcription or printing error.
- **No implementation:** continue research-only; do not change solver or event data.


## 2026-11-15: the 1991 Hindi procedure identifies the bhogya correction more precisely

A further check of the 1991 edition's Hindi *Śivamatī* summary (printed p.184, PDF lines 3642–3649) clarifies the order:
1. choose the appropriate krānti and śara khanda entries and their directions;
2. combine the krānti and śara values by addition for one-direction agreement or subtraction for opposite directions;
3. then apply the thirteenth part of the **bhogya amount**.

This wording supports taking the 1/13 from the bhogya angular remainder (the chāpāṃśa), not mechanically dividing the table entry 236 by 13. For the 1902 p.144 printed krānti chāpāṃśa 3;50;52:
- convert to arc-kalā: 3 × 60 + 50 + 52/60 = 230;52 (kalā; vikala);
- divide by 13: 17;45;32 (approximately);
- at whole-kalā truncation, the correction is +17.
Then the first signed khanda combination is:
236 − 56 + 17 = **197**.
This reproduces the printed first sphuṭa-khanda exactly, provided the source's signed directions make the krānti and śara entries opposite and the 1/13 is truncated to whole kalā. It is now a strong, source-supported derivation rather than a coincidence. Keep the underlying printed values 236, 56, 3;50;52 and the derived 197 distinct in the audit.

This supersedes the earlier provisional claim that the correction must be 236/13 = 18. The Sanskrit commentary's phrase naming the bhogya krānti-khanda 236 must be read together with the 1991 Hindi procedural explanation, which identifies the quantity whose thirteenth part is taken as the bhogya amount. Do not silently interpret “bhogya-khanda 236” as the numerical operand for the division.

### The actual 1991 śara table is now independently recovered

The 1991 PDF's Sanskrit commentary and Hindi explanation identify the six śara-khanda values as:
**70, 65, 56, 43, 27, 9**.
The Hindi summary prints a slightly differing secondary sequence (70, 65, 54, 43, 29, 19), so retain it as a separate editorial/translation witness, not as the Sanskrit table. The Sanskrit commentary's searchable text gives 70, 65, 56, 43, 27, 9. This agrees with the existing code table and with the 1902 worked example's 13th śara-khanda =70.

Therefore the proposed alternate śara table [78, 70, 56, 37, 13] is not supported by this 1991 Sanskrit witness and must not be used to derive 61 or 274. Source: 1991 PDF lines around 1832 and Hindi summary lines 3636–3646:
https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf

### What is and is not solved

- First sphuṭa-khanda **197**: now reproduced as 236 − 56 + 17, with the 17 coming from 1/13 of the printed bhogya arc 3;50;52, truncated to whole kalā. Strongly supported.
- Second sphuṭa-khanda **61**: still not derived from the actual next krānti values (299, 341) and the source śara sequence (56, 43, 27), with the prescribed doubled/single placements. Do not substitute 261 merely because 261 × 1;53;7 reproduces the printed product.
- Third sphuṭa-khanda **274**: its product 274 × 13;6;53 = 3593;26;2 is arithmetically verified, but its derivation from the signed source table and placement sequence is still open.
- The user's proposed sequence 236 → 150 remains incorrect; 236 is followed by 299 in the reverse run.
- The Gemini alternate śara values [78,70,56,37,13] are not supported by the 1991 Sanskrit table.

## 2026-11-15: primary-text recheck corrects the provisional +17 interpretation

A fresh line-by-line reading of the 1902 full-book transcription (printed pp.134–145) requires a correction to the previous research note and assistant summary.

### 1. The Sanskrit p.145 wording does not license taking 1/13 of 3;50;52

The p.145 commentary reads (OCR normalized only for spacing; preserve uncertain letters):
“क्रान्तिभोग्यखण्डस्य २३६ विश्वांशभागेन ... क्रान्तिखण्डानि ...”
It explicitly names the bhogya krānti-khaṇḍa as 236 and its thirteenth part. The 1991 Hindi summary's “भोग्य राशि/भोग्य राशि का तेरहवाँ भाग” is consistent with the bhogya quantity being the operand; it does not unambiguously say the angular remainder 3;50;52 is the operand.

Therefore the previous section's claim that 3;50;52 ÷ 13 = 17 and then 236 − 56 + 17 = 197 is **not established**. It is a numerically neat fit, but the explicit Sanskrit points instead to the bhogya-khaṇḍa value 236. Since 236/13 = 18;9;13… in sexagesimal fractional notation, a whole-kalā correction of 18 would give 236 − 56 + 18 = 198 under that sign arrangement, not the printed 197. Preserve the one-unit discrepancy; do not present 197 as solved.

This correction supersedes the prior statement that +17 from the 3;50;52 arc was strongly supported. It is now only an alternative numerical hypothesis, not the preferred textual reading.

### 2. Exact verse-8 rule from the 1902 full-book text

The p.136 commentary is now recovered in full. It says:
- first multiplier: the smaller of the two chāpāṃśas;
- for the even-position khanda(s), use the difference between the two chāpāṃśas;
- if the fourth khanda is present, also use the sixth;
- these multiplier/khanda products are the svāṃśa-ghna terms;
- subtract from 15 times the lunar-śara kalā as many terms as clear;
- divide the residual by the aśuddha sphuṭa-khaṇḍa (not the svāṃśa-ghna multiplier);
- add the quotient to the sum of the multipliers for the cleared khandas;
- convert the resulting angular amount to time using 60 and lunar motion.

The exact source passage is at https://jainqq.org/explore/034533/140 and is visible in the full book text near the commentary immediately after verse 8.

### 3. The actual 1902 Śaka 1290 passage: exact raw text values

The full searchable book transcription (printed pp.144–145) gives:
- sāyana Moon 130;5;58; quotient 8; remainder 11;5;8;
- sapāta Moon 39;12;1; quotient 2; remainder printed 9;21;1;
- bhogya krānti-khaṇḍa 236, negative; bhogya śara-khaṇḍa 56, positive;
- krānti chāpāṃśa 3;50;52; śara chāpāṃśa 5;4;47;
- first sphuṭa khanda 197; accompanying multiplier OCR string 54 12; product 775;3;
- second sphuṭa khanda 61; chāpāṃśas 3;54;12 and 5;47;57; difference 1;53;45; product 492;3;27;
- third odd khanda 274; difference 1;53;7; complement to 15 13;6;53; product 3593.

The user's independent book-checked sāyana-Moon reading 131;5;58 remains a separate primary human transcription witness and must not be overwritten by the searchable transcription.

### 4. New arithmetic cross-check exposes the remainder conflict

- If total is 130;5;58, division by 15 gives quotient 8, remainder 10;5;58, not printed 11;5;8.
- If total is user's checked 131;5;58, division by 15 gives quotient 8, remainder 11;5;58, not printed 11;5;8.
- The printed remainder 11;5;8 would correspond to total 131;5;8, not either recorded total.
- Sapāta 39;12;1 divided by 15 gives quotient 2 and remainder 9;12;1, not printed 9;21;1.

The printed chāpāṃśas should therefore not be regenerated from any one of these inconsistent remainder readings without first resolving the page-image text.

### 5. Do not conflate first multiplier, second multiplier, and source chāpāṃśa

The p.145 searchable text reads first multiplier as 54 12 (punctuation/leading fields unclear), not confidently 3;54;52. It then explicitly prints the second pair 3;54;12, 5;47;57, difference 1;53;45, and third multiplier 1;53;7. Gemini's alternative multipliers make selected products fit but are not the exact printed readings.

Product arithmetic:
- 198 × 3;54;52 = 775;3;36, truncating to 775;3.
- 261 × 1;53;7 = 492;3;27, exactly.
- 274 × 13;6;53 = 3593;26;2, truncating to 3593.

These identities show what operands would reproduce the products, but they do not prove the source intended those operands. In particular, the second khanda remains printed 61; 261 is only an unproven alternative.

### Updated status

- 24-position sign pattern and the next krānti table values 236 → 299 → 341: established.
- Verse-8 multiplier/residual procedure: recovered directly from 1902 commentary.
- First sphuṭa khanda 197: **not solved**; previous +17 claim withdrawn to hypothesis status.
- Second sphuṭa khanda 61: **not solved**.
- Third sphuṭa khanda 274: product checks, but its source derivation remains open.
- Priority next: inspect the actual page images for 1902 pp.144–145 and the corresponding 1991 printed p.192; reconcile the user's checked reading with the OCR and verify the first multiplier typography before proposing any emendation.


## 2026-11-15: reverse-check of the printed p.145 product column

A fresh arithmetic pass distinguishes the *printed sphuṭa-khaṇḍa* from the product-column operands. This is important because the product values cannot be reproduced by multiplying the printed khanda and the adjacent printed angular difference as a plain sexagesimal product.

### Exact p.145 searchable transcription (preserve as raw witness)

The page text reads, in sequence:
- first sphuṭa-khaṇḍa: **197**;
- “स्वल्पचापांशैः ५४ १२ गुणितम् ७७५।३” (the first multiplier's punctuation/field segmentation is unclear in searchable text);
- second sphuṭa-khaṇḍa: **61**;
- chāpāṃśas **3;54;12** and **5;47;57**;
- their difference **1;53;45**;
- product **492;3;27**;
- third odd khanda **274**;
- “अन्तरांशैः 1;53;7 तिथितः 15 शुद्धैः 13;6;53 गुणितम् 3593”.

Source: https://jainqq.org/explore/034533/149

### Direct arithmetic reverse-check

The printed products and the obvious printed operands do not match under ordinary sexagesimal multiplication:
- 197 × 3;54;12 = 768;57;24, not 775;3.
- 61 × 1;53;45 = 115;38;45, not 492;3;27.
- 274 × 13;6;53 = 3593;26;2, which truncates to the printed 3593.

The third line is therefore arithmetically reproducible, while the first two require either a missing scale/column operation, a different operand segmentation, or a source/transcription error.

### Candidate operand pairs that reproduce the first two products

Two exact/near-exact identities are numerically notable:
- 198 × 3;54;52 = 775;3;36 → truncates to 775;3.
- 261 × 1;53;7 = 492;3;27 exactly.
- 274 × 13;6;53 = 3593;26;2 → truncates to 3593.

This makes **198**, **261**, **3;54;52**, and **1;53;7** useful diagnostic candidates. It does not authorize replacing the page's raw readings 197, 61, 3;54;12, or 1;53;45. The exact products alone cannot prove the candidate operands were intended.

### A further structural clue, not yet a derivation

With the established reverse krānti sequence after the ninth bhogya khanda 236, the next entries are 299 and 341 (both in the negative run). The Sanskrit table values remain [362, 341, 299, 236, 150, 52], and the 1991 Sanskrit śara table remains [70, 65, 56, 43, 27, 9].

Simple combinations show:
- 299 − 43 + 18 = 274.
- 341 − 299 + 19 = 61.
- 236 − 56 + 18 = 198.

These are *numerical leads only*. The 18/19 corrections have not been derived from the verse 5–7 procedure for each respective position, and the second expression is a difference between adjacent krānti table entries rather than an established signed krānti–śara combination. Do not present these as the actual method. Their value is that they identify precisely which source rule must be checked next: whether the bhogya correction is propagated, recomputed, or differs by position, and how the doubled middle positions pair krānti and śara entries.

### Revised immediate task

Read the 1991 Sanskrit commentary and Hindi summary at the page-image level for the worked Śaka 1290 example, especially the product setup and the exact definition of the middle/odd sphuṭa-khaṇḍas. Then reconstruct each of the three khanda combinations from the 24-position signed tables before changing any transcription. No implementation is approved.


## 2026-11-15: direct 1991 edition evidence recovered (important correction)

The 1991 Krishnadas Sanskrit Series 129 edition is now directly searchable as a PDF, including Sumatiharsa's Sanskrit commentary and Satyendra Mishra's Hindi explanatory section. This is a stronger witness than the earlier search-snippet-only access.

### 1. Sumatiharsa's exact 24-position sign arrangement

The 1991 Sanskrit commentary says the six krānti entries are arranged:
- first six in order, positive;
- next six in reverse order, negative;
- next six in order, negative (the OCR around this phrase is imperfect; compare the Hindi explanation);
- final six in reverse order, positive.

However, the 1991 Hindi summary at lines 3636–3638 gives the pattern as four runs: first six positive, second six negative, third six positive, fourth six negative, for both krānti and śara. This agrees with the previously encoded 24-position pattern. Treat the Sanskrit OCR's sign words as needing page-image verification; do not silently prefer the garbled OCR over the explicit Hindi summary and the 1902 p.132 witness.

Sources:
- 1991 Sanskrit commentary, lines 2716–2719: https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf
- 1991 Hindi summary, lines 3634–3638.

### 2. Direct Hindi statement of the signs and the 1/13 correction

The 1991 Hindi summary (lines 3642–3649) states:
- for a past node, if the sapāta Moon is in an even pada, place preceding khanda values from the bhogya remainder; if in an odd pada, place following values;
- take the krānti number in the direction of the Moon's ayana and the śara number in the direction of the node-bearing Moon;
- combine krānti and śara numbers by signed addition/subtraction (same direction: add; opposite direction: subtract);
- then apply the thirteenth part of the bhogya number;
- for the midpoint, multiply lunar śara by 15, subtract the śara-khanda products, identify cleared and uncleared terms, divide the remainder by the bhogya khanda, and add the quotient to the sum of cleared multipliers.

This directly confirms that the 1/13 correction is tied to the **bhogya number**, not automatically to the angular remainder such as 3;50;52. It also shows that the sign selection is not simply inferred from "increasing/decreasing" verbal motion; use the Moon's ayana direction and node-bearing Moon's direction as the source instructs.

### 3. 1991 worked examples are not a clean transcription substitute for the 1902 Śaka 1290 example

The 1991 PDF's Sanskrit worked example around lines 2803–2806 contains its own numerical witnesses and some OCR corruption. It includes a worked calculation with bhogya krānti 236 and śara 70, then another example labelled around Śaka 1290 (OCR sometimes reads 1920) with different intermediate figures. These must be compared as an edition's recalculated example, not merged into the 1902 values.

Notably, the 1991 p.108–109 material around lines 2803–2806 includes a calculation of the form:
- krānti bhogya khanda 236;
- śara bhogya khanda 56 in the subsequent example;
- sphuṭa khanda and product column readings that differ from 1902 in places (OCR: first khanda around 191/197 and product around 775;13; later 61 and 274 appear).
The PDF's OCR is too compressed in the digit strings to establish exact values without rendering the page image. Preserve it as a second-edition witness, not a correction.

### 4. Important table-variant warning

The 1991 Hindi summary at line 3335 OCRs the krānti table as **362, 349, 299, 236, 150, 52**, whereas the 1902 original's verified table is **362, 341, 299, 236, 150, 52**. This is a real edition/OCR discrepancy requiring image inspection. Do not claim 1991 independently confirms 341 until its page image is read. The 1991 Sanskrit commentary around line 1542 appears to OCR the second entry as 341, but the same PDF's Hindi summary reads 349. This is exactly why image-level collation is needed.

The 1991 Hindi śara table is not reproduced in the current extracted lines with sufficient clarity; retain the previously checked Sanskrit table [70,65,56,43,27,9] only as a provisional witness until its exact page image is verified.

### 5. Next concrete calculation

Build a source-faithful 24-row table for the 1902 Śaka 1290 case with columns:
1. 1-based khanda position;
2. base table value;
3. signed value;
4. whether it is bhogya / first / second / third placed khanda;
5. whether it is doubled or single;
6. paired krānti and śara positions;
7. 1/13 correction operand and truncation rule;
8. resulting sphuṭa khanda.

The 1991 Hindi instructions determine the selection logic; the 1902 p.132 and p.144–145 witnesses determine the primary numerical inputs. Do not calculate 197/61/274 until the row pairing and edition variants are settled. No code implementation yet.


## 2026-11-15: source-faithful 24-position table and the Śaka 1290 bhogya positions

The original 1902 p.144 page image transcription is now directly rechecked at https://jainqq.org/explore/034533/148. It explicitly says the pāta is **future (गम्य / एष्य)**, not past. This corrects any earlier working assumption that the Śaka 1290 example was a past-node case.

### Raw division and bhogya positions (1902 printed p.144)

- Sāyana Moon: searchable text 130;5;58; quotient 8, remainder printed 11;5;8. The user's book-checked reading remains 131;5;58; preserve both witnesses.
- The text explicitly says eight krānti-khaṇḍas have elapsed and the **third bhogya krānti-khaṇḍa is 236, negative**.
- Sapāta Moon: 39;12;1; quotient 2, remainder printed 9;21;1.
- The text explicitly says two śara-khaṇḍas have elapsed and the **third bhogya śara-khaṇḍa is 56, positive**.
- The printed chāpāṃśas are krānti 3;50;52 and śara 5;4;47. Thus the **krānti arc is the smaller arc** in the original worked example. The smaller-arc side (krānti) receives the single bhogya position; śara positions are doubled, per the 1902 p.134–135 rule.

### Full 24-position signed sequences

The 1902 p.132 arrangement, independently corroborated by the 1991 Hindi summary (PDF lines 3636–3638), is four six-position runs: + forward, − reverse, + forward, − reverse. The established 1902 base tables are:

- Krānti: 362, 341, 299, 236, 150, 52.
- Śara: 70, 65, 56, 43, 27, 9.

| Position | Krānti signed value | Śara signed value |
|---:|---:|---:|
| 1 | +362 | +70 |
| 2 | +341 | +65 |
| 3 | +299 | +56 |
| 4 | +236 | +43 |
| 5 | +150 | +27 |
| 6 | +52 | +9 |
| 7 | −52 | −9 |
| 8 | −150 | −27 |
| 9 | −236 | −43 |
| 10 | −299 | −56 |
| 11 | −341 | −65 |
| 12 | −362 | −70 |
| 13 | +362 | +70 |
| 14 | +341 | +65 |
| 15 | +299 | +56 |
| 16 | +236 | +43 |
| 17 | +150 | +27 |
| 18 | +52 | +9 |
| 19 | −52 | −9 |
| 20 | −150 | −27 |
| 21 | −236 | −43 |
| 22 | −299 | −56 |
| 23 | −341 | −65 |
| 24 | −362 | −70 |

### Where the example sits in these sequences

- Krānti: 8 completed positions; the third bhogya is the 9th table position = **−236**.
- Śara: 2 completed positions; the third bhogya is the 3rd table position = **+56**.
- This is not a same-index pairing: the source independently divides sāyana Moon and sapāta Moon by 15, so their bhogya positions are 9 and 3 respectively.
- Because the krānti chāpāṃśa 3;50;52 is smaller than śara chāpāṃśa 5;4;47, the krānti bhogya is single and the relevant śara positions are doubled. Do not infer that all later terms are paired by simply reading the same row number from the two columns; the 1902 p.134–136 placement instructions govern the middle positions.

### What is now established, and what remains open

**Established:** the signed 24-position arrays; future-pāta status; krānti bhogya position 9 = −236; śara bhogya position 3 = +56; smaller arc = krānti; therefore krānti single / śara doubled.

**Not yet derived:** the exact middle-position pairing that yields printed sphuṭa-khaṇḍas 197, 61, 274 and their multipliers. The 1902 p.145 commentary and 1991 Hindi summary must be followed for the three placed middle terms; do not assume the simple rowwise pairings in the table above.

**Important source correction:** the 1991 Hindi rule at p.184 lines 3644–3646 is explicitly for a **past** pāta. The Śaka 1290 1902 example is explicitly **future**, so the past-pāta odd/even placement rule must not be applied to this case without first deriving the corresponding future-pāta rule from the original commentary.

Primary source for the worked-example status and the exact elapsed/bhogya counts:
https://jainqq.org/explore/034533/148

Independent procedural witness:
https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf (Hindi summary, printed pp.184–185).


## 2026-11-16: the original Sanskrit gives the future-pāta placement rule

A fresh collation of 1902 printed p.134 (Jain Quantum page 138) and the 1991 Sanskrit commentary (PDF lines 2736–2738) resolves an important gap in the previous section: the future-pāta rule is stated in Sanskrit, even though the 1991 Hindi summary at p.184 only paraphrases the past-pāta branch.

### Exact rule structure

The 1902 verse 5–7 and Sumatiharsa commentary say:

1. For a past pāta, use the elapsed (gata) khanda sequence; for a future pāta, use the future (eṣya/gamya) khanda sequence.
2. Start from the bhogya khanda and place the relevant two/three khanda positions separately.
3. The side with the smaller chāpāṃśa has its bhogya khanda placed singly; the other side's corresponding positions are doubled.
4. The number of middle positions depends on which side is smaller: when śara is smaller there are two middle śara positions; when śara is larger there are three middle śara positions. By the same complementary rule, when krānti is smaller, the krānti side has the shorter two-position middle sequence and the larger śara side the three-position sequence.
5. Preserve the signed dhan/ṛṇa labels before applying the 1/13 bhogya correction to the krānti terms; then apply the śara corrections with the gola/direction rule.

Sources:
- 1902 printed p.134–135: https://jainqq.org/explore/034533/138 and https://jainqq.org/explore/034533/139
- 1991 Sanskrit commentary, PDF lines 2736–2738: https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf
- 1991 Hindi summary, lines 3644–3646, describes the past-pāta branch only: same PDF.

### Consequence for Śaka 1290: candidate sequences, not yet paired products

The worked example is explicitly future-pāta. Its future sequences begin from the already identified bhogya positions:

- Krānti bhogya: position 9 = −236; following future positions are 10 = −299 and 11 = −341.
- Śara bhogya: position 3 = +56; following future positions are 4 = +43, 5 = +27, and 6 = +9.
- Since krānti chāpāṃśa is smaller (3;50;52 against 5;4;47), the krānti bhogya is single; the śara side uses the larger three-position sequence. The krānti side has the shorter two-position middle sequence.

This identifies the source values that must enter the placement calculation. It does **not** yet tell us, without parsing the exact p.145 commentary grammar, which of the doubled śara terms are paired with which krānti terms in each of the three displayed sphuṭa-khaṇḍas. Do not simply pair position 9 with position 3, 10 with 4, and 11 with 5: the source says to place/double the terms according to the two/three-position rule, not to use same-index row pairing.

### Independent 1991 Śaka 1290 witness

The 1991 edition has a second Śaka 1290 worked example at printed pp.192–193 (PDF lines 2806–2811). It explicitly labels the example as future-pāta and repeats the same structural steps: sāyana Moon divided by 15 (quotient 8), sapāta Moon divided by 15 (quotient 2), third bhogya śara 56, future-pāta remainder-to-15 chāpāṃśas, smaller krānti arc, and the subsequent three sphuṭa-khaṇḍa/product sequence. Its OCR digits are badly concatenated and some numbers differ from the 1902 witness, so use it as an independent method witness, not as a replacement transcription.

The 1991 Sanskrit worked example's extracted text around PDF line 2810 is especially valuable because it independently preserves the sequence “गम्यपातत्वात्” and the smaller-krānti placement description. The numerical OCR is not clean enough to approve an emendation.

### Correction to the previous research note

The previous note said the future-pāta odd/even placement rule had not yet been recovered. That was too strong. The Sanskrit commentary does give the general past/future selection rule; what remains unresolved is the exact detailed pairing/doubling of the two krānti positions and three śara positions in the Śaka 1290 worked arithmetic.

### Current result

**Newly established:** for future pāta use future-marked khandas; Śaka 1290 future sequences are krānti [−236, −299, −341] and śara [+56, +43, +27, +9] from the respective bhogya positions; smaller krānti arc means single krānti bhogya and the larger śara side's three-position sequence.

**Still open:** exact 1902 p.145 placement/pairing; 1/13 correction's operand and precision as actually used in the worked example; derivation of 197, 61, 274 and multipliers 54;12, 1;53;45, 1;53;7; product scale/units. No solver implementation.


## 2026-11-16: close reading of the p.134–135 placement syntax

A further direct read of the continuous 1902 Sanskrit commentary has recovered a more precise statement of the placement operation. This also requires a qualification to the previous section's inference about the two-versus-three middle terms.

### Printed p.134 (Jain Quantum page 138): exact source wording

The searchable Sanskrit text reads:

> “ततः क्रान्तेः शरस्य च भोग्यखण्डमादिकृत्य वित्रीणि खण्डानि द्विधा पृथग्विन्यसेत्, यदि पातं गतलक्षणं भवति तदा गतखण्डानि एष्यलक्षणे पाते एष्यलक्षणानि खण्डानि विन्यसेत्, शरक्रान्त्योर्मध्ये यस्य चापांशाः स्वल्पास्तस्य भोग्यखण्डमेकस्थमेव स्थाप्यमन्यानि द्विधा ... स्वल्पशरे खण्डकं द्वयं महच्छरे त्रय एव मध्यमा भवन्ति।”

Preserve the raw OCR string “वित्रीणि” as a transcription uncertainty; context suggests a two/three-khanda instruction, but do not silently normalize the word without checking the scan.

The passage securely establishes these separate instructions:

1. Begin from the bhogya khanda for both krānti and śara.
2. Place the required two/three khanda terms separately.
3. Choose elapsed (gata) terms for a past pāta and future (eṣya/gamya) terms for a future pāta.
4. Of krānti and śara, the side with the smaller chāpāṃśa has its bhogya khanda placed singly; the other side's remaining terms are placed doubled.
5. The text then gives the specific count statement: “स्वल्पशरे खण्डकं द्वयं महच्छरे त्रय एव मध्यमा भवन्ति” — two middle khandas in the smaller-śara case and three in the larger-śara case.

### Printed p.135 (Jain Quantum page 139): worked placement example

The next page gives a concrete past-pāta example:

> “अत्र गतपातत्वाभोग्यखण्डमादीकृत्य गतखण्डानि द्विधा स्थाप्य तानि शरस्य स्वल्पचापांशत्वाच्छरस्य भोग्यखण्डमेकत्र स्थापितं शेषाणि गतखण्डानि द्विधा स्थापितानि ...”

This confirms the practical meaning of the preceding rule in that example: because śara has the smaller chāpāṃśa, its bhogya khanda is single; the remaining elapsed terms are doubled. The commentary then proceeds to the 1/13 correction and the sign/gola rules.

### Necessary qualification to the previous inference

The previous section inferred that, because krānti is smaller in the Śaka 1290 example, krānti must have the two-position middle sequence and śara the three-position sequence. The p.134 wording does **not yet justify treating that complementary assignment as fully proved**. Its explicit “two in smaller śara / three in larger śara” sentence is phrased specifically in terms of śara, while the preceding placement rule compares both krānti and śara. We must determine whether “middle” refers to the number of terms on the śara side only, to the paired arrangement as a whole, or to a convention whose complementary krānti count is supplied elsewhere.

Accordingly:
- Keep the future-pāta source sequences unchanged: krānti [−236, −299, −341] and śara [+56, +43, +27, +9].
- Keep the established smaller-chāpāṃśa rule: in this example krānti bhogya is single; the śara-side corresponding terms are doubled.
- Downgrade the claim “krānti two middle positions / śara three middle positions” from established to **plausible but not yet textually demonstrated**.
- Do not yet pair the two krānti terms and three śara terms, and do not use such a pairing to derive 197, 61, or 274.

### Sources

- 1902 printed p.134, verse 5–7 and commentary: https://jainqq.org/explore/034533/138
- 1902 printed p.135, past-pāta placement example and 1/13 commentary: https://jainqq.org/explore/034533/139

### Next test

Read the original page image for p.134 and collate the 1991 Sanskrit commentary's corresponding sentence. Then parse the p.145 Śaka 1290 explanation word by word, especially the phrases describing the bhogya term, the doubled terms, and the “middle” terms. Only after that should the 24-position sequence be mapped to the three sphuṭa-khaṇḍas.


## 2026-11-16: p.135 explicitly identifies the 1/13 correction's grammatical object

The original 1902 printed p.135 is now re-opened and its searchable Sanskrit text read continuously with p.134 and p.145. The key p.135 commentary reads:

> “अपक्रमस्य ... भोग्यखण्डस्य विश्वांशकेन १३ त्रयोदशांशकेन भोग्यादीनि क्रान्तिखण्डानि पूर्व संस्कृत्य ... पुनः शरखण्डकैः संस्कृतानि ...”

The OCR around the compound immediately before “भोग्यखण्डस्य” is imperfect, so preserve the quoted fragment as a raw searchable-text witness, not a diplomatic transcription. The operative syntax nevertheless states that the bhogya and following krānti-khandas are first corrected by a thirteenth part; the śara-khandas are then used for the next correction. It also specifies same-sign addition / unlike-sign difference, with the gola rule affecting the orientation.

### What this settles

- The 1/13 correction belongs to the **bhogya krānti-khanda operation** and is propagated to the bhogya and subsequent krānti-khanda terms before the śara correction.
- This is stronger than the earlier loose hypothesis that 1/13 might be taken directly from the angular chāpāṃśa (3;50;52).
- The p.145 worked example explicitly associates the correction with the bhogya krānti-khanda 236 and says the sign is negative in the present example; it then describes the krānti/śara signed combinations and gives first sphuṭa-khanda 197.
- However, the exact numeric unit and precision of “one thirteenth” remain unresolved. A direct 236/13 gives 18;9;13… in sexagesimal notation, and a naïve combination 236 − 56 + 18 does not yield 197. Do not silently round 236/13 to 17 or treat the attractive identity 236 − 56 + 17 = 197 as proven.
- The order of operations is now better established: first correct the krānti khanda series by the 1/13 bhogya correction; then apply śara khanda terms using sign/gola rules. The exact mapping from the future-pāta sequence to the three p.145 sphuṭa-khandas is still not established.

### Source locations

- 1902 printed p.134, placement rule: https://jainqq.org/explore/034533/138
- 1902 printed p.135, correction and sign/gola commentary: https://jainqq.org/explore/034533/139
- 1902 printed p.145, Śaka 1290 worked calculation: https://jainqq.org/explore/034533/149

### Immediate consequence for the next calculation

Do not treat the 1/13 correction as an independent angular remainder adjustment unless a parallel worked example proves that scale. Instead, reconstruct the corrected signed krānti terms from the actual bhogya khanda and subsequent future khandas, retaining the correction as a rational quantity until the book's truncation/rounding stage is identified. Only then combine the corrected krānti terms with the selected śara terms to test 197, 61, and 274.


## 2026-11-16: 1991 edition's Śaka 1290 example surfaced in a fuller searchable extract

A new search result exposes a longer text extract of the 1991 Krishnadas edition's printed p.192–193 than the previously available PDF open. It independently confirms the future-pāta method, but also reveals substantial numerical/typographical differences from the 1902 worked example. Do not merge the two witnesses.

Source: https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf (search result extract headed “पृष्ठ १९२”).

### 1991 raw witness: preserve OCR without normalization

The extracted 1991 passage includes:
- future pāta (“समये पातो भविष्यतीति”);
- sādhana Moon OCR: 131;19;48; quotient 8; remainder 11;15;48;
- sapāta Moon OCR: 39;12;1; quotient 2; bhogya śara 56;
- krānti chāpāṃśa OCR 3;50;52 and śara chāpāṃśa 5;47;47;
- the same placement statement: smaller krānti chāpāṃśa, single bhogya term on that side, and doubled arrangement for the other side;
- the same 1/13 correction associated with krānti bhogya-khaṇḍa 236;
- OCR product/result strings around first sphuṭa khanda “1917”, multiplier “541912”, product “77513”; second khanda 61 and product “4213127”; third khanda 274 and product 3593;
- residual OCR around 1273;19, quotient 4;31;48, khanda-angle 3;4;52, combined 10;26;47, and time 0;51;50.

These concatenated strings are **not** safe normalized readings. In particular, “1917” could represent a punctuation-stripped sexagesimal number or a damaged integer; “4213127” is not enough to choose between several possible segmentations. Keep the extracted 1991 strings verbatim until the page image is inspected.

### What the second edition independently supports

1. It independently labels the worked case as future pāta.
2. It repeats the smaller-krānti placement description.
3. It explicitly associates the 1/13 operation with bhogya krānti-khaṇḍa 236 and then applies krānti/śara signed combination rules.
4. It retains the same final angular sum 10;26;47 and final time 0;51;50 in its searchable extract.

### What it does not yet support

- It does not yet establish the exact three sphuṭa-khaṇḍa values or their product-column punctuation.
- It does not prove that the 1902 values 197, 61, 274 or products 775;3 and 492;3;27 should be emended.
- Its sāyana-Moon and chāpāṃśa readings differ from the 1902/user-verified witnesses; they must remain separate edition readings.
- The matching final sum/time despite differing intermediate OCR is a useful cross-check of the overall procedure, not proof that all intermediate numbers are identical.

### Revised next step

Use the 1991 page image as a second independent transcription target. First identify the printed punctuation and column divisions in the first khanda/product line and the second product line. Then compare the actual 1991 Sanskrit commentary's explanatory syntax with the 1902 p.145 commentary. Do not use the noisy extracted digits to manufacture a numerical fit.


## 2026-11-16: direct full-text recovery of the 1991 worked example (PDF pp.192–193)

The 1991 PDF is now accessible through its correctly spelled filename:
https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf

The earlier attempted URL used “Karanakutuhula” and failed; the correct filename is “Karanakutuhala”. The PDF's searchable text around its printed pp.192–193 (text lines 2806–2811) has now been opened directly. This is a materially fuller witness than the previous short search extract.

### Raw OCR transcription of the 1991 p.192 worked calculation

Preserve the following digit strings exactly as extracted; punctuation is absent or damaged in multiple places:

- future pāta: “समये पातो भविष्यतीति”.
- sāyana Moon: “१३११९१४८”; divided by 15, quotient “८”, remainder “१११५१४८”.
- sapāta Moon: “१११२११२१”; quotient “२”; bhogya śara “५६”.
- bhogya krānti khanda OCR: “२३९” (not safely distinguishable from 236 in this OCR string).
- krānti chāpāṃśa OCR: “३१५०१५२”; śara chāpāṃśa OCR: “५१४७४७”.
- placement description: “स्वल्पक्रान्तेः ... भोग्यस्थं ... द्विधा स्थापितं” (the connecting OCR is corrupt); the smaller-krānti / single-bhogya arrangement is independently visible.
- first sphuṭa-khaṇḍa OCR: “१९१७”; adjacent multiplier OCR: “५४१९१२”; product OCR: “७७५१३”.
- second sphuṭa-khaṇḍa: “६१”; chāpāṃśa OCR strings “३५४१९१२” and “५४७४७”; difference OCR “११५३१४५”; product OCR “४२१३१२७”.
- third odd sphuṭa-khaṇḍa: “२७४”; difference OCR “११४३१७”; complement to 15 OCR “१३६१५३”; product “३५९३”.
- residual OCR: “१२७३१९”; quotient OCR “४१३१४८४”; khanda-angle OCR “३१४१५२”; combined angle OCR “१०१२६१४७”; multiplied amount OCR “६२१७४७”; lunar motion OCR “१२५१३५”; time OCR “०१५१५०”.
- the final check OCR gives solar krānti “८७११४८”, lunar śara “२०५१ ५७”, corrected lunar krānti “७७७१४४”, followed by the statement that the two krāntis are equal.

### What this new witness actually establishes

1. It confirms that the 1991 printed example is explicitly future pāta.
2. It confirms the smaller-krānti placement description.
3. It independently retains the overall final-angle string corresponding to 10;26;47 and the final time string corresponding to 0;51;50.
4. It does **not** independently confirm the exact 1902 intermediate values 197, 61, 274 or products 775;3 and 492;3;27. The raw 1991 strings for the first khanda/product and second product are different or at least punctuated differently.
5. The 1991 raw śara chāpāṃśa string is “५१४७४७”, which may segment as 5;47;47, not the 1902 5;4;47 or the later 5;47;57. This is only a candidate segmentation; do not normalize it without page-image inspection.
6. The raw first multiplier “५४१९१२” may be 54;19;12, while the raw product “७७५१३” may be 775;13. Again, no punctuation can safely be supplied from OCR alone.
7. The 1991 raw second product “४२१३१२७” is not the same visible digit string as the 1902 “४९२;३;२७”. Do not describe the 1991 edition as confirming the 1902 second product.

### Correction to the prior research note

The previous entry described the 1991 extract as if it supported product OCR around “775;13” and “4213127” only generally, without recording the full digit strings and the likely punctuation uncertainty. This section supersedes that summary. The 1991 example is an independent method witness, but its intermediate arithmetic must be treated as a separate, unnormalized edition witness.

### Next research action

The next useful task is not to guess punctuation from these concatenated strings. It is to obtain the rendered page image of printed p.192 from a source that can serve the PDF at a manageable page range, or use a second digitized copy. Until then, preserve the 1902 human-checked readings and the 1991 OCR strings separately. No numerical emendation or solver implementation is approved.


## 2026-11-16: 1991 Sanskrit commentary gives the mathematical rationale for the 15/13 and 1/13 correction

The full searchable PDF text has now been opened around printed pp.104–109 and pp.192–193. This provides an important distinction between the two commentaries in the 1991 edition.

### A. Sumatiharṣa: operational rule

At printed p.105 (PDF text lines 2736–2738), Sumatiharṣa explains the future-pāta arrangement:
- for a future pāta, subtract the elapsed remainders from 15 to obtain the two chāpāṃśas;
- begin with the bhogya khanda on both the krānti and śara sides;
- place the required two/three khanda positions separately, with the bhogya khanda of the side having the smaller chāpāṃśa kept single and the other corresponding positions doubled;
- the passage explicitly says “स्वल्पशरे खण्डकं ह्रस्वं महच्छेषे त्रयः एव मध्यमाः भवन्ति” in the small-śara case; the surrounding wording and OCR are not sufficiently clean to claim a fully symmetrical count rule for the small-krānti case without checking the page image.
- it then says that the bhogya and following krānti-khandas are first corrected by the thirteenth part, after which the śara-khandas are applied; sign/gola determines same-sign addition or unlike-sign difference.

The p.192 worked example's own prose (printed p.192, PDF lines 2809–2810) explicitly states that the krānti bhogya khanda is 236, that the 1/13 correction is made to the krānti-khanda series, and that the śara correction follows. This independently ties the correction to the **khanda table values**, not to the angular chāpāṃśa remainder.

### B. Sudhākara Dvivedī: why the factor 15/13 appears

At printed p.108 (PDF lines 2757–2758), Sudhākara gives a geometric/proportional rationale. The text says that, after correcting the Moon's mean krānti-khandas by the śara-khandas, the resulting clear krānti-khandas are used to form the Sun's krānti-khanda differences. For the solar krānti calculation, the Moon's motion is considered until it amounts to 15 parts; the commentary explicitly writes the ratio **15/13**. It then explains by proportion: if 15 parts correspond to the bhogya khanda, what corresponds to 13 parts? The resulting bhogya krānti-khanda is described as one-thirteenth part, and the subsequent krānti-khandas are corrected correspondingly.

This is the strongest textual explanation found so far for the 13-based correction. It establishes that 13 is not an arbitrary numerical patch and that the 1/13 operation is tied to the construction of the solar/relative krānti-khanda series from the Moon's 15-part progression.

### C. What remains unresolved

- The commentary's ratio supports the **scale and conceptual origin** of the correction, but the exact integer/sexagesimal implementation in the Śaka 1290 worked example still needs a clean page-image reading.
- Do not infer that 236/13 is simply rounded to 17. The arithmetic gives 18;9;13… in sexagesimal notation, while the example's first displayed sphuṭa khanda OCR is punctuation-damaged. The actual order may involve applying a signed correction to a khanda sequence and then combining with śara, not rounding the quotient independently.
- The 1991 p.192 OCR for the bhogya khanda itself appears as “२३९” in one digit string, but the same line's explanatory prose clearly includes “क्रान्तिभोगखण्डस्य २३६”. Preserve both as separate OCR/reading observations; the explanatory 236 is much stronger contextual evidence, but still record the printed image before declaring a diplomatic transcription.
- The text's statement about two/three middle khanda positions is not yet enough to generalize all count combinations. Keep the previously flagged ambiguity about the small-krānti branch open.

### D. Newly recovered 1991 example structure (not normalized)

The 1991 p.192 passage (PDF lines 2809–2810) gives this sequence in prose:
1. identify the case as future pāta;
2. derive krānti and śara bhogya positions from the two longitudes divided by 15;
3. identify krānti bhogya khanda 236 and śara bhogya khanda 56;
4. determine chāpāṃśas and apply the smaller-krānti arrangement;
5. correct the krānti-khanda series using the 1/13 bhogya correction;
6. apply śara-khanda corrections with sign/gola rules;
7. work through the khanda products, residual and quotient to obtain a khanda-angle;
8. add the angle contributions to 10;26;47 and convert to 0;51;50 of time.

The OCR digits in the product columns remain unnormalized and differ from the 1902 witness. This is a procedural cross-check, not permission to overwrite the 1902 readings.

### Sources

- 1991 edition, Sumatiharṣa operational commentary, printed p.105: https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf
- 1991 edition, Sudhākara rationale, printed p.108: same PDF, commentary following verse 10.
- 1991 edition, Śaka 1543 worked example, printed pp.192–193: same PDF.
- Opened text ranges: PDF lines 2736–2738, 2757–2758, and 2809–2810.

### Research decision

The 1/13 rule is now **textually established as a correction to the bhogya and following krānti-khanda sequence**, with Sudhākara's 15/13 proportional rationale explaining its origin. The exact numerical realization in the Śaka 1290 example remains an open arithmetic/transcription problem. Keep all candidate values rational and signed until the printed punctuation and operation order are verified. No solver implementation is approved.


## 2026-11-16: direct 1902 page-text recovery sharpens the first-product discrepancy

The Jain Quantum page preview for original printed p.145 (web page 149) is now directly accessible as a continuous Sanskrit text, rather than relying on the earlier secondary OCR summary:
https://jainqq.org/explore/034533/149

The visible searchable transcription reads (punctuation preserved as displayed):
> “प्रथमखण्डम् १९७ स्वल्पचापांशैः ५४ १२ गुणितम् ७७५ । ३ ... द्वितीयखण्डं ६१ चापांशाः ३ । ५४ । १२ चापांशाः ५ । ४७॥ ५७ अनयोरन्तरांशः १ । ५३ । ४५ गुणितम् ४९२।३।२७ ... विषमं तृतीयखण्डम् २७४ ... १३ । ६ । ५३ गुणितम् ३५९३ ...”

This confirms that the searchable page text itself carries the first line as “197”, multiplier-like text “54 12”, and product “775;3”. It does not resolve whether punctuation or digits are missing in the underlying scan.

### Exact arithmetic check

Using sexagesimal multiplication:
- 197 × 3;54;12 = 768;57;24, not 775;3.
- 198 × 3;54;52 = 775;3;36, which truncates to 775;3.
- 197 × 3;56;3 = 775;3 exactly at the displayed precision.

These are **candidate arithmetic decompositions only**, not readings of the book. They show that the first product line cannot be validated from the current searchable transcription. Do not select 198 or 3;54;52 just because their product is close.

The second and third lines remain:
- 61 × 1;53;45 = 115;38;45, not 492;3;27.
- 261 × 1;53;7 = 492;3;27 exactly (candidate identity only; it does not prove that the printed khanda is 261).
- 274 × 13;6;53 = 3593;26;2, consistent with a displayed/truncated 3593.

### p.135 text recovered directly

The searchable original p.135 page (web page 139) reads:
> “अपक्रमस्य ... भोग्यखण्डस्य विश्वांशकेन १३ त्रयोदशांशकेन भोग्यादीनि क्रान्तिखण्डानि पूर्व संस्कृत्य ... पुनः शरखण्डकैः संस्कृतानि ...”

This supports the already recorded sequence: the thirteenth-part correction is applied first to the bhogya and following krānti-khanda series; the śara-khanda correction follows. The exact printed word immediately before “भोग्यखण्डस्य” is OCR-corrupt, so this is not a diplomatic transcription.

### Research consequence

The first and second sphuṭa-khanda product lines remain the critical bottleneck. The source text is not arithmetically self-verifying as currently transcribed. The next action must be a visual reading of p.145, not another algebraic fit. Keep the 1902 page text, user-verified readings, and reconstructed candidates as three separate witnesses.


## 2026-11-16: original 1902 pp.132–134 clarify khanda placement and multiplier rules

The original page-text previews are now directly readable:
- printed p.132: https://jainqq.org/explore/034533/136
- printed p.134: https://jainqq.org/explore/034533/138

### p.134 placement rule

The text says:
> “शरक्रान्त्योर्मध्ये यस्य चापांशाः स्वल्पास्तस्य भोग्यखण्डमेकस्थमेव स्थाप्यमन्यानि द्विधा ... स्वल्पशरे खण्डकं द्वयं महच्छरे त्रय एव मध्यमा भवन्ति।”

Meaning supported by the wording:
- compare the krānti and śara chāpāṃśas;
- on the side with the smaller chāpāṃśa, keep the bhogya khanda single;
- the other corresponding khanda positions are doubled;
- the explicit two-versus-three middle-khanda sentence is phrased specifically as “small śara” versus “large śara”. It cannot, without further grammatical/contextual evidence, be generalized as a proven two-versus-three rule for the case where **krānti** is smaller. This preserves the earlier caution.

The opening verse also has the compressed expression “द्वित्रीणि विन्यस्य पृथग्दलानि”, which supports a two/three placement distinction but does not alone settle every branch.

### p.132 verse 8: multiplier sequence

The same original edition gives the operative multiplier rule:
> “आयेऽल्पचापांशमितो गुणः स्याच्चापान्तरांशाः समखण्डकेषु। तिथिच्युतास्ते विषमेषु जह्यात्स्वांशनखण्डानि तिथिनवाणात्॥”

The following prose explains the first multiplier as the smaller chāpāṃśa; for even-position khandas use the difference of the two chāpāṃśas; for odd-position khandas subtract the relevant contribution from 15 (the “15 minus” complement). The subsequent verse uses the residual divided by the aśuddha sphuṭa-khanda and adds the resulting quotient to the cleared-khanda angle.

### Immediate arithmetic implication for the Śaka 1290 example

This makes the first multiplier independently constrained: it should be the smaller chāpāṃśa, not an arbitrary multiplier reverse-engineered from the printed product. The p.145 OCR currently gives a first khanda/product line that does not reconcile under the available readings (197 × 3;54;12 = 768;57;24, whereas the printed searchable product is 775;3). Thus the discrepancy is now demonstrably between the worked-example transcription and the general rule, not something to “solve” by inventing a convenient multiplier.

For the second khanda, the multiplier must be the chāpāṃśa difference (the page-145 text gives 1;53;45), yet 61 × 1;53;45 is 115;38;45, not 492;3;27. This is a second independent conflict. It strongly indicates that one or more khanda/product OCR readings or punctuation marks in the worked example are damaged; it does not identify which reading is wrong.

### Research status

The general algorithm is now more constrained:
1. choose the first multiplier as the smaller chāpāṃśa;
2. use the chāpāṃśa difference for even khanda positions;
3. use the prescribed 15-part complement for odd khanda positions;
4. apply the residual/quotient step only after subtracting contributions that clear the remaining lunar-śara amount.

The exact p.145 khanda/product column still needs a visual transcription. Do not implement from the current OCR.


## 2026-11-16: user reconfirms the printed numerical readings; no further image request

The user has explicitly stated that the numerical readings already supplied in text are exactly what appears in the printed book and that they personally checked the book carefully. Treat these as confirmed diplomatic readings from the user's direct inspection. Do not ask the user to resend p.145, a photograph, or a screenshot merely to repeat that verification.

The current investigation must therefore move forward using the established text witnesses and arithmetic. The unresolved question is not whether the user read the digits correctly, but how the source's stated multiplication / product-column convention produces the printed results. Keep the following pairs verbatim:

- First line: sphuṭa-khaṇḍa 197; multiplier 54;12; printed product 775;3.
- Second line: sphuṭa-khaṇḍa 61; chāpāṃśas 3;54;12 and 5;47;57; difference 1;53;45; printed product 492;3;27.
- Third line: sphuṭa-khaṇḍa 274; multiplier 1;53;7; complement 13;6;53; printed product 3593.

The ordinary sexagesimal products do not match the first two displayed results. This is an unresolved unit/column-operation problem, not grounds to question or overwrite the user's transcription. Future work should test the exact Sanskrit commentary, the role of the 15-part lunar-śara budget, and the product-column units. No image request is currently necessary.


## 2026-11-16: exact residual-difference check of the printed product column

The p.145 sequence gives a further independent constraint that should be tested before interpreting the multiplication:

- Initial 15-fold śara amount: 2540;15.
- After the first printed amount 775;3, the stated residual is 1765;12. This subtraction is exact in base-60 notation: 2540;15 − 775;3 = 1765;12.
- The next stated residual is 1273;9. The difference between the two stated residuals is 492;3 exactly: 1765;12 − 1273;9 = 492;3.
- If the printed second product is read literally as 492;3;27 in a three-place sexagesimal quantity, subtracting it from 1765;12 gives 1273;8;33, not the stated 1273;9. There is therefore a 27-second (last-place) mismatch between the printed product and the stated residual, assuming the three-place interpretation.

This is a new, local consistency check. It does not authorize changing the user's book-verified 492;3;27 reading. It means the product column, residual column, and their units/precision need to be interpreted together. The exact first subtraction is a useful anchor; the second line exposes a small but definite mismatch under the straightforward sexagesimal reading.


## 2026-11-16: Google Lens Hindi text of Sudhākara Mālavīya's Pātādhikāra (OCR witness)

The user supplied a Google Lens transcription headed “पाताधिकारः-९”, described as text scanned from a book by Sudhākara Mālavīya. The transcription is useful as a secondary procedural witness, but its exact edition, printed page images, and OCR accuracy have not yet been independently checked. Preserve it as a separate OCR-derived Hindi witness, not as a diplomatic transcription of the Sanskrit verses.

### Procedural content recovered from the supplied OCR

1. **Pāta direction (verse 1):** compare the sāyana Sun + sāyana Moon sum with 6 or 12 rāśis. The text distinguishes future/coming pāta from past/elapsed pāta according to whether the sum is below or above the relevant target. This broadly agrees with the future-pāta classification in the 1902 and 1991 worked examples, though the precise wording should be checked against the printed Sanskrit.
2. **Past/future and khanda placement (verses 2–7):** determine Sun, Moon, pāta and śara; determine past/future according to the stated sign-position/gola rules; arrange elapsed/coming krānti and śara khandas; combine krānti and śara values by same-sign addition or opposite-sign difference; then apply a thirteenth-part correction to the bhogya amount. This independently supports the procedural order already recovered from the 1902 and 1991 commentaries: krānti/śara signed combination, followed by a 1/13 correction before the final pāta value.
3. **Signed 24-position tables (verse 3):** both krānti and śara six-entry base tables are expanded four times in forward/reverse order, with signs +, −, +, − across the four six-entry blocks. This matches the existing signed khanda expansion implementation and the independently verified 1902 table structure.
4. **Elapsed khanda/remainder (verse 4):** divide sapāta Moon and sāyana Moon, expressed in the stated units, by 15; quotients give elapsed śara and krānti khanda counts, and remainders give the bhogya fractions/amounts. This is consistent with the existing 15-part division model, subject to exact unit confirmation.
5. **Pāta midpoint (verses 8–10):** multiply lunar śara by 15; subtract successive śara-khanda contributions while they can be cleared; classify cleared terms as śuddha khandas and the uncleared remainder as aśuddha khanda; divide the residual by the bhogya/remaining sphuṭa-khanda; add the quotient to the sum of the cleared-khanda multipliers; multiply the resulting angular amount by 60 and divide by lunar motion to obtain time. This strongly corroborates the structure of the 1902 verse-8/9 algorithm and the sequence in the Śaka 1290 worked example. The exact OCR phrase “भोग्यस्खण्ड” is suspicious and may represent “भोग्यस्फुटखण्ड”; do not normalize without the printed page.
6. **Situation duration (verse 11):** the OCR gives a divisor/coefficient of 2203 applied to the aśuddha śara-khanda, with the quotient added to and subtracted from the midpoint to obtain contact and release. This matches the existing research constant 2203 but does not independently establish the precise scale or rounding.
7. **Alternative possibility and duration (verses 12–14):** the OCR describes a threshold using 15 × śara against 480; if it is below 480, a further expression using (48 − śara) × 9 divided by the final śara-khanda yields a time correction around the midpoint. This is a distinct formula from the 2203 rule in verse 11, and must be investigated as a separate branch/alternative method rather than merged into one formula. The phrase “अन्त्य शरखण्ड” and exact operation order need checking against the Sanskrit page.
8. **Krānti equality (verse 15):** compares the difference of the Sun/Moon disc-sum half and the sum of their apparent semidiameters (OCR Hindi summary says “बिम्बयोगार्द्ध तथा मान योगार्द्ध”) to decide krānti-sāmya and the corresponding pāta situation. This may provide a route to independently audit the final equality check in the 1902 example, but the exact astronomical meaning and inequality need the source page.

### OCR cautions

Likely recognition errors include “पाप्त” for “पात”, “वियमपद” for “विषमपद”, “शर नावे” possibly “शर नापे/नावे” depending on source wording, “बशुद्ध” for “अशुद्ध”, and “भोग्यस्खण्ड” for a likely compound involving “स्फुटखण्ड”. These are candidates only; preserve the user's raw transcription as supplied.

The verse 2 sign/gola table is badly broken in the OCR (the four cases are not legible enough to reconstruct safely). Do not invent the missing truth table. The word transcribed as “रेवार” in verse 7 is also uncertain; retain it raw pending page inspection.

### Consequence for the ongoing Śaka 1290 audit

This witness strengthens the following conclusions:
- the 24-position signed khanda expansion is not an isolated reading;
- the 15-part division and śuddha/aśuddha subtraction method is central to the midpoint calculation;
- the 1/13 correction belongs in the krānti/śara khanda construction, not as an arbitrary post-hoc adjustment;
- the 2203 rule is explicitly present in a second procedural account;
- a separate 48-and-9 duration formula may exist and deserves an independent derivation.

It does **not** yet resolve the unit scale that turns the first two printed product lines (775;3 and 492;3;27) into the residual sequence. No production solver or public calendar logic should be implemented from this OCR alone.

### Required next checks

1. Identify the exact Sudhākara Mālavīya book edition, publication details, and printed pages for this chapter.
2. Compare the Sanskrit verses and Hindi commentary against the Google Lens text, especially verses 2, 7, 8, 11, and 14.
3. Derive both duration methods (2203 and the 48/9 expression) dimensionally and test against the Śaka 1290 example and a second independent example.
4. Use the krānti-sāmya criterion to recheck the printed p.146 final equality claim without altering the user's verified numbers.


## 2026-11-16: Archive.org scan identified bibliographically

The user supplied this Archive.org DjVu OCR text URL for the Karaṇakutūhalam volume:
https://archive.org/stream/karnakutuhalabhaskaracharyaganakakumudakaumudisumatiharshavasanavibhushanasudhak_246_b/Karna%20Kutuhala%20Bhaskaracharya%20Ganaka%20Kumuda%20Kaumudi%20Sumati%20Harsha%20Vasana%20Vibhushana%20Sudhakara%20Dvivedi%20Satyendra%20Mishara%20Chowk_djvu.txt

Searchable bibliographic evidence identifies the volume as *Karaṇakutūhalam of Bhāskarācārya*, with two Sanskrit commentaries: *Gaṇakakumudakaumudī* of Sumatiharṣa and *Vāsanāvibhūṣaṇa* of Sudhākara Dvivedī; edited and translated into Hindi by Dr. Satyendra Miśra; Krishnadas Sanskrit Series 129, Krishnadas Academy, Varanasi, 1991. This matches the already-used 1991 PDF edition, not a newly identified Sudhākara Mālavīya book. Google Books also records a later second edition (Caukhambā Krishnadas Academy, 2008); do not conflate that later edition with the 1991 title-page evidence.

The Archive.org DjVu text endpoint could not be retrieved directly in this session, so no new OCR lines have been independently extracted from that URL yet. The previously supplied Hindi OCR transcription remains user-provided evidence. The 1991 PDF already on record remains the accessible reference witness for comparison. Bibliographic references:
- 1991 PDF/title page: https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf
- Google Books bibliographic record: https://books.google.com/books/about/Kara%E1%B9%87akut%C5%ABhalam_of_Bh%C4%81skar%C4%81c%C4%81rya_w.html?id=fyOS0QEACAAJ
- Archive.org DjVu OCR URL: above.


## 2026-11-16 follow-up: interpretation limits and corrected research priorities

The user clarified that the Archive.org DjVu TXT URL is the same 1991 Krishnadas Sanskrit Series 129 volume whose PDF was already being used. Therefore it is not a second independent textual witness or a newly identified Sudhākara Mālavīya book. Correct any earlier wording that treated it as an independent edition or asked again for its bibliographic identity.

### What is now secure across the available witnesses

- The 24-position krānti and śara tables use four six-position blocks with signs +, −, +, − and forward/reverse ordering. This agrees with the verified 1902 tables and the user's supplied Hindi explanation.
- The 15-part division of sāyana Moon and sapāta Moon yields elapsed khanda counts and remainders/bhogya amounts. Exact unit handling still needs care.
- The pāta-midpoint procedure is a successive subtraction algorithm: start from 15 times the lunar śara, clear as many śara-khanda contributions as possible, retain the residual as an aśuddha amount, divide by the appropriate remaining/bhogya sphuṭa-khanda, then add the quotient to the cleared-khanda contribution before conversion to time by ×60 / lunar motion. This agrees with the 1902 verse 8–9 reading and the 1991 Hindi procedural explanation.
- A 1/13 bhogya correction is genuinely part of the khanda construction. However, the exact operand, unit, order, and rounding must not be simplified to “divide the final combined value by 13”: 1902 p.135 describes correction of bhogya and following krānti-khandas before subsequent śara correction; the user-supplied Hindi explanation describes the signed krānti/śara combination and then the bhogya thirteenth-part correction. Preserve this order discrepancy as a wording/interpretation issue until the Sanskrit and commentary are aligned.

### Important correction: verse 11's 2203 operation is not yet safely parsed

The supplied Hindi OCR reads: “अशुद्ध शरखण्ड से २२०३ में भाग देने पर जो लब्धि हो...”. This Hindi construction may mean 2203 divided by the aśuddha śara-khaṇḍa (2203 ÷ aśuddha amount), not necessarily aśuddha amount divided by 2203. Earlier notes that described 2203 as a fixed divisor applied to the aśuddha amount were too definite. Record the literal Hindi syntax and defer operator direction until the original Sanskrit verse and the 1991 commentary are checked.

Also do not assume the printed string 2203 is a decimal integer. It may encode a sexagesimal number such as 22;03 or another traditional notation. The actual printed typography and commentary must settle this before dimensional analysis.

### Verses 12–14: threshold and duration branch

The Hindi OCR says the śara obtained by the śara-khaṇḍa method is multiplied by 15 and compared with 480: greater than 480 means pāta not possible; less than 480 means possible. Verse 14 then uses a quantity described as “48 में घटाकर 9 से गुणाकर अन्त्य शरखण्ड से भाग” and adds/subtracts the result around pāta midpoint for release/contact. Keep this as a separate branch from verse 11 pending proof. Do not silently identify 480 with a duration limit or 48 with a decimal constant; their scale and units are unresolved.

### What can be attempted now, and what cannot

Can proceed:
1. Formalize the signed khanda table and 15-part division.
2. Formalize the midpoint's clear-subtract / residual / quotient structure, keeping each printed operand and intermediate result.
3. Test the user's Śaka 1290 printed example against the 1902 and 1991 transcriptions without changing any printed reading.
4. Independently investigate the 2203 and 48/9 expressions once their original Sanskrit wording and number notation are visible.

Cannot yet claim:
1. A fully validated universal pāta solver.
2. That verse 11's operation is definitely aśuddha / 2203 or 2203 / aśuddha.
3. That 2203 is decimal rather than sexagesimal notation.
4. That the 48/9 expression and 2203 expression are equivalent or interchangeable.
5. That the 1902 worked-example product discrepancies have been resolved.

### Revised next actions

1. Use the already-held 1991 PDF's relevant page images/text, especially pātādhikāra verses 11–15 and the associated Sanskrit commentaries, to settle operator direction and number notation.
2. Transcribe Sanskrit, Sumatiharṣa commentary, Sudhākara Dvivedī's Vāsanā, and Hindi translation as separate columns; never merge them into one normalized paraphrase.
3. Re-run the Śaka 1290 arithmetic with explicit sexagesimal columns and unit labels, preserving user-confirmed printed values.
4. Only after those steps, test whether the 2203 and 48/9 rules are alternative methods, successive tests, or different kinds of pāta/position calculations.


## 2026-11-16 major source check: 1991 pātādhikāra pp.108–114 (PDF lines 2736–2857)

The 1991 PDF was successfully opened and its searchable text exposes the original Sanskrit verses, Sumatiharṣa commentary, Sudhākara Dvivedī's Vāsanā, and the Śaka 1290 and Śaka 1543 worked examples. This is the same 1991 edition already in the research record, not a second textual witness. Relevant PDF source: https://www.vpmthane.org/bhaskara900/books/Karanakutuhula_w_Sumatiharsa_%26_Dvivedi.pdf

### A. 1/13 correction and midpoint algorithm confirmed directly

At PDF lines 2736–2738, Sumatiharṣa explains the 1/13 correction in the krānti construction: the bhogya krānti khanda is corrected by its thirteenth part, and the bhogya and following krānti khandas are corrected before the śara-khanda correction. Sudhākara's Vāsanā at lines 2757–2758 independently derives the 15/13 relation: when 15 parts correspond to the bhogya khanda, the solar-motion portion corresponds to 13 parts. This supports 15/13 and the one-thirteenth correction, but preserve the precise operand/order stated in each commentary rather than flattening them into one generic correction.

At lines 2746–2748, Sumatiharṣa explains the midpoint algorithm:
- form the khanda multipliers;
- subtract as many corrected khanda contributions as clear from 15 times lunar śara;
- call the uncleared residual the aśuddha amount;
- divide the residual by the corresponding aśuddha sphuṭa-khanda to obtain the fractional khanda contribution;
- add that fraction to the multipliers of the cleared khandas;
- convert the combined angular amount to time by ×60 and divide by lunar motion.
This matches the structure already recorded from 1902 p.136 and the Śaka 1290 example.

### B. Verse 11: operator direction and coefficient now settled

At lines 2766–2770, Sumatiharṣa explicitly says the calculated nāḍikā amount is to be divided by the previously calculated aśuddha khanda. The worked example is printed as 2203 divided by aśuddha khanda 329, giving 5;37 (the exact operand typography/sexagesimal parsing in this first example still needs page-image inspection). The Śaka 1543 example at lines 2805–2806 gives the clearer line: 2203 divided by aśuddha khanda 184;9 gives 11;57; midpoint 12;49, so contact occurs at 0;52 and release at 24;46. This is internally consistent:
- 12;49 − 11;57 = 0;52
- 12;49 + 11;57 = 24;46

Therefore the operator direction is conclusively **2203 ÷ aśuddha-khaṇḍa**, not the reverse. The coefficient 2203 is a numerical coefficient in the time formula, not to be read as the sexagesimal number 22;03.

### C. Why 2203 is used: Sudhākara's derivation

At lines 2817–2829, Sudhākara gives a theoretical derivation for the duration coefficient. The OCR/text extraction shows a formula involving aśuddha-khaṇḍa and lunar motion, then evaluates the coefficient for lunar motion 720 and 780, giving 2187 and 2215 respectively; the combined/intermediate coefficient is printed as 2201, while the Ācārya's adopted value is 2203, described as a small difference. The exact algebraic numerator in the displayed formula is OCR-garbled, so preserve the printed coefficient sequence and commentary's conclusion, but do not reconstruct the damaged numerator yet. This proves 2203 is an approximate adopted coefficient arising from a duration derivation, not an arbitrary divisor.

### D. Verses 12–14: a separate all-khandas-cleared branch

At lines 2772–2787:
- Verses 12–13 describe the case where all khanda contributions can be cleared and the remaining śara amount is compared with 480.
- If the residual is greater than 480, pāta is not possible; if it is less than 480, pāta is possible.
- In the possible case, elapsed/future time is found from the purified khanda contributions.
- Verse 14 gives a distinct duration procedure: subtract the relevant residual śara from 480, multiply the difference by 9, divide by the final khanda, and take half of the resulting ghaṭi amount as the situation (duration on either side of the midpoint).

This is **not** the same branch as verse 11. The correct conceptual split is:
1. An uncleared/aśuddha khanda remains: use the 2203 ÷ aśuddha-khanda duration rule (verse 11).
2. All khanda contributions are cleared and pāta is possible under the 480 threshold: use the special 480-minus-residual, ×9, ÷ final-khanda, then half-result rule (verses 12–14).

The user's Hindi OCR phrase “48” has almost certainly lost the final zero: the Sanskrit verse and both commentaries explicitly read 480. The phrase “अन्त्य शरखण्ड” should be retained as the operative final khanda until its precise definition is checked against the page image.

### E. New mathematical caution

Sudhākara's Vāsanā at lines 2831–2857 also derives the 480-based branch by proportion. The searchable OCR of its final algebra is not perfectly coherent at the last simplification (the printed verse/commentary and Vāsanā appear to express the same branch but the OCR's final factor is damaged). Therefore the procedural order is established, but do not hard-code a simplified closed formula until the page image and sexagesimal units are inspected.

### F. Research status update

Now established from the 1991 text:
- 2203 is the numerator/coefficient divided by aśuddha khanda.
- The 2203 rule and the 480/9 rule are separate procedural branches, not interchangeable forms.
- 480, not 48, is the threshold in verses 12–14.
- The 2203 rule has a second worked numerical example: 2203 ÷ 184;9 = 11;57; midpoint 12;49; contact 0;52; release 24;46.
- The 1/13 correction, 15-part midpoint subtraction, and 60/lunar-motion time conversion are directly explained by the 1991 commentary.

Still unresolved:
- Exact Sanskrit/Hindi wording and number typography in verse 11 and the first worked example, pending page-image inspection.
- The exact dimensional reduction and final algebraic factor in Sudhākara's Vāsanā for the 480/9 branch.
- The original Śaka 1290 intermediate product discrepancies (775;3, 492;3;27, 1273;9, and 626;47 vs printed 627;47). The new 1991 material does not silently correct those readings.
