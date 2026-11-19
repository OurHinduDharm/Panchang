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
