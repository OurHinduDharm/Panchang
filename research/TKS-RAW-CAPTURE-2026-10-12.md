# TKS Raw Ephemeris Capture — 12 October 2026

**Purpose:** preserve user-supplied raw Sun/Venus states for the Sūrya-siddhānta Chapter VII/IX audit. This is a research fixture, not a production event-date specification.

## Capture metadata

- Place label: Pithoragarh
- TKS coordinates: 29.5830° N, 80.2090° E
- Time zone: IST (UTC+05:30)
- Engine reported by API: TKS Ephemeris; active kernel DE440
- Both bodies returned HTTP 200, `success: true`, and the requested `selected_body`.
- The two times are near sunrise and at the computed sunset, respectively. They are not the same as the site's preferred coordinates/elevation (29.5828° N, 80.2182° E, 1650 m); do not silently equate the observers.

## Raw state values

| Field | 2026-10-12 06:08:39 IST | 2026-10-12 17:42:21 IST |
|---|---:|---:|
| JD UTC/UT1 | 2461325.526840278 | 2461326.008576389 |
| Sun apparent ecliptic longitude | 198.7127606838° | 199.1894701402° |
| Venus apparent ecliptic longitude | 216.9912725889° | 216.8222889076° |
| Venus apparent ecliptic latitude | −7.5758431933° | −7.5711271882° |
| Ecliptic longitude difference, Venus − Sun | 18.2785119050° | 17.6328187675° |
| Sun RA (reported `ra_deg`) | 196.9137474872° | 197.3582525775° |
| Sun declination (reported `dec_deg`) | −7.1876196192° | −7.3688025867° |
| Venus RA (reported `ra_deg`) | 211.6277669704° | 211.4610598332° |
| Venus declination (reported `dec_deg`) | −20.8610476316° | −20.7993339930° |
| 3-D angular separation from paired RA/Dec | 19.7365905601° | 19.1419206097° |

The same separation computed using each body's `ra_of_date_deg`/`dec_of_date_deg` pair is also 19.7365905601° at sunrise and 19.1419206097° at sunset (within floating-point precision). Do not mix an `ra_deg` value with a `ra_of_date_deg` value.

## Derived comparison

- The ecliptic-longitude difference decreases by **0.6456931376°** from the morning sample to the evening sample.
- The 3-D angular separation decreases by **0.5946699504°** over the same interval.
- These are different geometric quantities. Venus's ecliptic latitude is about −7.57°, so longitude difference alone is not the Sun–Venus angular distance.
- TKS `sun_day` reports sunrise at 06.144195 h (about 06:08:39.102 IST) and sunset at 17.705795 h (about 17:42:20.862 IST). The morning sample is within about 0.1 seconds of the reported sunrise; the evening sample is within about 0.1 seconds of the reported sunset.

## Interpretation boundary

This capture does **not** include the separate TKS classical lagnāntara/K/C panel result. Therefore it cannot validate the classical Asta/Udaya threshold or establish that the Sun–Venus angular distance should equal the Chapter IX threshold. The roughly 19° 3-D separation at sunset is not near the 8°/10° Chapter IX Venus limits; this is a clear reminder that the raw angular-distance model and the classical K-based model must not be conflated.

The samples are useful for checking time/JD conversion, returned-body identity, apparent-state consistency, and the difference between Δλ and 3-D separation. They are not proof of a final Venus Asta date.

## Site-display decision

The site's Asta/Udaya card should be visible, but until the classical event calculation passes the independent validation gate it must show a transparent Hindi status such as **“शास्त्रीय गणना सत्यापनाधीन”** rather than publishing an unverified date as fact. A clearly separated preliminary/modern estimate may be added only with an explicit model label and source/method disclosure; it must not be presented as the Sūrya-siddhānta result.
