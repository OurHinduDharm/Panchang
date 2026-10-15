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


function firstIntervalByIndex(items, index) {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (Number(item?.index) !== Number(index)) continue;
    const candidate = asInterval(item);
    if (candidate) return candidate;
  }
  return null;
}

function validCalculationInput({ date, latitude, longitude }) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(date)) ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))) return false;
  const parsed = new Date(String(date) + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function queryLocalNoon(date, timezoneOffset) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0) - Number(timezoneOffset) * 60000);
}

function createFestivalMuhurtaEngine({ getPanchangam, Observer, rules }) {
  if (typeof getPanchangam !== "function" || typeof Observer !== "function" || !rules) {
    throw new TypeError("getPanchangam, Observer और festival muhurta rules आवश्यक हैं");
  }

  function calculateGhatasthapana({ date, latitude, longitude, elevation = 0, timezoneOffset = 330 }) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(date)) ||
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

    // Prefer the pinned Panchang library's Abhijit interval; calculate the
    // eighth of fifteen daytime muhurtas only as a guarded fallback.
    const daylightMs = sunset.getTime() - sunrise.getTime();
    const calculatedAbhijit = {
      start: new Date(sunrise.getTime() + daylightMs * 7 / 15),
      end: new Date(sunrise.getTime() + daylightMs * 8 / 15)
    };
    const abhijit = asInterval(p?.abhijitMuhurta) || calculatedAbhijit;

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
        ...(!Array.isArray(p.nakshatras) ? ["नक्षत्र-अंतराल डेटा उपलब्ध नहीं; चित्रा-संयोग की जाँच अधूरी है"] : []),
        ...(!Array.isArray(p.yogas) ? ["योग-अंतराल डेटा उपलब्ध नहीं; वैधृति-संयोग की जाँच अधूरी है"] : [])
      ]
    };
  }


  function calculateSharadPurnimaKheer({
    date, latitude, longitude, elevation = 0, timezoneOffset = 330, purnimaIndex = 14
  }) {
    if (!validCalculationInput({ date, latitude, longitude })) {
      return { status: "calculation-unavailable", reason: "invalid-input", window: null, warnings: ["तारीख और स्थान के निर्देशांक उपलब्ध नहीं हैं"] };
    }
    const observer = new Observer(Number(latitude), Number(longitude), Number(elevation) || 0);
    const p = getPanchangam(queryLocalNoon(date, timezoneOffset), observer, { timezoneOffset: Number(timezoneOffset) });
    const moonrise = asValidDate(p?.moonrise);
    let moonset = asValidDate(p?.moonset);
    let nextPanchang = null;
    if (moonrise && (!moonset || moonset <= moonrise)) {
      const nextDate = new Date(date + "T12:00:00Z");
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      const nextKey = nextDate.toISOString().slice(0, 10);
      nextPanchang = getPanchangam(queryLocalNoon(nextKey, timezoneOffset), observer, { timezoneOffset: Number(timezoneOffset) });
      const candidate = asValidDate(nextPanchang?.moonset);
      if (candidate && candidate > moonrise) moonset = candidate;
    }
    const purnima = firstIntervalByIndex(p?.tithis, purnimaIndex);
    const nightEnd = asValidDate(nextPanchang?.sunrise);
    const result = rules.moonlightKheerWindow({ moonrise, moonset, purnima, nightEnd });
    return {
      ...result,
      date,
      location: { latitude: Number(latitude), longitude: Number(longitude), elevation: Number(elevation) || 0 },
      timezoneOffset: Number(timezoneOffset),
      inputsAvailable: { moonrise: Boolean(moonrise), moonset: Boolean(moonset), purnima: Boolean(purnima) },
      warnings: [
        ...(!moonrise ? ["स्थानीय चंद्रोदय उपलब्ध नहीं"] : []),
        ...(!moonset && !nightEnd ? ["चंद्रास्त/रात्रि-अंत उपलब्ध नहीं; समय प्रकाशित न करें"] : []),
        ...(!purnima ? ["स्थानीय पूर्णिमा तिथि-अंतराल उपलब्ध नहीं"] : [])
      ]
    };
  }

  function calculateEkadashiParana({
    date, latitude, longitude, elevation = 0, timezoneOffset = 330,
    dvadashiIndex, paranaRule = null
  }) {
    if (!validCalculationInput({ date, latitude, longitude }) ||
        !Number.isInteger(Number(dvadashiIndex)) || Number(dvadashiIndex) < 0 || Number(dvadashiIndex) > 29) {
      return { status: "calculation-unavailable", reason: "invalid-input", window: null, warnings: ["तारीख, स्थान या द्वादशी तिथि-सूचकांक मान्य नहीं"] };
    }
    const observer = new Observer(Number(latitude), Number(longitude), Number(elevation) || 0);
    const p = getPanchangam(queryLocalNoon(date, timezoneOffset), observer, { timezoneOffset: Number(timezoneOffset) });
    const sunrise = asValidDate(p?.sunrise);
    const dvadashi = firstIntervalByIndex(p?.tithis, Number(dvadashiIndex));
    const result = rules.paranaWindow({ sunrise, dvadashi, paranaRule });
    return {
      ...result,
      date,
      location: { latitude: Number(latitude), longitude: Number(longitude), elevation: Number(elevation) || 0 },
      timezoneOffset: Number(timezoneOffset),
      inputsAvailable: { sunrise: Boolean(sunrise), dvadashi: Boolean(dvadashi), traditionRule: Boolean(paranaRule) },
      warnings: [
        ...(!sunrise ? ["स्थानीय सूर्योदय उपलब्ध नहीं"] : []),
        ...(!dvadashi ? ["दिए गए द्वादशी तिथि-सूचकांक का अंतराल नहीं मिला"] : []),
        ...(!paranaRule ? ["पारण का परंपरा-विशिष्ट नियम नहीं दिया गया; समय अंतिम रूप से प्रकाशित न करें"] : [])
      ]
    };
  }

  function calculatePujaWindows({
    date, latitude, longitude, elevation = 0, timezoneOffset = 330,
    tithiIndex, intervals = {}, tradition = "unspecified"
  }) {
    if (!validCalculationInput({ date, latitude, longitude }) ||
        !Number.isInteger(Number(tithiIndex)) || Number(tithiIndex) < 0 || Number(tithiIndex) > 29) {
      return { status: "calculation-unavailable", reason: "invalid-input", pradosh: null, vrishabha: null, nishita: null, warnings: ["तारीख, स्थान या तिथि-सूचकांक मान्य नहीं"] };
    }
    const observer = new Observer(Number(latitude), Number(longitude), Number(elevation) || 0);
    const p = getPanchangam(queryLocalNoon(date, timezoneOffset), observer, { timezoneOffset: Number(timezoneOffset) });
    const tithi = firstIntervalByIndex(p?.tithis, Number(tithiIndex));
    const result = rules.selectPujaWindows({
      tithi,
      pradosh: intervals.pradosh || null,
      vrishabha: intervals.vrishabha || null,
      nishita: intervals.nishita || null,
      tradition
    });
    return {
      ...result,
      date,
      location: { latitude: Number(latitude), longitude: Number(longitude), elevation: Number(elevation) || 0 },
      timezoneOffset: Number(timezoneOffset),
      inputsAvailable: {
        tithi: Boolean(tithi),
        pradosh: Boolean(intervals.pradosh),
        vrishabha: Boolean(intervals.vrishabha),
        nishita: Boolean(intervals.nishita)
      },
      warnings: [
        ...(!tithi ? ["स्थानीय तिथि-अंतराल उपलब्ध नहीं"] : []),
        ...(!intervals.pradosh ? ["प्रदोषकाल अलग से सत्यापित कर देना आवश्यक है"] : []),
        ...(!intervals.vrishabha ? ["वृषभ लग्न-अंतराल उपलब्ध नहीं"] : []),
        ...(!intervals.nishita ? ["निशीथकाल उपलब्ध नहीं"] : []),
        "प्रदोष/वृषभ/निशीथ की परंपरा-विशिष्ट गणना caller से आती है; यह adapter कोई समय स्वयं नहीं गढ़ता।"
      ]
    };
  }

  return { calculateGhatasthapana, calculateSharadPurnimaKheer, calculateEkadashiParana, calculatePujaWindows };
}

const OHDFestivalMuhurtaEngine = { createFestivalMuhurtaEngine };
if (typeof module !== "undefined" && module.exports) module.exports = OHDFestivalMuhurtaEngine;
if (typeof globalThis !== "undefined") globalThis.OHDFestivalMuhurtaEngine = OHDFestivalMuhurtaEngine;
