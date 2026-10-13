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
