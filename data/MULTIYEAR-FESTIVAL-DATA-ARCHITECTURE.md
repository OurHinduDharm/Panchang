# Multi-year Festival Data — Safe Migration Foundation

Status: draft tooling; single annual exceptions-file policy for 2031 onward; not connected to the live Blogger widget or main Panchang.

## Data layout target

- `data/festival-catalog.json`: stable festival IDs, Hindi names, reusable descriptions, article links, category/tradition and reviewed rule IDs.
- For 2031 onward, only `data/special-festivals/YYYY.json` is a maintained annual festival-date file. The calculated calendar is an in-memory result, not another committed annual JSON.
- `data/festivals/YYYY-MM.json`: may remain as the source during migration and for month-at-a-time editing until a reviewed migration is accepted.
- Research evidence and private review notes must not be shipped in the public visitor payload.

## Safety rules

1. Historical year records are retained. Adding a new year must never overwrite a different year.
2. A Gregorian date is not a reusable rule. Recalculate and verify each year's observance independently.
3. Never promote a record to approved just because a file was combined or tests passed.
4. If any month or event is pending review, the combined year's status remains `needs-review`.
5. Preserve event text, article URLs, category, review status and unknown future fields during migration.
6. Possible duplicates are reported, not silently deduplicated. Some same-date observances are intentionally distinct.
7. The migration tool is read-only by default. Use `--out` to write a separate output file; source files are never edited.
8. Public runtime should fetch only the required year/month/day window. Do not load all historical years on initial page load.

## Migration helper

Run from the repository root:

```sh
node scripts/merge-festival-months-to-yearly.mjs --year 2026 --input data/festivals --out /tmp/2026.json
```

The helper combines available `YYYY-MM.json` files for one year, preserves each event record unchanged, marks the result `needs-review` unless every source month and event is explicitly approved, and reports possible duplicates. It does not calculate dates, validate ritual rules, or certify a festival.

## Rollout sequence

1. Test the migration helper on a disposable output and compare event counts, links and status against every source month.
2. Review and normalize stable catalog IDs without deleting legacy descriptions or links.
3. Store year-specific dates and decisions separately; retain old-year snapshots.
4. Add validation for schemas, date validity, duplicate IDs and approval gates.
5. Connect the existing Calculator and Review pages to the shared catalog/year files using on-demand fetches.
6. Benchmark mobile cold-load size and only then propose runtime integration. No live change until owner approval.

## Single annual festival JSON policy — 27 November 2026

Owner decision: keep exactly one maintained year-specific festival catalogue
file for new years (2031 onward), `data/special-festivals/YYYY.json`.
Only genuinely difficult or unresolved ritual date decisions belong there.
Ordinary observances are calculated from shared reviewed JavaScript rules.
Existing shared card content, names, links, and muhurta rules remain unchanged.
Historical 2026–2030 monthly JSON files are retained without migration or deletion.

Do NOT create a second checked-in `data/festival-years/YYYY.json` or twelve
checked-in monthly festival files for each new year. Annual astronomy inputs,
special-purpose datasets and existing historical/research records are outside
this festival catalogue policy and must not be deleted or silently consolidated.

The pure `assembleHybridFestivalYear` function takes a complete annual
occurrence plan and automatically calculated, reviewed results as transient
objects plus the single year's exceptions package. It returns a validated
annual view in memory; no filesystem writes or extra year JSON are required.
The plan and automatic decisions must eventually come from shared rule
registry and annual calculation, not separately maintained annual files.
The existing review engine is not yet capable of producing a fully approved
plan, and the assembler cannot supply missing approval or provenance.

The monthly view helper selects only a requested month from an approved
in-memory annual result. It rejects incomplete or invalid snapshots rather
than showing a false empty calendar. Public renderers remain unchanged until
all target-year occurrences, source approvals, date boundaries, historical
fallback, selected-location behavior and mobile cold-load performance are tested.

Prefer cached calculation outside the UI thread or offline computation when
necessary. If direct JavaScript calculation is too slow, an automatically
generated temporary deployment/cache representation may be considered after
measuring performance and obtaining owner approval; it must not introduce a
second manually maintained or committed annual festival catalogue. Do not
silently relax this policy to make publication easier.

### Compact exceptions contract

Use exact `contentKey` references to the shared catalogue templates (currently
`data/festival-content-master.json`), with an explicit occurrence ID, date,
optional date-dependent fields and reviewed decision provenance. Do not repeat
titles, long descriptions, article links or muhurta rule definitions in the
annual exception package. Missing or ambiguous keys must fail closed; newly
needed permanent content belongs in the shared catalogue after review. The
compact package is expanded transiently before the existing approval gates.
The shared catalogue's present template keys are not a complete stable
observance-ID registry; the target-year plan and any missing content must
still be verified independently. Performance estimates use synthetic exception
rows with real catalogue keys, not approved 2031 data.

### Editing the single shared master

Keep `data/festival-content-master.json` as one shared file. Both automatic
transient decisions and manual exceptions inherit exact-key master content via
the compact expansion functions. Edit the template's title, description or
article links, but keep its existing key unchanged; changing a key requires
an explicit reviewed migration. A content edit does not alter the independent
occurrence date or rule ID. Changes to muhurta rules are functional changes
and require their own review. Existing historical cards are not rewritten.
The runtime is not yet connected; these are assembly contract guarantees.
