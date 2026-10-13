# PR #27 — Godhuli / Sandhya Work Log

Repository: `OurHinduDharm/Panchang`
PR: https://github.com/OurHinduDharm/Panchang/pull/27
Branch: `fix/sandhya-muhurta-windows`
Last reviewed head: `d0e124019fec00da0d2d569023387a83df613d89`
Status: **Draft — do not merge until validation is complete**

## Goal and safety boundaries

- Calculate the seasonal Godhuli start from the local Sun's geometric-center altitude crossing.
- Preserve the project's declared 48-minute Godhuli window convention, while clearly stating that Muhurta Chintamani 6.101 describes seasonal solar-disc state and does not itself prescribe 48 minutes.
- Preserve the old ±12-minute window as a safe fallback if the event cannot be calculated.
- Do not change existing Pratah, Madhyahna, or Sayam Sandhya timing rules in this PR.
- Do not change Sankalp, sunrise/sunset, or unrelated Panchang calculations.
- Do not merge until tests and real selected-location/date preview have been checked.

## Current implementation

Changed files at last reviewed head:
- `app.js`: imports `astronomy-engine@2.1.19` at module top level and calls `SearchAltitude` from `getGodhuliMuhurta`.
- `tests/compact-ui-night-prahar.test.js`: seasonal threshold, fallback, interval, and real Astronomy Engine crossing checks.

Seasonal target altitudes:
- Hemanta/Shishira: +16 arcminutes.
- Vasanta/Grishma/Sharad: 0 degrees.
- Varsha: −16 arcminutes.

Season is taken from `p.ritu` when recognized, otherwise inferred from the existing Sun-rashi-to-season mapping.

## Review findings and open checks

1. **Shared-script loading cost:** the Astronomy Engine import is top-level in `app.js`. Determine whether the shared script is loaded on pages that do not need Godhuli and assess whether this adds avoidable network/parse work. Do not introduce an unreliable asynchronous race or change the Panchang UI merely to optimize this.
2. **Live result validation:** verify the displayed Godhuli start/end for the selected location and date, including a date from each of the six seasons. Compare against a trustworthy reference where available and document differences rather than treating one source as universal.
3. **Time-zone behavior:** the event returned by Astronomy Engine is an absolute Date; confirm display formatting follows the project's existing local-time policy. A broader fixed-IST audit is out of scope unless a direct regression is found.
4. **CI:** rerun/inspect checks for the current PR HEAD after each code change. A previous review reported syntax, card-order, compact UI/night-Prahar, and interval/reference tests passing, but that does not replace checking the current HEAD.
5. **Reference limits:** the available TKS sample supports a 48-minute interval for that sample only. Independent TKS comparison across multiple seasons remains unverified.

## Next action

Inspect the actual shared-script loading path and current CI status first. Then choose the smallest safe change, if one is needed, and validate the live Godhuli output. Keep this PR Draft until both checks are complete.

## Change log

- 2026-10-13: Created this work log to carry forward the scope, safety boundaries, review findings, and next steps across chats.
- 2026-10-13: Investigated the Varsha (−16′) sunset-boundary concern. After checking the Astronomy Engine documentation, the original non-negative-before-sunset check was retained: `SearchRiseSet` defines sunset by the Sun's top limb disappearing and includes typical atmospheric refraction, while `SearchAltitude` uses the geometric center without refraction. Therefore a geometric-center crossing at −16′ should precede apparent sunset under this convention. The regression test now models that expected ordering instead of accepting a post-sunset event. The earlier temporary guard change was corrected before final validation. CI for head `801f05c5b12090436550026f040e9e421d2e4bea` completed successfully: syntax checks, Panchang card-order tests, compact UI/night Prahar tests, and interval/real-Panchang comparison tests all passed. Live preview remains open. The Astronomy Engine import is a static top-level import in `app.js`, so the module graph waits for it before executing the app; repository `index.html` loads `app.js` as a module. The actual Blogger template placement still needs checking to determine whether this affects only the full Panchang page or more pages.
