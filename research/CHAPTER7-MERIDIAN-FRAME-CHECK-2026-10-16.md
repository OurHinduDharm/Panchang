# Chapter VII meridian-frame consistency check — 2026-10-16

**Status:** research-only finding; no formula or production code changed.  
**Branch:** `research/ss-ch9-diagnostic`

## Finding

The current research branch contains two different modern-to-classical local-meridian conversions:

1. `ss_chapter7_drikkarma.js` calls `convertLocalSiderealAngleObliquityFrame()`. Its formula is
   `atan2(sin(theta), cos(theta) * cos(epsilon_source - epsilon_target))`.
   It changes the equatorial frame for obliquity only. The ayanamsha/ecliptic-origin rotation is not an input to this function.
2. `ss_classical_frame.js` contains `modernLocalSiderealAngleToClassicalFrame()`. It transforms the meridian plane through the full vector transform: source equator → source ecliptic → rotate ecliptic origin by `-ayanamshaDeg` → target equator. It therefore includes both the obliquity change and the ecliptic-origin rotation.

These are not numerically interchangeable. Using the branch's explicit diagnostic angles (source obliquity 23.4367°, target obliquity 24°, ayanamsha 24.217°), the local meridian at 45° maps to:

| Candidate | Target angle |
|---|---:|
| Obliquity-only conversion currently used by Chapter VII helper | 45.001385° |
| Full transformed-meridian-plane candidate | 22.379092° |
| Difference, full minus obliquity-only (wrapped) | −22.622293° |

Across sample angles 0°, 45°, 90°, 123.4°, 180°, 270°, and 359.9°, the two candidates differ by about 21.9°–22.6°. This is a structural convention difference, not floating-point noise.

## What this does and does not prove

- It proves the two research implementations embody different frame assumptions and cannot both be treated as the same calculation.
- It does **not** prove the full-transform candidate is the historically correct Sūrya-siddhānta convention. That requires a source-based derivation of how the local meridian/time angle is represented when the ecliptic origin and obliquity are changed.
- The existing round-trip, orthogonality, and plane-intersection tests establish mathematical consistency of the vector rotations; they do not establish historical correctness.
- The 24.217° ayanamsha is an explicit working input, not a certified Chapter II/III parameter. It must not be silently treated as equivalent to TKS's separately reported Sūryasiddhānta ayanamsha.

## Consequence for the 12 October Venus sample

Do not use the current Akṣa correction or its resulting Chapter IX K/event bracket as final while this frame choice remains unresolved. A difference of ~22° in the local meridian can materially change the planetary hour angle and the Akṣa term. The raw API sample's lack of a local sidereal angle is not itself fatal: the research page derives a modern local sidereal angle from Greenwich apparent sidereal time plus east longitude. The unresolved issue is how that modern angle should be transformed—or whether it should be transformed at all—into the classical calculation frame.

## Next research steps

1. Trace the exact Chapter VII/III Sanskrit and Ranganātha/Burgess commentary wording for the reference equator, equinox, ayana, and planetary time-from-meridian.
2. Write down both frame hypotheses as coordinate definitions before calculating any event: (A) preserve the modern physical meridian and transform its plane into the target equator; (B) change obliquity while retaining the equinox axis. Explain from the source which is prescribed, or keep the result unresolved if the text does not decide it.
3. Add a direct test comparing both candidate transformations for the same raw Venus state and local event instant. Record RA, declination, hour angle, half-day angle, Akṣa correction, corrected longitude, and Chapter IX K under each hypothesis.
4. Independently validate the chosen construction against a primary-source numerical worked example, if available. Do not select a candidate merely because it better matches TKS, Drik Panchang, or a desired date.
5. Only after the convention is source-adjudicated, recompute the 12 October 2026 sunset-side Venus case and a separate sunrise-side sample around 29–30 October. Keep all outputs research-only.

## Production isolation

No changes were made to `app.js` or `extra-panchang.js`. This note does not authorize merging PR #22 or draft PR #35.


