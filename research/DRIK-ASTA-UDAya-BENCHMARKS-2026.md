# Drik Panchang Asta/Udaya reference benchmarks — 2026

Status: external reference dataset for a separate Drik-compatible implementation. These values are **not** evidence that the Surya-siddhanta Chapter IX diagnostic model is correct, and must not be used to tune that research model.

## What Drik Panchang states about its method

Drik Panchang's planet-specific Asta pages state that the listed combustion timings use modern algorithms and the observer's geolocation. They separately describe Surya-siddhanta angular-separation values as approximate timings:
- Venus: 10° in forward motion and 8° in retrograde motion.
- Mercury: 14° in forward motion and 12° in retrograde motion.
- Jupiter: 11°.
- Mars: 17°.
- Saturn: 15°.

This distinction matters: a simple geocentric angular-threshold scan is not a reproduction of Drik's location-dependent modern method. Do not label it Drik-matched. A future compatible implementation needs a topocentric/observer-location visibility model and comparison against the event tables below.

## 2026 reference events — New Delhi, India

All times are local New Delhi time as published by Drik Panchang. These are benchmark values for the named location only.

| Planet | Asta begins | Asta ends | Source |
|---|---|---|---|
| Venus | 12 Oct 2026, 18:19 | 29 Oct 2026, 06:00 | https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html |
| Mercury | 25 Oct 2026, 18:31 | 11 Nov 2026, 05:40 | https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html |
| Jupiter | 15 Jul 2026, 19:59 | 12 Aug 2026, 05:03 | https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html |
| Mars | 1 Nov 2025, 18:36 | 2 May 2026, 04:30 | https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html |
| Saturn | 13 Mar 2026, 19:13 | 22 Apr 2026, 04:49 | https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html |

## Validation rules for future implementation

1. Compare the same planet, event, year, location, and local time zone.
2. Do not compare New Delhi benchmark times directly with Pithoragarh output. Retrieve Pithoragarh-specific Drik values first.
3. Preserve the event start and end as separate crossings; do not infer both from a single selected date or one symmetric threshold.
4. Validate both date and time, with an explicit tolerance agreed before tests are written.
5. A passing New Delhi benchmark does not prove location correctness. Test at least one second location with materially different longitude/latitude.
6. Keep the Surya-siddhanta K/C diagnostics separate. Drik's published modern algorithm and the Chapter IX classical derivation are different targets.

## Key correction to the current implementation plan

The previous PR #135 experiment classified Venus events from geocentric apparent longitude and motion, and withheld Mercury. That is not sufficient for Drik compatibility: Drik publishes Mercury events and says its event timings are geolocation-based. The experiment was removed from the production PR; the PR now only fixes the direction of the existing angular-boundary search. Do not merge it as a Drik implementation.

## Pithoragarh reference location

Drik Panchang's Pithoragarh pages resolve the city as Pithoragarh, Uttarakhand, India with geoname ID `1259503`:
https://www.drikpanchang.com/panchang/month-panchang.html?geoname-id=1259503

The planet-specific Asta pages did not expose their Pithoragarh-specific event tables through the current retrieval path, so no Pithoragarh Asta/Udaya times are asserted here. The New Delhi table above must not be substituted for Pithoragarh. The next benchmark capture must obtain the planet-specific pages with this same location selected and record the returned event times before numerical comparison.
