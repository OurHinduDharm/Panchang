const DAY_MS = 86400000;
const HALF_DAY_MS = 12 * 3600000;

function localParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function localDateTime(date, timeZone) {
  const parts = localParts(date, timeZone);
  return {
    date: parts.year + "-" + parts.month + "-" + parts.day,
    time: parts.hour + ":" + parts.minute + ":" + parts.second
  };
}

function dayNumber(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function thresholdAltitudeForModel(model, observables) {
  if (model.coefficients && typeof model.coefficients === "object") {
    return Object.entries(model.coefficients).reduce((sum, [key, coefficient]) => {
      const value = observables[key];
      if (!Number.isFinite(value)) {
        throw new TypeError("Missing finite visibility feature: " + key);
      }
      return sum + coefficient * value;
    }, model.intercept);
  }
  return model.intercept + model.slope * observables.apparentMagnitude;
}

function validateInput({ astronomy, body, observer, anchorDate, direction, boundaryName, model, searchDays, timeZone }) {
  if (!astronomy || typeof astronomy.SearchRiseSet !== "function" ||
      typeof astronomy.Equator !== "function" || typeof astronomy.Horizon !== "function" ||
      typeof astronomy.Illumination !== "function") {
    throw new TypeError("A compatible Astronomy Engine namespace is required");
  }
  if (!body || !observer) throw new TypeError("body and observer are required");
  if (direction !== 1 && direction !== -1) throw new RangeError("direction must be 1 (rise) or -1 (set)");
  if (boundaryName !== "astaStart" && boundaryName !== "astaEnd") {
    throw new RangeError("boundaryName must be astaStart or astaEnd");
  }
  const hasLinearMagnitudeModel = Number.isFinite(model?.intercept) && Number.isFinite(model?.slope);
  const hasFeatureModel = Number.isFinite(model?.intercept) &&
    model?.coefficients && typeof model.coefficients === "object" &&
    Object.keys(model.coefficients).length > 0 &&
    Object.values(model.coefficients).every(Number.isFinite);
  if (!hasLinearMagnitudeModel && !hasFeatureModel) {
    throw new TypeError("model must contain finite intercept/slope or finite feature coefficients");
  }
  if (!Number.isInteger(searchDays) || searchDays < 2 || searchDays > 200) {
    throw new RangeError("searchDays must be an integer from 2 to 200");
  }
  if (!Number.isFinite(new Date(anchorDate).getTime())) throw new TypeError("anchorDate must be a valid date");
  if (typeof timeZone !== "string" || !timeZone) throw new TypeError("timeZone is required");
}

/**
 * Research-only event selector.
 *
 * The model estimates the Sun's refracted altitude at the local planetary
 * horizon event. It accepts either a magnitude-only linear fit
 * (intercept + slope * apparentMagnitude) or an intercept plus named feature
 * coefficients such as apparentMagnitude and elongationDegrees.
 *
 * anchorDate is only a search-window centre. It is not used to fit the model.
 * Production use still requires an independent way to derive the search
 * window (for example, a conjunction search) and validated coefficients for
 * the observer's location and atmosphere.
 */
export function findVisibilityBoundaryNearAnchor({
  astronomy,
  body,
  observer,
  anchorDate,
  direction,
  boundaryName,
  model,
  searchDays = 20,
  timeZone = "Asia/Kolkata"
}) {
  validateInput({ astronomy, body, observer, anchorDate, direction, boundaryName, model, searchDays, timeZone });

  const anchor = new Date(anchorDate);
  const samples = [];

  for (let dayOffset = -searchDays; dayOffset <= searchDays; dayOffset++) {
    const searchStart = new Date(anchor.getTime() + dayOffset * DAY_MS - HALF_DAY_MS);
    const event = astronomy.SearchRiseSet(body, observer, direction, searchStart, 1, 0);
    if (!event?.date) continue;

    const date = event.date;
    const sun = astronomy.Equator("Sun", date, observer, true, true);
    const planet = astronomy.Equator(body, date, observer, true, true);
    const sunAltitude = astronomy.Horizon(date, observer, sun.ra, sun.dec, "normal").altitude;
    const planetAltitude = astronomy.Horizon(date, observer, planet.ra, planet.dec, "normal").altitude;
    const illumination = astronomy.Illumination(body, date);
    const apparentMagnitude = illumination.mag;
    const observables = {
      apparentMagnitude,
      elongationDegrees: typeof astronomy.AngleFromSun === "function"
        ? astronomy.AngleFromSun(body, date)
        : null,
      illuminatedFraction: illumination.phase_fraction
    };
    const thresholdAltitude = thresholdAltitudeForModel(model, observables);
    const local = localDateTime(date, timeZone);

    samples.push({
      dayOffset,
      localDate: local.date,
      localTime: local.time,
      eventUTC: date.toISOString(),
      sunAltitude,
      planetAltitude,
      apparentMagnitude,
      thresholdAltitude,
      residual: sunAltitude - thresholdAltitude
    });
  }

  samples.sort((a, b) => a.dayOffset - b.dayOffset);
  const crossings = [];

  for (let i = 1; i < samples.length; i++) {
    const previous = samples[i - 1];
    const current = samples[i];
    const crossed = boundaryName === "astaStart"
      ? previous.residual < 0 && current.residual >= 0
      : previous.residual > 0 && current.residual <= 0;
    if (!crossed) continue;

    crossings.push({
      previous,
      current,
      signedDateOffsetDays: dayNumber(current.localDate) - dayNumber(localDateTime(anchor, timeZone).date)
    });
  }

  const status = crossings.length === 1
    ? "candidate"
    : crossings.length === 0
      ? "no-crossing"
      : "ambiguous";

  const selected = crossings.length === 1 ? crossings[0] : null;

  return {
    status,
    boundaryName,
    direction: direction === 1 ? "rise" : "set",
    searchDays,
    crossingCount: crossings.length,
    predictedBoundaryDate: selected?.current.localDate ?? null,
    predictedEventLocalTime: selected?.current.localTime ?? null,
    predictedEventUTC: selected?.current.eventUTC ?? null,
    signedDateOffsetDays: selected?.signedDateOffsetDays ?? null,
    sunAltitudeDegrees: selected ? Number(selected.current.sunAltitude.toFixed(5)) : null,
    planetAltitudeDegrees: selected ? Number(selected.current.planetAltitude.toFixed(5)) : null,
    apparentMagnitude: selected ? Number(selected.current.apparentMagnitude.toFixed(5)) : null,
    thresholdAltitudeDegrees: selected ? Number(selected.current.thresholdAltitude.toFixed(5)) : null,
    residualBeforeDegrees: selected ? Number(selected.previous.residual.toFixed(5)) : null,
    residualAfterDegrees: selected ? Number(selected.current.residual.toFixed(5)) : null
  };
}


/**
 * Finds the nearest relevant geocentric conjunction to an approximate date.
 *
 * The approximate date is only used to select the conjunction family/event;
 * the returned anchor itself is calculated from planetary relative longitude.
 * Inferior planets have both inferior (0°) and superior (180°) conjunctions.
 * Superior planets use their superior conjunction (180°).
 */
export function findNearestConjunctionAnchor({
  astronomy,
  body,
  approximateDate,
  maxDistanceDays = 90
}) {
  if (!astronomy || typeof astronomy.SearchRelativeLongitude !== "function") {
    throw new TypeError("A compatible Astronomy Engine SearchRelativeLongitude function is required");
  }
  if (!["Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(body)) {
    throw new RangeError("body must be Mercury, Venus, Mars, Jupiter, or Saturn");
  }
  const approximate = new Date(approximateDate);
  if (!Number.isFinite(approximate.getTime())) {
    throw new TypeError("approximateDate must be a valid date");
  }
  if (!Number.isFinite(maxDistanceDays) || maxDistanceDays < 10 || maxDistanceDays > 200) {
    throw new RangeError("maxDistanceDays must be from 10 to 200");
  }

  const targets = body === "Mercury" || body === "Venus" ? [0, 180] : [180];
  const start = new Date(approximate.getTime() - maxDistanceDays * DAY_MS);
  const finish = approximate.getTime() + maxDistanceDays * DAY_MS;
  const candidates = [];

  for (const targetRelLon of targets) {
    let cursor = start;
    for (let iteration = 0; iteration < 4; iteration++) {
      const event = astronomy.SearchRelativeLongitude(body, targetRelLon, cursor);
      const date = event?.date;
      if (!(date instanceof Date) || !Number.isFinite(date.getTime())) break;
      if (date.getTime() > finish) break;
      if (Math.abs(date.getTime() - approximate.getTime()) <= maxDistanceDays * DAY_MS) {
        candidates.push({ date, targetRelLon });
      }
      cursor = new Date(date.getTime() + 1000);
    }
  }

  candidates.sort((a, b) =>
    Math.abs(a.date.getTime() - approximate.getTime()) -
    Math.abs(b.date.getTime() - approximate.getTime())
  );

  const selected = candidates[0] ?? null;
  const ambiguous = candidates.length > 1 &&
    Math.abs(
      Math.abs(candidates[0].date.getTime() - approximate.getTime()) -
      Math.abs(candidates[1].date.getTime() - approximate.getTime())
    ) < DAY_MS;

  return {
    status: !selected ? "no-conjunction" : ambiguous ? "ambiguous" : "candidate",
    body,
    approximateDate: approximate.toISOString(),
    maxDistanceDays,
    candidateCount: candidates.length,
    targetRelativeLongitudeDegrees: ambiguous ? null : selected?.targetRelLon ?? null,
    conjunctionUTC: ambiguous ? null : selected?.date.toISOString() ?? null,
    signedOffsetDays: ambiguous ? null : selected
      ? Number(((selected.date.getTime() - approximate.getTime()) / DAY_MS).toFixed(4))
      : null
  };
}



/**
 * Enumerates conjunction-centred local Asta/Udaya candidates for a date range.
 * It does not use published Asta/Udaya dates to choose a search anchor.
 */
export function generateVisibilityWindows({
  astronomy,
  body,
  observer,
  modelByBoundary,
  startDate,
  endDate,
  searchDays = 60,
  timeZone = "Asia/Kolkata"
}) {
  if (!astronomy || typeof astronomy.SearchRelativeLongitude !== "function") {
    throw new TypeError("A compatible Astronomy Engine SearchRelativeLongitude function is required");
  }
  if (!["Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(body)) {
    throw new RangeError("body must be Mercury, Venus, Mars, Jupiter, or Saturn");
  }
  if (!observer) throw new TypeError("observer is required");
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    throw new TypeError("startDate and endDate must be valid and endDate must follow startDate");
  }
  if (!Number.isInteger(searchDays) || searchDays < 2 || searchDays > 90) {
    throw new RangeError("searchDays must be an integer from 2 to 90");
  }
  for (const boundaryName of ["astaStart", "astaEnd"]) {
    const model = modelByBoundary?.[boundaryName];
    const hasLinearMagnitudeModel = Number.isFinite(model?.intercept) && Number.isFinite(model?.slope);
    const hasFeatureModel = Number.isFinite(model?.intercept) &&
      model?.coefficients && typeof model.coefficients === "object" &&
      Object.keys(model.coefficients).length > 0 &&
      Object.values(model.coefficients).every(Number.isFinite);
    if (!hasLinearMagnitudeModel && !hasFeatureModel) {
      throw new TypeError("A finite model is required for " + boundaryName);
    }
  }

  const targets = body === "Mercury" || body === "Venus" ? [0, 180] : [180];
  const searchStart = new Date(start.getTime() - searchDays * DAY_MS);
  const searchFinish = new Date(end.getTime() + searchDays * DAY_MS);
  const windows = [];

  const synodicDays = {
    Mercury: 116,
    Venus: 584,
    Mars: 780,
    Jupiter: 399,
    Saturn: 378
  }[body];
  const maxEventsPerConjunctionFamily = Math.ceil(
    (searchFinish.getTime() - searchStart.getTime()) / DAY_MS / synodicDays
  ) + 2;

  for (const targetRelLon of targets) {
    let cursor = searchStart;
    for (let iteration = 0; iteration < maxEventsPerConjunctionFamily; iteration++) {
      const conjunction = astronomy.SearchRelativeLongitude(body, targetRelLon, cursor);
      const conjunctionDate = conjunction?.date;
      if (!(conjunctionDate instanceof Date) || !Number.isFinite(conjunctionDate.getTime())) break;
      if (conjunctionDate > searchFinish) break;

      const startDirection = (body === "Mercury" || body === "Venus") && targetRelLon === 180
        ? 1
        : -1;
      const endDirection = -startDirection;
      const asta = findVisibilityBoundaryNearAnchor({
        astronomy,
        body,
        observer,
        anchorDate: conjunctionDate,
        direction: startDirection,
        boundaryName: "astaStart",
        model: modelByBoundary.astaStart,
        searchDays,
        timeZone
      });
      const udaya = findVisibilityBoundaryNearAnchor({
        astronomy,
        body,
        observer,
        anchorDate: conjunctionDate,
        direction: endDirection,
        boundaryName: "astaEnd",
        model: modelByBoundary.astaEnd,
        searchDays,
        timeZone
      });

      const startInstant = asta.predictedEventUTC ? new Date(asta.predictedEventUTC) : null;
      const endInstant = udaya.predictedEventUTC ? new Date(udaya.predictedEventUTC) : null;
      const withinRange = instant =>
        instant && instant >= new Date(start.getTime() - searchDays * DAY_MS) &&
        instant <= new Date(end.getTime() + searchDays * DAY_MS);
      const hasBoth = asta.status === "candidate" && udaya.status === "candidate";
      windows.push({
        body,
        conjunctionType: targetRelLon === 0 ? "inferior" : "superior",
        conjunctionUTC: conjunctionDate.toISOString(),
        asta,
        udaya,
        status: !hasBoth
          ? "incomplete"
          : endInstant <= startInstant
            ? "invalid-order"
            : "candidate",
        intersectsRequestedRange: withinRange(startInstant) || withinRange(endInstant)
      });

      cursor = new Date(conjunctionDate.getTime() + 1000);
    }
  }

  return windows
    .filter(window => window.intersectsRequestedRange)
    .sort((a, b) => new Date(a.conjunctionUTC) - new Date(b.conjunctionUTC));
}

