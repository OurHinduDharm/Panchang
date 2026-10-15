/**
 * Local festival muhurta calculation adapter for OurHinduDharm Panchang.
 *
 * The astronomy dependency is injected so this file is testable in Node and
 * does not bundle or silently substitute another calculation engine.
 * All intervals must come from the selected location's Panchang snapshot.
 */
"use strict";

function asValidDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function asInterval(item) {
  if (!item) return null;
  const start = asValidDate(item.startTime ?? item.start);
  const end = asValidDate(item.endTime ?? item.end);
  return start && end && end > start ? { start, end } : null;
}

function firstOverlappingIndex(items, index, day) {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (Number(item?.index) !== index) continue;
    const candidate = asInterval(item);
    if (candidate && candidate.end > day.start && candidate.start < day.end) {
      return candidate;
    }
  }
  return null;
}

function createFestivalMuhurtaEngine({ getPanchangam, Observer, rules }) {
  if (typeof getPanchangam !== "function" || typeof Observer !== "function" || !rules) {
    throw new TypeError("getPanchangam, Observer और festival muhurta rules आवश्यक हैं");
  }

  function calculateGhatasthapana({ date, latitude, longitude, elevation = 0, timezoneOffset = 330 }) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) ||
        !Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude))) {
      return { status: "calculation-unavailable", reason: "invalid-input", window: null, warnings: ["तारीख और स्थान के निर्देशांक उपलब्ध नहीं हैं"] };
    }

    const observer = new Observer(Number(latitude), Number(longitude), Number(elevation) || 0);
    // Query at local noon, represented as UTC milliseconds using the selected offset.
    const [year, month, day] = date.split("-").map(Number);
    const queryInstant = new Date(Date.UTC(year, month - 1, day, 12, 0, 0) - Number(timezoneOffset) * 60000);
    const p = getPanchangam(queryInstant, observer, { timezoneOffset: Number(timezoneOffset) });

    const sunrise = asValidDate(p?.sunrise);
    const sunset = asValidDate(p?.sunset);
    if (!sunrise || !sunset || sunset <= sunrise) {
      return { status: "calculation-unavailable", reason: "sunrise-sunset-missing", window: null, warnings: ["इस स्थान के लिए सूर्योदय/सूर्यास्त की गणना उपलब्ध नहीं है"] };
    }
    const daylight = { start: sunrise, end: sunset };
    const pratipada = firstOverlappingIndex(p.tithis, 0, daylight);
    const chitra = firstOverlappingIndex(p.nakshatras, 13, daylight);
    const vaidhriti = firstOverlappingIndex(p.yogas, 26, daylight);

    // Abhijit is the eighth of fifteen daytime muhurtas; it is a fallback only.
    const daylightMs = sunset.getTime() - sunrise.getTime();
    const abhijit = {
      start: new Date(sunrise.getTime() + daylightMs * 7 / 15),
      end: new Date(sunrise.getTime() + daylightMs * 8 / 15)
    };

    const result = rules.ghatasthapanaCandidates({
      sunrise, sunset, pratipada, abhijit, chitra, vaidhriti
    });
    const window = result.primary || result.fallback || null;
    return {
      ...result,
      window,
      selectedBy: result.primary ? "first-third-of-day" : result.fallback ? "abhijit-fallback" : null,
      location: { latitude: Number(latitude), longitude: Number(longitude), elevation: Number(elevation) || 0 },
      date,
      timezoneOffset: Number(timezoneOffset),
      inputsAvailable: {
        sunrise: true,
        sunset: true,
        pratipada: Boolean(pratipada),
        chitra: Boolean(chitra),
        vaidhriti: Boolean(vaidhriti)
      },
      warnings: [
        ...(result.warnings || []),
        ...(!pratipada ? ["स्थानीय प्रतिपदा की अवधि नहीं मिली; समय प्रकाशित न करें"] : []),
        ...(!chitra ? ["चित्रा नक्षत्र का अंतराल उपलब्ध नहीं; निषेध-संयोग की जाँच अधूरी है"] : []),
        ...(!vaidhriti ? ["वैधृति योग का अंतराल उपलब्ध नहीं; निषेध-संयोग की जाँच अधूरी है"] : [])
      ]
    };
  }

  return { calculateGhatasthapana };
}

const OHDFestivalMuhurtaEngine = { createFestivalMuhurtaEngine };
if (typeof module !== "undefined" && module.exports) module.exports = OHDFestivalMuhurtaEngine;
if (typeof globalThis !== "undefined") globalThis.OHDFestivalMuhurtaEngine = OHDFestivalMuhurtaEngine;
