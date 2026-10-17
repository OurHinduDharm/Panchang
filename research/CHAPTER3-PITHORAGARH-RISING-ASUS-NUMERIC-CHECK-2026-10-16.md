# Chapter III numerical rising-asus baseline — Pithoragarh
Date: 2026-10-16
Branch: research/ss-ch9-diagnostic
Status: diagnostic numeric cross-check only; not a validated Chapter IX event result.

## Why this pass exists
The Chapter III source (Burgess translation, III.43–46) states:
- III.43: derive the Lanka/equatorial rising-times from the sine arcs of one, two, and three signs.
- III.44: local rising-times are the Lanka values diminished by the applicable local carakhaṇḍa.
- III.45: construct the complementary signs in reverse order with their corresponding reversed ascensional corrections.
- III.46: interpolate the ascensional equivalent of the degrees traversed within a sign in proportion to degrees/30.

Source: https://www.swaveda.com/texts/surya-siddhanta/3/ (source page labels these as 3.43–3.46).

## Reproducible inputs
- Latitude: 29.5828° N.
- Longitude is not used for the sign rising-asus table; it enters the event-time and local-time calculation elsewhere.
- Classical sine-table parameters discussed in the Chapter II research: radius 3438; greatest-declination sine 1397.
- Implied obliquity from these sine-table values: asin(1397/3438) = 23.975181904°.
- A separate rounded 24.000000° sensitivity calculation is retained for comparison.

## Important method boundary
The numbers below are an independent spherical-trigonometry baseline using exact analytical functions:
1. ecliptic longitude at each sign boundary;
2. equatorial right ascension at that boundary for the stated obliquity;
3. declination from the ecliptic longitude;
4. ascensional difference from latitude and declination;
5. oblique-ascension arc across each 30° sign, converted at 60 prāṇas per degree.

This is **not yet a literal sine-table execution** of the Chapter III procedure. It is a cross-check of the geometry and of the existing research helper's analytical approach. It does not prove that the source's integer rising-asus table and carakhaṇḍa interpolation are implemented identically. Do not use it as a final event-time answer.

## Sign rising-asus at Pithoragarh latitude

| Rāśi | With 3438/1397 implied obliquity (23.9751819°) | Rounded 24° comparison | Difference (table-derived minus 24°) |
|---|---:|---:|---:|
| Meṣa | 1262.915 | 1262.227 | +0.688 |
| Vṛṣabha | 1460.472 | 1460.025 | +0.446 |
| Mithuna | 1799.248 | 1799.336 | −0.088 |
| Karkaṭa | 2075.244 | 2075.755 | −0.511 |
| Siṃha | 2127.438 | 2127.833 | −0.395 |
| Kanyā | 2074.684 | 2074.825 | −0.141 |
| Tulā | 2074.684 | 2074.825 | −0.141 |
| Vṛścika | 2127.438 | 2127.833 | −0.395 |
| Dhanu | 2075.244 | 2075.755 | −0.511 |
| Makara | 1799.248 | 1799.336 | −0.088 |
| Kumbha | 1460.472 | 1460.025 | +0.446 |
| Mīna | 1262.915 | 1262.227 | +0.688 |
| **Total** | **21600.000** | **21600.000** | **0.000** |

The 21600-prāṇa sum is a full 360° circle at 60 prāṇas per degree. The symmetry of opposite signs is expected for this spherical model.

## Equatorial control
At latitude 0°, the same analytical calculation gives the first three sign arcs:
- Meṣa: 1668.799 prāṇas
- Vṛṣabha: 1793.955 prāṇas
- Mithuna: 1937.246 prāṇas

The source's rounded/tabulated figures are 1670, 1795, and 1935 respectively (III.44 in the Swaveda/Burgess page's displayed numbering). Differences are small and consistent with the source's table/rounding, but this alone is not proof of exact sine-table interpolation.

## What the test establishes
- The existing analytical rising-asus method gives a coherent local sign table, sums to 21600 prāṇas, and is symmetric across opposite signs.
- Changing obliquity from 24° to the Chapter II sine-table implied value changes individual local sign values by less than 0.7 prāṇa in this fixture.
- Therefore, the present ~22° meridian-frame discrepancy is not caused by this small obliquity-parameter difference. The unresolved discrepancy remains a coordinate-frame convention question, not an ordinary rounding issue.

## Next test required before treating Chapter III as closed
Implement the literal source route in a separate reference function:
1. use the selected Chapter II sine-table radius and values/interpolation;
2. calculate Lanka udayāsus from the prescribed sine arcs and successive differences;
3. calculate local carakhaṇḍa terms with explicit sign conventions;
4. subtract the applicable term for the first group and apply the reverse/add construction for complementary signs exactly as III.44–45 state;
5. compare all 12 values and partial-sign interpolation against this analytical table;
6. test lagnāntara branch/wrap behavior for both eastern and western Chapter IX events.

No production code changed. Do not infer Venus Asta/Udaya times from this table alone.
