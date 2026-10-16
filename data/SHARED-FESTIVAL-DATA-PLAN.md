# Shared Festival Data and Fast Local Calculation

Status: implementation plan; research/draft branch only. Do not connect to the live Blogger widget until validation passes.

## Decision

Use a yearly shared-data layer, but do not publish a single city’s final festival dates as universal. Keep three separate layers:

1. **Shared yearly astronomical index** — UTC instants and identifiers for validated tithi, nakshatra, yoga, karana and solar-ingress transitions. Generate once per Gregorian year. The format must preserve the actual transition instant, not sunrise-clipped daily segments.
2. **Shared festival rule catalog** — small rule metadata, tradition/priority, source trail and required inputs. Do not ship the full research catalog and diagnostic notes to every visitor.
3. **Local decision layer** — calculate sunrise/sunset and local ritual windows for the selected coordinates/time zone, then apply the reviewed festival rule. The local result is never inferred solely from a shared civil date.

## Important library finding

The pinned `@ishubhamx/panchangam-js@3.0.0` exposes arrays such as `p.tithis`, `p.nakshatras` and `p.yogas`. Existing project diagnostics describe these as sunrise-to-next-sunrise segments; the first segment can be clipped at sunrise. These arrays must not automatically be treated as universal astronomical transition records. Scalar fields such as `tithiStartTime` and `nakshatraStartTime` are not consistently exposed by the current API.

The shared-index generator must first prove that it can recover real event boundaries with stable UTC instants, then compare representative events against the project reference Panchang and independent sources. If the current API cannot provide reliable universal boundaries, keep using it for local calculations while researching a separate validated boundary provider; do not silently substitute clipped segments.

## Runtime performance

- Cache identical Panchang snapshots by exact instant, coordinates, elevation and timezone offset in a bounded in-memory LRU.
- When the shared yearly index is validated, load only the current/adjacent year needed; avoid fetching the full research catalog.
- Use the shared index to narrow candidate windows. Recalculate the local ritual decision with the selected city’s sunrise, sunset and applicable vrata/muhurta rule.
- Keep location-specific precomputed files explicitly labelled by coordinates. Never reuse Pithoragarh’s Kalashtami final decisions as universal city data.

## Rollout and acceptance criteria

1. Diagnose real interval boundaries across multiple cities and seasons; distinguish actual transitions from sunrise-clipped segments.
2. Generate a compact annual index and record compressed/uncompressed bytes and generation time.
3. Compare selected dates with Ganesh Martand Panchang first, then same-coordinate independent references; record discrepancies rather than hiding them.
4. Run festival, vrata, muhurta and date-boundary regression tests.
5. Benchmark cold load and repeated date navigation on mobile-sized payloads.
6. Integrate only after data accuracy, payload size, cache invalidation and fallback behaviour are demonstrated. Production Blogger code remains unchanged until approval.
