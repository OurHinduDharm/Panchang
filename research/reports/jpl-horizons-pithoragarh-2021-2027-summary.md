# JPL Horizons Cross-Check: Pithoragarh Planetary Asta/Udaya (2021–2027)

**Status:** Research-only independent geometry validation  
**Generated:** 2026-11-10  
**Reference:** Direct, browser-verified Drik Panchang Pithoragarh annual Asta pages  
**Observer supplied to Horizons:** 29.5828° N, 80.2182° E, 1.65 km  
**Ephemeris:** JPL Horizons DE441 observer ephemeris

## Result

The 2021–2027 accepted Pithoragarh ledger contains 75 windows and 150 Asta/Udaya boundaries across five planets. At each published boundary, JPL Horizons apparent topocentric planet elevation was sampled at -10, 0 and +10 minutes. A linear interpolation between the two outer samples estimated when the planet crossed -0.5° apparent elevation.

| Planet | Boundaries | Mean planet elevation at Drik time | Mean absolute time offset from -0.5° crossing | Maximum offset | Solar altitude range |
|---|---:|---:|---:|---:|---:|
| Mercury | 92 | -0.566° | 0.345 min | 0.821 min | -14.37° to -9.79° |
| Venus | 20 | -0.575° | 0.395 min | 0.821 min | -7.39° to -5.52° |
| Mars | 10 | -0.522° | 0.202 min | 0.653 min | -14.91° to -13.47° |
| Jupiter | 14 | -0.594° | 0.443 min | 0.829 min | -10.21° to -7.87° |
| Saturn | 14 | -0.566° | 0.368 min | 0.861 min | -13.79° to -10.34° |
| **Total** | **150** | **-0.5672° overall** | **0.353 min overall** | **0.861 min overall** | **-14.912° to -5.516°** |

- All **150/150** published boundary instants were within one minute of the interpolated -0.5° local apparent-elevation crossing.
- All **150/150** planet elevations at the published instants were within 0.2° of -0.5°.
- Mean absolute elevation difference from -0.5° was 0.0723°.
- The Sun's altitude varied substantially by planet and event; these results do **not** support assuming one universal solar-depression threshold.

## Year-wise check

| Drik source-page year | Boundaries | Mean absolute time offset | Maximum offset |
|---|---:|---:|---:|
| 2021 | 22 | 0.354 min | 0.821 min |
| 2022 | 20 | 0.428 min | 0.792 min |
| 2023 | 22 | 0.363 min | 0.861 min |
| 2024 | 20 | 0.314 min | 0.748 min |
| 2025 | 22 | 0.309 min | 0.740 min |
| 2026 | 24 | 0.410 min | 0.829 min |
| 2027 | 20 | 0.286 min | 0.737 min |

## Interpretation

This is strong evidence that the published Drik boundary times are closely associated with a **local topocentric planetary horizon-crossing condition near -0.5° apparent elevation**. The result is consistent across the five planets and seven source years.

It does **not** prove Drik's complete internal algorithm, its exact observer coordinates, or that -0.5° alone is a sufficient visibility rule. The solar altitude and planetary brightness at the same boundaries vary. A complete production model still needs to determine how the appropriate morning/evening event is selected and how event direction, visibility, conjunction geometry and date rollover interact.

## Important coordinate caveat

JPL Horizons requires Earth observer altitude to be specified above the WGS-84/ITRF93 reference ellipsoid, not mean sea level. The project location's supplied 1650 m elevation has not yet been independently confirmed as ellipsoidal. The run therefore used 1.65 km as supplied and records this as an observer-height caveat. Drik's provider coordinates/elevation are also not published; the comparison is by city label, not verified identical observer points.

Before treating the geometry as final location-level validation:
1. Confirm whether the project's 1650 m is orthometric/MSL or ellipsoidal.
2. If it is MSL, convert it with a suitable geoid model at the exact coordinates.
3. Keep the provider-coordinate uncertainty explicit.

## Reproducibility

- Script: `tests/run-jpl-horizons-pithoragarh-crosscheck.mjs`
- Workflow: `.github/workflows/asta-udaya-phase-diagnostics.yml`
- Full raw JSON artifact: GitHub Actions run [42825566399](https://github.com/OurHinduDharm/Panchang/actions/runs/42825566399), artifact `jpl-horizons-pithoragarh-2021-2027-crosscheck`
- JPL Horizons API documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- JPL Horizons manual (site altitude datum): https://ssd.jpl.nasa.gov/horizons/manual.html
- Indian gravimetric geoid model IndGG-SH2021: https://new.isgeoid.polimi.it/Geoid/Asia/India/india_SH2021_g.html

**Release decision:** Research-only. Do not use this correlation as a hard-coded production threshold or publish predicted Asta/Udaya dates from this report alone. PR #278 remains Draft pending full model validation and observer-datum review.
