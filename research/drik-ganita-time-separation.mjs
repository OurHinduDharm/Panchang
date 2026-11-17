/**
 * Drik-Ganita time-separation model — research prototype.
 *
 * Uses modern apparent positions and observer-specific apparent rise/set
 * times. It does not implement Surya-Siddhanta Ch.9 K/C and does not model
 * naked-eye/photometric visibility.
 *
 * SearchRiseSet is injected so the module remains easy to test and the
 * browser can reuse the already-loaded Astronomy Engine instance.
 */

export const MINUTES_PER_TIME_DEGREE = 1436.068175 / 360; // mean sidereal day / 360

const PLANET_BODY = Object.freeze({
  "शुक्र": "Venus",
  "बृहस्पति": "Jupiter",
  "गुरु": "Jupiter",
  "अगस्त्य": "Star1"
});

function normalizeEventType(event) {
  const label = String(event || "");
  if (event === "Udaya" || label === "अस्त समाप्त" || /उदय/.test(label)) return "Udaya";
  if (event === "Asta" || /अस्त/.test(label)) return "Asta";
  return null;
}

function parseIsoDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

/**
 * Parses the source clocks without losing next-day notation.
 * Ganesh Martand uses HH.MM and can print hours > 24; Drik uses HH:mm.
 * Ambiguous AM/PM records are rejected instead of silently guessed.
 */
export function parsePrintedClock(dateIso, raw, qualifier = null, timezoneOffsetMinutes = 330) {
  const date = parseIsoDate(dateIso);
  const match = String(raw ?? "").trim().match(/^(\d{1,2})[.:](\d{2})$/);
  if (!date || !match) return { valid: false, reason: "invalid-date-or-clock" };
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59) return { valid: false, reason: "invalid-minute" };

  const q = String(qualifier || "").trim().toLowerCase();
  if (q && hour > 12) return { valid: false, reason: "ambiguous-12h-qualifier" };
  if (q === "pm" && hour < 12) hour += 12;
  if (q === "am" && hour === 12) hour = 0;
  if (q && q !== "am" && q !== "pm") return { valid: false, reason: "unknown-time-qualifier" };

  const totalMinutes = hour * 60 + minute;
  const dayRollover = Math.floor(totalMinutes / 1440);
  const minuteOfDay = totalMinutes % 1440;
  if (!Number.isFinite(timezoneOffsetMinutes) || Math.abs(timezoneOffsetMinutes) > 14 * 60) return { valid: false, reason: "invalid-timezone-offset" };
  const instantUtcMs = Date.UTC(date.year, date.month - 1, date.day) + totalMinutes * 60_000 - timezoneOffsetMinutes * 60_000;
  return {
    valid: true,
    instantUtcMs,
    dayRollover,
    minuteOfDay,
    normalizedUtc: new Date(instantUtcMs).toISOString()
  };
}

export function resolveDrikHorizonBranch({ planet, event, direction, sourceId }) {
  const body = PLANET_BODY[planet] || planet;
  // Printed "अगस्त्योदय" in traditional Panchangs is not, by itself,
  // a geometric Canopus rise event. Only explicit Drik star-event labels
  // enter the geometric rise/set calibration.
  if (body === "Star1" &&
      !(String(sourceId || "").startsWith("drikpanchang") &&
        (event === "अगस्त्य तारा उदय क्षण" || event === "अस्त क्षण"))) {
    return null;
  }

  const normalizedDirection = String(direction || "").trim().toLowerCase();
  if (normalizedDirection === "पूर्व" || normalizedDirection === "east") return "rise";
  if (normalizedDirection === "पश्चिम" || normalizedDirection === "west") return "set";

  const eventType = normalizeEventType(event);
  const isUdaya = eventType === "Udaya";
  const isAsta = eventType === "Asta";
  if (isAsta && (body === "Jupiter" || body === "Star1")) return "set";
  if (isUdaya && (body === "Jupiter" || body === "Star1")) return "rise";
  return null;
}

