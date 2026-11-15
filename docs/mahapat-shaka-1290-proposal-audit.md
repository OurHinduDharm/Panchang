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
