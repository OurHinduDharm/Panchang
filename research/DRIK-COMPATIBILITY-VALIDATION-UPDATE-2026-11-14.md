# Guru–Shukra and Agastya validation update — 14 November 2026

## Run and scope

- Research workflow: [run 43578928006](https://github.com/OurHinduDharm/Panchang/actions/runs/43578928006)
- Result: success; unit tests, all research audits, five-city observer resolution and Astronomy Engine adapter smoke test passed.
- Five city profiles: Pithoragarh, New Delhi, Mumbai, Ujjain and Varanasi.
- This is a research-only update. No public Panchang data or UI was changed.

## Important calibration correction

The city-wise planetary back-test now samples the Sun's depression at the **actual local planet rise/set event instant**, rather than using the rounded Drik source timestamp as the calibration sample. The original Drik timestamp remains a separate comparison datum. The conjunction-age feature also uses the actual horizon event instant.

## Guru–Shukra findings

### Pithoragarh baseline

- 32 Drik boundary timestamps have a corresponding calculated local horizon event.
- All 32 nearest horizon events are within one minute of the source timestamp. This validates the Astronomy Engine local horizon clock-time calculation against the timestamped source records; it does not independently prove the Drik heliacal date-selection rule.
- The existing fixed same-branch threshold holdout has 8/8 brackets; 7/8 selected events are within 15 minutes, 7/8 within one local date, and one Venus 2027 AstaEnd remains about two days off.
- The threshold model remains research-only.

### Added implicit conjunction-age event-time experiment

This experiment generates event candidates from the complete local horizon-event series, trained only on 2021–2025. Holdout source timestamps are used only after candidate selection to measure error.

| City | Holdout records | Resolved | Within 15 min | Local-date mismatches | Unresolved |
|---|---:|---:|---:|---:|---:|
| Pithoragarh | 8 | 6 | 4 | 2 | 2 |
| New Delhi | 8 | 6 | 3 | 3 | 2 |
| Mumbai | 8 | 6 | 5 | 1 | 2 |
| Ujjain | 8 | 6 | 3 | 3 | 2 |
| Varanasi | 8 | 6 | 3 | 3 | 2 |

The candidate experiment is **not accepted** for publication: unresolved boundaries and one-day date mismatches remain. Clock-time closeness on a neighbouring date is not counted as a correct date/time result.

### Model complexity decision

The conjunction-age linear threshold model did not beat the simpler fixed median consistently:
- 20 groups evaluated; linear model better in only 3; fixed median better or tied in 17.
- Holdout: fixed median better or tied in 17/30 boundaries.
- Holdout mean absolute threshold residual: linear 0.2389°, median 0.1646°.

Therefore, do not promote conjunction-age linear fitting as the default. Keep it as a diagnostic only.

The azimuth-conditioned threshold experiment is also diagnostic-only; its per-city leave-one-year-out results do not establish a robust improvement over the fixed median, especially with small training samples.

## Agastya / Canopus findings

For the seven Drik Pithoragarh traditional Tara Udaya and Tara Asta records (2024–2030), the independent geometric horizon calculation on the **Drik-supplied event date** gives:
- 14/14 rise/set clock-time comparisons within 1.87 minutes absolute error.
- Mean absolute clock-time difference: 1.51 minutes.
- Rise events are on the eastern horizon; set events are on the western horizon.

This validates local geometric crossing time on a supplied Drik date, not the rule that selects the annual date. The separate Schaefer first/last naked-eye visibility diagnostic differs by event definition and is not substituted for the traditional Drik Arghya/Tara event.

## Decision / next gate

1. Keep Drik traditional Agastya records separate from modern first/last naked-eye visibility.
2. Keep the fixed same-branch Guru/Shukra threshold as the current research baseline; do not promote the conjunction-age or azimuth regressions.
3. Investigate the remaining Pithoragarh Venus 2027 AstaEnd two-day mismatch and the two Jupiter one-day mismatches before considering publication.
4. Acquire more same-city timestamped source windows, especially for cities/branches with only two to five training samples.
5. No annual page or main Panchang publication until each boundary has a correct local date and acceptable clock-time error on independent holdout years.

**Publication status:** all Guru/Shukra candidate events remain research-only; Agastya geometric clock-time cross-check is validated on Drik-provided dates, but its annual date rule remains unvalidated.
