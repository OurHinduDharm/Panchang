# Drik Agastya geometric-horizon cross-check — 14 November 2026

## Finding

The Drik Pithoragarh traditional Agastya Tara Udaya/Tara Asta source times for 2024–2030 are reproduced by the project's independent Canopus geometric-horizon crossing calculation to within about two minutes when the **Drik-published date is supplied as the event date**.

This is a strong validation of the local geometric rise/set clock-time calculation. It does **not** independently validate or predict the date-selection rule used by Drik. Drik's pages expose a city label but not the exact internal observer coordinates/elevation; this comparison is therefore city-label-only, not coordinate-exact.

## Observer and method

- Project observer: 29.5828° N, 80.2182° E, 1650 m, Asia/Kolkata.
- Star: Canopus / Agastya, HIP 30438.
- Catalogue: SIMBAD ICRS/J2000 astrometry with proper motion propagated to the observation date.
- Engine: pinned Astronomy Engine 2.1.19.
- Event calculation: topocentric geometric altitude crossing at 0°, with atmospheric refraction explicitly disabled for the horizon-crossing comparison.
- For each source record, the published local date and clock time are treated as the reference instant. The nearest matching geometric rise/set crossing within ±2 hours is calculated independently; the source instant is not used to tune coordinates or the ephemeris.
- The separate Schaefer (1985) visibility diagnostic uses apparent/refraction-corrected coordinates and assumed atmospheric parameters. It is not blended with the geometric crossing.

## Source-time agreement

| Year | Drik Tara Udaya | Calculated geometric rise | Difference | Drik Tara Asta | Calculated geometric set | Difference |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | 7 Sep 04:41 | 7 Sep 04:40 | −0.73 min | 14 Apr 19:46 | 14 Apr 19:47 | +1.87 min |
| 2025 | 7 Sep 04:43 | 7 Sep 04:41 | −1.74 min | 15 Apr 19:44 | 15 Apr 19:44 | +0.90 min |
| 2026 | 7 Sep 04:44 | 7 Sep 04:42 | −1.77 min | 15 Apr 19:44 | 15 Apr 19:45 | +1.87 min |
| 2027 | 7 Sep 04:45 | 7 Sep 04:43 | −1.79 min | 15 Apr 19:45 | 15 Apr 19:46 | +1.82 min |
| 2028 | 7 Sep 04:41 | 7 Sep 04:40 | −0.73 min | 14 Apr 19:46 | 14 Apr 19:47 | +1.79 min |
| 2029 | 7 Sep 04:43 | 7 Sep 04:41 | −1.74 min | 15 Apr 19:44 | 15 Apr 19:44 | +0.82 min |
| 2030 | 7 Sep 04:44 | 7 Sep 04:42 | −1.76 min | 15 Apr 19:44 | 15 Apr 19:45 | +1.77 min |

Across all 14 boundaries:
- Mean absolute clock-time difference: 1.51 minutes.
- Maximum absolute clock-time difference: 1.87 minutes.
- Rise crossings are on the eastern horizon; set crossings are on the western horizon.

The year/date columns above preserve the Drik source event dates. The geometric calculation validates the time on that supplied date; it does not derive the date independently.

## Geometric horizon event versus naked-eye visibility

The source's geometric rise/set time and a modern first/last naked-eye visibility time are different events.

At all 14 Drik source instants, the Schaefer visibility model returned **not visible** for the assumed Pithoragarh atmosphere. Visibility margins ranged from −0.306 to −1.229 magnitudes. The geometric altitude at the source times was close to 0° (roughly 0.06°–0.16° unrefracted), as expected for a horizon crossing.

The separate Schaefer diagnostic found:
- Morning first-visible candidates around 05:04–05:10 IST on 6 or 7 September, depending on year.
- Evening last-visible candidates around 19:12–19:20 IST on 16 or 17 April, depending on year.

These are model-dependent visibility candidates, not Drik Tara Udaya/Tara Asta events. They depend on assumed extinction and limiting magnitude and omit measured terrain skyline, local weather, buildings, light pollution and observer eyesight.

## Project decision

1. Keep Drik's traditional Agastya Arghya/Tara Udaya/Tara Asta records as their own event definition.
2. Use geometric Canopus rise/set crossings as the validated method for calculating the local clock time on a supplied event date.
3. Do not relabel these times as first naked-eye visibility.
4. Do not use the Schaefer candidate dates to overwrite the traditional Drik date series.
5. Keep the annual date-selection rule separate. The current comparison does not prove how Drik chooses 7 September for Tara Udaya or 14/15 April for Tara Asta.
6. No production data or Panchang UI is changed by this report.

**Status:** research-only validation; clock-time calculation passes the current city-label comparison within 1.87 minutes; annual date selection remains a separate research task.
