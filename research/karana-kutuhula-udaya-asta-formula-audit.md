# Karana-kutuhala Udaya/Asta: formula extraction and validation plan

Status: research specification; **not a production calculation engine**.
Updated: 2026-11-15 (source scan located; OCR transcription pending)

## Objective and strict scope

Calculate only three bodies: **Guru (Jupiter), Shukra (Venus), and Agastya (Canopus)**. For Guru and Shukra, derive local Udaya/Asta dates and times and benchmark the two interval boundaries against the project's captured Drik references. For Agastya, keep the traditional Arghya rule distinct from astronomical Canopus rising/setting, and calculate only the event type actually supported by the verified source. Do not expand this work to other planets or the Sun/Moon.

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

## Remaining verification work

A complete scan is now located (link and edition details below). The remaining work is image-verified transcription of the relevant Guru/Shukra verses and the dedicated Agastya verse/commentary, resolution of units and sign conventions, and reproduction of the printed worked examples. Do not publish timestamps from OCR-only or guessed readings.


## Source scan located — formula extraction can now proceed

A complete scan has now been located and opened:

- *Karaṇakutūhala* of Bhāskarācārya, edited by Dr. Satyendra Mishra, Krishnadas Academy, Varanasi, first edition 1991.
- Includes Sumatiharṣa's *Gaṇakakumudakaumudī*, Sudhākara Dvivedī's *Vāsanāvibhūṣaṇa*, and the *Śivamatī* Hindi translation.
- Public scan: https://www.vpmthane.org/bhaskara900/books/Karanakutuhala_w_Sumatiharsa_%26_Dvivedi.pdf
- Printed chapter 6 is Udayāsta-adhikāra. Its contents identify separate sections for Guru, Shukra, motion/retrogression, Bhīma/Guru/Shani timing, Mercury/Venus, elapsed/future days, kalāṃśa and pāta, special procedures, and Agastya.
- The searchable Hindi translation/commentary identifies **Guru** in verses 1–2, **Shukra** in verses 3–4, retrograde/forward motion in verse 5, specific event-centre markers in verse 6, elapsed-day corrections in verse 7, and planetary kalāṃśa/pāta values in verse 8. This is materially different from the previously assumed verses 11–14 sequence; the earlier sequence and constants below are withdrawn.
- The available text extraction is OCR/search indexing, not a verified diplomatic transcription. Use it to guide image inspection, not as production-grade source text.

### Guru — verses 1–2 (OCR-derived Hindi commentary)

The commentary's stated procedure is a cyclic ahargaṇa calculation tied to the text's epoch Śaka 1105:

1. Take the elapsed year relative to the text's stated epoch.
2. Form the ahargaṇa from one copy of that elapsed-year value.
3. Divide a second copy by 10, add the quotient to the ahargaṇa, subtract 105, and divide by 399.
4. The OCR commentary says remainder 15 indicates Guru rising; a remainder greater than 348 indicates setting.
5. Apply a solar-rāśi svodaya correction: take the svodaya for the Sun's current sign, perform the stated 300-based adjustment, multiply the remainder by 15, divide by the svodaya, and add the resulting day-fraction to the Guru rising result.

The exact meaning of “elapsed year”, ahargaṇa epoch origin, remainder intervals, and the solar correction's arithmetic must be checked against the printed verse and worked example. Do not infer all unlisted remainders as continuous visibility states.

### Shukra — verses 3–4 (OCR-derived Hindi commentary)

The OCR commentary gives this cyclic calculation:

1. Start with ahargaṇa − 125 + (elapsed year / 16).
2. Divide by 548 and use the remainder to classify the event:
   - remainder > 36: western rising;
   - remainder > 287: western setting;
   - remainder > 217: eastern rising;
   - remainder > 148: eastern setting.
3. Apply the solar-rāśi svodaya correction. The commentary says to perform a 300-based adjustment and, for the setting cases, multiply by 35 (western) or 36 (eastern), then divide by the relevant svodaya. The exact sign, order, and whether the same correction is applied to rising cases must be checked against the printed text.

The inequalities above overlap if read literally in descending order. Their intended interpretation must be reconstructed as ordered remainder intervals from the original verse/commentary; do not implement these as independent greater-than checks.

### Shared motion and event markers — verses 5–8 (OCR-derived)

- Verse 5 gives the second śīghra-kendra retrograde/forward transition markers: Guru 125°/235°, Shukra 167°/193°. These are motion-state markers, not visibility thresholds.
- Verse 6 gives Venus event markers: western rise 24°, western set 177°, eastern rise 183°, eastern set 336°. It also includes Mercury values, which are out of scope and must be ignored.
- Verse 7 describes converting the angular interval between retrograde/forward transition and current śīghra-kendra into elapsed days using śīghra-kendra motion.
- Verse 8 lists kalāṃśa values: Guru 11°, Shukra 9°. The OCR's further list is out of scope. The text extraction does not yet prove that a separate retrograde kalāṃśa of 10°/8° applies; the earlier claim of 10°/8° is withdrawn pending image verification.

### Agastya — dedicated rule (verse/page identification pending)

The Agastya section exists in chapter 6's contents/commentary, but the searchable OCR snippets recovered so far do not reliably establish its exact verse number or full arithmetic. Earlier claims of an “18° ± latitude/8” rule and related field-angle numbers are withdrawn until the page image and worked example are inspected. Keep the existing source-backed traditional Agastya Arghya records separate from a computed Canopus geometric/heliacal event.

### Critical implementation consequence

The Karaṇakutūhala Guru/Shukra method is not simply a modern topocentric ephemeris threshold. It appears to be a cyclic traditional calendar algorithm using ahargaṇa, elapsed years, śīghra-kendra state, and solar-sign svodaya corrections. Implement it as a separate classical engine only after exact verse transcription and example reproduction. In parallel, continue the modern local-horizon/visibility engine for location-specific date/time output and compare it with Drik. Do not force the classical result to mimic Drik if the event definitions differ.

### Important comparison with Sūrya Siddhānta / TKS

TKS's published Udaya-Asta beta page explicitly identifies its primary classical model as Sūrya Siddhānta chapter 9's lagnāntara-asu method, with visibility condition K = lagnāntara-asu / 60 > C. It separately exposes arcus-visionis and Schaefer physical-visibility models. Thus Karaṇakutūhala is a valuable independent classical comparator, but it is not automatically more likely to reproduce TKS, whose declared primary model is already Sūrya-Siddhānta-based.

The currently recovered Karaṇakutūhala kalāṃśa values (Guru 11°, Shukra 9°) and cyclic event rules must be compared with TKS/Drik only after image-verified interpretation. Never compare only a planet-wide number without its event direction, motion state, location, and event definition.

### Corrected source blocker

The scan and useful searchable OCR are available. The immediate next task is image verification of the Guru/Shukra verses 1–8 and the dedicated Agastya section, then reproduction of the printed examples. Until these checks pass, Karaṇakutūhala calculations remain research-only.
