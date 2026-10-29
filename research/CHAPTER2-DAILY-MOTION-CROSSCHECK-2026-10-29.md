# Chapter II daily-motion cross-check — 29 October 2026

**Status:** research-only numerical ledger. No production event dates, thresholds, or production Panchang files changed.

## Fixture and provenance

- Comparison date: 11 October 2026.
- External control: Vidhyamitra's Sūrya-siddhānta ledger at apparent noon in Ujjayinī, Burgess/no-bīja convention.
- Rounded external daily-motion values: Sun +59.5′/day, Venus −38.4′/day, Jupiter +9.9′/day.
- Candidate ahargaṇa: 714404169486.5, advanced three days from the repository's 8 October source-anchored reference.
- This is a candidate alignment, not proof that apparent noon and local-mean noon are identical or that the epoch/frame is finally adjudicated.

## Same-date source-rate comparison

| Body | II.47–51 source-rate candidate | External rounded control | Candidate minus control |
|---|---:|---:|---:|
| Sun | +59.505423′/day | +59.5′/day | +0.005423′/day |
| Venus | −38.388622′/day | −38.4′/day | +0.011378′/day |
| Jupiter | +9.904336′/day | +9.9′/day | +0.004336′/day |

All three source-rate candidates fall within the rounding interval of the external values. This is a useful cross-check, not independent proof: the inputs still rely on research epoch/apsis candidates, and the external rates are rounded.

The alternative II.50 reference-length candidate (“second-equation-cosine”) returns +59.407806′/day for Venus and +5.487698′/day for Jupiter at this fixture, versus the standard trijyā/radius candidate's −38.388622′/day and +9.904336′/day. The sign disagreement for Venus and large Jupiter difference weigh against the alternative for this fixture, but closeness alone does not settle the textual reading; keep both variants visible until the source convention is adjudicated.

## Source rate versus finite difference of the same four-pass true-place candidate

The ledger now calculates the finite-difference control both before and after the Chapter II.46 bhujāntara correction.

| Body | Source rate | Four-pass true-place FD, before II.46 | Source − pre-II.46 FD | FD after II.46 | Source − post-II.46 FD |
|---|---:|---:|---:|---:|---:|
| Sun | +59.505423 | +59.496508 | +0.008915 | +59.496508 | +0.008915 |
| Venus | −38.388622 | −38.621269 | +0.232647 | −38.620283 | +0.231660 |
| Jupiter | +9.904336 | +10.725420 | −0.821084 | +10.725503 | −0.821167 |

Units are arcminutes/day.

### Finding

1. The discrepancy persists before Chapter II.46. Bhujāntara changes the finite-difference rate by only about 0.001′/day for Venus and 0.0001′/day for Jupiter at this sample. Therefore II.46 is **not** the main explanation for the source-rate/finite-difference mismatch.
2. Venus's discrepancy is about 0.23′/day (roughly 0.6%) at the central sample.
3. Jupiter's discrepancy is about 0.82′/day (roughly 7.7%) at the central sample. The five-day neighbourhood test keeps the Jupiter mismatch between about 0.46′/day and 0.82′/day (roughly 4.5%–7.7%); this is not a one-date numerical accident.
4. The same-model finite difference is a control derived from the separate four-pass true-place candidate; it is not automatically the canonical derivative intended by II.47–51. The mismatch could reflect a difference between the source daily-motion construction and the position-correction chain. The exact cause remains open.

## Component-level inspection of the rate mismatch

The latest diagnostic also prints the individual II.47–51 terms. At the same fixture:

| Intermediate | Venus | Jupiter |
|---|---:|---:|
| Mean motion relative to mandocca | +59.136152′/day | +4.985768′/day |
| Signed manda equation | +0.176757′/day | −0.209466′/day |
| Manda-corrected motion | +59.312916′/day | +4.776315′/day |
| Śīghrocca motion | +96.128784′/day | +59.136159′/day |
| Śīghra-minus-manda motion | +36.815868′/day | +54.359845′/day |
| Variable-hypotenuse factor (H−R)/H | −2.653789 | +0.094335 |
| Śīghra correction | −97.701538′/day | +5.128021′/day |
| Final source-rate candidate | −38.388622′/day | +9.904336′/day |

The signs are preserved; Venus's large negative śīghra correction produces the retrograde result. Jupiter's source-rate formula combines a −0.209466′/day manda equation with a +5.128021′/day śīghra correction.

The Chapter II.46 control is not the cause of the mismatch: for Jupiter, the corrected and uncorrected finite differences differ by only about **0.000083′/day**; for Venus, by about **0.000987′/day**. The source-vs-finite-difference gap remains essentially unchanged when II.46 is removed.

## Updated next calculation gate

The next narrow audit is the relationship between the **II.43–45 four-pass true-place candidate** and the **II.47–51 true-daily-motion construction**, particularly the manda inputs and fourth-pass variable hypotenuse for Jupiter. Do not change the source-rate formula simply to force agreement with the finite difference: first verify that the two procedures use equivalent intermediate places and correction order. Keep the II.50 alternative separately reported.

## Next calculation gate

Do not feed the current source-rate candidate into Chapter IX.10–11 yet. Inspect the source intermediate chain in this order:

1. Compare the manda-corrected motion term against the finite-difference change in the manda-corrected longitude.
2. Compare the śīghra correction term and the fourth-pass variable hypotenuse against the same source position sequence, especially for Jupiter.
3. Confirm that the mean, mandocca, śīghrocca, epicycle, and rising-time inputs use the same epoch and frame.
4. Retain the pre-/post-II.46 controls and both II.50 readings as separate rows; do not tune any parameter to modern event dates.

## Automated verification

Research workflow run 40910973509 completed successfully:
- 5/5 source daily-motion ledger tests passed.
- Headless Chromium research-page test passed.
- Production-file guard confirmed `app.js` and `extra-panchang.js` unchanged.
- The iteration-solver tests and general Panchang validation also passed on the same head commit.

These checks establish finite arithmetic and repository isolation, not certification of a classical Asta/Udaya time.
