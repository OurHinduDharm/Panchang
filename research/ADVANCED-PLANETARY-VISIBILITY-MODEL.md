# Advanced Planetary Asta/Udaya Visibility Model

Status: research architecture; not a production release.

## Decision

Do not treat one library as the complete definition of Hindu Panchang Asta/Udaya.

There are two related but distinct event families:

1. **Daily horizon rise/set**: the planet's apparent topocentric position crosses a chosen local horizon.
2. **Heliacal disappearance/reappearance**: the planet becomes unobservable in twilight because of solar/sky brightness and atmospheric extinction, or becomes observable again.

The published Panchang convention must be identified from its own event semantics before selecting either event family. A heliacal event is not automatically interchangeable with a traditional Drik Asta/Udaya boundary.

## Recommended layered engine

### 1. Ephemeris layer

- Keep the existing pinned Astronomy Engine/JPL-derived position calculation as the first implementation path.
- Calculate apparent geocentric and topocentric positions consistently, with light-time/aberration and date-dependent coordinate transformations where supported.
- Keep JPL Horizons topocentric observer tables as an independent external validation source, not a runtime dependency for the public page.
- Record the ephemeris, version, time scale, coordinate frame, and observer model for every output.

### 2. Local sky geometry

For Pithoragarh use the explicitly approved observer coordinates:

- Latitude: 29.5828 degrees north
- Longitude: 80.2182 degrees east
- Elevation: 1650 metres

Do not silently replace the observer with Delhi, Dehradun, or a city centroid. Record the elevation datum and the assumed horizon model. A DEM/local skyline mask can be added later; geometric horizon and local terrain horizon must remain distinct.

### 3. Physical visibility layer

Implement or benchmark a Schaefer-style visibility calculation using:

- Planet apparent magnitude and phase/illuminated fraction
- Planet and Sun apparent altitude and azimuth
- Angular separation / elongation
- Twilight sky brightness
- Atmospheric extinction (pressure, temperature, humidity and aerosol/visibility coefficient)
- Observer optical assumptions
- Moonlight contribution where supported

Do not use one fixed solar-altitude or elongation threshold for every planet and both boundaries.

### 4. Independent heliacal benchmark

Swiss Ephemeris provides swe_heliacal_ut, swe_vis_limit_mag, and swe_heliacal_pheno_ut. Its published model uses Schaefer visibility criteria and accepts observer location/elevation, atmospheric parameters, and observer optical parameters.

Use this as a research benchmark only until:
- the exact event mapping to the chosen Panchang convention is demonstrated;
- the wrapper's exposed API and supported planet event types are tested;
- the library licensing route is approved.

Important limitations documented by Swiss Ephemeris:
- Its heliacal routines are intended for first/last visibility around sunrise/sunset, not generic daily planet rise/set.
- Acronychal rise/set for superior planets is not implemented in the documented version.
- Venus can be visible in daytime in cases the routine does not fully handle.
- The routine documents erratic behavior at high latitudes (especially above 55 degrees); Pithoragarh is below that limit, but every planet still needs validation.

### 5. Event solver

- Search the complete conjunction family without using a published event date as the calculation anchor.
- Determine the correct event direction from the event geometry, not a fixed direction copied across cycles.
- Find all candidate crossings; preserve zero-crossing and multiple-crossing outcomes as explicit statuses.
- Refine candidate times with a bracketed numerical solver (bisection/Brent) against the continuous visibility residual.
- Keep event date and local time separate; convert UTC to Asia/Kolkata only at the output boundary.
- Validate chronological ordering, cycle identity, and physically plausible visibility-window duration.

### 6. Model calibration and validation

- Train per-planet and per-boundary parameters only on earlier years.
- Use strict forward-year holdouts and leave-one-city-out tests.
- Match each candidate against both published boundaries, conjunction family, and independently observed local rise/set directions.
- Report date error and clock error separately for Asta and Udaya.
- Never choose a model using the same holdout event it is scored against.
- Keep unmatched, ambiguous, and out-of-domain predictions visible in reports.

## Swiss Ephemeris licensing gate

The official Swiss Ephemeris documentation states that developers must choose either AGPL or a Swiss Ephemeris Professional License before distributing software containing it or activating a public service using it. The documented AGPL path requires the whole software project to be AGPL or compatible; the Professional License is a paid commercial route.

The repository currently has no declared GitHub license metadata. Therefore do not add a Swiss Ephemeris WASM package to production or bundle it into the public app until the project owner has made and documented a licensing decision. A package wrapper's own license does not remove the underlying Swiss Ephemeris licensing obligations.

## Release gates

1. Demonstrate exact event semantics against direct same-location Drik source records.
2. Compare the existing model, physical visibility model, and Swiss heliacal benchmark on the same blind holdouts.
3. Validate all seven bodies, including Sun and Moon daily horizon events as a separate category.
4. Require no silent city fallback and no fabricated event times.
5. Preserve main Panchang performance; run multi-year generation offline and publish precomputed data.
6. Do not promote a model to production merely because it matches one year or one city.

## Primary references

- Swiss Ephemeris documentation: https://www.astro.com/swisseph/swisseph.htm
- Swiss Ephemeris programming interface: https://www.astro.com/swisseph/swephprg.htm
- JPL Horizons manual: https://ssd.jpl.nasa.gov/horizons/manual.html
- JPL Horizons API: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- Skyfield almanac documentation: https://rhodesmill.org/skyfield/almanac.html