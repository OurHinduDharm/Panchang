# Azimuth-conditioned Drik threshold audit — 14 November 2026

## Scope and decision

This is a research-only comparison for the city-aware Guru/Shukra visibility work. It asks whether the local absolute azimuth separation between the planet and Sun, measured at a captured Drik boundary's local planet rise/set event, helps explain the observed Sun-depression threshold better than the existing per-city/per-planet/per-boundary/per-direction median.

**Decision: do not replace the median threshold or use this linear model in production.** The apparent improvement for one Pithoragarh Venus branch does not generalize across the five tested cities. No production file, public annual data, or Panchang calculation was changed by this audit.

## Method

- Each city's own source observations are retained in a separate group. No threshold is borrowed between cities.
- The feature is the absolute shortest azimuth difference between the planet and Sun at the captured local horizon event.
- Comparators are (a) fixed median Sun depression and (b) a two-parameter linear fit of Sun depression against azimuth separation.
- Leave-one-year-out removes every source row from the target year before fitting. 2026–2027 are holdout years.
- Rows whose conjunction-associated rise/set branch does not match are excluded. Groups with fewer than three remaining training samples do not receive a linear prediction.
- The metric is an angular threshold residual in degrees. It is **not** a date error, a clock error, or a predicted Asta/Udaya time.

## Pithoragarh finding

For Venus `astaEnd:set`, four training samples from 2021, 2022, 2024 and 2025 yielded:

| Metric | Azimuth-conditioned linear fit | Fixed median |
|---|---:|---:|
| Leave-one-year-out MAE | 0.02686° | 0.14541° |
| 2027 holdout threshold | 5.62366° | 5.88870° |
| 2027 observed threshold | 5.74071° | 5.74071° |
| Absolute 2027 threshold residual | 0.11705° | 0.14799° |

This is a promising relationship in one small event group, but the holdout is still off by 0.117°. It does **not** prove that the 2027 two-day timestamp mismatch has been fixed. The diagnostic deliberately does not convert the threshold into an event timestamp.

Across Pithoragarh's four groups with enough samples for leave-one-year-out, the linear fit improved one group and worsened three. Its unweighted group-mean LOO MAE was 0.17334° versus 0.14648° for the median.

## Five-city generalization test

The five city profiles were evaluated independently: Mumbai, New Delhi, Pithoragarh, Ujjain and Varanasi.

| Measure | Result |
|---|---:|
| Per-city event groups | 30 |
| Groups with enough samples for LOO | 20 |
| LOO groups where linear fit improved | 5 |
| LOO groups where fixed median improved | 15 |
| LOO row-weighted MAE — linear | 0.18965° |
| LOO row-weighted MAE — median | 0.15070° |
| Holdout boundaries in report | 40 |
| Holdout boundaries with linear estimate | 30 |
| Holdout boundaries without enough training | 10 |
| Evaluable holdouts where linear residual was smaller | 11 |
| Evaluable holdouts where median residual was smaller | 19 |
| Holdout absolute residual MAE — linear | 0.28968° |
| Holdout absolute residual MAE — median | 0.18860° |

The five-city holdout confirms that this linear feature is **not a generally safer threshold model**. Its aggregate holdout residual is worse than the fixed median. A single-city fit must not be generalized to other cities or planet/event branches.

## Data acquisition limitation

A separate Drik Pithoragarh 2016–2020 history capture tried ten pages: Jupiter and Venus, five years each. All ten were quarantined—Jupiter pages returned a reCAPTCHA challenge and Venus pages returned HTTP 403. No boundary row was imported into the calibration set. CAPTCHA was not bypassed.

## Next research gate

1. Retain the existing Drik-calibrated city/branch-specific model unchanged.
2. Resolve the Pithoragarh Venus 2027 AstaEnd mismatch using additional lawful same-city Drik records or a separately verified, same-event reference.
3. Require more complete same-city years before testing richer predictors; no multi-city pooling.
4. Only after a candidate produces independently held-out dates and times within the acceptance tolerances should it be considered for the annual public page.

**Publication eligibility: false.** This report is not a production recommendation.
