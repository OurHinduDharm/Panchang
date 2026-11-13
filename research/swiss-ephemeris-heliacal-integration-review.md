# Swiss Ephemeris heliacal visibility integration review

Date: 2026-11-13

## Decision

The next local-visibility layer should use a literature-backed heliacal visibility criterion, not another fixed Sun-planet elongation or altitude cutoff.

The strongest ready-made candidate found is Swiss Ephemeris `swe_heliacal_ut()`. Its official documentation describes a Schaefer (1993, 2000) visibility criterion implemented by Reijs and Koch. It accounts for:

- topocentric object and Sun positions;
- observer latitude, longitude and elevation;
- apparent object brightness and Moon position;
- observer age and visual acuity;
- pressure, temperature, relative humidity and atmospheric extinction;
- sky-background contrast.

References:
- Swiss Ephemeris heliacal model: https://www.astro.com/swisseph/swisseph.htm#_Toc505590478
- Swiss Ephemeris programming interface: https://www.astro.com/swisseph-download/doc/swephprg.2.10.htm
- Bradley E. Schaefer, “Astronomy and the Limits of Vision”, Vistas in Astronomy 36 (1993), 311–361: https://www.uai.it/pianeti/wp-content/uploads/2021/03/ppr_Sch93-1.pdf
- Swiss Ephemeris licensing: https://www.astro.com/swisseph/swisseph.htm#_Toc505590459

## Event mapping

| Panchang-facing event | Swiss Ephemeris event | Type |
|---|---|---:|
| Planet morning first visibility / local Udaya | `SE_HELIACAL_RISING` | 1 |
| Planet evening last visibility / local Asta | `SE_HELIACAL_SETTING` | 2 |
| Evening first | `SE_EVENING_FIRST` | 3 |
| Morning last | `SE_MORNING_LAST` | 4 |

For Guru and other superior planets, the first two are the applicable ordinary heliacal events. Venus and Mercury may have additional evening-first / morning-last phenomena. Those must not be collapsed into a single continuous visibility window.

The return values are beginning, optimum and end of visibility as Julian Day UT values. The adapter preserves all three rather than reducing a multi-hour visibility interval to a made-up single instant.

## Code added in this PR

`research/swiss-ephemeris-heliacal-adapter.mjs` adds a package-independent bridge with:
- explicit longitude/latitude/elevation ordering;
- separate atmosphere and observer-vision arrays;
- strict event-type validation;
- support for the three visibility timestamps;
- error and Julian Day validation;
- explicit UTC-as-UT1 approximation label, with an escape hatch for caller-supplied UT1 JD;
- no terrain-horizon claim.

Unit tests use an injected native-call stub. They verify the bridge contract, not the Swiss Ephemeris numerical results. A real engine binding and city/year benchmark are still required before publishing results.

## Important limitations

1. Swiss Ephemeris documentation says `swe_heliacal_ut()` is intended for latitudes from 60°S to 60°N. Pithoragarh and the current Indian benchmark locations are inside that range.
2. The official documentation describes edge cases for Mars at higher latitudes and Venus daytime visibility. Results need independent comparison and must not be treated as infallible.
3. The function's standard atmosphere model is not a measured Pithoragarh weather record. Default inputs are estimates; local weather can shift actual naked-eye visibility.
4. The current call does not use the project's DEM-derived terrain horizon. A separate azimuth-dependent terrain obstruction correction remains necessary for mountain observers.
5. This model calculates naked-eye heliacal visibility. Classical angular combustion and traditional Agastya Arghya remain separate event classes.

## Licensing gate — do not silently add a dependency

Swiss Ephemeris is dual-licensed under AGPL and a Professional License. Its official terms state that software using it must choose a license before distribution or public service activation; the AGPL route requires the whole software project to be AGPL or compatible.

The repository currently has no explicit license declaration in this research branch. Therefore this PR does **not** add or bundle a Swiss Ephemeris package, WASM binary, or native code. The adapter is dependency-injected. Before connecting a concrete Swiss Ephemeris binding, the project owner must choose an appropriate license route or approve a separately reviewed implementation.

## Validation plan

- Connect a pinned and license-cleared Swiss Ephemeris binding.
- Reproduce its official sample outputs and check return-code semantics.
- Compare 2026–2027 Pithoragarh Venus and Jupiter against the user-provided Drik windows and Panchang Guru references, retaining source event definitions.
- Compare several independent locations and hold out years from calibration.
- Add Canopus as a fixed-star request only after its exact Swiss fixed-star catalog identifier and proper-motion handling are verified.
- Add DEM horizon obstruction and report weather assumptions separately.


## Canopus / Agastya fixed-star identity

The official Astrodienst fixed-star selection list identifies `Agastya,alCar` and `Canopus,alCar` as the same Bayer-designated star. The Swiss fixed-star catalogue data also contains the traditional name `Agastya` with designation `alCar`. The new `research/agastya-heliacal-events.mjs` therefore uses the catalogue's Indian traditional name `Agastya` as its object key, while preserving Canopus and `alCar` as identity metadata.

The module requests morning-first and evening-last heliacal events separately. It does not calculate or overwrite the traditional Agastya Arghya dates; those remain in `data/agastya-arghya-pithoragarh.json` as a separate rule/source layer.

Sources:
- Official Astrodienst fixed-star list: https://www.astro.com/swisseph/fstarlist.htm
- Swiss Ephemeris fixed-star naming rules: https://www.astro.com/swisseph-download/doc/swephprg.2.10.htm
