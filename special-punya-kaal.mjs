/**
 * Special Punya-Kaal rules — research-safe calculation primitives.
 *
 * This module intentionally does NOT calculate Mahapata yet. Mahapata requires
 * a separately reviewed astronomical contact model (true declinations,
 * ayana classification, lunar latitude/parallax and apparent semidiameters).
 * Do not substitute the 27 nitya-yoga Vyatipata/Vaidhriti values.
 *
 * Varuni-family candidates are generated from exact Panchang intervals and
 * sunrise-to-next-sunrise Hindu-day windows. They remain candidates until the
 * configured textual tradition and month convention are approved.
 */

const CHAITRA_NAMES = new Set(["चैत्र", "Chaitra"]);
const TRAYODASHI_NAMES = new Set(["त्रयोदशी", "Trayodashi"]);
const KRISHNA_NAMES = new Set(["कृष्ण", "कृष्ण पक्ष", "Krishna"]);
const SHATABHISHA_NAMES = new Set(["शतभिषा", "शतभिषक्", "Shatabhisha", "Shatabhishak"]);
const SHATABHISHA_INDEX = 23;
const SHUBHA_NAMES = new Set(["शुभ", "Shubha"]);

function validTime(value) {
  if (value === null || value === undefined || value === "") return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function textOf(value) {
  if (value && typeof value === "object") {
    return String(value.name ?? value.label ?? value.value ?? "").trim();
  }
  return String(value ?? "").trim();
}

function intervalOf(item) {
  const start = validTime(item?.startTime ?? item?.start);
  const end = validTime(item?.endTime ?? item?.end);
  return start !== null && end !== null && end > start ? { start, end } : null;
}

function normalizeTransitionIntervals(items) {
  if (!Array.isArray(items)) return [];
  const normalized = items.map(item => item ? { ...item } : item);
  for (let i = 1; i < normalized.length; i++) {
    const previous = normalized[i - 1];
    const current = normalized[i];
    if (!previous || !current) continue;
    const previousEnd = validTime(previous.endTime ?? previous.end);
    const currentStart = validTime(current.startTime ?? current.start);
    if (previousEnd !== null && currentStart !== null && currentStart - previousEnd === 60000) {
      if ("startTime" in current || !("start" in current)) current.startTime = new Date(previousEnd);
      else current.start = new Date(previousEnd);
    }
  }
  return normalized;
}

function intersect(...intervals) {
  const start = Math.max(...intervals.map(item => item.start));
  const end = Math.min(...intervals.map(item => item.end));
  return end > start ? { start, end } : null;
}

function isTrayodashi(item) {
  const name = textOf(item?.name ?? item?.tithi ?? item?.index);
  if (TRAYODASHI_NAMES.has(name)) return true;
  const index = Number(item?.index ?? item?.tithi);
  return Number.isInteger(index) && index % 15 === 12;
}

function isKrishna(item, day) {
  const rawIndex = item?.index ?? item?.tithi;
  if (rawIndex !== null && rawIndex !== undefined && rawIndex !== "") {
    const index = Number(rawIndex);
    if (Number.isInteger(index)) return index >= 15;
  }
  const value = textOf(item?.paksha ?? day?.paksha);
  return KRISHNA_NAMES.has(value);
}

function isChaitra(day) {
  const masa = textOf(day?.masa ?? day?.month);
  return CHAITRA_NAMES.has(masa);
}

function isShatabhisha(item) {
  const name = textOf(item?.name ?? item?.nakshatra);
  if (SHATABHISHA_NAMES.has(name)) return true;
  const index = Number(item?.index ?? item?.nakshatra);
  return Number.isInteger(index) && index === SHATABHISHA_INDEX;
}

function isShubha(item) {
  const name = textOf(item?.name ?? item?.yoga);
  if (SHUBHA_NAMES.has(name)) return true;
  const index = Number(item?.index ?? item?.yoga);
  // panchangam-js uses zero-based indexes: Shubha is index 22.
  return index === 22;
}

function localDate(value, timezoneOffsetMinutes = 330) {
  return new Date(value + timezoneOffsetMinutes * 60000).toISOString().slice(0, 10);
}

function weekdaySegments(interval, weekday, timezoneOffsetMinutes = 330) {
  const offset = timezoneOffsetMinutes * 60000;
  const localStart = interval.start + offset;
  const localEnd = interval.end + offset;
  let dayStart = Math.floor(localStart / 86400000) * 86400000;
  const segments = [];
  while (dayStart < localEnd) {
    if (new Date(dayStart).getUTCDay() === weekday) {
      const start = Math.max(interval.start, dayStart - offset);
      const end = Math.min(interval.end, dayStart + 86400000 - offset);
      if (end > start) {
        segments.push({
          date: new Date(dayStart).toISOString().slice(0, 10),
          start,
          end
        });
      }
    }
    dayStart += 86400000;
  }
  return segments;
}

function collectIntervals(days, field, predicate, options = {}) {
  const rows = [];
  for (const day of days) {
    if (options.requireChaitra && !isChaitra(day)) continue;
    const items = normalizeTransitionIntervals(day?.[field]);
    for (const item of items) {
      if (!predicate(item)) continue;
      const interval = intervalOf(item);
      if (!interval) continue;
      const rawKey = item?.index ?? item?.name ?? item?.label ?? "";
      rows.push({ ...interval, key: String(rawKey) });
    }
  }

  rows.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  for (const item of rows) {
    const previous = merged[merged.length - 1];
    if (previous && previous.key === item.key && item.start <= previous.end + 60000) {
      previous.end = Math.max(previous.end, item.end);
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}

function addCandidate(candidates, interval, label, date, tradition) {
  candidates.push({
    date,
    labels: [label],
    startTime: toIso(interval.start),
    endTime: toIso(interval.end),
    status: "research-candidate",
    location: "Pithoragarh",
    timezone: "Asia/Kolkata",
    ruleProfile: tradition
  });
}

/**
 * Input: consecutive local Hindu-day records generated from the Purnimanta
 * Panchangam engine. Day arrays may split one tithi/nakshatra/yoga at sunrise;
 * same-index intervals are therefore rejoined across adjacent day records
 * before the actual astronomical conjunction is calculated.
 *
 * Returns research candidates only. Weekday labels are based on the local
 * civil Saturday portions of the true overlap, never on the preceding
 * sunrise-day record's date.
 */
export function buildVaruniCandidates(days, options = {}) {
  if (!Array.isArray(days)) throw new TypeError("days must be an array");
  const tradition = options.tradition || "chaitra-krishna-trayodashi-shatabhisha";
  if (tradition !== "chaitra-krishna-trayodashi-shatabhisha") {
    throw new RangeError("Unsupported Varuni tradition profile");
  }
  const timezoneOffsetMinutes = Number(options.timezoneOffsetMinutes ?? 330);
  if (!Number.isFinite(timezoneOffsetMinutes)) throw new TypeError("timezoneOffsetMinutes must be finite");

  const tithis = collectIntervals(days, "tithis", item => isTrayodashi(item) && isKrishna(item), { requireChaitra: true });
  const nakshatras = collectIntervals(days, "nakshatras", isShatabhisha);
  const yogas = collectIntervals(days, "yogas", isShubha);
  const candidates = [];

  for (const tithi of tithis) {
    for (const nakshatra of nakshatras) {
      const base = intersect(tithi, nakshatra);
      if (!base) continue;

      addCandidate(candidates, base, "वारुणी योग", localDate(base.start, timezoneOffsetMinutes), tradition);

      const saturdays = weekdaySegments(base, 6, timezoneOffsetMinutes);
      for (const saturday of saturdays) {
        addCandidate(candidates, base, "महावारुणी योग", saturday.date, tradition);
        for (const yoga of yogas) {
          const overlap = intersect(base, yoga, saturday);
          if (overlap) {
            addCandidate(candidates, overlap, "महामहावारुणी योग", saturday.date, tradition);
          }
        }
      }
    }
  }

  return candidates.sort((a, b) =>
    a.startTime.localeCompare(b.startTime) ||
    a.date.localeCompare(b.date) ||
    a.labels[0].localeCompare(b.labels[0], "hi")
  );
}

export const SPECIAL_PUNYA_KAAL_POLICY = Object.freeze({
  years: [2026, 2027, 2028, 2029, 2030],
  location: { name: "Pithoragarh", latitude: 29.5828, longitude: 80.2182, elevation: 1650 },
  timezoneOffsetMinutes: 330,
  sankranti: "reuse-existing-display-and-calculation; never-duplicate",
  mahapata: "blocked-pending-reviewed-contact-definition",
  mahodaya: "hidden-until-primary-rule-approved",
  publicApprovalRequired: true
});
