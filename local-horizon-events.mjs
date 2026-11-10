const DAY_MS = 86400000;

export const PANCHANG_BODIES = Object.freeze([
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"
]);

function assertLocalDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError("localDate must use YYYY-MM-DD");
  }
  const [year, month, day] = value.split("-").map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year ||
      check.getUTCMonth() + 1 !== month ||
      check.getUTCDate() !== day) {
    throw new RangeError("localDate is not a valid Gregorian date");
  }
  return { year, month, day };
}

function nextDateString(localDate) {
  const { year, month, day } = assertLocalDate(localDate);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return [
    String(next.getUTCFullYear()).padStart(4, "0"),
    String(next.getUTCMonth() + 1).padStart(2, "0"),
    String(next.getUTCDate()).padStart(2, "0")
  ].join("-");
}

function zonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  return Object.fromEntries(
    formatter.formatToParts(date)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  );
}

/**
 * Converts a wall-clock local midnight to UTC without assuming a fixed
 * UTC offset. This handles 23/25-hour civil days in DST-observing zones.
 */
function localMidnightToUtc(localDate, timeZone) {
  const { year, month, day } = assertLocalDate(localDate);
  const targetWallClock = Date.UTC(year, month - 1, day);
  let guess = targetWallClock;

  for (let iteration = 0; iteration < 6; iteration++) {
    const parts = zonedParts(new Date(guess), timeZone);
    const representedWallClock = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    const correction = targetWallClock - representedWallClock;
    if (correction === 0) {
      const result = new Date(guess);
      const verified = zonedParts(result, timeZone);
      if (verified.year === String(year).padStart(4, "0") &&
          verified.month === String(month).padStart(2, "0") &&
          verified.day === String(day).padStart(2, "0") &&
          verified.hour === "00" &&
          verified.minute === "00" &&
          verified.second === "00") {
        return result;
      }
      break;
    }
    guess += correction;
  }

  throw new RangeError(
    "Local midnight cannot be represented for " + localDate + " in " + timeZone
  );
}

function formatLocal(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return {
    date: parts.year + "-" + parts.month + "-" + parts.day,
    time: parts.hour + ":" + parts.minute + ":" + parts.second
  };
}

function validateObserver(observer) {
  if (!observer ||
      !Number.isFinite(observer.latitude) ||
      !Number.isFinite(observer.longitude) ||
      !Number.isFinite(observer.height)) {
    throw new TypeError("observer must contain finite latitude, longitude and height");
  }
  if (observer.latitude < -90 || observer.latitude > 90 ||
      observer.longitude < -180 || observer.longitude > 180 ||
      observer.height < -500 || observer.height > 100000) {
    throw new RangeError("observer coordinates or elevation are outside supported bounds");
  }
}

function validateAstronomy(astronomy) {
  if (!astronomy || typeof astronomy.SearchRiseSet !== "function") {
    throw new TypeError("astronomy.SearchRiseSet is required");
  }
}

function findEvent({
  astronomy,
  body,
  observer,
  direction,
  start,
  end,
  timeZone,
  metersAboveGround
}) {
  const searchStart = new Date(start.getTime() - 1);
  const localDayLength = (end.getTime() - start.getTime()) / DAY_MS;
  const result = astronomy.SearchRiseSet(
    body,
    observer,
    direction,
    searchStart,
    localDayLength + 0.001,
    metersAboveGround
  );
  const instant = result?.date instanceof Date
    ? result.date
    : result instanceof Date
      ? result
      : null;

  if (!instant || !Number.isFinite(instant.getTime()) ||
      instant < start || instant >= end) {
    return null;
  }

  const local = formatLocal(instant, timeZone);
  return Object.freeze({
    instant: instant.toISOString(),
    localDate: local.date,
    localTime: local.time,
    direction: direction === 1 ? "rise" : "set"
  });
}

/**
 * Finds topocentric rise and set events within one local civil date.
 *
 * Astronomy Engine SearchRiseSet applies its standard 34-arcminute
 * atmospheric-refraction correction and the body's apparent semidiameter
 * (material for Sun and Moon). Planets are treated as point sources.
 * Observer.height is elevation above mean sea level; metersAboveGround is
 * separately supplied and defaults to zero. Terrain obstruction and
 * weather-specific refraction are not modelled.
 *
 * This is a local-horizon rise/set engine. For Panchanga Tara Asta windows,
 * a separate visibility-date selector is required; do not confuse the two.
 */
export function findLocalRiseSet({
  astronomy,
  body,
  observer,
  localDate,
  timeZone = "Asia/Kolkata",
  metersAboveGround = 0
}) {
  validateAstronomy(astronomy);
  if (!PANCHANG_BODIES.includes(body)) {
    throw new RangeError("body must be one of: " + PANCHANG_BODIES.join(", "));
  }
  validateObserver(observer);
  assertLocalDate(localDate);
  if (typeof timeZone !== "string" || !timeZone.trim()) {
    throw new TypeError("timeZone is required");
  }
  if (!Number.isFinite(metersAboveGround) ||
      metersAboveGround < 0 || metersAboveGround > 100000) {
    throw new RangeError("metersAboveGround must be between 0 and 100000");
  }

  // Validate the IANA time-zone identifier before doing any astronomy work.
  new Intl.DateTimeFormat("en", { timeZone }).format(new Date(0));

  const start = localMidnightToUtc(localDate, timeZone);
  const end = localMidnightToUtc(nextDateString(localDate), timeZone);

  const rise = findEvent({
    astronomy, body, observer, direction: 1,
    start, end, timeZone, metersAboveGround
  });
  const set = findEvent({
    astronomy, body, observer, direction: -1,
    start, end, timeZone, metersAboveGround
  });

  return Object.freeze({
    body,
    localDate,
    timeZone,
    observer: Object.freeze({
      latitude: observer.latitude,
      longitude: observer.longitude,
      elevationMeters: observer.height
    }),
    rise,
    set,
    status: rise && set
      ? "both-events-found"
      : rise
        ? "rise-only"
        : set
          ? "set-only"
          : "no-event-in-local-day",
    method: "astronomy-engine-search-rise-set"
  });
}

/** Calculates daily local-horizon events for the seven Panchang bodies. */
export function findDailyPanchangRiseSet({
  astronomy,
  observer,
  localDate,
  timeZone = "Asia/Kolkata",
  bodies = PANCHANG_BODIES,
  metersAboveGround = 0
}) {
  if (!Array.isArray(bodies) || bodies.length === 0 ||
      bodies.some(body => !PANCHANG_BODIES.includes(body)) ||
      new Set(bodies).size !== bodies.length) {
    throw new TypeError("bodies must be a non-empty unique subset of PANCHANG_BODIES");
  }
  return bodies.map(body => findLocalRiseSet({
    astronomy, body, observer, localDate, timeZone, metersAboveGround
  }));
}
