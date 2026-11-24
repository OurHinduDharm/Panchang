# Year-independent festival rule architecture

## Decision

Festival dates are to be calculated by OurHinduDharm from Panchanga data and reviewed observance rules. External annual calendars are references for cross-checking, not the date engine and not automatic overrides.

The implementation is year-independent: one reviewed rule is reused for every year. A new year must not require copying or rewriting the same decision logic.

## Responsibilities

### 1. Panchanga calculation layer

For the requested year and location, calculate the underlying astronomical/calendar facts, including:
- local sunrise, sunset, moonrise and required night/day boundaries;
- actual tithi start/end intervals, paksha and lunar month;
- nakshatra intervals and other supporting anga when a rule needs them;
- decision windows such as Arunodaya, Madhyahna, Aparahna, Pradosha and Nishita.

This layer reports facts. It does not decide which festival date to publish.

### 2. Shared observance-rule layer

Keep year-independent rules in shared code/modules, keyed by stable rule IDs. Each rule receives calculated facts for the relevant consecutive local days and returns:
- selected civil date (or an explicit unresolved result);
- rule ID and rule version;
- evidence/selection basis and any exception encountered;
- a status such as calculated, needs-review, or manual-review.

Rules must fail closed when required intervals or boundaries are missing. A plain tithi match is sufficient only for observances whose reviewed rule actually says so. Where shastriya nirnaya depends on sunrise, tithi duration, a named kala, vedha, conjunction, or a two-day tie-break, implement that exact decision rather than a generic tithi matcher.

Use Smarta vrata decisions as the project's primary vrata policy. Do not introduce Vaishnava Ekadashi dates as parallel public observances. Where a conflict exists, retain Drik Panchang as a year-specific reference/timing cross-check and apply the reviewed Smarta rule; never let an external date silently override it.

### 3. Festival catalogue / content data

Festival catalogue data describes what an observance is, not how its date is calculated. Keep stable fields such as:
- observance ID, title, aliases and category;
- public Hindi description and article URL;
- lunar-month / paksha / tithi identity where relevant;
- ruleId pointing to the shared rule;
- source/review metadata needed by build and audit tools.

Do not duplicate executable rule logic or annual dates in the shared catalogue. Do not merge independent observances merely because they share a civil date.

### 4. Annual generated JSON

Annual/monthly JSON remains the static data consumed by Blogger widgets. It is the generated publication snapshot containing calculated civil date, Hindu tithi label, display content, rule ID/version and review/publication status. It is not the authority for calculation and must not become a second copy of the rules.

Generate it by running the same calculation and rule modules for each year. Preserve existing manually approved 2026–2030 dates as the current public baseline until each observance has been migrated, compared and explicitly approved. Do not bulk-rewrite those dates during foundation work.

### 5. Genuine fixed-date exceptions

Some remembrance observances are tied to a documented Gregorian date rather than an annual tithi. Represent those explicitly as a fixed-date rule with month/day, source and date type. Do not force such entries into a lunar-tithi rule. If a saint's accepted observance is tithi-based, use the tithi rule instead.

## Rule registry contract

A rule registry entry should identify:
- stable ID and semantic version;
- supported observance(s), lunar month, paksha and tithi constraints;
- required Panchanga inputs and decision window;
- selector implementation;
- primary textual source / page or section and review state;
- known exceptions and regression fixtures.

A resolver must return structured evidence, not only a date. The annual generator must refuse publication when the rule is unknown, input is incomplete, result is ambiguous, or required source approval is absent.

## Migration sequence

1. Inventory every observance in the existing 2026–2030 catalogue and classify it as (a) simple tithi, (b) shastriya vrata/nirnaya rule, (c) fixed Gregorian date, or (d) unresolved/region-specific.
2. Map each tithi-based observance to one stable rule ID. Identify duplicate rule logic and consolidate it into shared year-independent modules.
3. Complete and independently review the decision rule for each vrata/parva. Keep complex or disputed cases in manual review; do not guess.
4. Build a year-independent resolver and tests using synthetic edge cases plus known annual examples. Include repeated tithis, kshaya tithi, two-day vyapti, missing data, and timezone/location boundaries where relevant.
5. Generate a review-only annual result for one year first. Compare every affected result with the approved 2026–2030 baseline and source references; explain every difference.
6. After the user approves rule and date changes, regenerate annual JSON. Only then connect the new generated output to the existing static Blogger data path.
7. Extend the same generator to future years (including 2031+) without copying rule code or auto-approving unreviewed results.

## Non-goals for the foundation change

- No change to live Blogger rendering or widget URLs.
- No automatic replacement of approved 2026–2030 dates.
- No blanket claim that every festival can be decided from tithi name alone.
- No merging of separate saints/festivals and no public-facing research diagnostics.
- No change to existing muhurta calculations unless a separate, reviewed task requires it.

## First implementation target

Start with a small, representative set of rules whose source decisions are already documented and whose input data is available. Verify the shared resolver contract end-to-end in review-only mode before migrating the full catalogue. Keep the existing candidate/evidence detector separate from final observance-date selection until each rule is fully reviewed and approved.
