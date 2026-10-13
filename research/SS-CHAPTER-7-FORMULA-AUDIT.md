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


## Chapter III frame blocker: do not equate classical ayana with a modern ayanāṃśa

Chapter III.9–12 must be considered before choosing a target frame for a Chapter VII implementation. Burgess reads III.9–10 as a to-and-fro motion (libration) of the circle of asterisms/equinox relative to a fixed stellar reference, with the amount computed from elapsed days. He explicitly interprets the model as a libration with limits of 27° in either direction from ζ Piscium and a 7,200-year libration period. This historical reading is not the same model as simply subtracting a present-day Lahiri/Chitrapaksha ayanāṃśa from modern tropical longitude. Source: https://www.swaveda.com/texts/surya-siddhanta/3/ (III.9–12 and Burgess's note).

Consequences for the research code:

- The current candidate's `ayanamshaDeg = 24.217` is a configurable modern offset used to reconstruct a tropical longitude from an input labelled sidereal. It is **not yet justified as the Sūrya-siddhānta's own epoch-dependent ayana value**.
- The Chapter VII term `ayana dṛkkarma` in VII.10 is a separate local apparent-longitude correction derived from planetary latitude and a declination. It must not be conflated with the Chapter III precession/stellar-reference model just because both use the word `ayana`.
- Before claiming a fully classical frame, define the source ephemeris coordinates, epoch/equinox, fixed stellar reference, the Chapter III ayana model or a justified alternative, the 24° obliquity convention, and how local sidereal time is represented in that same frame.
- A modern sidereal longitude plus a contemporary ayanāṃśa can be used as a clearly labelled *bridge for diagnostic comparison*, but it must not be labelled a historically validated Sūrya-siddhānta coordinate frame.

This source review strengthens the existing frame blocker; it does not select a unique transformation. Burgess's historical interpretation is a primary translation/commentary witness, not proof that every modern reconstruction must adopt it without considering the Sanskrit and commentarial tradition.


## Chapter II.28: 24° is a rounded description, not the exact sine constant

Chapter II.28 gives the sine of greatest declination as 1397 with radius 3438. The corresponding modern inverse-sine angle is:

`asin(1397 / 3438) = 23.9751819037°`

Source: https://www.siva.sh/surya-siddhanta/2/28 and Burgess's discussion at https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf.

This means two possible implementations must be distinguished:

1. **Rounded fixed-obliquity geometry:** use exactly `24°` in modern trigonometric rotations. This is convenient, but is an approximation to the textual sine constant.
2. **Text-faithful declination arithmetic:** use the stated sine ratio `1397/3438` and the Siddhānta's sine/arc procedures (including their interpolation and rounding rules) wherever the classical calculation calls for them.

The current research candidate uses `obliquityDeg = 24` in exact modern trigonometric functions. That is a declared approximation, not a verbatim reproduction of the numerical procedure in II.28. We should not silently mix it with claims of minute-level shāstrīya precision. A future comparison should log both variants as separate experiments, with no parameter tuning to match a desired event date.

## Direct Gūḍhārtha-prakāśaka reading of VII.10 — source wording narrowed; latitude input still open (13 Oct 2026)

A direct reading of Raṅganātha's commentary in the 1859 Hall/Bāpū Deva Śāstrī edition was checked at the online transcription, printed page 215 / web lines 2315–2321:
https://vishvasa.github.io/jyotiSham/observation/history/hindu/sUrya-siddhAntaH_saTIkaH/

The commentary states:

- Verse gloss: `विक्षेपकलाः पूर्वसाधिता राशित्रययुतग्रहोत्पन्नक्रान्त्यंशैर्गुणिता विकला भवन्ति`
- Plain meaning: the previously calculated planetary-latitude minutes are multiplied by the degrees of declination arising from the planet with three signs added; the result is in arcseconds.
- It then explains the geometric construction for the ayana correction and separately discusses the sign rule. This directly supports the source-to-code operation “longitude/place + 90° → declination → multiply by latitude arcminutes,” rather than using the planet's unshifted declination.

**Specific unresolved input convention:** the commentary's phrase “rāśi-traya-yuta-graha” identifies the shifted planetary place, but the passage does not, by itself, settle in modern ecliptic-coordinate terms whether the planet's signed ecliptic latitude is carried into the declination calculation after the +90° longitude shift. The current helper computes declination at `tropicalLongitudeDeg + 90°` with latitude set to zero. This is therefore an explicit *zero-latitude shifted-point assumption*, not yet a fully adjudicated interpretation.

For scale, with the existing synthetic fixture (tropical longitude 124.217°, ecliptic latitude +1.2°, fixed obliquity 24°), the declination at shifted longitude 214.217° is:
- zero-latitude shifted point: −13.221707°;
- shifted point retaining +1.2° latitude: −12.095261°.

