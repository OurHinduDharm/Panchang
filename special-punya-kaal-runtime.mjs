/**
 * On-demand special punya-kaal month scanner.
 *
 * This replaces pre-generated annual/monthly date lists as the calculation
 * source. It calculates Panchang intervals for the selected month plus one
 * boundary day on either side, then passes those intervals to the reviewed
 * rule engines.
 *
 * IMPORTANT: output is research-only. Calculation is not religious/source
 * approval. Public UI must filter by an independently approved rule profile.
 */
import {
  buildVaruniCandidates
} from "./special-punya-kaal.mjs";

const TIMEZONE_OFFSET_MINUTES = 330;
const CALENDAR_OPTIONS = Object.freeze({
  timezoneOffset: TIMEZONE_OFFSET_MINUTES,
  calendarType: "purnimanta"
});

function validYearMonth(year, month) {
  return Number.isInteger(year) && year >= 1900 && year <= 2200 &&
    Number.isInteger(month) && month >= 1 && month <= 12;
}

function isoDate(year, month, day) {
  const value = new Date(Date.UTC(year, month - 1, day));
  return value.toISOString().slice(0, 10);
}

function shiftDate(value, amount) {
  const [year, month, day] = value.split("-").map(Number);
  return isoDate(year, month, day + amount);
}

function dateAtISTNoon(value) {
  return new Date(value + "T12:00:00+05:30");
}

function toIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function nameOf(value) {
  if (value && typeof value === "object") {
    return String(value.name ?? value.value ?? value.label ?? "");
  }
  return String(value ?? "");
}

function normalizeIntervals(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    index: Number(item?.index),
    name: item?.name ?? null,
    paksha: item?.paksha ?? null,
    startTime: toIso(item?.startTime ?? item?.start),
    endTime: toIso(item?.endTime ?? item?.end)
  })).filter(item =>
    Number.isInteger(item.index) &&
    item.startTime &&
    item.endTime &&
    Date.parse(item.endTime) > Date.parse(item.startTime)
  );
}

function normalizePanchangDay(date, p) {
  return {
    date,
    masa: nameOf(p?.masa ?? p?.month),
    paksha: nameOf(p?.paksha),
    sunrise: toIso(p?.sunrise),
    sunset: toIso(p?.sunset),
    tithis: normalizeIntervals(p?.tithis),
    nakshatras: normalizeIntervals(p?.nakshatras),
    yogas: normalizeIntervals(p?.yogas)
  };
}

/**
 * Calculate candidate intervals for one selected civil month.
 *
 * getPanchangam is injected so the scanner can use the exact same Panchang
 * library/version as the calling page and can be unit-tested without CDN.
 * One day before/after is included to preserve intervals crossing month edges.
 */
export async function calculateSpecialPunyaKaalMonth({
  year,
  month,
  getPanchangam,
  observer,
  timezoneOffsetMinutes = TIMEZONE_OFFSET_MINUTES,
  calendarType = "purnimanta"
}) {
  if (!validYearMonth(year, month)) {
    throw new RangeError("A valid year and month are required");
  }
  if (typeof getPanchangam !== "function") {
    throw new TypeError("getPanchangam must be a function");
  }
  if (!observer) throw new TypeError("A Panchang observer is required");
  if (timezoneOffsetMinutes !== TIMEZONE_OFFSET_MINUTES || calendarType !== "purnimanta") {
    throw new RangeError("Only the approved IST/Purnimanta calculation profile is supported");
  }

  // Varuni is tied to Chaitra Krishna Trayodashi + Shatabhisha. Across the
  // supported Purnimanta calendar this conjunction falls in the March–April
  // civil-date envelope. Outside that envelope, do not load/call the ephemeris.
  // Mahodaya is deliberately not scanned: its source profile is not approved.
  if (month !== 3 && month !== 4) {
    return {
      status: "research-only-not-approved",
      calculationStatus: "not-applicable",
      year,
      month,
      calendarType,
      timezoneOffsetMinutes,
      panchangCalls: 0,
      scannedDays: 0,
      diagnostics: [],
      candidates: [],
      skippedReason: "no-approved-rule-profile-for-gregorian-month"
    };
  }

  const firstDate = isoDate(year, month, 1);
  const monthEnd = isoDate(year, month + 1, 1);
  const scanStart = shiftDate(firstDate, -1);
  const scanEnd = monthEnd;
  const days = [];
  const diagnostics = [];
  let panchangCalls = 0;

  for (let date = scanStart; date <= scanEnd; date = shiftDate(date, 1)) {
    const p = await getPanchangam(
      dateAtISTNoon(date),
      observer,
      CALENDAR_OPTIONS
    );
    panchangCalls += 1;
    const record = normalizePanchangDay(date, p || {});
    const missing = [];
    if (!record.sunrise) missing.push("sunrise");
    if (!record.sunset) missing.push("sunset");
    if (!record.tithis.length) missing.push("tithis");
    if (!record.nakshatras.length) missing.push("nakshatras");
    if (!record.yogas.length) missing.push("yogas");
    if (missing.length) diagnostics.push({ date, missing });
    days.push(record);
  }

  const monthStartInstant = Date.parse(firstDate + "T00:00:00+05:30");
  const monthEndInstant = Date.parse(monthEnd + "T00:00:00+05:30");
  const overlapsSelectedMonth = item =>
    Date.parse(item.endTime) > monthStartInstant &&
    Date.parse(item.startTime) < monthEndInstant;
  // Missing Panchang intervals anywhere in the scan make the month incomplete.
  // Never publish a partial candidate list that could omit an event silently.
  const candidates = diagnostics.length ? [] : [
    ...buildVaruniCandidates(days, { timezoneOffsetMinutes })
  ].filter(overlapsSelectedMonth).sort((a, b) =>
    a.startTime.localeCompare(b.startTime) || a.date.localeCompare(b.date)
  );

  return {
    status: "research-only-not-approved",
    calculationStatus: diagnostics.length ? "incomplete" : "complete",
    year,
    month,
    calendarType,
    timezoneOffsetMinutes,
    panchangCalls,
    scannedDays: days.length,
    diagnostics,
    candidates
  };
}
