// Shared approved-only helpers for the monthly religious calendar.
// This module intentionally contains no candidate-generation or astronomical logic.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_INSTANT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

function validDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const date = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validInstant(value) {
  return typeof value === "string" && ISO_INSTANT_RE.test(value) && Number.isFinite(Date.parse(value));
}

function isPublicApprovedRecord(record) {
  if (!record || record.status !== "approved" || !validDate(record.date)) return false;
  if (typeof record.id !== "string" || !record.id.trim()) return false;
  if (typeof record.label !== "string" || !record.label.trim()) return false;
  if (!validInstant(record.start) || !validInstant(record.end)) return false;
  return Date.parse(record.start) < Date.parse(record.end);
}

export function getApprovedSpecialPunyaKaalForMonth(records, year, month) {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return [];
  if (!Array.isArray(records)) return [];
  const prefix = String(y).padStart(4, "0") + "-" + String(m).padStart(2, "0") + "-";
  return records
    .filter((record) => isPublicApprovedRecord(record) && record.date.startsWith(prefix))
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
}

export function hasApprovedSpecialPunyaKaalInMonth(records, year, month) {
  return getApprovedSpecialPunyaKaalForMonth(records, year, month).length > 0;
}

export function getApprovedSpecialPunyaKaalForDate(records, date) {
  if (!validDate(date) || !Array.isArray(records)) return [];
  return records
    .filter((record) => isPublicApprovedRecord(record) && record.date === date)
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
}

export function buildMonthlyReligiousCalendarUrl(baseUrl, year, month) {
  const y = Number(year);
  const m = Number(month);
  if (typeof baseUrl !== "string" || !baseUrl.trim()) throw new TypeError("A monthly calendar URL is required");
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    throw new RangeError("A valid year and month are required");
  }
  const url = new URL(baseUrl);
  url.searchParams.set("year", String(y));
  url.searchParams.set("month", String(m).padStart(2, "0"));
  url.hash = "special-punya-kaal";
  return url.toString();
}
