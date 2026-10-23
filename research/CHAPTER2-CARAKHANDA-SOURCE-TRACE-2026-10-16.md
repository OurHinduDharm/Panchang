# Chapter II carakhanda — source trace checkpoint
Date: 2026-10-16
Branch: `research/ss-ch9-diagnostic`
Status: source-trace progress; no production changes.

## 1. Primary-source finding

Burgess, *Translation of the Sūrya-siddhānta* (1860), commentary scan, printed page 187 / Wikisource PDF page 190, explicitly says that for Washington at latitude 38°54′ the Hindu-method ascensional differences of points T, G, and C (Fig. 17) are 578′, 1062′, and 288′ respectively. This corrects the loose earlier summary that treated 578, 1061, and 1263 as if the three values were directly the source's T/G/C trio.

Source page: https://sa.wikisource.org/wiki/पृष्ठम्:Surya_siddhanta_(with_commentary).pdf/१९०
Second accessible source for the same translation: https://commons.wikimedia.org/wiki/File:Translation_Of_The_Surya-siddhanta_(IA_in.ernet.dli.2015.96668).pdf

Important: the source's T/G/C are geometric points in Fig. 17. Until the diagram is inspected and the points' declinations/longitudes are mapped, do not equate them with the 30°, 60°, 90° ecliptic-longitude fixture. In particular, 288′ is not interchangeable with the previously used 1263-prāṇa third fixture.

## 2. Chapter II.60–61 computation path (textual)

The source describes the following chain:
1. From declination, obtain its sine and versed sine.
2. Day-radius (dyujyā) = radius minus versed sine of declination.
3. Equinoctial shadow is the base of a 12-digit gnomon when the Sun is on the equator and meridian.
4. Earth-sine (kṣitijyā) = sine of declination × equinoctial shadow / 12.
5. Sine of cara = earth-sine × radius / day-radius.
6. Convert that sine to its corresponding arc; the arc in minutes is the ascensional difference in prāṇas.

Reference: https://www.siva.sh/surya-siddhanta/2/61

The current JavaScript research helper implements the continuous trigonometric identity as an independent comparator. It does not yet prove the historical sine-table interpolation and intermediate rounding sequence. The table-based implementation must remain separate.

## 3. What is now established vs open

Established from source text:
- Sine radius 3438 and 24 intervals of 225′ (3°45′) in the Chapter II table.
- The earth-sine / day-radius / sine-of-cara chain in II.60–61.
- Burgess's Washington T/G/C comparator values 578′, 1062′, 288′.

Still open:
- Figure 17 geometry and exact declination of T, G, and C.
- Whether the reported T/G/C values are based on a particular rounded table sequence, and the exact intermediate rounding.
- A literal table-path implementation that reproduces those source-defined values.
- Only after those gates: source-faithful local cara and Chapter III rising-asus values for Pithoragarh.

## 4. Guardrails

- Do not use the continuous comparator's close values as proof of the literal traditional algorithm.
- Do not relabel the T/G/C trio as 30°/60°/90° values.
- Do not edit `app.js` or `extra-panchang.js`.
- Do not declare any Asta/Udaya date final based on this incomplete source trace.
