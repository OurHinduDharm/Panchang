# Karana-kutuhala Udaya/Asta: formula extraction and validation plan

Status: research specification; **not a production calculation engine**.
Updated: 2026-11-15 (source scan located; OCR transcription pending)

## Objective

Extract the graha-udaya/asta and Agastya-udaya/asta procedures attributed to *Karaṇakutūhala* from a verifiable edition, translate each rule into explicit arithmetic, and test it independently against the project's existing references.

This document deliberately does not invent unverified Sanskrit readings, constants, or intermediate rules. A full 1991 Krishnadas Academy scan has now been located; image-verified transcription and worked-example reproduction remain required.

## Existing project evidence to reuse

- `data/drik-planetary-reference-2024-2027.json`: direct browser-captured named-city Guru/Shukra reference windows. Pithoragarh is city-label-only because the provider does not publish its observer coordinates.
- `data/asta-udaya-benchmark.json`: event models and source-location policy, including separate IMD/Rashtriya Panchang heliacal event rows.
- `ASTA-UDAYA-BENCHMARK-AUDIT.md`: source precision, event-class separation, and production acceptance gates.
- `docs/FREE-ASTRONOMY-ENGINE-LICENSE-AND-TARA-BOUNDARY-RESEARCH.md`: Astronomy Engine 2.1.19 (MIT), Skyfield (MIT), and NASA/JPL Horizons/DE440/DE441 independent-check options.
- `scripts/inspect-tara-boundary-geometry.mjs`: diagnostic geometry at the published Guru/Shukra boundaries; it is not itself a prediction engine.
- `data/agastya-arghya-pithoragarh.json` and `research/agastya/traditional-arghya-source-provenance-audit.md`: separate traditional Agastya Arghya records and their single-provider/city-label limitations.
- `planetary-asta-udaya-page.mjs`: public annual page gate; only accepted Pithoragarh Guru/Shukra records are exposed.

## Event classes must remain separate

1. **Classical Karaṇakutūhala result** — reproduce the text's own astronomical quantities, epoch, units, correction sequence, and event definition. Do not silently reinterpret it as modern naked-eye visibility.
2. **Modern local horizon / twilight result** — observer-specific topocentric geometry and twilight/visibility selection, using a pinned modern ephemeris.
3. **Published Drik Tara Asta window** — a source benchmark with its own event semantics. It is not proof that either calculation method is a Drik clone.
4. **Traditional Agastya Arghya** — a calendar/ritual event. Do not substitute geometric Canopus rise or modern heliacal first visibility.

No averaging, fitting, or threshold transfer across these event classes.

## Mathematical framework for the independent modern comparator

These are standard spherical-astronomy identities for checking the modern local-horizon geometry. **They are not represented as quotations or formulas from Karaṇakutūhala.**

### Ecliptic coordinates to equatorial declination

For ecliptic longitude λ, ecliptic latitude β, and true obliquity ε:

`sin(δ) = sin(β) cos(ε) + cos(β) sin(ε) sin(λ)`

Right ascension can be recovered robustly with an `atan2` form:

` α = atan2(sin(λ) cos(ε) - tan(β) sin(ε), cos(λ)) `

### Equatorial coordinates to local altitude

For observer latitude φ, declination δ, and local hour angle H:

`sin(h) = sin(φ) sin(δ) + cos(φ) cos(δ) cos(H)`

For an ideal unobstructed geometric horizon (`h = 0`):

`cos(H_0) = -tan(φ) tan(δ)`

This ideal formula is only a geometric cross-check. Refraction, apparent limb/centre convention, observer elevation, terrain horizon, and the source's event definition must be handled explicitly before comparing clock times.

### Local sidereal angle and hour angle

`H = LST - α`

The implementation must use a vetted time-scale/astronomy library for UT/TT and sidereal-time conversion; do not approximate sidereal time with an undocumented constant. Normalize the resulting instant to the observer's IANA time zone only at the output boundary.

