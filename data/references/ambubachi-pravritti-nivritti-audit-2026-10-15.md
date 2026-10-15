# Ambubachi Pravritti–Nivritti: calculation audit

Updated: 2026-10-15  
Branch: `data/festival-json-foundation`  
Status: independent numerical cross-check completed; browser adapter validation still pending.

## Working astronomical definition

Use one sidereal solar-longitude system for both boundaries:

- **Pravritti:** Sun crosses Mithuna 6°40′ sidereal longitude (66°40′ = 66.6666667°), start of Ardra pada 1.
- **Nivritti:** Sun crosses Mithuna 10°00′ sidereal longitude (70°00′), end of Ardra pada 1.
- Do not add 72 hours, divide a lunar nakshatra duration by four, or substitute temple reopening time for this boundary definition.
- Find each crossing independently with a bracketing scan and bisection. Display the local time after converting the UTC instant to the selected display timezone.
- Current numerical audit used Swiss Ephemeris (geocentric Sun, Lahiri sidereal mode) and bisection. This is a **Drik-style calculation convention**, not a claim that every traditional panjika uses the same method.

## Independent Swiss Ephemeris results

Times below are IST (UTC+05:30). Values are rounded to the nearest second.

| Year | Boundary | Calculated IST | Published Vishuddha Siddhanta | Difference |
|---|---|---|---|---|
| 2025 | Pravritti, 66°40′ | 22 Jun 2025, 06:20:00 | 22 Jun, 06:10 | +10 min |
| 2025 | Nivritti, 70°00′ | 25 Jun 2025, 18:09:23 | 25 Jun, 18:10 | −38 sec |
| 2026 | Pravritti, 66°40′ | 22 Jun 2026, 12:26:05 | 22 Jun, 12:16 | +10 min |
| 2026 | Nivritti, 70°00′ | 26 Jun 2026, 00:18:03 | Reported as 25 Jun night 12:18; interpret as midnight rollover to 26 Jun | About 0 sec |

The published values are reported by Anandabazar Patrika:
- 2025: https://www.anandabazar.com/horoscope/date-and-timing-of-ambubachi-2025-dgtl/cid/1611727
- 2026: https://www.anandabazar.com/app/horoscope/date-and-timing-of-ambubachi-2026-dgtl/cid/1694076

The close agreement at both years' Nivritti boundaries supports the (70°00′) solar-longitude endpoint as a useful, reproducible rule. The roughly ten-minute Pravritti difference should be documented as a Drik-versus-panjika computation difference, not silently adjusted.

## Traditional panjika discrepancy: Gupta Press

The same reports give materially different Gupta Press values:
- 2025: Pravritti 22 Jun 14:56:03; Nivritti 25 Jun 03:19:17.
- 2026: Pravritti 22 Jun 21:08:37; Nivritti 26 Jun 09:32:15.

These cannot all be treated as one universal set of solar-longitude crossing times. The 2025 Gupta Press reported interval is also substantially shorter than the 2025 Drik/Lahiri interval, while the 2026 duration is close but shifted. We should preserve these as a separate traditional reference series and not alter our calculated crossings merely to force a match. The 2025 source should be checked against the original printed panjika before drawing a stronger conclusion.

References:
- https://www.anandabazar.com/horoscope/date-and-timing-of-ambubachi-2025-dgtl/cid/1611727
- https://www.anandabazar.com/app/horoscope/date-and-timing-of-ambubachi-2026-dgtl/cid/1694076

## Code and validation status

- `ambubachi-calculation.js`: supports both synchronous and asynchronous longitude providers; both boundaries are independently bisected.
- `ambubachi-validation.html`: browser audit page calls the existing Panchangam-JS library to check the solar-longitude field and calculate 2025/2026. This is a diagnostic page, not the production renderer.
- `tests/ambubachi-calculation.test.js`: includes synthetic tests for the synchronous and asynchronous crossing functions.
- `data/festivals.json`: festival-123 describes the two solar boundaries and does not use temple reopening to determine Nivritti.
- **Not yet completed:** running the JavaScript test file in Node/CI; opening the browser audit page and confirming the library's `planetaryPositions.sun.longitude` semantics and actual outputs; wiring the real provider into the future festival renderer; review before any live Blogger change.

## Decision

Proceed with the (66°40′ ightarrow 70°00′) Drik/Lahiri solar-longitude method as the first explicitly named calculation convention, pending browser-adapter confirmation. Display both event times only after the runtime ephemeris result is validated. Keep Gupta Press/other traditional panjika timings as separately labeled comparison data where useful.
