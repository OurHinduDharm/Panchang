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