That 1.126446° declination difference changes the VII.10 correction magnitude by about 0.02253° for a 1.2° planetary latitude. This is a sensitivity illustration only, not a claim that either convention is the correct historical calculation.

### Consequence / next gate

1. Preserve the current candidate output, but label the zero-latitude convention explicitly in the research UI and audit.
2. Cross-check the same VII.10 construction in Sudhākara Dvivedī's separate commentary / edition, and inspect the geometry described by Raṅganātha to decide whether the shifted point retains the planet's latitude.
3. If the source evidence remains genuinely ambiguous, retain both variants as side-by-side diagnostics; do not silently change the formula or tune either variant to match TKS.
4. Continue to keep this local VII.10 issue separate from the larger unresolved Chapter III historical-frame / Ahargaṇa bridge and the missing same-instant TKS intermediate values.

**Decision remains research-only.** No production files changed, and this finding does not certify the Venus/Jupiter event dates.


## Sudhākara Dvivedī edition located; OCR evidence checked (13 Oct 2026)

A digitized 1911 Sanskrit edition attributed to Mahāmahopādhyāya Sudhākara Dvivedī is available through Internet Archive:
https://archive.org/details/in.ernet.dli.2015.485518
OCR text: https://archive.org/stream/in.ernet.dli.2015.485518/2015.485518.The-Surya_djvu.txt

The OCR around printed pp. 195–196 includes VII.10 and the *Sudhāvarṣiṇī* gloss. The OCR is visibly corrupted in several technical words and in the geometric proof, so it is useful as a locator and preliminary witness, **not as a reliable basis for silently deciding the latitude convention**. The readable gloss appears to restate the multiplication of latitude minutes by the shifted planet's declination and mentions the relative directions of declination and latitude. The proof below it is too garbled in the text layer to securely establish whether the intermediate point carries the planet's ecliptic latitude.

The GRETIL/Textgrid transcription explicitly lists the 1987 edition with Sudhākara Dvivedī's commentary among its source witnesses, but the web-rendered transcription presents the base Sanskrit verse rather than a readable transcription of that commentary:
https://www.textgridrep.org/browse/49kc2.0
Thus, it is incorrect to claim that the commentary question is resolved merely because that edition is listed in the source bibliography.

### Decision after this source pass

- **No formula decision yet.** The newly located scan/OCR confirms a concrete next source to inspect, but OCR quality is inadequate for the decisive geometry.
- Next, inspect the page image for printed pp. 195–196 (especially the *upapatti* after VII.10) or obtain a clean scan/transcription; compare the geometric construction with Raṅganātha's 1859 commentary.
- Until that visual reading is made, retain both zero-latitude and retained-latitude calculations as sensitivity variants. No production change, no TKS fitting, and no claim of validated event dates.


## Geometry cross-check of Raṅganātha's VII.10 *upapatti* — 13 Oct 2026

Direct source passage: the online 1859 edition, Chapter VII, lines corresponding to printed page 215:
https://vishvasa.github.io/jyotiSham/observation/history/hindu/prakIrNam/ranganAthaH/sUryasiddhAntaH/
Relevant passage begins at web line 1860 and continues through 1863.

The commentary's *upapatti* describes the planet's latitude as the hypotenuse in a polar/declination geometry and identifies the relevant corrected place as the point where a pole-oriented circle through the planetary body meets the ecliptic near the planet's ecliptic mark. It then explains how the ecliptic-longitude correction is derived from the resulting geometry. This is more consistent with treating “the planet with three signs added” as an **ecliptic longitude point** (+90° longitude, zero ecliptic latitude for that intermediate point), rather than moving the actual off-ecliptic planetary position by 90° while carrying its latitude unchanged.

### Interpretation status — narrowed, not mathematically absolute

- **Best source-supported reading at this checkpoint:** compute declination at the ecliptic point whose longitude is the planet's longitude + 90°; set the intermediate point's ecliptic latitude to zero. The actual planet's signed latitude remains the multiplier/sign input for the correction.
- **Why not call it fully closed yet:** this conclusion is a geometric reading of Raṅganātha's prose and diagram-like construction, not an explicit modern-coordinate instruction “set latitude = 0.” The Sudhākara Dvivedī *Sudhāvarṣiṇī* scan located earlier has OCR too corrupted to provide independent confirmation; its page image still needs direct inspection.
- **Action:** retain the current zero-latitude candidate as the leading interpretation, but keep the retained-latitude variant in tests as a diagnostic counterfactual until the scanned *upapatti* is visually checked. Do not present the two branches as equally supported after this commentary geometry pass.
- No production arithmetic changed. No tuning to TKS and no event-date certification follows from this interpretation alone.
