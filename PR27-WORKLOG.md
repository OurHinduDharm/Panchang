# PR #27 — Godhuli / Sandhya Work Log

Repository: `OurHinduDharm/Panchang`
PR: https://github.com/OurHinduDharm/Panchang/pull/27
Branch: `fix/sandhya-muhurta-windows`
Last reviewed head: `3cb4e6521fa218c407d692c96c13153d9bbbc1be`
Status: **Draft — do not merge until validation is complete**

## Goal and safety boundaries

- Calculate the seasonal Godhuli start from the local Sun's geometric-center altitude crossing.
- Preserve the project's declared 48-minute Godhuli window convention, while clearly stating that Muhurta Chintamani 6.101 describes seasonal solar-disc state and does not itself prescribe 48 minutes.
- Preserve the old ±12-minute window as a safe fallback if the event cannot be calculated.
- Do not change existing Pratah, Madhyahna, or Sayam Sandhya timing rules in this PR.
- Do not change Sankalp, sunrise/sunset, or unrelated Panchang calculations.
- Do not merge until tests and real selected-location/date preview have been checked.

## Current implementation

Changed files at current PR head:
- `app.js`: imports `astronomy-engine@2.1.19` at module top level and calls `SearchAltitude` from `getGodhuliMuhurta`.
- `tests/compact-ui-night-prahar.test.js`: seasonal threshold, fallback, interval, and real Astronomy Engine crossing checks.
- `PR27-WORKLOG.md`: this validation log.

Seasonal target altitudes:
- Hemanta/Shishira: +16 arcminutes.
- Vasanta/Grishma/Sharad: 0 degrees.
- Varsha: −16 arcminutes.

Season is taken from `p.ritu` when recognized, otherwise inferred from the existing Sun-rashi-to-season mapping.

## Review findings and open checks

1. **Shared-script loading cost:** the user supplied the Blogger script tags for `app.js` and `extra-panchang.js`, both loaded as separate `type="module"` scripts from jsDelivr. Because `app.js` imports Astronomy Engine statically, that dependency must load before `app.js` executes. The snippet alone does not establish whether these tags appear only on the Panchang page or in a site-wide Blogger template. If confined to the Panchang page, this is not a site-wide load penalty. Do not introduce an unreliable asynchronous race or change the Panchang UI merely to optimize this.
2. **Live result validation:** verify the displayed Godhuli start/end for the selected location and date, including a date from each of the six seasons. Compare against a trustworthy reference where available and document differences rather than treating one source as universal.
3. **Time-zone behavior:** the event returned by Astronomy Engine is an absolute Date; confirm display formatting follows the project's existing local-time policy. A broader fixed-IST audit is out of scope unless a direct regression is found.
4. **CI:** current HEAD `34d3764de0420f1bc66360ef416e81150568e6ff` has a successful `Classical yoga interval tests` run (run #137), including syntax checks, card-order regression tests, compact UI/night Prahar tests, and interval/real Astronomy Engine comparisons across six seasonal dates. CodeQL PR run #654 also completed successfully.
5. **Reference limits:** the available TKS sample supports a 48-minute interval for that sample only. Independent TKS comparison across multiple seasons remains unverified.

## Next action

Current CI is green. The user supplied the Blogger script tags for `app.js` and `extra-panchang.js`; they confirm both are module scripts, but not whether the tags are page-only or site-wide. Automated live-page fetch was blocked by Google's anti-bot redirect, so the actual placement and visible Godhuli output are not yet verified. Next: establish whether this snippet is only on the Panchang page and inspect the rendered start/end there; keep this PR Draft.

## Change log

- 2026-10-13: Created this work log to carry forward the scope, safety boundaries, review findings, and next steps across chats.
- 2026-10-13: Investigated the Varsha (−16′) sunset-boundary concern. After checking the Astronomy Engine documentation, the original non-negative-before-sunset check was retained: `SearchRiseSet` defines sunset by the Sun's top limb disappearing and includes typical atmospheric refraction, while `SearchAltitude` uses the geometric center without refraction. Therefore a geometric-center crossing at −16′ should precede apparent sunset under this convention. The regression test now models that expected ordering instead of accepting a post-sunset event. The earlier temporary guard change was corrected before final validation. CI for head `801f05c5b12090436550026f040e9e421d2e4bea` completed successfully: syntax checks, Panchang card-order tests, compact UI/night Prahar tests, and interval/real-Panchang comparison tests all passed. Live preview remains open. The Astronomy Engine import is a static top-level import in `app.js`, so the module graph waits for it before executing the app; repository `index.html` loads `app.js` as a module. The actual Blogger template placement still needs checking to determine whether this affects only the full Panchang page or more pages.

- 2026-10-13: Checked the current PR head `34d3764de0420f1bc66360ef416e81150568e6ff`. The full interval regression workflow completed successfully (run #137); its seasonal test exercises real Astronomy Engine crossings for Vasanta, Grishma, Hemanta, Shishira, Varsha, and Sharad at multiple dates/locations, as well as the fixed 48-minute interval and fallback behavior. CodeQL PR run #654 also succeeded. Attempted to fetch the live Blogger Panchang page for template/load-path verification, but the request was redirected to Google's anti-bot page; this is not evidence that the live page itself is broken. No code change is justified until the actual Blogger inclusion and visible results can be inspected.

- 2026-10-13: User provided the Blogger script inclusion: `app.js` and `extra-panchang.js` are separate `type="module"` scripts served from jsDelivr. This narrows the load-path question but does not prove whether the tags are page-only or site-wide. The latest work-log-only commit `3cb4e6521fa218c407d692c96c13153d9bbbc1be` passed CI run #138: https://github.com/OurHinduDharm/Panchang/actions/runs/38366940732. No calculation code changed.

- 2026-10-13: User supplied the actual Blogger Panchang page HTML. It loads `app.js` and `extra-panchang.js` only in the page's `EXISTING PANCHANG SCRIPTS` section, both via jsDelivr `<script type="module">`. In the supplied snippet, these scripts are not shown in the Blogger-wide template or site-wide mini-widget. Therefore the new top-level Astronomy Engine import is confirmed to affect this Panchang page's module graph, but there is no evidence from this snippet that it adds load cost to other pages. Do not change to dynamic import solely for this concern; that would require making the Godhuli calculation/render path async and risks UI regressions. The actual live rendered Godhuli start/end still needs a browser screenshot or console output from the user to validate display values.