export function sourceObservationToReference(observation) {
  const clock = parsePrintedClock(
    observation.date,
    observation.timeRaw,
    observation.timeQualifierRaw
  );
  const body = PLANET_BODY[observation.planet] || null;
  const branch = resolveDrikHorizonBranch({ ...observation, sourceId: observation.sourceId });
  const eventType = body === "Star1"
    ? (observation.sourceId?.startsWith("drikpanchang") &&
       observation.event === "अगस्त्य तारा उदय क्षण" ? "Udaya" :
       observation.sourceId?.startsWith("drikpanchang") &&
       observation.event === "अस्त क्षण" ? "Asta" : null)
    : normalizeEventType(observation.event);
  return {
    id: observation.id,
    sourceId: observation.sourceId,
    date: observation.date,
    timeRaw: observation.timeRaw ?? null,
    planet: observation.planet,
    body,
    event: observation.event,
    eventType,
    branch,
    direction: observation.direction || null,
    clock,
    usableForCalibration: clock.valid && Boolean(body) && (Boolean(branch) || body === "Venus")
  };
}

/**
 * Find the standard apparent rise/set event at the observer's location.
 * This is not a heliacal naked-eye brightness model.
 */
export function findLocalRiseSetEvent({
  SearchRiseSet, SearchAltitude = null, body, observer, direction, localDayStartUtc
}) {
  if (typeof SearchRiseSet !== "function") throw new TypeError("SearchRiseSet function is required");
  if (!observer || !Number.isFinite(localDayStartUtc)) throw new TypeError("observer and local-day start are required");
  // Fixed stars use the unrefracted geometric center crossing at altitude 0°.
  // Planetary rise/set records retain the standard refraction-corrected API.
  const useGeometricStarCrossing = body === "Star1" && typeof SearchAltitude === "function";
  const event = useGeometricStarCrossing
    ? SearchAltitude(body, observer, direction === "rise" ? 1 : -1,
        new Date(localDayStartUtc), 1, 0)
    : SearchRiseSet(body, observer, direction === "rise" ? 1 : -1,
        new Date(localDayStartUtc), 1, 0);
  const instant = event?.date instanceof Date ? event.date.getTime()
    : event?.date ? new Date(event.date).getTime()
    : event instanceof Date ? event.getTime()
    : NaN;
  if (!Number.isFinite(instant)) return null;
  const dayEnd = localDayStartUtc + 86_400_000;
  if (instant < localDayStartUtc || instant >= dayEnd) return null;
  return instant;
}

/**
 * The gap between the Sun's and planet's corresponding local rise/set events.
 * 1 time-degree = 1/360 of a mean sidereal day, used as a calibration coordinate.
 */
export function measureDrikTimeSeparation({
  SearchRiseSet, SearchAltitude = null, body, observer, branch, localDayStartUtc
}) {
  const sunEventUtcMs = findLocalRiseSetEvent({
    SearchRiseSet, SearchAltitude, body: "Sun", observer, direction: branch, localDayStartUtc
  });
  const bodyEventUtcMs = findLocalRiseSetEvent({
    SearchRiseSet, SearchAltitude, body, observer, direction: branch, localDayStartUtc
  });
  if (sunEventUtcMs === null || bodyEventUtcMs === null) {
    return { available: false, reason: "horizon-event-not-found", body, branch };
  }
  const gapMinutes = Math.abs(bodyEventUtcMs - sunEventUtcMs) / 60_000;
  return {
    available: true,
    body,
    branch,
    sunEventUtcMs,
    bodyEventUtcMs,
    gapMinutes,
    timeDegrees: gapMinutes / MINUTES_PER_TIME_DEGREE
  };
}

/**
 * Convert a source boundary into an empirical time-separation benchmark.
 * It checks the printed time against the body's geometric horizon event
 * and reports both the solar gap and the body-event clock residual.
 */
