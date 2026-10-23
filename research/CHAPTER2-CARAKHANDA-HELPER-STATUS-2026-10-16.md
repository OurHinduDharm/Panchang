# Chapter II carakhaṇḍa equation helper — implementation status
Date: 2026-10-16
Branch: research/ss-ch9-diagnostic
Status: isolated research helper committed; no production integration.

## Added helper
File: `ss_chapter2_carakhanda_equation_diagnostic.js`
Commit: `95f0c20cf433ba69141d95d54a810299114986d6`

The helper exposes separate functions for sine-table-scale sine, versed sine, day-radius, gnomon-12 equinoctial shadow, earth-sine, cara-sine, inverse-arc conversion and the combined diagnostic. It returns intermediate values and labels the method explicitly as a continuous-trigonometric diagnostic, not a literal integer-table result.

## Formula / unit correction recorded during implementation
The intermediate sine is represented in traditional sine-table units with radius R=3438. Therefore the inverse-sine step must use `sineCara / R`; passing the raw table-unit number directly to `asin` is dimensionally wrong. This normalization was corrected in commit `95f0c20`.

Under the continuous geometry, the equations reduce algebraically to:

`sin(cara) = tan(observer latitude) × tan(declination)`

and `cara prāṇa = asin(sin(cara)) × 180/π × 60` with the signed angle retained. This is a useful independent invariant, not proof of the historical table's exact interpolation or rounding.

## Validation status
The helper includes tests for radius, zero declination/latitude cases, north-south sign symmetry and the tangent identity. These tests have been authored but have **not yet been executed in the project's browser/Node test environment in this session**; do not describe them as passing.

## Still blocking a source-faithful result
1. Transcribe the printed sine table and its interpolation / rounding rules exactly.
2. Recover the complete inputs and intermediate steps for Burgess's Washington example (reported carakhanda 578, 1061, 1263 prāṇas) and reproduce it.
3. Compare Pithoragarh 29.5828° N results against the continuous diagnostic, preserving signed declination and exposing all intermediates.
4. Only after those gates, construct the Chapter III 12-sign rising-asu table and use it in the Chapter IX event solver.

## Safety boundary
Research branch only. `app.js` and `extra-panchang.js` remain untouched. No Venus/Jupiter Asta/Udaya date is certified by this helper.
