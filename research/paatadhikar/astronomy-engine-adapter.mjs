/**
 * Optional ephemeris adapter for the Paatadhikara research-only scanner.
 * The dependency is injected and never loaded by the daily Panchang runtime.
 *
 * Astronomy Engine 2.1.19: GeoVector returns geocentric EQJ coordinates,
 * Ecliptic converts EQJ to true ecliptic of date, e_tilt gives true obliquity.
 * Feed the SAME instant and apparent-vector policy into Sun and Moon calls.
 */
export function createAstronomyEngineMahapataEphemeris(api) {
  const engine = api?.default || api;
  const names = ["MakeTime", "GeoVector", "Ecliptic", "e_tilt"];
  if (!engine || names.some(name => typeof engine[name] !== "function")) {
    throw new TypeError("Astronomy Engine requires MakeTime, GeoVector, Ecliptic and e_tilt");
  }
  return date => {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
      throw new TypeError("valid UTC Date is required");
    }
    const time = engine.MakeTime(date);
    const sun = engine.Ecliptic(engine.GeoVector("Sun", time, true));
    const moon = engine.Ecliptic(engine.GeoVector("Moon", time, true));
    const obliquityDeg = engine.e_tilt(time).tobl;
    if (![sun?.elon, sun?.elat, moon?.elon, moon?.elat, obliquityDeg]
      .every(Number.isFinite)) {
      throw new RangeError("ephemeris returned incomplete same-frame coordinates");
    }
    return {
      sun: { longitudeDeg: sun.elon, latitudeDeg: sun.elat },
      moon: { longitudeDeg: moon.elon, latitudeDeg: moon.elat },
      obliquityDeg
    };
  };
}
