# Chapter III.37–39 and III.49: nata/time-bridge design gate

**Status:** research-only design note; no production algorithm and no event-date certification.  
**Branch:** \`research/ss-ch9-diagnostic\`.  
**Production isolation:** \`app.js\` and \`extra-panchang.js\` remain unchanged.

## Assessment of the proposed roadmap

The proposal is directionally useful in separating latitude, solar declination (\`krānti\`), day geometry, and time. One distinction must be kept clear, however:

- Burgess's Chapter III.37–39 describes a **forward and converse altitude/hour-angle construction**. III.39's converse process starts from the Sun's altitude (or shadow-derived geometry), recovers the Sun's distance from the horizon, and then obtains the east/west \`nata\` in time units.
- Chapter III.49 uses an already-known east/west \`nata\`, in nāḍīs, with Lanka's rising-asus equivalents to obtain the meridian ecliptic point.
- The \`cara\` / rising-asus and day-length quantities belong to the oblique-ascension/day-duration side of the framework. They should not be inserted into a single formula for nata merely because they are related to local solar time.

Sources: Burgess translation of Chapter III, especially the descriptions around III.34–40 and III.49: https://www.swaveda.com/texts/surya-siddhanta/3/ ; Sanskrit and verse ledger: https://www.vidhyamitra.com/surya-siddhanta/3

## The crucial question: what is the input for one specified instant?

A timestamp by itself does not provide a source-justified classical \`nata\`. A research implementation must explicitly declare which path supplies the missing solar/time state:

1. **Shadow/altitude path (closest to III.37–39's converse):** provide a defensible solar altitude or observed shadow/hypotenuse, plus latitude and solar declination; recover the signed east/west nata. A modern altitude may be used only as a labelled comparison input, not called a wholly classical result.
2. **Classical time path:** derive the chosen text's day boundary, epoch/day count, meridian convention, and local time-from-noon; then calculate the corresponding classical solar geometry. The epoch and meridian must be explicit, not silently inferred from a modern timezone.
3. **Modern comparison path:** derive modern hour angle independently from a modern ephemeris and local sidereal angle. Keep it as a benchmark column, not as the answer to the classical calculation.

The prototype should not blend these paths. Each result must report its input provenance and whether it is source-derived, modern-derived, or synthetic.

## Geometry-only cross-check (not a literal Siddhānta sine-table implementation)

For a specified latitude \`φ\`, solar declination \`δ\`, altitude \`h\`, and hour angle \`H\`, the modern spherical identity

\`sin(h) = sin(φ) sin(δ) + cos(φ) cos(δ) cos(H)\`

can be inverted to estimate \`|H|\`; the sign (east/west) must come from a separately known morning/afternoon or shadow-direction condition. This is useful as a control for the Chapter III.37–39 geometry, but it is not itself proof that every historical step, table, unit, or sign convention has been implemented.

Likewise, \`H / 15°\` converts a signed angle in degrees to hours, and multiplying that hour value by 2.5 converts it to ghaṭīs. Equivalently, the magnitude is \`|H| / 6°\` ghaṭīs because one ghaṭī is 24 minutes and one hour-angle degree corresponds to four minutes of time. The source's nāḍī/prāṇa conventions and the precise definition of the angle being converted must still be observed. Do not mix degrees, arcminutes, prāṇas, nāḍīs, or ghaṭīs without an explicit conversion at each step.

## Recommended next implementation sequence

1. Add a **research-only, pure-function prototype** with explicit inputs: latitude, declination, and either altitude/shadow or a separately supplied signed time/angle.
2. Label the result \`geometry-only\`, \`modern-derived\`, or \`source-derived\`; reject missing sign/time provenance rather than guessing.
3. Add tests for due-noon, symmetric morning/evening magnitudes, horizon boundary, invalid geometry, and angle/time unit conversions.
4. Compare the prototype's inverse altitude path against the forward altitude equation over a synthetic grid. This checks geometry only.
5. Only after the time/epoch/meridian conventions are established, feed a same-instant classical \`nata\` into the Chapter III.49 rising-asus construction and compare its meridian point against the transformed-modern-plane diagnostic.
6. Then proceed to date-specific planetary Udaya/Asta intermediate logs and final correction validation.

## Current gates

- Signed angle wraparound and isolated comparison arithmetic: **PASS**.
- Chapter III.37–39 input provenance and exact source/table conventions: **OPEN**.
- Civil instant → classical time/epoch/meridian bridge: **OPEN**.
- Reproducible raw same-instant external comparison: **OPEN**.
- Independent final Udaya/Asta correction and event-time validation: **OPEN**.

**Decision:** start with the small isolated prototype, not production integration. Do not tune formulas to match reference dates. The TKS capture remains optional research evidence and is not required to establish the source equations. Remove TKS-facing text only after our own method and display have been independently validated.


## Prototype checkpoint — isolated geometry control

Added `ss_chapter3_nata_geometry.js` as a research-only module and wired its tests into `ss_classical_frame_test.js`.

The prototype exposes four deliberately separate operations:

- `solarAltitudeFromHourAngle`: forward modern spherical altitude identity.
- `hourAngleMagnitudeFromAltitude`: inverse geometry, returning only `|H|`; impossible geometry and degenerate polar cases are rejected.
- `signedHourAngleFromMagnitude`: applies east/west only when the caller explicitly supplies the direction.
- `nataTimeEquivalentFromHourAngle`: converts a signed angle to hours and ghaṭīs, while explicitly labelling the result as a modern geometry/time equivalent, not a source-derived classical nata.

Tests cover the meridian-altitude identity, a synthetic forward/inverse grid, symmetric morning/evening altitudes, horizon/zenith boundaries, impossible and degenerate geometry, sign provenance, and unit conversion.

**Numerical audit:** the first integrated CI run caught an inverse-trigonometry endpoint precision issue at exact meridian passage (floating-point `cos(H)` just below 1 yielded a tiny false non-zero angle). The inverse now snaps only values within the explicit numerical tolerance of ±1 to the exact 0°/180° endpoints; the synthetic grid was independently rechecked against this fix, and a fresh CI result is pending.

**Interpretation limit:** passing these tests establishes internal consistency of the modern spherical geometry control only. It does not establish that the classical text uses the identical mathematical construction, nor does it solve the civil-instant → classical epoch/day-count/meridian bridge. No production file was changed.

## Updated gates

- Isolated modern spherical altitude forward/inverse control and unit conversions: **implemented; endpoint precision fix committed; integrated CI recheck pending**.
- Signed angle wraparound and isolated comparison arithmetic: **PASS**.
- Chapter III.37–39 source-specific shadow/sine-table and time-unit reconstruction: **OPEN**.
- Civil instant → classical time/epoch/meridian bridge: **OPEN**.
- Reproducible raw same-instant comparison: **OPEN**.
- Independent final Udaya/Asta correction and event-time validation: **OPEN**.


## Second prototype checkpoint — source-transcription arithmetic, not yet a full table engine

After re-reading Burgess's descriptions of III.35–39, a useful intermediate can be isolated without inventing the historical sine table. The algebraic chain is transcribed as follows, with every quantity kept on the same table radius/scale:

- Forward, III.35–36: `cheda = (antya − versedSine(nata)) × dayRadius / R`; then `sineAltitude = cheda × sineColatitude / R`.
- Converse, III.38–39: `cheda = sineAltitude × R / sineColatitude`; then `unnataSine = cheda × R / dayRadius`; then `versedSine(nata) = antya − unnataSine`.
- Only after that last step does the source describe converting the remainder to an arc through the versed-sine table. East/west direction must be supplied independently from the observation/time context.

Implemented in `ss_chapter3_nata_table_arithmetic.js`. It deliberately accepts the source-table values as explicit inputs, and the inverse stops at the required versed-sine value. It does not invent table values, call modern `asin/acos` as a substitute for the historical lookup, or manufacture a signed nata.

The synthetic round-trip tests prove only that the transcribed algebra reverses itself. They do **not** establish that the meanings/scales of `antya`, `dayRadius`, and the table's versed-sine entries have been mapped correctly for a particular historical table. That is now the next source gate: identify the exact table/radius and interpolation convention in the chosen edition, then build a separately tested table adapter.

The CI workflow now explicitly includes both nata research modules in its syntax/test scope. Production files remain outside the change set.


## Third prototype checkpoint — Chapter II versed-sine lookup

Added `ss_chapter2_versed_sine_table.js` to encode the Chapter II sine entries (radius 3438; 24 intervals of 225 arcminutes) and derive the versed-sine table using the II.22 reverse-subtraction instruction. The inverse lookup returns an arc in arcminutes using piecewise-linear interpolation between adjacent table entries, following the interpolation approach described around II.30–32 in Burgess's translation.

This table adapter is now separate from the III.35–39 arithmetic. The combined research path is therefore:

1. Supply explicit, source-scaled `antya`, day-radius, sine-of-colatitude, and altitude-sine quantities.
2. Use the III.38–39 algebra to recover a candidate versed-sine value for `nata`.
3. Invert that value against the Chapter II versed-sine table to obtain an arc candidate.
4. Still unresolved: demonstrate the exact III.39 arc-to-asu/nāḍī conversion, the correct source-specific inputs for `antya` and day-radius at a given place/date, and the independent east/west sign source.

The new table tests check the 25-entry derived table, strict monotonicity, exact table-node round trips, interpolation midpoints, range rejection, and that no signed nata is fabricated. They are table/algorithm tests, not evidence of event-date accuracy. CI now syntax-checks and runs the geometry, source-transcription arithmetic, and table modules together.

Sources: Burgess, Chapter II verses 17–22 and 30–32; Chapter III verses 35–39: https://www.swaveda.com/texts/surya-siddhanta/2/ and https://www.swaveda.com/texts/surya-siddhanta/3/.


### Time-unit audit correction

Chapter I.11–12 gives 6 prāṇas per vināḍī and 60 vināḍīs per nāḍī; Burgess's note explicitly explains that a respiration/asu is the same part of the day as an arcminute is of a full revolution. Therefore, for a recovered great-circle arc expressed in arcminutes, the unit conversion candidate is:

- `asu/prāṇa = arcminutes`
- `vināḍī = arcminutes / 6`
- `nāḍī = arcminutes / 360`

This is distinct from the modern angle-to-clock conversion `degrees / 15 = hours`, though both agree dimensionally when comparing one full revolution to a full day. The table adapter now returns these candidate magnitudes. It still does not assign east/west sign or supply the source-specific `antya`, day-radius, and altitude-sine inputs.


## Fourth prototype checkpoint — deriving the day-radius and antya inputs

The source chain can be advanced one step without assigning any modern timestamp:

- Chapter II.60: `dayRadius = R − versedSine(declination)`.
- Chapter II.61: the earth-sine is `sine(declination) × tan(latitude)`; multiplying by `R / dayRadius` gives the sine of the ascensional difference (`caraSine`).
- Chapter III.34: `antya = R + caraSine`, with the sign carried by the signed latitude/declination convention.

Added `chapter3DayMeasureInputsFromTableValues` to `ss_chapter3_nata_table_arithmetic.js` to implement this chain from explicitly supplied, table-scaled inputs. A key correction from this audit: **`antya` is a day-measure quantity and can exceed `R`; it must not be incorrectly constrained to the sine-table interval [0, R].** The helper and tests now permit `antya` within [0, 2R] while keeping actual sine/versed-sine values within the radius.

Still open: validate the exact sign convention against the chosen Sanskrit edition/commentary; produce latitude and declination values through a source-consistent table/interpolation adapter; and establish how a target instant is mapped into this classical state. The tests currently use synthetic inputs and do not claim date-specific correctness.


## Fifth prototype checkpoint — connect the Chapter II table to the day-measure inputs

Added forward table interpolation helpers for both jya and utkramajyā in `ss_chapter2_versed_sine_table.js`. The Chapter III module now has `chapter3DayMeasureInputsFromAngles`, which accepts signed latitude and declination in arcminutes, interpolates the Chapter II table, and derives the day-radius/cara/antya inputs using the formula candidate above.

This moves the code from arbitrary synthetic table values to a reproducible table-driven path for a specified latitude and declination. It is still not a date/time engine: declination must come from a source-consistent solar-longitude/ayana calculation, and the observed altitude or shadow input is not yet connected. The table interpolation retains fractional values and is labelled a candidate; exact historical rounding/truncation conventions need to be confirmed before treating it as a canonical transcription.


An integrated synthetic round-trip test now runs the complete table-driven candidate path: latitude/declination angles → Chapter II sine interpolation → II.60–61/III.34 day-measure inputs → III.35–36 forward altitude sine → III.38–39 inverse versed-sine → Chapter II versed-sine arc lookup → Chapter I time-unit magnitudes. The fixture deliberately starts from a synthetic known nata arc; it checks arithmetic reversibility, not real-date or observed-event accuracy.


## Sixth prototype checkpoint — observed-shadow input

Added `chapter3AltitudeSineFromGnomonShadow` in `ss_chapter3_nata_table_arithmetic.js`, using the right-triangle construction in III.8 to derive hypotenuse and table-scaled altitude sine from a measured gnomon height and shadow length. This can feed the converse III.38–39 arithmetic when the remaining day-radius, antya, and sine-of-colatitude inputs are supplied.

The shadow length alone cannot establish the east/west sign of nata; the observation must also retain shadow direction relative to the meridian and the source's directional convention. This helper therefore never invents the sign.


## Seventh research checkpoint — source-table and sign-convention audit

A cross-source audit found a transcription hazard: the machine-readable Vidhyamitra Chapter II page currently displays some sine-table entries differently from the Burgess table used by this prototype (for example, values around the 3rd, 19th, and final entries). The independent Burgess translation and the standard table used in the existing module agree on the 25-value sequence implemented in `ss_chapter2_versed_sine_table.js`; the alternate page's discrepant values must not be silently mixed into the calculation. Before treating any table as canonical, verify the Sanskrit number-words in a page image or a second reliable edition, not only a searchable transcription.

The Chapter II interpolation rule itself is independently corroborated in the Burgess/Sastri translation: divide the arc in minutes by 225, take the past and next tabular sines, interpolate by their difference, and apply the same procedure to versed-sines (II.31–32); inverse lookup uses the next-lower table value and its difference (II.33). This supports the current linear interpolation as the stated rule, while leaving historical integer rounding policy open.

The sign audit also clarifies what the current code actually assumes: `caraSine` is signed through the product of signed latitude-sine and signed declination-sine; `antya = R + caraSine`. Thus, for a northern observer, north declination produces an `antya` above R and south declination below R; reversing the observer latitude reverses the correction. This is geometrically coherent with the product in II.61, but the module remains labelled a candidate until the Sanskrit commentary's directional convention and all latitude/declination quadrants are verified together. Do not simplify this to “declination sign alone” for both hemispheres.

Sources cross-checked:
- Burgess translation, Chapter II.17–22 and II.31–33: https://www.swaveda.com/texts/surya-siddhanta/2/
- Burgess translation, Chapter II.60–62 and Chapter III.34–39: https://www.swaveda.com/texts/surya-siddhanta/3/
- Sastri translation, interpolation rules II.31–33: https://en.wikisource.org/wiki/Page:English_translation_of_the_Surya_Siddhanta_and_the_Siddhanta_Siromani_by_Sastri,_1861.djvu/27
- Alternate searchable Sanskrit transcription for comparison (not used to overwrite the established table): https://www.vidhyamitra.com/surya-siddhanta/2

### Gate status after this audit

- [x] Table interpolation rule corroborated against a second translation.
- [x] The code's sign model documented as a latitude × declination interaction, not declination-only.
- [ ] Verify the alternate table's discrepant number-words against scanned source images.
- [x] Add a quadrant/sign matrix test for north/south observer latitude × north/south solar declination (this verifies the implemented sign behavior only; it does not independently certify the historical convention).
- [ ] Obtain a source-consistent solar longitude/declination for a selected instant and compare the inverse result with independent reference data.
- [ ] Only after these gates pass, consider integrating into the public Panchang engine.


The new matrix test in `ss_chapter3_nata_table_arithmetic.js` covers all four sign combinations of observer latitude and solar declination. It confirms the implementation's expected product-sign behavior in every quadrant. This is a regression test for the chosen formula, not independent proof that every source convention has been interpreted correctly.


## Eighth prototype checkpoint — solar declination sine from ecliptic longitude

Added `chapter3SolarDeclinationSineFromLongitudeArcMinutes` to `ss_chapter3_nata_table_arithmetic.js`. It implements the source-table relationship using the Chapter II maximum-declination sine 1397 (II.28), the Chapter II sine table, and the Chapter III.18–19 quadrant/sign treatment. The helper returns a signed table-scaled declination sine, not an angle.

Regression fixtures cover zero declination at the equinox longitudes, ±1397 at the solstitial longitudes, north/south signs, and full-circle normalization. This is the next link from a future source-derived solar longitude into the nata day-measure chain, but it does **not** derive solar longitude from ahargana, solve the Chapter III ayana/coordinate-frame question, or certify real-date event times.

Remaining critical chain:
1. source-consistent ahargana and fractional day;
2. source-consistent solar mean/true longitude and ayana frame;
3. longitude → signed declination sine (now prototyped);
4. latitude/declination → day-radius and antya;
5. measured/independently calculated altitude → inverse versed-sine → arc/time magnitude;
6. independent east/west sign and same-instant event comparison.


## Ninth prototype checkpoint — connected longitude-to-day-measure chain

Added a source-table inverse sine operation to `ss_chapter2_versed_sine_table.js`, using adjacent table entries and interpolation rather than modern `asin()`. Then connected the supplied solar ecliptic longitude through the Chapter II maximum-declination sine (1397), inverse sine table, signed declination angle, observer latitude, II.60–61 day-radius/cara calculation, and III.34 `antya` value in `chapter3DayMeasureInputsFromSolarLongitude`.

Regression tests cover all exact inverse-sine table nodes, midpoint interpolation, out-of-range rejection, and the connected chain at an equinox and both solstices. This now gives a reproducible calculation from a **supplied** solar longitude to the day-measure input. It still does not derive the longitude from a date/ahargana, certify the Chapter III ayana frame, or calculate the final observed rising/setting event. CI is being rerun for these latest changes.
## Tenth prototype checkpoint — preserve sub-day phase precision

A numerical precision defect was found in the research-only date-to-ayana bridge. The previous path added a fractional day to an ahargaṇa near 714 billion as a JavaScript Number, then extracted the fractional part again. At that magnitude, IEEE-754 spacing is roughly 0.000122 day (about 10.5 seconds), so the phase could be quantized before the 600-revolutions/yuga-day calculation.

The research helper now:
- computes elapsed whole days and the fractional day directly from the local-mean JD boundary;
- adds whole elapsed days to the epoch ahargaṇa using BigInt;
- takes the 600-revolution remainder with exact integer modulo;
- adds the small fractional-day contribution only after that modulo;
- exposes the exact whole-ahargaṇa integer as a decimal string, while retaining the numeric ahargaṇa field only for compatibility/diagnostics.

A synthetic fractional-JD regression test checks that the sub-day fraction survives the large creation-era anchor. This fixes the arithmetic precision path only; it does not validate the historical epoch offset, Lanka meridian convention, civil-date mapping, or source consistency of the resulting ayana. The helper remains research-only. Production app.js and extra-panchang.js remain untouched.
## Eleventh prototype checkpoint — source-ratio mean solar longitude

A separate research helper now computes the mean Sun's cyclic longitude from an already-supplied ahargaṇa. The source constants give 51,840,000 solar months per yuga; dividing by 12 months per solar revolution yields 4,320,000 solar revolutions. The helper computes the fractional cycle from that ratio, using exact integer modulo for the whole-day part and carrying fractional day separately.

Regression checks cover zero longitude at zero ahargaṇa, full-yuga cycle closure, half-yuga phase, half-day incremental motion, normalization, and invalid input. CI now runs these tests.

Strict boundary: this helper does not derive ahargaṇa from a civil date and does not apply Chapter II's solar manda equation. It returns mean longitude only. Next gate is a source-derived Sun mandocca/anomaly/manda-phala chain, followed by an independent reference comparison; only then can a candidate true solar longitude be connected to the Chapter III day-measure/rise-set geometry.


## Twelfth prototype checkpoint — source-ratio mean solar mandocca

Added `ss_chapter1_mean_solar_mandocca.js` as a research-only pure function. Chapter I.41 gives 387 eastward revolutions of the Sun's mandocca per kalpa; I.20 defines a kalpa as 1000 yugas. The candidate mean motion is therefore `387 / (1000 × 1,577,917,828)` revolutions per savana day.

The epoch longitude is represented as 77°07′48″, reported for Kali year 1 current in R. Sewell's *Indian Chronography* while discussing the Sūrya-siddhānta/Burgess value. This is a useful explicit candidate, **not yet a directly verified transcription from the original table image**. The helper's input is elapsed savana days since the Kali epoch; it intentionally does not infer elapsed days from the existing ahargana bridge, whose epoch/time convention remains a separate open gate.

Tests cover the epoch anchor, 0.387 revolution per yuga, one complete kalpa, fractional-day motion, negative elapsed days, normalization, and invalid input. CI now syntax-checks and runs this helper. Passing arithmetic tests will not certify the anchor's coordinate frame, nor do they produce true solar longitude or Udaya/Asta dates.

Sources: Sūrya-siddhānta I.20 and I.41 in Burgess's translation: https://www.swaveda.com/texts/surya-siddhanta/1/ ; historical report of 77°07′48″ in Sewell, *Indian Chronography*: https://www.scribd.com/document/797839191/Jyotish-1912-R-Sewel-Indian-Chronography-Panchanga

**Next gate:** verify the 77°07′48″ epoch value against the scan/table and confirm its longitude origin/frame. Only then should the Chapter II solar manda-kendra and epicycle/equation be built on top of the mean-longitude and mean-mandocca candidates. Production `app.js` and `extra-panchang.js` remain untouched.


## Thirteenth prototype checkpoint — Chapter II solar manda equation

Added `ss_chapter2_solar_manda.js`, a research-only implementation candidate for the Sun's first/manda correction using Chapter II.34, II.38–39 and II.45:

- Sun's manda epicycle varies between 14° at even-quadrant ends and 13°40′ at odd-quadrant ends (II.34).
- The 20′ difference is interpolated with the Chapter II tabular sine and radius 3438 (II.38).
- The corrected epicycle times the base sine, divided by 360, produces the sine quantity whose arc is the manda equation (II.39); the arc is recovered through the Chapter II sine table rather than modern `asin()`.
- The equation is added for planet-to-apsis kendra in the first half-orbit and subtracted in the second half-orbit (II.45).

The helper requires explicit mean longitude and mean mandocca longitude in the same frame. This is intentional: the existing epoch bridge, solar mean-longitude origin, and the historical 77°07′48″ mandocca anchor have not yet been reconciled to a single proven coordinate frame. Therefore the output is labelled a candidate and is not yet suitable for real-date Udaya/Asta claims.

CI syntax-checks and runs quadrant, epicycle, sign, wraparound, plausible-bound, and invalid-input tests. This is an arithmetic gate, not independent astronomical validation.

Source: Burgess translation, Sūrya-siddhānta Chapter II, verses 34, 38–39, 45: https://www.swaveda.com/texts/surya-siddhanta/2/

**Remaining bounded gates before this can be evaluated against actual dates:** (1) verify the epoch/coordinate-frame anchors; (2) test the resulting true solar longitude against an independent reference at a small set of dates; (3) only then connect it to the already isolated Chapter III declination/day-measure path and assess sunrise geometry. Production `app.js` and `extra-panchang.js` remain unchanged.
