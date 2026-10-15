# Chapter VII sunset-side raw-state diagnostic — 2026-10-12

**Status:** research-only diagnostic. This does not select the final Chapter VII interpretation and does not authorize production changes.

## Input and timestamp validation

- Site label: Pithoragarh
- API coordinates: 29.5830° N, 80.2090° E; API request does not include elevation.
- Requested local instant: 2026-10-12 17:42 IST (UTC+05:30).
- Expected and returned `jd_utc`/`jd_ut1`: 2461326.0083333333; discrepancy is effectively zero at the API's minute precision.
- Both requests returned HTTP 200 and `success: true`.
- `selected_body` is 10 for Sun and 2 for Venus, matching the requested body codes.
- TKS `sun_day.set_h = 17.705795 h` corresponds to 17:42:20.862 IST. Thus the 17:42 capture is about 20.9 seconds before the reported sunset; it is a sunset-side sample, not an exact sunset instant.
- `jd_tt - jd_utc` is about 69.23 seconds, consistent with the returned `delta_t_s`.

## Raw Venus state (no coordinate conversion applied)

- Apparent ecliptic longitude: 216.8223763158791°
- Signed apparent ecliptic latitude: −7.5711302746134415°
- `ra_of_date_deg`: 211.8355461938087°
- `dec_of_date_deg`: −20.9282101030416°
- `ra_deg`: 211.46114579939°
- `dec_deg`: −20.79936654920412°
- Lahiri nirayana longitude: 192.58871424636595°
- TKS reported Sūryasiddhānta ayanāṃśa: 26.240120479377552°; Lahiri: 24.233662069513137°.

Do not combine `ra_deg` with `dec_of_date_deg`, or `ra_of_date_deg` with a longitude/obliquity from another frame, without confirming their definitions. The API does not return local sidereal angle in this response. Therefore the Akṣa/hour-angle part cannot be independently recomputed from this capture alone.

## Chapter VII.10 Ayana-variant discriminator

Using the helper's current candidate formula, with tropical longitude taken from the raw apparent ecliptic longitude, signed Venus latitude, and classical obliquity 24°:

1. Shift the tropical longitude by +90°.
2. Candidate A evaluates the shifted point at zero ecliptic latitude.
3. Candidate B retains the planet's signed latitude (−7.571130°) at that shifted longitude.
4. Compute the Ayana term as signed latitude (arcminutes) × absolute shifted-point declination (degrees) / 3600, with the sign rule currently encoded by VII.10.

| Quantity | Candidate A: shifted latitude 0° | Candidate B: retain signed latitude |
|---|---:|---:|
| Shifted-point declination | −19.001421° | −26.303060° |
| Ayana correction | −2.397704° | −3.319065° |

Difference B − A: −0.921361° = −55.2817 arcminutes.

Using the alternative obliquity `asin(1397/3438) = 23.975182°` gives corrections −2.395282° and −3.316720°, respectively; the difference remains −55.2863 arcminutes.

## Interpretation and limitations

- The sample provides a strong numerical discriminator between the two latitude interpretations: approximately 55.3 arcminutes.
- It does **not** establish which interpretation is textually correct. The Sanskrit/commentarial construction of the “three-sign-added” declination still needs adjudication.
- These values are only the Ayana component. They are not the final dṛkkarma-corrected longitude and do not determine the Chapter IX lagnāntara or the final Asta time.
- Do not use this capture to infer naked-eye heliacal visibility; that is a separate model.
- Production `app.js` and `extra-panchang.js` remain untouched.
- Next: derive or capture a defensible local sidereal angle in a consistent frame, complete the Akṣa term, and then test the Chapter IX sunset-side event bracket against the traditional reference. For the Udaya event, obtain a separate sunrise-side sample around 2026-10-29.