## Karaṇakutūhala text extraction contract

Before coding the classical algorithm, capture the actual edition's title page, editor/commentator, publication details, chapter/adhikaraṇa heading, and page images for every relevant verse. Record both the printed page number and the PDF/image index.

For each relevant verse, create one row with:

| Field | Required content |
|---|---|
| `verseId` | Stable chapter/verse identifier as printed in the chosen edition |
| `pagePrinted` / `pageImageIndex` | Both page references |
| `sanskritDiplomatic` | Exact text, preserving sandhi and numerals |
| `transliteration` | IAST, checked against the image |
| `literalTranslation` | Word-by-word translation |
| `operationalMeaning` | What quantity is calculated and in what order |
| `units` | Degrees, kala, vighati, yojana, days, etc., explicitly resolved |
| `inputs` | All required ephemeris, latitude, epoch, and observer inputs |
| `equation` | Executable equation with symbol definitions |
| `workedExample` | Recalculation of a printed example, if present |
| `reviewStatus` | `unverified`, `transcribed`, `independently-reviewed`, or `test-passing` |

A formula is not executable until its unit convention, sign convention, branch choice, and intermediate rounding rules are known.

## Separate formula tracks

### Guru and Shukra

Extract the text's own sequence for:
- true/mean planetary longitude and any manda/sighra or other corrections actually prescribed;
- planetary latitude/declination or śara treatment, if present;
- observer latitude and the text's nati/drkkarma construction;
- eastern/western event direction;
- the two distinct boundaries of the published Asta interval;
- conversion from the text's time units to an absolute local instant.

Do not insert the modern fixed 9°/11°/other elongation thresholds into the classical algorithm unless the verified text itself prescribes them.

### Agastya (Canopus)

Treat the dedicated Agastya rule as its own algorithm. Establish from the text whether the event is a star's geometric rising/setting, a twilight condition, a calendrical date rule, or an Arghya prescription. Record the star's epoch/coordinate treatment and any latitude limits. Do not assume the Guru/Shukra planetary procedure applies unchanged to a fixed star.

## Test plan

1. **Text transcription tests:** every coded constant and equation must point to a verified verse row.
2. **Worked-example tests:** reproduce the printed example to the text's stated precision.
3. **Independent ephemeris tests:** compare modern positions with Astronomy Engine 2.1.19 and, offline, Skyfield/JPL ephemerides.
4. **Same-city benchmark tests:** compare only matching source city, event class, year, and boundary. Preserve minute precision; report signed differences.
5. **Location sensitivity:** run the same date range at Pithoragarh and a second explicitly named observer. A New Delhi source must never be relabelled as Pithoragarh.
6. **Agastya separation tests:** traditional Arghya data must not be overwritten by a modern Canopus horizon/heliacal calculation.
7. **Regression/performance:** no changes to main Panchang outputs or runtime; research calculations stay in offline scripts/CI until accepted.

## Current evidence and limits

- Existing Pithoragarh Drik Guru/Shukra data are city-label-only, not coordinate-exact.
- The existing boundary-geometry report shows the published clock instants are close to local planet horizon crossings at the representative Pithoragarh observer. This is a diagnostic, not proof of the date-selection rule.
- The held-out twilight proxy and other candidate model results remain research evidence only; unresolved boundaries must remain unresolved.
- The Agastya Pithoragarh annual rows are direct single-provider captures, not independent consensus.
- The Rashtriya Panchang heliacal table is a distinct official event list for Central Station; its rows are not interchangeable with Drik Tara Asta windows.

## Immediate blocker and next required source artifact

The Sarvakosh catalogue URL alone does not expose the page images/text to this workflow. Therefore the exact Karaṇakutūhala verse readings and numerical steps have **not** yet been independently verified here. Do not label the classical formulas complete and do not publish timestamps from a guessed transcription.

