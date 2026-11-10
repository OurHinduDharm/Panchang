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


## Event-direction findings

The JPL samples also preserve whether the planet was rising or setting through the -0.5° crossing. The direction is not safely inferred from the AstaStart/AstaEnd label alone:

| Planet | AstaStart: rising / setting | AstaEnd: rising / setting |
|---|---:|---:|
| Mercury | 24 / 22 | 22 / 24 |
| Venus | 6 / 4 | 4 / 6 |
| Mars | 0 / 5 | 5 / 0 |
| Jupiter | 0 / 7 | 7 / 0 |
| Saturn | 0 / 7 | 7 / 0 |

This reinforces the need to preserve apparition/conjunction type and actual event direction in the selector. A universal rule such as “Asta always begins at setting and ends at rising” would be wrong for Mercury and Venus.

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


## Independent location-coordinate check

An Irrigation Research Institute, Roorkee instrument inventory lists a Pithoragarh automatic rain-gauge station at 29.5819744° N, 80.2187114° E. This is approximately 104 m from the project observer coordinates used here (29.5828° N, 80.2182° E), providing a useful independent check that the project point is in the Pithoragarh town area. It does not establish Drik's provider coordinates or the observer's vertical datum.

Source: https://www.iriroorkee.res.in/documents/pdf/news_events/Annexure_17_10_24.pdf


## 2026-11-10 audit addendum — deduplicated sample size

A later audit compared the raw Pithoragarh source capture with the canonical main-branch reference ledger.

- Raw capture: 75 annual-page windows.
- Duplicate annual-page references: 4.
- Unique Asta windows: **71**.
- Unique published boundaries: **142** (two per window).
- The 71 unique `(planet, AstaStart UTC, AstaEnd UTC)` keys exactly match the 71 Pithoragarh windows in the main-branch canonical reference file `data/drik-planetary-reference-2024-2027.json`.
- Unique boundary counts: Mercury 90, Venus 18, Mars 6, Jupiter 14, Saturn 14.

**Interpretation correction:** The 150 observations in the original table are raw boundary observations, not 150 independent published events. They comprise 142 unique boundaries plus 8 repeated observations arising from four duplicate annual-page window references. The original aggregate means, maxima and 150/150 statements describe the raw repeated-observation set; they must not be presented as deduplicated independent-sample statistics. A fresh unique-boundary JPL aggregation is required before reporting independent-sample error statistics. The raw checks remain a useful per-observation geometry cross-check, but this correction reduces the evidential sample count.

## India-specific geoid model metadata

The selected regional candidate is **IndGG-SH2021**, a public Indian gravimetric geoid model (CC BY 4.0) based on the Stokes–Helmert approach. Its published grid covers 7–37° N and 68–98° E at 0.02° spacing and is referenced to the GRS80 ellipsoid. The published India-wide GNSS/levelling validation is mean ± standard deviation of −0.33 ± 0.49 m; this is a country-level statistic, not a Pithoragarh-specific accuracy claim.

- Model page: https://new.isgeoid.polimi.it/Geoid/Asia/India/india_SH2021_g.html
- Dataset DOI: https://doi.org/10.5880/isg.2021.009
- ISG height-conversion service: https://www.isgeoid.polimi.it/Geoid/height_conversion.html

The model page exposes both an original file and ISG-format file. The ISG format records the reference ellipsoid, grid geometry, ordering and undulation units; its documented default grid ordering is north-to-south, each row west-to-east. Do not parse or interpolate the grid until the downloaded file header confirms the exact metadata and no-data convention.

**Still unresolved:** No numerical undulation has yet been extracted at 29.5828° N, 80.2182° E. The project's 1650 m input has not been proven to be orthometric height. Do not apply a geoid correction or claim a corrected observer altitude until both facts are established. After extraction, compare IndGG-SH2021 with EGM2008 and rerun JPL checks over the 142 unique boundary instants.

## 2026-11-10 follow-up — unique-boundary runner corrected

The JPL runner was updated in commit `9d152af7ec94b35beb27f0dd6547f109f1980fc4` to deduplicate annual-page overlap by `(planet, normalized UTC AstaStart, normalized UTC AstaEnd)` **before** requesting Horizons samples and calculating statistics. It records the 75 raw rows, 4 duplicate annual-page references and 71 unique windows in the generated JSON, and fails closed if the ledger no longer reconciles to those counts. A fresh execution will therefore evaluate 142 unique boundaries. The older raw artifact and its 150-observation aggregates remain historical and must not be cited as unique-sample statistics. Fresh unique-boundary JPL results are still pending.
