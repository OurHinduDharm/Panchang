# Guru-Shukra multi-city historical capture and holdout review — 2026-11-14

## Historical source recovery

GitHub Actions run [43555330612](https://github.com/OurHinduDharm/Panchang/actions/runs/43555330612) captured the missing 2021–2023 Drik Guru/Shukra annual pages for New Delhi, Mumbai, Ujjain and Varanasi.

- Requested pages: 24
- HTTP/city/planet/year identity verified: 24/24
- Quarantined pages: 0
- Complete source windows: 28
- Windows per city: 7
- Capture artifact SHA-256: `014c4c06e5676ff3abedbd044db5b737435561c99964a5187e68485fe6502afa`

Pithoragarh retains its separate 2021–2025 history. The supplemental file `research/data/multi-city-guru-shukra-history-2021-2023.json` preserves original printed date/weekday/clock, normalized IST and UTC instants, page URL, city ID and capture run. The source rows are city-label-only because Drik does not disclose exact observer coordinates/elevation.

## Recomputed 2026–2027 holdout

The model was rerun with same-city, same-planet, same-boundary training years 2021–2025. No holdout timestamp was used to fit thresholds.

| City | Predictions | Within 15 min | >1 hour mismatch | Unresolved |
|---|---:|---:|---:|---:|
| New Delhi | 8/8 | 6 | 2 | 0 |
| Mumbai | 8/8 | 8 | 0 | 0 |
| Ujjain | 8/8 | 6 | 2 | 0 |
| Varanasi | 8/8 | 7 | 1 | 0 |
| Pithoragarh | 8/8 | 7 | 1 | 0 |
| **Total** | **40/40** | **34** | **6** | **0** |

All 40 candidates have a unique conjunction and expected rise/set branch match. This is not publication approval: 6 boundaries remain day-scale or larger mismatches.

## Outstanding mismatches

- **New Delhi — Jupiter AstaEnd 2026:** approximately 1,437 minutes early.
- **New Delhi — Jupiter AstaStart 2027:** approximately 1,437 minutes early.
- **Ujjain — Jupiter AstaStart 2026:** approximately 1,437 minutes late.
- **Ujjain — Jupiter AstaEnd 2026:** approximately 1,437 minutes late.
- **Varanasi — Venus AstaStart 2027:** approximately 1,441 minutes late.
- **Pithoragarh — Venus AstaEnd 2027:** approximately 2,878 minutes late (source 9 Sep 18:48 IST; selected candidate 11 Sep 18:46 IST).

Mumbai is the strongest current city-centre diagnostic: all eight holdout boundaries are within 15 minutes. It is still city-label comparison, not exact-observer proof.

## Decision and next work

- Keep `publicationEligible: false`.
- Do not change any empirical threshold using these holdout failures.
- Diagnose each day-scale error from conjunction pairing and physical horizon-event branch, not by nearest-source timestamp look-ahead.
- Prioritize Pithoragarh Venus 2027 AstaEnd, then the two Jupiter 2026/2027 New Delhi and Ujjain cases and Varanasi Venus 2027.
- Obtain independent same-city references where possible; do not pool cities.
- No public annual JSON, festival JSON or main Panchang output was changed.

This report is research-only.
