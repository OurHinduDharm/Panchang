# TKS Panchāṅga + Planets Lab cross-check — 12 Oct 2026

Research-only capture compiled 2026-10-13 from user-provided values across prior messages. Repository branch: `research/ss-ch9-diagnostic`. No production files changed.

## User-supplied location and date context
- Date: 12 October 2026
- Place: Pithoragarh
- Coordinates used in the recent Udaya-asta capture: 29.5830° N, 80.2090° E
- Timezone: UTC+05:30
- The TKS Udaya-asta page's Compute panel did not offer time or elevation inputs; its 900-day capture is valid as the page's own available-input result. Do not describe absent controls as missing user data.
- Earlier separate TKS Planets Lab captures did expose time, altitude, pressure and temperature controls, so their configuration should be treated separately from the Udaya-asta page.

## TKS Planets Lab: Venus, 12 Oct 2026
Previously supplied by user:
- Engine A · apparent
- Venus rise 07:44 local; transit 12:52 local (altitude 39.6°); set 18:00 local.
- Geometric rise 07:44; geometric set 18:02.
- Apparent rise/set definition includes refraction + observer dip.
- Sun-relative elongation displayed: 18.1°.
- Magnitude: −4.35.
- Shāstrīya status displayed: Asta.

TKS Planets Lab itself distinguishes mathematical rise/set from actual visibility and separates geometric, apparent, and heliacal definitions. Do not treat a rise/set time as a shāstrīya asta/udaya verdict.

## TKS live Pañcāṅga / planetary sphuṭa, 12 Oct 2026
Previously supplied by user:
- Sun nirayana Lahiri sphuṭa: 177.4601°.
- Venus nirayana Lahiri sphuṭa: 191.5902°.
- Venus retrograde.

Simple same-frame longitude subtraction:
- 191.5902° − 177.4601° = 14.1301°.

This 14.1301° is the separation of the reported nirayana Lahiri longitudes. It must not be directly equated with the Udaya-asta page's “from Sun 17.6°” or Planets Lab's 18.1° elongation until their time instant, coordinate definition (longitude-only versus true 3-D angular separation), and ayanāṃśa/frame are verified. A shared ayanāṃśa subtraction would ordinarily cancel in a same-instant longitude difference; the remaining difference can indicate different instants or different coordinate/angle definitions, but current evidence does not yet determine which.

## TKS Udaya-asta, 900-day capture
Settings from user:
- 12 Oct 2026; Pithoragarh; lat 29.5830° N; lon 80.2090° E; timezone +5.5; 900 days.
- Engine A · apparent; public Engine A only, additional engine/data paid.
- Time and elevation controls are absent on this page.

Shāstrīya table:
| Body | State | K | C | From Sun | Next shāstrīya event sequence shown |
|---|---|---:|---:|---:|---|
| Mercury | Udaya | 17.107° | 14° | 25.0° | Asta 2026-10-27; Udaya 2026-11-15 |
| Venus | Asta | 7.698° | 8° | 17.6° | Udaya 2026-11-01; Asta 2027-07-13 |
| Mars | Udaya | 74.244° | 17° | 70.7° | Asta 2028-01-13; Udaya 2028-06-07 |
| Jupiter | Udaya | 58.015° | 11° | 57.2° | Asta 2027-08-20; Udaya 2027-09-13 |
| Saturn | Udaya | 173.688° | 15° | 171.5° | Asta 2027-03-17; Udaya 2027-05-04 |

Page's explicit note supplied by user: the Shāstrīya Sūrya-siddhānta Ch. 9 result (K > C) is used for Pañcāṅga and Planets Lab verdict; elongation-orb/heliacal table, Arcus visionis and Schaefer are separate modern criteria and their dates can differ by days/weeks.

Verdict references:
- https://tksephemeris.com/tks-panchanga
- https://tksephemeris.com/tks-planets
- https://tksephemeris.com/tks-udaya-asta

## Earlier TKS values: keep separate by capture/configuration
A prior 8 Oct user-provided TKS snapshot showed:
- Venus K=11.453°, C=8°, from Sun=22.7°; Asta 12 Oct 2026, Udaya 1 Nov 2026.
- Jupiter K=56.018°, C=11°, from Sun=53.9°; Asta 20 Aug 2027, Udaya 13 Sep 2027.
- At that snapshot's live sphuṭa: Sun 170.7315°; Venus 193.7951° (retrograde −0.187°/day); Jupiter 116.6284°, +0.169°/day.
These earlier values are not to be silently merged with the 12 Oct / 900-day capture: the exact timestamp/configuration and possibly the page/model state differ.

## What the combined evidence establishes
1. The Udaya-asta page explicitly designates its K > C Shāstrīya output as the verdict layer. The Arcus/Schaefer results answer separate visibility questions.
2. The Planets Lab's rise/transit/set values and the live Pañcāṅga sphuṭa are useful cross-checks but not equivalent to the Ch. 9 K value.
3. The 900-day Shāstrīya table is now captured for all five visible planets; the Sun is the reference and is not an item in the selector.
4. A discrepancy exists between the Udaya-asta “from Sun” value (17.6°), Planets Lab elongation (18.1°), and the subtraction of live Lahiri nirayana longitudes (14.1301°). Do not call this a proven bug until the time instant and angular definitions are matched.
5. The local independent candidate K near 12.00° versus TKS Venus K=7.698° remains unresolved. Do not fit constants to TKS or modify `app.js` / `extra-panchang.js` before the exact definition and intermediate values are understood.

## Next research steps
- Read TKS's public implementation/docs for how the Ch. 9 lagnāntara-asu is derived from apparent longitudes and what “from Sun” represents.
- Obtain the TKS ephemeris response for Sun and Venus at a fully specified common instant if the public endpoint exposes it; record tropical apparent longitude, latitude, apparent RA/Dec, and any reported angular separation.
- In parallel, audit the existing research helper's oblique ascension, event branch (east/west), and dṛkkarma correction against the text and the known 12 Oct fixture.
- Only ask the user for new input if a required setting/value is truly unavailable in the already supplied captures.
