# Pithoragarh Forward-Only Asta/Udaya Validation (2021–2027)

**Status:** Research-only prospective validation  
**Run:** [GitHub Actions 42827668355](https://github.com/OurHinduDharm/Panchang/actions/runs/42827668355)  
**Accepted coverage:** 71 Pithoragarh windows and 172 other-city windows (231 total) across 2021–2027  
**Rule:** Every fold trains only on source-page years strictly earlier than the held-out Pithoragarh year. No future-year data is used.

## 1. Aggregate forward-only results

| Planet | Training mode / model | Holdouts | Asta exact | Asta within 1 day | Asta MAE | Udaya exact | Udaya within 1 day | Udaya MAE |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Mercury | Pooled prior years; magnitude + event direction | 38 | 23/38 | 38/38 | 0.395 d | 32/38 | 38/38 | 0.158 d |
| Mercury | Local prior years; magnitude + event direction | 38 | 20/38 | 38/38 | 0.474 d | 31/38 | 38/38 | 0.184 d |
| Venus | Local prior years; magnitude only | 5 | 3/5 | 5/5 | 0.400 d | 2/5 | 5/5 | 0.600 d |
| Venus | Pooled prior years; magnitude only | 5 | 1/5 | 5/5 | 0.800 d | 2/5 | 5/5 | 0.600 d |
| Jupiter | Pooled prior years; magnitude only | 3 | 2/3 | 3/3 | 0.333 d | 3/3 | 3/3 | 0.000 d |
| Jupiter | Local prior years; magnitude only | 3 | 2/3 | 3/3 | 0.333 d | 3/3 | 3/3 | 0.000 d |
| Saturn | Pooled prior years; magnitude only | 3 | 3/3 | 3/3 | 0.000 d | 3/3 | 3/3 | 0.000 d |
| Saturn | Local prior years; magnitude only | 3 | 2/3 | 3/3 | 0.333 d | 2/3 | 3/3 | 0.333 d |

Mars had only one forward-only fold with no matched candidate window. It is not publishable from this dataset.

The selected Mercury model materially outperforms magnitude-only and keeps all 38 Asta and 38 Udaya dates within one day. Venus performs better with the local-only training variant in this forward test. Jupiter's pooled and local models tie. Saturn improves with pooled prior-year training.

## 2. Blind 2026 predictions (trained only on earlier years)

All accepted 2026 windows for Mercury, Venus, Jupiter and Saturn matched the Drik reference dates exactly. The event times were within one minute in every matched case.

| Planet | Asta predicted (local) | Drik Asta | Udaya predicted (local) | Drik Udaya |
|---|---|---|---|---|
| Mercury | 2026-01-01 06:16:44 | 2026-01-01 06:16 | 2026-02-05 18:37:42 | 2026-02-05 18:38 |
| Mercury | 2026-03-01 18:57:39 | 2026-03-01 18:58 | 2026-03-19 05:15:37 | 2026-03-19 05:15 |
| Mercury | 2026-04-26 04:46:57 | 2026-04-26 04:47 | 2026-05-23 19:51:17 | 2026-05-23 19:52 |
| Mercury | 2026-06-30 20:11:42 | 2026-06-30 20:12 | 2026-07-26 04:17:16 | 2026-07-26 04:17 |
| Mercury | 2026-08-18 04:51:17 | 2026-08-18 04:51 | 2026-09-19 18:56:06 | 2026-09-19 18:57 |
| Mercury | 2026-10-24 18:20:33 | 2026-10-24 18:21 | 2026-11-11 05:29:35 | 2026-11-11 05:29 |
| Mercury | 2026-12-14 06:10:14 | 2026-12-14 06:10 | 2027-01-19 18:24:55 | 2027-01-19 18:25 |
| Venus | 2026-10-12 18:04:15 | 2026-10-12 18:05 | 2026-10-29 05:49:44 | 2026-10-29 05:49 |
| Jupiter | 2026-07-15 19:48:01 | 2026-07-15 19:49 | 2026-08-12 04:49:20 | 2026-08-12 04:49 |
| Saturn | 2026-03-13 19:00:21 | 2026-03-13 19:01 | 2026-04-23 04:33:32 | 2026-04-23 04:33 |

These are validation comparisons, not a production publication feed. The 2026 holdout training windows were 80 for pooled Mercury, 7 for local Venus, 13 for pooled Jupiter and 13 for pooled Saturn.

## 3. 2027 holdout warnings

- Mercury: all six Udaya dates exact; only three of six Asta dates exact, with the other three one day off. Asta clock errors reached 8 minutes.
- Venus: Asta date exact; Udaya prediction was one day later than the reference (predicted 2027-09-10 18:46:59 vs reference 2027-09-09 18:48).
- Jupiter: Asta and Udaya dates exact; clocks within one minute.
- Saturn: Asta and Udaya dates exact; clocks within one minute.
- Mars: no publishable result.

## 4. Release interpretation

1. The 2026 holdout results are strong enough to advance a Pithoragarh-only display candidate for Mercury, Venus, Jupiter and Saturn, subject to the observer-height datum review and main-page regression/performance check.
2. Do not extend 2026 success to 2027 without qualification; Mercury Asta and Venus Udaya have one-day misses.
3. Do not show Mars until its training coverage improves.
4. For other locations, use the independently tested multi-city transfer model only when the selected observer and model coverage are explicit. Never fall back to New Delhi.
5. Keep the page free of Drik links; the Drik values are internal benchmark records only.

Full machine-readable report artifact: `pithoragarh-forward-year-holdout-2021-2027` in the linked Actions run.
