/**
 * Drik-Ganita time-separation model — research prototype.
 *
 * Uses modern apparent positions and the observer's local geometric-horizon
 * crossing times. It does not implement Surya-Siddhanta Ch.9 K/C and does not
 * model naked-eye/photometric visibility.
 *
 * SearchAltitude is injected so the module remains easy to test and the
 * browser can reuse the already-loaded Astronomy Engine instance.
 */

const MINUTES_PER_KALA = 4;

const PLANET_BODY = Object.freeze({
  "शुक्र": "Venus",
  "बृहस्पति": "Jupiter",
  "गुरु": "Jupiter",
  "मंगल": "Mars",
  "बुध": "Mercury",
  "शनि": "Saturn",
  "अगस्त्य": "Star1"
});

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
export function parsePrintedClock(dateIso, raw, qualifier = null) {
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
  const instantUtcMs = Date.UTC(date.year, date.month - 1, date.day) + totalMinutes * 60_000;
  return {
    valid: true,
    instantUtcMs,
    dayRollover,
    minuteOfDay,
    normalizedUtc: new Date(instantUtcMs).toISOString()
  };
}

export function resolveDrikHorizonBranch({ planet, event, direction }) {
  const normalizedDirection = String(direction || "").trim().toLowerCase();
  if (normalizedDirection === "पूर्व" || normalizedDirection === "east") return "rise";
  if (normalizedDirection === "पश्चिम" || normalizedDirection === "west") return "set";

  const body = PLANET_BODY[planet] || planet;
  if (/^अस्त(?: प्रारम्भ| क्षण)?$/.test(event || "") || event === "Asta") {
    if (body === "Jupiter" || body === "Mars" || body === "Saturn" || body === "Star1") return "set";
  }
  if (event === "उदय" || event === "अस्त समाप्त" || event === "अगस्त्योदय" || event === "Udaya") {
    if (body === "Jupiter" || body === "Mars" || body === "Saturn" || body === "Star1") return "rise";
  }
  return null;
}

export function sourceObservationToReference(observation) {
  const clock = parsePrintedClock(
    observation.date,
    observation.timeRaw,
    observation.timeQualifierRaw
  );
  const branch = resolveDrikHorizonBranch(observation);
  const body = PLANET_BODY[observation.planet] || null;
  return {
    id: observation.id,
    sourceId: observation.sourceId,
    planet: observation.planet,
    body,
    event: observation.event,
    branch,
    direction: observation.direction || null,
    clock,
    usableForCalibration: clock.valid && Boolean(branch) && Boolean(body)
  };
}

/**
 * Search a body's geometric centre crossing of the local horizon.
 * altitude=0 means geometric horizon: no refraction/brightness model.
 */
export function findGeometricHorizonEvent({
  SearchAltitude, body, observer, direction, localDayStartUtc
}) {
  if (typeof SearchAltitude !== "function") throw new TypeError("SearchAltitude function is required");
  if (!observer || !Number.isFinite(localDayStartUtc)) throw new TypeError("observer and local-day start are required");
  const event = SearchAltitude(body, observer, direction === "rise" ? 1 : -1,
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
 * The gap between the Sun's and planet's corresponding horizon crossings.
 * 1 kala-degree = 4 minutes of time, used as a calibration coordinate.
 */
export function measureDrikTimeSeparation({
  SearchAltitude, body, observer, branch, localDayStartUtc
}) {
  const sunEventUtcMs = findGeometricHorizonEvent({
    SearchAltitude, body: "Sun", observer, direction: branch, localDayStartUtc
  });
  const bodyEventUtcMs = findGeometricHorizonEvent({
    SearchAltitude, body, observer, direction: branch, localDayStartUtc
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
    timeDegrees: gapMinutes / MINUTES_PER_KALA
  };
}

/**
 * Convert a source boundary into an empirical time-separation benchmark.
 * It checks the printed time against the body's geometric horizon event
 * and reports both the solar gap and the body-event clock residual.
 */
export function calibrateObservation({
  observation, SearchAltitude, observer, localDayStartUtc
}) {
  const ref = sourceObservationToReference(observation);
  if (!ref.usableForCalibration) {
    return { ...ref, available: false, reason: "source-record-not-calibratable" };
  }
  const sunEventUtcMs = findGeometricHorizonEvent({
    SearchAltitude, body: "Sun", observer, direction: ref.branch, localDayStartUtc
  });
  const bodyEventUtcMs = findGeometricHorizonEvent({
    SearchAltitude, body: ref.body, observer, direction: ref.branch, localDayStartUtc
  });
  if (sunEventUtcMs === null || bodyEventUtcMs === null) {
    return { ...ref, available: false, reason: "horizon-event-not-found" };
  }
  const sourceVsBodyMinutes = (ref.clock.instantUtcMs - bodyEventUtcMs) / 60_000;
  const sourceVsSunMinutes = (ref.clock.instantUtcMs - sunEventUtcMs) / 60_000;
  return {
    ...ref,
    available: true,
    sunEventUtcMs,
    bodyEventUtcMs,
    sourceVsBodyMinutes,
    sourceVsSunMinutes,
    calibratedTimeDegrees: Math.abs(sourceVsSunMinutes) / MINUTES_PER_KALA,
    bodyEventResidualMinutes: Math.abs(sourceVsBodyMinutes)
  };
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
    const key = [row.body, row.branch].join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([key, items]) => {
    const gaps = items.map(item => item.calibratedTimeDegrees);
    const residuals = items.map(item => item.bodyEventResidualMinutes);
    const centre = median(gaps);
    return {
      key,
      body: items[0].body,
      branch: items[0].branch,
      samples: items.length,
      medianThresholdDegrees: centre,
      medianBodyEventResidualMinutes: median(residuals),
      maxBodyEventResidualMinutes: Math.max(...residuals),
      sourceIds: items.map(item => item.id)
    };
  });
}
