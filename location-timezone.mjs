const formatterCache = new Map();

function formatterFor(timeZone) {
  if (!formatterCache.has(timeZone)) {
    formatterCache.set(timeZone, new Intl.DateTimeFormat("en-CA-u-ca-iso8601-nu-latn", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }));
  }
  return formatterCache.get(timeZone);
}

function partsOf(value, timeZone) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError("A valid date is required");
  const parts = Object.fromEntries(formatterFor(timeZone).formatToParts(date)
    .filter(part => part.type !== "literal")
    .map(part => [part.type, Number(part.value)]));
  return parts;
}

export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || !timeZone.trim()) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function getTimeZoneOffsetMinutes(value, timeZone) {
  if (!isValidTimeZone(timeZone)) throw new RangeError("A valid IANA time zone is required");
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError("A valid date is required");
  const parts = partsOf(date, timeZone);
  const representedUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((representedUtc - date.getTime()) / 60000);
}

export function getIsoDateInTimeZone(value, timeZone) {
  if (!isValidTimeZone(timeZone)) throw new RangeError("A valid IANA time zone is required");
  const parts = partsOf(value, timeZone);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function addIsoCalendarDays(value, amount) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match || !Number.isInteger(amount)) throw new TypeError("A valid ISO date and integer day offset are required");
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + amount));
  return date.toISOString().slice(0, 10);
}

export function zonedDateTimeToUtc(isoDate, hour, minute, timeZone) {
  const match = String(isoDate ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match || !Number.isInteger(hour) || hour < 0 || hour > 23 ||
      !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new TypeError("A valid ISO date and local clock time are required");
  }
  if (!isValidTimeZone(timeZone)) throw new RangeError("A valid IANA time zone is required");
  const [year, month, day] = match.slice(1).map(Number);
  const nominalUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let candidate = new Date(nominalUtc);
  // Iteration resolves the offset at the target instant, including DST changes.
  for (let attempt = 0; attempt < 3; attempt++) {
    const offset = getTimeZoneOffsetMinutes(candidate, timeZone);
    const corrected = new Date(nominalUtc - offset * 60000);
    if (corrected.getTime() === candidate.getTime()) break;
    candidate = corrected;
  }
  return candidate;
}

export function getTimeZoneOffsetForLocalDay(value, timeZone) {
  const localDate = getIsoDateInTimeZone(value, timeZone);
  const localMidnight = zonedDateTimeToUtc(localDate, 0, 0, timeZone);
  return getTimeZoneOffsetMinutes(localMidnight, timeZone);
}

export function getWeekdayForIsoDate(isoDate) {
  const match = String(isoDate ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new TypeError("A valid ISO date is required");
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)).getUTCDay();
}
