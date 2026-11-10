# Pithoragarh validation sample audit — 10 November 2026

## Dataset inventory

Source ledger: `data/drik-pithoragarh-asta-udaya-2021-2027.json`.

- 75 raw windows are present before deduplication.
- The holdout runner deduplicates identical planet + normalized Asta-start + normalized Asta-end windows before fitting.
- Mercury has 6–7 source windows per source-page year (2021–2027).
- Venus has only 1–2 windows per source-page year.
- Mars, Jupiter, and Saturn generally have one window per available source-page year; some years are absent for Mars.
- The observer used for astronomical features is a Pithoragarh proxy at 29.5828° N, 80.2182° E, 1,650 m. The reference publisher's exact observer coordinates are not disclosed.

## Consequences for model selection

1. Mercury is the only planet with enough repeated annual windows to explore a small number of feature variants, and even there the sample remains modest.
2. Venus, Mars, Jupiter, and Saturn cannot support a high-dimensional fitted visibility model from this local ledger. Keep their research fits magnitude-only unless new independent local windows are collected.
3. A model fitted to six or fewer annual windows is highly sensitive to individual records. A leave-one-source-year-out score is useful as a rejection test, but not by itself sufficient proof of generalization.
4. The source-page year is not always the civil year of the Asta start: the 2021 Mercury page includes a window beginning 2 December 2020. Holdout grouping must therefore remain explicit and must not be casually replaced by event-calendar year.

## Holdout-runner audit

`tests/report-pithoragarh-direction-year-holdout.mjs` uses the source-page year for training exclusion, then evaluates the holdout windows by Asta-start event year. It reports unmatched windows rather than silently counting them as successes. Candidate matching currently selects the nearest unused predicted Asta within a 30-day tolerance; therefore the prediction table and unmatched count must be reviewed, not just aggregate mean absolute error. A future hardening pass should match apparition/conjunction family and event direction explicitly before interpreting close-but-wrong matches.

## Release decision

- No new production coefficients are approved by this audit.
- Keep Asta and Udaya release gates separate for every planet.
- Keep the public card on its existing city-specific reference-data path until a model passes strict held-out civil-date checks and separate clock-time checks.
- Do not infer minute-level accuracy from date agreement, and do not substitute another city's coordinates or records.
- Expand the local source ledger before attempting complex fits for planets with one annual window.

## Next research priority

Improve candidate-to-reference matching in the holdout runner so it uses conjunction family and local rise/set direction, then re-run all folds and inspect every prediction/unmatched row. Only after that should coefficient changes be considered.