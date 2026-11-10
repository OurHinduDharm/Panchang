# Pithoragarh Mars 2028 local event geometry — review, 11 November 2026

## Observer and method
- Representative observer: 29.5828° N, 80.2182° E, 1,650 m; Asia/Kolkata.
- Astronomy Engine 2.1.19 topocentric rise/set events were enumerated for Mars from 1 January through 15 June 2028.
- At each event, the diagnostic records refracted-horizon altitude/azimuth, Sun altitude/azimuth, geocentric angular separation, signed relative ecliptic longitude, apparent magnitude and illuminated fraction.
- The calculation is a daily horizon-crossing geometry audit. It is not a fitted heliacal visibility model and is not itself a Tara Asta/Udaya prediction.

## Key local event samples from the first successful geometry pass
| Local date | Event | IST | Sun altitude at Mars horizon event | Mars-Sun angular separation | Apparent magnitude |
|---|---|---:|---:|---:|---:|
| 4 Jan 2028 | Rise | 08:15:38 | +12.5266° | 17.1332° | +1.199 |
| 4 Jan 2028 | Set | 18:38:52 | -15.6104° | 17.0316° | +1.198 |
| 13 Jan 2028 | Rise | 08:05:04 | +10.7093° | 15.0399° | +1.182 |
| 13 Jan 2028 | Set | 18:37:04 | -13.9002° | 14.9387° | +1.181 |
| 5 Jun 2028 | Rise | 04:07:20 | -11.7329° | 16.8392° | +1.397 |
| 5 Jun 2028 | Set | 17:45:21 | +15.6177° | 16.9747° | +1.399 |
| 8 Jun 2028 | Rise | 04:03:05 | -12.3962° | 17.5561° | +1.408 |
| 8 Jun 2028 | Set | 17:43:44 | +16.1883° | 17.6931° | +1.410 |

These samples show why a fixed angular-distance date must not automatically be treated as a local last/first naked-eye visibility instant: on 4 January the daily Mars set occurs with the Sun already 15.6° below the horizon, while around 5–8 June the daily Mars rise occurs during morning twilight. A complete heliacal decision must use the correct morning/evening apparition, signed solar side, twilight state, local altitude and brightness together.

## Published comparison families (not same-place equivalence)
- 17° Surya Siddhanta-style angular-threshold reference: 4 Jan 2028 18:15 to 5 Jun 2028 20:18 IST (published by School of Vedic Sciences; Astromitra publishes a similar interval).
- Siddhanta Ujjain labels published by Divine Nakshatra: Asta 13 Jan 2028 18:44; Udaya 8 Jun 2028 04:55.
- The two published families differ by about nine days at the start and three days at the end. They represent different definitions and/or location/convention; neither is a direct Pithoragarh observed event ledger.
- The IMD Rashtriya Panchanga heliacal page available for 2026–27 is for its Central Station and does not supply a 2028 Pithoragarh boundary pair.

## Interpretation / gate
1. The 17° dates are a useful angular benchmark only; they are not adopted as Pithoragarh event timestamps.
2. The local rise/set samples around 5–8 June are consistent with a morning apparition returning near dawn, but the Sun-altitude samples alone do not prove first naked-eye visibility.
3. The 4 January local set sample cautions against labelling the 17° start as a directly observed disappearance without resolving signed elongation and the exact source convention.
4. Keep the Mars Tara Asta/Udaya model research-only. No public local Tara Asta/Udaya date or time is approved by this diagnostic.
5. Next validation: inspect the signed relative-longitude and azimuth fields from the follow-up run; compare morning/evening event direction against an independent 2028 local sky/heliacal calculation, then require date-level and clock-time holdouts.

## Reproducible code
- `tests/report-mars-pithoragarh-2028-event-geometry.mjs`
- GitHub Actions workflow: `Asta-Udaya phase diagnostics browser test`
