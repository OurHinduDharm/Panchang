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
