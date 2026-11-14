# Heliacal engine options: Swiss Ephemeris independent diagnostic (14 Nov 2026)

## Purpose and decision

This is a research-only comparison of the built-in Swiss Ephemeris heliacal event solver against the captured 2026–2027 city-labelled Guru/Shukra source windows. It does **not** replace the Astronomy Engine candidate engine, change any threshold, or authorize public times.

Swiss Ephemeris is a stronger off-the-shelf candidate for *physical heliacal visibility* than a hand-built solar-depression threshold because it exposes a dedicated `swe_heliacal_ut()` routine. Its documented event types are:
- `HELIACAL_RISING`: morning first
- `HELIACAL_SETTING`: evening last
- `EVENING_FIRST`: evening first (including Venus)
- `MORNING_LAST`: morning last (including Venus)

It accepts longitude, latitude and observer elevation; pressure, temperature, relative humidity and meteorological range; and observer age/Snellen ratio. The documented latitude range is 60°S–60°N, which includes all five research observers. It also documents unusual Venus transition sequences and limitations at high latitudes.

Official programmer documentation: https://www.astro.com/swisseph/swephprg.htm

## Why it is not being integrated

Swiss Ephemeris is distributed under a dual-license choice:
1. AGPL, which requires the distributed/network-served project using it to be AGPL or a compatible license; or
2. the paid Swiss Ephemeris Professional License.

The OurHinduDharm/Panchang repository currently has no root `LICENSE` file. It would be irresponsible to add a runtime dependency before the project-license consequences are deliberately settled. No Swiss Ephemeris package, WASM binary or AGPL-dependent code was added to the Panchang runtime or CI.

License source: https://www.astro.com/swisseph/swissephprg.htm#licensing

## Independent test configuration

- Engine: Swiss Ephemeris 2.10.03, Python binding, Moshier ephemeris flag.
- API: `swe_heliacal_ut()`.
- Atmosphere: all-zero atmospheric input, which invokes library defaults (1013.25 hPa, 15°C, 40% RH, pressure adjusted for observer elevation; extinction coefficient computed by the library).
- Observer: age 36, Snellen ratio 1.0, naked-eye defaults.
- Pithoragarh observer: 29.5828°N, 80.2182°E, 1650 m.
- Other cities: the pinned OSM city-centre coordinates and Copernicus DEM elevations in `data/city-observer-profiles-2026-11-14.json`.
- Event mapping:
  - Jupiter: AstaStart = evening last; AstaEnd = morning first.
  - Venus inferior conjunction: AstaStart = evening last; AstaEnd = morning first.
  - Venus superior conjunction: AstaStart = morning last; AstaEnd = evening first.
- Search anchor: independently computed conjunction time minus 65 days for AstaStart, plus 12 hours for AstaEnd. The Drik timestamp is not used to select the event; it is used only after calculation to measure the difference.

The atmospheric and eyesight inputs are assumptions, not local weather or measured observer characteristics.

## City-wise comparison against the captured Drik boundaries

Absolute timestamp error, all eight boundaries per city:

| City | Resolved / 8 | Within 15 min | Within 1 hour | Within 1 day | Mean absolute error | Maximum error |
|---|---:|---:|---:|---:|---:|---:|
| New Delhi | 8 | 0 | 0 | 0 | 7.88 days | 18.00 days |
| Mumbai | 8 | 0 | 0 | 0 | 8.13 days | 17.00 days |
| Ujjain | 8 | 0 | 0 | 0 | 7.00 days | 15.00 days |
| Varanasi | 8 | 0 | 0 | 0 | 8.50 days | 19.00 days |
| Pithoragarh | 8 | 0 | 1 | 1 | 3.75 days | 9.00 days |

These errors show that the default Swiss Ephemeris visibility model is **not a drop-in replacement for the captured Drik rules**. This does not establish that either engine is wrong: the two products may operationalize “asta/udaya” with different visibility assumptions, and the Swiss result depends on atmospheric and observer inputs.

### Pithoragarh examples

| Event | Drik source (UTC) | Swiss result (UTC) | Difference |
|---|---|---|---:|
| Jupiter 2026 AstaStart | 15 Jul 14:19 | 11 Jul 14:12 | −96 h |
| Jupiter 2026 AstaEnd | 11 Aug 23:19 | 12 Aug 23:35 | +24 h |
| Venus 2026 AstaStart | 12 Oct 12:35 | 11 Oct 12:23 | −24 h |
| Venus 2026 AstaEnd | 29 Oct 00:19 | 29 Oct 00:35 | +17 min |
| Venus 2027 AstaStart (superior-conjunction cycle) | 20 Jul 23:24 | 11 Jul 23:28 | −216 h |
| Venus 2027 AstaEnd (superior-conjunction cycle) | 9 Sep 13:18 | 18 Sep 12:57 | +216 h |

The close Venus 2026 rising result is encouraging, but it is one case and must not be generalized. The 2027 superior-conjunction Venus pair differs by about nine days in both directions under the documented default observer/atmosphere settings.

## Engineering conclusion

1. Keep the existing city-aware candidate generator as research-only; do not tune it from these Swiss outputs.
2. Keep Swiss Ephemeris as an independent scientific comparator, not a production dependency, until the project license decision is made and same-location historical observations are available.
3. Separate the product definition into two explicitly named outputs if needed:
   - astronomical / Panchang Asta-Udaya rule (the rule used by a source such as Drik); and
   - physically modelled heliacal first/last naked-eye visibility (weather and observer dependent).
4. A date/time must not be accepted merely because two engines agree. Acceptance requires a declared event definition, correct conjunction/event branch, a sufficiently populated same-location validation set, and separate date and clock-time error limits.
5. No value in this report is publication-eligible.

## Sources

- Swiss Ephemeris programming interface and event types: https://www.astro.com/swisseph/swephprg.htm
- Swiss Ephemeris AGPL / Professional dual license: https://www.astro.com/swisseph/swissephprg.htm#licensing
- Schaefer heliacal-rise research citation: https://doi.org/10.1177/002182868701801103
- IMD/PAC independent national central-station reference: https://packolkata.imd.gov.in/panchang/en/helical
