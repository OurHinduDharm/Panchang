# Festival observance-rule migration inventory (2026–2030)

## Scope

Read-only inventory of the 60 approved monthly publication JSON files currently covering 2026–2030. This report counts existing records and fields; it does not assign rules or change published dates.

## Current catalogue shape

| Year | Events | Has Hindu tithi | No Hindu tithi | Has `muhurtaRule` | Has explicit observance rule ID |
|---:|---:|---:|---:|---:|---:|
| 2026 | 376 | 344 | 32 | 86 | 0 |
| 2027 | 495 | 472 | 23 | 82 | 0 |
| 2028 | 386 | 359 | 27 | 84 | 0 |
| 2029 | 324 | 321 | 3 | 86 | 0 |
| 2030 | 349 | 345 | 4 | 108 | 0 |
| **Total** | **1,930** | **1,841** | **89** | **446** | **0** |

## Important distinction

- `muhurtaRule` is an existing muhurta-calculation field. It is **not** a festival observance-date rule and must not be repurposed as `observanceRuleId`.
- The 1,841 records carrying `hinduTithi` are not automatically simple-tithi observances. A tithi label identifies the lunar date; it does not by itself decide sunrise, Pradosha, Nishita, Madhyahna, Aparahna, moonrise, vedha, two-day tie-breaks, or regional practice.
- The 89 records without `hinduTithi` need a separate classification. They may be solar/seasonal, Gregorian-date, regional, multi-day, or missing metadata; do not guess from their titles.
- No current monthly event has an explicit `observanceRuleId` or `ruleId` field. Therefore the new resolver is not yet connected to the publication catalogue.

## Migration plan

1. Add a stable observance ID and explicit `dateType` to each catalogue record: `tithi`, `fixed-gregorian`, `solar`, `seasonal`, or `manual-review`.
2. Map each record to a registered `observanceRuleId` only after the actual observance decision has been checked. Reuse one shared rule ID across years.
3. Keep `muhurtaRule` unchanged and separate.
4. For each rule, document its primary text/source, tradition, required calculation inputs, tie-breaks, exceptions, and regression fixtures.
5. Run the new resolver in review-only mode against one year at a time. Compare selected dates with the approved 2026–2030 publication baseline and explain every difference.
6. Do not regenerate or publish monthly JSON until each affected rule and date has passed source review and explicit approval.

## Current rule-engine boundary

The year-independent resolver and annual-Panchanga adapter are available in `festival-rule-engine.mjs`. It preserves rule provenance and review status, rejects unknown rule IDs, and never marks a candidate publishable. Missing inputs such as moonrise remain unresolved; the calculation layer must supply the required local boundary before that observance can be resolved.