export function calibrateObservation({
  observation, SearchRiseSet, SearchAltitude = null, observer, localDayStartUtc
}) {
  const ref = sourceObservationToReference(observation);
  if (!ref.usableForCalibration) {
    return { ...ref, available: false, reason: "source-record-not-calibratable" };
  }
  const eventDayStartUtc = localDayStartUtc + ref.clock.dayRollover * 86_400_000;
  const branches = ref.branch === "auto" || ref.branch === null ? ["rise", "set"] : [ref.branch];
  const candidates = branches.map(branch => {
    const sunEventUtcMs = findLocalRiseSetEvent({
      SearchRiseSet, SearchAltitude, body: "Sun", observer, direction: branch, localDayStartUtc: eventDayStartUtc
    });
    const bodyEventUtcMs = findLocalRiseSetEvent({
      SearchRiseSet, SearchAltitude, body: ref.body, observer, direction: branch, localDayStartUtc: eventDayStartUtc
    });
    if (sunEventUtcMs === null || bodyEventUtcMs === null) return null;
    const sourceVsBodyMinutes = (ref.clock.instantUtcMs - bodyEventUtcMs) / 60_000;
    const sourceVsSunMinutes = (ref.clock.instantUtcMs - sunEventUtcMs) / 60_000;
    return {
      branch, sunEventUtcMs, bodyEventUtcMs, sourceVsBodyMinutes, sourceVsSunMinutes,
      bodyEventResidualMinutes: Math.abs(sourceVsBodyMinutes),
      calibratedTimeDegrees: Math.abs(sourceVsSunMinutes) / MINUTES_PER_TIME_DEGREE
    };
  }).filter(Boolean).sort((a, b) => a.bodyEventResidualMinutes - b.bodyEventResidualMinutes);
  if (!candidates.length) {
    return { ...ref, available: false, reason: "horizon-event-not-found" };
  }
  const best = candidates[0];
  return {
    ...ref,
    ...best,
    inferredBranch: ref.branch === null || ref.branch === "auto",
    available: true
  };
}


/**
 * Scan one geometric-horizon branch for threshold transitions.
 * A downward crossing is Asta; an upward crossing is Udaya.
 * The reported instant is interpolated from the body's horizon-event times.
 */
export function scanDrikTimeSeparationTransitions({
  SearchRiseSet, body, observer, branch, startLocalDayUtc,
  days, thresholdTimeDegrees, astaThresholdTimeDegrees = thresholdTimeDegrees,
  udayaThresholdTimeDegrees = thresholdTimeDegrees
}) {
  if (!Number.isInteger(days) || days < 2) throw new RangeError("days must be an integer >= 2");
  if (![astaThresholdTimeDegrees, udayaThresholdTimeDegrees].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError("Asta and Udaya thresholds must be positive");
  }
  const samples = [];
  for (let index = 0; index < days; index++) {
    const localDayStartUtc = startLocalDayUtc + index * 86_400_000;
    const sample = measureDrikTimeSeparation({
      SearchRiseSet, body, observer, branch, localDayStartUtc
    });
    samples.push({ dayStartUtc: localDayStartUtc, ...sample });
  }
  const events = [];
  for (let index = 1; index < samples.length; index++) {
    const before = samples[index - 1];
    const after = samples[index];
    if (!before.available || !after.available) continue;
    const delta = after.timeDegrees - before.timeDegrees;
    const crossings = [];
    if (before.timeDegrees > astaThresholdTimeDegrees && after.timeDegrees <= astaThresholdTimeDegrees) {
      crossings.push({ event: "Asta", thresholdTimeDegrees: astaThresholdTimeDegrees });
    }
    if (before.timeDegrees < udayaThresholdTimeDegrees && after.timeDegrees >= udayaThresholdTimeDegrees) {
      crossings.push({ event: "Udaya", thresholdTimeDegrees: udayaThresholdTimeDegrees });
    }
    for (const crossing of crossings) {
      if (delta === 0) continue;
      if ((body === "Jupiter" || body === "Star1") &&
          !((crossing.event === "Asta" && branch === "set") ||
            (crossing.event === "Udaya" && branch === "rise"))) continue;
      const fraction = Math.max(0, Math.min(1,
        (crossing.thresholdTimeDegrees - before.timeDegrees) / delta
      ));
      const bodyEventUtcMs = before.bodyEventUtcMs +
        fraction * (after.bodyEventUtcMs - before.bodyEventUtcMs);
      events.push({
        body,
        branch,
        event: crossing.event,
        thresholdTimeDegrees: crossing.thresholdTimeDegrees,
        beforeTimeDegrees: before.timeDegrees,
        afterTimeDegrees: after.timeDegrees,
        fraction,
        utcMilliseconds: Math.round(bodyEventUtcMs),
        utc: new Date(bodyEventUtcMs).toISOString()
      });
    }
  }
  return { samples, events };
}


