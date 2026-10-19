# Chapter II.47–51 daily-motion algorithm audit — 19 October 2026

**Status:** source interpretation checkpoint; research-only. No production files or event dates changed.

## Why this is the next step

The Chapter IX.10–11 helper requires the Sun's and planet's daily motions (*bhukti*) after the rising-time conversion. The existing `ss_chapter2_solar_motion_candidate.js` is only a two-sample finite-difference control. It is not the complete source-derived daily-motion method and must not be used as if it were.

The source search surfaced a more direct route: Sūrya-siddhānta II.47–51 is explicitly headed/described in the Swaveda/Burgess text as the calculation of true daily motion. This is more relevant to the open question than adding more angular-threshold tests.

## Textual evidence

- II.46 describes a solar apparent-time correction applied to planetary true place; it is a separate correction and must not be confused with the daily-motion sequence.
- II.47–49 describe the manda-corrected motion and the use of the appropriate apsis epicycle and sign convention.
- II.50–51 then compare the manda-corrected planetary motion with the śīghrocca motion, apply the variable-hypotenuse/radius relationship, and explicitly allow the resulting motion to become retrograde.
- II.52 continues the explanation of retrograde motion.
- IX.10–11 then use the daily motions in the time estimate and convert them through the relevant rising-time equivalents.

Cross-checks:
- Burgess translation (1860), Chapter II, verses 2.46–2.52: https://www.swaveda.com/texts/surya-siddhanta/2/
- A second online rendering of II.47–51 and its computed sequence: https://www.vidhyamitra.com/surya-siddhanta/2
- Chapter IX text: https://www.vedaseek.com/books/suryasiddhanta/9

The accessible Burgess text explains II.50–51 in particular: subtract the manda-corrected planetary daily motion from the śīghra/conjunction motion; scale the remainder by the difference between the last hypotenuse and radius; divide by the variable hypotenuse; then apply the appropriate sign. If the subtraction would make the direct motion negative, the residual is retrograde. This is not equivalent to taking a modern ephemeris derivative.

## Implementation decision

Do **not** derive date-specific planetary bhukti from the current solar-only helper. The complete source-derived candidate needs, at minimum:

1. Source-consistent mean longitude and mean daily motion for the planet.
2. Source-consistent mandocca and śīghrocca longitudes and their motions.
3. The exact Chapter II manda correction sequence and the corresponding corrected daily motion.
4. The śīghra correction using the appropriate variable hypotenuse, with signed direct/retrograde output.
5. A matched epoch and angular frame for every input, documented independently from modern ephemeris controls.
6. Tests for direct motion, stationary/near-zero motion, retrograde sign, 0°/360° wrap, and a worked source example before using the output in IX.10–11.

Do not infer that a correct-looking result proves the frame or epoch. The source arithmetic and the civil-date/epoch bridge are separate validation gates.

## Specific caution

II.47's wording/translation refers to the Moon in one grammatical rendering, while the surrounding sequence and Burgess's explanatory notes describe the general true-daily-motion procedure. Before coding the generalized helper, transcribe the full Sanskrit of II.47–51 from the chosen recension and check the commentary/edition used for the planetary sequence. Do not resolve that textual nuance by silently assuming the modern algorithm.

## Finite next test gate

Implement one research-only function that accepts explicit, already frame-matched source inputs and returns each intermediate term—not just the final rate. Use a single Venus sample and one Jupiter sample, then compare the source-derived bhukti against (a) adjacent-sample finite difference of the same source model and (b) modern ephemeris derivative, keeping all three labelled separately. Only after this intermediate ledger is internally consistent should either rate be passed to the same Chapter IX.10–11 conversion and compared with the independently computed K/C boundary.

## Guard

The Chapter IX diagnostic workflow passed on 19 October 2026 (run 39159898526), including the headless browser test and the check that `app.js` and `extra-panchang.js` remain unchanged. This verifies the test harness, not the astronomical interpretation or any published Udaya/Asta time. PR #22 remains Draft and unmerged.


## Implementation checkpoint — explicit II.48–51 arithmetic steps

Reviewed the available Sanskrit rendering against Burgess's translation. The relevant source wording includes:

