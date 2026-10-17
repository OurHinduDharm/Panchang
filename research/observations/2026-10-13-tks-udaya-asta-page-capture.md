# TKS Udaya-Asta page capture — 13 October 2026

**Project:** OurHinduDharm — Sūrya-siddhānta Chapter 9 Asta/Udaya research  
**Branch:** `research/ss-ch9-diagnostic`  
**Status:** user-supplied page transcription; research only, not a validated reference dataset.  
**Production safety:** Do not modify `app.js` or `extra-panchang.js` from these values.

## Source page

- TKS Udaya-asta: https://tksephemeris.com/tks-udaya-asta
- TKS API documentation: https://tksephemeris.com/tks-api
- User supplied the visible page text on 13 October 2026. The displayed page footer says version `bin-1791861207`.
- Page status: **Beta · under development**.
- The page says its primary result is the shāstrīya Sūrya-siddhānta Chapter 9 lagnāntara-asu method: (K = lagnāntara	ext{-}asu / 60), visible iff (K > C), using TKS apparent longitudes. Arcus visionis and Schaefer are separate models; elongation-orb heliacal results are also separate.

## Body order confirmed by the user

1. Venus — शुक्र
2. Mercury — बुध
3. Mars — मंगल
4. Jupiter — गुरु / बृहस्पति
5. Saturn — शनि
6. Moon — चन्द्रमा

## Aṣṭāṃśa limits shown on the page

- Moon: 12°
- Mercury: 12° / 14° (the page says the value switches by retrograde/direct motion)
- Venus: 8° / 10° (the page says the value switches by retrograde/direct motion)
- Mars: 17°
- Jupiter: 11°
- Saturn: 15°

The event-specific choice between the two Venus/Mercury values must follow the source's classified event/motion rule. Do not assign a threshold solely from the planet name or tune a threshold to match an output.

## Page's “At a glance” result

The user-supplied page excerpt showed Venus, Engine A apparent, shāstrīya state **Asta**, (K=6.57°), (C=8°), Arcus/Schaefer values 7 / 6, and “Next (shastriya): 2026-11-01 · Udaya”.

**Important:** The exact calculation timestamp, observer, elevation, timezone, and input settings for this “At a glance” snapshot were not included in the pasted text. Treat these values as a captured display, not as the fixed 12 October comparison result.

## “Compute” table as pasted

| Planet | State | K | C | From Sun | Next events |
|---|---|---:|---:|---:|---|
| Mercury | Udaya | 16.969° | 14° | 25.0° | Asta 2026-10-27 · Udaya 2026-11-15 |
| Venus | Asta | 6.567° | 8° | 16.3° | Udaya 2026-11-01 · Asta 2027-07-13 |
| Mars | Udaya | 74.504° | 17° | 71.2° | Asta 2028-01-14 · Udaya 2028-06-07 |
| Jupiter | Udaya | 58.656° | 11° | 58.1° | Asta 2027-08-20 · Udaya 2027-09-13 |
| Saturn | Udaya | 172.971° | 15° | 170.4° | Asta 2027-03-17 · Udaya 2027-05-04 |

The pasted excerpt does not state the Compute panel's selected date/time/place/coordinates, so these table values cannot yet be used as a same-instant numerical benchmark. Preserve their provenance as “page transcription; inputs not supplied”.

## Other models shown

- **Arcus visionis (Ptolemaic):** geometric angular-elongation criteria; the pasted page lists Mercury 10°, Venus 5°, Mars 11.5°, Jupiter 10°, Saturn 13°.
- **Schaefer photometric:** apparent magnitude, extinction/airmass, twilight sky brightness, and limiting magnitude.
- The page explicitly says these are different definitions and their event dates can differ by days or weeks. Do not combine their dates with the shāstrīya lagnāntara result.

## Existing controlled comparison — keep separate

A prior user-supplied TKS “Ephemeris · पारम्परिक पञ्चाङ्ग” snapshot was for **12 October 2026, 12:00 IST (06:30 UTC)**, 29.5830° N, 80.2090° E, elevation 1560 m, UTC+05:30. That separate page showed:

- Venus: shāstrīya Asta, **K = 7.698°**, **C = 8°**, displayed “Sun se” 17.6°; displayed Asta start 12 Oct 2026 10:20:24 and next Udaya 31 Oct 2026 12:06:07.
- Jupiter: shāstrīya Udaya, **K = 58.015°**, **C = 11°**, displayed “Sun se” 57.2°; next Asta 20 Aug 2027 00:48:11 and Udaya 12 Sep 2027 23:14:23.
- This is a separate TKS page snapshot, not the same settings as the current pasted Udaya-Asta “Compute” table unless confirmed.

Our research diagnostic at **12 Oct 2026 06:30 UTC** records:
- Sign-table K: 12.001454°
- Exact analytical oblique-ascension K: 12.015292°
- User-supplied TKS classical Panchanga K: 7.698°
- Sign-table minus TKS K: about +4.303454°
- Swiss Ephemeris Venus K candidate: 12.006133°; Swiss minus Astronomy Engine: +0.004678°.

The ~4.3° K gap remains **unexplained**. The two local K constructions differ by only about 0.014°, and changing modern ephemeris source alone did not account for the gap. Inputs and coordinate/time conventions are not yet proven like-for-like.

## Next action

1. Keep this page transcription as a separate dated source record.
2. On the TKS Udaya-Asta page, set and record exact date, local time, place, latitude, longitude, timezone, elevation, Sun-visibility basis, and engine before copying K/C.
3. For the controlled comparison, use **12 October 2026, 12:00 IST / 06:30 UTC**, lat **29.5830**, lon **80.2090**, timezone **+05:30**, and request Sun and Venus separately from `GET /v1/tks/ephemeris` if the public UI allows it. Save the raw, unedited JSON and exact request parameters.
4. Do not assume the `/v1/tks/heliacal` endpoint supplies Chapter 9 K; its documented output is elongation-orb transitions.
5. Compare same-instant intermediate values and isolate one convention at a time. If TKS does not expose needed inputs, record the limitation; do not invent values.
6. Do not change classical thresholds, tune formulas to fit TKS, or modify production Panchang files until the method is independently validated.

## Research policy

The Sūrya-siddhānta text and a reproducible derivation remain the authority for the project's intended classical method. TKS is a valuable comparison source, but its public page is marked Beta and should not be treated as infallible ground truth. Keep shāstrīya, elongation-orb, geometric, and photometric event definitions separate.
