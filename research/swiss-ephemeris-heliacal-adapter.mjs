const DAY_MS = 86_400_000;
const UNIX_EPOCH_JD = 2_440_587.5;

export const HELIACAL_EVENT = Object.freeze({
  MORNING_FIRST: 1,
  EVENING_LAST: 2,
  EVENING_FIRST: 3,
  MORNING_LAST: 4
});

const EVENT_NAMES = Object.freeze({
  1: "morning-first",
  2: "evening-last",
  3: "evening-first",
  4: "morning-last"
});

function finiteRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(label + " must be between " + min + " and " + max);
  }
}

function validDate(value, label) {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError(label + " must be a valid Date");
  }
}

/**
 * Converts a JavaScript UTC Date to a Julian Day number.
 *
 * Swiss Ephemeris heliacal functions take UT1. This conversion uses UTC as
 * the practical UT1 approximation; callers needing sub-second timing must
 * supply a DUT1-corrected Julian Day through julianDayUT instead.
 */
export function dateToJulianDayUT(date) {
  validDate(date, "date");
  return date.getTime() / DAY_MS + UNIX_EPOCH_JD;
}

function normalizeAtmosphere(atmosphere) {
  if (atmosphere == null) return [0, 0, 0, 0];
  if (typeof atmosphere !== "object" || Array.isArray(atmosphere)) {
    throw new TypeError("atmosphere must be an object or null");
  }
  const pressure = atmosphere.pressureHpa ?? 0;
  const temperature = atmosphere.temperatureC ?? 0;
  const humidity = atmosphere.relativeHumidityPercent ?? 0;
  const extinction = atmosphere.extinctionCoefficient ?? 0;
  finiteRange(pressure, 0, 1200, "atmosphere.pressureHpa");
  finiteRange(temperature, -100, 80, "atmosphere.temperatureC");
  finiteRange(humidity, 0, 100, "atmosphere.relativeHumidityPercent");
  finiteRange(extinction, 0, 2, "atmosphere.extinctionCoefficient");
  return [pressure, temperature, humidity, extinction];
}

function normalizeObserverVision(vision) {
  const value = vision ?? {};
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("observerVision must be an object");
  }
  const age = value.ageYears ?? 36;
  const snellen = value.snellenRatio ?? 1;
  finiteRange(age, 5, 110, "observerVision.ageYears");
  finiteRange(snellen, 0.1, 3, "observerVision.snellenRatio");
  // Optical aid fields are intentionally omitted: this engine path is naked-eye.
  return [age, snellen, 0, 0, 0, 0];
}

function validateLocation(location) {
  if (!location || typeof location !== "object") {
    throw new TypeError("A validated observer location is required");
  }
  finiteRange(location.latitude, -60, 60, "location.latitude");
  finiteRange(location.longitude, -180, 180, "location.longitude");
  finiteRange(location.elevationMeters, -500, 100000, "location.elevationMeters");
  return [location.longitude, location.latitude, location.elevationMeters];
}

/**
 * Creates a narrow, package-independent bridge to Swiss Ephemeris
 * swe_heliacal_ut. The injected heliacalCall must normalize its binding's
 * return to { returnCode, times: [beginJD, optimumJD, endJD], error? }.
 *
 * The Swiss Ephemeris visibility implementation follows Schaefer's
 * visibility criterion and uses topocentric geometry, atmospheric inputs,
 * observer vision, and sky-background contrast. It is not an angular-
 * combustion threshold and does not include a user-specific terrain DEM.
 */
export function createSwissHeliacalAdapter({
  heliacalCall,
  julianDayUT = dateToJulianDayUT,
  heliacalFlags = 0
}) {
  if (typeof heliacalCall !== "function") {
    throw new TypeError("heliacalCall must be a function");
  }
  if (!Number.isSafeInteger(heliacalFlags) || heliacalFlags < 0) {
    throw new RangeError("heliacalFlags must be a non-negative integer bitmask");
  }

  return Object.freeze({
    calculate({
      startDate,
      julianDayUT: suppliedJulianDayUT,
      location,
      atmosphere = null,
      observerVision = null,
      objectName,
      eventType
    }) {
      if (suppliedJulianDayUT === undefined) validDate(startDate, "startDate");
      const jd = suppliedJulianDayUT ?? julianDayUT(startDate);
      finiteRange(jd, 1_000_000, 4_000_000, "julianDayUT");
      const geographicPosition = validateLocation(location);
      const atmosphericConditions = normalizeAtmosphere(atmosphere);
      const observerConditions = normalizeObserverVision(observerVision);

      if (typeof objectName !== "string" || !objectName.trim()) {
        throw new TypeError("objectName must be a Swiss Ephemeris planet or fixed-star name");
      }
      if (!Number.isInteger(eventType) || !Object.hasOwn(EVENT_NAMES, eventType)) {
        throw new RangeError("eventType must be 1, 2, 3 or 4");
      }
      if ((eventType === HELIACAL_EVENT.EVENING_FIRST ||
           eventType === HELIACAL_EVENT.MORNING_LAST) &&
          !["Mercury", "Venus", "Moon"].includes(objectName)) {
        throw new RangeError("evening-first and morning-last are only supported here for Mercury, Venus or Moon");
      }

      const raw = heliacalCall({
        julianDayUT: jd,
        geographicPosition: [...geographicPosition],
        atmosphericConditions: [...atmosphericConditions],
        observerConditions: [...observerConditions],
        objectName: objectName.trim(),
        eventType,
        heliacalFlags
      });

      if (!raw || !Number.isInteger(raw.returnCode) || raw.returnCode < 0) {
        throw new Error(raw?.error || "Swiss Ephemeris heliacal calculation failed");
      }
      if (!Array.isArray(raw.times) || raw.times.length < 3) {
        throw new TypeError("heliacalCall must return three Julian Day values");
      }

      const [beginJD, optimumJD, endJD] = raw.times;
      finiteRange(beginJD, 1_000_000, 4_000_000, "heliacal begin JD");
      const toIso = value => {
        if (value == null || value === 0) return null;
        finiteRange(value, 1_000_000, 4_000_000, "heliacal visibility JD");
        return new Date(Math.round((value - UNIX_EPOCH_JD) * DAY_MS)).toISOString();
      };
      const begin = toIso(beginJD);
      const optimum = toIso(optimumJD);
      const end = toIso(endJD);
      if (optimum && Date.parse(optimum) < Date.parse(begin)) {
        throw new RangeError("optimum visibility must not precede visibility start");
      }
      if (end && Date.parse(end) < Date.parse(begin)) {
        throw new RangeError("visibility end must not precede visibility start");
      }

      return Object.freeze({
        objectName: objectName.trim(),
        eventType: EVENT_NAMES[eventType],
        eventClass: "local-heliacal-visibility",
        location: Object.freeze({
          latitude: location.latitude,
          longitude: location.longitude,
          elevationMeters: location.elevationMeters
        }),
        visibility: Object.freeze({ begin, optimum, end }),
        returnCode: raw.returnCode,
        julianDayScale: "UT1",
        utcConversion: suppliedJulianDayUT === undefined
          ? "UTC-used-as-UT1-approximation"
          : "caller-supplied-UT1",
        method: "swiss-ephemeris-swe-heliacal-ut-schaefer-visibility-criterion",
        terrainHorizon: "not-included"
      });
    }
  });
}
