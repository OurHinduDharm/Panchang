/**
 * Numerical adaptation of Surya Siddhanta, Paatadhikara XI.14–15.
 *
 * The classical rule gives the half-duration from the half-sum of the Sun
 * and Moon disc measures, multiplied by 60 and divided by the difference of
 * their daily motions. Inputs use degrees and degrees/day; output is nadis
 * (1/60 day). Disc semidiameters are used because their sum equals half the
 * sum of the full disc measures in XI.14.
 *
 * This helper does not provide an ephemeris or approve a public calendar.
 */
const DAY_MS = 86_400_000;
const NADI_MS = DAY_MS / 60;

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
}

export function suryaSiddhantaHalfDuration({
  sunSemidiameterDeg,
  moonSemidiameterDeg,
  sunMotionDegPerDay,
  moonMotionDegPerDay
}) {
  finite("Sun semidiameter", sunSemidiameterDeg);
  finite("Moon semidiameter", moonSemidiameterDeg);
  finite("Sun daily motion", sunMotionDegPerDay);
  finite("Moon daily motion", moonMotionDegPerDay);
  if (sunSemidiameterDeg <= 0 || moonSemidiameterDeg <= 0) {
    throw new RangeError("disc semidiameters must be positive");
  }
  const relativeMotion = Math.abs(moonMotionDegPerDay - sunMotionDegPerDay);
  if (relativeMotion <= 0) throw new RangeError("relative daily motion must be positive");

  const halfDurationNadi = (sunSemidiameterDeg + moonSemidiameterDeg) * 60 /
    relativeMotion;
  return {
    halfDurationNadi,
    halfDurationMilliseconds: halfDurationNadi * NADI_MS,
    fullDurationNadi: 2 * halfDurationNadi,
    relativeMotionDegPerDay: relativeMotion,
    method: "surya-siddhanta-xi-14-15-numerical-adaptation"
  };
}

export function suryaSiddhantaWindow({ middleUtcMs, ...inputs }) {
  finite("pata midpoint", middleUtcMs);
  const duration = suryaSiddhantaHalfDuration(inputs);
  return {
    ...duration,
    middleUtcMs,
    startUtcMs: middleUtcMs - duration.halfDurationMilliseconds,
    endUtcMs: middleUtcMs + duration.halfDurationMilliseconds
  };
}
