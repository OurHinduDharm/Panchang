# Free and open-source astronomy stack for Guru, Shukra and Agastya

Updated: 2026-11-13

## Product scope

The public feature needs only date and local time for:

1. Guru (Jupiter): Asta start and Udaya/reappearance.
2. Shukra (Venus): Asta start and Udaya/reappearance.
3. Agastya (Canopus): traditional Udaya/Arghya date and time.

No paid API, commercial astronomy licence, full astrology chart package, or runtime server dependency is required. The main Panchang calculation path must remain untouched.

## Approved free resources

### Primary calculation engine: Astronomy Engine 2.1.19

- Upstream: https://github.com/cosinekitty/astronomy
- npm: https://www.npmjs.com/package/astronomy-engine
- Licence: MIT.
- Supports JavaScript/Node.js and browser execution; no external runtime dependencies.
- Calculates geocentric positions and apparent topocentric horizon coordinates for a supplied observer.
- Provides planet rise/set, altitude crossings, twilight, apparent visual magnitude, ecliptic longitude separation, and coordinate transforms.
- Upstream documentation describes its truncated VSOP87 / NOVAS-based model as approximately ±1 arcminute and supports dates thousands of years before/after the present.
- Preserve the upstream MIT copyright and licence notice when redistributing code.

This package is already used in the repository's research/test workflows. Pin the version used for each reproducible run; do not silently upgrade.

### Independent calculation check: Skyfield

- Upstream: https://github.com/skyfielders/python-skyfield
- Licence: MIT.
- Use only in offline/CI validation, not the public page or main Panchang runtime.
- Can evaluate observer-relative positions using JPL planetary ephemeris files.
- Keep Skyfield and its dependencies isolated from the production browser bundle.

### Independent reference: NASA/JPL Horizons and DE440/DE441

- Horizons manual: https://ssd.jpl.nasa.gov/horizons/manual.html
- API guide: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- DE440/DE441 technical reference: https://ssd.jpl.nasa.gov/doc/de440_de441.html
- Use Horizons as an independent comparison service, not as a required live dependency.
- DE440 covers 1550–2650; DE441 is the long-span solution. Check JPL/NAIF data redistribution and attribution terms before bundling any kernel into this repository. The public API itself does not require a paid licence.

### Explicit exclusions

- Swiss Ephemeris: do not introduce it. Its AGPL/commercial dual licensing is unnecessary for this narrowly scoped product.
- AGPL-only ephemeris wrappers: do not introduce them.
- Paid ephemeris APIs: not needed.
- Scraping a third-party Panchang page at public page-load time: not needed and not permitted as a runtime dependency.

## Source-boundary geometry experiment

Workflow: https://github.com/OurHinduDharm/Panchang/actions/runs/43378531062

Script: `scripts/inspect-tara-boundary-geometry.mjs`

The script used Astronomy Engine 2.1.19 to inspect both boundaries of all directly captured Pithoragarh Guru/Shukra source windows in `data/drik-planetary-reference-2024-2027.json`.

- 16 source windows: 7 Guru and 9 Shukra.
- 32 source boundaries inspected.
- Representative observer: 29.5828° N, 80.2182° E, 1650 m.
- The source confirms the Pithoragarh city name but does not disclose its exact coordinates/elevation; the observer is therefore a representative coordinate, not an exact recreation of the provider's observer.
- At each source boundary the calculated planet altitude is close to 0°, which is consistent with the published timestamp being a local horizon-crossing event.
- The Sun's depression at those same instants differs by planet and by boundary class.

