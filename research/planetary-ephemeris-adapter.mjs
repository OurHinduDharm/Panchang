const HOUR_MS = 3_600_000;

function validDate(date, label) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new TypeError(label + " must be a valid Date");
  }
}

function wrap360(angle) {
  return ((angle % 360) + 360) % 360;
}

function wrapSigned(angle) {
  const wrapped = wrap360(angle);
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

function requireAstronomy(astronomy) {
  for (const name of ["PairLongitude", "GeoVector", "Ecliptic"]) {
    if (typeof astronomy?.[name] !== "function") {
      throw new TypeError("Astronomy Engine " + name + " is required");
    }
  }
}

/**
 * Adapts Astronomy Engine to the two distinct geocentric quantities needed by
 * the classical angular-combustion model:
 *  - apparent ecliptic longitude separation from the Sun;
 *  - apparent geocentric ecliptic longitude against the equinox of date.
 *
 * The first is the combustion threshold quantity. The second determines
 * whether the planet is direct or retrograde as seen from Earth.
 */
export function createPlanetEphemerisAdapter({ astronomy, body }) {
  requireAstronomy(astronomy);
  if (typeof body !== "string" || !body.trim() || body === "Sun" || body === "Earth") {
    throw new RangeError("body must be a supported planet other than Sun or Earth");
  }

  function sampleLongitude(date) {
    validDate(date, "date");
    const vector = astronomy.GeoVector(body, date, true);
    const ecliptic = astronomy.Ecliptic(vector);
    if (!ecliptic || !Number.isFinite(ecliptic.elon)) {
      throw new Error("Astronomy Engine returned an invalid geocentric ecliptic longitude");
    }
    return wrap360(ecliptic.elon);
  }

  function sampleElongation(date) {
    validDate(date, "date");
    const relativeLongitude = astronomy.PairLongitude(body, "Sun", date);
    if (!Number.isFinite(relativeLongitude) || relativeLongitude < 0 || relativeLongitude >= 360) {
      throw new Error("Astronomy Engine returned an invalid relative ecliptic longitude");
    }
    return Math.abs(wrapSigned(relativeLongitude));
  }

  return Object.freeze({
    body,
    sampleLongitude,
    sampleElongation,
    method: "astronomy-engine-apparent-geocentric-ecliptic-longitude"
  });
}

/**
 * Finds geocentric direct/retrograde stations from changes in the apparent
 * ecliptic longitude rate. This is not heliocentric orbital direction.
 */
export function findGeocentricMotionStations({
  sampleLongitude,
  start,
  end,
  coarseStepHours = 12,
  derivativeHalfWindowHours = 3,
  toleranceSeconds = 30,
  maxIterations = 80
}) {
  if (typeof sampleLongitude !== "function") throw new TypeError("sampleLongitude must be a function");
  validDate(start, "start");
  validDate(end, "end");
  if (end <= start) throw new RangeError("end must follow start");
  if (!Number.isFinite(coarseStepHours) || coarseStepHours < 1 || coarseStepHours > 168) {
    throw new RangeError("coarseStepHours must be between 1 and 168");
  }
  if (!Number.isFinite(derivativeHalfWindowHours) ||
      derivativeHalfWindowHours <= 0 || derivativeHalfWindowHours > 24) {
    throw new RangeError("derivativeHalfWindowHours must be between 0 and 24");
  }
  if (!Number.isFinite(toleranceSeconds) || toleranceSeconds < 1 || toleranceSeconds > 3600) {
    throw new RangeError("toleranceSeconds must be between 1 and 3600");
  }

  const halfWindowMs = derivativeHalfWindowHours * HOUR_MS;
  const rate = instantMs => {
    const before = sampleLongitude(new Date(instantMs - halfWindowMs));
    const after = sampleLongitude(new Date(instantMs + halfWindowMs));
    if (![before, after].every(value => Number.isFinite(value) && value >= 0 && value < 360)) {
      throw new TypeError("sampleLongitude must return degrees in [0, 360)");
    }
    return wrapSigned(after - before) / (2 * derivativeHalfWindowHours / 24);
  };

  const stepMs = coarseStepHours * HOUR_MS;
  const toleranceMs = toleranceSeconds * 1000;
  const stations = [];
  let left = start.getTime();
  let leftRate = rate(left);

  while (left < end.getTime()) {
    const right = Math.min(left + stepMs, end.getTime());
    const rightRate = rate(right);
    if (leftRate !== 0 && rightRate !== 0 && ((leftRate < 0) !== (rightRate < 0))) {
      let lo = left;
      let hi = right;
      let flo = leftRate;
      for (let i = 0; i < maxIterations && hi - lo > toleranceMs; i += 1) {
        const mid = Math.floor((lo + hi) / 2);
        const fm = rate(mid);
        if (fm === 0) {
          lo = mid;
          hi = mid;
          break;
        }
        if ((fm < 0) === (flo < 0)) {
          lo = mid;
          flo = fm;
        } else {
          hi = mid;
        }
      }
      const instantMs = Math.round((lo + hi) / 2);
      const beforeRate = rate(instantMs - 6 * HOUR_MS);
      const afterRate = rate(instantMs + 6 * HOUR_MS);
      stations.push(Object.freeze({
        instant: new Date(instantMs).toISOString(),
        transition: beforeRate < 0 && afterRate > 0 ? "retrograde-to-direct" : "direct-to-retrograde",
        motionBefore: beforeRate < 0 ? "retrograde" : "direct",
        motionAfter: afterRate < 0 ? "retrograde" : "direct",
        longitudeRateBeforeDegPerDay: beforeRate,
        longitudeRateAfterDegPerDay: afterRate,
        method: "geocentric-ecliptic-longitude-rate-root",
        uncertaintySeconds: Math.ceil(toleranceMs / 1000)
      }));
    }
    left = right;
    leftRate = rightRate;
  }

  return Object.freeze(stations);
}

/**
 * Splits a requested interval at actual geocentric stations and assigns the
 * published threshold for each motion state. No threshold change is inferred
 * from a station label or from a calendar date.
 */
export function buildMotionThresholdSegments({
  start,
  end,
  stations,
  thresholdByMotion,
  initialMotion
}) {
  validDate(start, "start");
  validDate(end, "end");
  if (end <= start) throw new RangeError("end must follow start");
  if (!thresholdByMotion ||
      !Number.isFinite(thresholdByMotion.direct) ||
      !Number.isFinite(thresholdByMotion.retrograde) ||
      thresholdByMotion.direct < 0 || thresholdByMotion.direct > 180 ||
      thresholdByMotion.retrograde < 0 || thresholdByMotion.retrograde > 180) {
    throw new TypeError("thresholdByMotion must contain direct and retrograde degrees");
  }
  if (!Array.isArray(stations)) throw new TypeError("stations must be an array");

  const ordered = stations
    .map(station => {
      const instant = new Date(station.instant);
      validDate(instant, "station.instant");
      if (station.motionAfter !== "direct" && station.motionAfter !== "retrograde") {
        throw new TypeError("station.motionAfter must be direct or retrograde");
      }
      return { instant, motionAfter: station.motionAfter };
    })
    .filter(station => station.instant > start && station.instant < end)
    .sort((a, b) => a.instant - b.instant);

  const segments = [];
  let cursor = start;
  // Caller supplies the geocentric motion state at the start instant.
  if (initialMotion !== "direct" && initialMotion !== "retrograde") {
    throw new TypeError("initialMotion must be direct or retrograde");
  }
  let motion = initialMotion;

  for (const station of ordered) {
    segments.push(Object.freeze({
      start: cursor,
      end: station.instant,
      thresholdDeg: thresholdByMotion[motion],
      motion
    }));
    cursor = station.instant;
    motion = station.motionAfter;
  }
  segments.push(Object.freeze({
    start: cursor,
    end,
    thresholdDeg: thresholdByMotion[motion],
    motion
  }));
  return Object.freeze(segments);
}
