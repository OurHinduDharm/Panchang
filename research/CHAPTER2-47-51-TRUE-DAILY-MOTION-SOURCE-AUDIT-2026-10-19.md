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
