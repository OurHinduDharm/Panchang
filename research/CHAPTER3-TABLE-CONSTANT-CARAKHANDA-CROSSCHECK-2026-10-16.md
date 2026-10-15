# Chapter III — Table-constant plus analytical carakhaṇḍa cross-check
Date: 2026-10-16
Branch: research/ss-ch9-diagnostic
Status: mixed-method diagnostic only; not a pure Siddhāntic result and not for production.

## Purpose
Test the Chapter III.43–45 sign construction while preserving the text's rounded Laṅkā constants, and compare against exact analytical oblique ascension. This isolates the effect of using the text's table constants from the geometry used to estimate the local ascensional difference.

## Source and constants
The Burgess-aligned Chapter III text gives Laṅkā rising-times 1670, 1795, and 1935 prāṇas for Aries, Taurus, and Gemini (III.44), after the sine-arc procedure in III.43. Local values subtract the appropriate carakhaṇḍa; the Cancer group is formed by reversing the first three and adding the reversed corrections; the remaining signs follow in reverse order (III.44–45).
Source: https://www.swaveda.com/texts/surya-siddhanta/3/
A second edition/search rendering shows the same three constants and describes the sine-table route: https://soolabablog.com/wp-content/uploads/2019/12/surya-siddhanta_siddhanta-siromani-sbsg-dannavir.pdf

Inputs:
- Latitude: 29.5828° N.
- Classical sine-table radius: 3438.
- Greatest-declination sine: 1397.
- Implied obliquity: asin(1397/3438) = 23.9751819037°.
- Source Laṅkā constants: [1670, 1795, 1935] prāṇas.

## Important limitation
For this diagnostic only, carakhaṇḍa is estimated as:
`equatorial analytical OA for sign − local analytical OA for sign`.
This is a geometry-derived comparator, not a literal Chapter III sine-table derivation of carakhaṇḍa. The resulting table is a hybrid: source rounded constants + analytically derived local correction. It must not be labelled the exact classical table or used as a final Chapter IX event result.

## Intermediate values
| First-quadrant sign | Source Laṅkā value | Equatorial analytical OA | Local analytical OA | Estimated carakhaṇḍa | Table constant adjusted by estimated carakhaṇḍa |
|---|---:|---:|---:|---:|---:|
| Aries | 1670.000 | 1668.799 | 1262.915 | 405.885 | 1264.115 |
| Taurus | 1795.000 | 1793.955 | 1460.472 | 333.483 | 1461.517 |
| Gemini | 1935.000 | 1937.246 | 1799.248 | 137.998 | 1797.002 |

All values are prāṇas; analytical values are unrounded internally.

## Derived 12-sign table (hybrid diagnostic)
| Sign | Hybrid value | Exact analytical OA comparator | Hybrid − analytical |
|---|---:|---:|---:|
| Aries | 1264.115 | 1262.915 | +1.201 |
| Taurus | 1461.517 | 1460.472 | +1.045 |
| Gemini | 1797.002 | 1799.248 | −2.246 |
| Cancer | 2073.000 | 2075.244 | −2.246 |
| Leo | 2128.483 | 2127.438 | +1.045 |
| Virgo | 2075.885 | 2074.684 | +1.201 |
| Libra | 2075.885 | 2074.684 | +1.201 |
| Scorpio | 2128.483 | 2127.438 | +1.045 |
| Sagittarius | 2073.000 | 2075.244 | −2.246 |
| Capricorn | 1797.002 | 1799.248 | −2.246 |
| Aquarius | 1461.517 | 1460.472 | +1.045 |
| Pisces | 1264.115 | 1262.915 | +1.201 |
| **Total** | **21600.000** | **21600.000** | **0.000** |

The total remains 21600 prāṇas because of the construction's opposite-sign symmetry; that invariant alone does not validate the individual sign values.

## Findings
1. Keeping the text's Laṅkā constants while applying analytical carakhaṇḍa shifts individual values by roughly 1–2.25 prāṇas relative to exact analytical OA.
2. The error pattern is consistent with the source constants being rounded/table-derived and with this mixed-method procedure not being identical to exact analytical OA.
3. This table is useful as a comparator but is not evidence that the source's exact sine-table algorithm has been reproduced.
4. The small rising-asus differences do not explain the prior ~22° local-meridian angle discrepancy.

## Next work required
- Implement the actual Chapter III.42–45 sine-table sequence, including the text's day-radius/sine intermediates and arc conversion, then derive the local carakhaṇḍa with the source-prescribed construction rather than from analytical OA.
- Cross-check the exact edition/verse numbering (the Burgess-aligned Swaveda page numbers these as III.43–45; some editions shift the displayed numbering).
- Only then feed the verified rising-asus into the Chapter IX.10–11 time conversion.
- Continue to keep classical estimate, numerical boundary interpolation, modern apparent visibility, and Ganesh Martand references separate.
- Production files `app.js` and `extra-panchang.js` remain untouched.
