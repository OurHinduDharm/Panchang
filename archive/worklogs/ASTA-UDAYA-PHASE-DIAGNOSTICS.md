# Asta/Udaya phase diagnostics

## Scope
This patch adds opt-in performance counters to the existing planetary angular-boundary display in `extra-panchang.js`. Counters are enabled only when the page URL contains `?perf=1`.

## Measurements
- Daily sample requests, cache hits, and cache misses.
- Count and elapsed time for daily `Elongation()` evaluations.
- Count and elapsed time for bisection `Elongation()` evaluations.
- Number of daily brackets scanned by nearest-boundary searches.
- Paired Asta/Udaya bracket-cache hits.
- Current daily cache size.

## Correctness guard
No astronomy inputs, thresholds, observer coordinates, daily scan direction, 400-day search bound, bisection stopping condition, date formatting, event selection, or displayed result is changed by the instrumentation. Normal page use leaves diagnostics disabled and does not collect timing counters.

## Important limitation
The production event method remains a provisional geocentric angular-threshold estimate. These measurements do not validate a classical Surya Siddhanta method, local naked-eye visibility, or Drik Panchang equivalence.

## Acceptance gates
1. Run browser tests against a fixed Pithoragarh observer (29.5828 N, 80.2182 E, 1650 m) and fixed dates.
2. Confirm counters appear under `?perf=1` and do not appear in normal use.
3. Compare exact visible Asta/Udaya fingerprints before and after instrumentation.
4. Use measured counters to identify the actual bottleneck before optimization.
5. Keep multi-year data export separate; never publish provisional threshold output as verified classical data.