- II.48: `grahabhukteh phalaṃ kāryaṃ grahavan mandakarmaṇi / dorjyāntaraguṇā bhuktis tattvanetroddhṛtā punaḥ`
- II.49: `svamandaparidhikṣuṇṇā bhagaṇāṃśoddhṛtā kalāḥ / karkyādau tu dhanaṃ tatra makarādāv ṛṇaṃ smṛtam`
- II.50: `mandasphuṭīkṛtāṃ bhuktiṃ projjhya śīghroccabhuktitaḥ / taccheṣaṃ vivareṇātha hanyāt trijyāntyakarṇayoḥ`
- II.51: `calakarṇahṛtā bhuktau karṇe trijyādhike dhanam / ṛṇaṃ ūne 'dhike projjhya śeṣaṃ vakragatir bhavet`

Cross-checks: [Vidhyamitra, Chapter II](https://www.vidhyamitra.com/surya-siddhanta/2) (the page was searchable but intermittently unavailable to direct fetch) and [Swaveda/Burgess, Chapter II](https://www.swaveda.com/texts/surya-siddhanta/2/), especially its translation and explanatory notes at 2.49–2.51.

Added research-only `ss_chapter2_daily_motion_correction.js` with two isolated steps:
1. II.48–49: source sine-difference × motion-from-mandocca ÷ 225, then corrected manda epicycle ÷ 360, with the sign branch from Cancer inclusive to Capricorn exclusive.
2. II.50–51: (śīghrocca motion − manda-corrected motion) × (variable hypotenuse − supplied radius) ÷ variable hypotenuse; the final signed rate is preserved, including retrograde.

A boundary test was added at exactly 90° (Cancer starts the additive interval) and 270° (Capricorn starts the subtractive interval). The helper reports the radius convention as caller-supplied because Burgess records an alternative interpretation of the radius in II.50–51.

**Important limitation:** this does not yet derive the input sine values, mean/mandocca/śīghrocca rates, epicycles, or hypotenuse from a date-anchored planetary state. It is an intermediate formula adapter, not a complete Chapter II planetary-motion engine. All tests are synthetic sign/arithmetic tests; no date-specific Venus or Jupiter motion is certified.

The helper is now wired into `ss_classical_frame_test.js` and the Chapter IX diagnostic workflow's path/syntax checks. The current CI run must complete before calling these new tests CI-passed. Next step after CI: build one explicit, same-frame source-intermediate ledger for Venus and Jupiter, and keep the source-derived motion, adjacent-sample finite difference, and modern ephemeris derivative in separate columns.


## Independent classical-model numerical control — Vidhyamitra, 11 October 2026

The Vidhyamitra Sūrya-siddhānta ledger reports its own model at **apparent noon in Ujjayinī**, explicitly using Burgess's text **without bīja**. Its displayed planetary table gives:

| Body | True longitude in the page's notation | Daily motion |
|---|---|---:|
| Sun | Kanyā 23°08′ | +59.5′/day |
| Jupiter | Siṃha 1°19′ | +9.9′/day |
| Venus | Kanyā 19°26′, retrograde | −38.4′/day |
| Saturn | Mīna 7°54′, retrograde | −4.6′/day |

Source: https://www.vidhyamitra.com/surya-siddhanta (page snapshot searched 19 October 2026; the page itself labels its computed date 2026-10-11).

The same page says Venus is 3.8 time-degrees from the Sun and assigns an east-rising event as coming in about two days. This is a **useful external classical-model control**, not a target value to tune to: its epoch/frame, apparent-noon instant, Ujjayinī location, no-bīja convention, and event-time approximation are not the same as our Pithoragarh/Gaṇeśa Mārtaṇḍ comparison.

### How to use this control

1. Preserve the signed daily-motion values exactly; do not replace Venus's −38.4′/day with its magnitude.
2. Once our source-derived inputs are date-anchored, compare our Sun/Venus/Jupiter motion separately against this table only after aligning instant, location/meridian, and the stated no-bīja convention as far as possible.
3. Do not call the apparent one-day event difference a formula error until the horizon-event branch, Chapter IX.4–5 time geometry, time convention, and frame are normalized.
4. Do not treat this page as a modern-ephemeris validation or as independent proof of our implementation; it is another implementation of the same textual tradition.

### Formula audit result

Burgess's Chapter II note gives the resulting instantaneous daily-motion structure as

`n_{true}=n_{manda}+(n_{śīghra}-n_{manda})(H-R)/H`

where `H` is the variable (fourth-process) hypotenuse and `R` is the radius. This agrees with the algebra in `chapter2SighraCorrectedDailyMotion`; the open question is not that final algebraic structure, but whether every supplied motion, sine, epicycle and hypotenuse is generated from the correct source sequence and a reconciled epoch/frame. Source: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf and https://www.swaveda.com/texts/surya-siddhanta/2/.

**Decision:** keep this external benchmark as a labelled comparison only. The next implementation step is to construct a date-anchored, intermediate-by-intermediate source ledger; no production dates or labels change on the basis of this reference alone.


## Clarifying Burgess's two readings of II.50 — 19 October 2026

Burgess's explanatory note does not treat the compound `trijyāntyakarṇa` as unambiguous. The ordinary translation uses **radius and the fourth/variable hypotenuse**; the note records an alternative traditional reading, **third and fourth hypotenuses**. The Sanskrit page at Swaveda prints the radius reading in its translation; the Burgess PDF discusses the alternative.

The research helper previously accepted a numeric `radius` only, which meant the alternative reading could be approximated by passing a different number but would be mislabeled as a radius. That interface is now corrected in `ss_chapter2_daily_motion_correction.js`:

- `referenceLengthKind: "trijya"` — the radius reading, with the reference length supplied explicitly.
- `referenceLengthKind: "third-hypotenuse"` — the alternative reading, with the third-process hypotenuse supplied explicitly.
- The result reports the selected reading and reference length. Unknown interpretations and non-positive reference lengths are rejected.
- Synthetic tests cover the alternative branch and confirm that the two interpretations are not silently conflated.

Sources: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf (Burgess's note on II.50) and https://www.swaveda.com/texts/surya-siddhanta/2/ (II.50–51 translation).

**Status guard:** this interface change is research-only. The new tests have been added to the existing Chapter II daily-motion test runner, but the CI run for the latest commit must be observed before marking this specific change CI-passed. Neither reading is selected as the final canonical convention here.


## CI verification after signed-wrap hardening — 19 October 2026

Commit `91c58d21cf723edd54a132c799ba3f5afca0ca63`; workflow run
[39201880155](https://github.com/OurHinduDharm/Panchang/actions/runs/39201880155)
completed with **success**.

Verified in the run:
- The finite-difference module's signed wrap tests, including reverse wrap and
  equivalent inputs outside the canonical 0°–360° range, are included in the
  research test path.
- The Chapter II.47–51 supplied-intermediate arithmetic tests and classical-frame
  tests passed.
- Headless Chromium loaded the research page; the four event-class branches and
  the separate angle/K diagnostic rendering passed.
- The final `git diff --exit-code origin/main...HEAD -- app.js extra-panchang.js`
  guard passed; production files remain unchanged.

The log still labels the IX.10–11 timing values as a numerical-wiring check.
For example, its Jupiter Asta sample estimates about -7.14 days against the
adjacent event bracket. This is a material review flag, not a validated event
prediction. Do not tune the algorithm to this output or publish it as a classical
result.

## Decision and next bounded implementation gate

The signed-angle defect is closed as a code-quality issue. The astronomical
source-model gate remains open. The next work item is to create a *date-anchored
intermediate ledger*, not to change thresholds or production display:

1. Resolve the Chapter I epoch/ahargana and time convention against a source
   example, including whether the reference is apparent noon or local-mean time.
2. Produce explicit same-frame mean longitude, mandocca/śīghrocca longitudes,
   their daily motions, manda/śīghra sine and hypotenuse inputs for one Venus
   sample and one Jupiter sample.
3. Run the II.47–51 helper on those sourced inputs and show every intermediate.
4. Compare its signed rate separately with adjacent-sample finite difference of
   the same source model and with the external modern ephemeris; keep the
   Vidhyamitra no-bīja/Ujjayinī reference as a separate classical-model control.
5. Only then pass the selected, documented bhukti candidate to the same IX.10–11
   conversion and inspect the event geometry.

**No date-specific classical bhukti is certified by this CI run.** The present
helper accepts already supplied intermediates and does not yet generate the
complete planetary state from a verified epoch. Production `app.js` and
`extra-panchang.js` remain unchanged; PR #22 stays Draft.

## External implementation located — comparison lead, not authority

On 19 October, an independently published Python repository was located:
https://github.com/kiranojhanp/surya-siddanta
Relevant files: `surya_siddhanta/celestial/mean_motions.py`,
`surya_siddhanta/celestial/planets.py`, and
`surya_siddhanta/core/constants.py`.

It contains a complete candidate chain for mean places and the four successive
manda/śīghra place corrections, plus planet epicycle constants. This gives us
a practical independent implementation to inspect rather than inventing every
missing step from scratch. However, it is **not** the Vidhyamitra JavaScript
implementation and is not accepted as authoritative: its own comments assume
all mean places begin at 0° at Kali epoch, and its claimed mapping of the
four place-correction steps to verses must be checked against the chosen
Sanskrit recension and the Burgess/Sudhakara readings. Its true-longitude
function is also not the Chapter II.47–51 daily-motion algorithm.

**Use decision:** do not copy it into production or treat its output as proof.
Audit the planet/epicycle constants and correction order against the text, then
use it only as a separately labelled cross-check for a Venus and Jupiter sample.
The missing gate remains a same-epoch, same-frame numerical ledger that exposes
each intermediate and separately compares (1) text-derived daily motion,
(2) a finite difference of the same classical model, and (3) a modern ephemeris.

## External Python model audit — concrete rejection criteria — 19 October 2026

A direct source inspection was completed for `mean_motions.py`, `planets.py`, and `constants.py` in https://github.com/kiranojhanp/surya-siddanta. The implementation is useful as a code-reading lead, but it is not yet a safe numerical control for our event ledger.

### Findings verified in source code

1. **Epoch/frame consistency is not established.** `mean_longitude()` advances mean longitude from an assumed zero-at-Kali-epoch baseline. In the same model, `APOGEE_MARS`, `APOGEE_MERCURY`, `APOGEE_JUPITER`, `APOGEE_VENUS`, and `APOGEE_SATURN` are documented as values “at 499 AD” and are then used as fixed constants in the date calculation. Unless a documented conversion or intended epoch interpretation is supplied, this combines a Kali-epoch mean-place baseline with a later fixed apsis table. We cannot assume this is source-consistent.
2. **The four-step verse mapping needs rechecking.** `true_longitude_planet()` labels its half-manda, half-śīghra, full-manda, and full-śīghra steps as II.46–49. Our source audit separately identifies II.46 as a solar apparent-time correction and II.47–51 as the true-daily-motion procedure. These may be distinct procedures, so the external code's inline verse labels must not be accepted without comparing the selected recension and commentary.
3. **Its daily-motion output is not the target algorithm.** The function returns a corrected longitude; it does not calculate the II.47–51 daily-motion ledger with sine-difference, motion-from-mandocca, signed śīghrocca-minus-manda motion, and the variable-hypotenuse factor.
4. **Some displayed claims are not evidence.** Broad accuracy claims in comments and synthetic unit tests do not validate epoch placement, the fixed apsis longitudes, verse attribution, or event times.

### Decision

Do not import or copy this model, and do not use its computed Venus/Jupiter event dates as a target. It remains useful for identifying the conventional epicycle constants and for comparing code structure once each constant is checked against a source table.

The next meaningful numerical step is not another threshold tweak. It is to locate and transcribe the relevant original table/epoch values, reconcile the “499 AD” apsis values with the chosen ahargana convention, then generate a single Venus and Jupiter intermediate ledger from one internally consistent source model. If those source anchors cannot be established, mark that specific input as unresolved rather than substituting modern or guessed values.

**Scope guard:** this is a research-note update only. No production file, UI label, threshold, or event prediction was changed.

## Follow-up: the external model's ahargana origin is incompatible with our current bridge — 19 October 2026

A direct read of the external `mean_motions.py` confirms that its `mean_longitude(body, ahargana)` expects **days elapsed since the Kali epoch** and computes longitude as daily motion × that elapsed count, modulo 360°. Its comments justify setting every mean longitude to 0° at the Kali epoch by citing I.57's statement about the end of the Kṛta age / initial point of Aries. That inference is not established by the code itself and must be checked against the verse's actual epoch reference; the creation-era statement must not silently be shifted to the Kali epoch.

Our current `ss_chapter1_ahargana_anchor.js`, in contrast, exposes a **creation-era ahargana near 714.4 billion** tied to its own epoch anchor. Feeding that number directly into the external function would be a category error: it expects elapsed Kali-epoch days, not our creation-era ahargana. A valid adapter would need an explicitly verified offset and time convention; merely subtracting a large number or choosing a convenient epoch would not establish the correct mean places.

For reproducibility, the external source's stated revolution counts and 1,577,917,828 savana days imply these mean daily rates (arithmetic only, not a verified ephemeris):

| Quantity | Revolutions per yuga | Mean rate |
|---|---:|---:|
| Sun | 4,320,000 | 0.9856026546°/day |
| Venus śīghra | 7,022,376 | 1.6021463952°/day |
| Jupiter manda | 364,220 | 0.0830963423°/day |
| Mars manda | 2,296,832 | 0.5240193788°/day |
| Saturn manda | 146,568 | 0.0334393078°/day |
| Mercury śīghra | 17,937,060 | 4.0923180443°/day |

These rates can be independently recomputed from the listed revolution counts. They do **not** validate the epoch phase, apsis longitudes, corrected daily motion, or an Asta/Udaya event.

### Next gate (narrowed)

Before building Venus/Jupiter event ledgers, settle one source-defined date/epoch example and the exact meaning of its ahargana. Then derive both the creation-era and Kali-epoch forms only if the primary text and source example establish their relationship. Until that is resolved, the existing Chapter II helper can be tested with supplied intermediates but must not be wired to a guessed planet-state generator.

**No production code or event output changed in this audit.**

## Source correction: I.56–57 does not establish a Kali-epoch zero baseline — 19 October 2026

A primary-text cross-check now narrows the epoch issue. The Sanskrit text and Burgess translation at
https://www.swaveda.com/texts/surya-siddhanta/1/ give:

- **I.56:** *madhyamānayanaṃ kāryaṃ grahāṇām iṣṭato yugāt* — mean places are to be computed from whichever yuga/epoch is chosen.
- **I.57:** *asmin kṛtayugasyānte sarve madhyagatā grahāḥ ... meṣādau* — at the end of the Kṛta age, the planets by mean motion (with nodes and apsides excepted) are in conjunction at the beginning of Aries.

Therefore, citing I.57 as proof that every mean longitude is zero at the **Kali epoch** is not textually justified: the verse names the end of Kṛta, not the start of Kali. The external implementation's Kali-zero baseline is a model convention that needs its own documented derivation or an explicit epoch transformation; it cannot be attributed to I.57 alone. Burgess's note also discusses the text's claimed epoch and the ambiguity of interpreting *yuga*, so this is not a license to silently choose a modern baseline.

### Corrected decision

1. Keep the external model out of event-time control until its epoch convention is documented.
2. Build an epoch bridge only from the chosen recension's actual ahargana rules and a declared target epoch; test it independently against a published worked example.
3. Do not simply subtract a guessed number of days from the creation-era ahargana, and do not use a date match to tune the offset.
4. The daily-motion helper remains a supplied-intermediate arithmetic adapter. This correction does not certify Venus/Jupiter positions or Asta/Udaya times.

This is a source-attribution correction, not a production change.

## Epoch bridge cross-check against the independent verse-by-verse ledger — 19 October 2026

A further cross-check against Vidhyamitra's verse-by-verse Sūrya-siddhānta ledger narrows, but does not close, the epoch question. Its Chapter I page reports the 2026-10-11 apparent-noon creation-era count as approximately **714,404,169,486.5** and the elapsed Kali-era count as **1,872,859**; its Chapter I.48–51 section explicitly computes the ahargana, and I.53–54 then derives mean places from that count. See https://vidhyamitra.com/surya-siddhanta/1 and the site's overview https://vidhyamitra.com/surya-siddhanta.

Our research anchor for 2026-10-08 apparent/mean-noon fixture is 714,404,169,483.5; advancing three days gives 714,404,169,486.5. Subtracting our declared Kali-epoch anchor 714,402,296,627 gives 1,872,859.5 elapsed days, whose whole-day count is 1,872,859. This agrees with the independent site's displayed whole-day Kali count and creation-era count at the stated date. This is a useful **arithmetic/epoch-count cross-check**, not proof that our anchor independently reconstructs every I.45–51 step, and not proof that a planetary mean longitude may be initialized to zero at Kali epoch.

### Important distinction retained

The primary text's I.56 permits the mean-place procedure to be reckoned from a chosen epoch; I.57 states the conjunction at the end of Kṛta, not explicitly at Kali epoch. The independent ledger confirms that the site's ahargana chain is internally useful as a date/count cross-check, but its displayed count alone does not expose enough intermediate values to certify the longitude phase convention for every graha. Before adopting the external Python model, compare its per-planet mean-place output and apsis epoch against the independent implementation at the same declared instant and inspect the model's source formula. Do not equate “elapsed days since Kali” with “all mean longitudes start at zero at Kali” without that separate derivation.

### Next numerical test

Use one fixed instant and meridian, first compare (a) creation-era ahargana, (b) elapsed days since the declared Kali epoch, and (c) each planet's Chapter I.53–54 mean longitude as given by the independent implementation. Record the exact epoch offset and revolution count used for each quantity. Only after that comparison passes should the same mean-place ledger feed Chapter II correction and Chapter IX event timing.

**No production files or event outputs were changed.**