| Planet | Boundary | Samples | Planet altitude median (range) | Sun depression median (range) |
|---|---|---:|---:|---:|
| Guru | Asta start | 7 | -0.0405° (-0.0845° to +0.0599°) | 7.5031° (7.2743° to 7.7595°) |
| Guru | Asta end/Udaya | 7 | +0.0175° (-0.0630° to +0.0296°) | 9.4031° (9.0396° to 9.6348°) |
| Shukra | Asta start | 9 | +0.0135° (-0.0467° to +0.0874°) | 5.6895° (4.9018° to 5.9169°) |
| Shukra | Asta end/Udaya | 9 | -0.0522° (-0.0872° to +0.0541°) | 5.9239° (5.6538° to 6.7900°) |

### What this does and does not establish

This is a useful physical clue: the source boundaries are local planet horizon crossings near twilight. The Astronomy Engine's nearest local rise/set event differs from the 32 source timestamps by less than one minute in every case:

| Planet / boundary | Samples | Median engine-minus-source | Maximum absolute difference |
|---|---:|---:|---:|
| Guru Asta start (setting) | 7 | -0.694 min | 0.967 min |
| Guru Udaya (rising) | 7 | +0.349 min | 0.784 min |
| Shukra Asta start | 9 | -0.060 min | 0.742 min |
| Shukra Udaya | 9 | -0.135 min | 0.937 min |

This confirms that the **clock time** is the local planet horizon crossing. The remaining problem is selecting the correct civil date on which that crossing is the Asta/Udaya boundary.

## Held-out local twilight model test

Workflow: the same `free-engine-tara-boundary-geometry` workflow, with artifact `tara-boundary-geometry-and-holdout-backtest`.

- Training: source boundary events dated 2021–2025 only.
- Holdout: all available 2026–2027 Pithoragarh Guru/Shukra boundaries (9 total).
- The model scans the planet's daily local rise/set events, then selects the date where the source-trained twilight/arcus proxy changes visibility state.
- Candidate model choice is based on leave-one-out error within the training records. Constant median thresholds are retained where the azimuth correction does not improve training error. An azimuth correction is selected only for Shukra Asta-end while setting (training MAE 0.051° versus 0.190° for the constant median).
- Holdout result: **9 of 9 boundaries matched**, with the calculated horizon-crossing clock times differing from the published times by less than one minute.

This is strong evidence that a free, local calculation model can reproduce the 2026–2027 city-page event boundaries. It is not yet a universal visibility law: the training set is small, source coordinates are undisclosed, and the empirical arcus proxy should not be transferred blindly to other cities.

## Internal future candidates

The same model generated paired Pithoragarh candidates around each planetary conjunction for 2028–2035. These are research artifacts only; they have not been inserted into public annual JSON.

For 2028–2030, manual comparison against Panchang Guru's separately computed **New Delhi** pages found:
- Guru: same dates or one-day difference; clock times generally differed by about 10–20 minutes.
- Shukra: same dates or one-day difference for the compared windows; clock times generally differed by about 10–20 minutes.
- This is a cross-location sanity check, not exact Pithoragarh validation. Panchang Guru explicitly labels its values as New Delhi and states its moments are the planet's own rise/set. Do not copy its times into our Pithoragarh data.

Reference pages: https://www.panchangguru.com/guru-asta and https://www.panchangguru.com/shukra-asta

Do not publish 2031–2035 candidates yet. They need more independent checks and a wider held-out sample. The 2028–2030 candidates can move to a separate data-review PR after the current diagnostic and regression checks complete.

## Next engineering step

1. Build a local horizon/twilight event candidate generator using only Astronomy Engine.
2. Derive candidate thresholds on a training subset and validate against held-out Pithoragarh years; report errors separately for Guru/Shukra and Asta-start/Udaya.
3. Cross-check selected topocentric/geocentric positions with Skyfield + JPL DE440 and, where useful, Horizons.
4. Reject the model if held-out errors are not stable or if source definitions disagree.
5. Keep annual public JSON as the only runtime input. No astronomy package is added to the main Panchang page.
6. Agastya traditional Arghya remains a separate source-backed series; do not replace it with a generic star visibility estimate.

No public calculation, annual production record, or display code was changed by this research.
