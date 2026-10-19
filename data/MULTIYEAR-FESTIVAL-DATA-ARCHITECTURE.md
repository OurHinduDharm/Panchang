# Multi-year Festival Data — Safe Migration Foundation

Status: draft tooling; not connected to the live Blogger widget or main Panchang.

## Data layout target

- `data/festival-catalog.json`: stable festival IDs, Hindi names, reusable descriptions, article links, category/tradition and reviewed rule IDs.
- `data/festival-years/YYYY.json`: that Gregorian year's dates, tithi context, review status and approved year-specific decisions.
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
