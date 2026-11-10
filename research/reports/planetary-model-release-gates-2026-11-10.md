# Planetary Asta/Udaya model release gates — 10 November 2026

## Current production behavior

- The Panchang card currently reads the city-specific, pre-captured reference ledger (`data/drik-planetary-reference-2024-2027.json`) through `getDrikPlanetaryReference()`.
- This is a reference-data display, not a live astronomical Asta/Udaya calculation engine. It must not be described as an independently calculated result.
- The public card contains no outbound Drik source links. Removing links does not change the provenance of the underlying captured reference records.
- Unsupported cities/dates must remain unavailable. No Delhi/nearest-city fallback is allowed.

## Research-only event model

`research/planetary-visibility-selector.mjs` estimates the Sun's refracted altitude at the planet's actual local rise/set event. The holdout runner trains each source-year fold only on other years and tests Asta and Udaya boundaries separately.

## Release decision

- Do not promote a planet/boundary model merely because the opposite boundary performs well.
- Saturn Udaya has shown strong agreement in the previously reviewed holdouts, but Saturn Asta has a large failure: the earlier held-out examples were about 22–23 days early (roughly 21.6 days mean absolute error). Saturn Asta is therefore rejected for production pending a new independently validated model.
- Asta and Udaya must be independently gated for every planet. A passing Udaya model cannot authorize Asta, and vice versa.
- A candidate model must have strict forward-year and leave-one-year-out results, report matched and unmatched cases, and satisfy the project civil-date tolerance on every held-out event. One-day civil-date error remains a release failure.
- Clock-time validation is separate from civil-date validation. Do not claim minute-level accuracy from a date-only match.
- Multi-city transfer tests are useful evidence, but a model trained on other cities is not automatically a Pithoragarh model. Location and observer assumptions must be disclosed.

## Independent references

- Panchang Guru's Trikala pages are treated as independent cross-checks, not training truth; their public method does not fully disclose the visibility threshold or exact observer coordinates.
- Rashtriya Panchang / Positional Astronomy Centre heliacal events are a separate comparison class. Heliacal rising/setting terminology and event direction must be normalized before comparing with Asta/Udaya windows.
- TathaAstu's documented Surya Siddhanta kālāṃśa thresholds are a classical-method comparison, not interchangeable with modern heliacal visibility or the Trikala event model. No API output was captured in the current cross-check ledger.
- JPL Horizons topocentric geometry is an independent geometric cross-check, not by itself proof of the traditional visibility convention.

## Next implementation sequence

1. Keep the current public reference card stable while the model is research-only.
2. Select a model separately for each planet × boundary using held-out results; quarantine any failed or under-sampled pair.
3. Extend the direct local source ledger and independent comparisons before extrapolating beyond captured years.
4. Only after the selected model passes date and clock tests, replace reference-only display for that supported planet/boundary. Preserve an explicit unavailable state elsewhere.
5. Build the all-years page only from validated, versioned output with source/method metadata.

## Browser verification

Commit `e60d5e4f2b85dc325d0cddb2884e8255a366930a` updates the phase-diagnostics test file to trigger the branch's push-path workflow. The prior run's browser test failed at JavaScript parse time on a stale regular-expression line; the corrected file was fetched and checked. A successful new browser run has not yet been confirmed, so this report does not mark browser verification as passed.
## 10 November follow-up: conjunction geometry and holdout matching correction

Code audit found a fundamental anchor error in the research selector: Mars, Jupiter, and Saturn were enumerated at 180° relative longitude and labelled a 'superior conjunction'. In geocentric Sun-relative longitude, 180° is opposition; solar conjunction is at 0°. The selector now searches 0° for the outer planets and labels this event `conjunction`, while Mercury/Venus retain 0° inferior and 180° superior conjunction families.

The selector unit tests now assert that Jupiter's nearest solar conjunction is selected at 0°, that the outer-planet generated window is centred on 0°, and that its local boundary directions remain set-to-rise. The direction-year holdout matcher now constrains candidate matches by the corresponding conjunction family, observed local rise/set directions at both published boundaries, and both start/end civil-date errors (each no more than 30 days); eligible matches are ranked by combined absolute date error.

These are research-code corrections, not a production release. The new branch push workflow has not yet been independently confirmed successful through the available workflow-run lookup, which only returns pull-request-triggered runs. Do not treat the model as validated until the branch workflow output, every unmatched record, date errors, and clock errors have been reviewed.