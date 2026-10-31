# Asta/Udaya phase diagnostics — 2026-10-31

## Scope
This branch adds opt-in performance counters to the existing planetary angular-boundary display in `extra-panchang.js`. The counters are enabled only when the page URL contains `?perf=1`.

## Measurements
- Daily sample requests, cache hits, and cache misses.
- Count and elapsed time for daily `Elongation()` evaluations.
- Count and elapsed time for bisection `Elongation()` evaluations.
- Number of daily brackets scanned by the nearest-boundary searches.
- Paired Asta/Udaya bracket-cache hits.
- Current daily cache size.

## Correctness guard
No astronomy inputs, thresholds, observer coordinates, daily scan direction, 400-day search bound, bisection stopping condition, date formatting, event selection, or displayed result has intentionally changed. Instrumentation only reads counters and `performance.now()` when `?perf=1` is enabled. Normal page use keeps the diagnostics object null and does not collect timing counters.

## Important limitation
The current production event method is explicitly labelled preliminary and threshold-based. These measurements do not validate it as a classical Surya Siddhanta method, nor prove local naked-eye visibility or Drik Panchang equivalence.

## Next acceptance gates
1. Run browser tests against a fixed Pithoragarh observer (29.5828 N, 80.2182 E, 1650 m) and fixed dates.
2. Confirm counters are present under `?perf=1`, absent from ordinary display, and no uncaught browser errors occur.
3. Compare the exact visible Asta/Udaya fingerprint before and after instrumentation.
4. Use the counters to identify whether daily ephemeris calls, bisection, or cache reuse is the real cost before attempting any optimization.
5. Keep the multi-year data export/import architecture separate from this profiling patch; do not publish provisional threshold outputs as verified classical data.
