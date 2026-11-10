# Mars upcoming rise/set and Tara Asta cross-check — 10 November 2026

## Scope
This note separates ordinary local daily horizon rise/set from heliacal Tara Asta/Udaya. They are different events and must not share one label or calculation.

## Immediate sky-visibility phase (IMD Rashtriya Panchanga 2026–27)
- 18 Apr 2026–9 Nov 2026: Mars rises after midnight and is visible until morning twilight.
- 10 Nov 2026–18 Feb 2027: Mars rises before midnight and remains visible until morning twilight.
- 19 Feb 2027: visible throughout the night at opposition.
- From 20 Feb 2027: evening-sky object, setting after midnight.
- Source: https://packolkata.imd.gov.in/panchang/en/visibility
- This is the IMD Central Station visibility series, not a Pithoragarh-specific rise/set timetable. Use it as an independent phase benchmark only.

## Published Mars Tara Asta references
- Drik's 2027 New Delhi Mars Tara Asta page displays 0 Asta days and no boundary rows. This is 'no window listed'; do not interpret it as proof that Mars is astronomically visible every moment or as a Pithoragarh result.
- Source: https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html?year=2027
- An independent 2028 sidereal/Surya Siddhanta-style source gives Mars combustion 4 Jan 2028 18:17 IST to 5 Jun 2028 20:19 IST using the 17-degree rule.
- Source: https://fsvs.co.in/panchang/gochar/mangal/2028
- Another independent source distinguishes longitude-based boundaries (4 Jan / 5 Jun) from its Siddhanta Ujjain event labels (13 Jan / 8 Jun). This illustrates that the event definition changes the dates.
- Source: https://divinenakshatra.com/graha/2028/

## Product implementation
- PR #318 adds next local daily Mars rise and set to the Panchang card using Astronomy Engine SearchRiseSet at the user's actual observer coordinates and elevation, starting from the selected Panchang date.
- The row is explicitly labelled daily horizon rise/set. It is not a Tara Asta/Udaya prediction.
- No New Delhi fallback, fixed 17-degree threshold, or unsupported Pithoragarh future date is inserted.

## Next research gate for local Mars Tara Asta/Udaya
1. Capture a correct-year direct Mars Asta page for Pithoragarh when the provider renders the requested year; the 2028 requested pages previously rendered 2027 and must remain quarantined.
2. Enumerate all Mars local rise and set events around each published boundary (at least ±3 civil days) and associate the correct apparition by event direction and solar geometry.
3. Reconcile local apparent altitude crossing and source date assignment; keep Central Station IMD heliacal labels separate from Drik Tara Asta labels.
4. Do not publish a local 2028 Pithoragarh Tara Asta/Udaya timestamp until exact-date and event-direction holdouts pass.

## Status
Daily Mars rise/set UI is implemented in a separate main-based PR (#318); CI is running. The future Mars Tara Asta/Udaya local prediction remains research-only and is not yet approved for public display.
## 10 November follow-up: year-specific Mars Asta cross-check

- Drik Panchang's direct New Delhi Mars Asta page for 2027 explicitly reports `Total Asta Days In Year = 0 Days` and shows no boundary rows. This is a source-specific no-window result, not a Pithoragarh observation. The page states that its approximate Surya Siddhanta 17° rule differs from its modern location-aware algorithm.
- Direct page: https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html?year=2027
- Astromitra independently reports Mars is not combust in 2027 and that the next combustion begins 4 Jan 2028. This agrees with the Drik 2027 no-window statement at the year level, but it is not an independent local heliacal visibility observation.
- Source: https://www.astromitra.com/transit/combust-planets/2027/
- For 2028, School of Vedic Sciences lists 4 Jan 2028 18:15 to 5 Jun 2028 20:18 IST using the 17° Surya Siddhanta rule, and explicitly notes that practice varies. Astromitra independently publishes nearly identical times. These two sources are consistent with each other but may share the same angular-threshold convention; they are not proof of local visibility.
- Sources: https://fsvs.co.in/panchang/gochar/mangal/2028 and https://www.astromitra.com/transit/combust-planets/2028/
- Divine Nakshatra explicitly separates longitude-threshold dates (4 Jan / 5 Jun) from Siddhanta Ujjain labels (13 Jan / 8 Jun). That nine-day start offset is direct evidence that '17° combustion' and Siddhanta local visibility event are not interchangeable.
- Source: https://divinenakshatra.com/graha/2028/
- IMD Rashtriya Panchang's 2026–27 Central Station heliacal table lists Mars 'Rises in the east' on 17 Apr 2026 at 25:49 IST (i.e. after midnight into 18 Apr). It lists no Mars boundary later in its published 2026–27 table. This is a central-station heliacal event series, not a Pithoragarh Tara Asta pair.
- Source: https://packolkata.imd.gov.in/panchang/en/helical

### Updated interpretation
1. 2027 is a useful negative/control year for the 17° combustion family: direct Drik and Astromitra both say no Mars Asta/combustion window in 2027.
2. 2028 is a positive angular-threshold case, with a roughly five-month 17° interval. Do not copy its dates into the Pithoragarh heliacal engine.
3. The IMD Central Station heliacal event cannot be compared as a simple start/end pair against the Drik 17° interval without reconstructing event direction and source convention.
4. The Pithoragarh Mars local visibility model remains research-only until a direct local event ledger and holdout validation exist. The new daily Mars rise/set UI remains a separate, already merged horizon-event feature.