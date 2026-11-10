# Five-City Asta/Udaya Model Transfer: Pithoragarh Holdout (2024–2027)

**Status:** Research-only cross-city validation  
**Run:** GitHub Actions 42827668355  
**Accepted reference coverage:** 355 unique windows across five cities  
**Observer caveat:** Drik provider coordinates/elevation are not published; every city uses an explicit proxy observer.

## Pithoragarh as the held-out city

The model was trained on the other four cities only, then applied to Pithoragarh. No Pithoragarh rows were used to fit the Pithoragarh fold.

| Planet | Selected model | Matched windows | Asta exact | Asta within 1 day | Udaya exact | Udaya within 1 day |
|---|---|---:|---:|---:|---:|---:|
| Mercury | Magnitude + event direction + interaction | 44/45 | 29/44 | 43/44 | 37/44 | 44/44 |
| Venus | Magnitude + event direction + interaction | 9/9 | 6/9 | 9/9 | 5/9 | 9/9 |
| Jupiter | Magnitude only | 7/7 | 6/7 | 7/7 | 6/7 | 7/7 |
| Saturn | Magnitude only | 7/7 | 7/7 | 7/7 | 7/7 | 7/7 |
| Mars | Magnitude + event direction + interaction | 2/3 | 1/2 | 2/2 | 2/2 | 2/2 |

Detailed errors for the selected models:
- Mercury: Asta MAE 0.364 d (max 2 d); Udaya MAE 0.159 d (max 1 d).
- Venus: Asta MAE 0.333 d (max 1 d); Udaya MAE 0.444 d (max 1 d).
- Jupiter: Asta MAE 0.143 d (max 1 d); Udaya MAE 0.143 d (max 1 d).
- Saturn: both boundaries exact across all 7 matched windows.
- Mars: only two matched windows; sample size is too small for acceptance.

## Feature selection

The cross-city test compared:
1. Magnitude-only.
2. Magnitude plus actual event direction and magnitude×direction interaction.
3. Local geometry features plus event direction.

The magnitude-plus-direction model was the strongest general choice for Mercury and Venus. Magnitude-only remained strongest/simplest for Jupiter and Saturn. The extra local-geometry feature model was unstable for Venus and Saturn (large date errors) and did not beat the selected model for Mercury. Do not carry the unstable geometry coefficients into production.

## What this supports

- A pooled multi-city model can transfer to Pithoragarh without using Pithoragarh training rows for that fold.
- The event direction must be explicit; a single AstaStart/AstaEnd direction rule is invalid for inner planets.
- The feature set should remain planet-specific.
- The result is city-proxy validation, not proof that provider and project observer coordinates/elevations are identical.
- Mars remains low-confidence because there are only two matched Pithoragarh windows.

## Release decision

This is strong support for a candidate dynamic observer-aware engine for Mercury, Venus, Jupiter and Saturn, but not a blanket approval to publish. The strict forward-only Pithoragarh results, current observer-height datum, exact event-time behavior, and unchanged Panchang performance must also pass. Mars must remain unavailable until its reference coverage is sufficient.

Full run: https://github.com/OurHinduDharm/Panchang/actions/runs/42827668355