Next source artifact needed: clear page images or a downloadable scan of the relevant Karaṇakutūhala graha-udaya/asta section and the dedicated Agastya verse, including commentary and worked examples. Once present, populate the extraction table, derive equations, add executable tests, and only then implement the classical calculation module.


## Source scan located — formula extraction can now proceed

A complete scan has now been located and opened:

- *Karaṇakutūhala* of Bhāskarācārya, edited by Dr. Satyendra Mishra, Krishnadas Academy, Varanasi, first edition 1991.
- Includes Sumatiharṣa's *Gaṇakakumudakaumudī*, Sudhākara Dvivedī's *Vāsanāvibhūṣaṇa*, and the *Śivamatī* Hindi translation.
- Public scan: https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf
- Printed chapter 6 is Udayāsta-adhikāra. Its contents identify separate sections for Guru, Shukra, motion/retrogression, Bhīma/Guru/Shani timing, Mercury/Venus, elapsed/future days, kalāṃśa and pāta, special procedures, and Agastya.
- The scan's extracted text places the relevant planetary procedure at chapter 6, verses 11–14 (printed book pages around 63–66); the Agastya rule is verse 15 (around printed page 66). Verify every OCR reading against the page image before implementation.

### Verified Hindi-commentary procedure: planetary verses 11–13

The commentary describes the following sequence:

1. Select the event direction from the relevant śīghra-kendra and shift the planet by three rāśis: subtract for the eastern case, add for the western case.
2. Derive the corresponding declination (krānti); combine it with the observer's terrestrial latitude according to sign/direction to obtain natāṃśa.
3. Obtain unnataṃśa as 90° minus natāṃśa, then calculate both sine quantities.
4. Derive the planet's śara from the planet's corrected position/pāta and use the prescribed sine ratio to calculate dṛkkarma.
5. Apply the sign of dṛkkarma according to event direction and whether śara and natāṃśa are in the same or opposite direction; this yields the dṛk-corrected planet.
6. Compare the corrected planet with the contemporaneous true Sun through the prescribed lagna construction to obtain the desired kalāṃśa/time quantity.
7. Compare calculated and prescribed kalāṃśa; convert the difference to days using the Sun/planet true-motion difference, or their sum for retrograde motion, with the text's east/west and elapsed/future sign rules.

Do not reduce this sequence to a fixed geocentric elongation threshold. The worked example in the commentary must be transcribed and reproduced before the code is considered verified.

### Agastya verse 15

The commentary gives a separate latitude-dependent solar-longitude rule. Its OCR is dense and includes worked values; do not code from OCR alone. Transcribe the exact Sanskrit verse and Sumatiharṣa commentary from the page image, resolve the meaning and units of the latitude term (including the stated halving/multiplication/division), and reproduce the commentary's worked example. This is a dedicated Agastya rule, not the Guru/Shukra planetary algorithm.

### Important comparison with Sūrya Siddhānta / TKS

TKS's published Udaya-Asta beta page explicitly identifies its primary classical model as Sūrya Siddhānta chapter 9's lagnāntara-asu method, with visibility condition K = lagnāntara-asu / 60 > C. It separately exposes arcus-visionis and Schaefer physical-visibility models. Thus Karaṇakutūhala is a valuable independent classical comparator, but it is not automatically more likely to reproduce TKS, whose declared primary model is already Sūrya-Siddhānta-based.

The commentary's kalāṃśa list appears to differ from the TKS/Sūrya-Siddhānta list for several planets and motion cases (notably Venus and Mercury); parse the complete Sanskrit and direction/retrograde rules before producing a machine-readable comparison. Never compare only a planet-wide number without its event direction and motion state.

### Corrected source blocker

The blocker is no longer absence of a scan. The scan is available at the URL above. The remaining blocker is careful image-verified transcription and interpretation of the relevant verse/commentary, including unit/sign conventions and worked examples. Until those checks pass, all Karaṇakutūhala calculations remain research-only.