/**
 * Measures the Sun's topocentric apparent altitude at the target's local
 * apparent rise/set event. This is the location-conditioned Drik benchmark
 * coordinate used for the next model stage.
 */
export function measureSunAltitudeAtTargetRiseSet({
  SearchRiseSet, SearchAltitude = null, Equator, Horizon, body, observer, branch, localDayStartUtc
}) {
  const bodyEventUtcMs = findLocalRiseSetEvent({
    SearchRiseSet, SearchAltitude, body, observer, direction: branch, localDayStartUtc
  });
  if (bodyEventUtcMs === null) {
    return { available: false, reason: "target-rise-set-not-found", body, branch };
  }
  const date = new Date(bodyEventUtcMs);
  const sunEquator = Equator("Sun", date, observer, true, true);
  const sunHorizon = Horizon(date, observer, sunEquator.ra, sunEquator.dec, "normal");
  return {
    available: true,
    body,
    branch,
    bodyEventUtcMs,
    sunAltitudeDeg: sunHorizon.altitude
  };
}

/**
 * Finds Asta/Udaya when the Sun's apparent altitude at the target's horizon
 * crossing passes the calibrated body/event/branch threshold.
 */
function thresholdForMotion(profile, motionState) {
  if (Number.isFinite(profile)) return profile;
  if (profile && typeof profile === "object" && Number.isFinite(profile[motionState])) {
    return profile[motionState];
  }
  return null;
}

