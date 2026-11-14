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

const DAY_MS = 86400000;
const CHAITRA_NAMES = new Set(["चैत्र", "Chaitra"]);
const TRAYODASHI_NAMES = new Set(["त्रयोदशी", "Trayodashi"]);
const KRISHNA_NAMES = new Set(["कृष्ण", "कृष्ण पक्ष", "Krishna"]);
const SHATABHISHA_NAMES = new Set(["शतभिषा", "शतभिषक्", "Shatabhisha", "Shatabhishak"]);
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
  return SHATABHISHA_NAMES.has(name);
}

function isShubha(item) {
  const name = textOf(item?.name ?? item?.yoga);
  if (SHUBHA_NAMES.has(name)) return true;
  const index = Number(item?.index ?? item?.yoga);
  // 1-based nitya-yoga index 23 is Shubha in the standard 27-yoga sequence.
  return index === 23;
}

function localWeekday(isoDate) {
  const match = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 6)).getUTCDay();
}

function toIso(value) {
  return new Date(value).toISOString();
}

function mergeIntervals(items) {
  const sorted = items.slice().sort((a, b) => a.start - b.start);
  const merged = [];
  for (const item of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && item.start <= previous.end) previous.end = Math.max(previous.end, item.end);
    else merged.push({ ...item });
  }
  return merged;
}

/**
 * Input: consecutive local Hindu-day records:
 * { date, masa, paksha, sunrise, nextSunrise,
 *   tithis:[{index,name,paksha,startTime,endTime}],
 *   nakshatras:[{index,name,startTime,endTime}],
 *   yogas:[{index,name,startTime,endTime}] }
 *
 * Dates should be generated from Panchangam at Pithoragarh with IST (+330).
 * Returns research candidates, not approved religious determinations.
 */
export function buildVaruniCandidates(days, options = {}) {
  if (!Array.isArray(days)) throw new TypeError("days must be an array");
  const tradition = options.tradition || "chaitra-krishna-trayodashi-shatabhisha";
  if (tradition !== "chaitra-krishna-trayodashi-shatabhisha") {
    throw new RangeError("Unsupported Varuni tradition profile");
  }

  const candidates = [];
  const addCandidate = (day, interval, label) => {
    candidates.push({
      date: day.date,
      labels: [label],
      startTime: toIso(interval.start),
      endTime: toIso(interval.end),
      status: "research-candidate",
      location: "Pithoragarh",
      timezone: "Asia/Kolkata",
      ruleProfile: tradition
    });
  };

  for (const day of days) {
    if (!day?.date || !isChaitra(day)) continue;
    const sunrise = validTime(day.sunrise);
    const nextSunrise = validTime(day.nextSunrise);
    if (sunrise === null || nextSunrise === null || nextSunrise <= sunrise) continue;
    const weekday = localWeekday(day.date);
    if (weekday === null) continue;

    const tithis = (day.tithis || []).filter(isTrayodashi).filter(item => isKrishna(item, day));
    const nakshatras = (day.nakshatras || []).filter(isShatabhisha);
    const yogas = (day.yogas || []).filter(isShubha);

    for (const tithi of tithis) {
      const tithiInterval = intervalOf(tithi);
      if (!tithiInterval) continue;
      for (const nakshatra of nakshatras) {
        const nakshatraInterval = intervalOf(nakshatra);
        if (!nakshatraInterval) continue;
        const base = intersect(tithiInterval, nakshatraInterval, { start: sunrise, end: nextSunrise });
        if (!base) continue;

        addCandidate(day, base, "वारुणी योग");
        if (weekday === 6) {
          addCandidate(day, base, "महावारुणी योग");
          for (const yoga of yogas) {
            const yogaInterval = intervalOf(yoga);
            if (!yogaInterval) continue;
            const mahavaruni = intersect(base, yogaInterval);
            if (mahavaruni) addCandidate(day, mahavaruni, "महामहावारुणी योग");
          }
        }
      }
    }
  }

  return candidates.sort((a, b) =>
    a.startTime.localeCompare(b.startTime) ||
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