## Actual Venus sunset-side browser run — 12 Oct 2026, 17:42 IST

The research browser test now explicitly runs `runChapter7FrameSensitivityDiagnostic()` at the event-specific instant and prints its intermediate values. CI run for commit `9a4380705040225c89cea519812a93789382fee` passed; see the [workflow run](https://github.com/OurHinduDharm/Panchang/actions/runs/38801076514).

For Venus, the diagnostic reports:

| Quantity | Scalar baseline | Vector: obliquity + transformed LST | Vector: obliquity only, LST fixed | Vector: obliquity + equinox rotation |
|---|---:|---:|---:|---:|
| Calculation-frame LST | 284.305290° | 284.305290° | 284.305949° | 262.173773° |
| Planet RA | 211.645790° | 211.645790° | 211.645790° | 188.463647° |
| Planet declination | −21.221581° | −21.221581° | −21.221581° | −12.023447° |
| Hour angle | 72.659500° | 72.659500° | 72.660159° | 73.710126° |
| Half-day angle | 77.265394° | 77.265394° | 77.265394° | 83.055527° |
| Āyana correction | −2.397790° | −2.397790° | −2.397790° | −2.950993° |
| Akṣa correction | −4.041617° | −4.041617° | −4.041653° | −3.814225° |
| Total correction | −6.439407° | −6.439407° | −6.439443° | −6.765218° |
| Corrected longitude | 186.160246° | 186.160246° | 186.160209° | 185.834434° |

The equinox-rotated meridian angle is **−22.131516°** from the obliquity-only angle. However, in this particular diagnostic the corrected Venus longitude differs by about **−0.325812°**, not 22°. The large angle delta is principally the change in frame angle; it must not be misreported as a 22° error in the final corrected longitude or K.

The scalar baseline and the full-vector **obliquity-only** path agree to the displayed precision. Holding the numerical LST fixed changes the frame angle by only **0.000660°** and the total Venus correction by about **−0.000036°**. This shows that the earlier ~22° discrepancy is tied to the additional ecliptic-origin/equinox rotation assumption, not to the small obliquity-only conversion. It still does not decide which convention the classical text prescribes.

## Consequence / next step

Do not choose the equinox-rotated candidate solely because it is a geometrically coherent 3-D transform. Trace the text's definition of the reference ecliptic/equinox and the meridian/time angle used in Akṣa-dṛkkarma. Compare the actual Sanskrit, Burgess translation, and Ranganātha commentary; if these sources do not specify the required reference frame, document the ambiguity instead of inventing a historical rule. Keep the current event-date and K outputs research-only until that adjudication is complete.

## IX.10–11 estimate discrepancy — trace from the latest passing browser run

The latest diagnostic workflow for commit `2cf143de4ec751ef7b7ecb6f05a5b4c6a5f5a4ea` completed successfully: [run 38801259335](https://github.com/OurHinduDharm/Panchang/actions/runs/38801259335). This confirms that the checks ran; it does **not** make the event model a validated production method.

The rendered audit exposes a useful distinction between a one-step estimate and a short-horizon check:

| Fixture | One-step IX.10–11 estimate | Error vs daily K-bracket interpolation | Short-horizon estimate error |
|---|---:|---:|---:|
| Venus Asta | −0.118150 day | 0.003827 day (~5.5 min) | 0.003827 day |
| Venus Udaya | −3.333501 days | 0.294861 day (~7.08 h) | 0.003093 day (~4.5 min) |
| Jupiter Asta | −7.140224 days | 0.038012 day (~54.7 min) | 0.000834 day (~1.2 min) |
| Jupiter Udaya | −0.194860 day | 0.001436 day (~2.1 min) | 0.001436 day |

The Venus Udaya row is the warning case. The reference sample is around 1 November 2026; its one-step estimate projects backward by 3.3335 days, while the independently bracketed K crossing is around 29 October 2026, 06:20 IST. A fresh estimate made close to the crossing is within about 4.5 minutes. Therefore the current evidence points to **linear extrapolation over a multi-day interval**, not an arithmetic sign failure, as the immediate issue. It does not yet prove the exact source of the whole discrepancy.

Implementation trace: `getChapter9TimeEstimate()` takes the event-frame K and signed lagnāntara, estimates each body's signed longitude motion across a 24-hour interval, converts those motions through sign-specific rising-asus, and calls `estimateChapter9TimeCorrectionFromArcMotions()`. The UI then compares that one-step estimate with a daily K-crossing bracket and separately calculates a short-horizon estimate. The isolated helper tests prove the arithmetic and signs only; they do not prove that a single long-range extrapolation lands on the event.

### Decision

- Do **not** accept the single long-range estimate as the final event time.
- Treat IX.10–11 as a correction to be reapplied after recalculating the Sun, planet, dṛkkarma, lagnāntara and sign-specific rising-asus at the new candidate instant. Iterate until the time correction is small, and compare the converged result with an independent bracket.
- Keep the bracket as a validation method, not as a substitute for the classical calculation.
- Keep the current frame choice unresolved until its coordinate convention is source-adjudicated. The IX.10–11 iteration must not hide or silently compensate for that independent frame issue.

No production files were changed by this investigation.

## Source check: what the verses do establish — and what they do not

I checked the Sanskrit sequence against the verse-by-verse text and the Burgess translation.

- **IX.4–5:** the prescribed input is the planet's dṛkkarma-corrected place at the relevant Sun event: sunset for a western event and sunrise for an eastern event. The lagna-interval is then converted into time using the appropriate rising-time measure. This supports evaluating each candidate against the matching local sunrise/sunset, not substituting a modern angular-separation threshold for the Chapter IX construction. See [Chapter IX, verses 4–5](https://vidhyamitra.com/surya-siddhanta/9).
- **IX.6–9:** the text's thresholds are direction-dependent. Venus uses 8° for western setting/eastern rising and 10° for eastern setting/western rising; the other planetary limits are also explicitly listed. The classifier must select the branch before choosing the threshold. See [IX.6–9](https://acharane.com/sources/surya-siddhanta-9-6-8/).
- **IX.10–11:** the text gives a days-to/from-event estimate from the time-angle difference and daily motions, with the motions converted using the relevant rising-asus. The one-step result is an estimate, not an independent proof that the target date has been reached. See [IX.10–11](https://vidhyamitra.com/surya-siddhanta/9).
- **VII.7–11:** the verses specify meridian-distance/nata, the planet's own nata and half-day for Akṣa-dṛkkarma, and the declination derived from the graha increased by three signs for Ayana-dṛkkarma. The verse text does **not** directly prescribe a modern apparent sidereal-time API, nor does it explicitly say to apply a modern-to-classical vector rotation to local sidereal time. See [VII.7–11](https://vidhyamitra.com/surya-siddhanta/7) and the source text with notes in [Karma Sakha's Sūrya Siddhānta edition](https://karmasakha.com/texts/surya-siddhanta).

### Consequence for frame adjudication

This source pass narrows the question but does not settle it. The classical procedure defines the meridian distance through the text's lagna/nata construction; it does not give an explicit modern coordinate-frame conversion. Therefore neither the obliquity-only angle formula nor the full vector-transformed meridian can be declared historically correct merely because it is mathematically consistent.

The next defensible test is to derive the Chapter III lagna/nata independently in the classical frame and compare it with both modern-frame candidates at the same local event. If the textual inputs do not uniquely determine a conversion, the report must retain the ambiguity rather than select the candidate that happens to agree better with a reference Panchang.

### Event-estimate guardrail

The long-range IX.10–11 discrepancy must be addressed without changing what IX.4 prescribes. The candidate iteration has to re-evaluate the relevant sunrise/sunset event geometry and sign-specific rising-asus at each candidate **date**, while separately recording the daily bracket and its interpolation. A naïve loop that repeatedly evaluates the same day's sunrise/sunset after moving only a fraction of a day would simply reuse the same K and is not a valid iteration. No production change is justified until the candidate-date update and convergence criteria are explicitly defined and tested.