export function scanDrikSolarAltitudeTransitions({
  SearchRiseSet, SearchAltitude = null, Equator, Horizon, body, observer, branch,
  startLocalDayUtc, days, astaSunAltitudeDeg, udayaSunAltitudeDeg,
  motionStateAt = null
}) {
  if (!Number.isInteger(days) || days < 2) throw new RangeError("days must be an integer >= 2");
  const isProfile = value => value && typeof value === "object" && !Array.isArray(value);
  if (![astaSunAltitudeDeg, udayaSunAltitudeDeg].every(value =>
    Number.isFinite(value) || isProfile(value))) {
    throw new RangeError("Asta and Udaya solar-altitude thresholds are required");
  }
  const samples = [];
  for (let index = 0; index < days; index++) {
    const localDayStartUtc = startLocalDayUtc + index * 86_400_000;
    const sample = measureSunAltitudeAtTargetRiseSet({
      SearchRiseSet, SearchAltitude, Equator, Horizon, body, observer, branch, localDayStartUtc
    });
    samples.push({
      dayStartUtc: localDayStartUtc,
      ...sample,
      motionState: sample.available && typeof motionStateAt === "function"
        ? motionStateAt(body, sample.bodyEventUtcMs)
        : body === "Star1" ? "fixed-star" : "direct"
    });
  }
  const events = [];
  for (let index = 1; index < samples.length; index++) {
    const before = samples[index - 1], after = samples[index];
    if (!before.available || !after.available) continue;
    // Never bridge a Venus station: direct and retrograde apparitions have
    // independent fitted thresholds and must be evaluated on their own side.
    if (before.motionState !== after.motionState) continue;
    const astaThreshold = thresholdForMotion(astaSunAltitudeDeg, after.motionState);
    const udayaThreshold = thresholdForMotion(udayaSunAltitudeDeg, after.motionState);
    const delta = after.sunAltitudeDeg - before.sunAltitudeDeg;
    if (delta === 0) continue;
    const crossings = [];
    if (Number.isFinite(astaThreshold) &&
        before.sunAltitudeDeg < astaThreshold && after.sunAltitudeDeg >= astaThreshold) {
      crossings.push({ event: "Asta", threshold: astaThreshold });
    }
    if (Number.isFinite(udayaThreshold) &&
        before.sunAltitudeDeg > udayaThreshold && after.sunAltitudeDeg <= udayaThreshold) {
      crossings.push({ event: "Udaya", threshold: udayaThreshold });
    }
    for (const crossing of crossings) {
      if ((body === "Jupiter" || body === "Star1") &&
          !((crossing.event === "Asta" && branch === "set") ||
            (crossing.event === "Udaya" && branch === "rise"))) continue;
      const fraction = Math.max(0, Math.min(1,
        (crossing.threshold - before.sunAltitudeDeg) / delta
      ));
      // Report the first actual target rise/set event satisfying the boundary;
      // interpolation is diagnostic only and is never presented as an event time.
      const bodyEventUtcMs = after.bodyEventUtcMs;
      events.push({
        body, branch, event: crossing.event, motionState: after.motionState,
        thresholdSunAltitudeDeg: crossing.threshold,
        beforeSunAltitudeDeg: before.sunAltitudeDeg,
        afterSunAltitudeDeg: after.sunAltitudeDeg,
        fraction,
        interpolatedUtcMilliseconds: null,
        utcMilliseconds: Math.round(bodyEventUtcMs),
        utc: new Date(bodyEventUtcMs).toISOString()
      });
    }
  }
  return { samples, events };
}

export function azimuthSeparationDegrees(azimuthA, azimuthB) {
  if (![azimuthA, azimuthB].every(Number.isFinite)) return NaN;
  return Math.abs(((azimuthA - azimuthB + 540) % 360) - 180);
}

export function fitTheilSenLine(points) {
  const valid = points.filter(point =>
    Number.isFinite(point.x) && Number.isFinite(point.y)
  );
  if (valid.length < 2) return null;
  const slopes = [];
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const dx = valid[j].x - valid[i].x;
      if (Math.abs(dx) > 1e-9) slopes.push((valid[j].y - valid[i].y) / dx);
    }
  }
  if (!slopes.length) return null;
  const slope = median(slopes);
  const intercept = median(valid.map(point => point.y - slope * point.x));
  return { slope, intercept, samples: valid.length };
}

/**
 * Agastya/Canopus uses a geometric 0-degree center crossing. Its Drik
 * boundary is fitted separately as Sun altitude versus horizontal azimuth
 * separation at that crossing; it is not mixed with planet thresholds.
 */
