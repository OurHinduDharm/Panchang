# Chapter VII input-frame review: local sidereal angle vs obliquity

**Status:** research finding / candidate issue; not a production specification.  
**Branch:** `research/ss-ch9-diagnostic`  
**Scope:** the local-sidereal-angle conversion used by the Chapter VII dṛkkarma candidate.

## Why this needs a separate audit

The current `convertLocalSiderealAngleObliquityFrame()` in `ss_chapter7_drikkarma.js` applies

```
tan(theta_target) = tan(theta_source) * sec(delta_obliquity)
```

and the Chapter VII candidate passes modern local sidereal angle through this conversion when its chosen classical ecliptic obliquity differs from the modern source obliquity.

This is a valid geometric transformation only under its explicitly stated model: the two coordinate frames have different equatorial poles while sharing a selected equinox axis. That is **not automatically the same operation as changing the obliquity of the ecliptic** in an ecliptic-to-equatorial conversion.

In the usual equatorial/ecliptic geometry, obliquity is the angle between the ecliptic and celestial equator. Changing the obliquity parameter rotates the ecliptic relative to the equator; it does not, by itself, rotate the terrestrial equator or change the local sidereal angle. Local sidereal time is the right ascension of the local meridian and depends on the adopted equinox origin. See:
- Swinburne COSMOS, Equatorial Coordinate System: https://astronomy.swin.edu.au/cosmos/e/equatorial%2Bcoordinate%2Bsystem
- University of Nebraska–Lincoln Astronomy Education, Celestial Equatorial Coordinates: https://astro.unl.edu/naap/motion1/cec_units.html
- Sūrya-siddhānta VII.7–11 Sanskrit and computational notes: https://www.vidhyamitra.com/surya-siddhanta/7

Chapter VII's verses establish the role of natonnata/hour-angle geometry and the sequential dṛkkarma corrections, but they do not themselves establish that a modern local sidereal angle must be transformed by the above secant relation when the candidate changes only the ecliptic obliquity.

## Consequence for the current candidate

Treat the existing obliquity-only LST conversion as an **unproven alternate frame hypothesis**, not a source-derived correction. Its unit tests and independent 3-D intersection test validate the mathematics of that particular geometric model; they do not establish that this model represents the classical input convention.

This is a potentially material conceptual issue in the same-instant Chapter VII inputs. It is not yet proven to explain the event-date gap, and it must not be presented as the cause until the paired diagnostic is run.

## Required side-by-side test

At the existing fixed instant (2026-10-12 12:00 IST / 06:30 UTC) and identical planetary vectors, report these independent candidates without replacing the current baseline:

1. **Baseline:** current scalar Chapter VII pipeline, including its current LST conversion.
2. **Same-equator sensitivity:** hold local sidereal angle fixed when changing only the ecliptic obliquity parameter; recompute planet RA/declination and the Chapter VII terms.
3. **Equinox-origin sensitivity:** apply an explicitly parameterized equinox-origin offset only as a separate variable. Do not assume that 24.217° is source-derived or that it is the correct historical offset.
4. **Full-vector candidate:** retain the existing 3-D transform as its own candidate, with its assumed pole, equinox, and epoch written in the output.

For each candidate, display: source and transformed vector, ecliptic longitude/latitude, RA/declination, local sidereal angle, hour angle, half-day angle, Āyana term, Akṣa term, final corrected longitude, and Chapter IX K. Keep the exact same instant and raw vector for all candidates.

## Decision rule

Do not select a candidate because it agrees better with TKS or a modern visibility date. First establish the meaning of each frame from the source/commentary and ensure like-for-like coordinates. Keep `app.js` and `extra-panchang.js` unchanged. Do not merge PR #22 or publish its event dates as certified.

## Current blockers that remain

- Source-faithful historical equinox/epoch and local-time convention.
- Unedited same-instant TKS Sun/Venus JSON and endpoint time semantics.
- Independent comparison of all intermediate correction terms and final K.
- Event-date fixtures with documented provenance and an agreed, justified tolerance.
