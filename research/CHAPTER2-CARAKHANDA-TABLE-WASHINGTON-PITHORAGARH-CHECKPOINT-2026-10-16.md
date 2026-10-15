# Chapter II carakhanda — table and latitude comparator checkpoint
Date: 2026-10-16
Branch: `research/ss-ch9-diagnostic`
Status: diagnostic checkpoint only; not a literal table implementation and not production-ready.

## Source basis
- Burgess, *Sūrya-siddhānta*, Chapter II, verses 15–22: https://www.swaveda.com/texts/surya-siddhanta/2/
- Chapter II.60–63 and the construction of kṣitijyā / cara: https://www.siva.sh/surya-siddhanta/2/61
- Burgess's Chapter III commentary and Washington rising-asus table: https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf

The traditional sine radius is 3438 and the table interval is 225 arcminutes (3°45′). The 25 nodes, including 0° and 90°, are stored in `ss_chapter2_carakhanda_equation_diagnostic.js` as rounded historical values:
`0, 225, 449, 671, 890, 1105, 1315, 1520, 1719, 1910, 2093, 2267, 2431, 2585, 2728, 2859, 2978, 3084, 3177, 3256, 3321, 3372, 3409, 3431, 3438`.

Linear interpolation between those nodes gives 1397 at 24° (the traditional obliquity fixture). This confirms the table's coarse interpolation behavior, not the exact historic rounding sequence for every intermediate quantity.

## Washington benchmark — geometry comparator only
Burgess reports local ascensional differences of 578, 1061, and 1263 prāṇas for the three sign boundaries, at Washington, under the 24° obliquity construction. A continuous-trigonometric geometry comparator at latitude 38.9°N gives:

| Ecliptic longitude | Continuous comparator (prāṇas) | Printed benchmark |
|---:|---:|---:|
| 30° | 578.8984 | 578 |
| 60° | 1060.7596 | 1061 |
| 90° | 1263.2643 | 1263 |

The first point differs by 0.90 prāṇa from the printed integer. The current test's ±1.5 tolerance is a sanity check for geometry only; it is **not** proof that the traditional integer sine-table algorithm has been reproduced. The comparator uses the continuous identity `asin(tan(latitude) × tan(declination))` and therefore must never be described as the source's literal algorithm.

## Pithoragarh baseline
Using the same 24° obliquity fixture and latitude 29.5828°N, the continuous comparator gives:

| Ecliptic longitude | Declination | Ascensional difference |
|---:|---:|---:|
| 30° | 11.7340° | 406.2991 prāṇas |
| 60° | 20.6246° | 740.2028 prāṇas |
| 90° | 24.0000° | 878.4123 prāṇas |

These are a baseline for comparing the table-based calculation once its precise interpolation and rounding order are established. They are not final local carakhanda values.

## Next gates
1. Transcribe Burgess's exact sine-table construction and intermediate rounding conventions, not merely the final 24 table nodes.
2. Derive the equinoctial shadow under the same gnomon convention and verify its use for the Washington example.
3. Implement a separate integer/table path alongside the continuous comparator; never silently substitute one for the other.
4. Reproduce Washington's three printed values from the source inputs and documented table operations.
5. Only after that, use the source-faithful Chapter II carakhanda in the Chapter III rising-asus calculation. Keep `app.js` and `extra-panchang.js` untouched.
