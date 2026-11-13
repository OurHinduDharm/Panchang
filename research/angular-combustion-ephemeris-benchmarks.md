# Geocentric angular-combustion engine: first real-ephemeris benchmark

Generated with `astronomy-engine@2.1.19` through the PR #358 research modules.

## Method implemented

- Apparent geocentric ecliptic longitude of the planet is derived from `GeoVector(body, date, true)` followed by `Ecliptic(...)`.
- Planet-Sun separation for combustion is the smaller absolute difference returned by `PairLongitude(body, "Sun", date)`. This is ecliptic longitude separation, not 3-D great-circle separation.
- Direct/retrograde state is determined from the rate of change of geocentric apparent ecliptic longitude. Station instants are bracketed and refined by bisection.
- Threshold intervals are split at actual station instants. Venus uses 10° direct / 8° retrograde; Jupiter uses 11° in both states for this benchmark.
- Boundary instants are refined to 1 second numerically. This is solver precision, not a claim of 1-second ephemeris accuracy.

## Real ephemeris results

All times below are converted from UTC to Indian Standard Time (UTC+05:30).

### Venus

| Event | UTC | IST | Threshold / state |
|---|---|---|---|
| 2026 Asta start | 2026-10-19 02:40:40.832 | 2026-10-19 08:10:40.832 | 8°, retrograde |
| 2026 Udaya | 2026-10-29 04:05:35.632 | 2026-10-29 09:35:35.632 | 8°, retrograde |
| 2027 Asta start | 2027-07-06 15:09:29.861 | 2027-07-06 20:39:29.861 | 10°, direct |
| 2027 Udaya | 2027-09-17 17:18:16.105 | 2027-09-17 22:48:16.105 | 10°, direct |

2026 independent angular-combustion cross-check:
- FSVS published Venus combustion: 19 Oct 2026 08:15 IST to 29 Oct 2026 09:39 IST.
- Engine result: 08:10:40 to 09:35:35 IST.
- Differences: engine is about 4m19s earlier at the start and 3m24s earlier at the end.
- Detected Venus direct-to-retrograde station: 3 Oct 2026 12:40:08 IST; FSVS lists retrograde beginning around 12:44 IST, a difference of about 4 minutes.

This is a strong cross-check for the 8° retrograde angular rule in this 2026 case. It does not prove that every Panchang's Asta/Udaya label uses this same event definition.

2027 comparison:
- User-supplied Pithoragarh Drik visible-window reference: 21 Jul 2027 04:54 to 9 Sep 2027 18:48.
- Panchang Guru New Delhi local set/rise reference: 21 Jul 2027 05:08 to 9 Sep 2027 19:00.
- The 10° direct angular model instead crosses on 6 Jul 20:39 and 17 Sep 22:48 IST.
- This large difference is evidence that those published 2027 windows are not interchangeable with this fixed angular-combustion boundary. Do not substitute one for the other.

### Jupiter

| Event | UTC | IST | Threshold / state |
|---|---|---|---|
| 2026 Asta start | 2026-07-14 12:33:15.007 | 2026-07-14 18:03:15.007 | 11°, direct |
| 2026 Udaya | 2026-08-13 10:22:23.517 | 2026-08-13 15:52:23.517 | 11°, direct |
| 2027 Asta start | 2027-08-16 14:12:43.220 | 2027-08-16 19:42:43.220 | 11°, direct |
| 2027 Udaya | 2027-09-14 21:43:05.632 | 2027-09-15 03:13:05.632 | 11°, direct |

2027 Panchang Guru New Delhi local set/rise reference: 17 Aug 19:32 to 13 Sep 05:22 IST. The angular model differs by roughly one day at the start and nearly two days at the end. This again confirms that an angular combustion threshold is not automatically a local heliacal visibility event.

## Interpretation and limits

1. The geocentric angular solver and motion-state/station detector now work with real ephemeris positions; they are no longer only fake-adapter unit tests.
2. The 2026 Venus 8° retrograde result independently agrees closely with FSVS published angular-combustion times.
3. The 2027 Venus and Jupiter comparisons show why local visible disappearance/reappearance must remain a separate model.
4. Geocentric angular events do not change with the observer's city in the same way local horizon visibility does. Pithoragarh's elevation and terrain belong in the separate topocentric visibility engine, not in this angular threshold.
5. The one-second bisection tolerance describes numerical root refinement only. Ephemeris model error, source convention, rounding and threshold choice remain.
6. These results are research outputs only. They are not yet published into the live Panchang or annual page.

## Next validation work

- Extend the real-ephemeris benchmark to more historical and future years, including both Venus motion states.
- Compare source-defined angular combustion events separately from published local set/rise windows.
- Build a topocentric heliacal model with twilight, apparent altitude, magnitude/phase, extinction and a measured terrain horizon.
- Validate Agastya independently against the cited Indian Journal of History of Science visibility study and location-specific observations.
