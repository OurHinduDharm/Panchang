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

export const SPECIAL_PUNYA_KAAL_PUBLIC_APPROVAL = Object.freeze({
  profiles: Object.freeze([...APPROVED_PROFILES]),
  dates: Object.freeze([...APPROVED_DATES]),
  labels: Object.freeze([...APPROVED_LABELS])
});

// Populate only after a calculated interval and its rule receive publication
// approval in #482. Never import the research fixtures into a public page.
const reviewedMahapata = Object.freeze([]);
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
  for (const record of records) {
    const label = mahapataLabels.get(record?.type);
    if (!label || record.status !== "approved" || record.ruleProfile !== "drik-geocentric-apparent-disks") continue;
    // Generated public times are canonical UTC instants. Reject local strings,
    // normalized invalid dates, incomplete windows, and research-only records.
    const start = Date.parse(record.start), end = Date.parse(record.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
        new Date(start).toISOString() !== record.start || new Date(end).toISOString() !== record.end ||
        end <= monthStart || start >= monthEnd) continue;
    events.push({ type: record.type, labels: [label], startTime: record.start, endTime: record.end,
      date: new Date(start + 330 * 60000).toISOString().slice(0, 10), isMahapata: true });
  }
  return events.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
}
