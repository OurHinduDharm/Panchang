# Chapter IX daily-motion source audit — 18 October 2026

**Status:** research-only source audit. No production files or event thresholds changed.

## Source-level finding

Chapter IX.10–11 calls for the daily motions (*bhukti*) of the Sun and planet, then converts those motions through the rising-time equivalent of the sign occupied by each body. A modern ephemeris derivative must not be silently substituted.

Chapter I.53–56 establishes mean places from elapsed days and permits calculation from a chosen epoch. Chapter II supplies the corrections that turn mean places into true places and explicitly discusses corrected daily motion:
- II.34–39: manda epicycle and equation.
- II.43–45: combined true-place correction and sign of the equation.
- II.46: a daily-motion-based correction associated with the difference between mean and true solar place.
- II.50–52: daily motion is corrected through the manda/śīghra geometry, including the possibility of retrograde motion.

Primary-text cross-checks:
- Chapter I, verses 1.53–1.58: https://www.swaveda.com/texts/surya-siddhanta/1/
- Chapter II, verses 2.34–2.52: https://www.swaveda.com/texts/surya-siddhanta/2/
- Chapter IX, verses 9.2–9.11: https://www.vedaseek.com/books/suryasiddhanta/9
- Burgess translation, Chapter IX: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf

## Consequence for implementation

The current Chapter IX helper correctly isolates the IX.11 conversion, but it accepts daily motions as upstream inputs and does not establish their provenance. Passing arithmetic tests is not evidence that the complete classical time estimate is implemented.

The research implementation must expose separate candidates rather than conflate them:

1. **Source-derived bhukti candidate:** derive mean positions from one explicit epoch/day-count/frame; apply the Chapter II motion-correction rules; retain signed motion, including retrograde.
2. **Finite-difference true-place candidate:** derive source-model true longitudes at two adjacent source-model times and calculate a signed difference. This is a numerical control on the source model, not automatically the text's prescribed bhukti.
3. **Modern ephemeris derivative:** keep as an external comparison only.

Feed each candidate into the same IX.11 rising-asus conversion and compare predicted time against the same independently computed IX.4–5 event geometry. Do not choose a candidate just because it best matches TKS or a modern ephemeris.

## Still open

- The civil date → Kali ahargaṇa → chosen epoch and local-meridian bridge must be explicit and tested.
- The solar Chapter II candidate has arithmetic implementation, but its epoch/frame anchors are not reconciled.
- Full planetary true-motion correction requires the Chapter II śīghra and manda sequence; it is not supplied by the current solar-only helper.
- Event-geometry branch and the 0°/360° question remain separate.
- Daily-sample interpolation is a diagnostic bracket, not independently certified classical truth.

## Decision

Do not alter production app.js or extra-panchang.js. Do not relabel preliminary day-level estimates as verified classical Udaya/Asta. First establish an explicit epoch/frame and a source-derived bhukti input, then test Venus Udaya and one Jupiter event through the same IX.11 conversion.

## Practical interpretation

The text gives a route to calculate motion; it does not authorize treating every numerical derivative as interchangeable with that motion. Chapter II.50–52 is particularly important because corrected motion can change sign and become retrograde. The implementation must preserve signed motion and document the exact stage at which each correction enters.

The next coding gate is not another threshold adjustment. It is a small source-model motion adapter with explicit provenance and test fixtures. Until the epoch/day-count bridge is settled, its outputs must remain synthetic or relative tests, not date-specific planetary predictions.


## Numerical baseline from the source revolution counts

Using the source solar revolution count 4,320,000 per yuga and 1,577,917,828 savana days per yuga, the mean solar motion is:

- 360 × 4,320,000 ÷ 1,577,917,828 = **0.9856026546°/day**
- Equivalent: **59.1361593 arcminutes/day**

This is a reproducible Chapter I mean-motion baseline, not the true daily solar motion needed for a date-specific Chapter IX estimate. The next comparison must apply the Chapter II solar manda correction at adjacent, epoch-anchored times and measure how the signed motion differs from this baseline. The result must not be passed off as final Asta/Udaya timing.


## Implementation checkpoint — adjacent-sample motion control

Added research-only module `ss_chapter2_solar_motion_candidate.js`. It applies the current Chapter II solar-manda candidate at two explicitly supplied samples and calculates:
- signed mean-longitude finite difference per elapsed day;
- signed finite difference of the corrected-longitude candidate;
- the difference between those rates, labelled as the manda candidate's contribution;
- both endpoint values and the unresolved assumptions.

The module is intentionally fed with explicit samples. It does **not** convert civil dates to ahargaṇa, invent a mandocca epoch, or claim that finite-difference motion is the exact *bhukti* prescribed by Chapter IX. It rejects missing samples and non-increasing sample times, and its wrap test guards against a false 359° jump at 0°.

The four new synthetic tests are wired into `ss_classical_frame_test.js`. The GitHub workflow wrapper returned no PR-triggered run for the latest test-wiring commit, so these tests are **not yet reported as CI-passed**. Next: run the repository's actual workflow, inspect its output, and only then decide whether the underlying Chapter II correction and epoch/frame inputs are good enough to use in the Venus Udaya fixture.

## CI follow-up — 19 October 2026

The diagnostic workflow path filter now explicitly includes both this audit note and
`ss_chapter2_solar_motion_candidate.js`. Before this fix, edits to those two files
could fail to trigger the Chapter IX workflow on a branch push.

Verification after the workflow change:
- Chapter IX diagnostic workflow run **39159898526**: success.
- Panchang feature validation run **39159898544**: success.
- The Chapter IX workflow completed its headless Chromium research-page test and
  the final guard confirming `app.js` and `extra-panchang.js` are unchanged.
- These results validate the research harness and arithmetic checks, not the
  source-derived daily motion, epoch/frame anchors, or published event dates.

## Next gate — do not mistake the control for the source algorithm

The current finite-difference helper is deliberately only a control. It corrects
the Sun's candidate longitude at two supplied samples, then measures a signed
circular difference. It does not yet produce the complete planetary `bhukti`
required for a date-specific Chapter IX estimate.

The next implementation step is to establish a matched, source-derived daily-motion
input with explicit provenance, rather than adding more generic tests:
1. Freeze the same event instant, event branch, frame, and location for the Venus
   Udaya and Jupiter comparison fixtures.
2. Export the current IX.11 terms and the corrected/raw K residual for adjacent
   valid samples, keeping Akṣa and Āyana contributions separate.
3. Compare the analytic IX.11 rate with the observed local K slope as a diagnostic;
   do not silently add the dṛkkarma derivative to the source formula.
4. Do not call a modern ephemeris derivative the classical `bhukti`. Keep it as a
   separate control until the Chapter II planetary correction sequence and its
   epoch/frame are reconstructed.

No production file, threshold, or event date is changed by this checkpoint. PR #22
remains Draft and unmerged.
