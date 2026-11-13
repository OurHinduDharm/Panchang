function finite(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(label + " must be finite");
}

function vectorAngleDegrees(a, b) {
  for (const [vector, label] of [[a, "first vector"], [b, "second vector"]]) {
    if (!vector || ![vector.x, vector.y, vector.z].every(Number.isFinite)) {
      throw new TypeError(label + " must contain finite x, y and z components");
    }
  }
  const crossX = a.y * b.z - a.z * b.y;
  const crossY = a.z * b.x - a.x * b.z;
  const crossZ = a.x * b.y - a.y * b.x;
  const cross = Math.hypot(crossX, crossY, crossZ);
  const dot = a.x * b.x + a.y * b.y + a.z * b.z;
  return Math.atan2(cross, dot) * 180 / Math.PI;
}

/**
 * Creates one ephemeris snapshot for a planet and a real observer.
 *
 * Geocentric elongation is kept separate from the observer's topocentric
 * apparent direction. The latter includes observer parallax and is converted
 * to local altitude/azimuth by Astronomy Engine. This is not a heliacal
 * visibility decision: extinction, twilight brightness and terrain remain
 * separate model inputs.
 */
export function calculatePlanetObserverSnapshot({
  astronomy,
  body,
  date,
  observer,
  refraction = "normal"
}) {
  if (!astronomy || typeof astronomy.GeoVector !== "function" ||
      typeof astronomy.Equator !== "function" ||
      typeof astronomy.Horizon !== "function") {
    throw new TypeError("Astronomy Engine GeoVector, Equator and Horizon are required");
  }
  if (typeof body !== "string" || !body.trim() || body === "Sun" || body === "Earth") {
    throw new RangeError("body must be a supported planet other than Sun or Earth");
  }
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new TypeError("date must be a valid Date");
  }
  if (!observer || ![observer.latitude, observer.longitude, observer.height].every(Number.isFinite)) {
    throw new TypeError("observer must contain finite latitude, longitude and height");
  }
  finite(observer.latitude, "observer.latitude");
  if (observer.latitude < -90 || observer.latitude > 90 ||
      observer.longitude < -180 || observer.longitude > 180 ||
      observer.height < -500 || observer.height > 100000) {
    throw new RangeError("observer coordinates or elevation are outside supported bounds");
  }

  const sunVector = astronomy.GeoVector("Sun", date, true);
  const planetVector = astronomy.GeoVector(body, date, true);
  const geocentricElongationDeg = vectorAngleDegrees(sunVector, planetVector);
  const equatorial = astronomy.Equator(body, date, observer, true, true);
  if (!equatorial || !Number.isFinite(equatorial.ra) || !Number.isFinite(equatorial.dec)) {
    throw new Error("Astronomy Engine did not return valid topocentric equatorial coordinates");
  }

  if (refraction !== "normal" && refraction !== "none") {
    throw new RangeError("refraction must be normal or none");
  }
  // Astronomy Engine's JavaScript API accepts "normal" or null (airless).
  const refractionMode = refraction === "normal" ? "normal" : null;
  const horizontal = astronomy.Horizon(
    date, observer, equatorial.ra, equatorial.dec, refractionMode
  );
  if (!horizontal || !Number.isFinite(horizontal.altitude) ||
      !Number.isFinite(horizontal.azimuth)) {
    throw new Error("Astronomy Engine did not return valid horizontal coordinates");
  }

  return Object.freeze({
    body,
    instant: date.toISOString(),
    observer: Object.freeze({
      latitude: observer.latitude,
      longitude: observer.longitude,
      elevationMeters: observer.height
    }),
    geocentricElongationDeg,
    topocentric: Object.freeze({
      rightAscensionHours: equatorial.ra,
      declinationDeg: equatorial.dec,
      altitudeDeg: horizontal.altitude,
      azimuthDeg: horizontal.azimuth
    }),
    refraction,
    method: "astronomy-engine-geocentric-vector-and-topocentric-equator-horizon",
    visibilityDecision: "not-evaluated"
  });
}
