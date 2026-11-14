# City-wise Guru/Shukra back-test review — 2026-11-14

## Scope

Review of the research-only artifact from GitHub Actions run `43553876911` (workflow: `Validate Tara visibility research adapters`, run 144).

Artifact: `city-wise-guru-shukra-observer-backtest`  
SHA-256: `46d9721c9db8eb25ee23d79c8cf058af8f63de8582b30afab8dfa7a4c876e268`

This review does not modify source observations, thresholds, calculated annual windows, or public data.

## Holdout results

All figures below are from 2026–2027 holdout boundaries. “Within 15 min” is based on absolute UTC-instant error after local-time normalization. “Mismatch” means a predicted boundary exists but is more than one hour from the source timestamp.

| Observer profile | Boundaries | Predictions | Within 15 min | >1 hour mismatch | Unresolved |
|---|---:|---:|---:|---:|---:|
| New Delhi | 8 | 6 | 3 | 3 | 2 |
| Mumbai | 8 | 6 | 6 | 0 | 2 |
| Ujjain | 8 | 6 | 4 | 2 | 2 |
| Varanasi | 8 | 6 | 4 | 2 | 2 |
| Pithoragarh | 8 | 8 | 7 | 1 | 0 |

## Findings requiring action

1. **Pithoragarh Venus 2027 AstaEnd remains a hard failure.** The source boundary is 2027-09-09 18:48 IST; the selected candidate is 2027-09-11 18:46 IST, approximately 2,878 minutes late. Keep it unresolved. Do not tune the threshold against this holdout.
2. **Other-city training is too short for Venus.** These city profiles have only 2024–2025 training observations in the current reference set. Both 2026 Venus boundaries in each of the four city reports remain unresolved for insufficient same-city training samples.
3. **Several city profiles have day-scale Jupiter errors.** New Delhi has three >1-hour mismatches; Ujjain and Varanasi have two each. These are not acceptable as city-verified results even when the conjunction branch is correct.
4. **Mumbai is the strongest current city-centre diagnostic, not publication proof.** Its six predicted holdout boundaries are within 15 minutes, but the two 2026 Venus boundaries remain unresolved.
5. **The reference-location limitation remains material.** Non-Pithoragarh observer inputs are Nominatim city-centre coordinates plus approximately 90 m Copernicus DEM elevations. Drik's exact observer coordinates/elevation are undisclosed. These are city-label comparisons, not exact-observer validation. Do not call these five profiles arbitrary-location or exact city-wide results.

## Next research gate

- Extend each city’s historical source set before fitting more city-specific Venus thresholds. Prioritize 2021–2023 captures for the same five named cities, preserving raw printed date, raw 24+ clock, normalized local datetime, page URL, and capture metadata.
- Do not borrow training samples across cities or planets.
- Investigate the Pithoragarh Venus 2027 AstaEnd branch/candidate selection independently of the holdout timestamp; use 2021–2025 training and conjunction geometry only.
- Add no public annual values until the holdout errors and independent same-city comparisons meet the acceptance limits.
- Keep the main Panchang and public annual JSON unchanged.

## Publication decision

`publicationEligible: false`.

This review is an internal audit record only. It does not approve any candidate time for public display.
