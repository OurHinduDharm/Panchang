# Drik-Ganita Tara Asta/Udaya calculation model

Status: research prototype; not connected to the public Panchang yet.

## Agreed product rule

The public site will expose one calculation method only: **दृक्-गणितीय उदय-अस्त**.

Primary calibration references:
- Drik Panchang published Guru/Shukra/Agastya events.
- Ganesh Martand Panchang (दृक्गणित), Almora.
- Drik Almora/Ramnagar city references where supplied.

Tara Prasad is a secondary independent cross-check. TKS Surya-Siddhanta and photometric data are excluded from model calibration. No third physical-visibility option is planned.

## Candidate Drik-Ganita calculation

Use a modern apparent ephemeris and the exact observer coordinates. For a given civil day and horizon branch:

1. Find the Sun's standard apparent rise/set event for the selected horizon branch.
2. Find the planet's corresponding apparent rise/set event at the same observer.
3. Calculate the absolute time separation in minutes.
4. Convert the time gap to degrees of Earth rotation using one mean sidereal day divided by 360. This is a general time-unit conversion, not a Surya-Siddhanta formula.
5. Compare that value with a body/event/branch threshold calibrated from accepted Drik and Ganesh Martand observations.
6. Detect downward threshold crossings as Asta and upward crossings as Udaya. The interpolated event instant is based on the planet's horizon-crossing time.

The model uses Astronomy Engine's standard local rise/set event calculation for both Sun and target. This includes the library's conventional apparent horizon treatment; it does not calculate first/last naked-eye heliacal visibility, brightness, atmospheric extinction or sky background. It is not the Surya-Siddhanta Ch.9 K/C formula.

The eastern/western horizon branch is selected from the source's printed direction. For Jupiter, where direction is absent in the source, Asta uses setting and Udaya uses rising. Venus direction is never guessed when missing.

## Calibration safeguards

- Source clocks are normalized as local IST, including Ganesh Martand values above 24 hours (for example 34.07 means 10:07 on the following date).
- Ambiguous AM/PM records are excluded instead of guessed.
- Each observation is checked against the target body's computed geometric horizon event.
- Threshold fitting uses only records whose source event time is within 15 minutes of the computed body horizon event; all residuals remain in the report.
- Drik Almora/Ramnagar coordinates are approximate proxies because the exact coordinates selected on the Drik page were not captured. Ganesh Martand's printed Almora centre and Tara Prasad's Ramnagar centre are separately preserved. Elevation is set to 0 m in this first calibration run because the printed calculation-centre metadata did not supply a confirmed elevation; do not treat this as a final hill-station horizon correction.
- Agastya uses a provisional Canopus J2000 position. A pinned astrometric catalogue/proper-motion source is required before production use.

## Data and runtime strategy

- Raw user-transcribed printed observations remain in research/drik-ganita-asta-udaya-benchmarks-2019-2027.json.
- The direct Drik five-city dataset remains separately available in data/drik-planetary-reference-2024-2027.json.
- The first calibration set is India-only and uses IST (+05:30); general IANA timezone resolution must be supplied from the selected location before expanding outside India.
- Research calibration runs in CI, not during the daily Panchang calculation.
- Once the model is accepted, annual events should be precomputed into compact JSON chunks. The public Panchang should only load the relevant city/year chunk lazily; it must not scan years of ephemeris events on every date change.

## Next acceptance gates

1. Confirm source event clocks align with the target's geometric horizon crossings.
2. Compare fitted time-degree thresholds across Ganesh Martand and Drik for the same city/year/event.
3. Hold out the latest years from fitting and verify prediction dates/times independently.
4. Validate Guru and Shukra first; then pin Canopus astrometry and validate Agastya.
5. Only after the back-test passes, build annual precomputed city data and integrate a lightweight lookup into extra-panchang.js.

No public display, Panchang calculation, or main application runtime has been changed in this branch.
