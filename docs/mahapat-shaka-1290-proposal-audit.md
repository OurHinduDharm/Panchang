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
