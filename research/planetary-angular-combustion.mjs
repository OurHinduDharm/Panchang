const MINUTE_MS = 60_000;
const MAX_ELONGATION_DEG = 180;

function validDate(value, label) {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError(label + " must be a valid Date");
  }
}

function validNumber(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(label + " must be between " + min + " and " + max);
  }
}

function signedDistance(elongationDeg, thresholdDeg) {
  return elongationDeg - thresholdDeg;
}

function bisectBoundary(sample, leftMs, rightMs, leftValue, toleranceMs, maxIterations) {
  let lo = leftMs;
  let hi = rightMs;
  let flo = leftValue;

  for (let iteration = 0; iteration < maxIterations && hi - lo > toleranceMs; iteration += 1) {
    const mid = Math.floor((lo + hi) / 2);
    const value = sample(new Date(mid));
    if (!Number.isFinite(value)) throw new TypeError("sampleElongation must return a finite number");
    if (value === 0) return mid;
    if ((value < 0) === (flo < 0)) {
      lo = mid;
      flo = value;
    } else {
      hi = mid;
    }
  }
  return Math.round((lo + hi) / 2);
}

/**
 * Finds classical angular-combustion boundary instants without confusing
 * them with local heliacal visibility.
 *
 * Each segment has one fixed threshold and one motion state. Split segments
 * at a retrograde/direct station so a threshold change cannot masquerade as
 * an astronomical crossing.
 *
 * sampleElongation(date) must return geocentric apparent Sun-planet
 * elongation in degrees (0..180). Segments are UTC instants.
 */
export function findAngularCombustionBoundaries({
  sampleElongation,
  segments,
  coarseStepMinutes = 360,
  toleranceSeconds = 1,
  maxIterations = 64
}) {
  if (typeof sampleElongation !== "function") {
    throw new TypeError("sampleElongation must be a function");
  }
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new TypeError("At least one threshold segment is required");
  }
  validNumber(coarseStepMinutes, 1, 10080, "coarseStepMinutes");
  validNumber(toleranceSeconds, 0.1, 3600, "toleranceSeconds");
  validNumber(maxIterations, 1, 128, "maxIterations");

  const normalized = segments.map((segment, index) => {
    validDate(segment?.start, "segments[" + index + "].start");
    validDate(segment?.end, "segments[" + index + "].end");
    validNumber(segment.thresholdDeg, 0, MAX_ELONGATION_DEG, "thresholdDeg");
    if (segment.end <= segment.start) throw new RangeError("Each segment end must follow its start");
    if (segment.motion !== "direct" && segment.motion !== "retrograde") {
      throw new RangeError("segment motion must be direct or retrograde");
    }
    return {
      startMs: segment.start.getTime(),
      endMs: segment.end.getTime(),
      thresholdDeg: segment.thresholdDeg,
      motion: segment.motion
    };
  }).sort((a, b) => a.startMs - b.startMs);

  for (let i = 1; i < normalized.length; i += 1) {
    if (normalized[i].startMs < normalized[i - 1].endMs) {
      throw new RangeError("Threshold segments must not overlap");
    }
  }

  const stepMs = coarseStepMinutes * MINUTE_MS;
  const toleranceMs = toleranceSeconds * 1000;
  const events = [];

  for (const segment of normalized) {
    const sampleSigned = date => {
      const elongation = sampleElongation(date);
      validNumber(elongation, 0, MAX_ELONGATION_DEG, "sampled elongation");
      return signedDistance(elongation, segment.thresholdDeg);
    };

    let leftMs = segment.startMs;
    let leftValue = sampleSigned(new Date(leftMs));
    while (leftMs < segment.endMs) {
      const rightMs = Math.min(leftMs + stepMs, segment.endMs);
      const rightValue = sampleSigned(new Date(rightMs));

      if (leftValue !== 0 && rightValue !== 0 &&
          ((leftValue < 0) !== (rightValue < 0))) {
        const boundaryMs = bisectBoundary(
          sampleSigned, leftMs, rightMs, leftValue, toleranceMs, maxIterations
        );
        events.push(Object.freeze({
          eventType: leftValue > 0 ? "asta-start" : "udaya",
          instant: new Date(boundaryMs).toISOString(),
          thresholdDeg: segment.thresholdDeg,
          motion: segment.motion,
          method: "geocentric-apparent-elongation-bracketed-bisection",
          uncertaintySeconds: Math.ceil(toleranceMs / 1000)
        }));
      } else if (leftValue === 0 && rightValue !== 0) {
        events.push(Object.freeze({
          eventType: rightValue < 0 ? "asta-start" : "udaya",
          instant: new Date(leftMs).toISOString(),
          thresholdDeg: segment.thresholdDeg,
          motion: segment.motion,
          method: "geocentric-apparent-elongation-exact-sample",
          uncertaintySeconds: 0
        }));
      }

      leftMs = rightMs;
      leftValue = rightValue;
    }
  }

  return Object.freeze(events.sort((a, b) =>
    Date.parse(a.instant) - Date.parse(b.instant)
  ));
}
