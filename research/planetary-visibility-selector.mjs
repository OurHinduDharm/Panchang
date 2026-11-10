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
  if (!Number.isFinite(model?.intercept) || !Number.isFinite(model?.slope)) {
    throw new TypeError("model.intercept and model.slope must be finite numbers");
  }
  if (!Number.isInteger(searchDays) || searchDays < 2 || searchDays > 90) {
    throw new RangeError("searchDays must be an integer from 2 to 90");
  }
  if (!Number.isFinite(new Date(anchorDate).getTime())) throw new TypeError("anchorDate must be a valid date");
  if (typeof timeZone !== "string" || !timeZone) throw new TypeError("timeZone is required");
}

/**
 * Research-only event selector.
 *
 * The model estimates the Sun's refracted altitude at the local planetary
 * horizon event as a linear function of the planet's apparent magnitude:
 *   sunAltitude = intercept + slope * apparentMagnitude
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
    const apparentMagnitude = astronomy.Illumination(body, date).mag;
    const thresholdAltitude = model.intercept + model.slope * apparentMagnitude;
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
