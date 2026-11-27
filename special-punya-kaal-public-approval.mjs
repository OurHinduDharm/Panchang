import { mahapataPublicRecords } from "./data/special-punya-kaal/mahapata-2026-2030.mjs";

/**
 * Explicit public approval gate for special sadhana punya-kaal candidates.
 *
 * A matching calculation rule is not sufficient for public display: the
 * candidate must also match an individually reviewed local start date.
 */
const APPROVED_PROFILES = new Set([
  "chaitra-krishna-trayodashi-shatabhisha"
]);
const APPROVED_DATES = new Set([
  "2026-03-17",
  "2027-04-04",
  "2028-03-23",
  "2030-03-31"
]);
const APPROVED_LABELS = new Set([
  "वारुणी योग",
  "महावारुणी योग",
  "महामहावारुणी योग"
]);

export function isApprovedSpecialPunyaKaalCandidate(item) {
  if (!item || !APPROVED_PROFILES.has(item.ruleProfile) ||
      !APPROVED_DATES.has(item.date) ||
      !Array.isArray(item.labels) || !APPROVED_LABELS.has(item.labels[0])) {
    return false;
  }
  const start = Date.parse(item.startTime);
  const end = Date.parse(item.endTime);
  return Number.isFinite(start) && Number.isFinite(end) && end > start;
}

// The local runtime currently scans only March/April. No date outside
// APPROVED_DATES can pass the public gate. Keep both months eligible for
// reviewed years to preserve intervals crossing the March/April boundary.
export function mayHaveApprovedLocalPunyaKaal(year, month) {
  if (!Number.isInteger(year) || (month !== 3 && month !== 4)) return false;
  const prefix = String(year) + "-";
  return [...APPROVED_DATES].some(date => date.startsWith(prefix));
}

export const SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL = Object.freeze({
  profiles: Object.freeze([...APPROVED_PROFILES]),
  dates: Object.freeze([...APPROVED_DATES]),
  labels: Object.freeze([...APPROVED_LABELS])
});

// Generated primary-model intervals; release gated by independent cross-engine CI.
// Reference tables and research diagnostics are never imported into the public page.
const reviewedMahapata = mahapataPublicRecords;
const mahapataLabels = new Map([
  ["vyatipata-mahapat", "व्यतीपात महापात"],
  ["vaidhriti-mahapat", "वैधृति महापात"]
]);

export function publicSpecialPunyaKaalMonth(calculation, year, month, records = reviewedMahapata) {
  if (!Number.isInteger(year) || year < 1000 || year > 9999 ||
      !Number.isInteger(month) || month < 1 || month > 12) return [];
  const monthStart = Date.parse(String(year) + "-" + String(month).padStart(2, "0") + "-01T00:00:00+05:30");
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = monthStart + daysInMonth * 86400000;
  const events = calculation?.calculationStatus === "complete" && Array.isArray(calculation.candidates)
    ? calculation.candidates.filter(isApprovedSpecialPunyaKaalCandidate) : [];
  events.push(...approvedMahapataEvents(records).filter(item =>
    Date.parse(item.endTime) > monthStart && Date.parse(item.startTime) < monthEnd));
  return events.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
}

/** One canonical validation path for both monthly and upcoming cards. */
function approvedMahapataEvents(records) {
  const events = [];
  const seen = new Set();
  for (const record of records) {
    const label = mahapataLabels.get(record?.type);
    if (!label || record.status !== "approved" || record.ruleProfile !== "drik-geocentric-apparent-disks") continue;
    const start = Date.parse(record.start), end = Date.parse(record.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
        new Date(start).toISOString() !== record.start || new Date(end).toISOString() !== record.end) continue;
    const middle = Date.parse(record.middle);
    const middleTime = Number.isFinite(middle) && middle >= start && middle <= end &&
      new Date(middle).toISOString() === record.middle ? record.middle : null;
    const key = [record.type, record.start, record.end].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({type: record.type, labels: [label], startTime: record.start, endTime: record.end,
      middleTime, date: new Date(start + 330 * 60000).toISOString().slice(0, 10), isMahapata: true});
  }
  return events.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
}

/** Active interval first; otherwise the next approved interval, across month/year boundaries. */
export function nextApprovedMahapata(now = Date.now(), records = reviewedMahapata) {
  if (!Number.isFinite(now)) return null;
  const event = approvedMahapataEvents(records).find(item => Date.parse(item.endTime) > now);
  if (!event) return null;
  const start = Date.parse(event.startTime), end = Date.parse(event.endTime);
  const today = new Date(now + 330 * 60000).toISOString().slice(0, 10);
  const active = start <= now;
  return {...event, phase: active ? "active" : event.date === today ? "today" : "upcoming",
    nextTransition: active ? end : start};
}
