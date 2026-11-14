// Shared helpers for displaying the actual local interval of a tithi used as a festival vyapti.
const TITHI_NAMES = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी",
  "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी",
  "पूर्णिमा", "अमावस्या"
];

function tithiIndex(name, paksha) {
  const value = String(name || "").normalize("NFC").trim();
  if (value.includes("पूर्णिमा")) return paksha === "शुक्ल" ? 14 : null;
  if (value.includes("अमावस्या")) return paksha === "कृष्ण" ? 29 : null;
  const ordinal = TITHI_NAMES.slice(0, 14).findIndex(item => value.includes(item));
  if (ordinal < 0) return null;
  return paksha === "कृष्ण" ? ordinal + 15 : ordinal;
}

function findName(value) {
  const text = String(value || "").normalize("NFC");
  return TITHI_NAMES.find(name => text.includes(name)) || "";
}

export function parseTithiVyapti(item) {
  const text = String(item && (item.hinduTithi || item.tithi) || "").normalize("NFC");
  const match = text.match(/\(([^()]*)\)/);
  if (!match || !/व्याप्ति/.test(match[1])) return null;
  const pakshaMatch = text.match(/(कृष्ण|शुक्ल)/);
  if (!pakshaMatch) return null;
  const paksha = pakshaMatch[1];
  const baseName = findName(text.slice(0, match.index));
  const vyaptiName = findName(match[1].replace(/व्याप्ति/g, ""));
  const baseIndex = tithiIndex(baseName, paksha);
  const vyaptiIndex = tithiIndex(vyaptiName, paksha);
  if (baseIndex === null || vyaptiIndex === null) return null;
  return {
    base: { name: baseName, index: baseIndex },
    vyapti: { name: vyaptiName, index: vyaptiIndex }
  };
}

function validDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function findTithiInterval(days, descriptor, dateIso) {
  if (!Array.isArray(days) || !descriptor || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso || ""))) return null;
  const dayStart = Date.parse(dateIso + "T00:00:00+05:30");
  const dayEnd = dayStart + 86400000;
  // Panchang day objects expose tithi pieces clipped to sunrise-to-sunrise.
  // Join adjacent pieces first; otherwise a sunrise boundary is mistaken for
  // the actual tithi transition and the displayed interval develops a false gap.
  const intervals = [];
  const seen = new Set();
  days.forEach(day => {
    (day && Array.isArray(day.tithis) ? day.tithis : []).forEach(item => {
      if (!item || typeof item !== "object") return;
      const rawIndex = item.index ?? item.number ?? item.value;
      const index = Number(rawIndex);
      if (!Number.isInteger(index) || index !== descriptor.index) return;
      const start = validDate(item.startTime ?? item.start);
      const end = validDate(item.endTime ?? item.end);
      if (!start || !end || end <= start) return;
      const key = start.getTime() + "|" + end.getTime();
      if (seen.has(key)) return;
      seen.add(key);
      intervals.push({ name: descriptor.name, start, end });
    });
  });
  intervals.sort((a, b) => a.start - b.start);

  // Merge sunrise-clipped pieces of the same tithi. A two-minute tolerance
  // covers minor boundary rounding while remaining far below one ghati.
  const merged = [];
  const joinToleranceMs = 2 * 60 * 1000;
  intervals.forEach(item => {
    const current = merged[merged.length - 1];
    if (current && item.start.getTime() <= current.end.getTime() + joinToleranceMs) {
      if (item.end > current.end) current.end = item.end;
    } else {
      merged.push({ name: item.name, start: item.start, end: item.end });
    }
  });
  return merged.find(item => item.end.getTime() > dayStart && item.start.getTime() < dayEnd) || null;
}

function formatClock(value) {
  const date = validDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true
  }).format(date) + " बजे";
}

function formatDate(value) {
  const date = validDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short"
  }).format(date);
}

export function formatTithiPoint(value, eventDate) {
  const date = validDate(value);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const key = type => (parts.find(part => part.type === type) || {}).value || "";
  const dateKey = key("year") + "-" + key("month") + "-" + key("day");
  return (dateKey === eventDate ? "" : formatDate(date) + " · ") + formatClock(date);
}