export function scanDrikStarAzimuthTransitions({
  SearchAltitude, Equator, Horizon, body = "Star1", observer, branch,
  startLocalDayUtc, days, event, slope, intercept
}) {
  if (typeof SearchAltitude !== "function" || typeof Equator !== "function" ||
      typeof Horizon !== "function") throw new TypeError("SearchAltitude, Equator and Horizon are required");
  if (!Number.isInteger(days) || days < 2) throw new RangeError("days must be an integer >= 2");
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) {
    throw new RangeError("finite azimuth model slope and intercept are required");
  }
  if (!((event === "Udaya" && branch === "rise") ||
        (event === "Asta" && branch === "set"))) {
    throw new RangeError("Agastya Udaya requires rise; Asta requires set");
  }
  const samples = [];
  for (let index = 0; index < days; index++) {
    const dayStartUtc = startLocalDayUtc + index * 86_400_000;
    const found = SearchAltitude(body, observer, branch === "rise" ? 1 : -1,
      new Date(dayStartUtc), 1, 0);
    const instant = found?.date instanceof Date ? found.date.getTime()
      : found?.date ? new Date(found.date).getTime()
      : NaN;
    if (!Number.isFinite(instant) || instant < dayStartUtc ||
        instant >= dayStartUtc + 86_400_000) {
      samples.push({ dayStartUtc, available: false });
      continue;
    }
    const date = new Date(instant);
    const sunEquator = Equator("Sun", date, observer, true, true);
    const bodyEquator = Equator(body, date, observer, true, true);
    const sunHorizon = Horizon(date, observer, sunEquator.ra, sunEquator.dec, "normal");
    const bodyHorizon = Horizon(date, observer, bodyEquator.ra, bodyEquator.dec, "normal");
    const azimuthSeparationDeg = azimuthSeparationDegrees(
      bodyHorizon.azimuth, sunHorizon.azimuth
    );
    const thresholdSunAltitudeDeg = slope * azimuthSeparationDeg + intercept;
    const sunAltitudeDeg = sunHorizon.altitude;
    samples.push({
      dayStartUtc, available: true, bodyEventUtcMs: instant,
      sunAltitudeDeg, bodyAltitudeDeg: bodyHorizon.altitude,
      azimuthSeparationDeg, thresholdSunAltitudeDeg,
      residualDeg: sunAltitudeDeg - thresholdSunAltitudeDeg
    });
  }
  const events = [];
  for (let index = 1; index < samples.length; index++) {
    const before = samples[index - 1], after = samples[index];
    if (!before.available || !after.available) continue;
    const crossed = event === "Udaya"
      ? before.residualDeg > 0 && after.residualDeg <= 0
      : before.residualDeg < 0 && after.residualDeg >= 0;
    if (!crossed) continue;
    // The published clock is the actual geometric star event on the first
    // qualifying local date; no interpolation between daily star events.
    events.push({
      body, branch, event,
      thresholdSunAltitudeDeg: after.thresholdSunAltitudeDeg,
      azimuthSeparationDeg: after.azimuthSeparationDeg,
      beforeResidualDeg: before.residualDeg,
      afterResidualDeg: after.residualDeg,
      utcMilliseconds: Math.round(after.bodyEventUtcMs),
      utc: new Date(after.bodyEventUtcMs).toISOString()
    });
  }
  return { samples, events };
}

export function clockOfDayDifferenceMinutes(predictedUtcMs, observedUtcMs, utcOffsetMinutes = 330) {
  const predictedLocal = new Date(predictedUtcMs + utcOffsetMinutes * 60_000);
  const observedLocal = new Date(observedUtcMs + utcOffsetMinutes * 60_000);
  const predictedMinute = predictedLocal.getUTCHours() * 60 + predictedLocal.getUTCMinutes() +
    predictedLocal.getUTCSeconds() / 60;
  const observedMinute = observedLocal.getUTCHours() * 60 + observedLocal.getUTCMinutes() +
    observedLocal.getUTCSeconds() / 60;
  return ((predictedMinute - observedMinute + 720 + 1440) % 1440) - 720;
}

export function median(values) {
  const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function summarizeCalibration(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!row.available) continue;
    const key = [row.body, row.branch, row.eventType].join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([key, items]) => {
    const residuals = items.map(item => item.bodyEventResidualMinutes);
    const trusted = items.filter(item => item.sourceId?.startsWith("drikpanchang") && item.bodyEventResidualMinutes <= 15);
    const gaps = trusted.map(item => item.calibratedTimeDegrees);
    return {
      key,
      body: items[0].body,
      branch: items[0].branch,
      eventType: items[0].eventType,
      samples: items.length,
      thresholdFitSamples: trusted.length,
      medianThresholdDegrees: median(gaps),
      medianBodyEventResidualMinutes: median(residuals),
      maxBodyEventResidualMinutes: Math.max(...residuals),
      sourceIds: trusted.map(item => item.id),
      excludedSourceIds: items.filter(item => item.bodyEventResidualMinutes > 15).map(item => item.id)
    };
  });
}
