# Festival / Observance / Stage Model — Draft Proposal

Status: design proposal only. Not a production contract; do not wire into Blogger or recalculate legacy dates until reviewed.

Branch: `data/festival-json-foundation`  
Parent work: PR #33 — structured festival data foundation

## Why a stage model is needed

The migrated archive contains 122 records, but a legacy row is not always one independently dated observance. Examples include Navratri day rows, Ashtami/Navami, Kalash immersion, Diwali with Lakshmi Puja, Mokshada Ekadashi with Gita Jayanti, and multiple Jayantis in one title. A legacy `endDate` can mean a display period, not necessarily a ritual stage.

A single `date.start` plus `date.end` must therefore not be treated as the complete schedule.

## Proposed concepts

- **Festival group**: a human-facing grouping, such as Sharadiya Navratri or Diwali period. Optional; it does not itself imply that every item shares a date rule.
- **Observance**: one named religious observance with its own identity, tradition/region scope, date rule, and source trail.
- **Stage**: an independently timed part of an observance, such as Ghatasthapana, Nishita Puja, Ashtami, Navami, Parana, or Kalash immersion. Stages can fall on different civil dates.
- **Rule record**: the reviewed rule that determines an observance/stage date or time. Research notes and executable rules remain separate.
- **Source record**: source URL plus, where available, grantha, edition, chapter/verse/page, quotation/faithful note, interpretation, and verification status.

## Illustrative shape (not yet approved)

```json
{
  "schemaVersion": 2,
  "groups": [
    {
      "id": "sharadiya-navratri",
      "name": "शारदीय नवरात्र",
      "observanceIds": [
        "sharadiya-navratri-start",
        "sharadiya-navratri-ashtami",
        "sharadiya-navratri-navami"
      ]
    }
  ],
  "observances": [
    {
      "id": "sharadiya-navratri-ashtami",
      "name": "महाष्टमी",
      "groupId": "sharadiya-navratri",
      "traditionScope": ["general"],
      "stages": [
        {
          "id": "puja",
          "name": "महाष्टमी पूजा",
          "dateRuleId": "rule-id-pending-review",
          "timeRuleId": "muhurat-rule-id-pending-review"
        }
      ],
      "sources": [],
      "verificationStatus": "needs-review"
    }
  ]
}
```

This shape is illustrative. IDs, field names, allowed statuses, and compatibility strategy still need review before it becomes the schema.

## Required behaviour

1. Preserve the original `festivals.json` records and `sourceText` exactly during the research/migration phase.
2. Do not infer that `endDate` is a puja end time or a series of stages.
3. Allow one legacy record to map to multiple observances when its title/description genuinely contains distinct observances. Keep a trace back to the original legacy record ID.
4. Keep multiple article links. The migrated description may contain more than one link; a single `sourceUrl` field is not sufficient to represent all of them. Do not discard URLs embedded in the original HTML.
5. Support tradition-specific results (initially the user-confirmed Smarta and Vaishnava Ekadashi profiles) without silently treating generic Vaishnava as ISKCON/Gaudiya.
6. Keep astronomical event, local visibility, ritual/sutak decision, fasting date, and Parana as distinct facts where applicable.
7. Store rule status and evidence status separately. A well-documented research candidate is not automatically an approved executable rule.
8. Display a source link only when verified. If no article link is available, preserve the source description; any researched replacement/addition needs provenance.
9. Keep date computation location/timezone aware. Never use a copied Gregorian legacy date as the recurring rule.
10. Do not connect the new model to the live Blogger widget until migration, validation, preview, and explicit user approval.

## Migration and validation sequence

1. Agree on the conceptual model before changing the current schema version.
2. Add a validator/test that confirms all 122 legacy IDs and original `sourceText` values remain present and unchanged.
3. Build a mapping report from each legacy ID to its proposed group/observance/stage IDs; mark ambiguous records for review instead of guessing.
4. Extract all article links from original descriptions into a multi-link list without deleting the original HTML.
5. Review high-priority cases first: the 1970 eclipse placeholder, stale 2025 dates, Ekadashi/Mahadvadashi, multi-stage Navratri, and combined titles.
6. Keep all new dates/rules as research-only until source review and worked local-time test cases are complete.
7. Validate JSON/schema and migration invariants in CI before considering any runtime integration.

## Decisions still open

- Whether the top-level data should be `groups` + `observances`, or a backward-compatible `festivals` array containing nested `observances[]`.
- Whether the old `date` object stays as a compatibility field during transition.
- The exact rule/source object schema and controlled vocabulary for review statuses.
- How to model alternate regional calendars and Purnimanta/Amanta month conventions without assuming a single convention for every observance.

No calculation rules are approved by this proposal. No Blogger/runtime changes are authorized by it.
