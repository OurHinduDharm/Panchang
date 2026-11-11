# Planetary visibility physics feature layer

Status: research-only diagnostic implementation; not a production Asta/Udaya decision.

## Implemented

`research/planetary-visibility-physics.mjs` provides:

- Kasten–Young (1989) optical air mass, with an explicit validity guard below -5° apparent altitude.
- Great-circle separation from local horizontal altitude/azimuth coordinates.
- Standard solar-altitude twilight bands (daylight, civil, nautical, astronomical, night).
- Extinction-adjusted apparent magnitude using an explicitly supplied extinction coefficient.
- Moon altitude, illuminated fraction and planet–Moon angular separation as retained diagnostic inputs.

The module intentionally returns `diagnostic-only`, not a Boolean visibility verdict or a fabricated probability. The extinction coefficient must be supplied; humidity, aerosols, haze, local light pollution, observer acuity and terrain skyline are not inferred from a city name.

## Why this is a useful step

The existing selector's fitted solar-altitude threshold is an empirical Panchang-boundary approximation. This feature layer adds auditable local sky/atmosphere observables that can be tested against the same held-out event ledger. It does not silently replace that selector or claim to reproduce the complete Schaefer model.

## Next scientific gates

1. Feed the same topocentric event snapshots into this feature extractor for the accepted Pithoragarh 2021–2027 ledger.
2. Compare feature families using strictly forward-year holdouts; retain only features that improve both Asta and Udaya without holdout leakage.
3. Add measured/declared atmosphere scenarios and sensitivity intervals, rather than one assumed extinction value.
4. Compare the resulting visibility residuals against an independent heliacal implementation and same-location event records.
5. Keep all output research-only until exact event semantics, both boundary clocks, Mars coverage, observer elevation datum and performance are cleared.

## References

- Kasten, F. & Young, A. T. (1989), *Revised optical air mass tables and approximation formula*, Applied Optics 28(22), 4735–4738.
- Swiss Ephemeris documentation: https://www.astro.com/swisseph/swisseph.htm
- JPL Horizons manual: https://ssd.jpl.nasa.gov/horizons/manual.html
