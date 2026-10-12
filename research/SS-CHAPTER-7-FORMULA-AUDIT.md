# Chapter VII dṛkkarma — source-to-code audit (research only)

**Status:** derivation worksheet; not a production specification.  
**Branch:** `research/ss-ch9-diagnostic`  
**Production isolation:** `app.js` and `extra-panchang.js` remain untouched.  
**Purpose:** separate what the text states from the current JavaScript interpretation. This file does not certify the event dates.

## Primary text anchors

- Burgess translation, Sūrya-siddhānta VII.7–11: https://www.swaveda.com/texts/surya-siddhanta/7/
- Sanskrit text and verse-by-verse computational outline, VII.7–11: https://vidhyamitra.com/surya-siddhanta/7
- Burgess scan, Chapter VII discussion: https://prajnaquest.fr/downloads/BookofDzyan/IndianTraditions/Others/Surya%20Siddhanta.pdf

The web transcription aligns the Sanskrit and Burgess translation at VII.7–11. The source text supports the equations below as a reading of the stated operations; it does **not** establish that modern ephemeris inputs are in the required classical coordinate frame.

## VII.7 — prerequisite quantities

The verse requires the day/night measure, planetary latitude (vikṣepa) in minutes, and the planet's meridian-distance (nata) and altitude (unnata) in time, derived using the corresponding orient ecliptic-point (lagna).

**Implementation implication:** do not replace the planet's own meridian-distance and half-day with the Sun's values or a generic sunrise/sunset time. The calculation of the orient ecliptic point, time-from-meridian, and half-day must be separately specified and tested.

## VII.8–9 — Akṣa dṛkkarma

Burgess's translation of VII.8 states: multiply the latitude by the equinoctial shadow, divide by twelve, multiply by the meridian-distance in nāḍīs, and divide by the corresponding planet's half-day. VII.9 supplies the sign rule.

Let:
- (b_m) = magnitude of planetary ecliptic latitude in arcminutes;
- (S) = equinoctial shadow in the text's gnomon convention;
- (N) = magnitude of the planet's meridian-distance in nāḍīs;
- (H) = the corresponding half-day in the same time unit.

Then the magnitude stated in VII.8 is:

`A = (b_m × S / 12) × (N / H)`

If, and only if, the chosen shadow convention defines `S = 12 tan(φ)` for the observer latitude `φ`, this can be reduced to `A = b_m tan(φ) × (N/H)` in arcminutes. When converting the result to degrees, divide arcminutes by 60. This reduction depends on the exact definition and sign convention of the equinoctial shadow; it must be documented rather than silently assumed.

VII.9 sign rule in Burgess:
- latitude north: subtract in the eastern hemisphere; add in the western hemisphere;
- latitude south: reverse those signs.

**Unit requirement:** `b_m` is in arcminutes and `S/12` and `N/H` are dimensionless, so the output magnitude is arcminutes. The current candidate function computes a degree-valued correction directly from latitude in degrees. That is algebraically equivalent only if the shadow reduction above and the time ratio are both implemented consistently.

**Open verification items:**
1. Verify how the implementation identifies east/west of the meridian, including the meridian crossing and angle wrapping.
2. Verify the equinoctial-shadow convention, and whether its sign is carried in `S` or handled only by VII.9.
3. Verify the precise half-day definition for the planet's own place and behavior when the body is circumpolar or the half-day is undefined.
4. Verify that the input latitude belongs to the coordinate system assumed by the classical construction.

## VII.10 — Āyana dṛkkarma

Burgess says to add three signs (90°) to the planet's place, find the declination of that resulting position, multiply the degree-number of that declination by the number of arcminutes in the planet's latitude, and obtain the correction in arcseconds. The correction is additive for unlike declination/latitude directions and subtractive for like directions.

Let:
- `b_m` = magnitude of planetary latitude in arcminutes;
- `D_deg` = signed declination in degrees of the position specified by the verse (planet's place advanced by 90°);
- `Y_as` = correction magnitude in arcseconds.

The magnitude is `Y_as = b_m × |D_deg|`; its sign is **positive for unlike north/south names and negative for like names**. Convert arcseconds to degrees by dividing by 3600 before applying it to longitude.

The exact interpretation of “planet's place increased by three signs” must be documented from the source/commentary: in particular, whether the declination is that of the ecliptic point at longitude +90° or whether the planet's latitude is retained in that intermediate position. Do not resolve this ambiguity by fitting dates.

## Required order and meaning

Burgess's note to VII.11 describes dṛkkarma as a two-part operation for *apparent longitude*: Āyana correction first gives the point on the hour circle; Akṣa correction then gives the point on the circle of position/secondary to the prime vertical. Therefore, these corrections are not a general-purpose modern coordinate-frame conversion and must not be described as such.

The code's correction order (Āyana then Akṣa) follows that textual description as a candidate. However, a correct order alone does not validate its input coordinate frame or its construction of local sidereal angle.

## Audit of current research candidate

File: `ss_chapter7_drikkarma.js`

- The function is explicitly labelled a candidate; preserve that status.
- It uses a fixed `24°` obliquity and a configurable ayanāṃśa to reconstruct a tropical longitude from a sidereal longitude. The historical target equinox/frame and the compatibility of that longitude, the signed latitude, and the local sidereal angle have **not** been established.
- `convertLocalSiderealAngleObliquityFrame()` assumes a shared equinox axis and changes the meridian/equator intersection. This is a geometric candidate under that assumption, not a complete transformation from Astronomy Engine's modern frame into a historically established Sūrya-siddhānta frame.
- The existing numerical tests demonstrate repeatability of the implemented equations and selected geometry identities. They do not independently prove the equations are the only correct textual interpretation, nor do they validate a Jupiter setting date.
- The current function's numeric fixtures are hard-coded expected outputs from the same candidate. Keep them labelled as regression fixtures, not independent astronomical truth.

## Independent test design before Chapter IX event tests

Build tests for the following separately, using hand-calculated inputs where possible:

1. **Unit algebra:** one arcminute of latitude times one degree of declination gives one arcsecond of Āyana correction.
2. **Āyana sign truth table:** same north/south name => subtract; unlike names => add.
3. **Akṣa sign truth table:** for each north/south latitude and east/west meridian hemisphere, assert VII.9's sign independently of the numerical magnitude.
4. **Scale/linearity:** doubling latitude doubles each correction magnitude; halving the time-from-meridian/half-day ratio halves Akṣa magnitude.
5. **Boundary behavior:** meridian passage gives zero Akṣa correction; undefined half-day/circumpolar inputs return an explicit unsupported result, not a fabricated number.
6. **Source-to-code trace:** log `b_m`, `S`, `N`, `H`, `A` in arcminutes and degrees, the VII.9 sign reason, the +90° position, its declination, `Y` in arcseconds/degrees, and the intermediate/final longitude.
7. **Coordinate-frame audit:** before a planetary event date is accepted, define the source and target frame axes, equinox, ecliptic pole, obliquity, and ayanāṃśa convention. Until then, do not call the output a validated classical longitude.

These tests can establish implementation consistency and catch sign/unit bugs. They cannot by themselves resolve historical frame ambiguity or prove the event-time algorithm.

## Decision

**No production patch and no PR merge.** The next useful code artifact is a source-aware unit/sign test once the remaining definitions above are explicitly decided. Do not add a second copy of the same candidate formula and treat a passing duplicate as independent validation.
