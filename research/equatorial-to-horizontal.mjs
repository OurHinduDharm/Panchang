const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite");
}

/**
 * Converts topocentric apparent equatorial coordinates to horizontal
 * coordinates. Hour angle is positive westward. Azimuth is measured clockwise
 * from true north (0° north, 90° east, 180° south, 270° west).
 *
 * Parallax/topocentric correction and atmospheric refraction must be applied
 * before calling this function; this function performs only the spherical
 * equatorial-to-horizontal coordinate transform.
 */
export function equatorialToHorizontal({
  latitudeDeg,
  declinationDeg,
  hourAngleDeg
}) {
  finite(latitudeDeg, "latitudeDeg");
  finite(declinationDeg, "declinationDeg");
  finite(hourAngleDeg, "hourAngleDeg");
  if (latitudeDeg < -90 || latitudeDeg > 90) {
    throw new RangeError("latitudeDeg must be within [-90, 90]");
  }
  if (declinationDeg < -90 || declinationDeg > 90) {
    throw new RangeError("declinationDeg must be within [-90, 90]");
  }

  const phi = latitudeDeg * DEG;
  const delta = declinationDeg * DEG;
  const hourAngle = ((hourAngleDeg % 360) + 360) % 360 * DEG;
  const sinAltitude =
    Math.sin(phi) * Math.sin(delta) +
    Math.cos(phi) * Math.cos(delta) * Math.cos(hourAngle);
  const altitudeDeg = Math.asin(Math.max(-1, Math.min(1, sinAltitude))) * RAD;

  const eastComponent = -Math.cos(delta) * Math.sin(hourAngle);
  const northComponent =
    Math.sin(delta) * Math.cos(phi) -
    Math.cos(delta) * Math.sin(phi) * Math.cos(hourAngle);
  const horizontalMagnitude = Math.hypot(eastComponent, northComponent);
  const azimuthDeg = horizontalMagnitude < 1e-12
    ? null
    : (Math.atan2(eastComponent, northComponent) * RAD + 360) % 360;

  return Object.freeze({
    altitudeDeg,
    azimuthDeg,
    convention: "azimuth-clockwise-from-true-north",
    inputFrame: "topocentric-apparent-equatorial"
  });
}
